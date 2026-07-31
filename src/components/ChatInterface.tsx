"use client";

import { useState, useEffect, useRef } from "react";
import { getSearchRecipes, saveSearchRecipe, SearchRecipe } from "@/lib/firebase/db";
import ReactMarkdown from 'react-markdown';
import { usePathname } from 'next/navigation';
import { BookOpen, Volume2, Building2, Package, HelpCircle, BarChart3, Sprout, Microscope, Save, ShieldCheck, Download } from 'lucide-react';
import { LocalFolderGuideModal } from './LocalFolderGuideModal';
import { DataStory } from '@/hooks/useDataConcierge';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { Button } from "@/components/ui/Button";
import { FilterControl } from "@/components/ui/FilterControl";
import { PIIRedactor } from '@/lib/security/PIIRedactor';
import { useDataStoryFS } from '@/hooks/useDataStoryFS';
import { TriageCache } from '@/lib/triage/TriageCache';
import { executeLocalEngine } from '@/lib/data/LocalDataEngine';
import { useDuckDB } from '@/lib/data/DuckDBProvider';

import { ChatMessage, ChatSession, Playbook, ArticleState } from '@/lib/types';

export interface ChatInterfaceProps {
  isDrawer?: boolean;
  hideSidebar?: boolean;
  initialQuery?: string;
  articleState?: ArticleState;
}

export default function ChatInterface({ isDrawer = false, hideSidebar = false, initialQuery = "", articleState }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || '';
  const { saveDataStory, isSaving, error: saveError } = useDataStoryFS();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [storageLimitReached, setStorageLimitReached] = useState(false);
  const { isReady: isDuckDBReady, query: queryDuckDB } = useDuckDB();

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

  // Auto-submit initial query if provided (e.g. from Insights landing page)
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (initialQuery && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      // Use setTimeout to allow state to settle before firing
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      }, 100);
    }
  }, [initialQuery]);

  // Ethel Auto-scroll logic
  const activeSessionCheck = sessions.find(s => s.id === activeSessionId);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessionCheck?.messages?.length]);

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessions(parsed);
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // Pre-seed Semantic NLP Triage Cache
    TriageCache.getInstance().preSeedFAQs();
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("elly_chat_sessions", JSON.stringify(sessions));
      setStorageLimitReached(false);
    } catch (e) {
      console.warn("Failed to save sessions, likely quota exceeded.", e);
      setStorageLimitReached(true);
    }
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

  const handleSubmit = async (e: React.FormEvent, forceBypassTriage: boolean = false) => {
    if (e?.preventDefault) e.preventDefault();
    if (!query.trim()) return;

    const scrubbedQuery = await PIIRedactor.scrubAsync(query);
    let currentSessionId = activeSessionId;
    let currentMessages = messages;

    // Create new session if none active
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: "s" + Date.now(),
        title: scrubbedQuery.substring(0, 30) + (scrubbedQuery.length > 30 ? "..." : ""),
        timestamp: Date.now(),
        messages: [{ role: "assistant", content: "I am instructing your local machine to calculate that right now. Because we do this securely on your hardware, it may take a few moments." }]
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
    
    // Triage interception (unless escalated)
    if (!forceBypassTriage) {
      const triageAnswer = await TriageCache.getInstance().checkTriage(scrubbedQuery);
      if (triageAnswer) {
        const triageMessage: ChatMessage = { 
          role: "assistant", 
          content: triageAnswer,
          isTriage: true,
          originalQuery: scrubbedQuery
        };
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...newMessages, triageMessage] } : s));
        setQuery("");
        return;
      }
    }

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
          pageContext: getPageContext(),
          articleState
        }),
      });

      let data = await response.json();
      
      // BLIND LLM LOOP: If the AI wants to run a tool, execute it locally and resubmit
      let hiddenContext = undefined;
      
      // We keep track of the local state so we can mutate it based on delta tools
      let updatedArticle: ArticleState = { 
        title: articleState?.title || "Data Investigation", 
        sections: [...(articleState?.sections || [])] 
      };

      let loopResponseData = data;
      let finalReply = loopResponseData.reply;
      let loopMessages = newMessages;

      let loopCount = 0;
      while (response.ok && loopResponseData.action === 'run_tool' && loopCount < 5) {
        loopCount++;
        const t = loopResponseData.tool;
        const args = loopResponseData.args;

        if (t === 'query_dataset' || t.startsWith('run_')) {
          let localEngineResponse: any = null;
          
          if (t === 'query_dataset' && args.dataset_url && isDuckDBReady) {
             try {
                // Determine a valid grouping column if group_by is absent
                const groupByCol = args.group_by ? `"${args.group_by}"` : 'column0';
                
                // Directly stream and aggregate from the remote public CSV using DuckDB!
                const sql = `SELECT ${groupByCol}::VARCHAR as x, COUNT(*)::INTEGER as y FROM read_csv_auto('${args.dataset_url}', header=True) GROUP BY x ORDER BY y DESC LIMIT 10`;
                const res = await queryDuckDB(sql);
                
                localEngineResponse = {
                  status: "success",
                  metric: args.metric,
                  group_by: args.group_by,
                  sample_size_used: "All available via HTTP Range Requests",
                  total_dataset_size: "Unknown (Streamed)",
                  aggregated_data: res, // [{x, y}]
                  instruction: "Use this real data from the public URL to generate your narrative. Never hallucinate."
                };
             } catch(e: any) {
                localEngineResponse = { status: "error", message: `DuckDB WASM failed to read ${args.dataset_url}: ${e.message}` };
             }
          } else {
             localEngineResponse = await executeLocalEngine(t, args);
          }
          
          const toolMessage: ChatMessage = { role: "user", content: `[LOCAL ENGINE RESPONSE]: ${JSON.stringify(localEngineResponse)}` };
          loopMessages = [...loopMessages, toolMessage];
          
          const loopResponse = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              query: toolMessage.content, 
              history: loopMessages,
              userApiKey,
              isFriendlyMode,
              pageContext: getPageContext(),
              articleState: updatedArticle
            }),
          });
          loopResponseData = await loopResponse.json();
          finalReply = loopResponseData.reply || finalReply;
        } else if (t === 'update_title') {
          updatedArticle.title = args.title;
          hiddenContext = `[SYSTEM: Title updated to "${args.title}"]`;
          window.dispatchEvent(new CustomEvent('mari-article-update', { detail: updatedArticle }));
          finalReply = "I've updated the title of our Data Story. What should we look at next?";
          break;
        } else if (t === 'append_section') {
          updatedArticle.sections.push({ id: args.id, heading: args.heading, narrative: args.narrative, chart: args.chart });
          hiddenContext = `[SYSTEM: Appended section "${args.heading}"]`;
          window.dispatchEvent(new CustomEvent('mari-article-update', { detail: updatedArticle }));
          finalReply = "I've added a new section to the Data Story. Please review it in the center pane.";
          break;
        } else if (t === 'update_section') {
          const idx = updatedArticle.sections.findIndex(s => s.id === args.id);
          if (idx >= 0) {
            updatedArticle.sections[idx] = { id: args.id, heading: args.heading, narrative: args.narrative, chart: args.chart };
            hiddenContext = `[SYSTEM: Updated section "${args.heading}"]`;
          } else {
            hiddenContext = `[SYSTEM: Error - section ${args.id} not found. Suggest adding a new one.]`;
          }
          window.dispatchEvent(new CustomEvent('mari-article-update', { detail: updatedArticle }));
          finalReply = "I've revised that section of our Data Story.";
          break;
        } else {
          break;
        }
      }

      const assistantMessage: ChatMessage = { 
        role: "assistant", 
        content: response.ok ? (finalReply || "I've updated the Data Story. Please review the changes in the center pane.") : `Error: ${loopResponseData.error || data.error}`,
        suggestedPlaybook: loopResponseData.suggestedPlaybook || data.suggestedPlaybook,
        hiddenContext
      };

      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...newMessages, assistantMessage] } : s));

      // Self-teaching loop: If we bypassed triage and got a good answer, learn it
      if (forceBypassTriage && response.ok) {
        TriageCache.getInstance().learnNewAnswer(scrubbedQuery, data.reply);
      }

    } catch (error) {
      const errorMsg: ChatMessage = { role: "assistant", content: "I'm having trouble connecting to the local model (Gemini). Please ensure your API key is configured correctly or try asking again in a moment. If this persists, contact your group administrator." };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...newMessages, errorMsg] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDisk = async () => {
    if (!activeSession) return;
    try {
      setSaveSuccess(false);
      await saveDataStory(activeSession);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      // Error is handled by the hook and will be displayed via saveError
    }
  };

  const handleEscalate = (originalQuery: string, sessionId: string, messageIndex: number) => {
    console.log("Telemetry: Escalate Triage failure for", originalQuery);
    // Remove the triage message so we don't send it to Gemini as history
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const newMsgs = [...s.messages];
        newMsgs.splice(messageIndex, 1); // Remove assistant triage message
        newMsgs.splice(messageIndex - 1, 1); // Remove the user query that triggered it
        return { ...s, messages: newMsgs };
      }
      return s;
    }));
    setQuery(originalQuery);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent, true); // true = force bypass triage
    }, 50);
  };

  return (
    <div className={isDrawer ? "flex min-h-0 h-full w-full gap-0 bg-background" : "flex h-[calc(100vh-8rem)] w-full mx-auto gap-6"}>
      
      {/* Sidebar: History */}
      {!isDrawer && !hideSidebar && (
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

      <div className={`flex-1 min-h-0 flex flex-col bg-background overflow-hidden relative ${isDrawer ? 'border-0 rounded-none shadow-none h-full' : 'rounded-2xl shadow-sm border border-border'}`}>
        {storageLimitReached && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 text-sm text-rose-800 flex justify-between items-center">
            <span>
              <strong>Browser Storage Limit Reached:</strong> We couldn't save your last message to your browser history. Please clear out old conversations or save your work to Marigold Local.
            </span>
            <div className="flex gap-2">
               <Button onClick={() => setSessions(sessions.slice(0, 1))} variant="outline" className="h-8 text-xs bg-white text-rose-700 hover:bg-rose-100 border-rose-200">Clear Old</Button>
               <Button onClick={handleSaveToDisk} variant="primary" className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white border-0">Save to Local</Button>
            </div>
          </div>
        )}
        <div className="bg-background border-b border-border-soft px-5 py-4 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-serif font-black text-text-header">{activeSession ? activeSession.title : "Data Investigator"}</h2>
          </div>
          {activeSession && (
            <div className="flex items-center gap-3">
              {saveError && <span className="text-xs text-red-500 font-mono truncate max-w-[200px]">{saveError}</span>}
              <Button onClick={handleSaveToDisk} disabled={isSaving} variant="secondary" className="gap-2 text-xs h-9">
                {isSaving ? <span className="animate-spin text-lg leading-none">⟳</span> : <Save className="w-4 h-4" />}
                {saveSuccess ? "Saved to Local Disk" : "Save Story to Disk"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!activeSession && (
             <div className="h-full flex items-center justify-center text-text-body flex-col text-center px-4 animate-in fade-in duration-500">
               <div className="w-16 h-16 bg-white border border-border-soft rounded-2xl shadow-sm flex items-center justify-center mb-6 overflow-hidden border-primary">
                 <ShieldCheck className="w-8 h-8 text-primary drop-shadow-sm" />
               </div>
               <h3 className="text-2xl font-serif text-text-header mb-2">I am Mari, your Data Investigator.</h3>
               <p className="text-sm max-w-md leading-relaxed text-muted-foreground mb-4">
                 For your security, I cannot see your raw files. I only read the mathematical summaries your local machine generates, ensuring your research never leaves your hard drive.
               </p>
               <div className="space-y-2 w-full max-w-md text-left bg-surface border border-border-soft rounded-xl p-4 shadow-sm">
                 <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2"><MarigoldIcon className="w-4 h-4" /> You can ask me to do things like:</p>
                 <button onClick={() => setQuery("Scan my active dataset and highlight the top 3 anomalies.")} className="w-full text-left p-2 hover:bg-muted rounded text-sm text-text-header transition-colors">→ "Scan my active dataset and highlight the top 3 anomalies."</button>
                 <button onClick={() => setQuery("Explain to me how people use P.O. Box disguises, and why it matters.")} className="w-full text-left p-2 hover:bg-muted rounded text-sm text-text-header transition-colors">→ "Explain to me how people use P.O. Box disguises, and why it matters."</button>
                 <button onClick={() => setQuery("Write a 3-paragraph summary of these exact findings that I can read aloud at tomorrow's county commissioner meeting.")} className="w-full text-left p-2 hover:bg-muted rounded text-sm text-text-header transition-colors">→ "Write a 3-paragraph summary of these exact findings..."</button>
               </div>
             </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 relative group ${msg.role === 'user' ? 'bg-primary text-white font-medium shadow-sm rounded-br-none' : 'bg-white border border-border-soft text-text-header shadow-sm rounded-bl-none'}`}>

                <div className={`text-sm md:text-[0.95rem] leading-relaxed prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-white' : 'text-text-header'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.isTriage && msg.originalQuery && activeSessionId && (
                  <div className="mt-4 pt-3 border-t border-border-soft flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground font-medium">This is a fast, automated response. Did this answer your question?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="text-xs py-1 h-7 border-border-soft hover:bg-albers-green-soft hover:text-albers-green-bold hover:border-albers-green-bold/30">
                        Yes
                      </Button>
                      <Button onClick={() => handleEscalate(msg.originalQuery!, activeSessionId, i)} variant="outline" className="text-xs py-1 h-7 border-border-soft hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                        No, ask Mari directly
                      </Button>
                    </div>
                  </div>
                )}

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
                      onClick={() => msg.suggestedPlaybook && handleSaveSuggestedPlaybook(msg.suggestedPlaybook)}
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
          <div ref={messagesEndRef} />
        </div>

        {/* Clean Modern Input Form */}
        <div className="p-4 bg-white border-t border-border shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="relative flex-1">
              <textarea 
                ref={textareaRef}
                rows={3}
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



      </div>
    </div>
  );
}
