"use client";

import { useState, useEffect } from "react";
import { getSearchRecipes, saveSearchRecipe, SearchRecipe } from "@/lib/firebase/db";
import ReactMarkdown from 'react-markdown';

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestedPlaybook?: any;
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
  
  // Friendly Guide vs Pro Mode
  const [isFriendlyMode, setIsFriendlyMode] = useState(true);
  // Voice listening state
  const [isListening, setIsListening] = useState(false);

  // Recipes
  const [orgRecipes, setOrgRecipes] = useState<SearchRecipe[]>([]);
  const [localRecipes, setLocalRecipes] = useState<SearchRecipe[]>([]);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [templateScope, setTemplateScope] = useState<"local" | "org">("local");
  const [savedPlaybooks, setSavedPlaybooks] = useState<Record<string, boolean>>({});

  // Voice recognition helper
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Read aloud helper
  const handleSpeakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown chars for clean speaking
    const cleanText = text.replace(/[*#`~_]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveSuggestedPlaybook = async (pb: any) => {
    try {
      await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pb.name,
          auditType: pb.audit_type,
          threshold: pb.threshold,
          county: pb.county
        })
      });
      setSavedPlaybooks(prev => ({ ...prev, [pb.name]: true }));
    } catch (e) {
      console.error(e);
    }
  };
  
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
        messages: [{ role: "assistant", content: "Hello! I am your Marigold Guide. Ask me how to find specific records, use filters, or navigate the platform!" }]
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
      const userApiKey = localStorage.getItem("marigold_gemini_key") || "";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: userMessage.content, 
          history: currentMessages,
          userApiKey,
          isFriendlyMode
        }),
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = { 
        role: "assistant", 
        content: response.ok ? data.reply : `Error: ${data.error}`,
        suggestedPlaybook: data.suggestedPlaybook
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
        <div className="bg-secondary text-secondary-foreground p-4 shadow-sm z-10 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">{activeSession ? activeSession.title : "New Question"}</h2>
            <p className="text-xs opacity-80">Marigold Documentation & Guidance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFriendlyMode(!isFriendlyMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${isFriendlyMode ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm' : 'bg-slate-800 text-slate-200 border-slate-600'}`}
              title={isFriendlyMode ? "Plain English analogies without statistical formulas" : "Rigorous Z-scores, kurtosis, and mathematical distributions"}
            >
              {isFriendlyMode ? '🌱 Friendly Guide Mode' : '🔬 Analyst Pro Mode'}
            </button>
            {activeSession && activeSession.messages.length > 1 && (
              <button onClick={() => setIsTemplateModalOpen(true)} className="text-xs bg-white text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-muted font-medium border border-border">
                Save as Common Question
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background">
          {!activeSession && (
             <div className="h-full flex items-center justify-center text-muted-foreground flex-col text-center px-8">
               <span className="text-4xl mb-4">📚</span>
               <p className="text-lg font-medium text-foreground">Welcome to the Marigold Guide</p>
               <p className="mt-2">I am here to help you learn how to navigate Marigold Insights and find the records you need.</p>
             </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 shadow-sm relative group ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border border-border text-foreground'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex justify-end mb-1">
                    <button
                      type="button"
                      onClick={() => handleSpeakText(msg.content)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 transition-colors"
                      title="Read this response out loud"
                    >
                      🔊 Read Aloud
                    </button>
                  </div>
                )}
                <div className={`text-[1rem] leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-primary-foreground' : 'text-foreground'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.suggestedPlaybook && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-2 text-left">
                    <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-amber-800">
                      <span>✨ AI Suggested Mission Playbook</span>
                      <span className="bg-amber-200 px-2 py-0.5 rounded">{msg.suggestedPlaybook.audit_type}</span>
                    </div>
                    <p className="font-bold text-sm">{msg.suggestedPlaybook.name}</p>
                    <p className="text-xs text-amber-900 leading-relaxed">{msg.suggestedPlaybook.description}</p>
                    <div className="flex gap-2 text-xs text-amber-800 font-mono pt-1">
                      <span>Threshold: {msg.suggestedPlaybook.threshold || 'N/A'}</span>
                      <span>• County: {msg.suggestedPlaybook.county || 'Statewide'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveSuggestedPlaybook(msg.suggestedPlaybook)}
                      disabled={savedPlaybooks[msg.suggestedPlaybook.name]}
                      className={`w-full py-2 rounded-lg font-bold text-xs transition-colors shadow ${savedPlaybooks[msg.suggestedPlaybook.name] ? 'bg-emerald-600 text-white cursor-default' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                    >
                      {savedPlaybooks[msg.suggestedPlaybook.name] ? '✓ Saved to Mission Control!' : '⚡ Save as Mission Playbook'}
                    </button>
                  </div>
                )}
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

        {/* Quick Starter Chips */}
        <div className="bg-amber-50/70 border-t border-amber-200/80 p-2.5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide items-center">
          <span className="text-xs font-bold text-amber-900 shrink-0 flex items-center gap-1">💡 What should I ask?</span>
          <button onClick={() => setQuery("Are there any unusual apartment complexes or dorms in my town?")} className="text-xs bg-white border border-amber-300 text-amber-900 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors shadow-sm font-medium">
            🏢 Check for unusual apartment complexes
          </button>
          <button onClick={() => setQuery("Can you check if any commercial shipping stores are listed as residential addresses?")} className="text-xs bg-white border border-amber-300 text-amber-900 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors shadow-sm font-medium">
            📦 Find shipping boxes listed as homes
          </button>
          <button onClick={() => setQuery("Explain what a Z-Score is like I am sitting at the kitchen table drinking coffee.")} className="text-xs bg-white border border-amber-300 text-amber-900 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors shadow-sm font-medium">
            ☕ Explain Z-Scores over coffee
          </button>
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
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4 items-center">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field flex-1" 
              placeholder={isListening ? "🎙️ Listening... speak now..." : "Type a question or press the mic..."} 
              disabled={isLoading || isListening}
            />
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-lg border font-bold text-sm transition-all flex items-center gap-1.5 shrink-0 ${isListening ? 'bg-rose-600 text-white border-rose-700 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'}`}
              title="Speak your question out loud"
            >
              🎙️ {isListening ? 'Listening...' : 'Speak'}
            </button>
            <button type="submit" className="btn-primary shrink-0" disabled={isLoading || isListening}>
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
