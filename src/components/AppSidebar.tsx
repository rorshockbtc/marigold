"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { LayoutDashboard, Search, GitCompare, BookOpen, MessageSquare, Users, ChevronLeft, Menu, ArrowLeft } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', desc: 'Overview & verification hub', icon: LayoutDashboard },
  { label: 'Explore & Review', href: '/analysis', desc: 'Find anomalies & verify records', icon: Search },
  { label: 'Duplicate Finder', href: '/data-linkage', desc: 'Cross-check address & voter links', icon: GitCompare },
  { label: 'Audit Playbooks', href: '/playbooks', desc: 'Step-by-step verification guides', icon: BookOpen },
  { label: 'Ask AI Guide', href: '/chat', desc: 'Plain-English help & analysis', icon: MessageSquare },
  { label: 'Volunteer Team', href: '/settings/group', desc: 'Group roster & shared missions', icon: Users },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-state-change', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#F0ECE3] text-[#2D3142] flex flex-col h-screen fixed left-0 top-0 border-r border-[#E5E0D8] z-50 shadow-lg font-sans select-none transition-all duration-300`}>
      {/* Brand Header */}
      <div className={`p-4 border-b border-[#E5E0D8] flex items-center justify-between bg-[#EAE5DC]/60 ${isCollapsed ? 'flex-col gap-3' : ''}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <MarigoldIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
          {!isCollapsed && <span className="font-serif font-bold text-lg tracking-tight text-[#2D3142] whitespace-nowrap">Marigold Insights</span>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-[#E5E0D8] rounded-lg text-[#646A7A] hover:text-[#2D3142] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      {!isCollapsed && (
        <div className="px-6 py-1.5 bg-[#EAE5DC]/40 border-b border-[#E5E0D8]">
          <div className="inline-block bg-[#D96B27]/15 text-[#D96B27] font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#D96B27]/30">
            Citizen Volunteer Network
          </div>
        </div>
      )}

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
              title={isCollapsed ? `${item.label} - ${item.desc}` : undefined}
              className={`block px-3.5 py-3 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-white text-[#2D3142] font-extrabold border border-[#E5E0D8] shadow-sm'
                  : 'text-[#4A5060] hover:text-[#2D3142] hover:bg-white/60 font-medium'
              }`}
            >
              <div className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#D96B27]' : 'text-[#646A7A]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <span className="w-2 h-2 rounded-full bg-[#D96B27]" />}
              </div>
              {!isCollapsed && (
                <div className={`text-[11px] leading-tight mt-1 pl-6.5 ${isActive ? 'text-[#D96B27] font-semibold' : 'text-[#7A8090] group-hover:text-[#5A6070]'}`}>
                  {item.desc}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Controls & Return Link */}
      <div className="p-4 border-t border-[#E5E0D8] bg-[#EAE5DC]/60 space-y-4">
        <Link 
          href="/" 
          title={isCollapsed ? "Back to Marketing Site" : undefined}
          className="flex items-center justify-center gap-2 text-xs text-[#4A5060] hover:text-[#D96B27] font-semibold px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {!isCollapsed && <span>Back to Marketing Site</span>}
        </Link>

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pt-2 border-t border-[#E5E0D8] px-2`}>
          {!isCollapsed && (
            <div className="text-xs text-[#4A5060] font-medium truncate max-w-[140px]">
              Active Account
            </div>
          )}
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
