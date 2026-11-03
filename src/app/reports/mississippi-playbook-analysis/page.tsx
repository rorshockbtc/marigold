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
  BookOpen,
  Share2,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const FRIENDLY_REGIME_MAP: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "Needs Attention in All 3 Areas",
  "Axis-X Spatial Domicile Ridge": "Focus 1: Apartment & Dorm Unit #s",
  "Axis-Y Interstate Drift Ridge": "Focus 2: Out-of-State Mail & Dups",
  "Axis-Z Precinct Strain Ridge": "Focus 3: Large Precincts (3,000+)",
  "Equilibrium Manifold Surface": "On Track: Normal County Range",
};

export default function MississippiPlaybookAnalysisReportPage() {
  const [countySearch, setCountySearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"ALL" | "DETACHED" | "BASELINE">("ALL");
  const [quickCountyName, setQuickCountyName] = useState("Hinds");
  const [copiedSummary, setCopiedSummary] = useState(false);

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

  const selectedQuickCounty = useMemo(() => {
    return (
      threatManifold.countyVectors.find(
        (c) => c.county.toLowerCase() === quickCountyName.toLowerCase()
      ) || threatManifold.countyVectors[0]
    );
  }, [threatManifold.countyVectors, quickCountyName]);

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

  const handleCopyBrief = () => {
    const text = [
      `MISSISSIPPI 82-COUNTY VOTER ROLL SUMMARY (${selectedQuickCounty.county.toUpperCase()} COUNTY)`,
      `• Statewide Roll Checked: 2,112,460 Voters + 25,911,640 Past Ballots (100% Matched, 0 Unmatched Ballots)`,
      `• False Alarms Filtered Out: 18,093 (Nursing homes, dorms, Jr./Sr. families & street names removed)`,
      `• ${selectedQuickCounty.county} County Registered Voters: ${selectedQuickCounty.total.toLocaleString()} (${selectedQuickCounty.active.toLocaleString()} Active)`,
      `• ${selectedQuickCounty.county} County Status: ${FRIENDLY_REGIME_MAP[selectedQuickCounty.regime] || selectedQuickCounty.regime}`,
      `• ${selectedQuickCounty.county} County Checklist: ${selectedQuickCounty.highDensityCount} high-density addresses, ${selectedQuickCounty.ncoaCount} active out-of-state mailings, ${selectedQuickCounty.overCapacityPrecincts} precincts over 3,000 voters.`,
      `• Full Public Report (100% Zero-PII): https://marigoldinsights.org/reports/mississippi-playbook-analysis`,
    ].join("\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#111111] selection:bg-[#D9381E]/15 selection:text-[#D9381E] print:bg-white overflow-x-hidden">
      {/* Clean, Mobile-First Top Bar (Zero Overflow on 390px Phones) */}
      <header className="sticky top-0 z-40 border-b-2 border-[#111111] bg-[#FCFBF9]/95 backdrop-blur print:hidden">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-8 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/overview"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#D9381E] transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Marigold Home</span>
            </Link>
            <span className="hidden md:inline text-[#BDB6AC]">|</span>
            <Link
              href="/updates"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#3A3530] hover:text-[#D9381E] shrink-0"
            >
              What&apos;s New
            </Link>
            <span className="hidden xl:inline text-[#BDB6AC]">|</span>
            <span className="hidden xl:inline font-mono text-[11px] uppercase tracking-widest text-[#15803D] font-bold truncate">
              100% Zero-PII Public Edition • No Login Required
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/manifold"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#111111] border-2 border-[#111111] bg-white hover:bg-[#F5F2EB] px-2.5 sm:px-3 py-1.5 rounded transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#D9381E] shrink-0" />
              <span className="hidden sm:inline">Full-Screen</span> 3D Map
            </Link>
            <button
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] border border-[#111111] bg-white hover:bg-[#F5F2EB] px-3 py-1.5 rounded cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download="Marigold-Mississippi-Playbook-Analysis.pdf"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white bg-[#111111] hover:bg-[#2A2927] px-2.5 sm:px-3.5 py-1.5 rounded"
            >
              <Download className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span>PDF</span>
              <span className="hidden sm:inline">Guide</span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Jump-To-Section Bar (Visible on Phones & Tablets) */}
      <div className="lg:hidden border-b border-[#D8D2C7] bg-white px-3 py-2 flex items-center gap-2 overflow-x-auto text-xs font-bold whitespace-nowrap print:hidden">
        <span className="font-mono text-[10px] uppercase text-[#D9381E] shrink-0">Jump:</span>
        <a href="#key-takeaways" className="px-2 py-1 rounded bg-[#F5F2EB] text-[#111111]">
          Key Takeaways
        </a>
        <a href="#action-items" className="px-2 py-1 rounded bg-[#F5F2EB] text-[#111111]">
          Action Items
        </a>
        <a href="#manifold-3d" className="px-2 py-1 rounded bg-[#F5F2EB] text-[#111111]">
          3D County Map
        </a>
        <a href="#pb-10-county-ledger" className="px-2 py-1 rounded bg-[#F5F2EB] text-[#111111]">
          All 82 Counties
        </a>
      </div>

      {/* Accént 3-Column Publication Spine */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-12 grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_250px] gap-8 lg:gap-10 print:block print:max-w-none print:p-0">
        {/* Left Column: Sticky Section Index Rail (Desktop) */}
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-20 border-t-2 border-[#111111] pt-4 text-xs">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#111111] font-bold mb-3">
              Quick Navigation
            </div>
            <nav className="divide-y divide-[#D8D2C7] border-b border-[#111111]">
              {[
                { href: "#key-takeaways", num: "01", label: "Key Takeaways & Action Items" },
                { href: "#manifold-3d", num: "02", label: "Interactive 3D County Map" },
                { href: "#mathematical-correlations", num: "03", label: "2-for-1 Cleanup Connections" },
                { href: "#commissioner-toolkit", num: "04", label: "Share With Neighbor Counties" },
                { href: "#voting-history-forensics", num: "05", label: "25.91M Past Ballots Checked" },
                { href: "#pb-01-high-density", num: "06", label: "Check 1: 8+ Voter Addresses" },
                { href: "#pb-02-missing-dorm", num: "07", label: "Check 2: Missing Dorm/Apt #s" },
                { href: "#pb-03-ncoa-drift", num: "08", label: "Check 3: Out-of-State Mail" },
                { href: "#pb-04-po-box", num: "09", label: "Check 4: P.O. Boxes on Roll" },
                { href: "#pb-05-clerical", num: "10", label: "Check 5: Old 1801 Paper Dates" },
                { href: "#pb-06-duplicates", num: "11", label: "Check 6: Jr./Sr. & Duplicates" },
                { href: "#pb-07-08-precincts", num: "12", label: "Checks 7–8: 3,000+ Precincts" },
                { href: "#pb-09-benford", num: "13", label: "Check 9: Accounting Pattern" },
                { href: "#pb-10-county-ledger", num: "14", label: "Check 10: All 82 Counties" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline gap-2 py-2 text-[#22201E] hover:text-[#D9381E] transition-colors"
                >
                  <span className="font-mono text-[10px] font-bold text-[#6E675F]">{item.num}</span>
                  <span className="font-semibold leading-snug">{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-[#D8D2C7] text-[11px] text-[#2C2825] space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#15803D] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Zero-PII Verified
              </div>
              <p className="leading-snug">
                Zero voter names, zero birth dates, zero unmasked voter IDs, zero P.O. Box numbers, and 100-block masking on all residential addresses.
              </p>
            </div>
          </div>
        </aside>

        {/* Center Main Publication Spine */}
        <main className="min-w-0 space-y-12 sm:space-y-14">
          {/* SECTION 01: Title + Top Key Takeaways + Immediate Action Items for Non-Auth'd Users */}
          <section id="key-takeaways" className="border-t-4 border-[#111111] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-[#2C2825] pb-3 border-b border-[#111111]">
              <span className="font-bold">MISSISSIPPI 82-COUNTY VOTER ROLL GUIDE</span>
              <span className="text-[#15803D] font-bold">
                100% ZERO-PII • PUBLIC EDITION (NO LOGIN REQUIRED)
              </span>
            </div>

            <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight leading-[1.1] text-[#111111]">
              Mississippi Voter Roll &amp; 25.91 Million Ballot Review
            </h1>

            <p className="mt-3 text-base sm:text-lg text-[#2C2825] font-serif leading-relaxed max-w-3xl">
              We checked all <strong className="text-[#111111]">2,112,460 voter registrations</strong> and{" "}
              <strong className="text-[#111111]">25,911,640 past ballots</strong> across all 82 Mississippi counties—filtering out{" "}
              <strong className="text-[#D9381E]">18,093 false alarms</strong> so Election Commissioners, Clerks, and citizens can see what is working and what needs simple cleanup.
            </p>

            {/* TOP BOX 1: 4 Plain-English Key Takeaways */}
            <div className="mt-6 rounded-xl border-2 border-[#111111] bg-white p-4 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E4E0D8]">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                  <BookOpen className="w-4 h-4 text-[#D9381E]" />
                  4 Key Takeaways at a Glance
                </div>
                <span className="font-mono text-[11px] font-bold text-[#15803D] bg-[#E8F5E9] px-2.5 py-0.5 rounded">
                  60-Second Read
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="rounded-lg border border-[#D8D2C7] bg-[#FCFBF9] p-3.5">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#15803D]">
                    Takeaway 1 • 100% Ballot Match
                  </div>
                  <div className="font-serif font-bold text-base text-[#111111] mt-0.5">
                    Zero &ldquo;Phantom&rdquo; Ballots Statewide
                  </div>
                  <p className="text-[#2C2825] mt-1 leading-snug">
                    All <strong>25,911,640 past ballots</strong> match a real registered Voter ID, and <strong>66 of 82 counties</strong> sit right in the normal range for their population size.
                  </p>
                </div>

                <div className="rounded-lg border border-[#D8D2C7] bg-[#FCFBF9] p-3.5">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#D9381E]">
                    Takeaway 2 • 18,093 False Alarms Removed
                  </div>
                  <div className="font-serif font-bold text-base text-[#111111] mt-0.5">
                    Dorms, Nursing Homes &amp; Jr./Sr. Separated
                  </div>
                  <p className="text-[#2C2825] mt-1 leading-snug">
                    Basic scripts falsely flag college dorms, nursing homes, 4,404 Jr./Sr. fathers and sons, and 4,346 homes on streets like <em>Marshall Place</em>. We stripped those out first.
                  </p>
                </div>

                <div className="rounded-lg border border-[#D8D2C7] bg-[#FCFBF9] p-3.5">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#6D28D9]">
                    Takeaway 3 • 82% of Mail Moves Already Handled
                  </div>
                  <div className="font-serif font-bold text-base text-[#111111] mt-0.5">
                    Only 2,444 Active Out-of-State Mailings Left
                  </div>
                  <p className="text-[#2C2825] mt-1 leading-snug">
                    Out of 13,675 voters with an out-of-state mailing address, County Clerks have <strong>already marked 11,231 (82.1%) Inactive</strong> while waiting out federal NVRA rules.
                  </p>
                </div>

                <div className="rounded-lg border border-[#D8D2C7] bg-[#FCFBF9] p-3.5">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#0369A1]">
                    Takeaway 4 • Custom Recipe for Each County
                  </div>
                  <div className="font-serif font-bold text-base text-[#111111] mt-0.5">
                    Addresses vs. Mail Moves vs. Large Precincts
                  </div>
                  <p className="text-[#2C2825] mt-1 leading-snug">
                    College towns need apartment unit numbers added (682 rows), while fast-growing suburbs need large 3,000+ voter polling places split (123 precincts).
                  </p>
                </div>
              </div>
            </div>

            {/* TOP BOX 2: What You Can Do Right Now (No Login Required!) */}
            <div
              id="action-items"
              className="mt-5 rounded-xl border-2 border-[#111111] bg-[#FFFDF7] p-4 sm:p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#111111]">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D9381E]">
                  <ClipboardCheck className="w-4 h-4" />
                  4 Action Items You Can Take Right Now (No Account or Login Needed)
                </div>
                <span className="font-mono text-[11px] font-bold text-[#111111] bg-[#F3EFE6] px-2.5 py-0.5 rounded border border-[#111111]/30">
                  100% Free Public Tools
                </span>
              </div>

              {/* Instant County Lookup & Copyable Brief */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white border-2 border-[#111111] rounded-xl p-4">
                <div className="lg:col-span-5">
                  <label
                    htmlFor="top-county-picker"
                    className="block font-mono text-[10px] uppercase font-bold text-[#5A534A] mb-1"
                  >
                    Action 1 • Pick Your County for an Instant Summary:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="top-county-picker"
                      value={selectedQuickCounty.county}
                      onChange={(e) => setQuickCountyName(e.target.value)}
                      className="w-full rounded-lg border-2 border-[#111111] bg-[#FCFBF9] px-3 py-2 text-sm font-bold text-[#111111] cursor-pointer"
                    >
                      {threatManifold.countyVectors
                        .slice()
                        .sort((a, b) => a.county.localeCompare(b.county))
                        .map((c) => (
                          <option key={c.county} value={c.county}>
                            {c.county} County ({c.total.toLocaleString()} Voters)
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 lg:pt-0 lg:border-l lg:border-[#D8D2C7] lg:pl-4">
                  <div className="text-xs space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#111111]">
                        {selectedQuickCounty.county} County:
                      </span>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#111111] text-white">
                        {FRIENDLY_REGIME_MAP[selectedQuickCounty.regime] || selectedQuickCounty.regime}
                      </span>
                    </div>
                    <p className="text-[#2C2825]">
                      <strong>{selectedQuickCounty.total.toLocaleString()}</strong> voters (
                      {selectedQuickCounty.active.toLocaleString()} Active) •{" "}
                      <strong>{selectedQuickCounty.highDensityCount}</strong> 8+ voter addresses •{" "}
                      <strong>{selectedQuickCounty.ncoaCount}</strong> active out-of-state mailings •{" "}
                      <strong>{selectedQuickCounty.overCapacityPrecincts}</strong> precincts over 3,000 voters
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyBrief}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border-2 border-[#111111] bg-[#D9381E] hover:bg-[#B82D16] text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {copiedSummary ? "Copied to Clipboard!" : "Copy County Brief"}
                  </button>
                </div>
              </div>

              {/* 3 Additional Direct Action Cards */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-[#111111] bg-white p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[#D9381E]">
                      Action 2 • For Board Meetings
                    </div>
                    <div className="font-serif font-bold text-sm text-[#111111] mt-0.5">
                      Download the 10-Page Printable PDF
                    </div>
                    <p className="text-[#2C2825] mt-1 leading-snug">
                      Formatted on white paper to save printer toner. Bring it directly to your County Election Commission or Circuit Clerk.
                    </p>
                  </div>
                  <a
                    href="/Marigold-Mississippi-Playbook-Analysis.pdf"
                    download="Marigold-Mississippi-Playbook-Analysis.pdf"
                    className="mt-3 inline-flex items-center gap-1 font-bold text-[#111111] hover:text-[#D9381E]"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF Now →
                  </a>
                </div>

                <div className="rounded-lg border border-[#111111] bg-white p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[#15803D]">
                      Action 3 • Interactive 3D Map
                    </div>
                    <div className="font-serif font-bold text-sm text-[#111111] mt-0.5">
                      Compare Neighboring Counties
                    </div>
                    <p className="text-[#2C2825] mt-1 leading-snug">
                      Use the unlocked 3D map below to isolate apartment unit numbers, mail moves, or large polling places for your county.
                    </p>
                  </div>
                  <a
                    href="#manifold-3d"
                    className="mt-3 inline-flex items-center gap-1 font-bold text-[#111111] hover:text-[#D9381E]"
                  >
                    <Compass className="w-3.5 h-3.5" /> Jump to 3D Map Below →
                  </a>
                </div>

                <div className="rounded-lg border border-[#111111] bg-white p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase text-[#0369A1]">
                      Action 4 • All 82 Counties Table
                    </div>
                    <div className="font-serif font-bold text-sm text-[#111111] mt-0.5">
                      Search Any County&apos;s Exact Numbers
                    </div>
                    <p className="text-[#2C2825] mt-1 leading-snug">
                      Filter all 82 counties side by side in Section 14 to see how your county ranks against peers of similar size.
                    </p>
                  </div>
                  <a
                    href="#pb-10-county-ledger"
                    className="mt-3 inline-flex items-center gap-1 font-bold text-[#111111] hover:text-[#D9381E]"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Jump to 82-County Table →
                  </a>
                </div>
              </div>
            </div>

            {/* Compact 6-Card Key Numbers Grid */}
            <div className="mt-6 border-y-2 border-[#111111] bg-white p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="border-l-4 border-[#111111] pl-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A534A] font-bold">
                  01 • Voter Roll Checked
                </div>
                <div className="font-serif text-xl sm:text-3xl font-bold text-[#111111] mt-0.5">
                  {metadata.totalRecords.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#2C2825]">
                  {metadata.activeVoters.toLocaleString()} Active
                </div>
              </div>

              <div className="border-l-4 border-[#15803D] pl-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A534A] font-bold">
                  02 • Past Ballots Checked
                </div>
                <div className="font-serif text-xl sm:text-3xl font-bold text-[#111111] mt-0.5">
                  {votingHistoryAudit.totalHistoryRowsScanned.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#15803D] font-bold">
                  100% Match (0 Orphans)
                </div>
              </div>

              <div className="border-l-4 border-[#111111] pl-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A534A] font-bold">
                  03 • 2024 General Voters
                </div>
                <div className="font-serif text-xl sm:text-3xl font-bold text-[#111111] mt-0.5">
                  {votingHistoryAudit.unique2024GeneralVoters.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#2C2825]">
                  88 Double-Scans (0.007%)
                </div>
              </div>

              <div className="border-l-4 border-[#15803D] pl-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A534A] font-bold">
                  04 • Normal Range
                </div>
                <div className="font-serif text-xl sm:text-3xl font-bold text-[#111111] mt-0.5">
                  66 / 82 Counties
                </div>
                <div className="font-mono text-[11px] text-[#2C2825]">
                  16 Priority Counties
                </div>
              </div>

              <div className="border-l-4 border-[#D9381E] pl-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A534A] font-bold">
                  05 • False Alarms Removed
                </div>
                <div className="font-serif text-xl sm:text-3xl font-bold text-[#D9381E] mt-0.5">
                  18,093
                </div>
                <div className="font-mono text-[11px] text-[#2C2825]">
                  Dorms, Jr/Sr &amp; Street Names
                </div>
              </div>

              <div className="border-l-4 border-[#15803D] pl-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#5A534A] font-bold">
                  06 • Citizen Privacy
                </div>
                <div className="font-serif text-xl sm:text-3xl font-bold text-[#15803D] mt-0.5">
                  100% Zero-PII
                </div>
                <div className="font-mono text-[11px] text-[#2C2825]">
                  0 Names • Block-Masked
                </div>
              </div>
            </div>

            {/* BUILT-IN VISUALIZATION 01: Signal vs. Noise Filtering Architecture Chart */}
            <div className="mt-6 border-2 border-[#111111] rounded-xl bg-white p-4 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E4E0D8]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#D9381E] shrink-0" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#111111]">
                    Visual Chart 1.1 — False Alarms Removed (Gray) vs. Real Cleanup Work (Red)
                  </h3>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  {
                    title: "Check 2: Dorms & Apartments Missing Unit #",
                    naiveCount:
                      playbooks.missingDorm.totalVoters +
                      playbooks.missingDorm.streetNameFalsePositivesRemoved,
                    removedCount: playbooks.missingDorm.streetNameFalsePositivesRemoved,
                    removedReason: "4,346 homes on 'Marshall Pl' & 'Halls Ferry Rd' removed",
                    actionableCount: playbooks.missingDorm.activeVoters,
                  },
                  {
                    title: "Check 1: Addresses With 8+ Registered Voters",
                    naiveCount: playbooks.highDensity.totalVoters,
                    removedCount:
                      playbooks.highDensity.institutionalVoters +
                      playbooks.highDensity.multiFamilyVoters,
                    removedReason: "University dorms, nursing homes & apartments separated",
                    actionableCount: playbooks.highDensity.singleFamilyAnomalyVoters,
                  },
                  {
                    title: "Check 6: Same-Name Voters in Same ZIP Code",
                    naiveCount:
                      playbooks.duplicates.generationalPairs + playbooks.duplicates.trueDuplicates,
                    removedCount: playbooks.duplicates.generationalPairs,
                    removedReason: "4,404 Father/Son (Jr./Sr./III) families protected",
                    actionableCount: playbooks.duplicates.activeActiveDuplicates,
                  },
                  {
                    title: "Check 3: Out-of-State Mailing Addresses",
                    naiveCount: playbooks.ncoaRelocations.totalAllStatusVoters,
                    removedCount: playbooks.ncoaRelocations.inactiveRelocatedVoters,
                    removedReason: "11,231 (82.1%) already marked Inactive by County Clerks",
                    actionableCount: playbooks.ncoaRelocations.totalVoters,
                  },
                ].map((bar) => {
                  const pctActionable = Math.max(
                    8,
                    Math.round((bar.actionableCount / bar.naiveCount) * 100)
                  );
                  const pctRemoved = 100 - pctActionable;
                  return (
                    <div
                      key={bar.title}
                      className="border border-[#D8D2C7] rounded-lg p-3.5 bg-[#FCFBF9]"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-serif font-bold text-sm sm:text-base text-[#111111]">
                          {bar.title}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#15803D] shrink-0">
                          -{Math.round((bar.removedCount / bar.naiveCount) * 100)}% Noise
                        </span>
                      </div>

                      <div className="mt-2.5 h-6 w-full rounded overflow-hidden flex border border-[#111111]">
                        <div
                          style={{ width: `${pctRemoved}%` }}
                          className="bg-[#E5E0D5] text-[#2C2825] flex items-center px-2 font-mono text-[10px] font-bold truncate"
                        >
                          Filtered: {bar.removedCount.toLocaleString()}
                        </div>
                        <div
                          style={{ width: `${pctActionable}%` }}
                          className="bg-[#D9381E] text-white flex items-center justify-end px-1.5 font-mono text-[10px] font-bold"
                        >
                          {bar.actionableCount.toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        <span className="text-[#3A3530]">{bar.removedReason}</span>
                        <span className="font-mono font-bold text-[#D9381E]">
                          To Check: {bar.actionableCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 02: Interactive 3D County Map */}
          <section id="manifold-3d" className="border-t-2 border-[#111111] pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 02 • Interactive 3D County Map
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  Explore All 82 Counties in 3D
                </h2>
              </div>
            </div>

            <div className="print:hidden">
              <ThreatManifold3DExplorer compact={false} forceUnlocked={true} />
            </div>

            {/* Sticky-Header Table 2.1: Top 16 Priority Counties */}
            <div className="mt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#111111]">
                  Table 2.1 — The 16 Priority Counties Above the Normal Statewide Net
                </h3>
                <span className="font-mono text-xs font-bold text-[#15803D]">
                  66 Counties Sit on the Normal Green Net
                </span>
              </div>

              <div className="max-h-[440px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                    <tr className="font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3">Rank &amp; County</th>
                      <th className="py-3 px-2.5 text-right">Total Voters</th>
                      <th className="py-3 px-2.5 text-right">1. Addrs (X)</th>
                      <th className="py-3 px-2.5 text-right">2. Mail (Y)</th>
                      <th className="py-3 px-2.5 text-right">3. Polls (Z)</th>
                      <th className="py-3 px-2.5 text-right text-[#F59E0B]">Score</th>
                      <th className="py-3 px-3">Workload Split</th>
                      <th className="py-3 px-3">Main Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D2C7]">
                    {threatManifold.countyVectors.slice(0, 16).map((c, i) => (
                      <tr key={c.county} className="hover:bg-[#F5F2EB]">
                        <td className="py-2.5 px-3 font-bold text-[#111111] whitespace-nowrap">
                          <span className="font-mono text-[10px] text-[#D9381E] mr-1">
                            #{String(i + 1).padStart(2, "0")}
                          </span>
                          {c.county}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-semibold">
                          {c.total.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-mono">{c.x}</td>
                        <td className="py-2.5 px-2.5 text-right font-mono">{c.y}</td>
                        <td className="py-2.5 px-2.5 text-right font-mono">{c.z}</td>
                        <td className="py-2.5 px-2.5 text-right font-mono font-bold text-[#D9381E]">
                          {c.threatEnergy}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap font-semibold">
                          {c.partialX}% Addr • {c.partialY}% Mail • {c.partialZ}% Poll
                        </td>
                        <td className="py-2.5 px-3 text-[#111111] font-medium whitespace-nowrap">
                          {c.dominantDriver}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 03: How Issues Connect */}
          <section id="mathematical-correlations" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 03 • 2-for-1 Cleanup Connections
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
              Which Cleanup Steps Solve Two Problems at Once?
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {correlations.map((corr) => {
                const rPct = Math.min(100, Math.round(Math.abs(corr.pearsonR) * 100));
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
                          +{corr.pearsonR.toFixed(2)} / 1.00
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#111111] mt-2">
                        {corr.plainTitle}
                      </h3>
                      <p className="text-xs text-[#2C2825] mt-1.5 leading-snug">
                        {corr.commonManTakeaway}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E4E0D8]">
                      <div className="h-2 w-full bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/30">
                        <div style={{ width: `${rPct}%` }} className="h-full bg-[#D9381E]" />
                      </div>
                      <div className="mt-1.5 text-[11px] font-mono text-[#15803D] font-bold">
                        {corr.rateOfChange}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 04: County Election Commissioner Evangelism & Peer Guide */}
          <section id="commissioner-toolkit" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 04 • County-to-County Peer Guide
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
              {commissionerToolkit.headline}
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-[#111111] rounded-xl bg-white p-4 sm:p-5">
              {commissionerToolkit.evangelismSteps.map((st) => (
                <div
                  key={st.step}
                  className="md:border-r md:last:border-r-0 border-[#D8D2C7] md:pr-4"
                >
                  <div className="inline-block font-mono text-xs font-bold text-white bg-[#D9381E] px-2.5 py-0.5 rounded">
                    STEP {st.step}
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#111111] mt-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#2C2825] mt-1.5 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 05: 25.91 Million Voting History Audit + Turnout Bar Chart */}
          <section id="voting-history-forensics" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 05 • 25.91 Million Past Ballots Checked
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
              100% of Historical Ballots Match a Valid Registered Voter ID
            </h2>

            <div className="mt-4 border-2 border-[#111111] rounded-xl bg-white p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E4E0D8]">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#111111]">
                  Visual Chart 5.1 — Verified Ballots by Major Statewide Election
                </h3>
                <span className="font-mono text-xs font-bold text-[#15803D]">
                  0 Unmatched Ballots
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {votingHistoryAudit.majorElections.map((el) => {
                  const widthPct = Math.max(
                    14,
                    Math.round((el.ballotsRecorded / maxElectionVotes) * 100)
                  );
                  const isPresidential = el.label.includes("Presidential");
                  return (
                    <div
                      key={el.date}
                      className="grid grid-cols-1 sm:grid-cols-[210px_1fr_110px] items-center gap-1.5"
                    >
                      <div className="font-mono text-xs font-bold text-[#111111]">
                        {el.date} •{" "}
                        <span className="font-sans font-medium text-[#3A3530]">
                          {el.label.replace(" General Election", "")}
                        </span>
                      </div>
                      <div className="h-5 bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/40">
                        <div
                          style={{ width: `${widthPct}%` }}
                          className={`h-full flex items-center px-2 font-mono text-[10px] font-bold text-white ${
                            isPresidential ? "bg-[#111111]" : "bg-[#D9381E]"
                          }`}
                        >
                          {isPresidential ? "Presidential" : "State / Midterm"}
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
          </section>

          {/* SECTION 06: Playbook 01 — High-Density Residential Domiciles (100% Block-Masked) */}
          <section id="pb-01-high-density" className="border-t-2 border-[#111111] pt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
              Section 06 • Check 1 — Addresses With 8+ Registered Voters
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
              Separating Universities &amp; Nursing Homes from Single-Family Houses
            </h2>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-serif text-base font-bold text-[#111111] mb-2">
                  Table 6.1 — Largest Campus &amp; Multi-Unit Complexes (Block-Masked)
                </h3>
                <div className="max-h-[380px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Campus / Anonymized Block</th>
                        <th className="py-2.5 px-2">County</th>
                        <th className="py-2.5 px-2 text-right">Total (Active)</th>
                        <th className="py-2.5 px-3">Facility Type</th>
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

              <div>
                <h3 className="font-serif text-base font-bold text-[#111111] mb-2">
                  Table 6.2 — Single-Family Houses to Review (100-Block Masked for Zero-PII)
                </h3>
                <div className="max-h-[380px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">100-Block Masked Street</th>
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
              Section 07 • Check 2 — Dorms &amp; Apartments Missing a Room Number
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
              4,346 Street-Name False Alarms Removed • 682 Campus/Apt Records Isolated
            </h2>

            <div className="mt-4 max-h-[360px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                  <tr className="font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Campus / Anonymized Multi-Unit Block</th>
                    <th className="py-3 px-4">City</th>
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

          {/* SECTION 08 & 09: Playbook 03 (NCOA Out-of-State) & Playbook 04 (P.O. Box Domiciles — Redacted Box #s) */}
          <section id="pb-03-ncoa-drift" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 08 • Check 3 — Out-of-State Mailing Addresses
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1">
                  82.1% Already Marked Inactive • 2,444 Active Voters to Confirm
                </h2>

                <div className="mt-3 border-2 border-[#111111] rounded-xl bg-white p-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#111111] mb-2">
                    Visual Chart 8.1 — Top Out-of-State Mail Destinations
                  </div>
                  <div className="space-y-1.5">
                    {topNcoaStates.map((st) => {
                      const wPct = Math.max(10, Math.round((st.count / maxNcoaStateCount) * 100));
                      return (
                        <div
                          key={st.state}
                          className="grid grid-cols-[40px_1fr_60px] items-center gap-2 text-xs"
                        >
                          <span className="font-mono font-bold text-[#111111]">{st.state}</span>
                          <div className="h-3.5 bg-[#ECE8DF] rounded overflow-hidden border border-[#111111]/30">
                            <div style={{ width: `${wPct}%` }} className="h-full bg-[#D9381E]" />
                          </div>
                          <span className="text-right font-mono font-bold text-[#111111]">
                            {st.count.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PB-04: Zero-PII Redacted P.O. Box Table */}
              <div id="pb-04-po-box">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 09 • Check 4 — P.O. Boxes Typed on the Street Line
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1">
                  339 Records With a P.O. Box in the Home Address Field (Box #s Redacted)
                </h2>

                <div className="mt-3 max-h-[320px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Zero-PII Token</th>
                        <th className="py-2.5 px-3">Redacted P.O. Box Entry</th>
                        <th className="py-2.5 px-3">County</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.commercialPOBox.samples.slice(0, 10).map((s) => (
                        <tr key={s.recordToken} className="hover:bg-[#F5F2EB]">
                          <td className="py-2 px-3 font-mono text-[11px] font-bold text-[#5A534A]">
                            {s.recordToken}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] font-semibold text-[#111111]">
                            {s.address}, {s.city}
                          </td>
                          <td className="py-2 px-3 font-medium">{s.county}</td>
                          <td className="py-2 px-3 text-right font-mono text-[11px] font-bold">
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

          {/* SECTION 10 & 11: Playbook 05 (Clerical Typos) & Playbook 06 (Duplicates) */}
          <section id="pb-05-clerical" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 10 • Check 5 — Old 1801 Paper Transfer Dates
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1">
                  5,607 Early-2000s Computer Import Placeholders
                </h2>
                <div className="mt-3 max-h-[320px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Placeholder Category</th>
                        <th className="py-2.5 px-3 text-right">Count</th>
                        <th className="py-2.5 px-3">Administrative Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {Object.entries(playbooks.clericalTypos.yearBreakdown)
                        .slice(0, 8)
                        .map(([k, v]) => (
                          <tr key={k} className="hover:bg-[#F5F2EB]">
                            <td className="py-2 px-3 font-mono font-bold text-[#111111]">{k}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#D9381E]">
                              {(v as number).toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-[#2C2825]">
                              {k === "TRUNCATED_NAME_1CHAR"
                                ? "Initial-only name field"
                                : k === "DATAMIGRATION_ADDR"
                                ? "Early-2000s import placeholder"
                                : "Missing date on paper card"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="pb-06-duplicates">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 11 • Check 6 — Jr./Sr. &amp; Same-ZIP Duplicate Check
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1">
                  4,404 Jr./Sr. Families Protected • 818 Active Same-ZIP Pairs
                </h2>
                <div className="mt-3 max-h-[320px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Zero-PII Cluster ID</th>
                        <th className="py-2.5 px-3">County &amp; ZIP</th>
                        <th className="py-2.5 px-3 text-right">Records</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.duplicates.sampleClusters.slice(0, 10).map((d) => (
                        <tr key={d.clusterId} className="hover:bg-[#F5F2EB]">
                          <td className="py-2 px-3 font-mono font-bold text-[#111111]">
                            {d.clusterId}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {d.county} ({d.zip})
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {d.recordCount} ({d.activeRecords} Act)
                          </td>
                          <td className="py-2 px-3 text-[#2C2825]">{d.classification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 12 & 13: Playbooks 07, 08 (Busy Precincts) & Playbook 09 (First-Digit Pattern Test) */}
          <section id="pb-07-08-precincts" className="border-t-2 border-[#111111] pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 12 • Checks 7 &amp; 8 — Busy Polling Places (3,000+ Voters)
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1">
                  123 Precincts Exceed 3,000 Voters (27 Exceed 5,000)
                </h2>
                <div className="mt-3 max-h-[360px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-[#111111] text-white">
                      <tr className="font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Precinct Code &amp; Name</th>
                        <th className="py-2.5 px-2">County</th>
                        <th className="py-2.5 px-2 text-right text-[#F59E0B]">Total</th>
                        <th className="py-2.5 px-3 text-right">Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C7]">
                      {playbooks.precinctCapacity.topOverCapacity.slice(0, 12).map((p, i) => (
                        <tr key={i} className="hover:bg-[#F5F2EB]">
                          <td className="py-2 px-3 font-mono text-[11px] font-bold text-[#111111]">
                            {p.precinctCode} — {p.precinctName}
                          </td>
                          <td className="py-2 px-2 font-medium">{p.county}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-[#D9381E]">
                            {p.voterCount.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold">
                            {p.activeVoterCount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="pb-09-benford">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 13 • Check 9 — Accounting Pattern Check
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1">
                  All 1,742 Precincts Pass Natural First-Digit Pattern Test
                </h2>

                <div className="mt-3 border-2 border-[#111111] rounded-xl bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#111111]">
                      Visual Chart 13.1 — Expected (Gray) vs. Actual MS Roll (Green)
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#15803D]">
                      ✓ PASS
                    </span>
                  </div>
                  <div className="grid grid-cols-9 gap-1.5 items-end h-28 pt-3 px-1 border-b border-[#111111]">
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
                              className="w-2 bg-[#BDB6AC] rounded-t"
                            />
                            <div
                              style={{ height: `${obsH}%` }}
                              className="w-2 bg-[#15803D] rounded-t"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-9 gap-1.5 text-center font-mono text-[10px] font-bold text-[#111111] pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <div key={d}>#{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 14: Playbook 10 — Complete 82-County Lookup Table */}
          <section id="pb-10-county-ledger" className="border-t-2 border-[#111111] pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#D9381E] font-bold">
                  Section 14 • Check 10 — Complete 82-County Lookup Table
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                  Find Your County: All 82 Mississippi Counties Ranked Side by Side
                </h2>
              </div>

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
                    className={`px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase rounded border-2 cursor-pointer ${
                      tierFilter === tf
                        ? "bg-[#111111] text-white border-[#111111]"
                        : "bg-white text-[#111111] border-[#111111]"
                    }`}
                  >
                    {tf === "ALL"
                      ? "All 82"
                      : tf === "DETACHED"
                      ? "16 Priority"
                      : "66 Normal"}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[580px] overflow-auto border-2 border-[#111111] rounded-xl bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-[#111111] text-white shadow-xs">
                  <tr className="font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3">County</th>
                    <th className="py-3 px-2.5 text-right">Total Voters</th>
                    <th className="py-3 px-2.5 text-right">Active</th>
                    <th className="py-3 px-2.5 text-right">2024 Votes</th>
                    <th className="py-3 px-2.5 text-right">8+ Addrs</th>
                    <th className="py-3 px-2.5 text-right">Missing Unit</th>
                    <th className="py-3 px-2.5 text-right">Out-of-State</th>
                    <th className="py-3 px-2.5 text-right">Same-ZIP Dup</th>
                    <th className="py-3 px-2.5 text-right">3,000+ Polls</th>
                    <th className="py-3 px-2.5 text-right text-[#F59E0B]">Score</th>
                    <th className="py-3 px-3">Plain-English Status</th>
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

        {/* Right Column: Commissioner Quick-Reference Rail (Desktop) */}
        <aside className="hidden xl:block print:hidden">
          <div className="sticky top-20 border-t-2 border-[#111111] pt-4 space-y-5 text-xs">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#D9381E] font-bold">
                Commissioner Quick Brief
              </div>
              <h3 className="font-serif text-base font-bold text-[#111111] mt-1">
                3 Points for Your County Board
              </h3>
              <p className="text-[#2C2825] mt-2 leading-relaxed">
                1. <strong>Zero unmatched ballots.</strong> All 25.91M past ballots match a real Voter ID, and 66 of 82 counties sit in the normal range.
              </p>
              <p className="text-[#2C2825] mt-2 leading-relaxed">
                2. <strong>18,093 false alarms removed.</strong> Nursing homes, college dorms, Jr./Sr. families, and street names like <em>Marshall Pl</em> are already filtered out.
              </p>
              <p className="text-[#2C2825] mt-2 leading-relaxed">
                3. <strong>100% Zero-PII.</strong> Every personal name, voter ID, P.O. Box number, and private house number is redacted.
              </p>
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
                <span>Read Plain-English Post</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
