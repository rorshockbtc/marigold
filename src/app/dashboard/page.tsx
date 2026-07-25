"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Filter, Settings, FileText, CheckCircle2, AlertTriangle, Clock, PlayCircle, FolderKey, Users, LayoutGrid, Database, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/KanbanBoard";

export default function DashboardPage() {
  const router = useRouter();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");
  const [recordCount, setRecordCount] = useState("0");
  const [activeTab, setActiveTab] = useState("kanban");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const group = localStorage.getItem("marigold_active_group") || "Independent Audit Workspace";
      setActiveGroup(group);
      
      const isConnected = localStorage.getItem("marigold_file_connected") === "true";
      const isDemo = group.toLowerCase().includes("demo") || group.toLowerCase().includes("sandbox");
      
      if (isConnected) {
        setIsDataLoaded(true);
        setRecordCount(localStorage.getItem("marigold_file_rows") || "0");
      } else if (isDemo && localStorage.getItem("marigold_file_name")?.toUpperCase().includes("DEMO")) {
        setIsDataLoaded(true);
        setRecordCount("1842");
      } else {
        setIsDataLoaded(false);
      }
    }
  }, []);

  const openMariWithQuery = (query: string) => {
    window.dispatchEvent(new Event('open-mari-panel'));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('mari-set-query', { detail: { query } }));
    }, 100);
  };

  if (!isDataLoaded) {
    return (
      <div className="flex flex-col h-full font-sans max-w-4xl mx-auto">
        <div className="mb-12 mt-8">
          <h1 className="text-4xl font-serif text-text-header mb-3">Welcome to Marigold</h1>
          <p className="text-lg text-text-body">Your private workspace is empty. Complete these steps to start your first verification mission.</p>
        </div>

        <div className="grid gap-4">
          <Link href="/settings/group" className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex items-center gap-6 transition-all group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-text-header mb-1 group-hover:text-primary">1. Join your Team (or work Solo)</h3>
              <p className="text-sm text-text-body">Ensure you are connected to the correct jurisdiction or set yourself up as an independent researcher.</p>
            </div>
          </Link>

          <Link href="/onboarding" className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex items-center gap-6 transition-all group hover:-translate-y-1">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
              <FolderKey className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-text-header mb-1 group-hover:text-primary">2. Set up your Secure Folder</h3>
              <p className="text-sm text-text-body">Create your private local folder and run the Demo Files or upload your own CSV.</p>
            </div>
          </Link>
          
          <Button onClick={() => openMariWithQuery("What is Marigold and how do I use the Guided Playbooks?")} variant="outline" className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex items-center gap-6 transition-all group hover:-translate-y-1 text-left w-full h-auto">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
              <PlayCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-text-header mb-1 group-hover:text-primary">3. Ask the AI Guide</h3>
              <p className="text-sm text-text-body">Not sure what to do? Open the Mari AI panel on the right and ask for a tour.</p>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Workspace Dashboard"
        subtitle={`${activeGroup} • ${Number(recordCount).toLocaleString()} Active Records`}
        badge={
          activeGroup.toLowerCase().includes("demo") ? (
            <div className="inline-block bg-primary/10 text-primary font-black text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-widest mb-1 border border-primary/20">
              Demo Workspace
            </div>
          ) : null
        }
        actions={
          <div className="flex gap-3">
            <div className="relative">
              <Button 
                onClick={() => { /* Toggle filter dropdown - to be implemented fully */ alert("Filter Board: Scope for future Sprint"); }}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter Board
              </Button>
            </div>
            <Button onClick={() => router.push('/comprehensive-audit')} variant="primary">
              Run 360° Audit
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border-soft mb-8">
        <Button 
          onClick={() => setActiveTab('kanban')}
          variant="ghost"
          className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 rounded-none h-auto ${activeTab === 'kanban' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-text-header'}`}
        >
          <LayoutGrid className="w-4 h-4" />
          Mission Kanban
        </Button>
        <Button 
          onClick={() => setActiveTab('data')}
          variant="ghost"
          className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 rounded-none h-auto ${activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-text-header'}`}
        >
          <Database className="w-4 h-4" />
          Data Overview
        </Button>
        <Button 
          onClick={() => setActiveTab('activity')}
          variant="ghost"
          className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 rounded-none h-auto ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-text-header'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Group Activity
        </Button>
      </div>

      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'data' && (
        <div className="flex-1 flex items-center justify-center bg-white border border-border-soft rounded-2xl min-h-[400px]">
          <p className="text-muted-foreground text-sm">Data Overview charts will go here.</p>
        </div>
      )}
      {activeTab === 'activity' && (
        <div className="flex-1 flex items-center justify-center bg-white border border-border-soft rounded-2xl min-h-[400px]">
          <p className="text-muted-foreground text-sm">Group Chat & Activity Feed will go here.</p>
        </div>
      )}
    </div>
  );
}
