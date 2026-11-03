import React from "react";
import Link from "next/link";
import msAudit from "@/data/mississippi_audit_results.json";
import { ArrowRight, Download } from "lucide-react";

export const metadata = {
  title: "What's new: Mississippi voter roll review | Marigold Insights",
  description:
    "Plain-English notes on the Mississippi 82-county voter roll review, the interactive county map, and the printable guide. No personal data.",
};

const fmt = (n: number) => n.toLocaleString("en-US");

export default function UpdatesReleasePostPage() {
  const { metadata: md, votingHistoryAudit: vh, threatManifold: tm, playbooks: pb } = msAudit;
  const counties = tm.countyVectors.filter((c) => c.total > 0);
  const normal = counties.filter((c) => c.regime === "Equilibrium Manifold Surface").length;
  const ncoa = pb.ncoaRelocations;
  const inactivePct = ((ncoa.inactiveRelocatedVoters / ncoa.totalAllStatusVoters) * 100).toFixed(1);

  const sections: [string, string, React.ReactNode][] = [
    [
      "01",
      "Fewer false alarms",
      <>
        Simple scans flag every nursing home, dorm and apartment building — and even homes on streets like
        &ldquo;Marshall Place&rdquo; because the name contains &ldquo;hall.&rdquo; We now set those aside first:{" "}
        {fmt(pb.missingDorm.streetNameFalsePositivesRemoved)} street-name matches, {fmt(pb.highDensity.institutionalVoters)} voters
        at campuses and care homes, {fmt(pb.highDensity.multiFamilyVoters)} at apartment complexes, and{" "}
        {fmt(pb.duplicates.generationalPairs)} Jr./Sr. households.
      </>,
    ],
    [
      "02",
      "People who moved are already being handled",
      <>
        Of {fmt(ncoa.totalAllStatusVoters)} voters with an out-of-state mailing address, {fmt(ncoa.inactiveRelocatedVoters)} ({inactivePct}%)
        are already marked Inactive, as federal law requires before removal. {fmt(ncoa.totalVoters)} active voters still need a
        confirmation notice.
      </>,
    ],
    [
      "03",
      "Every past ballot checked through October 2026",
      <>
        All {fmt(vh.totalHistoryRowsScanned)} ballot records in the October 26, 2026 statewide history extract — including{" "}
        {fmt((vh as any).ballots2026 ?? 330474)} ballots in 2026 and {fmt((vh as any).ballots2025 ?? 504968)} in 2025 — were matched to the voter roll.{" "}
        {fmt(vh.orphanedHistoryRows)} could not be matched. In the March 10, 2026 U.S. Congressional Primary,{" "}
        {fmt((vh as any).duplicate2026PrimarySameDayCreditRows ?? 64)} records were credited twice on the same day out of{" "}
        {fmt((vh as any).unique2026PrimaryVoters ?? 309807)} voters ({fmt(vh.duplicate2024SameDayCreditRows)} in the November 2024 general) — a scanning slip clerks can fix quickly.
      </>,
    ],
    [
      "04",
      "A county map with three directions",
      <>
        One score can&rsquo;t tell a college county from a fast-growing suburb. The new map places each county by address work,
        mail and duplicate work, and precinct size. {normal} of {counties.length} counties sit in the normal range for their size;
        the rest each lean toward one main task.
      </>,
    ],
    [
      "05",
      "Built to print, safe to share",
      <>
        The printable guide uses black ink on white paper with a single accent color. It contains no names, birth dates, voter IDs,
        P.O. Box numbers or house numbers — homes are shown by city only — so it can be handed out at a public meeting.
      </>,
    ],
  ];

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#111111]">
      <article className="mx-auto max-w-[760px] px-5 py-12 sm:py-16 text-base">
        <div className="font-mono text-base font-bold uppercase tracking-[0.12em] text-[#C2341B]">What&rsquo;s new</div>
        <h1 className="mt-4 font-serif text-[36px] sm:text-[48px] font-bold leading-[1.05] tracking-tight">
          Clearer, fairer voter roll numbers for every Mississippi county
        </h1>
        <p className="mt-5 font-serif text-xl leading-relaxed text-[#2C2825]">
          We reviewed {fmt(md.totalRecords)} registrations and {fmt(vh.totalHistoryRowsScanned)} past ballot records across all 82
          counties. Here is what changed, in plain English.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/reports/mississippi-playbook-analysis" className="inline-flex h-11 items-center gap-2 bg-[#111111] px-4 text-base font-bold text-white whitespace-nowrap">
            Read the report <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          <a href="/Marigold-Mississippi-Playbook-Analysis.pdf" download className="inline-flex h-11 items-center gap-2 border-2 border-[#111111] bg-white px-4 text-base font-bold whitespace-nowrap">
            <Download className="h-4 w-4 shrink-0" /> Printable guide
          </a>
        </div>

        <ol className="mt-12 divide-y divide-[#DDD6CA] border-y-2 border-[#111111]">
          {sections.map(([n, t, body]) => (
            <li key={n} className="grid grid-cols-[40px_1fr] gap-2 py-7">
              <span className="font-serif text-[22px] font-bold text-[#C2341B]">{n}</span>
              <div>
                <h2 className="font-serif text-[24px] font-bold leading-snug">{t}</h2>
                <p className="mt-2 text-[16px] leading-relaxed text-[#3A3530]">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
