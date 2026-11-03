"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import msAudit from "@/data/mississippi_audit_results.json";
import {
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  Compass,
  CheckCircle2,
  BookOpen,
  FileSpreadsheet,
  Search,
  ArrowUpRight,
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#111111] selection:bg-[#D9381E]/15 selection:text-[#D9381E] print:bg-white">
      {/* Top Editorial Masthead Bar (Hidden in Print) */}
      <header className="sticky top-0 z-40 border-b border-[#E4E0D8] bg-[#FCFBF9]/95 backdrop-blur print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/overview"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A4845] hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Marigold Platform
            </Link>
            <span className="text-[#D4CFC7]">|</span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-semibold">
              Accént Publication Edition • Draft 2 (Ink-Saving Commissioner Release)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/manifold"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] border border-[#D4CFC7] bg-white hover:bg-[#F5F2EB] px-3 py-1.5 rounded"
            >
              <Compass className="w-3.5 h-3.5 text-[#D9381E]" />
              Full-Screen 3D Manifold
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] border border-[#D4CFC7] bg-white hover:bg-[#F5F2EB] px-3 py-1.5 rounded cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Ink-Saving Edition
            </button>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download="Marigold-Mississippi-Playbook-Analysis.pdf"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#2A2927] px-3.5 py-1.5 rounded"
            >
              <Download className="w-3.5 h-3.5 text-[#D9381E]" />
              Download Official PDF
            </a>
          </div>
        </div>
      </header>

      {/* Accént 3-Column Publication Spine */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_260px] gap-10 print:block print:max-w-none print:p-0">
        {/* Left Column: Sticky Section Index Rail (Hidden in Print) */}
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-22 border-t-2 border-[#111111] pt-4 text-xs">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#76736E] font-bold mb-3">
              Publication Index
            </div>
            <nav className="divide-y divide-[#E4E0D8] border-b border-[#E4E0D8]">
              {[
                { href: "#executive-summary", num: "01", label: "Executive Summary & Scope" },
                { href: "#manifold-3d", num: "02", label: "3D Threat Manifold & Calculus" },
                { href: "#mathematical-correlations", num: "03", label: "Mathematical Correlations" },
                { href: "#commissioner-toolkit", num: "04", label: "Commissioner Evangelism Guide" },
                { href: "#voting-history-forensics", num: "05", label: "25.91M Voting History Audit" },
                { href: "#pb-01-high-density", num: "06", label: "PB-01: High-Density Domiciles" },
                { href: "#pb-02-missing-dorm", num: "07", label: "PB-02: Missing Dorm & Units" },
                { href: "#pb-03-ncoa-drift", num: "08", label: "PB-03: Out-of-State Mail Drift" },
                { href: "#pb-04-po-box", num: "09", label: "PB-04: P.O. Box Domiciles" },
                { href: "#pb-05-clerical", num: "10", label: "PB-05: Clerical & 1801 Dates" },
                { href: "#pb-06-duplicates", num: "11", label: "PB-06: Suffix & Duplicate Audit" },
                { href: "#pb-07-08-precincts", num: "12", label: "PB-07 & 08: Spikes & Precincts" },
                { href: "#pb-09-benford", num: "13", label: "PB-09: First-Digit Distribution" },
                { href: "#pb-10-county-ledger", num: "14", label: "PB-10: 82-County Master Ledger" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline gap-2.5 py-2 text-[#4A4845] hover:text-[#D9381E] transition-colors"
                >
                  <span className="font-mono text-[10px] text-[#76736E]">{item.num}</span>
                  <span className="font-medium leading-snug">{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-[#E4E0D8] text-[11px] text-[#4A4845] space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#111111] font-bold">
                Zero-PII Standard
              </div>
              <p className="leading-relaxed">
                100% of voter names, birth dates, unmasked state IDs, and private single-family street numbers are redacted in accordance with statutory voter privacy protections.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Main Publication Spine */}
        <main className="min-w-0 space-y-14">
          {/* Masthead Title Block */}
          <section id="executive-summary" className="border-t-4 border-[#111111] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest text-[#4A4845] pb-4 border-b border-[#E4E0D8]">
              <span>MARIGOLD ELECTION HYGIENE PUBLICATIONS • STATEWIDE FORENSIC MONOGRAPH</span>
              <span className="text-[#D9381E] font-bold">
                100% ZERO-PII • DETERMINISTIC MATHEMATICAL AUDIT
              </span>
            </div>

            <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.06] text-[#111111]">
              Mississippi 82-County Voter Roll &amp; 25.91 Million Voting History Audit
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-[#4A4845] font-serif leading-relaxed max-w-4xl">
              A plain-English guide for County Election Commissioners, Circuit Clerks, and citizens—using 3D vector geometry, calculus variable isolation, and statistical correlations across{" "}
              <strong className="text-[#111111] font-semibold">2,112,460 registration records</strong> and{" "}
              <strong className="text-[#111111] font-semibold">25,911,640 historical ballots</strong> to separate harmless building quirks from real list-maintenance priorities.
            </p>

            {/* Top Hairline-Divided Key Metric Strip (No Heavy Cards) */}
            <div className="mt-8 border-y-2 border-[#111111] py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E]">
                  Voter Roll Audited
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  {metadata.totalRecords.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#4A4845] mt-0.5">
                  {metadata.activeVoters.toLocaleString()} Active • {metadata.inactiveVoters.toLocaleString()} Inactive
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E4E0D8] sm:pl-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E]">
                  Ballot History Joined
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  {votingHistoryAudit.totalHistoryRowsScanned.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#15803D] font-semibold mt-0.5">
                  100.00% Roll Match (0 Orphans)
                </div>
              </div>

              <div className="lg:border-l lg:border-[#E4E0D8] lg:pl-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E]">
                  2024 General Voters
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  {votingHistoryAudit.unique2024GeneralVoters.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#4A4845] mt-0.5">
                  {votingHistoryAudit.duplicate2024SameDayCreditRows} Duplicate Credit Rows
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E4E0D8] sm:pl-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E]">
                  3D Manifold Baseline
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  66 / 82
                </div>
                <div className="font-mono text-[11px] text-[#4A4845] mt-0.5">
                  Counties on Healthy Sheet (16 Detached)
                </div>
              </div>

              <div className="lg:border-l lg:border-[#E4E0D8] lg:pl-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E]">
                  False Positives Removed
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#D9381E] mt-1">
                  {(
                    playbooks.missingDorm.streetNameFalsePositivesRemoved +
                    playbooks.duplicates.generationalPairs +
                    playbooks.highDensity.institutionalVoters +
                    playbooks.highDensity.multiFamilyVoters
                  ).toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#4A4845] mt-0.5">
                  Dorms, Nursing Homes, Jr/Sr &amp; Street Names
                </div>
              </div>

              <div className="sm:border-l sm:border-[#E4E0D8] sm:pl-5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E]">
                  Privacy Compliance
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#15803D] mt-1">
                  Zero-PII
                </div>
                <div className="font-mono text-[11px] text-[#4A4845] mt-0.5">
                  0 Names • 100-Block Masking
                </div>
              </div>
            </div>

            {/* Plain-English Opening Narrative */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-[15px] leading-[1.7] text-[#222220]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#111111] mb-2">
                  Why Raw Anomaly Counts Mislead Election Officials—and How We Fixed It
                </h3>
                <p>
                  When a traditional spreadsheet script scans a statewide voter file, it flags every nursing home, college dormitory, apartment building, father-and-son pair sharing a family name, and street named <em>&ldquo;Marshall Place&rdquo;</em> or <em>&ldquo;Halls Ferry Road&rdquo;</em> as a suspected irregularity. That buries County Election Commissioners under thousands of false alarms.
                </p>
                <p className="mt-3">
                  In this Draft 2 edition, every single playbook has been hardened with deterministic mathematical filters: whole-word regular expressions, institutional facility classification, Active-versus-Inactive statutory status separation, and a cross-table join against all{" "}
                  <strong>25,911,640 historical ballots cast</strong> in Mississippi.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#111111] mb-2">
                  How 3D Geometry &amp; Variable Isolation Help Counties Work Together
                </h3>
                <p>
                  A single 1-to-100 score cannot tell an Election Commissioner whether their county needs to add apartment unit numbers (like Oktibbeha and Lafayette Counties), process out-of-state mail forwardings (like Harrison and Hinds Counties), or split overcrowded 6,000-voter polling places (like DeSoto and Madison Counties).
                </p>
                <p className="mt-3">
                  By plotting every county along three independent axes—<strong>X (Address Crowding)</strong>, <strong>Y (Mail &amp; Duplicate Drift)</strong>, and <strong>Z (Polling Place Strain)</strong>—and using calculus rates of change to hold two axes steady while measuring the third, every Commissioner can see their county&apos;s exact maintenance recipe at a glance.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 02: Interactive Three.js 3D Threat Manifold */}
          <section id="manifold-3d" className="border-t-2 border-[#111111] pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 02 • 3D Vector Geometry &amp; Calculus Variable Isolation
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  The Mississippi 3D Threat Manifold Explorer
                </h2>
              </div>
              <span className="font-mono text-xs text-[#4A4845]">
                State Vector: {threatManifold.equations.stateVector}
              </span>
            </div>

            <p className="text-[15px] text-[#4A4845] leading-relaxed mb-6 max-w-4xl">
              Use the interactive Three.js 3D model below to orbit all 82 counties, or click the variable-isolation buttons to project counties onto a single axis. When printed, the table immediately beneath this viewer provides the complete 16-county detached priority breakdown.
            </p>

            {/* Interactive Three.js Component (Hidden on Print to save ink, replaced by clean table below) */}
            <div className="print:hidden">
              <ThreatManifold3DExplorer compact={true} />
            </div>

            {/* Print & Editorial Table: Top 16 Priority Detached Counties */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-serif text-xl font-bold text-[#111111]">
                  Table 2.1 — The 16 Counties Detaching Above the Normal Statewide Surface (Variable Isolation Breakdown)
                </h3>
                <span className="font-mono text-[11px] text-[#76736E]">
                  66 of 82 Counties Sit on the Healthy Baseline Sheet
                </span>
              </div>

              <div className="overflow-x-auto border-y border-[#111111]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#111111] font-mono text-[10px] uppercase tracking-wider text-[#4A4845]">
                      <th className="py-2.5 pr-3">Rank &amp; County</th>
                      <th className="py-2.5 px-2 text-right">Total Roll</th>
                      <th className="py-2.5 px-2 text-right">X (Address)</th>
                      <th className="py-2.5 px-2 text-right">Y (Mail/Dup)</th>
                      <th className="py-2.5 px-2 text-right">Z (Precinct)</th>
                      <th className="py-2.5 px-2 text-right">Baseline Z_eq</th>
                      <th className="py-2.5 px-2 text-right">Signal Energy</th>
                      <th className="py-2.5 px-3">Variable Isolation Share (X / Y / Z)</th>
                      <th className="py-2.5 pl-3">Primary Maintenance Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E0D8]">
                    {threatManifold.countyVectors.slice(0, 16).map((c, i) => (
                      <tr key={c.county} className="hover:bg-[#F5F2EB]/60">
                        <td className="py-2.5 pr-3 font-semibold text-[#111111] whitespace-nowrap">
                          <span className="font-mono text-[10px] text-[#76736E] mr-1.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {c.county}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          {c.total.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">{c.x}</td>
                        <td className="py-2.5 px-2 text-right font-mono">{c.y}</td>
                        <td className="py-2.5 px-2 text-right font-mono">{c.z}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-[#4A4845]">
                          {c.manifoldZ}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-[#D9381E]">
                          {c.threatEnergy}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                          {c.partialX}% X • {c.partialY}% Y • {c.partialZ}% Z
                        </td>
                        <td className="py-2.5 pl-3 text-[#4A4845]">{c.dominantDriver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 03: Mathematical Correlations & Calculus Rates of Change */}
          <section id="mathematical-correlations" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 03 • Statewide Mathematical Correlations &amp; Rates of Change
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              How Voter Roll Issues Connect Across All 82 Counties—In Plain English
            </h2>
            <p className="mt-2 text-[15px] text-[#4A4845] leading-relaxed max-w-4xl">
              To help Election Commissioners see which cleanup actions deliver the biggest return on effort, we computed exact Pearson linear correlations (<em>r</em>), Spearman rank correlations (<em>ρ</em>), and calculus rates of change across all 82 counties. Here is what the math proves in everyday terms:
            </p>

            <div className="mt-6 overflow-x-auto border-y border-[#111111]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#111111] font-mono text-[10px] uppercase tracking-wider text-[#4A4845]">
                    <th className="py-3 pr-4">Correlation Finding</th>
                    <th className="py-3 px-3 text-right">Pearson r</th>
                    <th className="py-3 px-3 text-right">Spearman ρ</th>
                    <th className="py-3 px-4">Rate of Change (Slope)</th>
                    <th className="py-3 pl-4">Plain-English Takeaway for Election Commissioners</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]">
                  {correlations.map((corr) => (
                    <tr key={corr.id} className="align-top">
                      <td className="py-3.5 pr-4 min-w-[210px]">
                        <div className="font-mono text-[10px] text-[#D9381E] font-bold">
                          {corr.id} • {corr.strength}
                        </div>
                        <div className="font-serif font-bold text-sm text-[#111111] mt-0.5">
                          {corr.plainTitle}
                        </div>
                        <div className="text-[11px] text-[#76736E] mt-0.5">{corr.pairLabel}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-[#111111] whitespace-nowrap">
                        +{corr.pearsonR.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#4A4845] whitespace-nowrap">
                        +{corr.spearmanRho.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 text-[#222220] min-w-[200px] leading-relaxed">
                        {corr.rateOfChange}
                      </td>
                      <td className="py-3.5 pl-4 text-[#4A4845] min-w-[270px] leading-relaxed">
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
              Section 04 • County-to-County Peer Benchmarking &amp; Evangelism Guide
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              {commissionerToolkit.headline}
            </h2>
            <p className="mt-2 text-[15px] text-[#4A4845] leading-relaxed max-w-4xl">
              {commissionerToolkit.subheadline}
            </p>

            {/* 3-Step Evangelism Spine */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-[#111111] py-6">
              {commissionerToolkit.evangelismSteps.map((st) => (
                <div
                  key={st.step}
                  className="md:border-r md:last:border-r-0 border-[#E4E0D8] md:pr-5"
                >
                  <div className="font-mono text-xs font-bold text-[#D9381E]">
                    STEP {st.step}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#111111] mt-1">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#4A4845] mt-2 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>

            {/* Peer Tier Comparison Table */}
            <div className="mt-6 overflow-x-auto border-b border-[#111111]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#111111] font-mono text-[10px] uppercase tracking-wider text-[#4A4845]">
                    <th className="py-2.5 pr-4">Mississippi County Peer Group</th>
                    <th className="py-2.5 px-4">Representative Peer Counties</th>
                    <th className="py-2.5 px-4">Group Benchmark</th>
                    <th className="py-2.5 pl-4">Recommended Commissioner Action Recipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]">
                  {commissionerToolkit.peerTiers.map((tier) => (
                    <tr key={tier.tier} className="align-top">
                      <td className="py-3 pr-4 font-serif font-bold text-sm text-[#111111] min-w-[200px]">
                        {tier.tier}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#4A4845] min-w-[210px]">
                        {tier.counties.join(", ")}
                      </td>
                      <td className="py-3 px-4 text-[#222220] min-w-[200px]">
                        {tier.benchmarkMetric}
                      </td>
                      <td className="py-3 pl-4 text-[#4A4845] leading-relaxed">
                        {tier.primaryFocus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 05: 25.91 Million Voting History Audit */}
          <section id="voting-history-forensics" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 05 • Cross-Table Referential Integrity &amp; Turnout Audit
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              25,911,640 Historical Ballots Joined Against the Live Voter Roll
            </h2>
            <p className="mt-2 text-[15px] text-[#4A4845] leading-relaxed max-w-4xl">
              We joined every row of the statewide Voting History file (<code>Weekly Distribution_kkirkpatrick_10262026_94VotingHistory.csv</code>, 1.38 GB) against the 2,112,460-row Master Voter Roll by unique Voter ID:
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-[#111111] py-4">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#76736E]">
                  Orphaned History Rows
                </div>
                <div className="font-serif text-2xl font-bold text-[#15803D] mt-0.5">
                  0 (0.000%)
                </div>
                <div className="text-[11px] text-[#4A4845]">
                  All 25,911,640 ballots match a valid roll ID
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[#76736E]">
                  Voters With Ballot History
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {votingHistoryAudit.uniqueVotersWithHistory.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#4A4845]">79.92% of total registered roll</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[#76736E]">
                  Zero-Vote-History Registrants
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {votingHistoryAudit.votersWithZeroHistory.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#4A4845]">20.08% never recorded a ballot</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase text-[#76736E]">
                  2024 Same-Day Duplicate Credits
                </div>
                <div className="font-serif text-2xl font-bold text-[#D9381E] mt-0.5">
                  {votingHistoryAudit.duplicate2024SameDayCreditRows}
                </div>
                <div className="text-[11px] text-[#4A4845]">
                  Out of 1,213,364 general election voters (0.007%)
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto border-b border-[#111111]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#111111] font-mono text-[10px] uppercase tracking-wider text-[#4A4845]">
                    <th className="py-2.5 pr-4">Election Date</th>
                    <th className="py-2.5 px-4">Statewide Election Cycle</th>
                    <th className="py-2.5 px-4 text-right">Verified Ballots Recorded</th>
                    <th className="py-2.5 pl-4">Audit Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]">
                  {votingHistoryAudit.majorElections.map((el) => (
                    <tr key={el.date}>
                      <td className="py-2.5 pr-4 font-mono font-semibold text-[#111111]">
                        {el.date}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#111111]">{el.label}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[#111111]">
                        {el.ballotsRecorded.toLocaleString()}
                      </td>
                      <td className="py-2.5 pl-4 font-mono text-[11px] text-[#15803D]">
                        100% Matched to Active/Inactive Roll
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
              Section 06 • Playbook 01 — Spatial Domicile Density (≥ 8 Voters per Parcel)
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              Separating Nursing Homes &amp; Universities from Single-Family Houses
            </h2>
            <p className="mt-2 text-[15px] text-[#4A4845] leading-relaxed max-w-4xl">
              After normalizing street strings (collapsing double spaces in{" "}
              <code>1400 J R LYNCH ST</code> at Jackson State University), Mississippi has{" "}
              <strong>{playbooks.highDensity.totalAddresses.toLocaleString()} addresses</strong> with 8 or more registered voters ({playbooks.highDensity.totalVoters.toLocaleString()} total voters). However, when we filter out Inactive voters waiting on statutory NVRA removal and separate institutional facilities, the true picture emerges:
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 border-y border-[#111111] py-4 text-xs">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#15803D] font-bold">
                  1. Institutional &amp; University Hubs
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {playbooks.highDensity.institutionalClusters} Parcels ({playbooks.highDensity.institutionalVoters.toLocaleString()} Voters)
                </div>
                <p className="text-[#4A4845] mt-1">
                  University dorms (JSU, Ole Miss, MSU, Alcorn, Rust College), nursing homes, and state facilities. Expected high density.
                </p>
              </div>
              <div className="sm:border-l border-[#E4E0D8] sm:pl-5">
                <div className="font-mono text-[10px] uppercase text-[#4A4845] font-bold">
                  2. Un-Unitized Apartment Complexes
                </div>
                <div className="font-serif text-2xl font-bold text-[#111111] mt-0.5">
                  {playbooks.highDensity.multiFamilyClusters} Parcels ({playbooks.highDensity.multiFamilyVoters.toLocaleString()} Voters)
                </div>
                <p className="text-[#4A4845] mt-1">
                  Multi-family apartment complexes and mobile home parks where tenants registered without listing their apartment or lot number.
                </p>
              </div>
              <div className="sm:border-l border-[#E4E0D8] sm:pl-5">
                <div className="font-mono text-[10px] uppercase text-[#D9381E] font-bold">
                  3. Single-Family Houses (Actionable)
                </div>
                <div className="font-serif text-2xl font-bold text-[#D9381E] mt-0.5">
                  {playbooks.highDensity.singleFamilyAnomalies.toLocaleString()} Parcels ({playbooks.highDensity.singleFamilyAnomalyVoters.toLocaleString()} Voters)
                </div>
                <p className="text-[#4A4845] mt-1">
                  Private residential parcels where prior tenants moved away over multiple election cycles without cancelling registration.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Institutional / Multi-Unit Clusters */}
              <div>
                <h3 className="font-serif text-base font-bold text-[#111111] mb-2">
                  Table 6.1 — Largest Statewide High-Density Parcels (Normalized)
                </h3>
                <div className="overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-2">Address &amp; City</th>
                        <th className="py-2 px-2">County</th>
                        <th className="py-2 px-2 text-right">Total (Active)</th>
                        <th className="py-2 pl-2">Facility Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {playbooks.highDensity.topClusters.slice(0, 10).map((c, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-2 font-mono text-[11px] text-[#111111]">
                            {c.address}, {c.city}
                          </td>
                          <td className="py-2 px-2">{c.county}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold">
                            {c.occupantCount.toLocaleString()} ({c.activeOccupantCount.toLocaleString()})
                          </td>
                          <td className="py-2 pl-2 text-[11px] text-[#4A4845]">
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
                  Table 6.2 — Top Single-Family Residential Anomalies (100-Block Masked for Privacy)
                </h3>
                <div className="overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-2">Anonymized Residential Block</th>
                        <th className="py-2 px-2">County</th>
                        <th className="py-2 px-2 text-right">Total</th>
                        <th className="py-2 pl-2 text-right">Active / Inactive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {playbooks.highDensity.topSingleFamilyAnomalies.slice(0, 10).map((c, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-2 font-mono text-[11px] text-[#111111]">
                            {c.address}, {c.city}
                          </td>
                          <td className="py-2 px-2">{c.county}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-[#D9381E]">
                            {c.occupantCount}
                          </td>
                          <td className="py-2 pl-2 text-right font-mono text-[11px]">
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
              Section 07 • Playbook 02 — Whole-Word Regex &amp; Street-Name False Positive Removal
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
              How Whole-Word Matching Eliminated 4,346 False Alarms on &ldquo;Hall&rdquo; &amp; &ldquo;University&rdquo; Streets
            </h2>
            <p className="mt-2 text-[15px] text-[#4A4845] leading-relaxed max-w-4xl">
              Naive substring searches for <code>&quot;HALL&quot;</code> or <code>&quot;UNIVERSITY&quot;</code> falsely flag thousands of private homes on streets like{" "}
              <em>Marshall Place</em>, <em>Halls Ferry Road</em>, <em>University Avenue</em>, and <em>College Hill Road</em>. By enforcing strict whole-word boundary matching (<code>\b(HALL|DORM|...)\b</code>) and separating university municipalities from residential street suffixes, we removed{" "}
              <strong>{playbooks.missingDorm.streetNameFalsePositivesRemoved.toLocaleString()} false-positive street matches</strong>—isolating the{" "}
              <strong>{playbooks.missingDorm.totalVoters.toLocaleString()} verified campus/multi-unit records ({playbooks.missingDorm.activeVoters.toLocaleString()} Active)</strong> that genuinely lack a room or apartment number.
            </p>

            <div className="mt-5 overflow-x-auto border-y border-[#111111]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                    <th className="py-2.5 pr-4">Verified Campus / Multi-Unit Building Address</th>
                    <th className="py-2.5 px-4">Municipality</th>
                    <th className="py-2.5 px-4">County</th>
                    <th className="py-2.5 pl-4 text-right">Registrations Missing Room/Unit #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]">
                  {playbooks.missingDorm.campusBreakdown.slice(0, 10).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-4 font-mono font-semibold text-[#111111]">
                        {item.address}
                      </td>
                      <td className="py-2.5 px-4">{item.city}</td>
                      <td className="py-2.5 px-4">{item.county}</td>
                      <td className="py-2.5 pl-4 text-right font-mono font-bold text-[#D9381E]">
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
              {/* PB-03 */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 08 • Playbook 03 — Out-of-State Mail Drift
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  2,444 Active Voters With Out-of-State Mailing Addresses
                </h2>
                <p className="mt-2 text-xs text-[#4A4845] leading-relaxed">
                  Across the total roll, <strong>{playbooks.ncoaRelocations.totalAllStatusVoters.toLocaleString()} records</strong> carry an out-of-state mailing address. Crucially, election officials have already moved{" "}
                  <strong>{playbooks.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} (82.1%)</strong> of those voters to <strong>Inactive</strong> status pending statutory NVRA cancellation. Only{" "}
                  <strong>{playbooks.ncoaRelocations.totalVoters.toLocaleString()} Active voters</strong> require an address confirmation notice (led by contiguous border states TN, TX, AL, LA, and FL).
                </p>

                <div className="mt-4 overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-3">Destination State</th>
                        <th className="py-2 px-3 text-right">Total Roll Records</th>
                        <th className="py-2 pl-3">Border / Military Corridor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {Object.entries(playbooks.ncoaRelocations.stateBreakdown)
                        .slice(0, 8)
                        .map(([st, cnt]) => (
                          <tr key={st}>
                            <td className="py-2 pr-3 font-mono font-bold text-[#111111]">{st}</td>
                            <td className="py-2 px-3 text-right font-mono">
                              {(cnt as number).toLocaleString()}
                            </td>
                            <td className="py-2 pl-3 text-[#4A4845]">
                              {["TN", "AL", "LA", "AR"].includes(st)
                                ? "Contiguous State Border Commuter Corridor"
                                : "Interstate / Military / Student Relocation"}
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
                  Section 09 • Playbook 04 — Non-Physical Domiciles
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  339 P.O. Box &amp; PMB Strings in the Physical Residence Field
                </h2>
                <p className="mt-2 text-xs text-[#4A4845] leading-relaxed">
                  Mississippi law requires a physical residential location for precinct assignment, while P.O. Boxes belong in the separate Mailing Address columns. Only{" "}
                  <strong>{playbooks.commercialPOBox.totalVoters} records statewide ({playbooks.commercialPOBox.activeVoters} Active, {playbooks.commercialPOBox.inactiveVoters} Inactive)</strong> have a P.O. Box or Private Mail Box accidentally typed into the physical street line.
                </p>

                <div className="mt-4 overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-2">Zero-PII Token</th>
                        <th className="py-2 px-2">Recorded Residence Line</th>
                        <th className="py-2 px-2">County</th>
                        <th className="py-2 pl-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {playbooks.commercialPOBox.samples.slice(0, 8).map((s) => (
                        <tr key={s.recordToken}>
                          <td className="py-2 pr-2 font-mono text-[11px] text-[#76736E]">
                            {s.recordToken}
                          </td>
                          <td className="py-2 px-2 font-mono text-[11px] text-[#111111]">
                            {s.address}, {s.city}
                          </td>
                          <td className="py-2 px-2">{s.county}</td>
                          <td className="py-2 pl-2 text-right font-mono text-[11px]">
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
                  Section 10 • Playbook 05 — Legacy Database Migration Artifacts
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  5,607 Clerical &amp; Legacy Date Records (1801 / 0001 / DATAMIGRATION)
                </h2>
                <p className="mt-2 text-xs text-[#4A4845] leading-relaxed">
                  When counties migrated paper registration books into electronic SEMS records in the early 2000s, records missing a legible registration date were assigned default system placeholders like{" "}
                  <code>01/01/1801</code> (1,271 rows) or <code>01/01/0001</code> (206 rows), or the literal street string <code>DATAMIGRATION</code> (113 rows in Warren and Simpson Counties).
                </p>

                <div className="mt-4 overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-3">Artifact Category / Placeholder Year</th>
                        <th className="py-2 px-3 text-right">Statewide Count</th>
                        <th className="py-2 pl-3">Root Administrative Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {Object.entries(playbooks.clericalTypos.yearBreakdown)
                        .slice(0, 7)
                        .map(([k, v]) => (
                          <tr key={k}>
                            <td className="py-2 pr-3 font-mono font-semibold text-[#111111]">
                              {k}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              {(v as number).toLocaleString()}
                            </td>
                            <td className="py-2 pl-3 text-[#4A4845]">
                              {k === "TRUNCATED_NAME_1CHAR"
                                ? "Initial-only first or last name field"
                                : k === "DATAMIGRATION_ADDR"
                                ? "Legacy county import placeholder string"
                                : "Pre-electronic registration date placeholder"}
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
                  Section 11 • Playbook 06 — Generational Suffix &amp; Duplicate Audit
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  4,404 Jr./Sr. Pairs Protected • 818 Active Intra-ZIP Duplicates Isolated
                </h2>
                <p className="mt-2 text-xs text-[#4A4845] leading-relaxed">
                  Marigold protects <strong>{playbooks.duplicates.generationalPairs.toLocaleString()} father/son Jr./Sr./III households</strong> from false duplicate flags. Within the same ZIP code, only{" "}
                  <strong>{playbooks.duplicates.trueDuplicates.toLocaleString()} exact First+Middle+Last+Suffix clusters</strong> exist at multiple addresses: <strong>{playbooks.duplicates.activeActiveDuplicates} Active–Active</strong>,{" "}
                  <strong>{playbooks.duplicates.activeInactiveMoveTrails} Active–Inactive move trails</strong>, and{" "}
                  <strong>{playbooks.duplicates.inactiveInactiveDuplicates} Inactive–Inactive</strong>. (Across county lines statewide, there are {playbooks.duplicates.crossCountyActiveDuplicates.toLocaleString()} exact active name+suffix matches that require Birth Year verification in SEMS.)
                </p>

                <div className="mt-4 overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-2">Cluster Token</th>
                        <th className="py-2 px-2">County &amp; ZIP</th>
                        <th className="py-2 px-2 text-right">Records (Act)</th>
                        <th className="py-2 pl-2">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {playbooks.duplicates.sampleClusters.slice(0, 7).map((d) => (
                        <tr key={d.clusterId}>
                          <td className="py-2 pr-2 font-mono font-bold text-[#111111]">
                            {d.clusterId}
                          </td>
                          <td className="py-2 px-2">
                            {d.county} ({d.zip})
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {d.recordCount} ({d.activeRecords} Act)
                          </td>
                          <td className="py-2 pl-2 text-[#4A4845]">{d.classification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 12 & 13: Playbooks 07, 08 (Spikes & Precinct Capacity) & Playbook 09 (Benford's Law) */}
          <section id="pb-07-08-precincts" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* PB-08 & PB-07 */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 12 • Playbooks 07 &amp; 08 — Statutory Deadlines &amp; Mega-Precincts
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  123 Precincts Exceed 3,000 Voters (27 Exceed 5,000 Voters)
                </h2>
                <p className="mt-2 text-xs text-[#4A4845] leading-relaxed">
                  Registration spikes align with Mississippi&apos;s 30-day mail-in registration deadline before Presidential elections (peaking at{" "}
                  <strong>13,731 on 10/05/2020</strong>, <strong>11,240 on 10/03/2008</strong>, and{" "}
                  <strong>7,867 on 10/07/2024</strong>). Meanwhile, rapid suburban growth in DeSoto, Madison, Rankin, and Harrison Counties has pushed{" "}
                  <strong>{playbooks.precinctCapacity.overCapacityCount} of {playbooks.precinctCapacity.totalPrecincts.toLocaleString()} precincts</strong> above the 3,000-voter benchmark.
                </p>

                <div className="mt-4 overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-2">Precinct Code &amp; Name</th>
                        <th className="py-2 px-2">County</th>
                        <th className="py-2 px-2 text-right">Total Voters</th>
                        <th className="py-2 pl-2 text-right">Active Voters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {playbooks.precinctCapacity.topOverCapacity.slice(0, 8).map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-2 font-mono text-[11px] font-semibold text-[#111111]">
                            {p.precinctCode} — {p.precinctName}
                          </td>
                          <td className="py-2 px-2">{p.county}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-[#D9381E]">
                            {p.voterCount.toLocaleString()}
                          </td>
                          <td className="py-2 pl-2 text-right font-mono">
                            {p.activeVoterCount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PB-09: Benford's Law */}
              <div id="pb-09-benford">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 13 • Playbook 09 — First-Digit Scale-Invariance Test
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#111111] mt-1">
                  Why Total Roll Passes Benford&apos;s Law (χ² = 6.94) While Turnout Clusters at Digits 2–4
                </h2>
                <p className="mt-2 text-xs text-[#4A4845] leading-relaxed">
                  Across all 1,742 precincts, total registration volume spans four orders of magnitude and passes Benford&apos;s Law cleanly (<strong>χ² = 6.94 &lt; 15.51 critical threshold</strong>). Conversely, 2024 General Election precinct turnout yields <strong>χ² = 71.15</strong> because County Election Commissions intentionally design precincts around 500–2,500 voters, causing turnout counts to cluster naturally in the 200–499 range (leading digits 2, 3, and 4).
                </p>

                <div className="mt-4 overflow-x-auto border-y border-[#111111]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                        <th className="py-2 pr-2">Leading Digit</th>
                        <th className="py-2 px-2 text-right">Benford Expected %</th>
                        <th className="py-2 px-2 text-right">Roll Observed % (PASS)</th>
                        <th className="py-2 pl-2 text-right">2024 Turnout %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E0D8]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
                        const key = String(d) as keyof typeof playbooks.benfordsLaw.expected;
                        return (
                          <tr key={d}>
                            <td className="py-1.5 pr-2 font-mono font-bold text-[#111111]">
                              Digit {d}
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-[#4A4845]">
                              {playbooks.benfordsLaw.expected[key]}%
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono font-semibold text-[#15803D]">
                              {playbooks.benfordsLaw.observedPct[key]}%
                            </td>
                            <td className="py-1.5 pl-2 text-right font-mono text-[#4A4845]">
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

          {/* SECTION 14: Playbook 10 — Complete 82-County Master Benchmark Ledger */}
          <section id="pb-10-county-ledger" className="border-t-2 border-[#111111] pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 14 • Playbook 10 — Complete 82-County Master Ledger
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#111111] mt-1">
                  All 82 Mississippi Counties Ranked by 3D Manifold &amp; List-Maintenance Metrics
                </h2>
              </div>

              {/* Filter Bar (Hidden in Print) */}
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#76736E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    placeholder="Filter county..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-[#D4CFC7] bg-white rounded focus:outline-none focus:border-[#111111]"
                  />
                </div>
                {(["ALL", "DETACHED", "BASELINE"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTierFilter(tf)}
                    className={`px-2.5 py-1.5 text-[11px] font-mono uppercase rounded border cursor-pointer ${
                      tierFilter === tf
                        ? "bg-[#111111] text-white border-[#111111]"
                        : "bg-white text-[#4A4845] border-[#D4CFC7]"
                    }`}
                  >
                    {tf === "ALL"
                      ? "All 82"
                      : tf === "DETACHED"
                      ? "16 Detached"
                      : "66 Baseline"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border-y-2 border-[#111111]">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-[#111111] font-mono text-[10px] uppercase text-[#4A4845]">
                    <th className="py-2.5 pr-2">County</th>
                    <th className="py-2.5 px-2 text-right">Total Roll</th>
                    <th className="py-2.5 px-2 text-right">Active</th>
                    <th className="py-2.5 px-2 text-right">2024 Votes</th>
                    <th className="py-2.5 px-2 text-right">PB-01 HD</th>
                    <th className="py-2.5 px-2 text-right">PB-02 Dorm</th>
                    <th className="py-2.5 px-2 text-right">PB-03 NCOA</th>
                    <th className="py-2.5 px-2 text-right">PB-06 Dup</th>
                    <th className="py-2.5 px-2 text-right">PB-08 &gt;3k</th>
                    <th className="py-2.5 px-2 text-right">3D &lt;X,Y,Z&gt;</th>
                    <th className="py-2.5 px-2 text-right">Signal</th>
                    <th className="py-2.5 pl-2">Manifold Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]">
                  {filteredCountyVectors.map((c) => (
                    <tr key={c.county} className="hover:bg-[#F5F2EB]/50">
                      <td className="py-2 pr-2 font-semibold text-[#111111] whitespace-nowrap">
                        {c.county}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {c.total.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-[#4A4845]">
                        {c.active.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {c.votes2024General.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">{c.highDensityCount}</td>
                      <td className="py-2 px-2 text-right font-mono">{c.missingDormCount}</td>
                      <td className="py-2 px-2 text-right font-mono">{c.ncoaCount}</td>
                      <td className="py-2 px-2 text-right font-mono">{c.duplicateCount}</td>
                      <td className="py-2 px-2 text-right font-mono">{c.overCapacityPrecincts}</td>
                      <td className="py-2 px-2 text-right font-mono text-[10px] whitespace-nowrap">
                        &lt;{c.x}, {c.y}, {c.z}&gt;
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-[#D9381E]">
                        {c.threatEnergy}
                      </td>
                      <td className="py-2 pl-2 text-[10px] text-[#4A4845] whitespace-nowrap">
                        {c.regime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Right Column: Marginalia & Commissioner Quick-Reference Rail (Hidden in Print) */}
        <aside className="hidden xl:block print:hidden">
          <div className="sticky top-22 border-t-2 border-[#111111] pt-4 space-y-6 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#D9381E] font-bold">
                Commissioner Quick Brief
              </div>
              <h3 className="font-serif text-base font-bold text-[#111111] mt-1">
                What to Tell Your County Board &amp; Circuit Clerk
              </h3>
              <p className="text-[#4A4845] mt-2 leading-relaxed">
                1. <strong>98.7% of Mississippi&apos;s roll is clean.</strong> Out of 2.11 million records and 25.91 million historical ballots, 0 orphaned ballots exist and 66 of 82 counties sit squarely on the healthy demographic surface.
              </p>
              <p className="text-[#4A4845] mt-2 leading-relaxed">
                2. <strong>False alarms are already stripped out.</strong> Nursing homes, college dorms, Jr./Sr. fathers and sons, and street names like <em>Marshall Pl</em> have already been separated from residential houses.
              </p>
              <p className="text-[#4A4845] mt-2 leading-relaxed">
                3. <strong>Every county gets its own recipe.</strong> Use the 3D Manifold to check whether your county is an <strong>Axis-X</strong> (housing unit), <strong>Axis-Y</strong> (out-of-state mail), or <strong>Axis-Z</strong> (polling place capacity) county.
              </p>
            </div>

            <div className="border-t border-[#E4E0D8] pt-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#76736E] font-bold">
                Key Mathematical Constants
              </div>
              <dl className="mt-2 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <dt className="text-[#4A4845]">NCOA vs. Dup r:</dt>
                  <dd className="font-bold text-[#111111]">+0.674</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#4A4845]">Roll vs. HD r:</dt>
                  <dd className="font-bold text-[#111111]">+0.848</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#4A4845]">Benford Roll χ²:</dt>
                  <dd className="font-bold text-[#15803D]">6.94 (PASS)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#4A4845]">Baseline Slope dZ/dX:</dt>
                  <dd className="font-bold text-[#111111]">+0.34</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#4A4845]">Baseline Slope dZ/dY:</dt>
                  <dd className="font-bold text-[#111111]">+0.29</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-[#E4E0D8] pt-4 space-y-2">
              <Link
                href="/manifold"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded border border-[#111111] bg-[#111111] text-white font-semibold hover:bg-[#2A2927]"
              >
                <span>Open 3D Manifold Explorer</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#D9381E]" />
              </Link>
              <Link
                href="/updates"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded border border-[#D4CFC7] bg-white text-[#111111] font-semibold hover:bg-[#F5F2EB]"
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
