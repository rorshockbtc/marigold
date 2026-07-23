"use client";

import React from 'react';
import Link from 'next/link';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export function Navbar() {
  return (
    <>
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md flex flex-wrap justify-between items-center gap-4 border-b-2 border-accent">
        <div>
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <h1 className="text-xl font-serif font-bold tracking-tight text-white flex items-center gap-2.5">
              <MarigoldIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
              <span>Marigold Insights</span>
            </h1>
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider pl-8">
              Local-Compute Civic Analytics
            </p>
          </Link>
        </div>

        <nav className="flex flex-wrap gap-4 items-center">
          <Link href="/anniversary" className="text-sm font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm">🎆 250th Celebration</Link>
          <Link href="/perspectives" className="text-sm font-bold text-indigo-300 hover:text-white underline decoration-dotted transition-colors">🌐 Worldviews FAQ</Link>
          <Link href="/sandbox" className="text-sm font-bold text-amber-400 hover:underline">Public Sandbox</Link>
          <Link href="/registry" className="text-sm font-medium hover:text-amber-400 transition-colors">State Registry</Link>
          <Link href="/store" className="text-sm font-medium hover:text-amber-400 transition-colors">Audit Checklists</Link>
          <Link href="/compliance" className="text-sm font-medium text-sky-400 hover:underline">FEMA Compliance</Link>
          <Link href="/roadmap" className="text-sm font-medium text-emerald-400 hover:underline">Roadmap</Link>
          <Link href="/deploy" className="text-sm font-medium hover:text-amber-400 transition-colors">Bring to Your State</Link>
          
          <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button className="text-xs font-bold text-slate-200 hover:text-white px-3 py-1.5 rounded transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="bg-accent hover:bg-amber-600 text-white font-bold px-4 py-2 text-xs rounded-md shadow transition-all">
                  Get Started →
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link 
                href="/dashboard"
                className="bg-accent hover:bg-amber-600 text-white font-bold px-4 py-2 text-xs rounded-md shadow transition-all flex items-center gap-2"
              >
                <span>Launch Workspace</span>
                <span>→</span>
              </Link>
              <UserButton />
            </Show>
          </div>
        </nav>
      </header>

      {/* Persistent Disclaimer Banner */}
      <div className="bg-slate-100 border-b border-border text-slate-700 px-6 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 max-w-6xl mx-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          <span>
            <strong className="font-bold text-slate-900">Architecture Notice:</strong> This execution engine processes all civic records 100% locally inside client memory. Zero citizen files are ever uploaded or transmitted.
          </span>
        </div>
      </div>
    </>
  );
}
