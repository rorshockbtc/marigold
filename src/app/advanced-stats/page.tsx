"use client";

import React, { useState, useMemo } from 'react';
import { Tooltip } from '@/components/Tooltip';
import { fellegiSunterScore } from '@/lib/linkage/fellegi-sunter';
import { runLinkageBenchmark } from '@/lib/linkage/benchmark-suite';
import { PageHeader } from '@/components/PageHeader';
import { Play, BookOpen, Save, Smile } from 'lucide-react';

export default function AdvancedStatsPage() {
  // Record A state
  const [firstA, setFirstA] = useState("JOHN");
  const [lastA, setLastA] = useState("DOE");
  const [dobA, setDobA] = useState("1975-04-12");
  const [addrA, setAddrA] = useState("123 MAIN ST");
  const [zipA, setZipA] = useState("39201");

  // Record B state
  const [firstB, setFirstB] = useState("JON");
  const [lastB, setLastB] = useState("DOE");
  const [dobB, setDobB] = useState("1975-04-12");
  const [addrB, setAddrB] = useState("123 MAIN STREET");
  const [zipB, setZipB] = useState("39201");

  // Calculate live Fellegi-Sunter result
  const result = useMemo(() => {
    return fellegiSunterScore(
      { first_name: firstA, last_name: lastA, dob: dobA, address: addrA, zip: zipA },
      { first_name: firstB, last_name: lastB, dob: dobB, address: addrB, zip: zipB }
    );
  }, [firstA, lastA, dobA, addrA, zipA, firstB, lastB, dobB, addrB, zipB]);

  // Execute canonical 1,000-pair benchmark summary once on load
  const benchmark = useMemo(() => {
    return runLinkageBenchmark();
  }, []);

  const loadExample = (type: 'typo' | 'ncoa' | 'familial') => {
    if (type === 'typo') {
      setFirstA("ELIZABETH"); setLastA("ZUKOWSKI"); setDobA("1968-11-20"); setAddrA("450 OAK AVE"); setZipA("39501");
      setFirstB("BETH"); setLastB("ZUKOWSK"); setDobB("1968-11-20"); setAddrB("450 OAK AVENUE"); setZipB("39501");
    } else if (type === 'ncoa') {
      setFirstA("ROBERT"); setLastA("GARCIA"); setDobA("1982-06-15"); setAddrA("880 PINE LN"); setZipA("39205");
      setFirstB("ROB"); setLastB("GARCIA"); setDobB("1982-06-15"); setAddrB("1400 LAKE RD"); setZipB("39401");
    } else if (type === 'familial') {
      setFirstA("JOHN"); setLastA("DOE SR"); setDobA("1952-03-10"); setAddrA("500 CEDAR CT"); setZipA("38601");
      setFirstB("JOHN"); setLastB("DOE JR"); setDobB("1984-08-15"); setAddrB("500 CEDAR CT"); setZipB("38601");
    }
  };

  let confidenceLabel = "🔴 Low Match Confidence (Distinct Individuals)";
  let badgeClass = "bg-red-50 text-red-900 border-red-300";
  if (result.verdict === 'MATCH_HIGH') {
    confidenceLabel = "🟢 High Match Confidence (Probabilistic Duplicate)";
    badgeClass = "bg-emerald-50 text-emerald-950 border-emerald-300";
  } else if (result.verdict === 'REVIEW_MODERATE') {
    confidenceLabel = "🟡 Moderate Confidence (Requires Manual Review)";
    badgeClass = "bg-amber-50 text-amber-950 border-amber-300";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 px-4">
      <PageHeader
        title="Playbook Builder / Linkage Lab"
        subtitle="Voter rolls are notoriously messy. Simple exact-match searches miss thousands of duplicates because of typos, missing initials, or address variations. This lab demonstrates how Marigold uses statistical models (probabilistic matching) to find hidden duplicates and anomalies that evade basic spreadsheets—without generating false accusations."
        badge={
          <div className="inline-block bg-[#E3EEDC] text-[#528B65] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            🧪 Phase 2 Technology Preview
          </div>
        }
      />

      {/* Live Benchmark Badge Banner */}
      <div className="bg-text-header text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#528B65] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E3EEDC] font-bold">
              Canonical 1,000-Pair Ground Truth Benchmark
            </span>
          </div>
          <h2 className="text-xl font-serif tracking-tight">
            Empirically Validated Zero-Cloud Accuracy
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Executed in {benchmark.executionTimeMs}ms across 1,000 synthetic test pairs (typographical noise, NCOA relocations, familial collisions).
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-center font-mono">
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
            <div className="text-[10px] text-slate-300">Precision</div>
            <div className="text-lg font-bold text-[#E3EEDC]">{benchmark.precision}%</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
            <div className="text-[10px] text-slate-300">Recall</div>
            <div className="text-lg font-bold text-[#E3EEDC]">{benchmark.recall}%</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
            <div className="text-[10px] text-slate-300">F1-Score</div>
            <div className="text-lg font-bold text-white">{benchmark.f1Score}%</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
            <div className="text-[10px] text-slate-300">False Positives</div>
            <div className="text-lg font-bold text-[#F9E6E9]">{benchmark.falsePositiveRate}%</div>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox */}
      <div className="bg-white rounded-2xl border border-border-soft p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-4">
          <div>
            <h2 className="text-xl font-serif text-text-header flex items-center gap-2">
              🧪 Interactive Linkage Simulator
            </h2>
            <p className="text-xs text-text-body mt-1">
              Modify demographic attributes below to see how log-odds weights respond to typographical noise and generational traps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button 
              onClick={() => loadExample('typo')}
              className="px-3 py-1.5 bg-surface hover:bg-[#EAE5DC] text-text-header rounded-lg font-semibold border border-border-soft transition-colors"
            >
              ⚡ Typo Example
            </button>
            <button 
              onClick={() => loadExample('ncoa')}
              className="px-3 py-1.5 bg-surface hover:bg-[#EAE5DC] text-text-header rounded-lg font-semibold border border-border-soft transition-colors"
            >
              ⚡ NCOA Move
            </button>
            <button 
              onClick={() => loadExample('familial')}
              className="px-3 py-1.5 bg-[#F9E6E9] hover:bg-[#F2D0D6] text-[#D36C95] rounded-lg font-semibold border border-[#F2D0D6] transition-colors"
            >
              🛡️ Familial Trap (Sr/Jr)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Record A */}
          <div className="p-5 rounded-xl bg-surface border border-border-soft space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-header block border-b border-border-soft pb-2">
              📄 Record Input A (e.g., County Roll)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">First Name</label>
                <input 
                  type="text" value={firstA} onChange={(e) => setFirstA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Last Name</label>
                <input 
                  type="text" value={lastA} onChange={(e) => setLastA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Street Address</label>
                <input 
                  type="text" value={addrA} onChange={(e) => setAddrA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Zip Code</label>
                <input 
                  type="text" value={zipA} onChange={(e) => setZipA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Date of Birth (YYYY-MM-DD)</label>
              <input 
                type="text" value={dobA} onChange={(e) => setDobA(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
              />
            </div>
          </div>

          {/* Record B */}
          <div className="p-5 rounded-xl bg-surface border border-border-soft space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-header block border-b border-border-soft pb-2">
              📄 Record Input B (e.g., NCOA / Assessor Roll)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">First Name</label>
                <input 
                  type="text" value={firstB} onChange={(e) => setFirstB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Last Name</label>
                <input 
                  type="text" value={lastB} onChange={(e) => setLastB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Street Address</label>
                <input 
                  type="text" value={addrB} onChange={(e) => setAddrB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Zip Code</label>
                <input 
                  type="text" value={zipB} onChange={(e) => setZipB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-body uppercase mb-1">Date of Birth (YYYY-MM-DD)</label>
              <input 
                type="text" value={dobB} onChange={(e) => setDobB(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm border border-border-soft rounded-lg outline-none bg-white focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${badgeClass}`}>
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">Fellegi-Sunter Linkage Verdict</span>
            <span className="font-serif font-bold text-xl block">{confidenceLabel}</span>
            <p className="text-sm opacity-90 leading-relaxed font-sans">{result.explanation}</p>
          </div>
          <div className="flex flex-col items-end justify-center bg-white text-text-header px-6 py-4 rounded-xl border shadow-sm font-mono shrink-0">
            <div className="text-[10px] font-bold uppercase text-text-body">Log-Odds Weight</div>
            <div className="text-3xl font-black text-primary">
              {result.totalScore > 0 ? `+${result.totalScore}` : result.totalScore}
            </div>
            <div className="text-[10px] font-bold text-text-body mt-1">Confidence: {result.confidence}%</div>
          </div>
        </div>

        {/* Actionable Handles */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-border-soft">
          <button 
            onClick={() => alert("Custom playbooks will be saved to your local engine in the next release.")}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-border-soft hover:border-primary text-text-header font-bold text-sm shadow-sm transition-all group"
          >
            <Save className="w-4 h-4 text-[#646A7A] group-hover:text-primary transition-colors" />
            Save as Custom Playbook
          </button>
          <button 
            onClick={() => alert("Glad you're having fun! 🧪")}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF8F5] text-[#646A7A] hover:bg-[#EAE5DC] hover:text-text-header font-bold text-sm transition-colors"
          >
            <Smile className="w-4 h-4" />
            I'm just having fun!
          </button>
        </div>
      </div>

      {/* Tutorial / Guide Section */}
      <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6 mt-12">
        <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-2">
          <BookOpen className="w-5 h-5" />
          Why This Matters For Your Audits
        </div>
        <h3 className="text-2xl font-serif text-text-header">The Danger of Exact-Match Spreadsheets</h3>
        <p className="text-text-body leading-relaxed max-w-3xl">
          If John Doe registers at "123 Main St", and later registers again as "Jon Doe" at "123 Main Street", a standard Excel search won't flag them as duplicates because the text isn't identical. Malicious actors rely on this to hide synthetic records.
          <br /><br />
          Conversely, if John Doe Sr. and John Doe Jr. live at the same address, a sloppy algorithm might falsely accuse them of being the same person voting twice.
          <br /><br />
          Our engine calculates a <strong>Log-Odds Weight</strong> that rewards similarities and heavily penalizes impossible differences (like a 30-year age gap). This allows you to catch the real typos while protecting innocent citizens from false accusations.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-border-soft mt-6">
          <div>
            <h4 className="font-bold text-text-header mb-2">1. Load an Example</h4>
            <p className="text-sm text-text-body">Use the buttons above to load common scenarios like typos or generational traps (Sr. vs Jr.).</p>
          </div>
          <div>
            <h4 className="font-bold text-text-header mb-2">2. Tweak the Data</h4>
            <p className="text-sm text-text-body">Change a letter in a name or modify a zip code to see how the confidence score shifts in real time.</p>
          </div>
          <div>
            <h4 className="font-bold text-text-header mb-2">3. Defensible Results</h4>
            <p className="text-sm text-text-body">By relying on statistical probabilities rather than gut feelings, your audits remain legally and mathematically defensible.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
