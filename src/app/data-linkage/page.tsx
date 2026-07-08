"use client";

import React, { useState, useMemo } from 'react';
import { Tooltip } from '@/components/Tooltip';
import { fellegiSunterScore, jaroWinkler, levenshtein } from '@/lib/linkage/fellegi-sunter';
import { runLinkageBenchmark } from '@/lib/linkage/benchmark-suite';

export default function DataLinkageStrategy() {
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
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 sm:px-6">
      <header className="border-b border-border pb-6">
        <div className="inline-block bg-primary text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          🧬 Phase 2 Technology Preview & Mathematical Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          Probabilistic Record Linkage & Fellegi-Sunter Scoring
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-4xl">
          How Marigold Insights replaces naive string matching with client-side log-odds statistical models (Fellegi-Sunter / Jaro-Winkler) to resolve cross-precinct duplicates without uploading data to proprietary cloud servers.
        </p>
      </header>

      {/* Live Benchmark Badge Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-primary text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
              Canonical 1,000-Pair Ground Truth Benchmark (v2.4 Engine)
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Empirically Validated Zero-Cloud Accuracy
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Executed in {benchmark.executionTimeMs}ms across 1,000 synthetic test pairs (typographical noise, NCOA relocations, familial collisions, and random controls).
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-center font-mono">
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15">
            <div className="text-xs text-slate-300">Precision</div>
            <div className="text-lg font-bold text-emerald-300">{benchmark.precision}%</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15">
            <div className="text-xs text-slate-300">Recall</div>
            <div className="text-lg font-bold text-emerald-300">{benchmark.recall}%</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15">
            <div className="text-xs text-slate-300">F1-Score</div>
            <div className="text-lg font-bold text-white">{benchmark.f1Score}%</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/15">
            <div className="text-xs text-slate-300">False Positives</div>
            <div className="text-lg font-bold text-amber-300">{benchmark.falsePositiveRate}%</div>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox */}
      <div className="bg-white rounded-2xl border-2 border-accent/40 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              🧪 Interactive Fellegi-Sunter Linkage Simulator
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Modify demographic attributes below to see how log-odds weights respond to typographical noise and generational traps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button 
              onClick={() => loadExample('typo')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition"
            >
              ⚡ Typo Example
            </button>
            <button 
              onClick={() => loadExample('ncoa')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition"
            >
              ⚡ NCOA Move
            </button>
            <button 
              onClick={() => loadExample('familial')}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold border border-red-300 transition"
            >
              🛡️ Familial Trap (Sr/Jr)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Record A */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-slate-200 pb-2">
              📄 Record Input A (e.g., County Roll)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">First Name</label>
                <input 
                  type="text" value={firstA} onChange={(e) => setFirstA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Last Name</label>
                <input 
                  type="text" value={lastA} onChange={(e) => setLastA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Street Address</label>
                <input 
                  type="text" value={addrA} onChange={(e) => setAddrA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Zip Code</label>
                <input 
                  type="text" value={zipA} onChange={(e) => setZipA(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date of Birth (YYYY-MM-DD)</label>
              <input 
                type="text" value={dobA} onChange={(e) => setDobA(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
              />
            </div>
          </div>

          {/* Record B */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block border-b border-slate-200 pb-2">
              📄 Record Input B (e.g., NCOA / Assessor Roll)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">First Name</label>
                <input 
                  type="text" value={firstB} onChange={(e) => setFirstB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Last Name</label>
                <input 
                  type="text" value={lastB} onChange={(e) => setLastB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Street Address</label>
                <input 
                  type="text" value={addrB} onChange={(e) => setAddrB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Zip Code</label>
                <input 
                  type="text" value={zipB} onChange={(e) => setZipB(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Date of Birth (YYYY-MM-DD)</label>
              <input 
                type="text" value={dobB} onChange={(e) => setDobB(e.target.value)}
                className="w-full px-3 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none bg-white"
              />
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${badgeClass}`}>
          <div className="space-y-1 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-wider block">Fellegi-Sunter Linkage Verdict</span>
            <span className="font-extrabold text-lg block">{confidenceLabel}</span>
            <p className="text-xs opacity-90 leading-relaxed font-sans">{result.explanation}</p>
          </div>
          <div className="flex flex-col items-end justify-center bg-white/90 text-slate-900 px-5 py-3 rounded-xl border shadow-sm font-mono shrink-0">
            <div className="text-xs font-bold uppercase text-slate-500">Log-Odds Weight</div>
            <div className="text-2xl font-black text-primary">
              {result.totalScore > 0 ? `+${result.totalScore}` : result.totalScore}
            </div>
            <div className="text-[11px] font-semibold text-accent mt-0.5">Confidence: {result.confidence}%</div>
          </div>
        </div>

        {/* Field by Field Breakdown */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
          <div className="font-bold text-slate-700 uppercase mb-2">Orthogonal Attribute Weight Breakdown:</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="bg-white p-2 rounded border">
              <div className="text-slate-400 text-[10px]">First Name / Nickname</div>
              <div className="font-bold text-slate-800">{result.fieldScores.firstName > 0 ? `+${result.fieldScores.firstName}` : result.fieldScores.firstName}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-slate-400 text-[10px]">Last Name / Suffix</div>
              <div className="font-bold text-slate-800">{result.fieldScores.lastName > 0 ? `+${result.fieldScores.lastName}` : result.fieldScores.lastName}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-slate-400 text-[10px]">Date of Birth</div>
              <div className="font-bold text-slate-800">{result.fieldScores.dob > 0 ? `+${result.fieldScores.dob}` : result.fieldScores.dob}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-slate-400 text-[10px]">Street Address</div>
              <div className="font-bold text-slate-800">{result.fieldScores.address > 0 ? `+${result.fieldScores.address}` : result.fieldScores.address}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-slate-400 text-[10px]">Zip Code</div>
              <div className="font-bold text-slate-800">{result.fieldScores.zip > 0 ? `+${result.fieldScores.zip}` : result.fieldScores.zip}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#F0ECE3] text-[#2D3142] p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-[#D96B27]">
          🎯 Why Single Sources are Inherently Broken
        </h2>
        <p className="text-[#4A5060] leading-relaxed text-sm">
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
