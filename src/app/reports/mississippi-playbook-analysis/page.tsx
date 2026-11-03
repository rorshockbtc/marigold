"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import msAudit from "@/data/mississippi_audit_results.json";
import {
  Printer,
  Download,
  ArrowLeft,
  Compass,
  Search,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  BookOpen,
} from "lucide-react";

const FRIENDLY_REGIME_MAP: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "Needs Attention Across All 3 Areas",
  "Axis-X Spatial Domicile Ridge": "Focus 1: Apartment & Dorm Unit Numbers",
  "Axis-Y Interstate Drift Ridge": "Focus 2: Out-of-State Mail & Duplicates",
  "Axis-Z Precinct Strain Ridge": "Focus 3: Large Polling Places (3,000+)",
  "Equilibrium Manifold Surface": "On Track: Normal County Pattern",
};

export default function MississippiPlaybookAnalysisReportPage() {
  const [countySearch, setCountySearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"ALL" | "DETACHED" | "BASELINE">("ALL");

  const { metadata, votingHistoryAudit, threatManifold, playbooks } = msAudit;
  const correlations = (threatManifold as Record<string, unknown>).correlations as Array<{
    id: string;
    pairLabel: string;
    plainTitle: string;
    pearsonR: number;
    spearmanRho: number;
    strength: string;
    rateOfChange: string;
    commonManTakeaway: string;
  }>;
  const commissionerToolkit = (threatManifold as Record<string, unknown>).commissionerToolkit as {
    headline: string;
    subheadline: string;
    peerTiers: Array<{
      tier: string;
      counties: string[];
      primaryFocus: string;
      benchmarkMetric: string;
    }>;
    evangelismSteps: Array<{
      step: string;
      title: string;
      detail: string;
    }>;
  };

  const filteredCountyVectors = useMemo(() => {
    return threatManifold.countyVectors.filter((c) => {
      const matchesQuery =
        !countySearch.trim() ||
        c.county.toLowerCase().includes(countySearch.toLowerCase()) ||
        c.regime.toLowerCase().includes(countySearch.toLowerCase()) ||
        c.dominantDriver.toLowerCase().includes(countySearch.toLowerCase());
      const matchesTier =
        tierFilter === "ALL" ||
        (tierFilter === "DETACHED" && c.regime !== "Equilibrium Manifold Surface") ||
        (tierFilter === "BASELINE" && c.regime === "Equilibrium Manifold Surface");
      return matchesQuery && matchesTier;
    });
  }, [threatManifold.countyVectors, countySearch, tierFilter]);

  const maxElectionVotes = useMemo(() => {
    return Math.max(...votingHistoryAudit.majorElections.map((e) => e.ballotsRecorded), 1);
  }, [votingHistoryAudit.majorElections]);

  const topNcoaStates = useMemo(() => {
    return Object.entries(playbooks.ncoaRelocations.stateBreakdown)
      .slice(0, 8)
      .map(([state, count]) => ({ state, count: Number(count) }));
  }, [playbooks.ncoaRelocations.stateBreakdown]);

  const maxNcoaStateCount = useMemo(() => {
    return Math.max(...topNcoaStates.map((s) => s.count), 1);
  }, [topNcoaStates]);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#111111] selection:bg-[#D9381E]/15 selection:text-[#D9381E] print:bg-white">
      {/* Top Editorial Masthead Bar (Hidden in Print) */}
      <header className="sticky top-0 z-40 border-b-2 border-[#111111] bg-[#FCFBF9]/95 backdrop-blur print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/overview"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#D9381E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Marigold Home
            </Link>
            <span className="text-[#BDB6AC]">|</span>
            <Link
              href="/updates"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#3A3530] hover:text-[#D9381E]"
            >
              Plain-English Summary Post
            </Link>
            <span className="hidden md:inline text-[#BDB6AC]">|</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Mississippi Election Commissioner &amp; Clerk Guide • Ink-Saving Edition
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/manifold"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] border-2 border-[#111111] bg-white hover:bg-[#F5F2EB] px-3 py-1.5 rounded transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#D9381E]" />
              Open Full-Screen 3D Map
            </Link>
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] border border-[#111111] bg-white hover:bg-[#F5F2EB] px-3 py-1.5 rounded cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Page
            </button>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download="Marigold-Mississippi-Playbook-Analysis.pdf"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-[#2A2927] px-3.5 py-1.5 rounded"
            >
              <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
              Download Printable PDF
            </a>
          </div>
        </div>
      </header>

      {/* Accént 3-Column Publication Spine */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_260px] gap-10 print:block print:max-w-none print:p-0">
        {/* Left Column: Sticky Section Index Rail (Hidden in Print) */}
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-20 border-t-2 border-[#111111] pt-4 text-xs">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#111111] font-bold mb-3">
              Jump to Any Section
            </div>
            <nav className="divide-y divide-[#D8D2C7] border-b border-[#111111]">
              {[
                { href: "#executive-summary", num: "01", label: "Big Picture & False Alarms Removed" },
                { href: "#manifold-3d", num: "02", label: "Interactive 3D County Map" },
                { href: "#mathematical-correlations", num: "03", label: "How Issues Connect (2-for-1 Fixes)" },
                { href: "#commissioner-toolkit", num: "04", label: "How to Share With Neighbor Counties" },
                { href: "#voting-history-forensics", num: "05", label: "25.91 Million Past Ballots Checked" },
                { href: "#pb-01-high-density", num: "06", label: "Check 1: 8+ Voters at One Address" },
                { href: "#pb-02-missing-dorm", num: "07", label: "Check 2: Missing Dorm & Apt Units" },
                { href: "#pb-03-ncoa-drift", num: "08", label: "Check 3: Out-of-State Mail Moves" },
                { href: "#pb-04-po-box", num: "09", label: "Check 4: P.O. Boxes Listed as Homes" },
                { href: "#pb-05-clerical", num: "10", label: "Check 5: Old 1801 Paper Transfer Dates" },
                { href: "#pb-06-duplicates", num: "11", label: "Check 6: Jr./Sr. & Duplicate Check" },
                { href: "#pb-07-08-precincts", num: "12", label: "Checks 7–8: Busy 3,000+ Polling Places" },
                { href: "#pb-09-benford", num: "13", label: "Check 9: Precinct Number Pattern Test" },
                { href: "#pb-10-county-ledger", num: "14", label: "Check 10: All 82 Counties Lookup Table" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline gap-2.5 py-2 text-[#22201E] hover:text-[#D9381E] transition-colors"
                >
                  <span className="font-mono text-[10px] font-bold text-[#6E675F]">{item.num}</span>
                  <span className="font-semibold leading-snug">{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-5 pt-4 border-t border-[#D8D2C7] text-[11px] text-[#2C2825] space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#111111] font-bold">
                100% Voter Privacy Safe
              </div>
              <p className="leading-relaxed">
                Zero personal names, birth dates, or private single-family house numbers appear anywhere in this report. Safe to print and hand out at public meetings.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Main Publication Spine */}
        <main className="min-w-0 space-y-16">
          {/* SECTION 01: Masthead Title Block + Built-In Signal vs. Noise Visualization */}
          <section id="executive-summary" className="border-t-4 border-[#111111] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-[#2C2825] pb-4 border-b border-[#111111]">
              <span className="font-bold">MARIGOLD ELECTION HYGIENE • MISSISSIPPI 82-COUNTY PRACTICAL GUIDE</span>
              <span className="text-[#15803D] font-bold">
                100% PRIVACY SAFE • WRITTEN IN PLAIN ENGLISH
              </span>
            </div>

            <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.08] text-[#111111]">
              Mississippi 82-County Voter Roll &amp; 25.91 Million Ballot Review
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-[#2C2825] font-serif leading-relaxed max-w-4xl">
              Built for County Election Commissioners, Circuit Clerks, Boards of Supervisors, and everyday citizens—showing how we checked{" "}
              <strong className="text-[#111111] font-bold">2,112,460 voter registrations</strong> and{" "}
              <strong className="text-[#111111] font-bold">25,911,640 past ballots</strong> to filter out 18,093 false alarms and give every county a simple, practical maintenance checklist.
            </p>

            {/* Helpful 60-Second Reading Guide Banner */}
            <div className="mt-6 rounded-xl border-2 border-[#111111] bg-[#FFFDF7] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D9381E] mb-2">
                <BookOpen className="w-4 h-4" />
                The 60-Second Bottom Line for Busy Election Officials
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-[#22201E] leading-relaxed">
                <div className="bg-white border border-[#D8D2C7] rounded-lg p-3.5">
                  <strong className="text-[#15803D] block mb-1">1. Good News: 66 of 82 Counties Are Right on Track</strong>
                  Every single one of Mississippi&apos;s 25.91 million historical ballots matches a real registered voter ID (zero &ldquo;phantom&rdquo; ballots), and 66 counties sit right in the normal range for their population size.
                </div>
                <div className="bg-white border border-[#D8D2C7] rounded-lg p-3.5">
                  <strong className="text-[#D9381E] block mb-1">2. We Removed 18,093 False Alarms First</strong>
                  Ordinary computer scans mistakenly flag nursing homes, college dorms, Jr./Sr. fathers and sons, and streets named <em>&ldquo;Marshall Place.&rdquo;</em> We filtered all of those out so your office only sees real cleanup items.
                </div>
                <div className="bg-white border border-[#D8D2C7] rounded-lg p-3.5">
                  <strong className="text-[#111111] block mb-1">3. Every County Has Its Own Custom Recipe</strong>
                  College counties mostly need apartment unit numbers added; fast-growing suburbs mostly need large 3,000+ voter precincts split. Jump to the 3D map below to see your county&apos;s exact recipe.
                </div>
              </div>
            </div>

            {/* Spacious 3-Column x 2-Row Key Metric Strip (Zero Overlap Guaranteed) */}
            <div className="mt-8 border-y-2 border-[#111111] bg-white p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border-l-4 border-[#111111] pl-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A534A] font-bold">
                  01 • Total Voter Roll Checked
                </div>
                <div className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  {metadata.totalRecords.toLocaleString()}
                </div>
                <div className="font-mono text-xs text-[#2C2825] mt-1">
                  {metadata.activeVoters.toLocaleString()} Active • {metadata.inactiveVoters.toLocaleString()} Inactive
                </div>
              </div>

              <div className="border-l-4 border-[#15803D] pl-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A534A] font-bold">
                  02 • Past Ballots Cross-Checked
                </div>
                <div className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  {votingHistoryAudit.totalHistoryRowsScanned.toLocaleString()}
                </div>
                <div className="font-mono text-xs text-[#15803D] font-bold mt-1">
                  100.00% Match (0 Unmatched Ballots)
                </div>
              </div>

              <div className="border-l-4 border-[#111111] pl-4">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A534A] font-bold">
                  03 • Nov 2024 General Voters
                </div>
                <div className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  {votingHistoryAudit.unique2024GeneralVoters.toLocaleString()}
                </div>
                <div className="font-mono text-xs text-[#2C2825] mt-1">
                  Only {votingHistoryAudit.duplicate2024SameDayCreditRows} Double-Scanned Credits (0.007%)
                </div>
              </div>

              <div className="border-l-4 border-[#15803D] pl-4 pt-2 sm:pt-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A534A] font-bold">
                  04 • Counties in Normal Range
                </div>
                <div className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  66 of 82 Counties
                </div>
                <div className="font-mono text-xs text-[#2C2825] mt-1">
                  On Normal Green Net • 16 Need Extra Cleanup
                </div>
              </div>

              <div className="border-l-4 border-[#D9381E] pl-4 pt-2 sm:pt-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A534A] font-bold">
                  05 • False Alarms Filtered Out
                </div>
                <div className="font-serif text-3xl font-bold text-[#D9381E] mt-1">
                  {(
                    playbooks.missingDorm.streetNameFalsePositivesRemoved +
                    playbooks.duplicates.generationalPairs +
                    playbooks.highDensity.institutionalVoters +
                    playbooks.highDensity.multiFamilyVoters
                  ).toLocaleString()}
                </div>
                <div className="font-mono text-xs text-[#2C2825] mt-1">
                  Dorms, Nursing Homes, Jr/Sr &amp; Street Names Removed
                </div>
              </div>

              <div className="border-l-4 border-[#15803D] pl-4 pt-2 sm:pt-0">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#5A534A] font-bold">
                  06 • Citizen Privacy Protection
                </div>
                <div className="font-serif text-3xl font-bold text-[#15803D] mt-1">
                  100% Privacy Safe
                </div>
                <div className="font-mono text-xs text-[#2C2825] mt-1">
                  0 Voter Names Shown • House Numbers Masked
                </div>
              </div>
            </div>

            {/* BUILT-IN VISUALIZATION 01: Signal vs. Noise Filtering Architecture Chart */}
            <div className="mt-8 border-2 border-[#111111] rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E4E0D8]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#D9381E]" />
                  <h3 className="font-serif text-xl font-bold text-[#111111]">
                    Visual Chart 1.1 — How We Filtered Out 18,093 False Alarms So Clerks Only See Real Work
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#15803D] bg-[#15803D]/10 px-2.5 py-1 rounded">
                  FALSE ALARMS (GRAY) VS. REAL WORK (RED)
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  {
                    title: "Check 2: College Dorms & Apartment Unit Numbers",
                    naiveCount:
                      playbooks.missingDorm.totalVoters +
                      playbooks.missingDorm.streetNameFalsePositivesRemoved,
                    removedCount: playbooks.missingDorm.streetNameFalsePositivesRemoved,
                    removedReason:
                      "4,346 private houses on 'Marshall Place' & 'Halls Ferry Rd' removed (not dorms!)",
                    actionableCount: playbooks.missingDorm.activeVoters,
                    actionableLabel: "Active Students/Tenants Missing a Room #",
                  },
                  {
                    title: "Check 1: Addresses With 8+ Registered Voters",
                    naiveCount: playbooks.highDensity.totalVoters,
                    removedCount:
                      playbooks.highDensity.institutionalVoters +
                      playbooks.highDensity.multiFamilyVoters,
                    removedReason:
                      "University dorms (JSU, Ole Miss, MSU), nursing homes & apartment complexes separated from houses",
                    actionableCount: playbooks.highDensity.singleFamilyAnomalyVoters,
                    actionableLabel: "Single-Family House Records to Check",
                  },
                  {
                    title: "Check 6: Same-Name Voters in the Same ZIP Code",
                    naiveCount:
                      playbooks.duplicates.generationalPairs + playbooks.duplicates.trueDuplicates,
                    removedCount: playbooks.duplicates.generationalPairs,
                    removedReason:
                      "4,404 Father/Son (Jr./Sr./III) family households protected from false duplicate flags",
                    actionableCount: playbooks.duplicates.activeActiveDuplicates,
                    actionableLabel: "Active Same-ZIP Duplicate Pairs to Review",
                  },
                  {
                    title: "Check 3: Voters With Out-of-State Mailing Addresses",
                    naiveCount: playbooks.ncoaRelocations.totalAllStatusVoters,
                    removedCount: playbooks.ncoaRelocations.inactiveRelocatedVoters,
                    removedReason:
                      "11,231 (82.1%) are ALREADY marked Inactive by County Clerks waiting on federal removal",
                    actionableCount: playbooks.ncoaRelocations.totalVoters,
                    actionableLabel: "Remaining Active Out-of-State Mail Voters",
                  },
                ].map((bar) => {
                  const pctActionable = Math.max(
                    7,
                    Math.round((bar.actionableCount / bar.naiveCount) * 100)
                  );
                  const pctRemoved = 100 - pctActionable;
                  return (
                    <div
                      key={bar.title}
                      className="border border-[#D8D2C7] rounded-lg p-4 bg-[#FCFBF9]"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-serif font-bold text-base text-[#111111]">
                          {bar.title}
                        </div>
                        <span className="font-mono text-xs font-bold text-[#15803D]">
                          {Math.round((bar.removedCount / bar.naiveCount) * 100)}% False Alarms Removed
                        </span>
                      </div>

                      <div className="mt-3 h-7 w-full rounded overflow-hidden flex border border-[#111111]">
                        <div
                          style={{ width: `${pctRemoved}%` }}
                          className="bg-[#E5E0D5] text-[#2C2825] flex items-center px-2.5 font-mono text-[11px] font-bold truncate"
                          title={`Filtered Out: ${bar.removedCount.toLocaleString()}`}
                        >
                          Filtered Out: {bar.removedCount.toLocaleString()}
                        </div>
                        <div
                          style={{ width: `${pctActionable}%` }}
                          className="bg-[#D9381E] text-white flex items-center justify-end px-2 font-mono text-[11px] font-bold"
                          title={`Real Action Items: ${bar.actionableCount.toLocaleString()}`}
                        >
                          {bar.actionableCount.toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-[#3A3530]">{bar.removedReason}</span>
                        <span className="font-mono font-bold text-[#D9381E]">
                          To Review: {bar.actionableCount.toLocaleString()} ({bar.actionableLabel})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 02: Interactive Three.js + SVG 3D Threat Manifold */}
          <section id="manifold-3d" className="border-t-2 border-[#111111] pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 02 • Interactive 3D County Map &amp; Single-Issue Filter
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  Explore All 82 Counties in 3D—And Focus on One Issue at a Time
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#111111] bg-[#F3EFE6] px-3 py-1 rounded border border-[#111111]">
                3 Topics: 1. Addresses (X) • 2. Mail/Dups (Y) • 3. Polling Places (Z)
              </span>
            </div>

            <p className="text-[15px] text-[#2C2825] leading-relaxed mb-6 max-w-4xl">
              Drag directly on the 3D map below to turn it, click any county circle to see its plain-English checklist on the right, or click the topic buttons to look at <strong>Addresses</strong>, <strong>Out-of-State Mail</strong>, or <strong>Busy Polling Places</strong> one at a time.
            </p>

            {/* Interactive 3D Component — Unlocked & High Contrast by Default */}
            <div className="print:hidden">
              <ThreatManifold3DExplorer compact={false} forceUnlocked={true} />
            </div>

            {/* Sticky-Header Table 2.1: Top 16 Priority Counties */}
            <div className="mt-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="font-serif text-xl font-bold text-[#111111]">
                  Table 2.1 — The 16 Counties With Extra Cleanup Work Above the Normal Statewide Net
                </h3>
                <span className="font-mono text-xs font-bold text-[#15803D]">
                  The Other 66 Counties Sit Right on the Healthy Green Net
                </span>
              </div>

              <div className="max-h-[480px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-20 bg-[#111111] text-white shadow-sm">
                    <tr className="font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3.5">Rank &amp; County</th>
                      <th className="py-3 px-3 text-right">Registered Voters</th>
                      <th className="py-3 px-3 text-right">1. Addresses (X)</th>
                      <th className="py-3 px-3 text-right">2. Mail/Dups (Y)</th>
                      <th className="py-3 px-3 text-right">3. Precincts (Z)</th>
                      <th className="py-3 px-3 text-right">Normal Benchmark</th>
                      <th className="py-3 px-3 text-right text-[#F59E0B]">Priority Score</th>
                      <th className="py-3 px-3.5">Workload Breakdown (X / Y / Z)</th>
                      <th className="py-3 px-3.5">Main Cleanup Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D2C7]">
                    {threatManifold.countyVectors.slice(0, 16).map((c, i) => (
                      <tr key={c.county} className="hover:bg-[#F5F2EB]">
                        <td className="py-3 px-3.5 font-bold text-[#111111] whitespace-nowrap">
                          <span className="font-mono text-[11px] text-[#D9381E] mr-1.5">
                            #{String(i + 1).padStart(2, "0")}
                          </span>
                          {c.county}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#111111]">
                          {c.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">{c.x}</td>
                        <td className="py-3 px-3 text-right font-mono">{c.y}</td>
                        <td className="py-3 px-3 text-right font-mono">{c.z}</td>
                        <td className="py-3 px-3 text-right font-mono text-[#4A4845]">
                          {c.manifoldZ}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#D9381E]">
                          {c.threatEnergy}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[11px] whitespace-nowrap font-semibold">
                          {c.partialX}% Addr • {c.partialY}% Mail • {c.partialZ}% Poll
                        </td>
                        <td className="py-3 px-3.5 text-[#111111] font-medium">
                          {c.dominantDriver}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 03: How Issues Connect + Visual Connection Cards */}
          <section id="mathematical-correlations" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 03 • How Different Voter Roll Issues Connect Across All 82 Counties
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              Which Cleanup Steps Solve Two Problems at Once?
            </h2>
            <p className="mt-2 text-[15px] text-[#2C2825] leading-relaxed max-w-4xl">
              We compared all 82 counties side by side on a simple <strong>0 to 1.00 connection scale</strong> (where <strong>1.00</strong> means two issues always go hand-in-hand). That helps Election Commissioners pick the cleanup steps that solve multiple issues at the same time:
            </p>

            {/* BUILT-IN VISUALIZATION 03: Visual Connection Strength Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {correlations.map((corr) => {
                const rPct = Math.min(100, Math.round(Math.abs(corr.pearsonR) * 100));
                const rhoPct = Math.min(100, Math.round(Math.abs(corr.spearmanRho) * 100));
                return (
                  <div
                    key={corr.id}
                    className="border-2 border-[#111111] rounded-xl p-4 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#111111] text-white">
                          {corr.id}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[#D9381E]">
                          {corr.strength}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#111111] mt-2">
                        {corr.plainTitle}
                      </h3>
                      <p className="text-xs text-[#4A4845] mt-1">{corr.pairLabel}</p>
                    </div>

                    <div className="mt-4 space-y-2 pt-3 border-t border-[#E4E0D8]">
                      <div>
                        <div className="flex justify-between font-mono text-[11px] font-bold">
                          <span>Direct Link Score (0–1.00)</span>
                          <span className="text-[#D9381E]">+{corr.pearsonR.toFixed(2)} / 1.00</span>
                        </div>
                        <div className="mt-1 h-2.5 w-full bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/30">
                          <div
                            style={{ width: `${rPct}%` }}
                            className="h-full bg-[#D9381E]"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-mono text-[11px] font-bold">
                          <span>County Rank Match (0–1.00)</span>
                          <span className="text-[#111111]">+{corr.spearmanRho.toFixed(2)} / 1.00</span>
                        </div>
                        <div className="mt-1 h-2.5 w-full bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/30">
                          <div
                            style={{ width: `${rhoPct}%` }}
                            className="h-full bg-[#111111]"
                          />
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] font-mono text-[#15803D] font-bold">
                        Rule of Thumb: {corr.rateOfChange}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky-Header Connection Table */}
            <div className="mt-6 max-h-[460px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                  <tr className="font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">What We Compared</th>
                    <th className="py-3 px-3 text-right">Link Score (0–1.00)</th>
                    <th className="py-3 px-3 text-right">Rank Match</th>
                    <th className="py-3 px-4">Practical Rule of Thumb</th>
                    <th className="py-3 px-4">Plain-English Takeaway for Election Commissioners</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C7]">
                  {correlations.map((corr) => (
                    <tr key={corr.id} className="align-top hover:bg-[#F5F2EB]">
                      <td className="py-3.5 px-4 min-w-[210px]">
                        <div className="font-mono text-[10px] text-[#D9381E] font-bold">
                          {corr.id} • {corr.strength}
                        </div>
                        <div className="font-serif font-bold text-sm text-[#111111] mt-0.5">
                          {corr.plainTitle}
                        </div>
                        <div className="text-[11px] text-[#5A534A] mt-0.5">{corr.pairLabel}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-[#D9381E] whitespace-nowrap">
                        +{corr.pearsonR.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#111111] whitespace-nowrap">
                        +{corr.spearmanRho.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-[#111111] font-medium min-w-[200px] leading-relaxed">
                        {corr.rateOfChange}
                      </td>
                      <td className="py-3.5 px-4 text-[#2C2825] min-w-[270px] leading-relaxed">
                        {corr.commonManTakeaway}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 04: County Election Commissioner Evangelism & Peer Guide */}
          <section id="commissioner-toolkit" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 04 • Working Together With Neighboring Counties
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              {commissionerToolkit.headline}
            </h2>
            <p className="mt-2 text-[15px] text-[#2C2825] leading-relaxed max-w-4xl">
              {commissionerToolkit.subheadline}
            </p>

            {/* 3-Step Evangelism Spine */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-2 border-[#111111] rounded-xl bg-white p-6">
              {commissionerToolkit.evangelismSteps.map((st) => (
                <div
                  key={st.step}
                  className="md:border-r md:last:border-r-0 border-[#D8D2C7] md:pr-5"
                >
                  <div className="inline-block font-mono text-xs font-bold text-white bg-[#D9381E] px-2.5 py-0.5 rounded">
                    STEP {st.step}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#111111] mt-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#2C2825] mt-2 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>

            {/* Sticky-Header Peer Tier Comparison Table */}
            <div className="mt-6 max-h-[420px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                  <tr className="font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Mississippi County Peer Group</th>
                    <th className="py-3 px-4">Counties in This Group</th>
                    <th className="py-3 px-4">Shared Pattern</th>
                    <th className="py-3 px-4">Recommended Checklist to Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C7]">
                  {commissionerToolkit.peerTiers.map((tier) => (
                    <tr key={tier.tier} className="align-top hover:bg-[#F5F2EB]">
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#111111] min-w-[200px]">
                        {tier.tier}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#111111] min-w-[210px]">
                        {tier.counties.join(", ")}
                      </td>
                      <td className="py-3.5 px-4 text-[#D9381E] font-mono font-bold min-w-[200px]">
                        {tier.benchmarkMetric}
                      </td>
                      <td className="py-3.5 px-4 text-[#2C2825] leading-relaxed">
                        {tier.primaryFocus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 05: 25.91 Million Voting History Audit + Turnout Bar Chart */}
          <section id="voting-history-forensics" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 05 • Statewide Voting History Cross-Check (25.91 Million Ballots)
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              Every Historical Ballot Matched Against the Live Voter Roll
            </h2>
            <p className="mt-2 text-[15px] text-[#2C2825] leading-relaxed max-w-4xl">
              We checked every single row of Mississippi&apos;s statewide Voting History file (<strong>25,911,640 past ballots cast</strong>) against the 2,112,460-row Master Voter Roll by unique Voter ID:
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-6 border-2 border-[#111111] rounded-xl bg-white p-5">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#5A534A] font-bold">
                  Unmatched (&ldquo;Orphan&rdquo;) Ballots
                </div>
                <div className="font-serif text-2xl font-bold text-[#15803D] mt-0.5">
                  0 (0.000%)
                </div>
                <div className="text-[11px] text-[#2C2825]">
                  Every ballot matches a valid registered Voter ID
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[#5A534A] font-bold">
                  Voters Who Have Cast a Ballot
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {votingHistoryAudit.uniqueVotersWithHistory.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#2C2825]">79.92% of all registered voters</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[#5A534A] font-bold">
                  Registered But Never Voted Yet
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {votingHistoryAudit.votersWithZeroHistory.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#2C2825]">20.08% have 0 ballots on file</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[#5A534A] font-bold">
                  2024 Double-Scanned Credits
                </div>
                <div className="font-serif text-2xl font-bold text-[#D9381E] mt-0.5">
                  {votingHistoryAudit.duplicate2024SameDayCreditRows}
                </div>
                <div className="text-[11px] text-[#2C2825]">
                  Out of 1,213,364 Nov 2024 voters (0.007%)
                </div>
              </div>
            </div>

            {/* BUILT-IN VISUALIZATION 05: Multi-Cycle Statewide Ballot Volume Bar Chart */}
            <div className="mt-6 border-2 border-[#111111] rounded-xl bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E4E0D8]">
                <h3 className="font-serif text-lg font-bold text-[#111111]">
                  Visual Chart 5.1 — Verified Mississippi Ballots Recorded by Major Statewide Election
                </h3>
                <span className="font-mono text-xs font-bold text-[#15803D]">
                  100.00% Matched to Registered Voter IDs
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {votingHistoryAudit.majorElections.map((el) => {
                  const widthPct = Math.max(
                    12,
                    Math.round((el.ballotsRecorded / maxElectionVotes) * 100)
                  );
                  const isPresidential = el.label.includes("Presidential");
                  return (
                    <div key={el.date} className="grid grid-cols-1 sm:grid-cols-[220px_1fr_130px] items-center gap-2">
                      <div className="font-mono text-xs font-bold text-[#111111]">
                        {el.date} • <span className="font-sans font-medium text-[#3A3530]">{el.label.replace(" General Election", "")}</span>
                      </div>
                      <div className="h-6 bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/40">
                        <div
                          style={{ width: `${widthPct}%` }}
                          className={`h-full flex items-center px-2.5 font-mono text-[11px] font-bold text-white ${
                            isPresidential ? "bg-[#111111]" : "bg-[#D9381E]"
                          }`}
                        >
                          {isPresidential ? "Presidential Election" : "Midterm / State Election"}
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs font-bold text-[#111111]">
                        {el.ballotsRecorded.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky-Header Table 5.1 */}
            <div className="mt-6 max-h-[380px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                  <tr className="font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Election Date</th>
                    <th className="py-3 px-4">Statewide Election</th>
                    <th className="py-3 px-4 text-right">Verified Ballots Recorded</th>
                    <th className="py-3 px-4">Roll Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C7]">
                  {votingHistoryAudit.majorElections.map((el) => (
                    <tr key={el.date} className="hover:bg-[#F5F2EB]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#111111]">
                        {el.date}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#111111]">{el.label}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#111111]">
                        {el.ballotsRecorded.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] font-bold text-[#15803D]">
                        ✓ 100% Matched to Voter Roll
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 06: Playbook 01 — High-Density Residential Domiciles */}
          <section id="pb-01-high-density" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 06 • Check 1 — Addresses With 8 or More Registered Voters
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              Separating Nursing Homes &amp; Universities from Single-Family Houses
            </h2>
            <p className="mt-2 text-[15px] text-[#2C2825] leading-relaxed max-w-4xl">
              Mississippi has{" "}
              <strong>{playbooks.highDensity.totalAddresses.toLocaleString()} addresses</strong> where 8 or more voters are registered at the same street address ({playbooks.highDensity.totalVoters.toLocaleString()} total voters). When we separate university dorms, nursing homes, and apartment complexes, County Clerks can see the exact single-family houses where old tenants moved away without updating their registration:
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 border-2 border-[#111111] rounded-xl bg-white p-5 text-xs">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#15803D] font-bold">
                  1. Universities &amp; Nursing Homes (Normal)
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {playbooks.highDensity.institutionalClusters} Locations ({playbooks.highDensity.institutionalVoters.toLocaleString()} Voters)
                </div>
                <p className="text-[#2C2825] mt-1">
                  College campuses (JSU, Ole Miss, MSU, Alcorn, Rust College), nursing homes, and care centers where high voter counts are completely normal.
                </p>
              </div>
              <div className="sm:border-l border-[#D8D2C7] sm:pl-5">
                <div className="font-mono text-[10px] uppercase text-[#2C2825] font-bold">
                  2. Apartment Complexes Missing Apt #
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {playbooks.highDensity.multiFamilyClusters} Complexes ({playbooks.highDensity.multiFamilyVoters.toLocaleString()} Voters)
                </div>
                <p className="text-[#2C2825] mt-1">
                  Apartment buildings and mobile home parks where tenants registered using the main street address without writing down their Apt or Lot number.
                </p>
              </div>
              <div className="sm:border-l border-[#D8D2C7] sm:pl-5">
                <div className="font-mono text-[10px] uppercase text-[#D9381E] font-bold">
                  3. Single-Family Houses (To Review)
                </div>
                <div className="font-serif text-2xl font-bold text-[#D9381E] mt-0.5">
                  {playbooks.highDensity.singleFamilyAnomalies.toLocaleString()} Houses ({playbooks.highDensity.singleFamilyAnomalyVoters.toLocaleString()} Voters)
                </div>
                <p className="text-[#2C2825] mt-1">
                  Regular houses where previous renters or owners moved away over the years without cancelling their old registration.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Institutional / Multi-Unit Clusters */}
              <div>
                <h3 className="font-serif text-base font-bold text-[#111111] mb-2">
                  Table 6.1 — Largest Campus &amp; Multi-Unit Addresses (Scrollable)
                </h3>
                <div className="max-h-[420px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Address &amp; City</th>
                        <th className="py-2.5 px-2">County</th>
                        <th className="py-2.5 px-2 text-right">Total (Active)</th>
                        <th className="py-2.5 px-3">Building Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.highDensity.topClusters.slice(0, 12).map((c, idx) => (
                        <tr key={idx} className="hover:bg-[#F5F2EB]">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#111111]">
                            {c.address}, {c.city}
                          </td>
                          <td className="py-2.5 px-2 font-medium">{c.county}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold">
                            {c.occupantCount.toLocaleString()} ({c.activeOccupantCount.toLocaleString()})
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-[#2C2825]">
                            {c.classification.replace(" Hub", "").replace(" Cluster", "")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Single-Family Residential Anomalies (Block-Masked for Zero-PII) */}
              <div>
                <h3 className="font-serif text-base font-bold text-[#111111] mb-2">
                  Table 6.2 — Top Single-Family Houses to Review (House Numbers Masked for Privacy)
                </h3>
                <div className="max-h-[420px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Privacy-Masked Street Block</th>
                        <th className="py-2.5 px-2">County</th>
                        <th className="py-2.5 px-2 text-right text-[#F59E0B]">Total</th>
                        <th className="py-2.5 px-3 text-right">Active / Inactive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.highDensity.topSingleFamilyAnomalies.slice(0, 12).map((c, idx) => (
                        <tr key={idx} className="hover:bg-[#F5F2EB]">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#111111]">
                            {c.address}, {c.city}
                          </td>
                          <td className="py-2.5 px-2 font-medium">{c.county}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-[#D9381E]">
                            {c.occupantCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] font-semibold">
                            {c.activeOccupantCount} Act / {c.inactiveOccupantCount} Inact
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 07: Playbook 02 — Missing Dorm & Apartment Units */}
          <section id="pb-02-missing-dorm" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 07 • Check 2 — College Dorms &amp; Apartments Missing a Room Number
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              How We Stopped 4,346 False Alarms on Streets Named &ldquo;Marshall Place&rdquo; &amp; &ldquo;Halls Ferry&rdquo;
            </h2>
            <p className="mt-2 text-[15px] text-[#2C2825] leading-relaxed max-w-4xl">
              Basic computer searches look for the letters <code>&quot;HALL&quot;</code> inside an address—which accidentally flags thousands of normal family homes on streets like{" "}
              <em>Marshall Place</em> (because &ldquo;Mars<strong>hall</strong>&rdquo; ends in &ldquo;hall&rdquo;!) or <em>Halls Ferry Road</em>. By checking whole words only and separating college campuses from residential street names, we removed{" "}
              <strong>{playbooks.missingDorm.streetNameFalsePositivesRemoved.toLocaleString()} false street-name matches</strong>—leaving only the{" "}
              <strong>{playbooks.missingDorm.totalVoters.toLocaleString()} real campus and apartment registrations ({playbooks.missingDorm.activeVoters.toLocaleString()} Active)</strong> that actually need a dorm room or apartment number added.
            </p>

            <div className="mt-5 max-h-[400px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                  <tr className="font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Verified Campus / Multi-Unit Building Address</th>
                    <th className="py-3 px-4">City / Campus</th>
                    <th className="py-3 px-4">County</th>
                    <th className="py-3 px-4 text-right text-[#F59E0B]">Voters Missing Room/Apt #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C7]">
                  {playbooks.missingDorm.campusBreakdown.slice(0, 12).map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F5F2EB]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#111111]">
                        {item.address}
                      </td>
                      <td className="py-2.5 px-4 font-medium">{item.city}</td>
                      <td className="py-2.5 px-4 font-medium">{item.county}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#D9381E]">
                        {item.voterCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 08 & 09: Playbook 03 (NCOA Out-of-State) & Playbook 04 (P.O. Box Domiciles) */}
          <section id="pb-03-ncoa-drift" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* PB-03 + Destination Bar Chart */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 08 • Check 3 — Out-of-State Mailing Addresses
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  Why 82% Are Already Handled—Leaving Only 2,444 Active Voters to Check
                </h2>
                <p className="mt-2 text-xs text-[#2C2825] leading-relaxed">
                  Across the total voter file, <strong>{playbooks.ncoaRelocations.totalAllStatusVoters.toLocaleString()} records</strong> have an out-of-state mailing address. Here is the good news: Mississippi County Clerks have already moved{" "}
                  <strong>{playbooks.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} (82.1%)</strong> of those voters to <strong>Inactive</strong> status while waiting out the federal two-election removal period. Only{" "}
                  <strong>{playbooks.ncoaRelocations.totalVoters.toLocaleString()} Active voters</strong> still need an address confirmation postcard.
                </p>

                {/* Visual Destination State Bar Chart */}
                <div className="mt-4 border-2 border-[#111111] rounded-xl bg-white p-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#111111] mb-2.5">
                    Visual Chart 8.1 — Top States Where Mississippi Voters Forward Mail
                  </div>
                  <div className="space-y-2">
                    {topNcoaStates.map((st) => {
                      const wPct = Math.max(10, Math.round((st.count / maxNcoaStateCount) * 100));
                      return (
                        <div key={st.state} className="grid grid-cols-[42px_1fr_64px] items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#111111]">{st.state}</span>
                          <div className="h-4 bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/30">
                            <div
                              style={{ width: `${wPct}%` }}
                              className="h-full bg-[#D9381E]"
                            />
                          </div>
                          <span className="text-right font-mono font-bold text-[#111111]">
                            {st.count.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 max-h-[320px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Mailing State</th>
                        <th className="py-2.5 px-3 text-right">Total Records</th>
                        <th className="py-2.5 px-3">Typical Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {topNcoaStates.map(({ state: st, count: cnt }) => (
                        <tr key={st} className="hover:bg-[#F5F2EB]">
                          <td className="py-2 px-3 font-mono font-bold text-[#111111]">{st}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {cnt.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-[#2C2825]">
                            {["TN", "AL", "LA", "AR"].includes(st)
                              ? "Neighboring State Border Commuter / Move"
                              : "Military / Out-of-State College / Move"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PB-04 */}
              <div id="pb-04-po-box">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 09 • Check 4 — P.O. Boxes Typed on the Street Line
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  339 Records Where a P.O. Box Was Typed in the Home Address Box
                </h2>
                <p className="mt-2 text-xs text-[#2C2825] leading-relaxed">
                  Voters are allowed to receive mail at a P.O. Box, but Mississippi law requires a physical home address so the county knows which precinct ballot to give them. Only{" "}
                  <strong>{playbooks.commercialPOBox.totalVoters} records statewide ({playbooks.commercialPOBox.activeVoters} Active, {playbooks.commercialPOBox.inactiveVoters} Inactive)</strong> have a P.O. Box accidentally typed on the physical street line instead of the mailing line.
                </p>

                <div className="mt-4 max-h-[420px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Privacy-Safe ID</th>
                        <th className="py-2.5 px-3">Address Typed on Street Line</th>
                        <th className="py-2.5 px-3">County</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.commercialPOBox.samples.slice(0, 10).map((s) => (
                        <tr key={s.recordToken} className="hover:bg-[#F5F2EB]">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#5A534A]">
                            {s.recordToken}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-[#111111]">
                            {s.address}, {s.city}
                          </td>
                          <td className="py-2.5 px-3 font-medium">{s.county}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px] font-bold">
                            {s.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 10 & 11: Playbook 05 (Clerical Typos) & Playbook 06 (Suffix-Disambiguated Duplicates) */}
          <section id="pb-05-clerical" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* PB-05 */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 10 • Check 5 — Old Paper-to-Computer Transfer Dates
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  Why 1,271 Voters Show an &ldquo;1801&rdquo; Registration Date (And Why It&apos;s Not Fraud)
                </h2>
                <p className="mt-2 text-xs text-[#2C2825] leading-relaxed">
                  Nobody registered to vote in 1801! When counties typed old paper registration books into the statewide computer system in the early 2000s, any card missing a readable registration date was given a default computer placeholder like{" "}
                  <code>01/01/1801</code> (1,271 rows), <code>01/01/0001</code> (206 rows), or the placeholder word <code>DATAMIGRATION</code> (113 rows in Warren and Simpson Counties).
                </p>

                <div className="mt-4 max-h-[360px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Computer Placeholder Category</th>
                        <th className="py-2.5 px-3 text-right">Statewide Count</th>
                        <th className="py-2.5 px-3">What Happened in the Office</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {Object.entries(playbooks.clericalTypos.yearBreakdown)
                        .slice(0, 8)
                        .map(([k, v]) => (
                          <tr key={k} className="hover:bg-[#F5F2EB]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#111111]">
                              {k}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#D9381E]">
                              {(v as number).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-[#2C2825]">
                              {k === "TRUNCATED_NAME_1CHAR"
                                ? "First or last name typed as a single initial"
                                : k === "DATAMIGRATION_ADDR"
                                ? "Placeholder word from early-2000s computer import"
                                : "Default date used when paper card had no date"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PB-06 */}
              <div id="pb-06-duplicates">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 11 • Check 6 — Father/Son (Jr./Sr.) &amp; Duplicate Check
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  4,404 Jr./Sr. Families Protected • 818 Active Same-ZIP Duplicates Found
                </h2>
                <p className="mt-2 text-xs text-[#2C2825] leading-relaxed">
                  When John Smith Sr. and John Smith Jr. live in the same house, our system checks their suffixes and protects <strong>{playbooks.duplicates.generationalPairs.toLocaleString()} father-and-son households</strong> from being falsely flagged. Within the same ZIP code, only{" "}
                  <strong>{playbooks.duplicates.trueDuplicates.toLocaleString()} exact First+Middle+Last+Suffix matches</strong> exist across different addresses: <strong>{playbooks.duplicates.activeActiveDuplicates} where both are Active</strong>, and{" "}
                  <strong>{playbooks.duplicates.activeInactiveMoveTrails} where the old address is already Inactive</strong>.
                </p>

                <div className="mt-4 max-h-[360px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Privacy-Safe Group ID</th>
                        <th className="py-2.5 px-3">County &amp; ZIP</th>
                        <th className="py-2.5 px-3 text-right">Records (Active)</th>
                        <th className="py-2.5 px-3">What Clerks Should Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.duplicates.sampleClusters.slice(0, 10).map((d) => (
                        <tr key={d.clusterId} className="hover:bg-[#F5F2EB]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#111111]">
                            {d.clusterId}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            {d.county} ({d.zip})
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {d.recordCount} ({d.activeRecords} Act)
                          </td>
                          <td className="py-2.5 px-3 text-[#2C2825]">{d.classification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 12 & 13: Playbooks 07, 08 (Spikes & Precinct Capacity) & Playbook 09 (First-Digit Pattern Test) */}
          <section id="pb-07-08-precincts" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* PB-08 & PB-07 */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 12 • Checks 7 &amp; 8 — Registration Deadlines &amp; Busy Polling Places
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  123 Polling Places Have Over 3,000 Voters (27 Have Over 5,000)
                </h2>
                <p className="mt-2 text-xs text-[#2C2825] leading-relaxed">
                  Big registration days happen right on Mississippi&apos;s legal 30-day deadline before a Presidential election (peaking at{" "}
                  <strong>13,731 on Oct 5, 2020</strong> and <strong>7,867 on Oct 7, 2024</strong>). Meanwhile, fast suburban growth in DeSoto, Madison, Rankin, and Harrison Counties has pushed{" "}
                  <strong>{playbooks.precinctCapacity.overCapacityCount} of {playbooks.precinctCapacity.totalPrecincts.toLocaleString()} precincts</strong> past 3,000 voters—meaning those precincts need extra check-in books or a precinct split to prevent Election Day lines.
                </p>

                <div className="mt-4 max-h-[420px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Precinct Code &amp; Name</th>
                        <th className="py-2.5 px-2">County</th>
                        <th className="py-2.5 px-2 text-right text-[#F59E0B]">Total Voters</th>
                        <th className="py-2.5 px-3 text-right">Active Voters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.precinctCapacity.topOverCapacity.slice(0, 12).map((p, i) => (
                        <tr key={i} className="hover:bg-[#F5F2EB]">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#111111]">
                            {p.precinctCode} — {p.precinctName}
                          </td>
                          <td className="py-2.5 px-2 font-medium">{p.county}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-[#D9381E]">
                            {p.voterCount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold">
                            {p.activeVoterCount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PB-09: First-Digit Accounting Test */}
              <div id="pb-09-benford">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 13 • Check 9 — Standard Accounting Pattern Check (Benford&apos;s Law)
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  Mississippi&apos;s 1,742 Precincts Pass the Accounting Pattern Check Cleanly
                </h2>
                <p className="mt-2 text-xs text-[#2C2825] leading-relaxed">
                  Financial auditors often check the first digit (1 through 9) of large sets of numbers to make sure nothing was artificially made up. Across all 1,742 Mississippi precincts, total voter registration matches the natural accounting curve almost perfectly (<strong>green bars match gray expected bars below—PASS</strong>).
                </p>

                {/* BUILT-IN VISUALIZATION 13: Expected vs Observed First-Digit Chart */}
                <div className="mt-4 border-2 border-[#111111] rounded-xl bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#111111]">
                      Visual Chart 13.1 — Expected Accounting Pattern (Gray) vs. Actual MS Roll (Green)
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#15803D]">
                      ✓ NATURAL PATTERN VERIFIED
                    </span>
                  </div>
                  <div className="grid grid-cols-9 gap-2 items-end h-28 pt-4 px-2 border-b border-[#111111]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
                      const key = String(d) as keyof typeof playbooks.benfordsLaw.expected;
                      const exp = playbooks.benfordsLaw.expected[key];
                      const obs = playbooks.benfordsLaw.observedPct[key];
                      const expH = Math.max(8, Math.round((exp / 32) * 100));
                      const obsH = Math.max(8, Math.round((obs / 32) * 100));
                      return (
                        <div key={d} className="flex flex-col items-center h-full justify-end">
                          <div className="w-full flex items-end justify-center gap-1 h-full">
                            <div
                              style={{ height: `${expH}%` }}
                              className="w-2.5 bg-[#BDB6AC] rounded-t"
                              title={`Digit ${d} Expected: ${exp}%`}
                            />
                            <div
                              style={{ height: `${obsH}%` }}
                              className="w-2.5 bg-[#15803D] rounded-t"
                              title={`Digit ${d} Actual MS Roll: ${obs}%`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-9 gap-2 text-center font-mono text-[10px] font-bold text-[#111111] pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <div key={d}>Starts w/ {d}</div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 max-h-[300px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Starting Digit</th>
                        <th className="py-2.5 px-3 text-right">Expected Pattern %</th>
                        <th className="py-2.5 px-3 text-right text-[#4ADE80]">Actual MS Roll % (PASS)</th>
                        <th className="py-2.5 px-3 text-right">2024 Turnout %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
                        const key = String(d) as keyof typeof playbooks.benfordsLaw.expected;
                        return (
                          <tr key={d} className="hover:bg-[#F5F2EB]">
                            <td className="py-2 px-3 font-mono font-bold text-[#111111]">
                              Starts with {d}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[#2C2825]">
                              {playbooks.benfordsLaw.expected[key]}%
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#15803D]">
                              {playbooks.benfordsLaw.observedPct[key]}%
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-[#111111]">
                              {playbooks.benfordsLaw.turnout2024.observedPct[key]}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 14: Playbook 10 — Complete 82-County Master Lookup Table (Sticky Header on Scroll) */}
          <section id="pb-10-county-ledger" className="border-t-2 border-[#111111] pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 14 • Check 10 — Complete 82-County Lookup Table
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  Find Your County: All 82 Mississippi Counties Ranked Side by Side
                </h2>
              </div>

              {/* Filter Bar (Hidden in Print) */}
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#5A534A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    placeholder="Type county name..."
                    className="pl-8 pr-3 py-1.5 text-xs font-medium border-2 border-[#111111] bg-white rounded focus:outline-none"
                  />
                </div>
                {(["ALL", "DETACHED", "BASELINE"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTierFilter(tf)}
                    className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase rounded border-2 cursor-pointer ${
                      tierFilter === tf
                        ? "bg-[#111111] text-white border-[#111111]"
                        : "bg-white text-[#111111] border-[#111111]"
                    }`}
                  >
                    {tf === "ALL"
                      ? "All 82 Counties"
                      : tf === "DETACHED"
                      ? "16 Priority Counties"
                      : "66 Normal-Range Counties"}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[620px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white shadow-sm">
                  <tr className="font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3">County</th>
                    <th className="py-3 px-2.5 text-right">Total Voters</th>
                    <th className="py-3 px-2.5 text-right">Active</th>
                    <th className="py-3 px-2.5 text-right">2024 Votes</th>
                    <th className="py-3 px-2.5 text-right">8+ Addrs</th>
                    <th className="py-3 px-2.5 text-right">Missing Unit #</th>
                    <th className="py-3 px-2.5 text-right">Out-of-State</th>
                    <th className="py-3 px-2.5 text-right">Same-ZIP Dups</th>
                    <th className="py-3 px-2.5 text-right">3,000+ Polls</th>
                    <th className="py-3 px-2.5 text-right text-[#F59E0B]">Priority Score</th>
                    <th className="py-3 px-3">Plain-English County Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D2C7]">
                  {filteredCountyVectors.map((c) => (
                    <tr key={c.county} className="hover:bg-[#F5F2EB]">
                      <td className="py-2.5 px-3 font-bold text-[#111111] whitespace-nowrap">
                        {c.county}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-semibold">
                        {c.total.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono text-[#2C2825]">
                        {c.active.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono">
                        {c.votes2024General.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono">{c.highDensityCount}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono">{c.missingDormCount}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono">{c.ncoaCount}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono">{c.duplicateCount}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono">{c.overCapacityPrecincts}</td>
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-[#D9381E]">
                        {c.threatEnergy}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-semibold text-[#111111] whitespace-nowrap">
                        {FRIENDLY_REGIME_MAP[c.regime] || c.regime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Right Column: Commissioner Quick-Reference Rail (Hidden in Print) */}
        <aside className="hidden xl:block print:hidden">
          <div className="sticky top-20 border-t-2 border-[#111111] pt-4 space-y-6 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#D9381E] font-bold">
                Quick Talking Points
              </div>
              <h3 className="font-serif text-base font-bold text-[#111111] mt-1">
                What to Share With Your County Board &amp; Circuit Clerk
              </h3>
              <p className="text-[#2C2825] mt-2 leading-relaxed">
                1. <strong>Zero unmatched ballots statewide.</strong> Every single one of Mississippi&apos;s 25.91 million past ballots matches a real registered voter ID, and 66 of 82 counties sit right in the normal range.
              </p>
              <p className="text-[#2C2825] mt-2 leading-relaxed">
                2. <strong>18,093 false alarms are already filtered out.</strong> Nursing homes, college dorms, Jr./Sr. fathers and sons, and street names like <em>Marshall Pl</em> have already been separated from single-family homes.
              </p>
              <p className="text-[#2C2825] mt-2 leading-relaxed">
                3. <strong>Every county gets a clear 1-2-3 checklist.</strong> Use the 3D map to check whether your county mainly needs <strong>Apartment Unit Numbers</strong>, <strong>Out-of-State Mail Postcards</strong>, or <strong>Extra Check-In Books at Large Precincts</strong>.
              </p>
            </div>

            <div className="border-t border-[#111111] pt-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#111111] font-bold">
                Plain-English Glossary
              </div>
              <dl className="mt-2 space-y-2 text-[11px]">
                <div>
                  <dt className="font-bold text-[#111111]">Active vs. Inactive Voter:</dt>
                  <dd className="text-[#2C2825]">
                    Federal law (NVRA) requires counties to mark moved voters &ldquo;Inactive&rdquo; and wait 2 federal elections before removing them.
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[#111111]">Green Normal Net:</dt>
                  <dd className="text-[#2C2825]">
                    What a typical Mississippi county looks like once you adjust fairly for population size.
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[#111111]">Connection Score (0–1.00):</dt>
                  <dd className="text-[#2C2825]">
                    Shows how closely two issues move together (1.00 = they always move together).
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-[#111111] pt-4 space-y-2">
              <Link
                href="/manifold"
                className="w-full inline-flex items-center justify-between px-3 py-2.5 rounded border-2 border-[#111111] bg-[#111111] text-white font-bold hover:bg-[#2A2927]"
              >
                <span>Open Full-Screen 3D Map</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              </Link>
              <Link
                href="/updates"
                className="w-full inline-flex items-center justify-between px-3 py-2.5 rounded border-2 border-[#111111] bg-white text-[#111111] font-bold hover:bg-[#F5F2EB]"
              >
                <span>Read Plain-English Release Post</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
