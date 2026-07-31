"use client";

import React, { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import MariRightPanel from "@/components/MariRightPanel";
import { AuditDataPanel } from "@/components/AuditDataPanel";
import { useWorkspace } from "@/lib/workspace/WorkspaceContext";

interface ThreePaneLayoutProps {
  children: ReactNode;
}

import { usePathname } from 'next/navigation';

export default function ThreePaneLayout({ children }: ThreePaneLayoutProps) {
  const { isSideSheetOpen } = useWorkspace();
  const pathname = usePathname();
  
  const isInsights = pathname?.startsWith('/insights');

  return (
    <div className="fixed inset-0 flex bg-surface overflow-hidden font-sans">
      {/* Left Navigation Pane */}
      <div className="flex-shrink-0 border-r border-border-soft h-full z-20">
        <AppSidebar />
      </div>

      {/* Center Work Surface */}
      <div className={`flex-1 h-full min-h-0 relative z-10 ${isInsights ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <main className={`mx-auto ${isInsights ? 'h-full min-h-0' : 'min-h-full max-w-7xl p-8 pb-24'}`}>
          {children}
        </main>
      </div>

      {/* Persistent Record Detail Side Sheet */}
      {isSideSheetOpen && <AuditDataPanel />}

      {/* Right Drawer (Mari) */}
      <div className="flex-shrink-0 h-full z-20">
        <MariRightPanel />
      </div>
    </div>
  );
}
