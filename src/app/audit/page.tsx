"use client";
import React from "react";
import { ChevronRight, Layers, Compass, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import msAudit from "@/data/mississippi_audit_results.json";

export default function AuditPage() {
  const pb = msAudit.playbooks;
  const vh = msAudit.votingHistoryAudit;
  const yb = pb.clericalTypos.yearBreakdown as Record<string, number>;
  const poBoxOnly = pb.commercialPOBox.categoryBreakdown.find((c) => c.category.includes("P.O. Box"))?.count ?? 379;
  const pmbOnly = pb.commercialPOBox.categoryBreakdown.find((c) => c.category.includes("PMB"))?.count ?? 1;

  const playbooks = [
    {
      id: "density",
      label: "PB-01: High-Density Occupancy",
      icon: "⚡",
      metric: `${pb.highDensity.totalAddresses.toLocaleString()} Parcels (${pb.highDensity.activeOnlyAddresses.toLocaleString()} Active)`,
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: `Identifies addresses with 8+ registered voters while separating ${pb.highDensity.institutionalClusters} nursing homes/universities and ${pb.highDensity.multiFamilyClusters} apartment complexes from ${pb.highDensity.singleFamilyAnomalies.toLocaleString()} single-family homes.`,
    },
    {
      id: "missing-dorm",
      label: "PB-02: Missing Dorm / Unit #",
      icon: "🏢",
      metric: `${pb.missingDorm.totalVoters.toLocaleString()} Verified (${pb.missingDorm.activeVoters.toLocaleString()} Active)`,
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: `Uses whole-word regex matching to flag communal buildings missing room/apt numbers—eliminating ${pb.missingDorm.streetNameFalsePositivesRemoved.toLocaleString()} false alarms on streets like Marshall Pl and Halls Ferry Rd.`,
    },
    {
      id: "po-box",
      label: "PB-04: P.O. Box in Residence Field",
      icon: "📬",
      metric: `${pb.commercialPOBox.totalVoters.toLocaleString()} Voters (${pb.commercialPOBox.activeVoters.toLocaleString()} Active)`,
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: `Flags ${poBoxOnly.toLocaleString()} P.O. Boxes and ${pmbOnly.toLocaleString()} Private Mail Box typed into the physical residential line instead of the mailing address field.`,
    },
    {
      id: "out-of-state-mailing",
      label: "PB-03: Out-of-State Mail Drift",
      icon: "✈️",
      metric: `${pb.ncoaRelocations.totalVoters.toLocaleString()} Active (${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} Inactive)`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: "Isolates Active voters receiving mail out-of-state from the 82.1% already moved to Inactive status awaiting their 2-cycle NVRA removal period.",
    },
    {
      id: "typo-names",
      label: "PB-05: Clerical & 1801/0001 Dates",
      icon: "⌨️",
      metric: `${pb.clericalTypos.totalAnomalies.toLocaleString()} Legacy Artifacts`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: `Identifies legacy paper-to-digital SEMS placeholders (${(yb["1801"] ?? 1271).toLocaleString()} Year 1801, ${(yb["0001"] ?? 206).toLocaleString()} Year 0001, ${(yb["DATAMIGRATION_ADDR"] ?? 113).toLocaleString()} DATAMIGRATION street strings, and ${(yb["TRUNCATED_INITIAL_NAME"] ?? 3804).toLocaleString()} 1-letter name initials).`,
    },
    {
      id: "duplicates",
      label: "PB-06: Suffix-Protected Duplicates",
      icon: "👯",
      metric: `${pb.duplicates.activeActiveDuplicates.toLocaleString()} Active Intra-ZIP (${pb.duplicates.generationalPairs.toLocaleString()} Jr/Sr Safe)`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: `Protects ${pb.duplicates.generationalPairs.toLocaleString()} Jr./Sr./III father-son family pairs while isolating ${pb.duplicates.activeActiveDuplicates.toLocaleString()} Active–Active intra-ZIP duplicate clusters and ${pb.duplicates.activeInactiveMoveTrails.toLocaleString()} Active–Inactive move trails.`,
    },
    {
      id: "spikes",
      label: "PB-07: Statutory Cutoff Surges",
      icon: "📈",
      metric: `${pb.registrationSpikes.peakDates[0].count.toLocaleString()} Peak (${pb.registrationSpikes.peakDates[0].date})`,
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Maps single-day registration spikes against Mississippi's 30-day mail-in cutoff prior to Presidential General Elections.",
    },
    {
      id: "phantom-precincts",
      label: "PB-08: Mega-Precinct Capacity",
      icon: "🏛️",
      metric: `${pb.precinctCapacity.overCapacityCount} Precincts > 3,000 Voters`,
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: `Flags ${pb.precinctCapacity.overCapacityCount} polling places exceeding the 3,000-voter EAC benchmark (${pb.precinctCapacity.severelyOverCapacityCount} exceeding 5,000 voters) and ${pb.precinctCapacity.blankPrecinctCount} records with blank precinct codes.`,
    },
    {
      id: "benfords-law",
      label: "PB-09: First-Digit Benford Test",
      icon: "📊",
      metric: `Roll χ² = ${pb.benfordsLaw.chiSquare} (PASS)`,
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: `Demonstrates why total registration passes Benford's Law cleanly (χ² = ${pb.benfordsLaw.chiSquare} < 15.51) while 2024 turnout (χ² = ${pb.benfordsLaw.turnout2024.chiSquare}) reflects 1,500–3,000 precinct sizing.`,
    },
    {
      id: "voting-history",
      label: "PB-10: 25.91M Voting History Join",
      icon: "🗳️",
      metric: `100% Match • ${vh.duplicate2026PrimarySameDayCreditRows ?? 64} 2026 Dup Credits`,
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: `Joins all ${(vh.totalVerifiedBallotCredits ?? vh.totalHistoryRowsScanned).toLocaleString()} historical ballots against the 2.11M Voter Roll with zero orphaned rows and isolates duplicate same-day primary scan lines.`,
    },
    {
      id: "missing-districts",
      label: "PB-11: District Completeness (SUP/SUPR)",
      icon: "🗺️",
      metric: `7 Active Missing (24,013 Panola Resolved)`,
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Coalesces County Supervisor District across SUPR and Panola County's SUP column (eliminating 24,013 false alarms) and isolates the 7 active voters statewide missing a Supervisor/EC district, 2 missing State House, and 1 missing State Senate.",
    },
    {
      id: "split-precincts",
      label: "PB-12: Split-Ballot Legislative Precincts",
      icon: "🧭",
      metric: `356 Split Legislative Precincts`,
      phase: "Axis Z: Polling Place Capacity & 25.91M Ballot Velocity",
      desc: "Identifies 356 polling places that span multiple Congressional (3), State Senate (96), or State House (308) districts so County Election Commissioners and poll workers can verify 911 GIS street-range ballot styles.",
    },
    {
      id: "nvra-reconciliation",
      label: "PB-13: NVRA Status & Ballot Activity Sync",
      icon: "⚖️",
      metric: `36,071 Recent-Vote Inactive • 196,957 Dormant`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: "Non-partisan dual check: (1) Voter Protection — flags 36,071 voters marked Inactive despite casting a 2024–2026 ballot; (2) List Maintenance — flags 196,957 Active voters registered <= 2018 with no vote recorded since before 2018.",
    },
    {
      id: "unparsed-addresses",
      label: "PB-14: Unparsed 911 GIS House Numbers",
      icon: "🏠",
      metric: `1,011 Active Voters (1,900 Total)`,
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: "Isolates 1,011 active registrations containing rural highway or descriptive text in RESIDENTIAL_ADDRESS but a blank structured HOUSE_NUM field needed for E-911 GIS parcel verification.",
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
        subtitle="Explore all 14 non-partisan playbooks pre-loaded with the Mississippi 82-County Benchmark (2,112,460 Voter Roll rows + 25,911,769 Voting History rows through October 26, 2026). Every playbook is explained in plain English with zero personal data exposed."
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
