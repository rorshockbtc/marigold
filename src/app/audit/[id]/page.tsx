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

const PLAYBOOK_DETAILS: Record<string, any> = {
  density: {
    title: "PB-01: High-Density Residential Occupancy (≥8 Voters)",
    icon: "⚡",
    subtitle:
      "Mississippi Benchmark: 1,598 normalized addresses (1,070 Active-only; 56 Institutional hubs & 103 Apartment complexes separated from 1,439 Single-Family houses).",
    story:
      "When someone sees '15 voters registered at one address,' it usually is not 15 people living in a house today. Either it is a nursing home, college dormitory, or apartment complex, OR it is a single-family rental house where three different families lived over the past 12 years and never cancelled their old registration when they moved. Separating Active from Inactive voters and filtering out nursing homes and dorms first lets Election Commissioners focus strictly on true single-family backlogs.",
    steps: [
      "Normalizes street strings (collapsing extra spaces like '1400 J  R LYNCH ST' at Jackson State University).",
      "Separates 56 Institutional/University hubs (6,788 voters) and 103 Multi-Family apartment complexes (2,555 voters).",
      "Isolates 1,439 Single-Family residential parcels (100-block masked for Zero-PII privacy) for routine NVRA confirmation cards.",
    ],
    technical:
      "Deterministic whitespace normalization + facility taxonomy classification + Active/Inactive status stratification across 2,112,460 records.",
  },
  "missing-dorm": {
    title: "PB-02: Missing Dormitory & Multi-Unit Designators",
    icon: "🏢",
    subtitle:
      "Mississippi Benchmark: 682 verified campus/multi-unit records (502 Active) after removing 4,346 street-name false positives.",
    story:
      "Older computer scripts searched for the letters 'HALL' or 'UNIVERSITY' anywhere in an address—which accidentally flagged thousands of regular family houses on streets named 'Marshall Place', 'Halls Ferry Road', 'Halle Cove', and 'University Avenue'. We fixed that with whole-word matching so only genuine campus dorms and multi-unit buildings missing a room or apartment number are highlighted.",
    steps: [
      "Applies whole-word regular expression boundaries: \\b(HALL|DORM|DORMITORY|CAMPUS|UNIVERSITY|COLLEGE|APARTMENT|APTS|TOWERS)\\b.",
      "Excludes residential thoroughfares (e.g., Marshall Pl, Halls Ferry Rd, University Ave, College Hill Rd) unless a multi-unit building keyword is present.",
      "Isolates 682 verified dormitory and student apartment registrations (led by USM, MGCCC, MUW, MVSU, and MSU).",
    ],
    technical:
      "Whole-word regex boundary evaluation + municipal vs. street-suffix disambiguation across all 82 counties.",
  },
  "out-of-state-mailing": {
    title: "PB-03: NCOA Interstate Out-of-State Mail Drift",
    icon: "✈️",
    subtitle:
      "Mississippi Benchmark: 2,444 Active voters with out-of-state mailing addresses (11,178 already marked Inactive on the federal NVRA clock).",
    story:
      "When a voter moves to Tennessee, Texas, or Alabama and files a forwarding address, federal law (the National Voter Registration Act) does not allow a county to delete them the next morning. Instead, the county marks them 'Inactive' and waits two federal general election cycles. In Mississippi, 82.1% of all out-of-state mail records (11,178 of 13,622) are ALREADY marked Inactive—leaving only 2,444 Active records that need a confirmation postcard.",
    steps: [
      "Scans all 2,112,460 records for mailing states outside Mississippi (led by TN, TX, AL, LA, FL, and GA).",
      "Separates the 11,178 Inactive records already undergoing statutory NVRA waiting periods.",
      "Produces the exact list of 2,444 Active out-of-state mail records for Circuit Clerk review.",
    ],
    technical:
      "Cross-checks mail_state != 'MS' stratified by status == 'Active' vs. 'Inactive' (Pearson correlation r = +0.674 with intra-ZIP duplicate clusters).",
  },
  "po-box": {
    title: "PB-04: P.O. Box & PMB in Physical Residence Line",
    icon: "📬",
    subtitle:
      "Mississippi Benchmark: 380 records statewide (212 Active, 168 Inactive; 379 P.O. Boxes and 1 Private Mail Box).",
    story:
      "You cannot live inside a post office box. Mississippi law requires a physical residential address so the county knows which precinct ballot to give you, while your P.O. Box belongs in the Mailing Address column. Only 339 voters statewide have a P.O. Box accidentally typed into their physical residence line—an easy clerical fix for County Election Commissioners.",
    steps: [
      "Scans the physical residential address column for P.O. Box, PMB, and commercial mail hub strings.",
      "Separates Active (186) from Inactive (153) records and assigns Zero-PII audit tokens (MS-POB-01 through MS-POB-15).",
      "Provides a clean county-by-county list so clerks can move the P.O. Box to the mailing field and record the 911 physical address.",
    ],
    technical:
      "Deterministic pattern scan on standardized residence_address_1 for PO BOX / P.O. BOX / PMB / UPS STORE tokens.",
  },
  "typo-names": {
    title: "PB-05: Clerical Typos & Pre-1900 Migration Dates",
    icon: "⌨️",
    subtitle:
      "Mississippi Benchmark: 5,607 legacy database artifacts (3,804 1-letter names, 1,271 Year 1801, 206 Year 0001, 113 DATAMIGRATION street strings).",
    story:
      "No voter in Mississippi was registered in the year 1801 or 0001. When counties converted old paper registration ledgers into the statewide computer system in the early 2000s, records with missing or faded registration dates were given placeholder dates like '01/01/1801', and 113 records in Warren and Simpson Counties were given the street address 'DATAMIGRATION'.",
    steps: [
      "Flags registration dates prior to 1900 (1,271 in 1801; 206 in 0001; 7 in 1800) and future typos.",
      "Isolates 3,804 records where a voter's first or last name was entered as a single letter initial.",
      "Highlights 113 records containing the literal word 'DATAMIGRATION' in the street address column.",
    ],
    technical:
      "Date-range validation + string length inspection + legacy migration token detection.",
  },
  duplicates: {
    title: "PB-06: Generational Suffix Protection & Duplicate Audit",
    icon: "👯",
    subtitle:
      "Mississippi Benchmark: 4,404 Jr./Sr. pairs protected • 818 Active–Active intra-ZIP clusters • 185 Active–Inactive move trails.",
    story:
      "In thousands of Mississippi households, a father (Sr.) and son (Jr.) live at the same address or in the same town. Basic scripts flag them as duplicate voters! Our playbook protects all 4,404 generational family pairs first, and then separates intra-ZIP duplicates into Active–Active (818 clusters where a voter moved across town and registered twice) and Active–Inactive move trails (185 clusters where the old address is already Inactive).",
    steps: [
      "Normalizes generational suffixes (JR, SR, II, III, IV) and protects 4,404 multi-generational family households.",
      "Identifies 1,026 intra-ZIP clusters where the exact same First, Middle, Last, and Suffix appear at different addresses.",
      "Separates 818 Active–Active clusters from 185 Active–Inactive relocation trails and 19,122 statewide cross-county matches.",
    ],
    technical:
      "Exact First+Middle+Last+Suffix+ZIP linkage with Active/Inactive status matrix decomposition.",
  },
  spikes: {
    title: "PB-07: Statutory Registration Velocity Spikes",
    icon: "📈",
    subtitle:
      "Mississippi Benchmark: Peak single-day batches on 10/05/2020 (13,731), 10/03/2008 (11,240), and 10/07/2024 (7,867).",
    story:
      "Mississippi requires citizens to register at least 30 days before an election. Every four years, right on that October deadline before a Presidential Election, County Circuit Clerks enter thousands of mail-in applications on the same day. Mapping those dates proves that single-day registration surges are normal statutory deadline batches—not mysterious intrusions.",
    steps: [
      "Aggregates all 2,112,460 voter registrations by exact registration date.",
      "Overlays Mississippi's 30-day statutory cutoff calendar for the 2008, 2012, 2016, 2020, and 2024 Presidential cycles.",
      "Confirms that all top peak dates align with statutory registration deadlines or legacy county batch imports.",
    ],
    technical:
      "Time-series aggregation on registration_date matched against MS Code § 23-15-37 cutoff dates.",
  },
  "phantom-precincts": {
    title: "PB-08: Mega-Precinct Capacity & Assignment Audit",
    icon: "🏛️",
    subtitle:
      "Mississippi Benchmark: 1,742 precincts • 123 exceed 3,000 voters • 27 exceed 5,000 voters • 11 blank precinct codes.",
    story:
      "When a fast-growing suburb in DeSoto, Madison, Rankin, or Harrison County builds new neighborhoods without splitting its local polling place, a single precinct can balloon to 6,000 or 9,000 voters—creating long Election Day lines and pollbook bottlenecks. This playbook gives County Election Commissioners the exact list of 123 overloaded precincts so they can plan precinct splits with their Board of Supervisors.",
    steps: [
      "Counts total and Active registered voters across all 1,742 Mississippi precincts.",
      "Flags 123 precincts exceeding the 3,000-voter benchmark and 27 mega-precincts exceeding 5,000 voters.",
      "Identifies 11 voter records with a blank precinct code so clerks can assign them via 911 GIS boundaries.",
    ],
    technical:
      "Precinct-level roll aggregation joined with 2024 General Election turnout counts.",
  },
  "benfords-law": {
    title: "PB-09: Newcomb-Benford First-Digit Distribution",
    icon: "📊",
    subtitle:
      "Mississippi Benchmark: Total Roll χ² = 9.16 (PASS < 15.51) • 2024 Turnout χ² = 30.5 (Statutory Precinct Sizing Effect).",
    story:
      "Benford's Law tests whether the first digits of numbers (1 through 9) follow a natural logarithmic curve. Importantly, Benford's Law only works when numbers span several orders of magnitude (from 10 to 9,000). Mississippi's total precinct registration spans four orders of magnitude and passes with flying colors (χ² = 9.16). Meanwhile, 2024 Election Day turnout clusters around 200 to 499 voters per precinct (digits 2, 3, and 4) simply because counties design precincts to hold roughly 1,500 voters!",
    steps: [
      "Extracts leading digits (1–9) across all 1,742 precincts for both Total Registration and 2024 General Turnout.",
      "Computes Pearson's Chi-Square goodness-of-fit against log10(1 + 1/d).",
      "Explains why total registration passes (χ² = 9.16) while bounded turnout reflects statutory precinct sizing.",
    ],
    technical:
      "Logarithmic first-digit distribution test (df = 8, α = 0.05 critical value = 15.51).",
  },
  "voting-history": {
    title: "PB-10: 25.91 Million Voting History Referential Audit",
    icon: "🗳️",
    subtitle:
      "Mississippi Benchmark: 25,911,640 ballots joined • 100.00% Roll Match (0 Orphans) • 1,213,364 2024 General Voters • 88 Same-Day Duplicate Credit Rows.",
    story:
      "We cross-checked every single ballot in Mississippi's 25.91-million-row Voting History file against the 2.11-million-row Master Voter Roll. Every single ballot matched a valid registered Voter ID—meaning there are zero 'phantom' or orphaned ballots in the file. Out of 1,213,364 citizens who voted in the November 2024 General Election, 87 Voter IDs (88 extra rows) had their vote credit scanned twice on the same day, which clerks can easily deduplicate.",
    steps: [
      "Streams all 25,911,640 rows of the statewide Voting History CSV and joins each row by Voter ID against the Master Voter Roll.",
      "Verifies 100.00% referential integrity (25,911,640 matched, 0 orphaned ballots).",
      "Isolates 88 duplicate same-day 2024 General Election credit rows and 424,177 registered voters with zero ballot history.",
    ],
    technical:
      "Full hash-indexed relational join across 28,024,100 combined voter and ballot history rows.",
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
