"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export function ComplianceContent() {
  const [activeTab, setActiveTab] = useState<'fema' | 'pii' | 'procurement'>('fema');

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 font-sans">
      <div className="border-b border-border pb-6">
        <div className="inline-block bg-primary text-white font-bold text-xs px-3.5 py-1 rounded uppercase tracking-wider mb-2.5 shadow-sm">
          Government Compliance &amp; Security
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-primary">FEMA HSGP &amp; Zero-PII Compliance Center</h1>
        <p className="text-muted-foreground mt-2 text-base max-w-3xl leading-relaxed">
          Authoritative architectural documentation explaining why Marigold Insights qualifies as an allowable election security expenditure while completely eliminating federal cloud residency liabilities and simplifying procurement across diverse jurisdictions.
        </p>
      </div>

      <div className="flex flex-wrap border-b border-border gap-6 text-sm font-bold">
        <button 
          onClick={() => setActiveTab('fema')}
          className={`pb-3.5 px-2 border-b-2 transition-all ${activeTab === 'fema' ? 'border-accent text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'}`}
        >
          FY26 FEMA HSGP Mandate (3% Spend)
        </button>
        <button 
          onClick={() => setActiveTab('pii')}
          className={`pb-3.5 px-2 border-b-2 transition-all ${activeTab === 'pii' ? 'border-accent text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'}`}
        >
          Zero-PII Local Architecture
        </button>
        <button 
          onClick={() => setActiveTab('procurement')}
          className={`pb-3.5 px-2 border-b-2 transition-all ${activeTab === 'procurement' ? 'border-accent text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'}`}
        >
          Flexible Procurement Models
        </button>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-border shadow-sm">
        {activeTab === 'fema' && (
          <div className="space-y-6 text-slate-700">
            <h2 className="text-2xl font-serif font-bold text-primary">FY26 Homeland Security Grant Program (HSGP) Alignment</h2>
            <p className="leading-relaxed">
              Under the Federal Emergency Management Agency (FEMA) FY 2026 Notice of Funding Opportunity (NOFO), State Administrative Agencies (SAAs) are strictly mandated to dedicate a minimum of <strong className="text-primary font-bold">3% of their total grant award</strong> toward enhancing Election Security as a designated National Priority Area.
            </p>
            
            <div className="bg-slate-50 border-l-4 border-amber-500 p-5 rounded-r-xl space-y-2 border border-slate-200">
              <strong className="block font-serif font-bold text-primary text-base">The 20% Withholding Penalty</strong>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If a state fails to demonstrate clear compliance with the 3% election security priority expenditure by the mandatory application deadline, FEMA will withhold 20% of the state&apos;s total HSGP grant allocation until compliance is verified. Securing allowable, high-impact election maintenance tools is essential for maintaining full state emergency funding.
              </p>
            </div>

            <h3 className="text-xl font-serif font-bold text-primary pt-3">Why Marigold Qualifies as an Allowable Expense:</h3>
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-primary">1. Systematic Voter List Maintenance</h4>
                <p className="text-slate-600 mt-1">Provides state and county officials with standardized, probabilistic record linkage algorithms to identify clerical typos, high-density occupancy anomalies, and out-of-state address mismatches without requiring manual spreadsheet sorting.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-primary">2. Cybersecurity Threat Prevention</h4>
                <p className="text-slate-600 mt-1">Strengthens local election infrastructure by empowering county authorities to detect data hygiene discrepancies and potential database corruption before official certification cycles.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-primary">3. Zero Exfiltration Compliance</h4>
                <p className="text-slate-600 mt-1">Alleviates federal data security concerns by ensuring local municipal records are processed entirely inside client machine memory, preventing unauthorized transmission to third-party vendors.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pii' && (
          <div className="space-y-6 text-slate-700">
            <h2 className="text-2xl font-serif font-bold text-primary">Understanding Zero-PII &amp; Local Architecture</h2>
            <p className="leading-relaxed text-base">
              To ensure full transparency for citizen volunteers and government directors alike, we designed Marigold Insights around a fundamental principle: <strong className="text-primary font-bold">citizen records should never leave their home jurisdiction</strong>.
            </p>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-serif font-bold text-primary text-lg">What is PII (Personally Identifiable Information)?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                PII refers to any data that can identify an individual citizen—such as full names, home street addresses, birth dates, and voting history. When organizations upload PII to remote cloud servers, they assume heavy legal liabilities, including potential data breaches, strict privacy laws, and complicated security audits.
              </p>
            </div>

            <h3 className="font-serif font-bold text-primary text-lg pt-2">How Our Technology Differences Protect You:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-300 space-y-2 shadow-sm">
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">THE REMOTE SERVER</span>
                <h4 className="font-serif font-bold text-primary text-lg">Stores Only Checklists</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our web server acts strictly as a public library of audit checklists. It stores mathematical formulas and verification rules (e.g., <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">&quot;Check if occupants &gt; 12&quot;</span>). It contains zero citizen data.
                </p>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white space-y-2 shadow-sm">
                <span className="font-mono font-bold text-xs bg-amber-400 text-slate-950 px-2.5 py-1 rounded">YOUR LOCAL COMPUTER</span>
                <h4 className="font-serif font-bold text-white text-lg">Does All the Work</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When you visit our website and select a file, your internet browser downloads our checklist instructions to your desk. Your personal computer inspects your spreadsheet directly in your computer&apos;s memory. Your sensitive files remain 100% private.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'procurement' && (
          <div className="space-y-6 text-slate-700">
            <h2 className="text-2xl font-serif font-bold text-primary">Flexible, Right-Sized Procurement Models</h2>
            <p className="leading-relaxed">
              Statutory government purchasing limits and municipal budgets are <strong className="text-primary font-bold">not the same nationwide</strong>—they vary widely across state and county lines. Because the core software is proprietarily architected by Colon Hyphen Bracket LLC yet built on standardized open protocols, implementation can be flexibly right-sized for any jurisdiction.
            </p>

            <div className="space-y-4 pt-2">
              <div className="border border-slate-200 p-6 rounded-xl bg-slate-50/50 space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h4 className="font-serif font-bold text-primary text-lg">1. Statewide FEMA / SAA Grant Initiatives</h4>
                  <span className="bg-primary text-white font-bold text-xs px-3 py-1 rounded">Comprehensive Tier</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Structured directly under federal FY26 HSGP 3% Election Security allocations. Delivers custom state header mapping, dedicated onboarding for county clerks, and centralized algorithm curation across all participating counties.
                </p>
              </div>

              <div className="border border-slate-200 p-6 rounded-xl bg-slate-50/50 space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h4 className="font-serif font-bold text-primary text-lg">2. County Sole Source &amp; Micro-Purchases</h4>
                  <span className="bg-emerald-800 text-white font-bold text-xs px-3 py-1 rounded">Immediate Deployment</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Billed directly to individual County Election Commissions beneath local statutory micro-purchase or Sole Source exemption thresholds. Delivers direct Tier-2 technical support and localized data prep assistance without requiring lengthy state-level board approval.
                </p>
              </div>

              <div className="border border-slate-200 p-6 rounded-xl bg-slate-50/50 space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h4 className="font-serif font-bold text-primary text-lg">3. Standalone Citizen &amp; Volunteer Access</h4>
                  <span className="bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1 rounded">Public Tier</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  For individual researchers or non-subsidized jurisdictions, core in-memory inspection tools remain accessible via our public sandbox. Note: For unsubsidized tiers below formal support thresholds, automated AI linkage features and custom schema support may be rate-limited or require municipal sponsorship.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg">Need a Custom Jurisdiction Quote?</h4>
                <p className="text-xs text-slate-300">We structure flexible contracting schedules tailored to your state&apos;s specific procurement laws.</p>
              </div>
              <Link href="/deploy" className="bg-accent hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-lg shadow whitespace-nowrap transition-all">
                Request Procurement Proposal →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
