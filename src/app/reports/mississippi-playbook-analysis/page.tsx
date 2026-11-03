"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import { EditorialTable } from "@/components/report/EditorialTable";
import msAudit from "@/data/mississippi_audit_results.json";
import { ArrowLeft, ArrowRight, Compass, Download, Printer, Search, Copy, Check, ShieldCheck } from "lucide-react";

/* ---------- Design tokens (one focal color: vermilion) ---------- */
const INK = "#111111";
const FOCUS = "#C2341B";

const STATUS_LABEL: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "Needs attention in all 3 areas",
  "Axis-X Spatial Domicile Ridge": "Main focus: apartment & dorm unit numbers",
  "Axis-Y Interstate Drift Ridge": "Main focus: out-of-state mail & duplicates",
  "Axis-Z Precinct Strain Ridge": "Main focus: large precincts (3,000+)",
  "Equilibrium Manifold Surface": "On track — normal range",
};

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/* ---------- Small editorial primitives ---------- */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: FOCUS }}>
      {children}
    </div>
  );
}

function SectionHead({ id, num, kicker, title, dek }: { id: string; num: string; kicker: string; title: string; dek?: string }) {
  return (
    <header id={id} className="scroll-mt-24 border-t-2 border-[#111111] pt-6">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-[15px] font-bold tabular-nums text-[#8A8279]">{num}</span>
        <Kicker>{kicker}</Kicker>
      </div>
      <h2 className="mt-2 font-serif text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-tight text-[#111111]">{title}</h2>
      {dek && <p className="mt-2 max-w-[62ch] text-[16px] leading-relaxed text-[#3A3530]">{dek}</p>}
    </header>
  );
}

function Bar({ value, max, focus = false, label }: { value: number; max: number; focus?: boolean; label?: string }) {
  const w = Math.max(2, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="h-2.5 w-full bg-[#E9E4DA]" aria-label={label} role="img">
      <div className="h-full" style={{ width: `${w}%`, background: focus ? FOCUS : INK }} />
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

  /* ---------- Derived, data-bound figures (no hardcoded statistics) ---------- */
  const priorityCount = counties.filter((c) => c.regime !== "Equilibrium Manifold Surface").length;
  const normalCount = counties.length - priorityCount;
  const falseAlarms =
    playbooks.missingDorm.streetNameFalsePositivesRemoved +
    playbooks.duplicates.generationalPairs +
    playbooks.highDensity.institutionalVoters +
    playbooks.highDensity.multiFamilyVoters;
  const ncoa = playbooks.ncoaRelocations;
  const ncoaInactivePct = pct(ncoa.inactiveRelocatedVoters, ncoa.totalAllStatusVoters);
  const benford = playbooks.benfordsLaw;
  const benfordTurnout = benford.turnout2024;
  const fivePlus = playbooks.precinctCapacity.topOverCapacity.filter((p) => p.voterCount > 5000).length;

  /* ---------- State ---------- */
  const [quickCounty, setQuickCounty] = useState("Hinds");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<"ALL" | "PRIORITY" | "NORMAL">("ALL");

  const selected = useMemo(
    () => counties.find((c) => c.county === quickCounty) || counties[0],
    [counties, quickCounty]
  );
  const sortedCounties = useMemo(() => [...counties].sort((a, b) => a.county.localeCompare(b.county)), [counties]);
  const ledger = useMemo(
    () =>
      counties.filter((c) => {
        const q = search.trim().toLowerCase();
        const okQ = !q || c.county.toLowerCase().includes(q);
        const isNormal = c.regime === "Equilibrium Manifold Surface";
        return okQ && (tier === "ALL" || (tier === "NORMAL" ? isNormal : !isNormal));
      }),
    [counties, search, tier]
  );
  const maxBallots = Math.max(...votingHistoryAudit.majorElections.map((e) => e.ballotsRecorded));
  const ncoaStates = Object.entries(ncoa.stateBreakdown).slice(0, 8).map(([s, n]) => ({ s, n: Number(n) }));
  const maxState = Math.max(...ncoaStates.map((x) => x.n));

  const copyBrief = () => {
    const text = [
      `${selected.county} County, Mississippi — Voter Roll Summary`,
      `Status: ${STATUS_LABEL[selected.regime] || selected.regime}`,
      `Registered voters: ${fmt(selected.total)} (${fmt(selected.active)} active)`,
      `Addresses with 8+ voters: ${fmt(selected.highDensityCount)}`,
      `Active voters with out-of-state mail: ${fmt(selected.ncoaCount)}`,
      `Precincts over 3,000 voters: ${selected.overCapacityPrecincts}`,
      `Statewide: ${fmt(votingHistoryAudit.totalHistoryRowsScanned)} past ballots checked, 0 unmatched.`,
      `Full public report (no personal data): https://marigoldinsights.org/reports/mississippi-playbook-analysis`,
    ].join("\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const navItems = [
    ["takeaways", "01", "Key takeaways"],
    ["actions", "02", "What you can do"],
    ["map", "03", "3D county map"],
    ["filtering", "04", "False alarms removed"],
    ["ballots", "05", "Ballot history check"],
    ["connections", "06", "2-for-1 fixes"],
    ["checks", "07", "The 10 checks"],
    ["ledger", "08", "All 82 counties"],
  ] as const;

  return (
    <div className="w-full max-w-[100vw] overflow-x-clip min-h-screen bg-[#F6F3EC] text-[#111111] print:bg-white">
      {/* ---------- Single sticky top bar ---------- */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#111111] bg-[#F6F3EC]/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-8">
          <Link href="/overview" className="inline-flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap hover:text-[#C2341B]">
            <ArrowLeft className="h-4 w-4" /> Marigold
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/manifold" className="inline-flex h-10 items-center gap-1.5 border border-[#111111] bg-white px-3 text-[13px] font-semibold whitespace-nowrap hover:bg-[#EFEAE0]">
              <Compass className="h-4 w-4" /> 3D map
            </Link>
            <button onClick={() => window.print()} className="hidden md:inline-flex h-10 items-center gap-1.5 border border-[#111111] bg-white px-3 text-[13px] font-semibold hover:bg-[#EFEAE0]">
              <Printer className="h-4 w-4" /> Print
            </button>
            <a href="/Marigold-Mississippi-Playbook-Analysis.pdf" download className="inline-flex h-10 items-center gap-1.5 bg-[#111111] px-3 text-[13px] font-semibold text-white whitespace-nowrap hover:bg-[#2A2724]">
              <Download className="h-4 w-4" /> PDF
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-4 py-8 sm:px-8 sm:py-14 lg:grid-cols-[200px_minmax(0,1fr)] print:block">
        {/* ---------- Left spine ---------- */}
        <aside className="hidden lg:block print:hidden">
          <nav className="sticky top-20 border-t-2 border-[#111111] pt-3" aria-label="Report sections">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#5A534A]">Contents</div>
            <ol className="mt-2 divide-y divide-[#DDD6CA] border-b border-[#DDD6CA]">
              {navItems.map(([id, n, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex gap-3 py-2 text-[13px] font-medium text-[#2C2825] hover:text-[#C2341B]">
                    <span className="font-serif tabular-nums text-[#8A8279]">{n}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex gap-1.5 text-[12px] leading-snug text-[#3A3530]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
              No names, birth dates, voter IDs, P.O. Box numbers, or house numbers appear anywhere in this report.
            </p>
          </nav>
        </aside>

        <main className="min-w-0 max-w-[880px] space-y-16">
          {/* ---------- Hero ---------- */}
          <section>
            <Kicker>Mississippi · Public edition · No login required</Kicker>
            <h1 className="mt-4 font-serif text-[38px] sm:text-[56px] font-bold leading-[1.03] tracking-[-0.02em]">
              Mississippi&rsquo;s voter roll is in good shape. Here&rsquo;s where to tidy up.
            </h1>
            <p className="mt-5 max-w-[60ch] font-serif text-[19px] sm:text-[21px] leading-[1.55] text-[#2C2825]">
              We checked {fmt(metadata.totalRecords)} registrations and {fmt(votingHistoryAudit.totalHistoryRowsScanned)} past
              ballots across all 82 counties. Every ballot matched a real voter. After removing {fmt(falseAlarms)} false
              alarms, what remains is routine, fixable list maintenance.
            </p>

            {/* Mobile section picker (non-sticky) */}
            <label className="mt-6 block lg:hidden print:hidden">
              <span className="sr-only">Jump to section</span>
              <select
                onChange={(e) => document.getElementById(e.target.value)?.scrollIntoView({ behavior: "smooth" })}
                defaultValue=""
                className="h-11 w-full border border-[#111111] bg-white px-3 text-[15px] font-medium"
              >
                <option value="" disabled>Jump to a section…</option>
                {navItems.map(([id, n, label]) => (
                  <option key={id} value={id}>{n} · {label}</option>
                ))}
              </select>
            </label>

            {/* Key figures — hairline row, no cards */}
            <dl className="mt-8 grid grid-cols-2 border-y-2 border-[#111111] sm:grid-cols-4">
              {[
                [fmt(votingHistoryAudit.totalHistoryRowsScanned), "past ballots checked", "0 unmatched"],
                [`${normalCount} of 82`, "counties in normal range", `${priorityCount} with extra tasks`],
                [fmt(falseAlarms), "false alarms removed", "before anyone reviews"],
                [`${ncoaInactivePct}%`, "of out-of-state movers", "already set Inactive"],
              ].map(([v, l, s], i) => (
                <div key={l} className={`py-5 pr-3 ${i % 2 ? "pl-4 border-l border-[#DDD6CA]" : ""} ${i === 2 ? "sm:pl-4 sm:border-l" : ""} ${i >= 2 ? "border-t border-[#DDD6CA] sm:border-t-0" : ""}`}>
                  <dd className="font-serif text-[30px] sm:text-[36px] font-bold leading-none tabular-nums" style={i === 2 ? { color: FOCUS } : undefined}>{v}</dd>
                  <dt className="mt-2 text-[14px] font-semibold leading-tight">{l}</dt>
                  <div className="text-[13px] text-[#6E675F]">{s}</div>
                </div>
              ))}
            </dl>
          </section>

          {/* ---------- 01 Takeaways ---------- */}
          <section className="space-y-6">
            <SectionHead id="takeaways" num="01" kicker="Key takeaways" title="Four things to know" />
            <ol className="divide-y divide-[#DDD6CA] border-b border-[#DDD6CA]">
              {[
                ["No phantom ballots.", `All ${fmt(votingHistoryAudit.totalHistoryRowsScanned)} past ballots trace back to a registered voter. ${normalCount} of 82 counties look normal for their size.`],
                ["Most “red flags” are ordinary buildings and families.", `College dorms, nursing homes, ${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. households, and ${fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)} homes on streets like “Marshall Place” were filtered out first.`],
                ["Clerks are already handling people who moved.", `Of ${fmt(ncoa.totalAllStatusVoters)} voters with an out-of-state mailing address, ${fmt(ncoa.inactiveRelocatedVoters)} (${ncoaInactivePct}%) are already Inactive. ${fmt(ncoa.totalVoters)} active voters still need a confirmation postcard.`],
                ["Each county has its own to-do list.", `College towns mostly need apartment and dorm room numbers (${fmt(playbooks.missingDorm.totalVoters)} records). Growing suburbs mostly need busy precincts split (${playbooks.precinctCapacity.overCapacityCount} over 3,000 voters).`],
              ].map(([t, b], i) => (
                <li key={t} className="grid grid-cols-[36px_1fr] gap-2 py-5 sm:grid-cols-[52px_1fr]">
                  <span className="font-serif text-[22px] font-bold tabular-nums" style={{ color: FOCUS }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-serif text-[20px] sm:text-[22px] font-bold leading-snug">{t}</h3>
                    <p className="mt-1 max-w-[62ch] text-[16px] leading-relaxed text-[#3A3530]">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 02 Actions ---------- */}
          <section className="space-y-6">
            <SectionHead id="actions" num="02" kicker="What you can do today" title="Look up your county in ten seconds" dek="No account needed. Pick a county, then copy a plain-text summary to share with your clerk, board, or neighbors." />

            <div className="bg-white border-y-2 border-[#111111] p-5 sm:p-7">
              <label htmlFor="county" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#5A534A]">Your county</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <select id="county" value={selected.county} onChange={(e) => setQuickCounty(e.target.value)} className="h-12 flex-1 border border-[#111111] bg-[#F6F3EC] px-3 text-[16px] font-semibold">
                  {sortedCounties.map((c) => (
                    <option key={c.county} value={c.county}>{c.county} County</option>
                  ))}
                </select>
                <button onClick={copyBrief} className="inline-flex h-12 items-center justify-center gap-2 px-5 text-[15px] font-semibold text-white" style={{ background: FOCUS }}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy county summary"}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-[26px] font-bold">{selected.county} County</h3>
                <span className="text-[14px] font-semibold" style={{ color: selected.regime === "Equilibrium Manifold Surface" ? INK : FOCUS }}>
                  {STATUS_LABEL[selected.regime] || selected.regime}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-4 border-t border-[#DDD6CA] pt-4 sm:grid-cols-4">
                {[
                  [fmt(selected.total), "registered voters"],
                  [fmt(selected.highDensityCount), "addresses with 8+ voters"],
                  [fmt(selected.ncoaCount), "active, out-of-state mail"],
                  [String(selected.overCapacityPrecincts), "precincts over 3,000"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dd className="font-serif text-[26px] font-bold tabular-nums leading-none">{v}</dd>
                    <dt className="mt-1 text-[13px] text-[#5A534A]">{l}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="divide-y divide-[#DDD6CA] border-y border-[#DDD6CA]">
              {[
                ["/Marigold-Mississippi-Playbook-Analysis.pdf", "Print the 10-page guide", "Black-and-white friendly. Bring it to your next commission meeting.", true],
                ["#map", "Compare counties in 3D", "See which of the three task areas matters most where you live.", false],
                ["#ledger", "Check all 82 counties side by side", "Search and filter the full table.", false],
              ].map(([href, t, d, dl]) => (
                <li key={t as string}>
                  <a href={href as string} {...(dl ? { download: true } : {})} className="group flex min-h-[64px] items-center justify-between gap-4 py-4">
                    <span>
                      <span className="block font-serif text-[19px] font-bold group-hover:text-[#C2341B]">{t}</span>
                      <span className="block text-[14px] text-[#5A534A]">{d}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- 03 Map ---------- */}
          <section className="space-y-6">
            <SectionHead id="map" num="03" kicker="Interactive" title="All 82 counties in 3D" dek="Drag to turn the map. Tap a circle to see that county. The green net shows normal for a county's size; red lines show extra work." />
            <div className="print:hidden">
              <ThreatManifold3DExplorer compact forceUnlocked />
            </div>
            <EditorialTable
              caption={`The ${priorityCount} counties with extra tasks`}
              rows={counties.filter((c) => c.regime !== "Equilibrium Manifold Surface")}
              rowKey={(c) => c.county}
              columns={[
                { key: "county", label: "County" },
                { key: "total", label: "Voters", align: "right", render: (c) => fmt(c.total) },
                { key: "threatEnergy", label: "Priority score", align: "right", focus: true },
                { key: "dominantDriver", label: "Main focus" },
              ]}
            />
          </section>

          {/* ---------- 04 Filtering ---------- */}
          <section className="space-y-6">
            <SectionHead id="filtering" num="04" kicker="Signal vs. noise" title={`${fmt(falseAlarms)} false alarms, removed first`} dek="Simple scans flag dorms, nursing homes, and fathers and sons with the same name. We set those aside so clerks only see real work. Gray is noise; red is what's left to review." />
            <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {[
                ["Dorms & apartments missing a unit number", playbooks.missingDorm.totalVoters + playbooks.missingDorm.streetNameFalsePositivesRemoved, playbooks.missingDorm.activeVoters, "Street names like “Marshall Pl” removed"],
                ["Addresses with 8 or more voters", playbooks.highDensity.totalVoters, playbooks.highDensity.singleFamilyAnomalyVoters, "Campuses, nursing homes & apartment complexes set aside"],
                ["Same name, same ZIP code", playbooks.duplicates.generationalPairs + playbooks.duplicates.trueDuplicates, playbooks.duplicates.activeActiveDuplicates, "Jr./Sr. households protected"],
                ["Out-of-state mailing address", ncoa.totalAllStatusVoters, ncoa.totalVoters, "Already-Inactive voters set aside"],
              ].map(([t, total, left, note]) => {
                const keep = Math.max(3, Math.round(((left as number) / (total as number)) * 100));
                return (
                  <div key={t as string} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-[18px] font-bold">{t}</h3>
                      <span className="text-[14px] tabular-nums text-[#3A3530]">
                        <strong style={{ color: FOCUS }}>{fmt(left as number)}</strong> to review of {fmt(total as number)}
                      </span>
                    </div>
                    <div className="mt-3 flex h-3 w-full">
                      <div className="h-full bg-[#D8D1C4]" style={{ width: `${100 - keep}%` }} />
                      <div className="h-full" style={{ width: `${keep}%`, background: FOCUS }} />
                    </div>
                    <p className="mt-2 text-[13px] text-[#5A534A]">{note}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- 05 Ballots ---------- */}
          <section className="space-y-6">
            <SectionHead id="ballots" num="05" kicker="Ballot history" title="Every past ballot matches a real voter" dek={`${fmt(votingHistoryAudit.totalHistoryRowsScanned)} ballot records, matched one by one to the voter roll. Unmatched: 0. Double-scanned 2024 credits: ${votingHistoryAudit.duplicate2024SameDayCreditRows}.`} />
            <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
              {votingHistoryAudit.majorElections.map((e) => (
                <div key={e.date} className="grid grid-cols-1 gap-1.5 px-4 py-3 sm:grid-cols-[230px_1fr_96px] sm:items-center sm:gap-4">
                  <div className="text-[14px] font-semibold">{e.label.replace(" General Election", "")}</div>
                  <Bar value={e.ballotsRecorded} max={maxBallots} focus={e.date === "11/05/2024"} label={`${fmt(e.ballotsRecorded)} ballots`} />
                  <div className="text-[14px] tabular-nums sm:text-right">{fmt(e.ballotsRecorded)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 06 Connections ---------- */}
          <section className="space-y-6">
            <SectionHead id="connections" num="06" kicker="2-for-1 fixes" title="Which fixes solve two problems at once" dek="A score near 1.00 means two issues rise and fall together across counties — so fixing one usually helps the other." />
            <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111]">
              {correlations.map((c) => (
                <li key={c.id} className="grid grid-cols-1 gap-3 py-5 sm:grid-cols-[1fr_160px] sm:gap-8">
                  <div>
                    <h3 className="font-serif text-[19px] font-bold leading-snug">{c.plainTitle}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-[#3A3530]">{c.commonManTakeaway}</p>
                  </div>
                  <div>
                    <div className="font-serif text-[28px] font-bold tabular-nums leading-none">{c.pearsonR.toFixed(2)}</div>
                    <div className="mt-2"><Bar value={Math.abs(c.pearsonR)} max={1} focus /></div>
                    <div className="mt-1 text-[12px] text-[#6E675F]">connection score (0–1)</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 07 The 10 checks ---------- */}
          <section className="space-y-10">
            <SectionHead id="checks" num="07" kicker="The 10 checks" title="What we looked for, and what we found" />

            <div className="space-y-4">
              <h3 className="font-serif text-[22px] font-bold">Check 1 · Addresses with 8 or more voters</h3>
              <p className="max-w-[62ch] text-[16px] leading-relaxed text-[#3A3530]">
                {fmt(playbooks.highDensity.totalAddresses)} addresses qualify. Most are campuses, nursing homes, and apartment
                complexes. {fmt(playbooks.highDensity.singleFamilyAnomalies)} are single-family homes worth a closer look — usually
                past renters who never updated their registration. House numbers are hidden to the nearest 100 block.
              </p>
              <EditorialTable
                caption="Largest single-family addresses (100-block masked)"
                rows={playbooks.highDensity.topSingleFamilyAnomalies.slice(0, 10)}
                rowKey={(r, i) => `${r.address}-${i}`}
                maxHeight={360}
                columns={[
                  { key: "address", label: "Street block", render: (r) => `${r.address}, ${r.city}` },
                  { key: "county", label: "County" },
                  { key: "occupantCount", label: "Voters", align: "right", focus: true },
                  { key: "activeOccupantCount", label: "Active", align: "right" },
                ]}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-[22px] font-bold">Check 2 · Dorms and apartments missing a room number</h3>
              <p className="max-w-[62ch] text-[16px] leading-relaxed text-[#3A3530]">
                Searching for &ldquo;HALL&rdquo; also catches &ldquo;Mars<strong>hall</strong> Place.&rdquo; Matching whole words
                removed {fmt(playbooks.missingDorm.streetNameFalsePositivesRemoved)} false hits, leaving{" "}
                {fmt(playbooks.missingDorm.totalVoters)} real campus and apartment records ({fmt(playbooks.missingDorm.activeVoters)} active).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-[22px] font-bold">Check 3 · Out-of-state mailing addresses</h3>
              <p className="max-w-[62ch] text-[16px] leading-relaxed text-[#3A3530]">
                {ncoaInactivePct}% are already Inactive under federal rules. {fmt(ncoa.totalVoters)} active voters need a confirmation postcard. Most destinations are neighboring states and military moves.
              </p>
              <div className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111] bg-white">
                {ncoaStates.map((x) => (
                  <div key={x.s} className="grid grid-cols-[44px_1fr_64px] items-center gap-3 px-4 py-2">
                    <span className="font-mono text-[13px] font-bold">{x.s}</span>
                    <Bar value={x.n} max={maxState} />
                    <span className="text-right text-[13px] tabular-nums">{fmt(x.n)}</span>
                  </div>
                ))}
              </div>
            </div>

            <ol className="divide-y divide-[#DDD6CA] border-y border-[#DDD6CA]">
              {[
                ["Check 4 · P.O. boxes typed as a home address", `${fmt(playbooks.commercialPOBox.totalVoters)} records statewide. A home address is needed to assign the right precinct; box numbers are not shown.`],
                ["Check 5 · Old placeholder dates like 1801", `${fmt(playbooks.clericalTypos.totalAnomalies)} records carry default dates from the early-2000s move off paper. These are clerical, not fraud.`],
                ["Check 6 · Same-name duplicates", `${fmt(playbooks.duplicates.generationalPairs)} Jr./Sr. households protected. ${fmt(playbooks.duplicates.activeActiveDuplicates)} same-ZIP pairs where both records are active should be reviewed.`],
                ["Checks 7–8 · Deadline spikes and busy precincts", `Sign-ups peak at the 30-day deadline before presidential elections — expected. ${playbooks.precinctCapacity.overCapacityCount} precincts exceed 3,000 voters; ${fivePlus} of the largest exceed 5,000.`],
                ["Check 9 · Accounting pattern test", `Registration totals across precincts follow the natural first-digit pattern auditors expect (score ${benford.chiSquare}, ${benford.conforming ? "pass" : "review"}). Turnout counts deviate (score ${benfordTurnout.chiSquare}) because counties deliberately size precincts — this is a known limitation of the test, not a red flag.`],
              ].map(([t, b]) => (
                <li key={t} className="py-5">
                  <h3 className="font-serif text-[19px] font-bold">{t}</h3>
                  <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-[#3A3530]">{b}</p>
                </li>
              ))}
            </ol>

            <EditorialTable
              caption="Largest precincts"
              rows={playbooks.precinctCapacity.topOverCapacity.slice(0, 10)}
              rowKey={(p) => `${p.county}-${p.precinctCode}`}
              maxHeight={360}
              columns={[
                { key: "precinctName", label: "Precinct", render: (p) => `${p.precinctName} (${p.precinctCode})` },
                { key: "county", label: "County" },
                { key: "voterCount", label: "Voters", align: "right", focus: true, render: (p) => fmt(p.voterCount) },
                { key: "activeVoterCount", label: "Active", align: "right", render: (p) => fmt(p.activeVoterCount) },
              ]}
            />
          </section>

          {/* ---------- Share ---------- */}
          <section className="space-y-6">
            <SectionHead id="share" num="—" kicker="Share it" title={toolkit.headline} />
            <ol className="grid grid-cols-1 border-y-2 border-[#111111] md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-[#DDD6CA]">
              {toolkit.evangelismSteps.map((s) => (
                <li key={s.step} className="py-5 md:px-5 first:md:pl-0">
                  <span className="font-serif text-[22px] font-bold" style={{ color: FOCUS }}>{s.step}</span>
                  <h3 className="mt-1 font-serif text-[18px] font-bold leading-snug">{s.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#3A3530]">{s.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- 08 Ledger ---------- */}
          <section className="space-y-6">
            <SectionHead id="ledger" num="08" kicker="Reference" title="All 82 counties" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
              <label className="relative flex-1">
                <span className="sr-only">Search counties</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E675F]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a county" className="h-11 w-full border border-[#111111] bg-white pl-9 pr-3 text-[15px]" />
              </label>
              <div className="flex" role="group" aria-label="Filter counties">
                {([["ALL", "All 82"], ["PRIORITY", `${priorityCount} with tasks`], ["NORMAL", `${normalCount} normal`]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setTier(k)} aria-pressed={tier === k} className={`h-11 border border-[#111111] px-3 text-[14px] font-semibold -ml-px first:ml-0 ${tier === k ? "bg-[#111111] text-white" : "bg-white"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <EditorialTable
              rows={ledger}
              rowKey={(c) => c.county}
              maxHeight={560}
              columns={[
                { key: "county", label: "County" },
                { key: "total", label: "Voters", align: "right", render: (c) => fmt(c.total) },
                { key: "highDensityCount", label: "8+ addresses", align: "right" },
                { key: "ncoaCount", label: "Out-of-state", align: "right" },
                { key: "duplicateCount", label: "Same-ZIP dup.", align: "right" },
                { key: "overCapacityPrecincts", label: "3,000+ precincts", align: "right" },
                { key: "threatEnergy", label: "Score", align: "right", focus: true },
                { key: "regime", label: "Status", render: (c) => STATUS_LABEL[c.regime] || c.regime },
              ]}
            />
          </section>

          <footer className="border-t-2 border-[#111111] pt-6 text-[13px] leading-relaxed text-[#5A534A]">
            Source: {metadata.sourceFile}. {metadata.privacyStandard}.
          </footer>
        </main>
      </div>
    </div>
  );
}
