"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import AppSidebar from '@/components/AppSidebar';
import MariRightPanel from '@/components/MariRightPanel';
import { GlobalMariButton } from '@/components/GlobalMariButton';
import { Shield } from 'lucide-react';
import ThreePaneLayout from '@/components/layout/ThreePaneLayout';

const WORKSPACE_ROUTES = [
  '/dashboard',
  '/explore',
  '/explore-groups',
  '/insights',
  '/onboarding',
  '/audit',
  '/playbooks',
  '/chat',
  '/perspectives',
  '/settings',
  '/advanced-stats',
  '/data-prep',
  '/feed',
];

export default function AppNavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const [isMariOpen, setIsMariOpen] = React.useState(false);
  const [isMariFullScreen, setIsMariFullScreen] = React.useState(false);
  const [mariPanelWidth, setMariPanelWidth] = React.useState(440);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    // Notify Mari of page change for JIT context
    window.dispatchEvent(new CustomEvent('mari-page-change', { detail: { pathname } }));
  }, [pathname]);

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
      <ThreePaneLayout>
        {children}
        {<GlobalMariButton />}
      </ThreePaneLayout>
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
