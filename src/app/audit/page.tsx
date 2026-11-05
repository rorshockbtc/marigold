"use client";
import React from "react";
import { ChevronRight, Layers, Compass, FileText } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { useStateBenchmark, StateSwitcherPill } from "@/lib/data/StateBenchmarkContext";

export default function AuditPage() {
  const { activeState, stateConfig } = useStateBenchmark();
  const auditData = stateConfig.auditData;
  const pb = auditData.playbooks as any;
  const vh = auditData.votingHistoryAudit as any;
  const dist = pb.districtIntegrity || {};
  const nvra = pb.nvraReconciliation || {};
  const addrP = pb.addressParsing || {};
  const totalBallots = Number(vh.totalVerifiedBallotCredits ?? vh.totalHistoryRowsScanned ?? 0);
  const dupPrimary = Number(vh.duplicate2026PrimarySameDayCreditRows ?? 0);
  const axisZPhase = `Axis Z: Polling Place Capacity & ${(totalBallots / 1_000_000).toFixed(2)}M Ballot Velocity`;

  const playbooks = [
    {
      id: "density",
      label: "PB-01: High-Density Occupancy",
      icon: "⚡",
      metric: `${pb.highDensity.totalAddresses.toLocaleString()} Parcels (${pb.highDensity.activeOnlyAddresses.toLocaleString()} Active)`,
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: `Identifies addresses with 8+ registered voters while separating ${pb.highDensity.institutionalClusters.toLocaleString()} nursing homes/universities/military hubs and ${pb.highDensity.multiFamilyClusters.toLocaleString()} apartment complexes from ${pb.highDensity.singleFamilyAnomalies.toLocaleString()} single-family homes.`,
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
      desc: `Flags ${pb.commercialPOBox.totalVoters.toLocaleString()} records where a P.O. Box or Private Mail Box was typed into the physical residential line instead of the mailing address field.`,
    },
    {
      id: "out-of-state-mailing",
      label: "PB-03: Out-of-State Mail Drift",
      icon: "✈️",
      metric: `${pb.ncoaRelocations.totalVoters.toLocaleString()} Active (${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} Inactive)`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: `Isolates ${pb.ncoaRelocations.totalVoters.toLocaleString()} Active voters receiving mail out-of-state from the ${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} already moved to Inactive status awaiting their 2-cycle NVRA removal period.`,
    },
    {
      id: "typo-names",
      label: "PB-05: Clerical & Legacy Migration Dates",
      icon: "⌨️",
      metric: `${pb.clericalTypos.totalAnomalies.toLocaleString()} Legacy Artifacts`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: `Identifies ${pb.clericalTypos.totalAnomalies.toLocaleString()} legacy paper-to-digital database migration placeholders (such as 1900, 1801, 0001, or DATAMIGRATION street strings) and 1-letter truncated name initials.`,
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
      metric: `${pb.registrationSpikes.peakDates[0]?.count.toLocaleString()} Peak (${pb.registrationSpikes.peakDates[0]?.date})`,
      phase: axisZPhase,
      desc: `Maps single-day registration spikes against ${stateConfig.name}'s statutory registration cutoff dates prior to Presidential General Elections.`,
    },
    {
      id: "phantom-precincts",
      label: "PB-08: Mega-Precinct Capacity",
      icon: "🏛️",
      metric: `${pb.precinctCapacity.overCapacityCount.toLocaleString()} Precincts > 3,000 Voters`,
      phase: axisZPhase,
      desc: `Flags ${pb.precinctCapacity.overCapacityCount.toLocaleString()} polling places exceeding the 3,000-voter EAC benchmark (${pb.precinctCapacity.severelyOverCapacityCount.toLocaleString()} exceeding 5,000 voters) and ${pb.precinctCapacity.blankPrecinctCount.toLocaleString()} records with blank precinct codes.`,
    },
    {
      id: "benfords-law",
      label: "PB-09: First-Digit Benford Test",
      icon: "📊",
      metric: `Roll χ² = ${pb.benfordsLaw.chiSquare} • Turnout χ² = ${pb.benfordsLaw.turnout2024.chiSquare}`,
      phase: axisZPhase,
      desc: `Tests precinct registration (χ² = ${pb.benfordsLaw.chiSquare}) and 2024 turnout (χ² = ${pb.benfordsLaw.turnout2024.chiSquare}) against Benford's first-digit distribution across all ${pb.precinctCapacity.totalPrecincts.toLocaleString()} precincts.`,
    },
    {
      id: "voting-history",
      label: `PB-10: ${(totalBallots / 1_000_000).toFixed(2)}M Voting History Join`,
      icon: "🗳️",
      metric: `100% Match • ${dupPrimary.toLocaleString()} 2026 Dup Credits`,
      phase: axisZPhase,
      desc: `Joins all ${totalBallots.toLocaleString()} historical ballots against the ${stateConfig.name} Voter Roll with zero orphaned rows and isolates duplicate same-day primary scan lines.`,
    },
    {
      id: "missing-districts",
      label: activeState === "MS" ? "PB-11: District Completeness (SUP/SUPR)" : "PB-11: District Completeness (At-Large Aware)",
      icon: "🗺️",
      metric: `${(dist.activeMissingAnyDistrict ?? 7).toLocaleString()} Active Missing`,
      phase: axisZPhase,
      desc: activeState === "MS"
        ? "Coalesces County Supervisor District across SUPR and Panola County's SUP column (eliminating 24,013 false alarms) and isolates the 7 active voters statewide missing a Supervisor/EC district."
        : "Recognizes North Carolina's 25 At-Large County Commissioner counties (2,466,631 active voters) and isolates the 388 active voters genuinely missing a Congressional, State Senate, or State House district.",
    },
    {
      id: "split-precincts",
      label: "PB-12: Split-Ballot Legislative Precincts",
      icon: "🧭",
      metric: `${(dist.splitLegislativePrecincts ?? 356).toLocaleString()} Split Legislative Precincts`,
      phase: axisZPhase,
      desc: `Identifies ${(dist.splitLegislativePrecincts ?? 356).toLocaleString()} polling places that span multiple Congressional (${dist.splitCongPrecincts ?? 3}), State Senate (${dist.splitSenPrecincts ?? 96}), or State House (${dist.splitRepPrecincts ?? 308}) districts so ${stateConfig.authorityLabel} can verify 911 GIS street-range ballot styles.`,
    },
    {
      id: "nvra-reconciliation",
      label: "PB-13: NVRA Status & Ballot Activity Sync",
      icon: "⚖️",
      metric: `${(nvra.inactiveWithRecentVote2024_2026 ?? 36071).toLocaleString()} Recent-Vote Inactive`,
      phase: "Axis Y: Identity, Suffix & Relocation Hygiene",
      desc: `Non-partisan dual check: (1) Voter Protection — flags ${(nvra.inactiveWithRecentVote2024_2026 ?? 36071).toLocaleString()} voters marked Inactive despite casting a 2024–2026 ballot; (2) List Maintenance — flags ${(nvra.dormantActivePre2019NoVote ?? 196957).toLocaleString()} Active voters registered <= 2018 with no vote recorded since before 2018.`,
    },
    {
      id: "unparsed-addresses",
      label: "PB-14: Unparsed 911 GIS House Numbers",
      icon: "🏠",
      metric: `${(addrP.unparsedHouseNumActive ?? 1011).toLocaleString()} Active Voters (${(addrP.unparsedHouseNumTotal ?? 1900).toLocaleString()} Total)`,
      phase: "Axis X: Physical Domicile & Multi-Unit Verification",
      desc: `Isolates ${(addrP.unparsedHouseNumActive ?? 1011).toLocaleString()} active registrations containing rural highway or descriptive text in their street address without a structured house number needed for E-911 GIS parcel verification.`,
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
        title={`Guided ${stateConfig.name} Election Playbooks (Zero-PII)`}
        subtitle={`Explore all 14 non-partisan playbooks pre-loaded with the ${stateConfig.name} ${stateConfig.totalCounties}-County Benchmark (${auditData.metadata.totalRecords.toLocaleString()} Active/Inactive Voter Roll rows + ${totalBallots.toLocaleString()} Voting History rows through ${stateConfig.extractDateLabel}). Every playbook is explained in plain English with zero personal data exposed.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StateSwitcherPill compact />
            <Link
              href={`/manifold?state=${activeState}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-700 text-white px-3.5 py-2 rounded-xl"
            >
              <Compass className="w-3.5 h-3.5" />
              3D Threat Manifold ({stateConfig.totalCounties})
            </Link>
            <Link
              href={`/reports/mississippi-playbook-analysis?state=${activeState}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-3.5 py-2 rounded-xl"
            >
              <FileText className="w-3.5 h-3.5" />
              Full {stateConfig.name} Report
            </Link>
          </div>
        }
      />

      <div className="pb-12">
        {renderPhase("Axis X: Physical Domicile & Multi-Unit Verification")}
        {renderPhase("Axis Y: Identity, Suffix & Relocation Hygiene")}
        {renderPhase(axisZPhase)}
      </div>
    </div>
  );
}
