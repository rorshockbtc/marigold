"use client";
import React from "react";
import { ChevronRight, Layers, Compass, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function AuditPage() {
  const playbooks = [
    {
      id: "density",
      label: "PB-01: High-Density Occupancy",
      icon: "⚡",
      metric: "1,598 Parcels (1,070 Active)",
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: "Identifies addresses with 8+ registered voters while separating 56 nursing homes/universities and 103 apartment complexes from 1,439 single-family homes.",
    },
    {
      id: "missing-dorm",
      label: "PB-02: Missing Dorm / Unit #",
      icon: "🏢",
      metric: "682 Verified (502 Active)",
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: "Uses whole-word regex matching to flag communal buildings missing room/apt numbers—eliminating 4,346 false alarms on streets like Marshall Pl and Halls Ferry Rd.",
    },
    {
      id: "po-box",
      label: "PB-04: P.O. Box in Residence Field",
      icon: "📬",
      metric: "339 Voters (186 Active)",
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: "Flags 337 P.O. Boxes and 2 Private Mail Boxes typed into the physical residential line instead of the mailing address field.",
    },
    {
      id: "out-of-state-mailing",
      label: "PB-03: Out-of-State Mail Drift",
      icon: "✈️",
      metric: "2,444 Active (11,178 Inactive)",
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: "Isolates Active voters receiving mail out-of-state from the 82.1% already moved to Inactive status awaiting their 2-cycle NVRA removal period.",
    },
    {
      id: "typo-names",
      label: "PB-05: Clerical & 1801/0001 Dates",
      icon: "⌨️",
      metric: "5,607 Legacy Artifacts",
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: "Identifies legacy paper-to-digital SEMS placeholders (1,271 Year 1801, 206 Year 0001, 113 DATAMIGRATION street strings, and 3,804 1-letter name initials).",
    },
    {
      id: "duplicates",
      label: "PB-06: Suffix-Protected Duplicates",
      icon: "👯",
      metric: "818 Active Intra-ZIP (4,404 Jr/Sr Safe)",
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: "Protects 4,404 Jr./Sr./III father-son family pairs while isolating 818 Active–Active intra-ZIP duplicate clusters and 185 Active–Inactive move trails.",
    },
    {
      id: "spikes",
      label: "PB-07: Statutory Cutoff Surges",
      icon: "📈",
      metric: "13,731 Peak (10/05/2020)",
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Maps single-day registration spikes against Mississippi's 30-day mail-in cutoff prior to Presidential General Elections.",
    },
    {
      id: "phantom-precincts",
      label: "PB-08: Mega-Precinct Capacity",
      icon: "🏛️",
      metric: "123 Precincts > 3,000 Voters",
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Flags 123 polling places exceeding the 3,000-voter EAC benchmark (27 exceeding 5,000 voters) and 11 records with blank precinct codes.",
    },
    {
      id: "benfords-law",
      label: "PB-09: First-Digit Benford Test",
      icon: "📊",
      metric: "Roll χ² = 6.94 (PASS)",
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Demonstrates why total registration passes Benford's Law cleanly (χ² = 6.94 < 15.51) while 2024 turnout (χ² = 71.15) reflects 1,500–3,000 precinct sizing.",
    },
    {
      id: "voting-history",
      label: "PB-10: 25.91M Voting History Join",
      icon: "🗳️",
      metric: "100% Match • 88 Dup Credits",
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Joins all 25,911,640 historical ballots against the 2.11M Voter Roll with zero orphaned rows and isolates 88 same-day duplicate 2024 credit entries.",
    },
  ];

  const renderPhase = (phaseName: string) => {
    const phasePlaybooks = playbooks.filter((p) => p.phase === phaseName);
    return (
      <div key={phaseName} className="mb-12">
        <h2 className="text-lg font-serif text-text-header mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          {phaseName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phasePlaybooks.map((pb) => (
            <Link
              key={pb.id}
              href={`/audit/${pb.id}`}
              className="bg-white border border-border-soft hover:border-primary p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {pb.icon}
                  </div>
                  <h3 className="font-bold text-text-header text-sm">{pb.label}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                  {pb.metric}
                </span>
              </div>
              <p className="text-xs text-text-body mb-4 flex-1 leading-relaxed">{pb.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-soft">
                <span className="text-xs font-bold text-primary group-hover:underline">
                  Read Plain-English Guide &amp; Run
                </span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        title="Guided Election Commissioner Playbooks (Zero-PII)"
        subtitle="Explore all 10 deterministic playbooks pre-loaded with the Mississippi 82-County Benchmark (2,112,460 Voter Roll rows + 25,911,640 Voting History rows). Every playbook is explained in plain English with zero personal data exposed."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/manifold"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-700 text-white px-3.5 py-2 rounded-xl"
            >
              <Compass className="w-3.5 h-3.5" />
              3D Threat Manifold
            </Link>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-3.5 py-2 rounded-xl"
            >
              <FileText className="w-3.5 h-3.5" />
              Full Mississippi Report
            </Link>
          </div>
        }
      />

      <div className="pb-12">
        {renderPhase("Axis X: Physical Domicile & Multi-Unit Verification")}
        {renderPhase("Axis Y: Identity, Suffix & Relocation Hygiene")}
        {renderPhase("Axis Z: Polling Place Capacity & 25.91M Ballot Velocity")}
      </div>
    </div>
  );
}
