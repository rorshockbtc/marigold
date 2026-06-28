"use client";

import { useState, useEffect } from "react";
import { getSearchRecipes, saveSearchRecipe, SearchRecipe } from "@/lib/firebase/db";
import ReactMarkdown from 'react-markdown';

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export default function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Recipes
  const [orgRecipes, setOrgRecipes] = useState<SearchRecipe[]>([]);
  const [localRecipes, setLocalRecipes] = useState<SearchRecipe[]>([]);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [templateScope, setTemplateScope] = useState<"local" | "org">("local");
  
  // Load initial data
  useEffect(() => {
    // Load Sessions
    const savedSessions = localStorage.getItem("elly_chat_sessions");
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }

    // Load Local Recipes
    const savedLocalRecipes = localStorage.getItem("elly_local_recipes");
    if (savedLocalRecipes) {
      try {
        setLocalRecipes(JSON.parse(savedLocalRecipes));
      } catch (e) {
        console.error("Failed to parse local recipes", e);
      }
    }

    // Load Org Recipes
    getSearchRecipes().then(setOrgRecipes);
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    localStorage.setItem("elly_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Save local recipes whenever they change
  useEffect(() => {
    localStorage.setItem("elly_local_recipes", JSON.stringify(localRecipes));
  }, [localRecipes]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const handleNewSession = () => {
    setActiveSessionId(null);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let currentSessionId = activeSessionId;
    let currentMessages = messages;

    // Create new session if none active
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: "s" + Date.now(),
        title: query.substring(0, 30) + "...",
        timestamp: Date.now(),
        messages: [{ role: "assistant", content: "Hello! I am your ELLY Guide. Ask me how to find specific records, use filters, or navigate the platform!" }]
      };
      setSessions(prev => [newSession, ...prev]);
      currentSessionId = newSession.id;
      currentMessages = newSession.messages;
      setActiveSessionId(newSession.id);
    }

    const userMessage: ChatMessage = { role: "user", content: query };
    const newMessages = [...currentMessages, userMessage];
    
    // Update active session locally
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: newMessages } : s));
    
    setQuery("");
    setIsLoading(true);

    try {
      const userApiKey = localStorage.getItem("elly_gemini_key") || "";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: userMessage.content, 
          history: currentMessages,
          userApiKey
        }),
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = { 
        role: "assistant", 
        content: response.ok ? data.reply : `Error: ${data.error}` 
      };

      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...newMessages, assistantMessage] } : s));

    } catch (error) {
      const errorMsg: ChatMessage = { role: "assistant", content: "Network error occurred." };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...newMessages, errorMsg] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !activeSession) return;

    // Extract the initial query from the session to use as the template
    const userQueries = activeSession.messages.filter(m => m.role === "user");
    const firstQuery = userQueries.length > 0 ? userQueries[0].content : "Example query...";

    const newRecipe: SearchRecipe = {
      name: templateName,
      description: templateDesc,
      queryTemplate: firstQuery,
      author: "Volunteer",
      successRate: 100
    };

    if (templateScope === "local") {
      newRecipe.id = "l" + Date.now();
      setLocalRecipes(prev => [newRecipe, ...prev]);
    } else {
      const id = await saveSearchRecipe(newRecipe);
      setOrgRecipes(prev => [{ ...newRecipe, id }, ...prev]);
    }

    setIsTemplateModalOpen(false);
    setTemplateName("");
    setTemplateDesc("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-6xl mx-auto gap-6">
      
      {/* Sidebar: History */}
      <div className="w-64 flex flex-col bg-white rounded-xl shadow-sm border border-border overflow-hidden shrink-0">
        <div className="p-4 border-b border-border">
          <button onClick={handleNewSession} className="w-full btn-primary text-sm py-2">
            + New Question
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <div 
              key={s.id} 
              onClick={() => setActiveSessionId(s.id)}
              className={`p-3 rounded-lg cursor-pointer text-sm flex justify-between items-center group transition-colors ${activeSessionId === s.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
            >
              <span className="truncate flex-1 pr-2">{s.title}</span>
              <button 
                onClick={(e) => handleDeleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                title="Delete Session"
              >
                ✕
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-4">No past questions.</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-border overflow-hidden relative">
        <div className="bg-secondary text-secondary-foreground p-4 shadow-sm z-10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">{activeSession ? activeSession.title : "New Question"}</h2>
            <p className="text-xs opacity-80">ELLY Documentation & Guidance</p>
          </div>
          {activeSession && activeSession.messages.length > 1 && (
            <button onClick={() => setIsTemplateModalOpen(true)} className="text-xs bg-white text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-muted font-medium border border-border">
              Save as Common Question
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
          {!activeSession && (
             <div className="h-full flex items-center justify-center text-muted-foreground flex-col text-center px-8">
               <span className="text-4xl mb-4">📚</span>
               <p className="text-lg font-medium text-foreground">Welcome to the ELLY Guide</p>
               <p className="mt-2">I am here to help you learn how to navigate ELLY and find the records you need.</p>
             </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground'}`}>
                <div className={`text-[1rem] leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-primary-foreground' : 'text-foreground'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-border rounded-lg p-4 shadow-sm animate-pulse">
                <p className="text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Recipes Bar */}
        <div className="bg-muted/30 border-t border-border p-3 flex gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide items-center">
          <span className="text-xs font-semibold text-muted-foreground shrink-0">Demo Prompts:</span>
          
          <select 
            className="text-xs border border-border rounded-md px-2 py-1 bg-white"
            onChange={(e) => setQuery(`Run a Fraud Audit on ${e.target.value} County`)}
            defaultValue=""
          >
            <option value="" disabled>Select County to Audit...</option>
            <option value="Hinds">Hinds</option>
            <option value="Rankin">Rankin</option>
            <option value="Madison">Madison</option>
            <option value="DeSoto">DeSoto</option>
            <option value="Harrison">Harrison</option>
          </select>

          <button onClick={() => setQuery("Explain the Z-Scores for density")} className="text-xs bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors font-medium shrink-0">
            📊 Explain the Z-Scores for density
          </button>
          
          <div className="w-px h-4 bg-border mx-1 shrink-0"></div>
          {localRecipes.map(r => (
            <button key={r.id} onClick={() => setQuery(r.queryTemplate)} className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors" title={r.description}>
              👤 {r.name}
            </button>
          ))}
          {orgRecipes.map(r => (
            <button key={r.id} onClick={() => setQuery(r.queryTemplate)} className="text-xs bg-white border border-border px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors" title={r.description}>
              🏢 {r.name}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field flex-1" 
              placeholder="e.g. How do I filter the table to show only NCOA matches?" 
              disabled={isLoading}
            />
            <button type="submit" className="btn-primary" disabled={isLoading}>
              Send
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI generated searches can make mistakes. Always verify findings before reporting.
          </p>
        </div>

        {/* Save Template Modal */}
        {isTemplateModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Save Search as Template</h3>
              <p className="text-sm text-muted-foreground mb-6">Distill this investigation into a reusable template for future searches.</p>
              
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input type="text" required value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="input-field w-full" placeholder="e.g. NCOA Flags Check" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input type="text" required value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} className="input-field w-full" placeholder="What does this search find?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Visibility Scope</label>
                  <select value={templateScope} onChange={(e: any) => setTemplateScope(e.target.value)} className="input-field w-full">
                    <option value="local">👤 Personal (Save to this browser only)</option>
                    <option value="org">🏢 Organization (Publish to all MSFE volunteers)</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
                  <button type="submit" className="btn-primary">Save Template</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
