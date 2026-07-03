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
    <aside className="w-64 bg-[#F0ECE3] text-[#2D3142] flex flex-col h-screen fixed left-0 top-0 border-r border-[#E5E0D8] z-50 shadow-lg font-sans select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E5E0D8] space-y-1.5 bg-[#EAE5DC]/60">
        <div className="flex items-center gap-2.5">
          <MarigoldIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
          <span className="font-serif font-bold text-lg tracking-tight text-[#2D3142]">Marigold Insights</span>
        </div>
        <div className="inline-block bg-[#D96B27]/15 text-[#D96B27] font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#D96B27]/30">
          Citizen Volunteer Network
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-[#646A7A] font-bold">
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
                  ? 'bg-white text-[#2D3142] font-extrabold border border-[#E5E0D8] shadow-sm'
                  : 'text-[#4A5060] hover:text-[#2D3142] hover:bg-white/60 font-medium'
              }`}
            >
              <div className="text-sm flex items-center justify-between">
                <span>{item.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#D96B27]" />}
              </div>
              <div className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-[#D96B27] font-semibold' : 'text-[#7A8090] group-hover:text-[#5A6070]'}`}>
                {item.desc}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Controls & Return Link */}
      <div className="p-4 border-t border-[#E5E0D8] bg-[#EAE5DC]/60 space-y-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs text-[#4A5060] hover:text-[#D96B27] font-semibold px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
        >
          <span>← Back to Marketing Site</span>
        </Link>

        <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8] px-2">
          <div className="text-xs text-[#4A5060] font-medium truncate max-w-[140px]">
            Active Account
          </div>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
