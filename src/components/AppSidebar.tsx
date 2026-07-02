"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', desc: 'Overview & verification hub' },
  { label: 'Explore & Review', href: '/analysis', desc: 'Find anomalies & verify records' },
  { label: 'Duplicate Finder', href: '/data-linkage', desc: 'Cross-check address & voter links' },
  { label: 'Audit Playbooks', href: '/playbooks', desc: 'Step-by-step verification guides' },
  { label: 'Ask AI Guide', href: '/chat', desc: 'Plain-English help & analysis' },
  { label: 'Volunteer Team', href: '/settings/group', desc: 'Group roster & shared missions' },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-50 shadow-2xl font-sans select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 space-y-1.5 bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <MarigoldIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
          <span className="font-serif font-bold text-lg tracking-tight text-white">Marigold Insights</span>
        </div>
        <div className="inline-block bg-slate-800 text-amber-400 font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-slate-700">
          Citizen Volunteer Network
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
          Workspace Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3.5 py-3 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-slate-800 text-white font-bold border-l-4 border-amber-500 pl-3 shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 font-medium'
              }`}
            >
              <div className="text-sm">{item.label}</div>
              <div className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-amber-300/80' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {item.desc}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Controls & Return Link */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <span>← Back to Marketing Site</span>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-2">
          <div className="text-xs text-slate-400 font-medium truncate max-w-[140px]">
            Active Account
          </div>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
