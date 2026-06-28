"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export default function PerspectivesGuide() {
  const [activeLens, setActiveLens] = useState<'all' | 'security' | 'governance' | 'access'>('all');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header / Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
            <MarigoldIcon className="w-96 h-96 text-amber-400" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>🌐 Public Education & FAQ Guide</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              The Observer & The Data: Exploring Worldviews Through Voter Rolls
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Data is effectively dead until it is observed—and those who observe inevitably bias the output via their specific inquiries. At Marigold Insights, we treat public voter rolls not as a weapon for partisan attack, but as a mirror reflecting different values across the American political spectrum.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/sandbox" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all">
                Try Public Sandbox →
              </Link>
              <Link href="/playbooks" className="bg-slate-800/80 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl border border-slate-600 transition-all">
                Explore Mission Playbooks
              </Link>
            </div>
          </div>
        </div>

        {/* Lens Selector Navigation */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Select an Ideological Inquiry Lens</h2>
            <p className="text-slate-600 text-sm mt-1">
              Filter the questions below to see how different groups approach election integrity and why every perspective adds value to overall system health.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveLens('all')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeLens === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              🌐 All Perspectives (360° View)
            </button>
            <button
              onClick={() => setActiveLens('security')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeLens === 'security' ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'}`}
            >
              🔴 Security & Verification (Conservative)
            </button>
            <button
              onClick={() => setActiveLens('governance')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeLens === 'governance' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'}`}
            >
              🟣 Administrative Efficiency (Moderate)
            </button>
            <button
              onClick={() => setActiveLens('access')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeLens === 'access' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'}`}
            >
              🔵 Rights & Enfranchisement (Progressive)
            </button>
          </div>
        </div>

        {/* The Worldview Lenses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Conservative Lens */}
          {(activeLens === 'all' || activeLens === 'security') && (
            <div className="bg-white rounded-2xl border-2 border-rose-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Security Priority</span>
                    <h3 className="text-xl font-bold text-slate-900">The Verification Lens</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Focuses on preserving confidence by ensuring strict compliance with physical residence mandates and eliminating stale records before ballots are mailed.
                </p>
                <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <strong className="text-slate-900 block mb-1">Key Inquiry: Commercial P.O. Boxes</strong>
                    <span className="text-slate-600 text-xs">Are voters registered at commercial shipping centers (like UPS Stores) disguised as apartment suites?</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <strong className="text-slate-900 block mb-1">Key Inquiry: Registration Surges</strong>
                    <span className="text-slate-600 text-xs">Do single-day registration spikes exceed natural population growth models?</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                <strong>Primary Sources:</strong> Heritage Foundation Election Standards, Public Interest Legal Foundation (PILF), USPS NCOA Registry.
              </div>
            </div>
          )}

          {/* Moderate Lens */}
          {(activeLens === 'all' || activeLens === 'governance') && (
            <div className="bg-white rounded-2xl border-2 border-purple-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Governance Priority</span>
                    <h3 className="text-xl font-bold text-slate-900">The Institutional Lens</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Focuses on administrative excellence, seamless county-to-county data transfers, and resolving bureaucratic traps without punitive friction.
                </p>
                <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <strong className="text-slate-900 block mb-1">Key Inquiry: Clean Intra-State Transfers</strong>
                    <span className="text-slate-600 text-xs">When a citizen moves from Hinds to Madison county, is the old record merged cleanly rather than challenged?</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <strong className="text-slate-900 block mb-1">Key Inquiry: Administrative Suspense Traps</strong>
                    <span className="text-slate-600 text-xs">Are lawful voter registration applications stuck in pending processing bottlenecks for &gt;30 days?</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                <strong>Primary Sources:</strong> Election Assistance Commission (EAC) Best Practices, State Auditor Data Benchmarks, NCOA Crosscheck.
              </div>
            </div>
          )}

          {/* Progressive Lens */}
          {(activeLens === 'all' || activeLens === 'access') && (
            <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Civil Rights Priority</span>
                    <h3 className="text-xl font-bold text-slate-900">The Enfranchisement Lens</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Focuses on protecting eligible voters from erroneous purges, ensuring equal polling place access, and safeguarding student or mobile populations.
                </p>
                <div className="space-y-3 pt-2 border-t border-slate-100 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <strong className="text-slate-900 block mb-1">Key Inquiry: Wrongful "Silent Purges"</strong>
                    <span className="text-slate-600 text-xs">Are active voters who cast ballots in recent midterms abruptly flagged as "Inactive" without signed requests?</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <strong className="text-slate-900 block mb-1">Key Inquiry: Precinct Overcrowding</strong>
                    <span className="text-slate-600 text-xs">Do certain precincts exceed 3,000 voters per location, creating disenfranchising 6-hour line wait times?</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                <strong>Primary Sources:</strong> Brennan Center for Justice Wait Time Studies, ACLU / Fair Fight Student Guides, League of Women Voters.
              </div>
            </div>
          )}

        </div>

        {/* Plain English Statistical Dictionary for Non-Quants */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>🧮 Plain English Math Translator</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white">Statistical Models Explained for Everyone</h2>
            <p className="text-slate-300 text-base">
              You do not need a PhD in statistics to audit your local government. Here is how our automated math models work in simple, everyday language.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Z-Score */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-400">1. The Bell Curve Alarm (Z-Scores)</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">Standard Deviation</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Imagine finding the average number of people living in a single household across your town (usually around 2 or 3). If an address has 15 voters registered to it, the **Z-Score** measures how many "steps" away from normal that house is. Anything over 3 steps is flagged as a statistical alarm requiring human review.
              </p>
            </div>

            {/* IQR Quantiles */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-400">2. The Tukey Fence (IQR Quantiles)</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">Robust Outliers</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sometimes a town has a massive college dorm or nursing home that skews the average for everyone else. **Interquartile Range (IQR)** lines up all addresses from smallest to largest, chops off the bottom 25% and top 25%, and builds a mathematical "fence" around typical homes. This prevents false alarms on normal apartments.
              </p>
            </div>

            {/* Poisson Distribution */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-sky-400">3. Lightning Strike Odds (Poisson Math)</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">Rare Event Probability</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                If your rural county typically sees 3 new voter registrations on a normal Tuesday, what are the exact odds that 450 registrations arrive on a single afternoon? **Poisson Math** calculates rare event probabilities, helping auditors distinguish between legitimate registration drives and computer file upload glitches.
              </p>
            </div>

            {/* CUSUM Shift Detection */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-purple-400">4. The Shift Detector (CUSUM)</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">Time-Series Change</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Instead of looking at just one day, **CUSUM** tracks cumulative trends over months. If a county election clerk suddenly stops processing address updates or alters their routine maintenance procedures, this model pinpoints the exact week the historical trend line broke.
              </p>
            </div>

          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-amber-500 text-slate-950 p-8 rounded-3xl text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif">Ready to Observe Your Local Data?</h2>
          <p className="text-slate-900 max-w-xl mx-auto text-sm sm:text-base">
            Choose your lens, run pre-configured audits, and contribute to non-partisan election transparency today.
          </p>
          <div className="pt-2">
            <Link href="/playbooks" className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-8 py-3.5 rounded-xl inline-block shadow-lg transition-all">
              Launch Mission Playbooks →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
