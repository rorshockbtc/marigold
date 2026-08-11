"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { GroupSwitcherModal } from '@/components/GroupSwitcherModal';
import { LocalFolderStatusModal } from '@/components/LocalFolderStatusModal';
import { Folder, LayoutDashboard, Search, GitCompare, BookOpen, MessageSquare, Users, ChevronLeft, Menu, ArrowLeft, LineChart, Terminal, BarChart, Activity } from 'lucide-react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Data Insights', href: '/insights', icon: BarChart },
  { label: 'Explore & Review', href: '/explore', icon: GitCompare },
  { label: 'Guided Playbooks', href: '/audit', icon: BookOpen },
  { label: 'Group Feed', href: '/feed', icon: Activity },
  { label: 'Advanced Stats', href: '/advanced-stats', icon: LineChart },
  { label: 'Volunteer Team', href: '/settings/group', icon: Users },
  { label: 'Developer Docs', href: '/developers', icon: Terminal },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);
  const [activeGroup, setActiveGroup] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)";
    }
    return "State of Roosevelt (Demo)";
  });
  const [isSwitcherOpen, setIsSwitcherOpen] = React.useState(false);

  const [isDataLoaded, setIsDataLoaded] = React.useState(false);

  const { switchGroup } = useWorkspace();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleGroupChange = (e: Event) => {
        const customEvent = e as CustomEvent<{ group?: string }>;
        if (customEvent && customEvent.detail && customEvent.detail.group) {
          setActiveGroup(customEvent.detail.group);
        } else {
          setActiveGroup(localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)");
        }
        setIsDataLoaded(localStorage.getItem("marigold_file_connected") === "true");
      };
      
      // Initialize on mount
      setIsDataLoaded(localStorage.getItem("marigold_file_connected") === "true");
      
      window.addEventListener('marigold-group-change', handleGroupChange);
      return () => window.removeEventListener('marigold-group-change', handleGroupChange);
    }
  }, []);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-state-change', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  const handleSwitchGroup = (targetGroup: string) => {
    setIsSwitcherOpen(false);
    switchGroup(targetGroup);
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-muted text-foreground flex flex-col h-screen border-r border-border z-50 shadow-lg font-sans select-none transition-all duration-300`}>
      {/* Brand Header */}
      <div className={`p-4 border-b border-border flex items-center justify-between bg-[#EAE5DC]/60 ${isCollapsed ? 'flex-col gap-3' : ''}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <MarigoldIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
          {!isCollapsed && <span className="font-serif font-bold text-lg tracking-tight text-foreground whitespace-nowrap">Marigold Insights</span>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-[#E5E0D8] rounded-lg text-[#646A7A] hover:text-foreground transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Universal Active Jurisdiction & Demo Mode Switcher */}
      <div className="p-3 border-b border-border bg-[#FAF8F5]/90 relative">
        <button
          type="button"
          onClick={() => !isCollapsed && setIsSwitcherOpen(!isSwitcherOpen)}
          title={isCollapsed ? `Active: ${activeGroup}` : "Switch Active Group / Demo Mode"}
          className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl border border-border bg-white hover:border-[#D96B27]/60 shadow-2xs transition-all text-left ${isCollapsed ? 'justify-center p-1.5' : ''}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm shrink-0">{activeGroup === "State of Roosevelt (Demo)" ? "🌲" : "👑"}</span>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#D96B27] font-extrabold leading-none">
                  {activeGroup === "State of Roosevelt (Demo)" ? "Demo Workspace" : "Jurisdiction Group"}
                </div>
                <div className="text-xs font-bold text-foreground truncate pt-0.5">
                  {activeGroup || "State of Roosevelt (Demo)"}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && <span className="text-[10px] text-[#646A7A] shrink-0">▼</span>}
        </button>

        {/* Dropdown Menu */}
        {isSwitcherOpen && !isCollapsed && (
          <div className="absolute left-3 right-3 top-16 z-50 bg-white border-2 border-[#D96B27] rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#D96B27] font-black px-2 py-1">
              Switch Jurisdiction or Mode:
            </div>
            <button
              type="button"
              onClick={() => handleSwitchGroup("State of Roosevelt (Demo)")}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${activeGroup === "State of Roosevelt (Demo)" ? "bg-accent text-white" : "hover:bg-[#FAF8F5] text-foreground"}`}
            >
              <span>🌲 State of Roosevelt (Demo)</span>
              {activeGroup === "State of Roosevelt (Demo)" && <span>✓</span>}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGroup("ACME Civic Data Sandbox (Demo Environment)")}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${activeGroup === "ACME Civic Data Sandbox (Demo Environment)" ? "bg-accent text-white" : "hover:bg-[#FAF8F5] text-foreground"}`}
            >
              <span>🧪 ACME Civic Data Sandbox</span>
              {activeGroup === "ACME Civic Data Sandbox (Demo Environment)" && <span>✓</span>}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGroup("Mississippi Fair Elections")}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${activeGroup === "Mississippi Fair Elections" ? "bg-accent text-white" : "hover:bg-[#FAF8F5] text-foreground"}`}
            >
              <span>👑 Mississippi Fair Elections</span>
              {activeGroup === "Mississippi Fair Elections" && <span>✓</span>}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGroup("Independent Audit Workspace")}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${activeGroup === "Independent Audit Workspace" ? "bg-accent text-white" : "hover:bg-[#FAF8F5] text-foreground"}`}
            >
              <span>🛡️ Independent Workspace</span>
              {activeGroup === "Independent Audit Workspace" && <span>✓</span>}
            </button>
            <div className="border-t border-border pt-1 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSwitcherOpen(false);
                  setIsGroupModalOpen(true);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#D96B27] hover:bg-[#FAF8F5] transition-colors"
              >
                ➕ Custom Organization...
              </button>
            </div>
          </div>
        )}
      </div>

      <GroupSwitcherModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSwitchGroup={handleSwitchGroup}
        currentGroup={activeGroup}
      />

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-[#646A7A] font-bold">
            Workspace Modules
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`block px-3.5 py-3 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-white text-foreground font-extrabold border border-border shadow-sm'
                  : 'text-[#4A5060] hover:text-foreground hover:bg-white/60 font-medium'
              }`}
            >
              <div className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#D96B27]' : 'text-[#646A7A]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <span className="w-2 h-2 rounded-full bg-accent" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Controls & Local Folder Status */}
      <div className="p-4 border-t border-border bg-[#EAE5DC]/60 space-y-2">
        <button
          type="button"
          onClick={() => setIsFolderModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 py-2 px-3 rounded-xl shadow-sm transition-all"
        >
          <Folder className="w-4 h-4 text-primary" />
          {!isCollapsed && <span>📁 Marigold Local Folder</span>}
        </button>

        <Link 
          href="/" 
          title={isCollapsed ? "Back to Marketing Site" : undefined}
          className="flex items-center justify-center gap-2 text-xs text-[#4A5060] hover:text-[#D96B27] font-semibold px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {!isCollapsed && <span>Back to Marketing Site</span>}
        </Link>
      </div>

      <LocalFolderStatusModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </aside>
  );
}
