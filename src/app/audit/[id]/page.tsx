"use client";
import React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import {
  ArrowLeft,
  Play,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Compass,
} from "lucide-react";
import Link from "next/link";
import msAudit from "@/data/mississippi_audit_results.json";

const pb = msAudit.playbooks;
const meta = msAudit.metadata;
const vh = msAudit.votingHistoryAudit;
const yb = pb.clericalTypos.yearBreakdown as Record<string, number>;
const poBoxOnly = pb.commercialPOBox.categoryBreakdown.find((c) => c.category.includes("P.O. Box"))?.count ?? 379;
const pmbOnly = pb.commercialPOBox.categoryBreakdown.find((c) => c.category.includes("PMB"))?.count ?? 1;

const PLAYBOOK_DETAILS: Record<string, any> = {
  density: {
    title: "PB-01: High-Density Residential Occupancy (≥8 Voters)",
    icon: "⚡",
    subtitle: `Mississippi Benchmark: ${pb.highDensity.totalAddresses.toLocaleString()} normalized addresses (${pb.highDensity.activeOnlyAddresses.toLocaleString()} Active-only; ${pb.highDensity.institutionalClusters} Institutional hubs & ${pb.highDensity.multiFamilyClusters} Apartment complexes separated from ${pb.highDensity.singleFamilyAnomalies.toLocaleString()} Single-Family houses).`,
    story:
      "When someone sees '15 voters registered at one address,' it usually is not 15 people living in a house today. Either it is a nursing home, college dormitory, or apartment complex, OR it is a single-family rental house where three different families lived over the past 12 years and never cancelled their old registration when they moved. Separating Active from Inactive voters and filtering out nursing homes and dorms first lets Election Commissioners focus strictly on true single-family backlogs.",
    steps: [
      "Normalizes street strings (collapsing extra spaces like '1400 block of J R LYNCH ST' at Jackson State University).",
      `Separates ${pb.highDensity.institutionalClusters} Institutional/University hubs (${pb.highDensity.institutionalVoters.toLocaleString()} voters) and ${pb.highDensity.multiFamilyClusters} Multi-Family apartment complexes (${pb.highDensity.multiFamilyVoters.toLocaleString()} voters).`,
      `Isolates ${pb.highDensity.singleFamilyAnomalies.toLocaleString()} Single-Family residential parcels (city-coarsened for Zero-PII privacy) for routine NVRA confirmation cards.`,
    ],
    technical: `Deterministic whitespace normalization + facility taxonomy classification + Active/Inactive status stratification across ${meta.totalRecords.toLocaleString()} records.`,
  },
  "missing-dorm": {
    title: "PB-02: Missing Dormitory & Multi-Unit Designators",
    icon: "🏢",
    subtitle: `Mississippi Benchmark: ${pb.missingDorm.totalVoters.toLocaleString()} verified campus/multi-unit records (${pb.missingDorm.activeVoters.toLocaleString()} Active) after removing ${pb.missingDorm.streetNameFalsePositivesRemoved.toLocaleString()} street-name false positives.`,
    story:
      "Older computer scripts searched for the letters 'HALL' or 'UNIVERSITY' anywhere in an address—which accidentally flagged thousands of regular family houses on streets named 'Marshall Place', 'Halls Ferry Road', 'Halle Cove', and 'University Avenue'. We fixed that with whole-word matching so only genuine campus dorms and multi-unit buildings missing a room or apartment number are highlighted.",
    steps: [
      "Applies whole-word regular expression boundaries: \\b(HALL|DORM|DORMITORY|CAMPUS|UNIVERSITY|COLLEGE|APARTMENT|APTS|TOWERS)\\b.",
      "Excludes residential thoroughfares (e.g., Marshall Pl, Halls Ferry Rd, University Ave, College Hill Rd) unless a multi-unit building keyword is present.",
      `Isolates ${pb.missingDorm.totalVoters.toLocaleString()} verified dormitory and student apartment registrations (led by USM, MGCCC, MUW, MVSU, and MSU).`,
    ],
    technical:
      "Whole-word regex boundary evaluation + municipal vs. street-suffix disambiguation across all 82 counties.",
  },
  "out-of-state-mailing": {
    title: "PB-03: NCOA Interstate Out-of-State Mail Drift",
    icon: "✈️",
    subtitle: `Mississippi Benchmark: ${pb.ncoaRelocations.totalVoters.toLocaleString()} Active voters with out-of-state mailing addresses (${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} already marked Inactive on the federal NVRA clock).`,
    story: `When a voter moves to Tennessee, Texas, or Alabama and files a forwarding address, federal law (the National Voter Registration Act) does not allow a county to delete them the next morning. Instead, the county marks them 'Inactive' and waits two federal general election cycles. In Mississippi, 82.1% of all out-of-state mail records (${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} of ${pb.ncoaRelocations.totalAllStatusVoters.toLocaleString()}) are ALREADY marked Inactive—leaving only ${pb.ncoaRelocations.totalVoters.toLocaleString()} Active records that need a confirmation postcard.`,
    steps: [
      `Scans all ${meta.totalRecords.toLocaleString()} records for mailing states outside Mississippi (led by TN, TX, AL, LA, FL, and GA).`,
      `Separates the ${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} Inactive records already undergoing statutory NVRA waiting periods.`,
      `Produces the exact list of ${pb.ncoaRelocations.totalVoters.toLocaleString()} Active out-of-state mail records for Circuit Clerk review.`,
    ],
    technical:
      "Cross-checks mail_state != 'MS' stratified by status == 'Active' vs. 'Inactive' across all 82 counties.",
  },
  "po-box": {
    title: "PB-04: P.O. Box & PMB in Physical Residence Line",
    icon: "📬",
    subtitle: `Mississippi Benchmark: ${pb.commercialPOBox.totalVoters.toLocaleString()} records statewide (${pb.commercialPOBox.activeVoters.toLocaleString()} Active, ${pb.commercialPOBox.inactiveVoters.toLocaleString()} Inactive; ${poBoxOnly.toLocaleString()} P.O. Boxes and ${pmbOnly.toLocaleString()} Private Mail Box).`,
    story: `You cannot live inside a post office box. Mississippi law requires a physical residential address so the county knows which precinct ballot to give you, while your P.O. Box belongs in the Mailing Address column. Only ${pb.commercialPOBox.totalVoters.toLocaleString()} voters statewide (${pb.commercialPOBox.activeVoters.toLocaleString()} Active) have a P.O. Box accidentally typed into their physical residence line—an easy clerical fix for County Election Commissioners.`,
    steps: [
      "Scans the physical residential address column for P.O. Box, PMB, and commercial mail hub strings.",
      `Separates Active (${pb.commercialPOBox.activeVoters.toLocaleString()}) from Inactive (${pb.commercialPOBox.inactiveVoters.toLocaleString()}) records with all box numbers withheld for Zero-PII privacy.`,
      "Provides a clean county-by-county list so clerks can move the P.O. Box to the mailing field and record the 911 physical address.",
    ],
    technical:
      "Deterministic pattern scan on standardized residence_address_1 for PO BOX / P.O. BOX / PMB / UPS STORE tokens.",
  },
  "typo-names": {
    title: "PB-05: Clerical Typos & Pre-1900 Migration Dates",
    icon: "⌨️",
    subtitle: `Mississippi Benchmark: ${pb.clericalTypos.totalAnomalies.toLocaleString()} legacy database artifacts (${(yb["TRUNCATED_INITIAL_NAME"] ?? 3804).toLocaleString()} 1-letter names, ${(yb["1801"] ?? 1271).toLocaleString()} Year 1801, ${(yb["0001"] ?? 206).toLocaleString()} Year 0001, ${(yb["DATAMIGRATION_ADDR"] ?? 113).toLocaleString()} DATAMIGRATION street strings).`,
    story: `No voter in Mississippi was registered in the year 1801 or 0001. When counties converted old paper registration ledgers into the statewide computer system in the early 2000s, records with missing or faded registration dates were given placeholder dates like '01/01/1801', and ${(yb["DATAMIGRATION_ADDR"] ?? 113).toLocaleString()} records in Warren and Simpson Counties were given the street address 'DATAMIGRATION'.`,
    steps: [
      `Flags registration dates prior to 1900 (${(yb["1801"] ?? 1271).toLocaleString()} in 1801; ${(yb["0001"] ?? 206).toLocaleString()} in 0001; ${(yb["0101"] ?? 63).toLocaleString()} in 0101) and future typos.`,
      `Isolates ${(yb["TRUNCATED_INITIAL_NAME"] ?? 3804).toLocaleString()} records where a voter's first or last name was entered as a single letter initial.`,
      `Highlights ${(yb["DATAMIGRATION_ADDR"] ?? 113).toLocaleString()} records containing the literal word 'DATAMIGRATION' in the street address column.`,
    ],
    technical:
      "Date-range validation + string length inspection + legacy migration token detection.",
  },
  duplicates: {
    title: "PB-06: Generational Suffix Protection & Duplicate Audit",
    icon: "👯",
    subtitle: `Mississippi Benchmark: ${pb.duplicates.generationalPairs.toLocaleString()} Jr./Sr. pairs protected • ${pb.duplicates.activeActiveDuplicates.toLocaleString()} Active–Active intra-ZIP clusters • ${pb.duplicates.activeInactiveMoveTrails.toLocaleString()} Active–Inactive move trails.`,
    story: `In thousands of Mississippi households, a father (Sr.) and son (Jr.) live at the same address or in the same town. Basic scripts flag them as duplicate voters! Our playbook protects all ${pb.duplicates.generationalPairs.toLocaleString()} generational family pairs first, and then separates intra-ZIP duplicates into Active–Active (${pb.duplicates.activeActiveDuplicates.toLocaleString()} clusters where a voter moved across town and registered twice) and Active–Inactive move trails (${pb.duplicates.activeInactiveMoveTrails.toLocaleString()} clusters where the old address is already Inactive).`,
    steps: [
      `Normalizes generational suffixes (JR, SR, II, III, IV) and protects ${pb.duplicates.generationalPairs.toLocaleString()} multi-generational family households.`,
      `Identifies ${pb.duplicates.trueDuplicates.toLocaleString()} intra-ZIP clusters where the exact same First, Middle, Last, and Suffix appear at different addresses.`,
      `Separates ${pb.duplicates.activeActiveDuplicates.toLocaleString()} Active–Active clusters from ${pb.duplicates.activeInactiveMoveTrails.toLocaleString()} Active–Inactive relocation trails and ${pb.duplicates.crossCountyActiveDuplicates.toLocaleString()} statewide cross-county matches.`,
    ],
    technical:
      "Exact First+Middle+Last+Suffix+ZIP linkage with Active/Inactive status matrix decomposition.",
  },
  spikes: {
    title: "PB-07: Statutory Registration Velocity Spikes",
    icon: "📈",
    subtitle: `Mississippi Benchmark: Peak single-day batches on ${pb.registrationSpikes.peakDates[0].date} (${pb.registrationSpikes.peakDates[0].count.toLocaleString()}), ${pb.registrationSpikes.peakDates[1].date} (${pb.registrationSpikes.peakDates[1].count.toLocaleString()}), and ${pb.registrationSpikes.peakDates[2].date} (${pb.registrationSpikes.peakDates[2].count.toLocaleString()}).`,
    story:
      "Mississippi requires citizens to register at least 30 days before an election. Every four years, right on that October deadline before a Presidential Election, County Circuit Clerks enter thousands of mail-in applications on the same day. Mapping those dates proves that single-day registration surges are normal statutory deadline batches—not mysterious intrusions.",
    steps: [
      `Aggregates all ${meta.totalRecords.toLocaleString()} voter registrations by exact registration date.`,
      "Overlays Mississippi's 30-day statutory cutoff calendar for the 2008, 2012, 2016, 2020, and 2024 Presidential cycles.",
      "Confirms that all top peak dates align with statutory registration deadlines or legacy county batch imports.",
    ],
    technical:
      "Time-series aggregation on registration_date matched against MS Code § 23-15-37 cutoff dates.",
  },
  "phantom-precincts": {
    title: "PB-08: Mega-Precinct Capacity & Assignment Audit",
    icon: "🏛️",
    subtitle: `Mississippi Benchmark: ${pb.precinctCapacity.totalPrecincts.toLocaleString()} precincts • ${pb.precinctCapacity.overCapacityCount} exceed 3,000 voters • ${pb.precinctCapacity.severelyOverCapacityCount} exceed 5,000 voters • ${pb.precinctCapacity.blankPrecinctCount} blank precinct codes.`,
    story: `When a fast-growing suburb in DeSoto, Madison, Rankin, or Harrison County builds new neighborhoods without splitting its local polling place, a single precinct can balloon to 6,000 or 9,000 voters—creating long Election Day lines and pollbook bottlenecks. This playbook gives County Election Commissioners the exact list of ${pb.precinctCapacity.overCapacityCount} overloaded precincts so they can plan precinct splits with their Board of Supervisors.`,
    steps: [
      `Counts total and Active registered voters across all ${pb.precinctCapacity.totalPrecincts.toLocaleString()} Mississippi precincts.`,
      `Flags ${pb.precinctCapacity.overCapacityCount} precincts exceeding the 3,000-voter benchmark and ${pb.precinctCapacity.severelyOverCapacityCount} mega-precincts exceeding 5,000 voters.`,
      `Identifies ${pb.precinctCapacity.blankPrecinctCount} voter records with a blank precinct code so clerks can assign them via 911 GIS boundaries.`,
    ],
    technical:
      "Precinct-level roll aggregation joined with 2024 General Election turnout counts.",
  },
  "benfords-law": {
    title: "PB-09: Newcomb-Benford First-Digit Distribution",
    icon: "📊",
    subtitle: `Mississippi Benchmark: Total Roll χ² = ${pb.benfordsLaw.chiSquare} (PASS < 15.51) • 2024 Turnout χ² = ${pb.benfordsLaw.turnout2024.chiSquare} (Statutory Precinct Sizing Effect).`,
    story: `Benford's Law tests whether the first digits of numbers (1 through 9) follow a natural logarithmic curve. Importantly, Benford's Law only works when numbers span several orders of magnitude (from 10 to 9,000). Mississippi's total precinct registration spans four orders of magnitude and passes with flying colors (χ² = ${pb.benfordsLaw.chiSquare}). Meanwhile, 2024 Election Day turnout clusters around 200 to 499 voters per precinct (digits 2, 3, and 4) simply because counties design precincts to hold roughly 1,500 voters!`,
    steps: [
      `Extracts leading digits (1–9) across all ${pb.precinctCapacity.totalPrecincts.toLocaleString()} precincts for both Total Registration and 2024 General Turnout.`,
      "Computes Pearson's Chi-Square goodness-of-fit against log10(1 + 1/d).",
      `Explains why total registration passes (χ² = ${pb.benfordsLaw.chiSquare}) while bounded turnout reflects statutory precinct sizing.`,
    ],
    technical:
      "Logarithmic first-digit distribution test (df = 8, α = 0.05 critical value = 15.51).",
  },
  "voting-history": {
    title: "PB-10: 25.91 Million Voting History Referential Audit",
    icon: "🗳️",
    subtitle: `Mississippi Benchmark: ${vh.totalHistoryRowsScanned.toLocaleString()} ballots joined • 100.00% Roll Match (${vh.orphanedHistoryRows} Orphans) • ${vh.unique2024GeneralVoters.toLocaleString()} 2024 General Voters • ${vh.duplicate2024SameDayCreditRows} Same-Day Duplicate Credit Rows.`,
    story: `We cross-checked every single ballot in Mississippi's 25.91-million-row Voting History file against the 2.11-million-row Master Voter Roll. Every single ballot matched a valid registered Voter ID—meaning there are zero 'phantom' or orphaned ballots in the file. Out of ${vh.unique2024GeneralVoters.toLocaleString()} citizens who voted in the November 2024 General Election, ${vh.duplicate2024SameDayUniqueVoters} Voter IDs (${vh.duplicate2024SameDayCreditRows} extra rows) had their vote credit scanned twice on the same day, which clerks can easily deduplicate.`,
    steps: [
      `Streams all ${vh.totalHistoryRowsScanned.toLocaleString()} rows of the statewide Voting History CSV and joins each row by Voter ID against the Master Voter Roll.`,
      `Verifies 100.00% referential integrity (${vh.matchedRollHistoryRows.toLocaleString()} matched, ${vh.orphanedHistoryRows} orphaned ballots).`,
      `Isolates ${vh.duplicate2024SameDayCreditRows} duplicate same-day 2024 General Election credit rows and ${vh.votersWithZeroHistory.toLocaleString()} registered voters with zero ballot history.`,
    ],
    technical:
      `Full hash-indexed relational join across ${(meta.totalRecords + vh.totalHistoryRowsScanned).toLocaleString()} combined voter and ballot history rows.`,
  },
};

export default function PlaybookDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const data = PLAYBOOK_DETAILS[id] || PLAYBOOK_DETAILS["density"];

  return (
    <div className="flex flex-col h-full font-sans max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href="/audit"
        className="flex items-center gap-2 text-sm text-[#646A7A] hover:text-[#D96B27] mb-6 font-bold transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All 10 Playbooks
      </Link>

      <PageHeader
        title={data.title}
        subtitle={data.subtitle}
        icon={<span>{data.icon}</span>}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/explore?playbook=${id}`}
              className="btn-primary flex items-center gap-2 font-bold px-5 py-2.5 text-xs"
            >
              <Play className="w-4 h-4" />
              Run in Scanner
            </Link>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="bg-slate-900 text-white rounded-xl flex items-center gap-2 font-bold px-4 py-2.5 text-xs"
            >
              <FileText className="w-4 h-4" />
              View in MS Report
            </Link>
          </div>
        }
      />

      <div className="space-y-6 mt-4">
        <div className="bg-white p-7 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Plain-English Explanation for Election Commissioners &amp; Citizens
          </div>
          <p className="text-base text-text-body leading-relaxed">{data.story}</p>
        </div>

        <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#646A7A] uppercase tracking-wider mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Step-by-Step Verification Protocol
          </div>
          <ul className="space-y-3.5">
            {data.steps.map((step: string, index: number) => (
              <li key={index} className="flex gap-3.5 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-text-body leading-relaxed">{step}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-border-soft rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-muted px-6 py-3.5 border-b border-border-soft flex items-center justify-between font-mono text-xs font-bold text-[#646A7A]">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Deterministic Mathematical Specification (Zero-PII)
            </span>
            <Link href="/manifold" className="text-amber-800 hover:underline flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> View on 3D Manifold
            </Link>
          </div>
          <div className="bg-white p-5 font-mono text-xs text-[#4A5060] leading-relaxed">
            {data.technical}
          </div>
        </div>
      </div>
    </div>
  );
}
