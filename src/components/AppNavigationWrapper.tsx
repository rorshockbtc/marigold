"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import AppSidebar from '@/components/AppSidebar';

const WORKSPACE_ROUTES = [
  '/dashboard',
  '/analysis',
  '/data-linkage',
  '/data-prep',
  '/playbooks',
  '/chat',
  '/settings',
  '/advanced-stats',
];

export default function AppNavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  const isWorkspace = WORKSPACE_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  if (isWorkspace) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <AppSidebar />
        <main className="flex-1 pl-64 overflow-x-hidden">
          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
