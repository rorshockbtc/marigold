"use client";

import React from 'react';
import Link from 'next/link';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { FlaskConical } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background text-foreground py-16 px-6 border-t border-border mt-auto font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-8">
        
        {/* Brand & Mission Statement */}
        <div className="space-y-4 md:w-1/3">
          <div className="font-serif font-bold text-foreground text-xl flex items-center gap-3">
            <MarigoldIcon className="w-6 h-6 flex-shrink-0 text-primary drop-shadow-sm" />
            <span>Marigold Insights</span>
          </div>
          <p className="text-secondary text-sm leading-relaxed max-w-sm">
            Politically neutral civic data traversal engineered for local memory execution and zero-PII cloud compliance.
          </p>
          <div className="pt-2">
            <span className="bg-muted text-secondary px-3 py-1 rounded-full text-xs font-mono font-bold border border-border-soft inline-block">
              Engine Version 1.2.0
            </span>
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:w-2/3 md:justify-items-end text-sm">
          
          {/* Column 1: Platform & Resources */}
          <div className="space-y-4 flex flex-col">
            <h4 className="font-bold text-foreground font-serif tracking-tight">Platform</h4>
            <Link href="/store" className="text-secondary hover:text-primary transition-colors">Audit Checklists</Link>
            <Link href="/registry" className="text-secondary hover:text-primary transition-colors">State Registry</Link>
            <Link href="/developers" className="text-secondary hover:text-primary transition-colors">Developer Docs</Link>
            <Link href="/roadmap" className="text-secondary hover:text-primary transition-colors">Technical Roadmap</Link>
            <Link 
              href="/sandbox" 
              className="text-accent hover:text-primary transition-colors flex items-center gap-1.5 font-bold mt-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Public Sandbox</span>
            </Link>
          </div>

          {/* Column 2: Legal & Compliance */}
          <div className="space-y-4 flex flex-col">
            <h4 className="font-bold text-foreground font-serif tracking-tight">Compliance</h4>
            <Link href="/compliance" className="text-secondary hover:text-primary transition-colors">FEMA Standards</Link>
            <Link href="/terms" className="text-secondary hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-secondary hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="text-secondary hover:text-primary transition-colors">Cookie Policy</Link>
            <Link href="/accessibility" className="text-secondary hover:text-primary transition-colors">Section 508 / WCAG</Link>
          </div>

          {/* Column 3: Corporate */}
          <div className="space-y-4 flex flex-col">
            <h4 className="font-bold text-foreground font-serif tracking-tight">Corporate</h4>
            <a 
              href="https://colonhyphenbracket.pink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              Colon Hyphen Bracket ↗
            </a>
            <a 
              href="https://hire.colonhyphenbracket.pink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              Architect Portfolio ↗
            </a>
            <a 
              href="https://github.com/rorshockbtc/marigold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              GitHub Source ↗
            </a>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border-soft flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary">
        <p>
          Architected &amp; Built by <strong className="text-foreground font-bold">Colon Hyphen Bracket, a Wyoming LLC</strong>.
        </p>
        <p>&copy; {new Date().getFullYear()} Marigold Insights. All rights reserved.</p>
      </div>
    </footer>
  );
}
