"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import AppSidebar from '@/components/AppSidebar';
import MariRightPanel from '@/components/MariRightPanel';
import { Shield } from 'lucide-react';

const WORKSPACE_ROUTES = [
  '/dashboard',
  '/analysis',
  '/data-linkage',
  '/data-prep',
  '/playbooks',
  '/chat',
  '/perspectives',
  '/settings',
  '/advanced-stats',
];

export default function AppNavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const [isMariOpen, setIsMariOpen] = React.useState(false);
  const [isMariFullScreen, setIsMariFullScreen] = React.useState(false);
  const [mariPanelWidth, setMariPanelWidth] = React.useState(440);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    const handlePanelChange = (e: any) => {
      if (e && e.detail) {
        if (typeof e.detail.isOpen === 'boolean') setIsMariOpen(e.detail.isOpen);
        if (typeof e.detail.isFullScreen === 'boolean') setIsMariFullScreen(e.detail.isFullScreen);
        if (typeof e.detail.panelWidth === 'number') setMariPanelWidth(e.detail.panelWidth);
      }
    };
    const handleSidebarChange = (e: any) => {
      if (e && e.detail && typeof e.detail.isCollapsed === 'boolean') {
        setIsSidebarCollapsed(e.detail.isCollapsed);
      }
    };
    window.addEventListener('mari-panel-state-change', handlePanelChange);
    window.addEventListener('sidebar-state-change', handleSidebarChange);
    return () => {
      window.removeEventListener('mari-panel-state-change', handlePanelChange);
      window.removeEventListener('sidebar-state-change', handleSidebarChange);
    };
  }, []);

  const isWorkspace = WORKSPACE_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  if (isWorkspace) {
    return (
      <div className="flex min-h-screen bg-[#FAF8F5] font-sans">
        <AppSidebar />
        <MariRightPanel />
        <main 
          style={{ paddingRight: isMariOpen && !isMariFullScreen ? `${mariPanelWidth}px` : undefined }}
          className={`flex-1 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'} transition-all duration-300 overflow-x-hidden flex flex-col justify-between min-h-screen`}
        >
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1">
            {children}
          </div>
          <footer className="border-t border-border bg-white py-4 px-6 md:px-10 text-xs text-[#646A7A] flex flex-col sm:flex-row justify-between items-center gap-3 mt-auto">
            <div className="flex flex-wrap items-center gap-4 font-bold text-foreground">
              <a href="/terms" className="hover:text-[#D96B27] transition-colors">Terms of Service &amp; Statutory Liability</a>
              <span>•</span>
              <a href="/privacy" className="hover:text-[#D96B27] transition-colors">Zero-Knowledge Privacy Policy</a>
              <span>•</span>
              <a href="/compliance" className="hover:text-[#D96B27] transition-colors">Security &amp; Compliance</a>
            </div>
            <div className="font-mono text-[11px] text-[#D96B27] font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Local Browser Memory Execution • Zero Cloud PII</span>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className={`flex-1 ${pathname === '/' ? '' : 'container mx-auto p-4 md:p-8'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
