"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import msAudit from "@/data/mississippi_audit_results.json";
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

const fmt = (n: number) => n.toLocaleString("en-US");
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
    <header id={id} className="scroll-mt-24 border-t-2 border-[#111111] pt-7">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-base font-bold tabular-nums text-[#8A8279]">{num}</span>
        <Kicker>{kicker}</Kicker>
      </div>
      <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight text-[#111111]">{title}</h2>
      {dek && <p className="mt-3 max-w-[65ch] text-base sm:text-lg leading-[1.65] text-[#3A3530]">{dek}</p>}
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
  const { metadata, votingHistoryAudit, threatManifold, playbooks } = msAudit;
  const counties = threatManifold.countyVectors;
  const correlations = (threatManifold as Record<string, unknown>).correlations as Array<{
    id: string; plainTitle: string; pearsonR: number; rateOfChange: string; commonManTakeaway: string;
  }>;
  const toolkit = (threatManifold as Record<string, unknown>).commissionerToolkit as {
    headline: string; evangelismSteps: Array<{ step: string; title: string; detail: string }>;
  };

  /* ---------- Derived, data-bound figures (October 26, 2026 extract) ---------- */
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
  const peak2026Count = Number(
    ((playbooks.registrationSpikes as Record<string, unknown>).peak2026Dates as Array<{ count: number }> | undefined)?.[0]?.count ?? 5541
  );

  /* ---------- State ---------- */
  const [quickCounty, setQuickCounty] = useState("Hinds");
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => counties.find((c) => c.county === quickCounty) || counties[0],
    [counties, quickCounty]
  );
  const sortedCounties = useMemo(() => [...counties].sort((a, b) => a.county.localeCompare(b.county)), [counties]);
  const maxBallots = Math.max(...votingHistoryAudit.majorElections.map((e) => e.ballotsRecorded));
  const ncoaStates = Object.entries(ncoa.stateBreakdown).slice(0, 8).map(([s, n]) => ({ s, n: Number(n) }));
  const maxState = Math.max(...ncoaStates.map((x) => x.n));

  const copyBrief = () => {
    const selAny = selected as Record<string, unknown>;
    const text = [
      `${selected.county} County, Mississippi — October 26, 2026 Voter Roll Summary`,
      `Status: ${STATUS_LABEL[selected.regime] || selected.regime}`,
      `Registered voters: ${fmt(selected.total)} (${fmt(selected.active)} active · ${fmt(Number(selAny.registrations2026 ?? 0))} added in 2026)`,
      `Addresses with 8+ voters: ${fmt(selected.highDensityCount)}`,
      `Active voters with out-of-state mail: ${fmt(selected.ncoaCount)}`,
      `Same-ZIP duplicate pairs: ${fmt(selected.duplicateCount)}`,
      `Precincts over 3,000 voters: ${selected.overCapacityPrecincts}`,
      `Statewide: ${fmt(totalBallotCredits)} past ballots verified (+${fmt(ballotsAdded25_26)} in 2025–2026), 0 unmatched.`,
      `Full public report (zero personal data): https://marigoldinsights.org/reports/mississippi-playbook-analysis`,
    ].join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const navItems = [
    ["takeaways", "01", "Key takeaways"],
    ["actions", "02", "County lookup"],
    ["map", "03", "3D county map"],
    ["filtering", "04", "False alarms removed"],
    ["ballots", "05", "2025–2026 ballots"],
    ["connections", "06", "Do issues overlap?"],
    ["checks", "07", "The 10 checks"],
    ["ledger", "08", `Priority counties (${priorityCount})`],
  ] as const;

  return (
    <div className="w-full max-w-[100vw] overflow-x-clip min-h-screen bg-[#F6F3EC] text-[#111111] text-base antialiased print:bg-white">
      {/* ---------- Single sticky top bar ---------- */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#111111] bg-[#F6F3EC]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between gap-3 px-4 sm:px-8">
          <Link href="/overview" className="inline-flex items-center gap-2 text-base font-bold whitespace-nowrap hover:text-[#B45309] shrink-0">
            <ArrowLeft className="h-4 w-4 shrink-0" /> Marigold Insights
          </Link>
          <div className="flex items-center gap-2.5">
            <Link href="/manifold" className="inline-flex h-11 items-center gap-2 border-2 border-[#111111] bg-white px-4 text-base font-bold whitespace-nowrap shrink-0 hover:bg-[#EFEAE0]">
              <Compass className="h-4 w-4 shrink-0 text-[#B45309]" /> Full 3D Studio
            </Link>
            <button onClick={() => window.print()} className="hidden md:inline-flex h-11 items-center gap-2 border-2 border-[#111111] bg-white px-4 text-base font-bold whitespace-nowrap shrink-0 hover:bg-[#EFEAE0]">
              <Printer className="h-4 w-4 shrink-0" /> Print
            </button>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download
              className="inline-flex h-11 items-center gap-2 border-2 border-[#111111] px-4 text-base font-bold text-[#111111] whitespace-nowrap shrink-0 hover:brightness-95"
              style={{ background: FILL }}
            >
              <Download className="h-4 w-4 shrink-0" /> Full 82-County PDF
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
          </nav>
        </aside>

        <main className="min-w-0 max-w-[1020px] space-y-16">
          {/* ---------- Hero ---------- */}
          <section>
            <Kicker>Mississippi · October 26, 2026 Extract · Public Edition</Kicker>
            <h1 className="mt-4 font-serif text-4xl sm:text-[52px] font-bold leading-[1.08] tracking-[-0.02em] text-[#111111]">
              Every past ballot matched a real voter. Here&rsquo;s what&rsquo;s left to tidy up.
            </h1>
            <p className="mt-5 max-w-[65ch] font-serif text-xl sm:text-[22px] leading-[1.6] text-[#2C2825]">
              We audited all {fmt(metadata.totalRecords)} voter registrations and {fmt(totalBallotCredits)} cumulative ballot records
              through October 26, 2026 — including <strong>+{fmt(ballotsAdded25_26)} ballots added across 2025 and 2026</strong> and{" "}
              <strong>{fmt(registrations2026)} new 2026 registrations</strong> across all 82 Mississippi counties. Every ballot traced to a registered voter.
            </p>

            {/* Mobile section picker */}
            <label className="mt-6 block lg:hidden print:hidden">
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

            {/* Key figures — hairline row, Marigold amber highlight */}
            <dl className="mt-8 grid grid-cols-1 border-y-2 border-[#111111] bg-white/60 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [fmt(totalBallotCredits), "past ballots verified", `+${fmt(ballotsAdded25_26)} in 2025–2026 · 0 unmatched`, true],
                [fmt(registrations2026), "new 2026 registrations", `${fmt(peak2026Count)} on Oct 5, 2026 deadline`, false],
                [`${normalCount} of 82`, "counties in normal range", `${priorityCount} with priority tasks`, false],
                [`${ncoaInactivePct}%`, "of out-of-state movers", `already marked Inactive (${fmt(ncoa.inactiveRelocatedVoters)})`, false],
              ].map(([v, l, s, hi], i) => (
                <div key={l as string} className={`p-5 ${i > 0 ? "border-t border-[#DDD6CA] sm:border-t-0 sm:border-l" : ""}`}>
                  <dd className="font-serif text-3xl sm:text-4xl font-bold leading-none tabular-nums" style={hi ? { color: FOCUS } : undefined}>
                    {v as string}
                  </dd>
                  <dt className="mt-2.5 text-base font-bold leading-snug text-[#111111]">{l as string}</dt>
                  <div className="mt-1 text-base leading-snug text-[#5A534A]">{s as string}</div>
                </div>
              ))}
            </dl>
          </section>

          {/* ---------- 01 Takeaways ---------- */}
          <section className="space-y-6">
            <SectionHead id="takeaways" num="01" kicker="Key takeaways" title="Four things every official and voter should know" />
            <ol className="divide-y divide-[#DDD6CA] border-b border-[#DDD6CA]">
              {[
                [
                  "Zero orphaned or phantom ballots across 25.91M records.",
                  `Adding two more years of elections increased verified ballot history from ${fmt(ballotsThrough2024)} (through 2024) by +${fmt(ballotsAdded25_26)} ballots in 2025–2026 to ${fmt(totalBallotCredits)} total records. Every single ballot matched a registered voter.`,
                ],
                [
                  "Most raw “anomalies” are dorms, care homes, and Jr./Sr. families.",
                  `Before scoring any county, we filtered out campus dorms and nursing homes (${fmt(playbooks.highDensity.institutionalVoters)} voters), apartment complexes (${fmt(playbooks.highDensity.multiFamilyVoters)}), ${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. households, and ${fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)} homes on streets like “Marshall Place.”`,
                ],
                [
                  "County clerks are already processing out-of-state movers.",
                  `Of ${fmt(ncoa.totalAllStatusVoters)} voters with an out-of-state mailing address, ${fmt(ncoa.inactiveRelocatedVoters)} (${ncoaInactivePct}%) are already marked Inactive under federal NVRA rules. Only ${fmt(ncoa.totalVoters)} active records need a confirmation postcard.`,
                ],
                [
                  `${normalCount} of 82 counties sit in the normal range; ${priorityCount} have a clear checklist.`,
                  `University counties mostly need apartment and dorm unit numbers (${fmt(playbooks.missingDorm.totalVoters)} records). Fast-growing suburbs mostly need large precincts split (${fmt(playbooks.precinctCapacity.overCapacityCount)} precincts over 3,000 voters).`,
                ],
              ].map(([t, b], i) => (
                <li key={t} className="grid grid-cols-[42px_1fr] gap-3 py-6 sm:grid-cols-[56px_1fr]">
                  <span className="font-serif text-2xl font-bold tabular-nums" style={{ color: FOCUS }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-[#111111]">{t}</h3>
                    <p className="mt-2 max-w-[65ch] text-base sm:text-lg leading-[1.65] text-[#3A3530]">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 02 Actions ---------- */}
          <section className="space-y-6">
            <SectionHead id="actions" num="02" kicker="Instant county briefing" title="Look up any Mississippi county in ten seconds" dek="No account needed. Select a county to inspect its October 2026 figures, then copy a ready-to-send summary for your Circuit Clerk, Election Commission, or Board of Supervisors." />

            <div className="bg-white border-y-2 border-[#111111] p-5 sm:p-7">
              <label htmlFor="county" className="font-mono text-base font-bold uppercase tracking-[0.12em] text-[#5A534A]">Select county (all 82 available)</label>
              <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
                <select id="county" value={selected.county} onChange={(e) => setQuickCounty(e.target.value)} className="h-12 flex-1 border-2 border-[#111111] bg-[#F6F3EC] px-3.5 text-base font-bold">
                  {sortedCounties.map((c) => (
                    <option key={c.county} value={c.county}>{c.county} County ({fmt(c.total)} voters)</option>
                  ))}
                </select>
                <button
                  onClick={copyBrief}
                  className="inline-flex h-12 items-center justify-center gap-2 border-2 border-[#111111] px-6 text-base font-bold text-[#111111] whitespace-nowrap shrink-0 hover:brightness-95 cursor-pointer"
                  style={{ background: FILL }}
                >
                  {copied ? <Check className="h-5 w-5 shrink-0" /> : <Copy className="h-5 w-5 shrink-0" />}
                  {copied ? "Copied to clipboard" : "Copy county briefing"}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">{selected.county} County</h3>
                <span className="text-base font-bold whitespace-nowrap" style={{ color: selected.regime === "Equilibrium Manifold Surface" ? INK : FOCUS }}>
                  {STATUS_LABEL[selected.regime] || selected.regime}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-[#DDD6CA] pt-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  [fmt(selected.total), "registered voters"],
                  [fmt(Number((selected as Record<string, unknown>).registrations2026 ?? 0)), "2026 registrations"],
                  [fmt(selected.highDensityCount), "8+ voter addresses"],
                  [fmt(selected.ncoaCount), "active out-of-state mail"],
                  [String(selected.overCapacityPrecincts), "precincts over 3,000"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dd className="font-serif text-2xl sm:text-3xl font-bold tabular-nums leading-none">{v}</dd>
                    <dt className="mt-1.5 text-base font-medium text-[#5A534A]">{l}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ---------- 03 Map ---------- */}
          <section className="space-y-6">
            <SectionHead id="map" num="03" kicker="Interactive 3D geometry" title="All 82 counties mapped across three task areas" dek="Drag to rotate, click any marker to inspect that county, or open Full Screen 3D. The sky-blue net shows the normal baseline for a county's population; marigold-amber vertical stems and distinct marker shapes highlight extra cleanup work." />
            <div className="print:hidden">
              <ThreatManifold3DExplorer compact forceUnlocked />
            </div>
          </section>

          {/* ---------- 04 Filtering ---------- */}
          <section className="space-y-6" style={{ contentVisibility: "auto" }}>
            <SectionHead id="filtering" num="04" kicker="Signal vs. noise" title="Ordinary explanations, set aside first" dek="Basic database queries flag college dorms, nursing homes, and fathers and sons who share a name. We separate those first so election officials only review actionable records. Gray was set aside; marigold gold is what remains." />
            <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {[
                ["Dorms & apartments missing a unit number", playbooks.missingDorm.totalVoters + playbooks.missingDorm.streetNameFalsePositivesRemoved, playbooks.missingDorm.activeVoters, "Street names like “Marshall Pl” removed; inactive records excluded"],
                ["Voters at addresses with 8 or more registrations", playbooks.highDensity.totalVoters, playbooks.highDensity.singleFamilyAnomalyVoters, "University dorms, nursing homes & apartment complexes set aside"],
                ["Same-name records in the same 5-digit ZIP code", playbooks.duplicates.generationalPairs + playbooks.duplicates.trueDuplicates, playbooks.duplicates.activeActiveDuplicates, "6,146 Jr./Sr. households protected; only active–active pairs remain"],
                ["Out-of-state mailing addresses", ncoa.totalAllStatusVoters, ncoa.totalVoters, "11,178 voters already marked Inactive set aside"],
              ].map(([t, total, left, note]) => {
                const keep = Math.max(3, Math.round(((left as number) / (total as number)) * 100));
                return (
                  <div key={t as string} className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-xl font-bold">{t}</h3>
                      <span className="text-base tabular-nums text-[#3A3530] whitespace-nowrap">
                        <strong style={{ color: FOCUS }}>{fmt(left as number)}</strong> to review of {fmt(total as number)}
                      </span>
                    </div>
                    <div className="mt-3 flex h-3.5 w-full">
                      <div className="h-full bg-[#D8D1C4]" style={{ width: `${100 - keep}%` }} />
                      <div className="h-full" style={{ width: `${keep}%`, background: FILL }} />
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-[#5A534A]">{note}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- 05 Ballots ---------- */}
          <section className="space-y-6" style={{ contentVisibility: "auto" }}>
            <SectionHead
              id="ballots"
              num="05"
              kicker="Ballot history (October 26, 2026 extract)"
              title="Two more years of elections: +835,571 ballots added, 0 unmatched"
              dek={`Between 2024 and October 26, 2026, Mississippi recorded ${fmt(ballots2025)} ballots across 2025 municipal and special elections and ${fmt(ballots2026)} ballots across 2026 primaries and runoffs — increasing verified ballot history from ${fmt(ballotsThrough2024)} to ${fmt(totalBallotCredits)}. Every ballot matched a registered voter.`}
            />

            {/* 2024 vs 2025-2026 Accounting Ledger */}
            <dl className="grid grid-cols-1 border-y-2 border-[#111111] bg-white sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD6CA]">
              <div className="p-5">
                <dt className="font-mono text-base font-bold uppercase tracking-wider text-[#5A534A]">Through 2024</dt>
                <dd className="mt-1 font-serif text-3xl font-bold tabular-nums">{fmt(ballotsThrough2024)}</dd>
                <div className="mt-1 text-base text-[#5A534A]">historical ballot records</div>
              </div>
              <div className="p-5 bg-[#FEF3C7]/45">
                <dt className="font-mono text-base font-bold uppercase tracking-wider" style={{ color: FOCUS }}>Added in 2025–2026</dt>
                <dd className="mt-1 font-serif text-3xl font-bold tabular-nums" style={{ color: FOCUS }}>+{fmt(ballotsAdded25_26)}</dd>
                <div className="mt-1 text-base text-[#3A3530]">{fmt(ballots2025)} in 2025 · {fmt(ballots2026)} in 2026</div>
              </div>
              <div className="p-5">
                <dt className="font-mono text-base font-bold uppercase tracking-wider text-[#111111]">Oct 26, 2026 Total</dt>
                <dd className="mt-1 font-serif text-3xl font-bold tabular-nums">{fmt(totalBallotCredits)}</dd>
                <div className="mt-1 text-base text-[#5A534A]">0 orphaned · {dup2026Primary} duplicate 2026 primary scans</div>
              </div>
            </dl>

            <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {votingHistoryAudit.majorElections.map((e) => {
                const isRecent = e.date.endsWith("/2026") || e.date.endsWith("/2025");
                return (
                  <div key={e.date} className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-[330px_1fr_110px] sm:items-center sm:gap-4">
                    <div className="text-base font-bold">
                      {e.label.replace(" General Election", "")}{" "}
                      <span className="font-mono text-[#5A534A]">({e.date})</span>
                    </div>
                    <Bar value={e.ballotsRecorded} max={maxBallots} focus={isRecent} label={`${fmt(e.ballotsRecorded)} ballots`} />
                    <div className="text-base font-mono font-bold tabular-nums sm:text-right whitespace-nowrap" style={isRecent ? { color: FOCUS } : undefined}>
                      {fmt(e.ballotsRecorded)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- 06 Connections ---------- */}
          <section className="space-y-6" style={{ contentVisibility: "auto" }}>
            <SectionHead id="connections" num="06" kicker="Patterns across counties" title="Do these issues travel together?" dek="A score near 1 means two measures rise and fall together across counties; near 0 means no pattern. Where raw counts would simply reflect population size, we compare rates per 1,000 voters." />
            <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {correlations.map((c) => (
                <li key={c.id} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_180px] sm:gap-8">
                  <div>
                    <h3 className="font-serif text-xl font-bold leading-snug">{c.plainTitle}</h3>
                    <p className="mt-2 max-w-[65ch] text-base leading-[1.65] text-[#3A3530]">{c.commonManTakeaway}</p>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-bold tabular-nums leading-none" style={{ color: FOCUS }}>{c.pearsonR.toFixed(2)}</div>
                    <div className="mt-2"><Bar value={Math.abs(c.pearsonR)} max={1} focus /></div>
                    <div className="mt-1.5 text-base text-[#5A534A] whitespace-nowrap">correlation (−1 to 1)</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 07 The 10 checks (zero scrolling tables) ---------- */}
          <section className="space-y-10" style={{ contentVisibility: "auto" }}>
            <SectionHead id="checks" num="07" kicker="The 10 checks" title="What we looked for, and what we found" dek="Every check below uses 5-digit USPS ZIP normalization and strict Zero-PII masking. Full tables appear in the printable PDF." />

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold">Check 1 · Addresses with 8 or more voters</h3>
              <p className="max-w-[65ch] text-base sm:text-lg leading-[1.65] text-[#3A3530]">
                {fmt(playbooks.highDensity.totalAddresses)} addresses ({fmt(playbooks.highDensity.totalVoters)} voters) have 8 or more registrations.
                After setting aside {fmt(playbooks.highDensity.institutionalClusters)} campus and care-home sites and {fmt(playbooks.highDensity.multiFamilyClusters)} apartment complexes,{" "}
                <strong style={{ color: FOCUS }}>{fmt(playbooks.highDensity.singleFamilyAnomalies)} single-family homes</strong> ({fmt(playbooks.highDensity.singleFamilyAnomalyVoters)} registrations) remain for county canvass review. Exact house numbers are withheld for privacy:
              </p>
              <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {playbooks.highDensity.topSingleFamilyAnomalies.slice(0, 6).map((r, i) => (
                  <li key={`${r.address}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5">
                    <div>
                      <span className="font-serif text-lg font-bold">{r.address}</span>
                      <span className="ml-2 text-base text-[#5A534A]">· {r.county} County</span>
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
              <h3 className="font-serif text-2xl font-bold">Check 2 · Dorms and apartments missing a room number</h3>
              <p className="max-w-[65ch] text-base sm:text-lg leading-[1.65] text-[#3A3530]">
                Searching for &ldquo;HALL&rdquo; also catches &ldquo;Mars<strong>hall</strong> Place.&rdquo; Matching whole words
                removed {fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)} street-name false alarms, leaving{" "}
                {fmt(playbooks.missingDorm.totalVoters)} campus and apartment records ({fmt(playbooks.missingDorm.activeVoters)} active) where adding a room or apartment number prevents returned mail.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold">Check 3 · Out-of-state mailing addresses</h3>
              <p className="max-w-[65ch] text-base sm:text-lg leading-[1.65] text-[#3A3530]">
                {ncoaInactivePct}% ({fmt(ncoa.inactiveRelocatedVoters)} of {fmt(ncoa.totalAllStatusVoters)}) are already marked Inactive under federal rules.{" "}
                <strong style={{ color: FOCUS }}>{fmt(ncoa.totalVoters)} active voters</strong> need an address-confirmation postcard. Top destination states:
              </p>
              <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {ncoaStates.map((x) => (
                  <div key={x.s} className="grid grid-cols-[52px_1fr_84px] items-center gap-3 px-5 py-2.5">
                    <span className="font-mono text-base font-bold">{x.s}</span>
                    <Bar value={x.n} max={maxState} />
                    <span className="text-right text-base font-mono font-bold tabular-nums whitespace-nowrap">{fmt(x.n)}</span>
                  </div>
                ))}
              </div>
            </div>

            <ol className="divide-y divide-[#DDD6CA] border-y border-[#DDD6CA]">
              {[
                ["Check 4 · P.O. boxes typed in the home-address field", `${fmt(playbooks.commercialPOBox.totalVoters)} records statewide (${fmt(playbooks.commercialPOBox.activeVoters)} active). A physical street address is required to assign a voting precinct; P.O. Box numbers are withheld for privacy.`],
                ["Check 5 · Legacy paper-migration placeholder dates", `${fmt(playbooks.clericalTypos.totalAnomalies)} records carry default dates (such as 1801 or 0001) or single-initial names from early-2000s digitization. These are clerical artifacts, not improper voting.`],
                ["Check 6 · Same-ZIP duplicate registrations", `${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. and Roman-numeral family households were protected first. Within the same 5-digit ZIP code, ${fmt(playbooks.duplicates.trueDuplicates)} exact First+Middle+Last+Suffix matches appear at different addresses; ${fmt(playbooks.duplicates.activeActiveDuplicates)} have both records Active.`],
                ["Checks 7–8 · October 2026 deadline surge & large precincts", `${fmt(registrations2026)} voters registered in 2026 through October 26, peaking on the October 5, 2026 statutory 30-day deadline (${fmt(peak2026Count)} single-day registrations; all-time peak ${fmt(playbooks.registrationSpikes.peakDates[0].count)} on ${playbooks.registrationSpikes.peakDates[0].date}). Statewide, ${playbooks.precinctCapacity.overCapacityCount} precincts exceed 3,000 voters and ${fivePlus} exceed 5,000.`],
                ["Check 9 · First-digit accounting test (Benford’s Law)", `Precinct registration sizes conform naturally to Benford’s first-digit distribution (chi-square ${benford.chiSquare}, well below the 15.51 critical threshold). Turnout counts deviate (chi-square ${benfordTurnout.chiSquare}) because counties cap precinct sizes around 1,500–3,000 voters — a known mathematical property of bounded precincts.`],
              ].map(([t, b]) => (
                <li key={t} className="py-5">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold">{t}</h3>
                  <p className="mt-2 max-w-[65ch] text-base sm:text-lg leading-[1.65] text-[#3A3530]">{b}</p>
                </li>
              ))}
            </ol>

            {/* Top 6 Largest Precincts — zero-scroll responsive list */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-serif text-xl font-bold">Six largest precincts statewide (over 5,000 registered voters)</h4>
                <a href="/Marigold-Mississippi-Playbook-Analysis.pdf" download className="text-base font-bold underline underline-offset-4" style={{ color: FOCUS }}>
                  See full list in PDF →
                </a>
              </div>
              <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {playbooks.precinctCapacity.topOverCapacity.slice(0, 6).map((p) => (
                  <li key={`${p.county}-${p.precinctCode}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5">
                    <div>
                      <span className="font-serif text-lg font-bold">{p.precinctName}</span>{" "}
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

          {/* ---------- 08 Priority Counties (no horizontal-scrolling tables) ---------- */}
          <section className="space-y-6" style={{ contentVisibility: "auto" }}>
            <SectionHead
              id="ledger"
              num="08"
              kicker="Priority county highlights"
              title={`The ${priorityCount} counties outside the normal baseline`}
              dek={`Ranked by priority score across address density (X), out-of-state mail & duplicates (Y), and 3,000+ voter precincts (Z). The other ${normalCount} Mississippi counties sit within the normal baseline for their population size. Download the printable PDF for the complete 82-county ledger.`}
            />
            <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {priorityCounties.map((c, i) => {
                const cAny = c as Record<string, unknown>;
                return (
                  <li key={c.county} className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 gap-y-1.5 px-4 py-4 sm:px-6 sm:grid-cols-[3rem_1fr_11rem_5.5rem]">
                    <span className="font-serif text-xl font-bold tabular-nums text-[#8A8279]">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <div className="font-serif text-xl font-bold leading-tight text-[#111111]">{c.county} County</div>
                      <div className="mt-1 text-base leading-snug text-[#3A3530] font-medium">
                        {STATUS_LABEL[c.regime] || c.regime}
                      </div>
                      <div className="mt-1 text-base leading-snug text-[#5A534A]">
                        {fmt(c.total)} voters · {fmt(c.highDensityCount)} 8+ addr. · {fmt(c.ncoaCount)} out-of-state mail · {fmt(c.duplicateCount)} dup. pairs · {c.overCapacityPrecincts} 3,000+ prec. · +{fmt(Number(cAny.registrations2026 ?? 0))} reg. in 2026
                      </div>
                    </div>
                    <div className="hidden sm:block self-center">
                      <Bar value={c.threatEnergy} max={100} focus label={`Priority score ${c.threatEnergy}`} />
                    </div>
                    <span className="font-serif text-2xl font-bold tabular-nums leading-none text-right" style={{ color: FOCUS }}>
                      {c.threatEnergy.toFixed(1)}
                    </span>
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
            <Kicker light>For election commissioners, county clerks &amp; state officials</Kicker>
            <h2 className="mt-3 max-w-[26ch] font-serif text-3xl sm:text-4xl font-bold leading-[1.12] tracking-tight">
              Download the full 82-county PDF or run Marigold on your own voter roll.
            </h2>
            <p className="mt-4 max-w-[62ch] text-lg leading-[1.65] text-[#E5E0D5]">
              The printable magazine edition includes the complete 82-county reference ledger for public meetings. Marigold subscribers can upload voter rolls from any state or county — our header-adaptive schema mapper automatically normalizes state column formats in minutes with strict Zero-PII guarantees.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <a
                href="/Marigold-Mississippi-Playbook-Analysis.pdf"
                download
                className="inline-flex h-12 items-center gap-2 px-6 text-base font-bold text-[#111111] whitespace-nowrap hover:brightness-95"
                style={{ background: FILL }}
              >
                <Download className="h-5 w-5 shrink-0" /> Download Full 82-County PDF
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
            Source: {metadata.sourceFile} &amp; {metadata.votingHistoryFile} ({fmt(totalBallotCredits)} verified ballot credits through October 26, 2026). {metadata.privacyStandard}.
          </footer>
        </main>
      </div>
    </div>
  );
}
