"use client";

import React from 'react';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { FlaskConical } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-700 py-10 px-6 border-t border-slate-200 mt-auto font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs md:text-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="font-serif font-bold text-slate-900 text-base flex items-center justify-center md:justify-start gap-2.5">
            <MarigoldIcon className="w-5 h-5 flex-shrink-0 drop-shadow-sm" />
            <span>Marigold Insights</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-slate-300">v1.2</span>
          </div>
          <p className="text-slate-600 max-w-md leading-relaxed">
            Politically neutral civic data traversal engineered for local memory execution and zero-PII cloud compliance.
          </p>
        </div>

        <div className="text-center md:text-right space-y-3">
          <p className="font-medium text-slate-700">
            Architected & Built by <strong className="text-slate-900 font-bold">Colon Hyphen Bracket, a Wyoming LLC</strong>.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2 font-bold text-slate-700">
            <a 
              href="https://colonhyphenbracket.pink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Corporate Site ↗
            </a>
            <a 
              href="https://hire.colonhyphenbracket.pink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Architect Portfolio ↗
            </a>
            <a 
              href="https://github.com/rorshockbtc/marigold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline transition-all"
            >
              GitHub Repository ↗
            </a>
            <a 
              href="/terms" 
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Terms of Service &amp; Liability
            </a>
            <a 
              href="/privacy" 
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Privacy Policy
            </a>
            <a 
              href="/cookies" 
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Cookie Policy
            </a>
            <a 
              href="/accessibility" 
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Section 508 / WCAG Accessibility
            </a>
            <a 
              href="/compliance" 
              className="text-slate-600 hover:text-emerald-700 hover:underline transition-all"
            >
              Statutory Compliance
            </a>
            <a 
              href="/sandbox" 
              className="text-amber-700 hover:text-amber-900 hover:underline transition-all flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>ACME Sandbox (Mock Data Demo)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
