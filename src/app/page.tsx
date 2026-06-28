"use client";

import React from "react";
import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <div className="space-y-20 pb-24 font-sans">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-20 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl px-6 relative overflow-hidden">
        {/* Background Landscape Photo ("America the Beautiful", No People) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: 'url("/hero-landscape.png"), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap justify-center gap-3 mb-2">
          <span className="bg-amber-400/20 text-amber-300 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-400/30 shadow-sm">
            FY26 FEMA HSGP Compliant
          </span>
          <span className="bg-slate-800/80 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-slate-600 shadow-sm">
            Zero Cloud PII Exposure
          </span>
          <a 
            href="https://github.com/rorshockbtc/marigold" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider hover:bg-slate-200 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>GitHub Open Source ↗</span>
          </a>
        </div>

        <h1 className="relative z-10 text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-md">
          Non-Partisan Civic Data Exploration
        </h1>
        
        <p className="relative z-10 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal drop-shadow">
          Making local public record review straightforward, safe, and transparent. Verify civic data directly on your own personal computer without programming expertise, expensive server costs, or transmitting private records across the internet.
        </p>

        {/* Buttons ensured to be uniform height and alignment */}
        <div className="relative z-10 pt-4 flex flex-wrap justify-center items-center gap-4">
          <Link href="/sandbox" className="h-12 flex items-center justify-center px-8 text-base font-bold rounded-xl shadow-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all transform hover:-translate-y-0.5 min-w-[200px]">
            Try Public Sandbox
          </Link>
          <Link href="/store" className="h-12 flex items-center justify-center px-8 text-base font-bold rounded-xl shadow-lg bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 transition-all min-w-[200px]">
            Browse Audit Checklists
          </Link>
          <Link href="/registry" className="h-12 flex items-center justify-center px-8 text-base font-bold rounded-xl shadow-sm bg-slate-900/80 text-slate-200 border border-slate-700 hover:bg-slate-800 transition-all min-w-[200px]">
            State Registry
          </Link>
        </div>

        <div className="relative z-10 pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-wider border-t border-slate-800 max-w-2xl mx-auto mt-8">
          <span>100% Client-Side Memory</span>
          <span>•</span>
          <span>No PII Uploads</span>
          <span>•</span>
          <span>Wyoming LLC Built</span>
        </div>
      </section>

      {/* The Three Major Stakeholder Groups */}
      <section className="space-y-10 max-w-6xl mx-auto px-2">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary">Engineered for Every Civic Stakeholder</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Click any overview card below to read a clear, non-technical walkthrough tailored specifically for your role.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Group 1: State Administrative Agencies */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-400 transition-all">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-md border border-sky-200">
                State Level
              </span>
              <h3 className="text-2xl font-serif font-bold text-primary">State Administrative Agencies (SAAs)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Safely fulfill mandatory **FEMA election security spend requirements** with zero embarrassing audit surprises. Professional verification structured as a flat-rate micro-purchase ($1,500/yr) that processes data inside local RAM without cloud risk.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link href="/solutions/state-agencies" className="text-sm font-bold text-sky-700 hover:underline inline-flex items-center gap-1">
                Read State Guide &amp; Procurement Details →
              </Link>
            </div>
          </div>

          {/* Group 2: Citizens & Volunteers */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-400 transition-all">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-md border border-amber-200">
                Citizen Level
              </span>
              <h3 className="text-2xl font-serif font-bold text-primary">Citizen Auditors &amp; Volunteers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Written in plain, everyday language. You don&apos;t need to be a programmer to help maintain accurate community records. Think of Marigold as a smart magnifying glass that runs right on your computer desk with total privacy.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link href="/solutions/citizens" className="text-sm font-bold text-amber-700 hover:underline inline-flex items-center gap-1">
                Read Plain-Language Citizen Guide →
              </Link>
            </div>
          </div>

          {/* Group 3: Civic Lead Groups */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-400 transition-all">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-200">
                Organization Level
              </span>
              <h3 className="text-2xl font-serif font-bold text-primary">Civic Integrity Networks</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unify your volunteer chapters across county lines. Share effective search queries and standardized review checklists exclusively with your trusted network—ensuring strategic alignment without broadcasting public data.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <Link href="/solutions/organizations" className="text-sm font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                Read Coalition Collaboration Guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (The In-Memory Engine) */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl space-y-10 max-w-6xl mx-auto">
        <div className="text-center space-y-3">
          <span className="bg-slate-800 text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded uppercase tracking-wider border border-slate-700">
            The Technological Breakthrough
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">Inverting Traditional Cloud Architecture</h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Traditional platforms force counties to upload sensitive citizen records to centralized cloud servers. Marigold brings the algorithms down to the local file instead.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-2">
          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Step 01</div>
            <h4 className="font-serif font-bold text-white text-xl">Download Checklist</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse the public library and download a standardized text file (e.g., National Change of Address verification filter) directly to your computer.
            </p>
          </div>

          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Step 02</div>
            <h4 className="font-serif font-bold text-white text-xl">Select Local File</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Open your jurisdiction&apos;s official spreadsheet on your computer. The browser maps columns securely in local computer RAM without internet upload.
            </p>
          </div>

          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-700 space-y-3">
            <div className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Step 03</div>
            <h4 className="font-serif font-bold text-white text-xl">Instant Audit Results</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Client-side memory processes up to 100,000 rows per second, isolating clerical formatting errors and formatting clean verification reports instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-8 max-w-6xl mx-auto px-2">
        <h2 className="text-3xl font-serif font-bold text-primary text-center">Explore Core System Modules</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Link href="/store" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-accent uppercase tracking-wider font-mono">Shared Library</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-accent transition-colors">National Audit Checklists</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Crowdsourced verification parameters shareable across state lines.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>

          <Link href="/data-linkage" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">Statistical Matching</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-emerald-700 transition-colors">Smart Duplicate Finder</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Test our probabilistic fuzzy linkage simulator directly in your browser.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>

          <Link href="/registry" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider font-mono">50-State Index</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-sky-700 transition-colors">State Acquisition Registry</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">View formatting parameters and cost structures nationwide.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>

          <Link href="/roadmap" className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider font-mono">Civic Integration</span>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-purple-700 transition-colors">Technical Roadmap</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Cross-agency integrations and federal grant alignment milestones.</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform font-light text-slate-400">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
