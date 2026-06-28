"use client";

import React, { useState } from 'react';
import { Tooltip } from '@/components/Tooltip';

export default function DataLinkageStrategy() {
  const [str1, setStr1] = useState("DOE, JOHN A");
  const [str2, setStr2] = useState("DOE, JOHN SR");

  // Simple Levenshtein distance calculation for demonstration
  const levenshtein = (a: string, b: string) => {
    const tmp = [];
    let i, j, res;
    const alen = a.length;
    const blen = b.length;
    if (alen === 0) { return blen; }
    if (blen === 0) { return alen; }
    for (i = 0; i <= alen; i++) { tmp[i] = [i]; }
    for (j = 0; j <= blen; j++) { tmp[0][j] = j; }
    for (i = 1; i <= alen; i++) {
      for (j = 1; j <= blen; j++) {
        res = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        tmp[i][j] = Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + res);
      }
    }
    return tmp[alen][blen];
  };

  const dist = levenshtein(str1.toUpperCase().trim(), str2.toUpperCase().trim());
  const maxLen = Math.max(str1.length, str2.length) || 1;
  const similarity = Math.max(0, Math.round((1 - dist / maxLen) * 100));

  let confidenceLabel = "🔴 Low Match Confidence (Likely Different Individuals)";
  let badgeClass = "bg-red-100 text-red-800 border-red-300";
  if (similarity >= 85) {
    confidenceLabel = "🟢 High Match Confidence (Probabilistic Duplicate)";
    badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
  } else if (similarity >= 65) {
    confidenceLabel = "🟡 Moderate Confidence (Requires Manual Review)";
    badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="border-b border-border pb-6">
        <div className="inline-block bg-primary text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          🧬 Phase 2 Technology Preview
        </div>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Probabilistic Record Linkage Strategy</h1>
        <p className="text-lg text-muted-foreground mt-2">
          How Marigold Insights uses client-side statistical matching (Fellegi-Sunter / Levenshtein algorithms) to resolve cross-precinct duplicates without uploading data to proprietary third-party servers.
        </p>
      </header>

      {/* Interactive Sandbox */}
      <div className="bg-white rounded-2xl border-2 border-accent/40 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            🧪 Interactive Fuzzy Linkage Simulator
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Test how our in-memory engine flags typographical discrepancies across fragmented voter records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Record Input A (e.g., County Roll)</label>
            <input 
              type="text" 
              value={str1} 
              onChange={(e) => setStr1(e.target.value)}
              className="w-full px-4 py-2.5 font-mono text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Record Input B (e.g., NCOA / Assessor Roll)</label>
            <input 
              type="text" 
              value={str2} 
              onChange={(e) => setStr2(e.target.value)}
              className="w-full px-4 py-2.5 font-mono text-sm border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none bg-slate-50"
            />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${badgeClass}`}>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider block">Fellegi-Sunter Linkage Verdict</span>
            <span className="font-bold text-base mt-0.5 block">{confidenceLabel}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono font-bold bg-white/80 px-4 py-2 rounded-lg border shadow-sm">
            <div>Levenshtein Distance: <span className="text-primary">{dist}</span></div>
            <div className="border-l pl-4">Similarity: <span className="text-accent font-extrabold">{similarity}%</span></div>
          </div>
        </div>
      </div>

      <section className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎯 Why Single Sources are Inherently Broken
        </h2>
        <p className="text-slate-300 leading-relaxed text-sm">
          A state voter roll on its own is fractured, noisy, and full of human clerical error. If you are looking for objective truth in an apolitical way, you cannot rely on a single dataset. You must cross-reference it against external, highly regulated &quot;Ground Truth&quot; databases using probabilistic record linkage.
        </p>
      </section>

      <div className="space-y-6">
        {/* NCOA */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-primary border-b border-border pb-3">
            1. The Flight Risk Audit (Relocations)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 text-sm">
            <div className="md:col-span-2 space-y-3 text-slate-600">
              <p><strong>Where to find it:</strong> <Tooltip content="National Change of Address (NCOA) is a secure USPS dataset tracking 160 million permanent change-of-address records."><span className="underline decoration-dotted text-primary font-bold cursor-help">USPS NCOA Linkage ℹ️</span></Tooltip></p>
              <p><strong>When to use it:</strong> To identify active voters who have permanently moved out of the state or county.</p>
              <p><strong>How to merge:</strong> Export your local CSV, and cross-reference against certified USPS NCOA change files. Our fuzzy matching engine reconciles address variations automatically.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-center text-center text-amber-950 font-semibold text-xs">
              Objective Truth: If the USPS confirms permanent residence in Texas, active registration in Mississippi requires audit inquiry.
            </div>
          </div>
        </div>

        {/* Commercial/Assessor */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-primary border-b border-border pb-3">
            2. The Commercial Zoning Audit (Non-Residential Addresses)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 text-sm">
            <div className="md:col-span-2 space-y-3 text-slate-600">
              <p><strong>Where to find it:</strong> <Tooltip content="Every county keeps public records of land use (e.g. Residential, Commercial, Agricultural) for tax purposes."><span className="underline decoration-dotted text-primary font-bold cursor-help">County Tax Assessor Rolls ℹ️</span></Tooltip></p>
              <p><strong>When to use it:</strong> To identify registrations tied to commercial shipping hubs, gas stations, or vacant parcels.</p>
              <p><strong>How to merge:</strong> Download the property tax roll from the target county. Use a database JOIN on the `Physical_Address` column. Filter for `Land_Use_Code = Commercial`.</p>
            </div>
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center justify-center text-center text-slate-800 font-semibold text-xs">
              Objective Truth: Municipal zoning designations provide legal verification of residential occupancy eligibility.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
