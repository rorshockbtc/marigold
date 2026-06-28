"use client";

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-primary text-slate-300 py-10 px-6 border-t-2 border-accent mt-auto font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs md:text-sm">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="font-serif font-bold text-white text-base flex items-center justify-center md:justify-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
            <span>Marigold Insights</span>
            <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded text-[11px] font-mono font-normal border border-slate-700">v1.2</span>
          </div>
          <p className="text-slate-400 max-w-md leading-relaxed">
            Politically neutral civic data traversal engineered for local memory execution and zero-PII cloud compliance.
          </p>
        </div>

        <div className="text-center md:text-right space-y-2">
          <p className="font-medium text-slate-300">
            Architected & Built by <strong className="text-white font-bold">Colon Hyphen Bracket, a Wyoming LLC</strong>.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-5 font-bold text-amber-400">
            <a 
              href="https://colonhyphenbracket.pink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline transition-all"
            >
              Corporate Site ↗
            </a>
            <a 
              href="https://hire.colonhyphenbracket.pink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline transition-all"
            >
              Architect Portfolio ↗
            </a>
            <a 
              href="https://github.com/rorshockbtc/marigold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline transition-all"
            >
              GitHub Repository ↗
            </a>
            <a 
              href="/compliance" 
              className="text-sky-300 hover:underline transition-all"
            >
              FEMA Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
