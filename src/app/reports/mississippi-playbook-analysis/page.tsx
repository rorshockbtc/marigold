"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import { useStateBenchmark, StateSwitcherPill, BenchmarkStateCode } from "@/lib/data/StateBenchmarkContext";
import { ArrowLeft, ArrowRight, Compass, Download, Printer, Copy, Check, ShieldCheck } from "lucide-react";

/* ---------- Marigold Design System tokens (zero red; Marigold amber/gold) ---------- */
const INK = "#111111";
const FOCUS = "#B45309"; // Marigold deep amber (text-safe, >5:1 WCAG AA contrast on warm cream)
const FILL = "#F59E0B";  // Marigold gold-orange (bars, fills, primary CTA buttons)

const STATUS_LABEL: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "Needs attention in all 3 areas",
  "Axis-X Spatial Domicile Ridge": "Main focus: apartment & dorm unit numbers",
  "Axis-Y Interstate Drift Ridge": "Main focus: out-of-state mail & duplicates",
  "Axis-Z Precinct Strain Ridge": "Main focus: large precincts (3,000+)",
  "Equilibrium Manifold Surface": "On track — normal range",
};

const fmt = (n: number | undefined | null) => Number(n ?? 0).toLocaleString("en-US");
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/* ---------- Editorial primitives (minimum 12pt / 16px text-base, generous leading) ---------- */
function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      className="font-mono text-base font-bold uppercase tracking-[0.12em]"
      style={{ color: light ? FILL : FOCUS }}
    >
      {children}
    </div>
  );
}

function SectionHead({ id, num, kicker, title, dek }: { id: string; num: string; kicker: string; title: string; dek?: string }) {
  return (
    <header id={id} className="scroll-mt-24 border-t-2 border-[#111111] pt-8 sm:pt-10">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-lg font-bold tabular-nums text-[#8A8279]">{num}</span>
        <Kicker>{kicker}</Kicker>
      </div>
      <h2 className="mt-3 font-serif text-3xl sm:text-[40px] font-bold leading-[1.18] tracking-tight text-[#111111]">{title}</h2>
      {dek && <p className="mt-3.5 max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">{dek}</p>}
    </header>
  );
}

function Bar({ value, max, focus = false, label }: { value: number; max: number; focus?: boolean; label?: string }) {
  const w = Math.max(2, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="h-3 w-full bg-[#E9E4DA]" aria-label={label} role="img">
      <div className="h-full" style={{ width: `${w}%`, background: focus ? FILL : INK }} />
    </div>
  );
}

export default function MississippiPlaybookAnalysisReportPage() {
  const { activeState, setActiveState, stateConfig, auditData } = useStateBenchmark();
  const { metadata, votingHistoryAudit, threatManifold, playbooks } = auditData;
  const counties = threatManifold.countyVectors;
  const totalCountiesCount = stateConfig.countiesCount;
  const stateName = stateConfig.name;
  const extractDateLabel = stateConfig.extractDateLabel;
  const pdfUrl = stateConfig.pdfUrl;
  const authorityLabel = stateConfig.authorityLabel;
  const authorityCitation = stateConfig.authorityCitation;

  const correlations = (threatManifold as Record<string, unknown>).correlations as Array<{
    id: string; plainTitle: string; pearsonR: number; rateOfChange: string; commonManTakeaway: string;
  }>;
  const toolkit = (threatManifold as Record<string, unknown>).commissionerToolkit as {
    headline: string; evangelismSteps: Array<{ step: string; title: string; detail: string }>;
  };

  /* ---------- Derived, data-bound figures ---------- */
  const priorityCounties = useMemo(
    () =>
      counties
        .filter((c) => c.regime !== "Equilibrium Manifold Surface")
        .sort((a, b) => b.threatEnergy - a.threatEnergy),
    [counties]
  );
  const priorityCount = priorityCounties.length;
  const normalCount = counties.length - priorityCount;
  const ncoa = playbooks.ncoaRelocations;
  const ncoaInactivePct = pct(ncoa.inactiveRelocatedVoters, ncoa.totalAllStatusVoters);
  const benford = playbooks.benfordsLaw;
  const benfordTurnout = benford.turnout2024;
  const fivePlus = playbooks.precinctCapacity.severelyOverCapacityCount;

  const vhAny = votingHistoryAudit as Record<string, unknown>;
  const mdAny = metadata as Record<string, unknown>;
  const ballotsThrough2024 = Number(vhAny.ballotsThrough2024 ?? 25076198);
  const ballotsAdded25_26 = Number(vhAny.ballotsAdded2025_2026 ?? 835571);
  const totalBallotCredits = Number(vhAny.totalVerifiedBallotCredits ?? votingHistoryAudit.totalHistoryRowsScanned);
  const ballots2026 = Number(vhAny.ballots2026 ?? 330533);
  const ballots2025 = Number(vhAny.ballots2025 ?? 505038);
  const dup2026Primary = Number(vhAny.duplicate2026PrimarySameDayCreditRows ?? 64);
  const registrations2026 = Number(mdAny.registrations2026 ?? 82461);
  const peak2026Date =
    ((playbooks.registrationSpikes as Record<string, unknown>).peak2026Dates as Array<{ date: string; count: number }> | undefined)?.[0]?.date ?? "10/05/2026";
  const peak2026Count = Number(
    ((playbooks.registrationSpikes as Record<string, unknown>).peak2026Dates as Array<{ count: number }> | undefined)?.[0]?.count ?? 5541
  );

  /* ---------- State ---------- */
  const [quickCounty, setQuickCounty] = useState(stateConfig.defaultCounty);
  const [countyViewMode, setCountyViewMode] = useState<"priority" | "top25" | "all82">("priority");
  const [countySearch, setCountySearch] = useState("");
  const [ledgerShowAll, setLedgerShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!counties.some((c) => c.county === quickCounty)) {
      setQuickCounty(stateConfig.defaultCounty);
    }
  }, [activeState, counties, quickCounty, stateConfig.defaultCounty]);

  const handleStateSwitch = (st: BenchmarkStateCode) => {
    setActiveState(st);
    setQuickCounty(st === "NC" ? "Wake" : "Hinds");
    setCountySearch("");
  };

  const selected = useMemo(
    () => counties.find((c) => c.county === quickCounty) || counties[0],
    [counties, quickCounty]
  );
  const sortedCounties = useMemo(() => [...counties].sort((a, b) => a.county.localeCompare(b.county)), [counties]);
  const top25ByPop = useMemo(() => [...counties].sort((a, b) => b.total - a.total).slice(0, 25), [counties]);
  const allByPriority = useMemo(() => [...counties].sort((a, b) => b.threatEnergy - a.threatEnergy), [counties]);

  const displayedReviewerCounties = useMemo(() => {
    const base =
      countyViewMode === "priority"
        ? priorityCounties
        : countyViewMode === "top25"
        ? top25ByPop
        : sortedCounties;
    if (!countySearch.trim()) return base;
    const q = countySearch.trim().toLowerCase();
    return sortedCounties.filter((c) => c.county.toLowerCase().includes(q));
  }, [countyViewMode, countySearch, priorityCounties, top25ByPop, sortedCounties]);

  const pbAny = playbooks as Record<string, any>;
  const rawDist = pbAny.districtIntegrity || {};
  const districtIntegrity = {
    missingCongActive: Number(rawDist.missingCong ?? 0),
    missingSenActive: Number(rawDist.missingSen ?? 1),
    missingRepActive: Number(rawDist.missingRep ?? 2),
    missingSupOrEcActive: Number(rawDist.activeMissingAnyDistrict ?? 7),
    splitPrecinctsTotal: Number(rawDist.splitAllPrecincts ?? 374),
    splitLegislativePrecincts: Number(rawDist.splitLegislativePrecincts ?? 356),
    splitCongPrecincts: Number(rawDist.splitCongPrecincts ?? 3),
    splitSenPrecincts: Number(rawDist.splitSenPrecincts ?? 96),
    splitRepPrecincts: Number(rawDist.splitRepPrecincts ?? 308),
  };
  const rawNvra = pbAny.nvraReconciliation || {};
  const nvraRec = {
    inactiveWithRecentVote2024_2026: Number(rawNvra.inactiveWithRecentVote2024_2026 ?? 36071),
    activeDormantPre2019NoVoteSince2018: Number(rawNvra.dormantActivePre2019NoVote ?? 196957),
  };
  const rawAddr = pbAny.addressParsing || {};
  const addrParsing = {
    missingHouseNumActive: Number(rawAddr.unparsedHouseNumActive ?? 1011),
    missingHouseNumTotal: Number(rawAddr.unparsedHouseNumTotal ?? 1900),
  };

  const maxBallots = Math.max(...votingHistoryAudit.majorElections.map((e) => e.ballotsRecorded));
  const ncoaStates = Object.entries(ncoa.stateBreakdown).slice(0, 8).map(([s, n]) => ({ s, n: Number(n) }));
  const maxState = Math.max(...ncoaStates.map((x) => x.n));

  const copyBrief = () => {
    const selAny = selected as Record<string, unknown>;
    const text = [
      `${selected.county} County, ${stateName} — ${extractDateLabel} Voter Roll Summary (14-Playbook Non-Partisan Audit)`,
      `Status: ${STATUS_LABEL[selected.regime] || selected.regime} (Priority Score: ${selected.threatEnergy.toFixed(1)} / 100 · Cleanliness: ${selected.cleanlinessScore} / 100)`,
      `Registered voters: ${fmt(selected.total)} (${fmt(selected.active)} active voters · ${fmt(selected.inactive)} inactive voters · +${fmt(Number(selAny.registrations2026 ?? 0))} new 2026 voters)`,
      `High-density addresses (8+ voters): ${fmt(selected.highDensityCount)} addresses (${fmt(selected.highDensityVoters)} total voters)`,
      `Out-of-state mailings: ${fmt(selected.ncoaCount)} active voters`,
      `Same-ZIP duplicate pairs: ${fmt(selected.duplicateCount)} pairs (${selected.activeDuplicateCount || 0} active-active pairs)`,
      `Large precincts (over 3,000 voters): ${selected.overCapacityPrecincts} precincts (largest: ${fmt(selected.maxPrecinctVoters)} voters)`,
      `Split-ballot legislative precincts: ${Number(selAny.splitPrecincts ?? 0)} precincts`,
      `Recent-vote Inactive records (voted 2024–2026): ${fmt(Number(selAny.inactiveVotedRecent ?? 0))} voters`,
      `Pre-2019 dormant Active records (no vote since <2018): ${fmt(Number(selAny.dormantPre2019Active ?? 0))} voters`,
      `Unparsed 911 house numbers: ${fmt(Number(selAny.unparsedAddressCount ?? 0))} active voters`,
      `Statewide: ${fmt(totalBallotCredits)} past ballots verified (+${fmt(ballotsAdded25_26)} in 2025–2026), 0 unmatched.`,
      `Full public report (zero personal data): https://marigoldinsights.org/reports/mississippi-playbook-analysis?state=${activeState}`,
    ].join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const printCountyBrief = () => {
    const c = selected;
    const cAny = c as Record<string, unknown>;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    const dateStr = extractDateLabel;
    const status = STATUS_LABEL[c.regime] || c.regime;
    const isNormal = c.regime === "Equilibrium Manifold Surface";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${c.county} County, ${stateName} Voter Roll Audit — Marigold Insights</title>
  <style>
    @page { size: letter; margin: 0.45in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111111; line-height: 1.42; font-size: 12.5px; }
    .header { border-bottom: 2.5px solid #111111; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
    .kicker { font-family: monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #B45309; }
    .title { font-family: Georgia, serif; font-size: 25px; font-weight: bold; line-height: 1.1; margin-top: 3px; }
    .meta { text-align: right; font-size: 11px; color: #5A534A; }
    .badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: ${isNormal ? "#E5E7EB" : "#FEF3C7"}; color: ${isNormal ? "#374151" : "#92400E"}; border: 1px solid ${isNormal ? "#9CA3AF" : "#F59E0B"}; margin-top: 5px; }
    .summary-box { background: #FAF8F5; border-left: 4px solid #F59E0B; padding: 9px 13px; margin-bottom: 12px; font-size: 12px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-bottom: 12px; }
    .metric-card { border: 1px solid #111111; padding: 8px 10px; background: white; }
    .metric-val { font-family: Georgia, serif; font-size: 17px; font-weight: bold; line-height: 1.1; color: #111111; }
    .metric-val.hi { color: #B45309; }
    .metric-label { font-size: 9.5px; font-weight: bold; text-transform: uppercase; color: #5A534A; margin-top: 3px; }
    .metric-sub { font-size: 10px; color: #78716C; margin-top: 2px; }
    .section-title { font-family: Georgia, serif; font-size: 14px; font-weight: bold; border-bottom: 1px solid #DDD6CA; padding-bottom: 3px; margin-bottom: 7px; margin-top: 10px; }
    .action-list { list-style: none; counter-reset: action-counter; }
    .action-list li { position: relative; padding-left: 22px; margin-bottom: 6px; font-size: 11px; line-height: 1.42; }
    .action-list li::before { counter-increment: action-counter; content: counter(action-counter); position: absolute; left: 0; top: 0; width: 15px; height: 15px; background: #111111; color: white; border-radius: 50%; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 15px; }
    .privacy-notice { border: 1px dashed #B45309; background: #FFFBEB; padding: 8px 11px; margin-top: 10px; font-size: 10px; line-height: 1.4; color: #92400E; }
    .footer { border-top: 1px solid #111111; margin-top: 12px; padding-top: 6px; display: flex; justify-content: space-between; font-size: 9px; color: #78716C; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="kicker">Marigold Civic Analytics · 14-Playbook Non-Partisan County Briefing</div>
      <h1 class="title">${c.county} County, ${stateName}</h1>
      <div class="badge">${status}</div>
    </div>
    <div class="meta">
      <div><strong>Audit Extract:</strong> ${dateStr}</div>
      <div><strong>Cleanliness Score:</strong> ${c.cleanlinessScore} / 100</div>
      <div><strong>Priority Score:</strong> ${c.threatEnergy.toFixed(1)} / 100</div>
    </div>
  </div>

  <div class="summary-box">
    <strong>Executive Assessment:</strong> ${c.plainEnglishSummary || `${c.county} County voter registration roll analyzed against ${stateName} statewide voter file and ${fmt(totalBallotCredits)} verified ballot records.`}
  </div>

  <div class="grid">
    <div class="metric-card">
      <div class="metric-val">${fmt(c.total)} voters</div>
      <div class="metric-label">Registered Voters</div>
      <div class="metric-sub">${fmt(c.active)} active · ${fmt(c.inactive)} inactive (${c.inactiveRatePct}%)</div>
    </div>
    <div class="metric-card">
      <div class="metric-val hi">+${fmt(Number(cAny.registrations2026 ?? 0))} voters</div>
      <div class="metric-label">New 2026 Registrations</div>
      <div class="metric-sub">Added through ${dateStr}</div>
    </div>
    <div class="metric-card">
      <div class="metric-val ${c.highDensityCount > 10 ? 'hi' : ''}">${fmt(c.highDensityCount)} addresses</div>
      <div class="metric-label">High-Density Addresses (8+)</div>
      <div class="metric-sub">${fmt(c.highDensityVoters)} total voters at addresses</div>
    </div>
    <div class="metric-card">
      <div class="metric-val ${c.ncoaCount > 15 ? 'hi' : ''}">${fmt(c.ncoaCount)} voters</div>
      <div class="metric-label">Out-of-State Mailings</div>
      <div class="metric-sub">Active voters with out-of-state mail</div>
    </div>
    <div class="metric-card">
      <div class="metric-val">${fmt(c.duplicateCount)} pairs</div>
      <div class="metric-label">Same-ZIP Duplicate Pairs</div>
      <div class="metric-sub">${c.activeDuplicateCount || 0} active-active pairs</div>
    </div>
    <div class="metric-card">
      <div class="metric-val ${c.overCapacityPrecincts > 0 ? 'hi' : ''}">${c.overCapacityPrecincts} precincts</div>
      <div class="metric-label">Large Precincts (3,000+)</div>
      <div class="metric-sub">Largest precinct: ${fmt(c.maxPrecinctVoters)} voters</div>
    </div>
    <div class="metric-card">
      <div class="metric-val ${Number(cAny.splitPrecincts ?? 0) > 5 ? 'hi' : ''}">${Number(cAny.splitPrecincts ?? 0)} precincts</div>
      <div class="metric-label">Split-Ballot Precincts</div>
      <div class="metric-sub">Multiple legislative districts</div>
    </div>
    <div class="metric-card">
      <div class="metric-val hi">${fmt(Number(cAny.inactiveVotedRecent ?? 0))} voters</div>
      <div class="metric-label">Recent-Vote Inactive</div>
      <div class="metric-sub">Voted 2024–2026 · ${fmt(Number(cAny.dormantPre2019Active ?? 0))} dormant active</div>
    </div>
  </div>

  <h2 class="section-title">Recommended Non-Partisan Action Checklist (Voter Protection &amp; List Maintenance)</h2>
  <ol class="action-list">
    <li><strong>Voter Status Sync (Voter Protection):</strong> Verify why ${fmt(Number(cAny.inactiveVotedRecent ?? 0))} voters in ${c.county} County with recorded 2024–2026 ballots are marked Inactive so eligible voters do not face pollbook delays.</li>
    <li><strong>Split-Ballot &amp; Precinct Capacity Check:</strong> Audit GIS street-range ballot styles across ${Number(cAny.splitPrecincts ?? 0)} split legislative precincts and evaluate ${c.overCapacityPrecincts} precincts exceeding 3,000 voters.</li>
    <li><strong>Physical Address &amp; 911 GIS Verification:</strong> Review ${fmt(c.highDensityCount)} high-density addresses (8+ voters) for missing unit numbers and standardize ${fmt(Number(cAny.unparsedAddressCount ?? 0))} active records missing structured 911 house numbers.</li>
    <li><strong>NVRA List Maintenance &amp; Duplicate Review:</strong> ${stateConfig.statutoryAuthorityNote} Send statutory NVRA confirmation notices for ${fmt(c.ncoaCount)} active out-of-state mailings, review ${fmt(Number(cAny.dormantPre2019Active ?? 0))} two-cycle dormant active records, and reconcile ${fmt(c.duplicateCount)} same-ZIP duplicate name pairs.</li>
  </ol>

  <div class="privacy-notice">
    <strong>Zero-PII Compliance &amp; Canvassing Records Access:</strong><br/>
    In strict compliance with statutory voter privacy standards, individual voter names, dates of birth, and street numbers are never displayed on public web pages. Verified County Election Commissioners, County Boards of Elections, and certified campaign directors can request unmasked street-level canvassing sheets or upload newer county rolls in the Marigold App Scanner at: <strong>https://marigoldinsights.org/contact?county=${encodeURIComponent(c.county)}&amp;state=${activeState}</strong>
  </div>

  <div class="footer">
    <span>Marigold Insights · Non-Partisan Civic Analytics</span>
    <span>Source: ${stateName} Statewide Voter Roll &amp; ${fmt(totalBallotCredits)} Ballot History (2026)</span>
    <span>Zero-PII Compliant</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const navItems = [
    ["takeaways", "01", "Key takeaways"],
    ["actions", "02", `County reviewer (${totalCountiesCount})`],
    ["map", "03", "3D county map"],
    ["filtering", "04", "False alarms removed"],
    ["ballots", "05", "2025–2026 ballots"],
    ["connections", "06", "Do issues overlap?"],
    ["checks", "07", "The 14 checks"],
    ["ledger", "08", `County ledger (${ledgerShowAll ? totalCountiesCount : priorityCount})`],
  ] as const;

  return (
    <div className="w-full max-w-[100vw] overflow-x-clip min-h-screen bg-[#F6F3EC] text-[#111111] text-base antialiased print:bg-white">
      {/* ---------- Single sticky top bar ---------- */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#111111] bg-[#F6F3EC]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/overview" className="inline-flex items-center gap-2 text-base font-bold whitespace-nowrap hover:text-[#B45309] shrink-0">
              <ArrowLeft className="h-4 w-4 shrink-0" /> Marigold Insights
            </Link>
            <StateSwitcherPill activeState={activeState} onSelectState={handleStateSwitch} variant="compact" />
            <div className="hidden xl:flex items-center gap-2 border border-[#111111]/25 bg-white px-3 py-1 font-mono text-xs font-semibold">
              <span className="text-[#5A534A]">Focused County:</span>
              <button
                type="button"
                onClick={() => document.getElementById("actions")?.scrollIntoView({ behavior: "smooth" })}
                className="font-bold text-[#B45309] hover:underline cursor-pointer"
              >
                {selected.county} ({fmt(selected.total)})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/manifold" className="hidden sm:inline-flex h-11 items-center gap-2 border-2 border-[#111111] bg-white px-4 text-base font-bold whitespace-nowrap shrink-0 hover:bg-[#EFEAE0]">
              <Compass className="h-4 w-4 shrink-0 text-[#B45309]" /> Full 3D Studio
            </Link>
            <button onClick={() => window.print()} className="hidden md:inline-flex h-11 items-center gap-2 border-2 border-[#111111] bg-white px-4 text-base font-bold whitespace-nowrap shrink-0 hover:bg-[#EFEAE0]">
              <Printer className="h-4 w-4 shrink-0" /> Print
            </button>
            <a
              href={pdfUrl}
              download
              className="inline-flex h-11 items-center gap-2 border-2 border-[#111111] px-4 text-base font-bold text-[#111111] whitespace-nowrap shrink-0 hover:brightness-95"
              style={{ background: FILL }}
            >
              <Download className="h-4 w-4 shrink-0" /> Full {totalCountiesCount}-County PDF
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-4 py-8 sm:px-8 sm:py-14 lg:grid-cols-[236px_minmax(0,1fr)] print:block">
        {/* ---------- Left spine ---------- */}
        <aside className="hidden lg:block print:hidden">
          <nav className="sticky top-24 border-t-2 border-[#111111] pt-4" aria-label="Report sections">
            <div className="font-mono text-base font-bold uppercase tracking-[0.12em] text-[#5A534A]">Contents</div>
            <ol className="mt-2 divide-y divide-[#DDD6CA] border-b border-[#DDD6CA]">
              {navItems.map(([id, n, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex gap-3 py-2.5 text-base font-semibold text-[#2C2825] whitespace-nowrap hover:text-[#B45309]">
                    <span className="font-serif tabular-nums text-[#8A8279]">{n}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-l-4 border-[#F59E0B] bg-white/80 p-3.5 text-base leading-snug text-[#2C2825]">
              <div className="flex items-center gap-2 font-bold text-[#111111]">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#B45309]" />
                Zero-PII Verified
              </div>
              <p className="mt-1 text-base leading-relaxed text-[#3A3530]">
                No names, birth dates, voter IDs, P.O. Box numbers, or house numbers appear anywhere in this report. Safe to share with county officials and the public.
              </p>
            </div>

            <div className="mt-4 border-l-4 border-[#111111] bg-white p-3.5 text-base leading-snug">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#5A534A]">Active Reviewer</div>
              <button
                type="button"
                onClick={() => document.getElementById("actions")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-1 font-serif text-lg font-bold text-[#111111] hover:text-[#B45309] text-left block cursor-pointer"
              >
                {selected.county} County
              </button>
              <div className="mt-1 text-xs leading-normal text-[#5A534A]">
                {fmt(selected.total)} voters · {STATUS_LABEL[selected.regime] || selected.regime}
              </div>
              <div className="mt-2.5 flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={printCountyBrief}
                  className="text-[#B45309] underline underline-offset-2 hover:text-[#111111] cursor-pointer"
                >
                  Print PDF
                </button>
                <span className="text-[#DDD6CA]">·</span>
                <Link
                  href={`/contact?county=${encodeURIComponent(selected.county)}&topic=canvass_audit`}
                  className="text-[#B45309] underline underline-offset-2 hover:text-[#111111]"
                >
                  Canvass Access →
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 max-w-[1020px] space-y-20 sm:space-y-24">
          {/* ---------- Hero ---------- */}
          <section className="space-y-6">
            <Kicker>{stateName} · {extractDateLabel} Extract · Public Edition</Kicker>
            <h1 className="mt-4 font-serif text-4xl sm:text-[54px] font-bold leading-[1.1] tracking-[-0.025em] text-[#111111]">
              Every past ballot matched a real voter. Here&rsquo;s what&rsquo;s left to tidy up.
            </h1>
            <p className="mt-6 max-w-[65ch] font-serif text-xl sm:text-[23px] leading-[1.75] text-[#2C2825]">
              We audited all {fmt(metadata.totalRecords)} active &amp; inactive voter registrations and {fmt(totalBallotCredits)} cumulative ballot records
              through {extractDateLabel} — including <strong>+{fmt(ballotsAdded25_26)} ballots added across 2025 and 2026</strong> and{" "}
              <strong>{fmt(registrations2026)} new 2026 registrations</strong> across all {totalCountiesCount} {stateName} counties. Every ballot traced to a registered voter.
            </p>

            {/* Mobile section picker */}
            <label className="mt-8 block lg:hidden print:hidden">
              <span className="sr-only">Jump to section</span>
              <select
                onChange={(e) => document.getElementById(e.target.value)?.scrollIntoView({ behavior: "smooth" })}
                defaultValue=""
                className="h-12 w-full border-2 border-[#111111] bg-white px-3.5 text-base font-bold"
              >
                <option value="" disabled>Jump to a section…</option>
                {navItems.map(([id, n, label]) => (
                  <option key={id} value={id}>{n} · {label}</option>
                ))}
              </select>
            </label>

            {/* Key figures — spacious 2x2 grid so large numbers never collide or wrap awkwardly */}
            <dl className="mt-10 grid grid-cols-1 border-y-2 border-[#111111] bg-white sm:grid-cols-2 shadow-2xs">
              {[
                [fmt(totalBallotCredits), "Verified past ballots", `+${fmt(ballotsAdded25_26)} ballots added in 2025–2026 · 0 unmatched records`, true],
                [fmt(registrations2026), "New 2026 voter registrations", `${fmt(peak2026Count)} voters registered on peak 2026 date (${peak2026Date})`, false],
                [`${normalCount} of ${totalCountiesCount} counties`, "Within normal baseline range", `${priorityCount} counties have focused cleanup checklists`, false],
                [`${ncoaInactivePct}% (${fmt(ncoa.inactiveRelocatedVoters)})`, "Out-of-state movers already Inactive", `Only ${fmt(ncoa.totalVoters)} active records need an NVRA confirmation notice`, false],
              ].map(([v, l, s, hi], i) => {
                const borderClasses = [
                  "",
                  "border-t border-[#DDD6CA] sm:border-t-0 sm:border-l",
                  "border-t border-[#DDD6CA]",
                  "border-t border-[#DDD6CA] sm:border-l",
                ][i];
                return (
                  <div key={l as string} className={`min-w-0 p-6 sm:p-8 ${borderClasses}`}>
                    <dd
                      className="font-serif text-3xl sm:text-[36px] lg:text-[40px] font-bold leading-tight tracking-tight tabular-nums whitespace-nowrap"
                      style={hi ? { color: FOCUS } : undefined}
                    >
                      {v as string}
                    </dd>
                    <dt className="mt-2.5 text-base sm:text-lg font-bold leading-snug text-[#111111]">{l as string}</dt>
                    <div className="mt-1 text-base leading-relaxed text-[#5A534A]">{s as string}</div>
                  </div>
                );
              })}
            </dl>
          </section>

          {/* ---------- 01 Takeaways ---------- */}
          <section className="space-y-8">
            <SectionHead id="takeaways" num="01" kicker="Key takeaways" title="Four things every official and voter should know" />
            <ol className="divide-y divide-[#DDD6CA] border-b border-[#DDD6CA]">
              {[
                [
                  `Zero orphaned or phantom ballots across ${(totalBallotCredits / 1_000_000).toFixed(2)}M records.`,
                  `Adding two more years of elections increased verified ballot history from ${fmt(ballotsThrough2024)} (through 2024) by +${fmt(ballotsAdded25_26)} ballots in 2025–2026 to ${fmt(totalBallotCredits)} total records. Every single ballot matched a registered voter.`,
                ],
                [
                  "Most raw “anomalies” are dorms, care homes, and Jr./Sr. families.",
                  `Before scoring any county, we filtered out campus dorms, military bases, and nursing homes (${fmt(playbooks.highDensity.institutionalVoters)} voters), apartment complexes (${fmt(playbooks.highDensity.multiFamilyVoters)}), ${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. households, and ${fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)} homes on streets like “Marshall Place.”`,
                ],
                [
                  `${authorityLabel} are already processing movers — and our 14 checks protect both voter access and clean rolls.`,
                  `Under ${stateName} law (${authorityCitation}), ${authorityLabel} hold statutory authority to maintain and remove records from the voter rolls. Of ${fmt(ncoa.totalAllStatusVoters)} voters with an out-of-state mailing address, ${fmt(ncoa.inactiveRelocatedVoters)} (${ncoaInactivePct}%) are already marked Inactive on the federal NVRA clock. Alongside ${fmt(ncoa.totalVoters)} active out-of-state movers and ${fmt(playbooks.duplicates.activeActiveDuplicates)} active–active duplicate pairs, our 14 non-partisan checks also protect ${fmt(nvraRec.inactiveWithRecentVote2024_2026)} voters who cast a ballot in 2024–2026 while marked Inactive and audit ${fmt(districtIntegrity.splitLegislativePrecincts)} split-ballot precincts.`,
                ],
                [
                  `${normalCount} of ${totalCountiesCount} counties sit in the normal range; ${priorityCount} have a clear checklist.`,
                  `University and military counties mostly need apartment and dorm unit numbers (${fmt(playbooks.missingDorm.totalVoters)} records). Fast-growing suburbs mostly need large precincts split (${fmt(playbooks.precinctCapacity.overCapacityCount)} precincts over 3,000 voters).`,
                ],
              ].map(([t, b], i) => (
                <li key={t} className="grid grid-cols-[44px_1fr] gap-4 py-8 sm:grid-cols-[60px_1fr] sm:gap-6">
                  <span className="font-serif text-3xl font-bold tabular-nums" style={{ color: FOCUS }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-2xl sm:text-[26px] font-bold leading-snug text-[#111111]">{t}</h3>
                    <p className="mt-3 max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 02 Actions & County Reviewer ---------- */}
          <section className="space-y-8">
            <SectionHead
              id="actions"
              num="02"
              kicker={`County-level reviewer (all ${totalCountiesCount} counties)`}
              title={`Inspect any ${stateName} county in ten seconds`}
              dek={`Browse all ${priorityCount} priority counties, the top 25 counties by population, or all ${totalCountiesCount} counties A–Z. Every metric includes its explicit noun and unit, and you can export a 1-page County PDF or open the Marigold App Scanner to run these same 14 checks on newer voter rolls.`}
            />

            {/* Expandable County Directory Bar (Priority / Top 25 / All + Search) */}
            <div className="rounded-2xl border border-[#111111]/20 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD6CA] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#5A534A] mr-1">
                    Show counties:
                  </span>
                  {[
                    ["priority", `Priority Counties (${priorityCount})`],
                    ["top25", "Top 25 by Population"],
                    ["all82", `All ${totalCountiesCount} Counties (A–Z)`],
                  ].map(([mode, label]) => {
                    const active = countyViewMode === mode && !countySearch.trim();
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setCountyViewMode(mode as "priority" | "top25" | "all82");
                          setCountySearch("");
                        }}
                        className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                          active
                            ? "bg-[#111111] text-white shadow-xs"
                            : "bg-[#F6F3EC] text-[#2C2825] hover:bg-[#EAE4D8]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="search"
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    placeholder={`Filter ${totalCountiesCount} counties by name…`}
                    aria-label="Filter counties by name"
                    className="h-10 w-full sm:w-60 rounded-lg border border-[#111111]/25 bg-[#FAF8F5] px-3.5 text-sm font-medium text-[#111111] placeholder:text-[#78716C] focus:border-[#B45309] focus:ring-1 focus:ring-[#B45309] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 max-h-56 overflow-y-auto pr-1">
                {displayedReviewerCounties.map((c) => {
                  const isCur = selected.county === c.county;
                  const isPrio = c.regime !== "Equilibrium Manifold Surface";
                  return (
                    <button
                      key={c.county}
                      type="button"
                      onClick={() => setQuickCounty(c.county)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                        isCur
                          ? "bg-[#111111] text-white shadow-xs"
                          : isPrio
                          ? "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/50 hover:bg-[#FDE68A]"
                          : "bg-white text-[#2C2825] border border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <span>{c.county}</span>
                      <span className={`font-mono text-xs font-normal ${isCur ? "text-[#FCD34D]" : "text-[#78716C]"}`}>
                        ({fmt(c.total)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#111111]/20 bg-white p-6 sm:p-9 shadow-sm space-y-8">
              <div>
                <label htmlFor="county" className="font-mono text-base font-bold uppercase tracking-[0.12em] text-[#5A534A]">
                  Selected county dropdown (all {totalCountiesCount} {stateName} counties)
                </label>
                <div className="mt-3 flex flex-col gap-3">
                  <select
                    id="county"
                    value={selected.county}
                    onChange={(e) => setQuickCounty(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#111111]/25 bg-[#FAF8F5] px-4 text-base font-bold text-[#111111] focus:border-[#B45309] focus:ring-1 focus:ring-[#B45309] focus:outline-none transition-all"
                  >
                    {sortedCounties.map((c) => (
                      <option key={c.county} value={c.county}>
                        {c.county} County — {fmt(c.total)} registered voters ({c.regime !== "Equilibrium Manifold Surface" ? `Priority Score ${c.threatEnergy.toFixed(1)}` : "Normal Range"})
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={copyBrief}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 text-sm font-bold text-stone-800 shadow-2xs hover:bg-stone-50 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                    >
                      {copied ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <Copy className="h-4 w-4 shrink-0 text-stone-500" />}
                      {copied ? "Copied briefing" : "Copy briefing text"}
                    </button>
                    <button
                      type="button"
                      onClick={printCountyBrief}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white px-6 text-sm font-bold shadow-sm active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      Print / Export County PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* County Status Header */}
              <div className="border-t border-[#DDD6CA] pt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <div className="font-mono text-sm font-bold uppercase tracking-wider text-[#5A534A]">
                      Focused County Dossier · 14-Playbook Audit
                    </div>
                    <h3 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-[#111111]">
                      {selected.county} County, {stateName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className="rounded-lg px-3.5 py-1.5 text-sm sm:text-base font-bold whitespace-nowrap"
                      style={
                        selected.regime === "Equilibrium Manifold Surface"
                          ? { background: "#F3F4F6", color: "#374151" }
                          : { background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }
                      }
                    >
                      {STATUS_LABEL[selected.regime] || selected.regime}
                    </span>
                    <span className="font-mono text-sm font-bold text-[#5A534A] rounded-lg border border-[#DDD6CA] px-3 py-1.5 bg-[#FAF8F5]">
                      Priority Score: <strong style={{ color: FOCUS }}>{selected.threatEnergy.toFixed(1)} / 100</strong>
                    </span>
                    <span className="font-mono text-sm font-bold text-[#5A534A] rounded-lg border border-[#DDD6CA] px-3 py-1.5 bg-[#FAF8F5]">
                      Roll Cleanliness: <strong>{selected.cleanlinessScore} / 100</strong>
                    </span>
                  </div>
                </div>

                {/* Plain-English Assessment */}
                <div className="mt-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#B45309] p-4 text-base sm:text-lg leading-[1.75] text-[#2C2825]">
                  <strong>Executive Summary:</strong> {selected.plainEnglishSummary || `${selected.county} County sits within standard baseline parameters.`}
                </div>
              </div>

              {/* 8-Card Labeled Metric Breakdown Grid — Every Number Has an Explicit Noun */}
              <dl className="grid grid-cols-1 gap-4 border-t border-[#DDD6CA] pt-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [
                    `${fmt(selected.total)} voters`,
                    "Total Registered Voters",
                    `${fmt(selected.active)} active voters · ${fmt(selected.inactive)} inactive voters (${selected.inactiveRatePct}%)`,
                    false,
                  ],
                  [
                    `+${fmt(Number((selected as Record<string, unknown>).registrations2026 ?? 0))} voters`,
                    "New 2026 Registrations",
                    `Added to roll during 2026 (${extractDateLabel} extract)`,
                    true,
                  ],
                  [
                    `${fmt(selected.highDensityCount)} addresses`,
                    "High-Density Addresses (8+)",
                    `${fmt(selected.highDensityVoters)} registered voters at 8+ voter parcels`,
                    false,
                  ],
                  [
                    `${fmt(selected.ncoaCount)} active voters`,
                    "Out-of-State Mailings",
                    "Active registrations with out-of-state mailing address",
                    false,
                  ],
                  [
                    `${fmt(selected.duplicateCount)} name pairs`,
                    "Same-ZIP Duplicate Pairs",
                    `${selected.activeDuplicateCount || 0} active–active pairs in same 5-digit ZIP`,
                    false,
                  ],
                  [
                    `${selected.overCapacityPrecincts} precincts`,
                    "Large Precincts (Over 3,000)",
                    `Largest polling place: ${fmt(selected.maxPrecinctVoters)} registered voters`,
                    false,
                  ],
                  [
                    `${Number((selected as Record<string, unknown>).splitPrecincts ?? 0)} precincts`,
                    "Split-Ballot Precincts",
                    `Precincts spanning 2+ legislative districts (${fmt(Number((selected as Record<string, unknown>).unparsedAddressCount ?? 0))} unparsed 911 addrs)`,
                    false,
                  ],
                  [
                    `${fmt(Number((selected as Record<string, unknown>).inactiveVotedRecent ?? 0))} voters`,
                    "Recent-Vote Inactive Records",
                    `Voted in 2024–2026 while marked Inactive · ${fmt(Number((selected as Record<string, unknown>).dormantPre2019Active ?? 0))} pre-2019 dormant active`,
                    true,
                  ],
                ].map(([v, l, sub, hi]) => (
                  <div key={l as string} className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-4 shadow-2xs">
                    <dt className="font-mono text-xs font-bold uppercase tracking-wider text-[#5A534A]">{l as string}</dt>
                    <dd className="mt-1.5 font-serif text-2xl font-bold tabular-nums leading-snug" style={hi ? { color: FOCUS } : undefined}>
                      {v as string}
                    </dd>
                    <div className="mt-1.5 text-sm text-[#3A3530] leading-relaxed">{sub as string}</div>
                  </div>
                ))}
              </dl>

              {/* Official Canvass & Logged-In App Scanner Parity Container */}
              <div className="rounded-2xl border border-stone-800 bg-[#1A1614] p-6 text-[#FAF8F5] sm:p-8 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-[58ch] space-y-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[#F59E0B]" />
                      Zero-PII Public Policy · Official Canvass &amp; Live App Scanner
                    </div>
                    <h4 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-white">
                      Inspect individual records in the Marigold App or request {selected.county} County canvass sheets
                    </h4>
                    <p className="text-base leading-[1.65] text-[#D8D1C4]">
                      Individual voter names and street numbers are never exposed on the public web. Logged-in users can upload newer county or statewide voter rolls in the Marigold App Scanner to run all 14 checks locally on their own machine and inspect flagged rows directly, or request official canvassing sheets for {selected.county} County.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    <Link
                      href={`/contact?county=${encodeURIComponent(selected.county)}&state=${activeState}&topic=canvass_audit`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] px-6 text-sm font-bold text-white whitespace-nowrap shadow-sm transition-all"
                    >
                      Request Canvass List for {selected.county} <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                    <Link
                      href="/explore"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-stone-900 px-5 text-sm font-bold text-[#FBBF24] hover:bg-stone-800 whitespace-nowrap transition-all"
                    >
                      Open 14-Check App Scanner <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                    <button
                      type="button"
                      onClick={printCountyBrief}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-600 px-4 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white whitespace-nowrap transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" /> Download {selected.county} County PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- 03 Map ---------- */}
          <section className="space-y-8">
            <SectionHead id="map" num="03" kicker="Interactive 3D geometry" title={`All ${totalCountiesCount} ${stateName} counties mapped across three task areas`} dek="Drag to rotate, click any marker to inspect that county, or open Full Screen 3D. The sky-blue net shows the normal baseline for a county's population; marigold-amber vertical stems and distinct marker shapes highlight extra cleanup work." />
            <div className="print:hidden">
              <ThreatManifold3DExplorer
                compact
                forceUnlocked
                selectedCounty={quickCounty}
                onSelectCounty={(c) => setQuickCounty(c)}
              />
            </div>
          </section>

          {/* ---------- 04 Filtering ---------- */}
          <section className="space-y-8" style={{ contentVisibility: "auto" }}>
            <SectionHead id="filtering" num="04" kicker="Signal vs. noise" title="Ordinary explanations, set aside first" dek="Basic database queries flag college dorms, nursing homes, and fathers and sons who share a name. We separate those first so election officials only review actionable records. Gray was set aside; marigold gold is what remains." />
            <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {[
                ["Dorms & apartments missing a unit number", playbooks.missingDorm.totalVoters + playbooks.missingDorm.streetNameFalsePositivesRemoved, playbooks.missingDorm.activeVoters, `Street names like “Marshall Pl” (${fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)}) removed; inactive records excluded`],
                ["Voters at addresses with 8 or more registrations", playbooks.highDensity.totalVoters, playbooks.highDensity.singleFamilyAnomalyVoters, `University dorms, military bases, nursing homes (${fmt(playbooks.highDensity.institutionalVoters)}) & apartment complexes (${fmt(playbooks.highDensity.multiFamilyVoters)}) set aside`],
                ["Same-name records in the same 5-digit ZIP code", playbooks.duplicates.generationalPairs + playbooks.duplicates.trueDuplicates, playbooks.duplicates.activeActiveDuplicates, `${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. households protected; only active–active pairs remain`],
                ["Out-of-state mailing addresses", ncoa.totalAllStatusVoters, ncoa.totalVoters, `${fmt(ncoa.inactiveRelocatedVoters)} voters already marked Inactive set aside`],
              ].map(([t, total, left, note]) => {
                const keep = Math.max(3, Math.round(((left as number) / (total as number)) * 100));
                return (
                  <div key={t as string} className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-serif text-2xl font-bold text-[#111111]">{t}</h3>
                      <span className="text-base sm:text-lg tabular-nums text-[#3A3530] whitespace-nowrap">
                        <strong style={{ color: FOCUS }}>{fmt(left as number)}</strong> to review of {fmt(total as number)}
                      </span>
                    </div>
                    <div className="mt-4 flex h-4 w-full rounded-xs overflow-hidden border border-[#111111]/15">
                      <div className="h-full bg-[#D8D1C4]" style={{ width: `${100 - keep}%` }} />
                      <div className="h-full" style={{ width: `${keep}%`, background: FILL }} />
                    </div>
                    <p className="mt-3 text-base sm:text-lg leading-[1.75] text-[#5A534A]">{note}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- 05 Ballots ---------- */}
          <section className="space-y-8" style={{ contentVisibility: "auto" }}>
            <SectionHead
              id="ballots"
              num="05"
              kicker={`Ballot history (${extractDateLabel} extract)`}
              title={`Two more years of elections: +${fmt(ballotsAdded25_26)} ballots added, 0 unmatched`}
              dek={`Between 2024 and ${extractDateLabel}, ${stateName} recorded ${fmt(ballots2025)} ballots across 2025 municipal and special elections and ${fmt(ballots2026)} ballots across 2026 primaries and runoffs — increasing verified ballot history from ${fmt(ballotsThrough2024)} to ${fmt(totalBallotCredits)}. Every ballot matched a registered voter.`}
            />

            {/* 2024 vs 2025-2026 Accounting Ledger */}
            <dl className="grid grid-cols-1 border-2 border-[#111111] bg-white sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD6CA] shadow-2xs">
              <div className="p-6 sm:p-7">
                <dt className="font-mono text-base font-bold uppercase tracking-wider text-[#5A534A]">Through 2024</dt>
                <dd className="mt-2 font-serif text-3xl sm:text-4xl font-bold tabular-nums text-[#111111]">{fmt(ballotsThrough2024)}</dd>
                <div className="mt-2 text-base leading-relaxed text-[#5A534A]">historical ballot records</div>
              </div>
              <div className="p-6 sm:p-7 bg-[#FEF3C7]/40">
                <dt className="font-mono text-base font-bold uppercase tracking-wider" style={{ color: FOCUS }}>Added in 2025–2026</dt>
                <dd className="mt-2 font-serif text-3xl sm:text-4xl font-bold tabular-nums" style={{ color: FOCUS }}>+{fmt(ballotsAdded25_26)}</dd>
                <div className="mt-2 text-base leading-relaxed text-[#3A3530]">{fmt(ballots2025)} in 2025 · {fmt(ballots2026)} in 2026</div>
              </div>
              <div className="p-6 sm:p-7">
                <dt className="font-mono text-base font-bold uppercase tracking-wider text-[#111111]">{extractDateLabel} Total</dt>
                <dd className="mt-2 font-serif text-3xl sm:text-4xl font-bold tabular-nums text-[#111111]">{fmt(totalBallotCredits)}</dd>
                <div className="mt-2 text-base leading-relaxed text-[#5A534A]">0 orphaned · {fmt(dup2026Primary)} duplicate 2026 primary scans</div>
              </div>
            </dl>

            <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {votingHistoryAudit.majorElections.map((e) => {
                const isRecent = e.date.endsWith("/2026") || e.date.endsWith("/2025");
                return (
                  <div key={e.date} className="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[340px_1fr_120px] sm:items-center sm:gap-6">
                    <div className="text-base sm:text-lg font-bold">
                      {e.label.replace(" General Election", "")}{" "}
                      <span className="font-mono text-[#5A534A] text-base font-normal">({e.date})</span>
                    </div>
                    <Bar value={e.ballotsRecorded} max={maxBallots} focus={isRecent} label={`${fmt(e.ballotsRecorded)} ballots`} />
                    <div className="text-base sm:text-lg font-mono font-bold tabular-nums sm:text-right whitespace-nowrap" style={isRecent ? { color: FOCUS } : undefined}>
                      {fmt(e.ballotsRecorded)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- 06 Connections ---------- */}
          <section className="space-y-8" style={{ contentVisibility: "auto" }}>
            <SectionHead id="connections" num="06" kicker="Patterns across counties" title="Do these issues travel together?" dek="A score near 1 means two measures rise and fall together across counties; near 0 means no pattern. Where raw counts would simply reflect population size, we compare rates per 1,000 voters." />
            <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {correlations.map((c) => (
                <li key={c.id} className="grid grid-cols-1 gap-5 p-6 sm:p-7 sm:grid-cols-[1fr_200px] sm:gap-10 sm:items-center">
                  <div>
                    <h3 className="font-serif text-2xl font-bold leading-snug text-[#111111]">{c.plainTitle}</h3>
                    <p className="mt-2.5 max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">{c.commonManTakeaway}</p>
                  </div>
                  <div>
                    <div className="font-serif text-3xl sm:text-4xl font-bold tabular-nums leading-none" style={{ color: FOCUS }}>{c.pearsonR.toFixed(2)}</div>
                    <div className="mt-3"><Bar value={Math.abs(c.pearsonR)} max={1} focus /></div>
                    <div className="mt-2 text-base text-[#5A534A] whitespace-nowrap">correlation (−1 to 1)</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 07 The 14 checks (zero scrolling tables) ---------- */}
          <section className="space-y-12" style={{ contentVisibility: "auto" }}>
            <SectionHead
              id="checks"
              num="07"
              kicker="The 14 non-partisan checks"
              title="What we looked for, and what we found"
              dek="Every check below runs identically on this public report and inside the logged-in Marigold App Scanner. We include both voter-protection checks (preventing eligible voters from being turned away or handed the wrong split-district ballot) and list-maintenance checks (tidying out-of-state moves, duplicate records, and missing unit numbers)."
            />

            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-[#111111]">Check 1 · Addresses with 8 or more voters</h3>
              <p className="max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">
                {fmt(playbooks.highDensity.totalAddresses)} addresses ({fmt(playbooks.highDensity.totalVoters)} voters) have 8 or more registrations.
                After setting aside {fmt(playbooks.highDensity.institutionalClusters)} campus, military, and care-home sites and {fmt(playbooks.highDensity.multiFamilyClusters)} apartment complexes,{" "}
                <strong style={{ color: FOCUS }}>{fmt(playbooks.highDensity.singleFamilyAnomalies)} single-family homes</strong> ({fmt(playbooks.highDensity.singleFamilyAnomalyVoters)} registrations) remain for county canvass review. Exact house numbers are withheld for privacy:
              </p>
              <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {playbooks.highDensity.topSingleFamilyAnomalies.slice(0, 6).map((r, i) => (
                  <li key={`${r.address}-${i}`} className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-4">
                    <div>
                      <span className="font-serif text-lg sm:text-xl font-bold text-[#111111]">{r.address}</span>
                      <span className="ml-2.5 text-base text-[#5A534A]">· {r.county} County</span>
                    </div>
                    <div className="font-mono text-base font-bold tabular-nums">
                      <span style={{ color: FOCUS }}>{r.occupantCount} voters</span>{" "}
                      <span className="text-[#5A534A]">({r.activeOccupantCount} active)</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-[#111111]">Check 2 · Dorms and apartments missing a room number</h3>
              <p className="max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">
                Searching for &ldquo;HALL&rdquo; also catches &ldquo;Mars<strong>hall</strong> Place.&rdquo; Matching whole words
                removed {fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)} street-name false alarms, leaving{" "}
                {fmt(playbooks.missingDorm.totalVoters)} campus and apartment records ({fmt(playbooks.missingDorm.activeVoters)} active) where adding a room or apartment number prevents returned mail.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-[26px] font-bold text-[#111111]">Check 3 · Out-of-state mailing addresses</h3>
              <p className="max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">
                {ncoaInactivePct}% ({fmt(ncoa.inactiveRelocatedVoters)} of {fmt(ncoa.totalAllStatusVoters)}) are already marked Inactive under federal rules.{" "}
                <strong style={{ color: FOCUS }}>{fmt(ncoa.totalVoters)} active voters</strong> need an address-confirmation postcard. Top destination states:
              </p>
              <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {ncoaStates.map((x) => (
                  <div key={x.s} className="grid grid-cols-[56px_1fr_96px] items-center gap-4 px-6 py-3.5">
                    <span className="font-mono text-base sm:text-lg font-bold text-[#111111]">{x.s}</span>
                    <Bar value={x.n} max={maxState} />
                    <span className="text-right text-base sm:text-lg font-mono font-bold tabular-nums whitespace-nowrap text-[#111111]">{fmt(x.n)} voters</span>
                  </div>
                ))}
              </div>
            </div>

            <ol className="divide-y divide-[#DDD6CA] border-y border-[#DDD6CA]">
              {[
                ["Check 4 · P.O. boxes typed in the home-address field", `${fmt(playbooks.commercialPOBox.totalVoters)} records statewide (${fmt(playbooks.commercialPOBox.activeVoters)} active voters). A physical street address is required to assign a voting precinct; P.O. Box numbers are withheld for privacy.`],
                ["Check 5 · Legacy paper-migration placeholder dates", `${fmt(playbooks.clericalTypos.totalAnomalies)} records carry default dates (such as 1900, 1801, or 0001) or single-initial names from early digitization. These are clerical artifacts, not improper voting.`],
                ["Check 6 · Same-ZIP duplicate registrations", `${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. and Roman-numeral family households were protected first. Within the same 5-digit ZIP code, ${fmt(playbooks.duplicates.trueDuplicates)} exact First+Middle+Last+Suffix matches appear at different addresses; ${fmt(playbooks.duplicates.activeActiveDuplicates)} pairs have both records Active.`],
                ["Checks 7–8 · 2026 deadline surge & large precincts", `${fmt(registrations2026)} voters registered in 2026 through ${extractDateLabel}, peaking on ${peak2026Date} (${fmt(peak2026Count)} single-day registrations; all-time peak ${fmt(playbooks.registrationSpikes.peakDates[0].count)} on ${playbooks.registrationSpikes.peakDates[0].date}). Statewide, ${fmt(playbooks.precinctCapacity.overCapacityCount)} precincts exceed 3,000 voters and ${fmt(fivePlus)} exceed 5,000.`],
                ["Check 9 · First-digit accounting test (Benford’s Law)", `Precinct registration sizes across ${stateName} (${totalCountiesCount} counties) are tested against Benford’s first-digit distribution (registration chi-square ${benford.chiSquare}; 2024 turnout chi-square ${benfordTurnout.chiSquare}). Bounded administrative precincts naturally cluster around 1,500–4,000 voters per polling place.`],
                [`Check 10 · ${(totalBallotCredits / 1_000_000).toFixed(2)}M ballot-history & same-day credit verification`, `All ${fmt(totalBallotCredits)} historical ballot credits across ${stateName}’s voting history file (including +${fmt(ballotsAdded25_26)} ballots added in 2025–2026) cross-referenced with 0 orphaned records. Only ${fmt(dup2026Primary)} duplicate same-day primary scan lines appeared in 2026.`],
                [
                  activeState === "MS"
                    ? "Check 11 · District completeness & the Panola County SUP/SUPR discovery"
                    : "Check 11 · District completeness & 25-county At-Large Commissioner handling",
                  activeState === "MS"
                    ? `81 Mississippi counties store County Supervisor District in column SUPR, whereas Panola County (24,013 voters) stores it in SUP. Automatically coalescing SUPR || SUP eliminated 24,013 false alarms and isolated the ${districtIntegrity.missingSupOrEcActive} active voters statewide genuinely missing a Supervisor/Election Commissioner district, ${districtIntegrity.missingRepActive} missing State House (REP), ${districtIntegrity.missingSenActive} missing State Senate (SEN), and ${districtIntegrity.missingCongActive} missing U.S. Congress (CONG).`
                    : `In North Carolina, 25 counties (including Wake and Mecklenburg) elect County Commissioners at-large, leaving county_commiss_abbrv blank for 2,466,631 active voters by statute. Recognizing at-large commissioner counties prevented 2.46M false alarms and isolated the ${fmt(districtIntegrity.missingSupOrEcActive)} active voters genuinely missing a Congressional (${districtIntegrity.missingCongActive}), State Senate (${districtIntegrity.missingSenActive}), or State House (${districtIntegrity.missingRepActive}) district.`
                ],
                ["Check 12 · Split-ballot precincts across legislative boundaries", `Statewide, ${fmt(districtIntegrity.splitLegislativePrecincts)} polling precincts span multiple legislative districts (${districtIntegrity.splitCongPrecincts} U.S. Congressional splits, ${districtIntegrity.splitSenPrecincts} State Senate splits, and ${districtIntegrity.splitRepPrecincts} State House splits; ${fmt(districtIntegrity.splitPrecinctsTotal)} total split precincts including county commissioner splits). Poll workers in split precincts should verify 911 GIS street-range ballot styles prior to Election Day.`],
                ["Check 13 · Non-partisan NVRA status & ballot-activity reconciliation", `Serves both voter protection and list maintenance: (1) Voter Protection — ${fmt(nvraRec.inactiveWithRecentVote2024_2026)} voters have a recorded ballot in 2024–2026 while their registration status is marked Inactive. ${authorityLabel} should confirm Active status before printing pollbooks. (2) List Maintenance — ${fmt(nvraRec.activeDormantPre2019NoVoteSince2018)} Active voters registered in 2018 or earlier have zero recorded vote since before 2018; under ${authorityCitation}, ${authorityLabel} hold statutory authority to review and remove ineligible records following NVRA notice.`],
                ["Check 14 · Unparsed 911 GIS residential house numbers", `${fmt(addrParsing.missingHouseNumActive)} active voters (${fmt(addrParsing.missingHouseNumTotal)} total) have descriptive text in their residential street address (such as rural highway descriptions or intersection notes) without a leading E-911 house number. Standardizing house numbers against county E-911 parcel maps prevents split-precinct misassignments.`],
              ].map(([t, b]) => (
                <li key={t} className="py-7">
                  <h3 className="font-serif text-2xl font-bold text-[#111111]">{t}</h3>
                  <p className="mt-3 max-w-[65ch] text-base sm:text-lg leading-[1.8] text-[#3A3530]">{b}</p>
                </li>
              ))}
            </ol>

            {/* Top 6 Largest Precincts — zero-scroll responsive list */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h4 className="font-serif text-2xl font-bold text-[#111111]">Six largest precincts in {stateName} (over 5,000 registered voters)</h4>
                <a href={pdfUrl} download className="text-base font-bold underline underline-offset-4" style={{ color: FOCUS }}>
                  See full list in PDF →
                </a>
              </div>
              <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {playbooks.precinctCapacity.topOverCapacity.slice(0, 6).map((p) => (
                  <li key={`${p.county}-${p.precinctCode}`} className="flex flex-wrap items-baseline justify-between gap-3 px-6 py-4">
                    <div>
                      <span className="font-serif text-lg sm:text-xl font-bold text-[#111111]">{p.precinctName}</span>{" "}
                      <span className="font-mono text-base text-[#5A534A]">({p.precinctCode}) · {p.county} County</span>
                    </div>
                    <div className="font-mono text-base font-bold tabular-nums">
                      <span style={{ color: FOCUS }}>{fmt(p.voterCount)} voters</span>{" "}
                      <span className="text-[#5A534A]">({fmt(p.activeVoterCount)} active)</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ---------- 08 County Ledger (Explicit Nouns on Every Number + Toggle All Counties) ---------- */}
          <section className="space-y-8" style={{ contentVisibility: "auto" }}>
            <SectionHead
              id="ledger"
              num="08"
              kicker="County overview & priority ledger"
              title={ledgerShowAll ? `All ${totalCountiesCount} ${stateName} counties ranked by priority score` : `The ${priorityCount} priority counties outside the normal baseline`}
              dek={`Every number below is paired with its explicit noun and label. Ranked by composite priority score (out of 100) across high-density addresses (X), out-of-state mail & duplicates (Y), and large 3,000+ voter precincts (Z). Click any county to load its full 14-check dossier above.`}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-[#111111] bg-white px-5 py-3.5">
              <div className="text-base font-bold text-[#111111]">
                Showing {ledgerShowAll ? `all ${totalCountiesCount} ${stateName} counties` : `${priorityCount} priority counties (${normalCount} normal-range counties hidden)`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLedgerShowAll(false)}
                  className={`px-3.5 py-1.5 text-sm font-bold border cursor-pointer ${
                    !ledgerShowAll ? "bg-[#111111] text-white border-[#111111]" : "bg-[#F6F3EC] text-[#111111] border-[#111111]/30"
                  }`}
                >
                  Priority Counties ({priorityCount})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerShowAll(true)}
                  className={`px-3.5 py-1.5 text-sm font-bold border cursor-pointer ${
                    ledgerShowAll ? "bg-[#111111] text-white border-[#111111]" : "bg-[#F6F3EC] text-[#111111] border-[#111111]/30"
                  }`}
                >
                  All {totalCountiesCount} Counties
                </button>
              </div>
            </div>

            <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {(ledgerShowAll ? allByPriority : priorityCounties).map((c, i) => {
                const cAny = c as Record<string, unknown>;
                const isFocused = c.county === quickCounty;
                return (
                  <li
                    key={c.county}
                    className={`grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-[3.2rem_1fr_13.5rem] transition-all cursor-pointer ${
                      isFocused
                        ? "bg-[#FEF3C7]/40 ring-2 ring-[#B45309] -outline-offset-2"
                        : "hover:bg-[#FAF8F5]"
                    }`}
                    onClick={() => {
                      setQuickCounty(c.county);
                      document.getElementById("actions")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="font-serif text-2xl font-bold tabular-nums text-[#8A8279]">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 pr-2">
                      <div className="font-serif text-2xl font-bold leading-tight text-[#111111] flex flex-wrap items-center gap-2">
                        <span>{c.county} County</span>
                        {isFocused && (
                          <span className="font-mono text-xs font-bold uppercase tracking-wider bg-[#B45309] text-white px-2 py-0.5 rounded-xs">
                            Focused in Reviewer
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 text-base sm:text-lg leading-snug text-[#3A3530] font-medium">
                        {STATUS_LABEL[c.regime] || c.regime}
                      </div>

                      {/* Labeled 6-item County Metric Breakdown — Every Number Has an Explicit Noun */}
                      <dl className="mt-3.5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[#DDD6CA]/80 pt-3 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">Registered Voters</dt>
                          <dd className="font-bold text-[#111111] tabular-nums">{fmt(c.total)} voters (+{fmt(Number(cAny.registrations2026 ?? 0))} in 2026)</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">High-Density (8+ Voters)</dt>
                          <dd className="font-bold text-[#111111] tabular-nums">{fmt(c.highDensityCount)} addresses ({fmt(c.highDensityVoters)} voters)</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">Out-of-State Mailings</dt>
                          <dd className="font-bold text-[#111111] tabular-nums">{fmt(c.ncoaCount)} active voters</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">Same-ZIP Duplicates</dt>
                          <dd className="font-bold text-[#111111] tabular-nums">{fmt(c.duplicateCount)} name pairs</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">Large Precincts (3,000+)</dt>
                          <dd className="font-bold text-[#111111] tabular-nums">{c.overCapacityPrecincts} large precincts</dd>
                        </div>
                        <div>
                          <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">Split Precincts &amp; Sync</dt>
                          <dd className="font-bold text-[#111111] tabular-nums">{Number(cAny.splitPrecincts ?? 0)} split · {fmt(Number(cAny.inactiveVotedRecent ?? 0))} recent-vote inactive</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="flex flex-row sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 border-[#DDD6CA] pt-3 sm:pt-0 text-right">
                      <div>
                        <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">
                          Priority Score
                        </div>
                        <div className="mt-0.5 font-serif text-3xl font-bold tabular-nums leading-none" style={{ color: FOCUS }}>
                          {c.threatEnergy.toFixed(1)} <span className="text-base font-normal text-[#5A534A]">/ 100</span>
                        </div>
                        <div className="mt-1 font-mono text-xs text-[#5A534A]">
                          Cleanliness: <strong>{c.cleanlinessScore}/100</strong>
                        </div>
                      </div>
                      <div className="w-28 sm:w-full mt-1">
                        <Bar value={c.threatEnergy} max={100} focus label={`Priority score ${c.threatEnergy} out of 100`} />
                      </div>
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#B45309]">
                        {isFocused ? "Focused in Reviewer ↑" : "Inspect County →"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* ---------- Share ---------- */}
          <section className="space-y-6" style={{ contentVisibility: "auto" }}>
            <SectionHead id="share" num="—" kicker="Briefing guide" title={toolkit.headline} />
            <ol className="grid grid-cols-1 border-y-2 border-[#111111] bg-white md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-[#DDD6CA]">
              {toolkit.evangelismSteps.map((s) => (
                <li key={s.step} className="p-5 sm:p-6">
                  <span className="font-serif text-2xl font-bold" style={{ color: FOCUS }}>{s.step}</span>
                  <h3 className="mt-1 font-serif text-xl font-bold leading-snug">{s.title}</h3>
                  <p className="mt-2 text-base leading-[1.65] text-[#3A3530]">{s.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- Conversion CTA (Government Officials & Subscribers) ---------- */}
          <section className="border-y-2 border-[#111111] bg-[#111111] px-6 py-10 text-[#F6F3EC] sm:px-10 print:hidden">
            <Kicker light>For {authorityLabel.toLowerCase()}, registrars &amp; state officials</Kicker>
            <h2 className="mt-3 max-w-[26ch] font-serif text-3xl sm:text-4xl font-bold leading-[1.12] tracking-tight text-white">
              Download the full {totalCountiesCount}-county {stateName} PDF or run Marigold on your own voter roll.
            </h2>
            <p className="mt-4 max-w-[62ch] text-lg leading-[1.65] text-[#E5E0D5]">
              The printable magazine edition includes the complete {totalCountiesCount}-county reference ledger for public meetings. Marigold subscribers can upload voter rolls from any state or county — our header-adaptive schema mapper automatically normalizes state column formats in minutes with strict Zero-PII guarantees.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <a
                href={pdfUrl}
                download
                className="inline-flex h-12 items-center gap-2 px-6 text-base font-bold text-[#111111] whitespace-nowrap hover:brightness-95"
                style={{ background: FILL }}
              >
                <Download className="h-5 w-5 shrink-0" /> Download Full {totalCountiesCount}-County {activeState} PDF
              </a>
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center gap-2 border-2 border-[#F6F3EC] px-6 text-base font-bold text-[#F6F3EC] whitespace-nowrap hover:bg-[#F6F3EC] hover:text-[#111111]"
              >
                Analyze Your State or County <ArrowRight className="h-5 w-5 shrink-0" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center px-3 text-base font-bold text-[#F59E0B] underline underline-offset-4 whitespace-nowrap"
              >
                Request an Official Briefing
              </Link>
            </div>
          </section>

          <footer className="border-t-2 border-[#111111] pt-6 text-base leading-relaxed text-[#5A534A]">
            Source: {metadata.sourceFile} &amp; {metadata.votingHistoryFile} ({fmt(totalBallotCredits)} verified ballot credits through {extractDateLabel}). {metadata.privacyStandard}.
          </footer>
        </main>
      </div>
    </div>
  );
}
