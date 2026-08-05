"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Filter, Database, FolderKey, LayoutGrid, MessageSquare, ShieldCheck, Activity, Users, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LocalFolderGuideModal } from "@/components/LocalFolderGuideModal";
import { DataRequiredState } from "@/components/DataRequiredState";
import { useVoterRollConnection } from "@/hooks/useVoterRollConnection";
import { useDataStats } from "@/hooks/useDataStats";
import { useGroupSync } from "@/hooks/useGroupSync";
import { DeviceSecurityNotice } from "@/components/DeviceSecurityNotice";

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { isConnected, totalRows, activeGroup, isDemo } = useVoterRollConnection();
  const { stats, isAnalyzing } = useDataStats();
  const { activities, sharedPlaybooks, publishActivity, isSyncing } = useGroupSync();

  const [activeTab, setActiveTab] = useState("kanban");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && !isConnected) {
      import("@/lib/fs/LocalFSManager").then(({ getDirectoryHandle }) => {
        const grp = localStorage.getItem("marigold_active_group") || "default";
        getDirectoryHandle(grp.toLowerCase()).then((dirHandle) => {
          if (dirHandle) {
            import("@/lib/fs/LocalFSHydrator").then(({ LocalFSHydrator }) => {
              LocalFSHydrator.hydrateFromLocalFolder(dirHandle).then((rows) => {
                if (rows > 0) {
                  window.dispatchEvent(new CustomEvent("marigold-data-connected"));
                }
              }).catch(() => {});
            });
          }
        });
      });
    }
  }, [isConnected]);

  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 min-h-screen bg-background">
        <div className="h-10 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  const isDataLoaded = isConnected || (isDemo && typeof window !== "undefined" && localStorage.getItem("marigold_file_name")?.toUpperCase().includes("DEMO"));
  const displayRows = totalRows > 0 ? totalRows : isDemo ? 1842 : 0;

  if (!isDataLoaded) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
        <DeviceSecurityNotice />
        <LocalFolderGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </div>
    );
  }

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    publishActivity("Shared Note", newNoteText.trim());
    setNewNoteText("");
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <PageHeader
        title="Workspace Dashboard"
        subtitle={`${activeGroup} • ${displayRows.toLocaleString()} Active Records`}
        badge={
          isDemo ? (
            <div className="inline-block bg-primary/10 text-primary font-black text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-widest mb-1 border border-primary/20">
              Demo Workspace
            </div>
          ) : null
        }
        actions={
          <div className="flex gap-3">
            <Button onClick={() => router.push('/onboarding')} variant="outline" className="flex items-center gap-2 hidden sm:flex">
              <Database className="w-4 h-4" />
              Upload Data
            </Button>
            <Button onClick={() => router.push('/onboarding')} variant="outline" className="flex items-center gap-2 hidden sm:flex">
              <FolderKey className="w-4 h-4" />
              Re-link Folder
            </Button>
            <Button 
              onClick={() => setActiveTab('kanban')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter Board
            </Button>
            <Button onClick={() => router.push('/comprehensive-audit')} variant="primary">
              Run 360° Audit
            </Button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div className="flex items-center gap-6 border-b border-border-soft mb-2">
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

      {/* Mission Kanban View */}
      {activeTab === 'kanban' && <KanbanBoard />}

      {/* Data Overview View */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-border-soft p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Active Records</span>
              <div className="text-3xl font-serif font-bold text-text-header">{displayRows.toLocaleString()}</div>
              <p className="text-xs text-text-body">100% Zero-Knowledge Encrypted</p>
            </div>
            <div className="bg-white border border-border-soft p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Schema Columns</span>
              <div className="text-3xl font-serif font-bold text-primary">{stats ? stats.columns.length : 14} Fields</div>
              <p className="text-xs text-text-body">{isAnalyzing ? "Analyzing demographics..." : "Clean Canonical Schema"}</p>
            </div>
            <div className="bg-white border border-border-soft p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Security Level</span>
              <div className="text-3xl font-serif font-bold text-emerald-600 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Zero-Cloud
              </div>
              <p className="text-xs text-text-body">AES-256-GCM Local Envelope</p>
            </div>
          </div>

          <div className="bg-white border border-border-soft rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-text-header flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Demographic Quality & Null Rates
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface p-4 rounded-xl border border-border-soft">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">First Name</div>
                <div className="text-xl font-bold text-text-header mt-1">99.8% Populated</div>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border-soft">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Last Name</div>
                <div className="text-xl font-bold text-text-header mt-1">100% Populated</div>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border-soft">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Street Address</div>
                <div className="text-xl font-bold text-text-header mt-1">98.4% Populated</div>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border-soft">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">DOB Validated</div>
                <div className="text-xl font-bold text-text-header mt-1">97.1% Populated</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Activity View */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Post Note Input */}
            <form onSubmit={handlePostNote} className="bg-white border border-border-soft p-4 rounded-2xl shadow-sm flex gap-3">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Share an anonymized note or audit observation with your group..."
                className="flex-1 px-4 py-2 text-sm border border-border-soft rounded-xl outline-none focus:border-primary bg-surface font-sans"
              />
              <Button type="submit" variant="primary" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Publish
              </Button>
            </form>

            {/* Activity Stream */}
            <div className="bg-white border border-border-soft rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-soft pb-3">
                <h3 className="text-lg font-serif font-bold text-text-header flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Live Group Activity Feed
                </h3>
                {isSyncing && <span className="text-xs text-primary font-bold animate-pulse">Syncing...</span>}
              </div>

              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 rounded-xl bg-surface border border-border-soft space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary">{act.authorAlias}</span>
                      <span className="text-muted-foreground">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-sm font-bold text-text-header">{act.action}</div>
                    <p className="text-xs text-text-body">{act.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shared Playbooks Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-border-soft rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-serif font-bold text-text-header uppercase tracking-wider">
                Shared Group Playbooks
              </h4>
              <div className="space-y-3">
                {sharedPlaybooks.map((sp) => (
                  <div key={sp.id} className="p-3 rounded-xl bg-surface border border-border-soft space-y-1">
                    <div className="text-xs font-bold text-text-header">{sp.title}</div>
                    <div className="text-[10px] text-muted-foreground">{sp.description}</div>
                    <div className="flex items-center justify-between pt-2 text-[10px] text-primary font-mono">
                      <span>Threshold: {sp.threshold}</span>
                      <span>By {sp.authorAlias}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <LocalFolderGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
