"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import AppSidebar from '@/components/AppSidebar';
import MariRightPanel from '@/components/MariRightPanel';

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

  React.useEffect(() => {
    const handlePanelChange = (e: any) => {
      if (e && e.detail && typeof e.detail.isOpen === 'boolean') {
        setIsMariOpen(e.detail.isOpen);
      }
    };
    window.addEventListener('mari-panel-state-change', handlePanelChange);
    return () => window.removeEventListener('mari-panel-state-change', handlePanelChange);
  }, []);

  const isWorkspace = WORKSPACE_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  if (isWorkspace) {
    return (
      <div className="flex min-h-screen bg-[#FAF8F5] font-sans">
        <AppSidebar />
        <MariRightPanel />
        <main className={`flex-1 pl-64 transition-all duration-300 overflow-x-hidden flex flex-col justify-between min-h-screen ${isMariOpen ? 'pr-[430px] xl:pr-[460px]' : ''}`}>
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1">
            {children}
          </div>
          <footer className="border-t border-[#E5E0D8] bg-white py-4 px-6 md:px-10 text-xs text-[#646A7A] flex flex-col sm:flex-row justify-between items-center gap-3 mt-auto">
            <div className="flex flex-wrap items-center gap-4 font-bold text-[#2D3142]">
              <a href="/terms" className="hover:text-[#D96B27] transition-colors">Terms of Service &amp; Statutory Liability</a>
              <span>•</span>
              <a href="/privacy" className="hover:text-[#D96B27] transition-colors">Zero-Knowledge Privacy Policy</a>
              <span>•</span>
              <a href="/compliance" className="hover:text-[#D96B27] transition-colors">Security &amp; Compliance</a>
            </div>
            <div className="font-mono text-[11px] text-[#D96B27] font-bold">
              🔒 100% Local Browser Memory Execution • Zero Cloud PII
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
