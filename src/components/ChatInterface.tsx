"use client";

import { useState, useEffect, useRef } from "react";
import { getSearchRecipes, saveSearchRecipe, SearchRecipe } from "@/lib/firebase/db";
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';
import { BookOpen, Volume2, Sparkles, Building2, Package, HelpCircle, BarChart3, Sprout, Microscope } from 'lucide-react';

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
    const isDemoIsolated = activeGrp === "State of Roosevelt (Demo)" && !fname.toUpperCase().includes("DEMO");
    return {
      currentRoute: pathname,
      activeGroup: activeGrp,
      datasetName: isDemoIsolated ? "No demo file linked (`DEMO_roosevelt_...csv` required)" : fname,
      datasetRowCount: isDemoIsolated ? "0" : (localStorage.getItem("marigold_file_rows") || "0"),
      isDataConnected: isDemoIsolated ? false : (localStorage.getItem("marigold_file_connected") === "true")
    };
  };

  useEffect(() => {
    if (query === "" && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [query]);
  
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
    <div className={isDrawer ? "flex h-full w-full gap-0 bg-[#FAF8F5]" : "flex h-[calc(100vh-8rem)] max-w-6xl mx-auto gap-6"}>
      
      {/* Sidebar: History */}
      {!isDrawer && (
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
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white overflow-hidden relative ${isDrawer ? 'border-0 rounded-none shadow-none h-full' : 'rounded-xl shadow-sm border border-border'}`}>
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
              {isFriendlyMode ? (
                <>
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Friendly Guide Mode</span>
                </>
              ) : (
                <>
                  <Microscope className="w-3.5 h-3.5 text-slate-300" />
                  <span>Analyst Pro Mode</span>
                </>
              )}
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
               <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
               <p className="text-lg font-medium text-foreground">Welcome to the Marigold Guide</p>
               <p className="mt-2">I am here to help you learn how to navigate Marigold Insights and find the records you need.</p>
             </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-2xs relative group ${msg.role === 'user' ? 'bg-[#D96B27] text-white font-medium' : 'bg-white border border-[#E5E0D8] text-[#2D3142]'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex justify-end mb-1">
                    <button
                      type="button"
                      onClick={() => handleSpeakText(msg.content)}
                      className="text-[11px] bg-[#FAF8F5] hover:bg-[#EAE5DC] text-[#4A5060] px-2 py-0.5 rounded border border-[#E5E0D8] flex items-center gap-1 transition-colors font-semibold"
                      title="Read this response out loud"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#D96B27]" />
                      <span>Read Aloud</span>
                    </button>
                  </div>
                )}
                <div className={`text-sm md:text-[0.95rem] leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-white' : 'text-[#2D3142]'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.suggestedPlaybook && (
                  <div className="mt-4 p-3 bg-[#FAF8F5] border border-[#D96B27]/30 rounded-xl text-[#2D3142] space-y-2 text-left">
                    <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-[#D96B27]">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Suggested Mission Playbook</span>
                      </span>
                      <span className="bg-[#D96B27]/15 px-2 py-0.5 rounded">{msg.suggestedPlaybook.audit_type}</span>
                    </div>
                    <p className="font-bold text-sm">{msg.suggestedPlaybook.name}</p>
                    <p className="text-xs text-[#4A5060] leading-relaxed">{msg.suggestedPlaybook.description}</p>
                    <div className="flex gap-2 text-xs text-[#646A7A] font-mono pt-1">
                      <span>Threshold: {msg.suggestedPlaybook.threshold || 'N/A'}</span>
                      <span>• County: {msg.suggestedPlaybook.county || 'Statewide'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveSuggestedPlaybook(msg.suggestedPlaybook)}
                      disabled={savedPlaybooks[msg.suggestedPlaybook.name]}
                      className={`w-full py-2 rounded-lg font-bold text-xs transition-colors shadow-2xs ${savedPlaybooks[msg.suggestedPlaybook.name] ? 'bg-emerald-600 text-white cursor-default' : 'bg-[#D96B27] hover:bg-[#C85A1B] text-white'}`}
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
              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-2xs animate-pulse">
                <p className="text-[#646A7A] text-sm font-medium">Thinking & reviewing local data records...</p>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Starter Actions Grid */}
        {messages.length <= 1 && (
          <div className="p-4 bg-[#F0ECE3] border-t border-[#E5E0D8] space-y-3">
            <div className="text-[11px] font-black text-[#646A7A] uppercase tracking-wider flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>Suggested Forensic Inquiries</span>
              </span>
              <span className="text-[10px] font-normal font-mono">Click any card to ask</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuery("Are there any unusual apartment complexes or dorms registered in my jurisdiction?")}
                className="text-left p-3 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#D96B27] transition-all group flex items-start gap-2.5 shadow-2xs"
              >
                <Building2 className="w-5 h-5 text-[#D96B27] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2D3142] group-hover:text-[#D96B27] truncate">High-Density Registration Scan</div>
                  <div className="text-[11px] text-[#646A7A] line-clamp-1">Check over-registered apartments & dorms</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuery("Can you check if any commercial shipping stores or PO boxes are listed as residential homes?")}
                className="text-left p-3 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#D96B27] transition-all group flex items-start gap-2.5 shadow-2xs"
              >
                <Package className="w-5 h-5 text-[#D96B27] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2D3142] group-hover:text-[#D96B27] truncate">Audit Commercial Mail Drops</div>
                  <div className="text-[11px] text-[#646A7A] line-clamp-1">Identify shipping boxes used as residences</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuery("Explain what a Z-Score is and how Marigold detects anomalies without partisan bias.")}
                className="text-left p-3 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#D96B27] transition-all group flex items-start gap-2.5 shadow-2xs"
              >
                <HelpCircle className="w-5 h-5 text-[#D96B27] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2D3142] group-hover:text-[#D96B27] truncate">Plain-English Z-Scores Guide</div>
                  <div className="text-[11px] text-[#646A7A] line-clamp-1">Understand objective statistical anomalies</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuery("Run a full statistical fraud evaluation on Hinds County and summarize priority anomalies.")}
                className="text-left p-3 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#D96B27] transition-all group flex items-start gap-2.5 shadow-2xs"
              >
                <BarChart3 className="w-5 h-5 text-[#D96B27] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2D3142] group-hover:text-[#D96B27] truncate">Sample County Audit (Hinds)</div>
                  <div className="text-[11px] text-[#646A7A] line-clamp-1">Generate county anomaly report</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Clean Modern Input Form */}
        <div className="p-4 bg-white border-t border-[#E5E0D8]">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="relative flex-1">
              <textarea 
                ref={textareaRef}
                rows={1}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (query.trim() && !isLoading && !isListening) {
                      handleSubmit(e as any);
                    }
                  }
                }}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] focus:border-[#D96B27] rounded-xl px-4 py-3 pr-11 text-sm text-[#2D3142] outline-none font-medium placeholder-[#646A7A] resize-none overflow-y-auto leading-relaxed" 
                placeholder={isListening ? "Listening... speak now..." : "Type a question or ask for guidance... (Shift+Enter for new line)"} 
                disabled={isLoading || isListening}
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all flex items-center justify-center ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-[#646A7A] hover:text-[#D96B27] hover:bg-[#EAE5DC]'}`}
                title="Speak your question out loud"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            <button 
              type="submit" 
              className="bg-[#D96B27] hover:bg-[#C85A1B] disabled:opacity-50 text-white font-black px-5 py-3 rounded-xl transition-all shadow-2xs shrink-0 flex items-center gap-2" 
              disabled={isLoading || isListening || !query.trim()}
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
          <p className="text-[11px] text-[#646A7A] mt-2 text-center">
            AI generated guidance runs locally. Always verify findings before reporting.
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
                    <option value="local">Personal (Save to this browser only)</option>
                    <option value="org">Organization (Publish to all MSFE volunteers)</option>
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
