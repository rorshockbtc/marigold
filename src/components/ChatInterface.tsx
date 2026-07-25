"use client";

import { useState, useEffect, useRef } from "react";
import { getSearchRecipes, saveSearchRecipe, SearchRecipe } from "@/lib/firebase/db";
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';
import { BookOpen, Volume2, Building2, Package, HelpCircle, BarChart3, Sprout, Microscope } from 'lucide-react';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { Button } from "@/components/ui/Button";
import { PIIRedactor } from '@/lib/security/PIIRedactor';

import { ChatMessage, ChatSession, Playbook } from '@/lib/types';

export default function ChatInterface({ isDrawer = false }: { isDrawer?: boolean } = {}) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname() || '';

  const getPageContext = () => {
    if (typeof window === 'undefined') return null;
    const activeGrp = localStorage.getItem("marigold_active_group") || "Independent Audit Workspace";
    const fname = localStorage.getItem("marigold_file_name") || "No file linked";
    const isDemo = activeGrp.toLowerCase().includes("demo") || activeGrp.toLowerCase().includes("acme") || activeGrp.toLowerCase().includes("roosevelt") || activeGrp.toLowerCase().includes("sandbox");
    const isDemoIsolated = isDemo && !fname.toUpperCase().includes("DEMO") && localStorage.getItem("marigold_file_connected") !== "true";
    return {
      currentRoute: pathname,
      activeGroup: activeGrp,
      datasetName: isDemoIsolated ? "No demo file linked (`DEMO_roosevelt_...csv` required)" : fname,
      datasetRowCount: isDemoIsolated ? "0" : (localStorage.getItem("marigold_file_rows") || (isDemo ? "1800" : "0")),
      isDataConnected: isDemoIsolated ? false : (localStorage.getItem("marigold_file_connected") === "true" || isDemo),
      isDemoMode: isDemo
    };
  };

  useEffect(() => {
    if (query === "" && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [query]);

  // Listen for external requests to fill the query box (e.g. from NonTechnicalTranslator)
  useEffect(() => {
    const handleSetQuery = (e: CustomEvent | Event) => {
      if ('detail' in e && (e as CustomEvent).detail?.query) {
        setQuery((e as CustomEvent).detail.query);
        // Optionally focus the textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };
    window.addEventListener('mari-set-query', handleSetQuery);
    return () => window.removeEventListener('mari-set-query', handleSetQuery);
  }, []);
  
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
    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Read aloud helper with natural voice selection
  const handleSpeakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown chars for clean speaking
    const cleanText = text.replace(/[*#`~_]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;

    // Select the most natural English voice available (e.g. Samantha, Alex, Google US)
    const voices = window.speechSynthesis.getVoices();
    const preferredNames = ["Samantha", "Alex", "Google US English", "Daniel", "Karen", "Oliver", "Ava", "Victoria"];
    let selectedVoice = voices.find(v => preferredNames.includes(v.name));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("compact") && !v.name.toLowerCase().includes("robotic") && !v.name.toLowerCase().includes("zarvox"));
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveSuggestedPlaybook = async (pb: Playbook) => {
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

    const scrubbedQuery = PIIRedactor.scrub(query);
    let currentSessionId = activeSessionId;
    let currentMessages = messages;

    // Create new session if none active
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: "s" + Date.now(),
        title: scrubbedQuery.substring(0, 30) + (scrubbedQuery.length > 30 ? "..." : ""),
        timestamp: Date.now(),
        messages: [{ role: "assistant", content: "Hello! I am your Marigold Guide. Ask me how to find specific records, use filters, or navigate the platform!" }]
      };
      setSessions(prev => [newSession, ...prev]);
      currentSessionId = newSession.id;
      currentMessages = newSession.messages;
      setActiveSessionId(newSession.id);
    }

    const userMessage: ChatMessage = { role: "user", content: scrubbedQuery };
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
          isFriendlyMode,
          pageContext: getPageContext()
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
      const errorMsg: ChatMessage = { role: "assistant", content: "I'm having trouble connecting to the local model (Gemini). Please ensure your API key is configured correctly or try asking again in a moment. If this persists, contact your group administrator." };
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
      name: PIIRedactor.scrub(templateName),
      description: PIIRedactor.scrub(templateDesc),
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
    <div className={isDrawer ? "flex h-full w-full gap-0 bg-background" : "flex h-[calc(100vh-8rem)] max-w-6xl mx-auto gap-6"}>
      
      {/* Sidebar: History */}
      {!isDrawer && (
        <div className="w-64 flex flex-col bg-white rounded-xl shadow-sm border border-border overflow-hidden shrink-0">
          <div className="p-4 border-b border-border">
            <Button onClick={handleNewSession} variant="primary">
              + New Question
            </Button>
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
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-background overflow-hidden relative ${isDrawer ? 'border-0 rounded-none shadow-none h-full' : 'rounded-2xl shadow-sm border border-border'}`}>
        <div className="bg-background border-b border-border-soft px-5 py-4 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-serif font-black text-text-header">{activeSession ? activeSession.title : "How can I help you?"}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!activeSession && (
             <div className="h-full flex items-center justify-center text-text-body flex-col text-center px-4 animate-in fade-in duration-500">
               <div className="w-16 h-16 bg-white border border-border-soft rounded-2xl shadow-sm flex items-center justify-center mb-6 overflow-hidden border-primary">
                 <MarigoldIcon className="w-8 h-8 text-primary drop-shadow-sm" />
               </div>
               <h3 className="text-2xl font-serif text-text-header mb-2">Welcome to the Marigold Guide</h3>
               <p className="text-sm max-w-xs leading-relaxed">
                 I can help you navigate your records, explain anomalies in plain English, and run automated audits. What would you like to investigate today?
               </p>
             </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 relative group ${msg.role === 'user' ? 'bg-primary text-white font-medium shadow-sm rounded-br-none' : 'bg-white border border-border-soft text-text-header shadow-sm rounded-bl-none'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => handleSpeakText(msg.content)}
                      className="text-[10px] text-text-body hover:text-primary transition-colors flex items-center gap-1 font-bold uppercase tracking-wider"
                      title="Read this response out loud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}
                <div className={`text-sm md:text-[0.95rem] leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-white' : 'text-text-header'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.suggestedPlaybook && (
                  <div className="mt-4 p-4 bg-surface border border-border-soft rounded-2xl text-text-header space-y-2 text-left">
                    <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-primary mb-2">
                       <span className="flex items-center gap-1.5">
                         <MarigoldIcon className="w-3.5 h-3.5" />
                         <span>Suggested Mission</span>
                       </span>
                    </div>
                    <p className="font-serif font-bold text-lg">{msg.suggestedPlaybook.name}</p>
                    <p className="text-sm text-text-body leading-relaxed">{msg.suggestedPlaybook.description}</p>
                    <button
                      type="button"
                      onClick={() => handleSaveSuggestedPlaybook(msg.suggestedPlaybook)}
                      disabled={savedPlaybooks[msg.suggestedPlaybook.name]}
                      className={`w-full mt-2 py-3 rounded-full font-bold text-sm transition-all shadow-sm ${savedPlaybooks[msg.suggestedPlaybook.name] ? 'bg-albers-green-soft text-albers-green-bold border border-albers-green-bold/20 cursor-default' : 'bg-white border border-border-soft hover:border-primary text-text-header'}`}
                    >
                      {savedPlaybooks[msg.suggestedPlaybook.name] ? '✓ Saved to Playbooks' : 'Save as Mission Playbook'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white border border-border-soft rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-3">
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
               </div>
            </div>
          )}
        </div>

        {/* Clean Modern Input Form */}
        <div className="p-4 bg-white border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="relative flex-1">
              <textarea 
                ref={textareaRef}
                rows={1}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 250)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (query.trim() && !isLoading && !isListening) {
                      handleSubmit(e as any);
                    }
                  }
                }}
                className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-3 pr-11 text-sm text-foreground outline-none font-medium placeholder-muted-foreground resize-none overflow-y-auto leading-relaxed" 
                placeholder={isListening ? "Listening... speak now..." : "Type a question or ask for guidance... (Shift+Enter for new line)"} 
                disabled={isLoading || isListening}
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all flex items-center justify-center ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}
                title="Speak your question out loud"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            <button 
              type="submit" 
              className="bg-accent hover:bg-primary/90 disabled:opacity-50 text-slate-900 font-black px-5 py-3 rounded-xl transition-all shadow-2xs shrink-0 flex items-center gap-2" 
              disabled={isLoading || isListening || !query.trim()}
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            AI generated guidance runs locally. Always verify findings before reporting.
          </p>
        </div>

        {/* Save Template Modal */}
        {isTemplateModalOpen && (
          <div className="absolute inset-0 bg-white shadow-inner z-50 flex items-center justify-center p-4">
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
                  <select value={templateScope} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTemplateScope(e.target.value as "local" | "org")} className="input-field w-full">
                    <option value="local">Personal (Save to this browser only)</option>
                    <option value="org">Organization (Publish to all MSFE volunteers)</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setIsTemplateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
                  <Button type="submit" variant="primary">Save Template</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
