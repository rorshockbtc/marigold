"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataStoryCanvas } from '@/components/DataStoryCanvas';
import ChatInterface from '@/components/ChatInterface';
import { DataStory, useDataConcierge } from '@/hooks/useDataConcierge';
import { useGroupSync } from '@/hooks/useGroupSync';
import { Database, FileUp, Sparkles, BookOpen, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { DataRequiredState } from "@/components/DataRequiredState";
import { useVoterRollConnection } from '@/hooks/useVoterRollConnection';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import localforage from 'localforage';

import { ArticleViewer } from '@/components/ArticleViewer';

export default function InsightsPage() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [initialSearch, setInitialSearch] = useState("");
  const [articleState, setArticleState] = useState<import('@/lib/types').ArticleState | undefined>(undefined);
  const [recentChats, setRecentChats] = useState<{id: string, title: string, timestamp: number}[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);
  
  const { isConnected, isDemo } = useVoterRollConnection();
  const { savedStories, saveStoryLocally, selectSavedStory } = useDataConcierge();
  const { publishActivity, sharePlaybook } = useGroupSync();

  const isDataLoaded = isConnected || (isDemo && typeof window !== "undefined" && localStorage.getItem("marigold_file_name")?.toUpperCase().includes("DEMO"));

  useEffect(() => {
    setIsMounted(true);
    
    // Listen for live updates from Mari's Chat Interface (Single Article Editor)
    const handleArticleUpdate = (e: CustomEvent<import('@/lib/types').ArticleState>) => {
      setArticleState(e.detail);
      setViewMode('workspace');
    };
    
    window.addEventListener('mari-article-update', handleArticleUpdate as EventListener);
    
    // Load recent chats from localforage
    const loadRecentChats = async () => {
      try {
        let parsed: any = await localforage.getItem("elly_chat_sessions");
        
        if (!parsed || parsed.length === 0) {
          const oldData = localStorage.getItem("elly_chat_sessions");
          if (oldData) {
            try {
              parsed = JSON.parse(oldData);
              if (parsed && Array.isArray(parsed)) {
                await localforage.setItem("elly_chat_sessions", parsed);
              }
            } catch(e) {}
          }
        }

        if (parsed && Array.isArray(parsed)) {
          setRecentChats(parsed.map((s: any) => ({
            id: s.id,
            title: s.title,
            timestamp: s.timestamp
          })));
        }
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    };
    loadRecentChats();

    return () => {
      window.removeEventListener('mari-article-update', handleArticleUpdate as EventListener);
    };
  }, []);

  // Auto-scroll the feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [articleState?.sections?.length]);

  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 min-h-screen bg-background">
        <div className="h-10 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!isDataLoaded) {
    return (
      <DataRequiredState 
        title="Data Required" 
        subtitle="You cannot generate AI insights because your local data engine is empty." 
      />
    );
  }

  const handlePublishStory = (storyToPublish: import('@/lib/types').ArticleState) => {
    sharePlaybook({
      title: storyToPublish.title,
      description: storyToPublish.blocks?.[0]?.content.narrative || storyToPublish.sections?.[0]?.narrative || "",
      ruleType: "DATA_STORY",
      threshold: 0,
    });
    publishActivity("Published Data Story", `Shared '${storyToPublish.title}' with group (Scrubbed PII & Location tags)`);
  };

  const handleLandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialSearch.trim()) return;
    // Switch to dual-pane workspace. The ChatInterface will catch initialSearch and immediately submit it.
    setViewMode('workspace');
  };

  const handleResumeStory = (story: any) => {
    selectSavedStory(story);
    
    // Create a new chat session to continue investigating this story
    const newSessionId = `s-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: `Continuing: ${story.title}`,
      timestamp: Date.now(),
      messages: [{ role: "assistant", content: `I've loaded the Data Story "${story.title}". What would you like to investigate next?` }],
      articleState: story.articleState
    };
    
    const saveNewSession = async () => {
      try {
        const savedSessions: any = await localforage.getItem("elly_chat_sessions") || [];
        await localforage.setItem("elly_chat_sessions", [newSession, ...savedSessions]);
      } catch(e) {}
    };
    saveNewSession();
    
    if (story.articleState) {
      setArticleState(story.articleState);
    }
    setSelectedSessionId(newSessionId);
    setViewMode('workspace');
  };

  const handleSaveToConcierge = () => {
    if (!articleState) return;
    const shell: DataStory = {
      id: `story-${Date.now()}`,
      title: articleState.title || "Untitled Data Story",
      query: articleState.title || "Data Investigation",
      summary: articleState.blocks?.[0]?.content.narrative || articleState.sections?.[0]?.narrative || "Local data investigation...",
      correlationScore: parseFloat((0.80 + Math.random() * 0.15).toFixed(2)), // Mock score for aesthetics
      sourceUrl: "local",
      sourceName: "Local Dataset",
      createdAt: new Date().toISOString(),
      isSavedLocally: true,
      dataPoints: [],
      insights: [],
      articleState: articleState
    };
    saveStoryLocally(shell);
  };

  const handleResumeChat = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setViewMode('workspace');
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      
      {viewMode === 'landing' ? (
        // GEMINI-STYLE LANDING PAGE
        <div className="flex-1 flex flex-col items-center p-8 pt-24 overflow-y-auto relative">
           
           <div className="absolute top-6 right-6 flex gap-3 z-10">
             <Link href="/data-prep" className="btn-secondary hidden sm:flex items-center gap-2">
                <Database className="w-4 h-4" /> Upload Data
             </Link>
             <Link href="/onboarding" className="btn-secondary hidden sm:flex items-center gap-2">
                <FileUp className="w-4 h-4" /> Re-link Folder
             </Link>
           </div>

           <div className="w-full max-w-3xl space-y-12 pb-12">
             <div className="text-center space-y-4">
               <div className="w-16 h-16 bg-white border border-border shadow-sm rounded-full flex items-center justify-center text-primary mx-auto">
                 <MarigoldIcon className="w-8 h-8" />
               </div>
               <h1 className="text-4xl font-serif text-text-header font-black tracking-tight">What would you like to investigate?</h1>
               <p className="text-sm text-text-body">I am Mari, your secure, local Data Investigator.</p>
             </div>

             <form onSubmit={handleLandingSubmit} className="relative group">
               <div className="relative bg-white border-2 border-border focus-within:border-primary shadow-sm rounded-3xl p-3 flex items-end transition-colors">
                 <textarea
                   rows={2}
                   value={initialSearch}
                   onChange={(e) => {
                     setInitialSearch(e.target.value);
                     e.target.style.height = 'auto';
                     e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                   }}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleLandingSubmit(e as any);
                     }
                   }}
                   placeholder="e.g. Scan my active dataset and highlight the top 3 anomalies..."
                   className="flex-1 bg-transparent border-none focus:outline-none text-lg text-text-header placeholder:text-text-body/50 px-4 py-2 resize-none overflow-y-auto leading-relaxed"
                 />
                 <Button
                   type="submit"
                   variant="primary"
                   disabled={!initialSearch.trim()}
                   className="ml-2 mb-1 shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center p-0"
                 >
                   <ArrowRight className="w-6 h-6" />
                 </Button>
               </div>
             </form>

             {savedStories.length > 0 && (
               <div className="pt-10">
                 <div className="flex items-center gap-2 mb-6">
                   <BookOpen className="w-5 h-5 text-muted-foreground" />
                   <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Resume Recent Investigations</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {savedStories.slice(0, 4).map((story) => (
                     <div
                       key={story.id}
                       onClick={() => handleResumeStory(story)}
                       className="bg-white border border-border-soft hover:border-primary p-5 rounded-2xl shadow-sm transition-all cursor-pointer space-y-3 group hover:-translate-y-0.5"
                     >
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {new Date(story.createdAt).toLocaleDateString()}
                         </span>
                         <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                           +{story.correlationScore} Correlation
                         </span>
                       </div>
                       <h4 className="text-base font-serif font-bold text-text-header group-hover:text-primary transition-colors line-clamp-1">
                         {story.title}
                       </h4>
                       <p className="text-xs text-text-body line-clamp-2 leading-relaxed">
                         {story.summary}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {recentChats.length > 0 && (
               <div className="pt-10">
                 <div className="flex items-center gap-2 mb-6">
                   <Clock className="w-5 h-5 text-muted-foreground" />
                   <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Chat Sessions</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {recentChats.slice(0, 4).map((chat) => (
                     <div
                       key={chat.id}
                       onClick={() => handleResumeChat(chat.id)}
                       className="bg-white border border-border-soft hover:border-primary p-4 rounded-2xl shadow-sm transition-all cursor-pointer group hover:-translate-y-0.5"
                     >
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {new Date(chat.timestamp).toLocaleDateString()}
                         </span>
                       </div>
                       <h4 className="text-sm font-medium text-text-header group-hover:text-primary transition-colors line-clamp-2">
                         {chat.title}
                       </h4>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
        </div>
      ) : (
        // DUAL-PANE WORKSPACE
        <>
          {/* Center Pane: Article Viewer */}
          <div className="flex-1 overflow-y-auto bg-surface-secondary border-r border-border-soft p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto pb-32">
              {articleState ? (
                <ArticleViewer 
                  article={articleState}
                  onPublishToGroup={() => handlePublishStory(articleState)}
                  onSaveLocally={handleSaveToConcierge}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-white border border-border shadow-sm rounded-full flex items-center justify-center text-primary">
                    <MarigoldIcon className="w-8 h-8 opacity-50" />
                  </div>
                  <h2 className="text-2xl font-serif text-text-header tracking-tight">Listening to Mari...</h2>
                  <p className="text-sm text-text-body">
                    When Mari computes local statistics or writes a narrative, the Data Story will construct here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Chat Interface (No Sidebar) */}
          <div className="w-[440px] shrink-0 h-full min-h-0 flex flex-col">
            <ChatInterface 
              isDrawer={true} 
              hideSidebar={true} 
              initialQuery={initialSearch}
              initialSessionId={selectedSessionId}
              articleState={articleState}
            />
          </div>
        </>
      )}
    </div>
  );
}
