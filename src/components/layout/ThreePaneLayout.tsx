"use client";

import React, { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import MariRightPanel from "@/components/MariRightPanel";

interface ThreePaneLayoutProps {
  children: ReactNode;
}

export default function ThreePaneLayout({ children }: ThreePaneLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden font-sans">
      {/* Left Navigation Pane */}
      <div className="flex-shrink-0 border-r border-border-soft h-full z-20">
        <AppSidebar />
      </div>

      {/* Center Work Surface */}
      <div className="flex-1 h-full overflow-y-auto relative z-10">
        <main className="min-h-full max-w-7xl mx-auto p-8 pb-24">
          {children}
        </main>
      </div>

      {/* Right Drawer (Mari) */}
      <div className="flex-shrink-0 h-full z-20">
        <MariRightPanel />
      </div>
    </div>
  );
}
