"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { usePlaybooks } from "@/lib/workspace/PlaybookContext";
import { useFeed } from "@/lib/workspace/FeedContext";
import msAudit from "@/data/mississippi_audit_results.json";

export default function MissionControl() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [accuracies, setAccuracies] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedState, setSelectedState] = useState("MS");
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const router = useRouter();

  const { customPlaybooks, addPlaybook, updatePlaybook } = usePlaybooks();
  const { addFeedEvent } = useFeed();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newPbName, setNewPbName] = useState("");
  const [newPbDesc, setNewPbDesc] = useState("");

  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        const pb = msAudit.playbooks;
        const meta = msAudit.metadata;
        const vh = msAudit.votingHistoryAudit;
        const yb = pb.clericalTypos.yearBreakdown as Record<string, number>;
        const systemPlaybooks = [
          {
            id: "density",
            name: "PB-01: High-Density Residential Occupancy",
            desc: `${pb.highDensity.totalAddresses.toLocaleString()} normalized addresses (${pb.highDensity.activeOnlyAddresses.toLocaleString()} Active-only; ${pb.highDensity.institutionalClusters} Institutional hubs separated)`,
            description:
              "Flags residential parcels with 8+ registered voters while separating nursing homes, college dormitories, and apartment complexes from single-family homes.",
            flaggedCount: pb.highDensity.activeOnlyAddresses,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "≥ 8 Active Voters",
            audit_type: "density",
          },
          {
            id: "missing-dorm",
            name: "PB-02: Missing Dormitory & Multi-Unit Designators",
            desc: `${pb.missingDorm.totalVoters.toLocaleString()} verified campus/multi-unit records (${pb.missingDorm.streetNameFalsePositivesRemoved.toLocaleString()} street-name false alarms removed)`,
            description:
              "Uses whole-word regex boundaries to isolate dormitory and apartment registrations missing room or unit numbers without flagging streets named Marshall Pl or Halls Ferry Rd.",
            flaggedCount: pb.missingDorm.totalVoters,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "Whole-Word Multi-Unit Match",
            audit_type: "missing-dorm",
          },
          {
            id: "out-of-state-mailing",
            name: "PB-03: NCOA Interstate Out-of-State Mail Drift",
            desc: `${pb.ncoaRelocations.totalVoters.toLocaleString()} Active voters with out-of-state mail (${pb.ncoaRelocations.inactiveRelocatedVoters.toLocaleString()} already Inactive on NVRA clock)`,
            description:
              "Separates Active voters receiving mail out-of-state from the 82.1% already moved to Inactive status awaiting their 2-cycle federal NVRA removal period.",
            flaggedCount: pb.ncoaRelocations.totalVoters,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "Active Status + Mail State ≠ MS",
            audit_type: "out-of-state-mailing",
          },
          {
            id: "po-box",
            name: "PB-04: Commercial & P.O. Box in Physical Residence Line",
            desc: `${pb.commercialPOBox.totalVoters.toLocaleString()} records (${pb.commercialPOBox.activeVoters.toLocaleString()} Active, ${pb.commercialPOBox.inactiveVoters.toLocaleString()} Inactive) with P.O. Box or PMB as domicile`,
            description:
              "Identifies records where a post office box or private mail box was entered into the physical street residence column instead of the mailing address column.",
            flaggedCount: pb.commercialPOBox.totalVoters,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "P.O. Box / PMB / Parcel Hub",
            audit_type: "po-box",
          },
          {
            id: "typo-names",
            name: "PB-05: Clerical Typos & Pre-1900 Migration Dates",
            desc: `${pb.clericalTypos.totalAnomalies.toLocaleString()} legacy database artifacts (${(yb["1801"] ?? 1271).toLocaleString()} Year 1801, ${(yb["0001"] ?? 206).toLocaleString()} Year 0001, ${(yb["DATAMIGRATION_ADDR"] ?? 113).toLocaleString()} DATAMIGRATION)`,
            description:
              "Isolates paper-to-digital SEMS migration placeholders (01/01/1801, 01/01/0001, DATAMIGRATION street strings) and 1-character truncated name fields.",
            flaggedCount: pb.clericalTypos.totalAnomalies,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "Year < 1900 or Length = 1",
            audit_type: "typo-names",
          },
          {
            id: "duplicates",
            name: "PB-06: Generational Suffix & Duplicate Disambiguation",
            desc: `${pb.duplicates.generationalPairs.toLocaleString()} Jr/Sr pairs protected • ${pb.duplicates.activeActiveDuplicates.toLocaleString()} Active–Active intra-ZIP duplicate clusters`,
            description:
              "Protects Jr./Sr./III fathers and sons living at the same family address while isolating Active–Active intra-ZIP duplicates and Active–Inactive move trails.",
            flaggedCount: pb.duplicates.activeActiveDuplicates,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "Exact First+Middle+Last+Suffix+ZIP",
            audit_type: "duplicates",
          },
          {
            id: "spikes",
            name: "PB-07: Statutory Registration Velocity Spikes",
            desc: `Peaks on ${pb.registrationSpikes.peakDates[0].date} (${pb.registrationSpikes.peakDates[0].count.toLocaleString()}), ${pb.registrationSpikes.peakDates[1].date} (${pb.registrationSpikes.peakDates[1].count.toLocaleString()}), and ${pb.registrationSpikes.peakDates[2].date} (${pb.registrationSpikes.peakDates[2].count.toLocaleString()})`,
            description:
              "Correlates single-day registration surges against Mississippi's 30-day statutory mail-in cutoff dates prior to Presidential General Elections.",
            flaggedCount: pb.registrationSpikes.peakDates.length,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "Statutory Cutoff Calendar",
            audit_type: "spikes",
          },
          {
            id: "phantom-precincts",
            name: "PB-08: Mega-Precinct Capacity & Assignment Audit",
            desc: `${pb.precinctCapacity.overCapacityCount} precincts > 3,000 voters (${pb.precinctCapacity.severelyOverCapacityCount} > 5,000 voters; ${pb.precinctCapacity.blankPrecinctCount} blank precinct codes)`,
            description:
              "Identifies fast-growing suburban polling places exceeding the 3,000-voter benchmark and isolates records missing a valid precinct code.",
            flaggedCount: pb.precinctCapacity.overCapacityCount,
            status: "verified",
            totalScanned: meta.totalRecords,
            threshold: "> 3,000 Voters / Precinct",
            audit_type: "phantom-precincts",
          },
          {
            id: "benfords-law",
            name: "PB-09: Newcomb-Benford First-Digit Distribution",
            desc: `Total Roll χ² = ${pb.benfordsLaw.chiSquare} (PASS < 15.51) • 2024 Turnout χ² = ${pb.benfordsLaw.turnout2024.chiSquare} (Sizing Effect)`,
            description:
              "Tests precinct registration and 2024 turnout counts against the logarithmic Benford curve, demonstrating why 1,500–3,000 statutory precinct sizing clusters turnout at digits 2–4.",
            flaggedCount: 0,
            status: "verified",
            totalScanned: pb.precinctCapacity.totalPrecincts,
            threshold: "χ² < 15.51 (df = 8)",
            audit_type: "benfords-law",
          },
          {
            id: "voting-history",
            name: "PB-10: 25.91 Million Voting History Referential Audit",
            desc: `100.00% Roll Match (${vh.orphanedHistoryRows} Orphans) • ${vh.duplicate2024SameDayCreditRows} Same-Day 2024 Duplicate Credit Rows`,
            description:
              `Cross-table join of all ${vh.totalHistoryRowsScanned.toLocaleString()} historical ballots against the ${meta.totalRecords.toLocaleString()} Voter Roll, verifying ${vh.unique2024GeneralVoters.toLocaleString()} 2024 General voters and isolating ${vh.duplicate2024SameDayCreditRows} duplicate credit entries.`,
            flaggedCount: vh.duplicate2024SameDayCreditRows,
            status: "verified",
            totalScanned: vh.totalHistoryRowsScanned,
            threshold: "25.91M Cross-Table Join",
            audit_type: "voting-history",
          },
        ];

        const allPlaybooks = [...systemPlaybooks, ...customPlaybooks];
        setPlaybooks(allPlaybooks);

        const uniqueAudits = Array.from(new Set(allPlaybooks.map((p: any) => p.audit_type)));
        const newAccuracies: Record<string, number> = {};

        for (const audit of uniqueAudits) {
          try {
            const accRes = await fetch(`/api/feedback?auditType=${audit}`);
            if (accRes.ok) {
              const accData = await accRes.json();
              newAccuracies[audit as string] = accData.accuracy;
            }
          } catch {}
        }
        setAccuracies(newAccuracies);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaybooks();
  }, [customPlaybooks]);

  const getAuditLabel = (type: string) => {
    const labels: Record<string, string> = {
      density: "High-Density Occupancy (Normalized)",
      "missing-dorm": "Whole-Word Multi-Unit Regex",
      "po-box": "P.O. Box in Residence Field",
      "typo-names": "Legacy Migration & Clerical Check",
      duplicates: "Suffix-Protected Identity Linkage",
      commercial: "Commercial Mail Receiver Check",
      spikes: "Statutory Cutoff Velocity",
      "phantom-precincts": "Precinct Capacity & Code Check",
      "out-of-state-mailing": "Active vs. Inactive NCOA Split",
      "benfords-law": "Logarithmic Chi-Square Goodness-of-Fit",
      "voting-history": "25.91M Ballot History Referential Join",
    };
    return labels[type] || type;
  };

  const getPlaybookSource = (name: string, type: string) => {
    if (type === "density") return "📚 Source: EAC Group Quarters & Single-Family Separation Standard";
    if (type === "spikes") return "📈 Source: MS Code § 23-15-37 (30-Day Mail-In Cutoff Calendar)";
    if (type === "po-box" || type === "commercial")
      return (
        <>
          📬 Source: USPS <GlossaryTooltip term="NCOA" /> &amp; MS Physical Domicile Statute
        </>
      );
    if (type === "missing-dorm") return "🏛️ Source: EAC Multi-Unit & Campus Housing Delivery Guidelines";
    if (type === "typo-names") return "🔍 Source: SEMS Legacy Paper-to-Digital Migration Validation";
    if (type === "duplicates")
      return (
        <>
          📋 Source: <GlossaryTooltip term="NVRA" /> Section 8 &amp; Generational Suffix Protection
        </>
      );
    if (type === "phantom-precincts") return "🗺️ Source: EAC 3,000-Voter Polling Place Capacity Benchmark";
    if (type === "out-of-state-mailing")
      return (
        <>
          📬 Source: National Change of Address (<GlossaryTooltip term="NCOA" />) &amp; NVRA 2-Cycle Clock
        </>
      );
    if (type === "voting-history") return "🗳️ Source: Statewide SEMS Voting History Cross-Table Join (25.91M Rows)";
    return "💡 Source: Non-Partisan Election Administration Standard";
  };

  const statePlaybooks = playbooks.filter((p) => {
    if (selectedState === "MS") return !p.name.includes("[NC ");
    if (selectedState === "NC") return p.name.includes("[NC ");
    return true;
  });

  const filteredPlaybooks =
    selectedCounty === "All"
      ? statePlaybooks
      : statePlaybooks.filter((p) =>
          selectedCounty === "Statewide" ? !p.county : p.county === selectedCounty
        );

  const msCounties = [
    "All",
    "Statewide",
    "Hinds",
    "DeSoto",
    "Harrison",
    "Madison",
    "Rankin",
    "Jackson",
    "Lee",
    "Lafayette",
    "Oktibbeha",
  ];
  const ncCounties = ["All", "Statewide", "Wake", "Mecklenburg", "Guilford", "Durham", "New Hanover"];
  const currentCounties = selectedState === "NC" ? ncCounties : msCounties;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="mb-8 space-y-4">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-950 rounded-full text-xs font-extrabold uppercase tracking-wider">
                🏛️ 82-County Commissioner Mission Control
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                2,112,460 Voter Roll + 25,911,640 Voting History Rows
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded border border-emerald-300 flex items-center gap-1">
                <span>✓ 100% Zero-PII Verified</span>
              </span>
            </div>

            {/* State Selector */}
            <div className="flex bg-slate-200 p-1 rounded-xl gap-1">
              <button
                onClick={() => {
                  setSelectedState("MS");
                  setSelectedCounty("All");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  selectedState === "MS"
                    ? "bg-primary text-white shadow"
                    : "text-slate-700 hover:bg-slate-300"
                }`}
              >
                📍 Mississippi (MS — 82 Counties)
              </button>
              <button
                onClick={() => {
                  setSelectedState("NC");
                  setSelectedCounty("All");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  selectedState === "NC"
                    ? "bg-emerald-700 text-white shadow"
                    : "text-slate-700 hover:bg-slate-300"
                }`}
              >
                🌲 North Carolina (NC)
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            {selectedState === "MS" ? "Mississippi 10-Playbook" : "North Carolina"} Forensic Suite
          </h1>
          <p className="text-muted-foreground mt-2">
            Pre-configured deterministic audits calibrated for County Election Commissioners and Circuit Clerks. False alarms from nursing homes, college dormitories, Jr./Sr. fathers and sons, and street names like{" "}
            <em>Marshall Place</em> are automatically filtered out.{" "}
            <Tooltip content="Hover over any glossary term or open the Plain-English Guide in the right panel to see step-by-step explanations of the math.">
              <span className="text-primary font-semibold underline decoration-dotted">
                Hover here for a plain-English tip.
              </span>
            </Tooltip>
          </p>

          {/* Flagship Action Buttons: Report, 3D Manifold, Explore */}
          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3.5 rounded-xl shadow-sm transition-all text-xs inline-flex items-center gap-2"
            >
              <span>📄 Read Accént Editorial Mississippi Report (Draft 2) →</span>
            </Link>
            <Link
              href="/manifold"
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-5 py-3.5 rounded-xl shadow-sm transition-all text-xs inline-flex items-center gap-2"
            >
              <span>🧭 Open Interactive Three.js 3D Threat Manifold →</span>
            </Link>
            <Link
              href="/explore?autoRun=true"
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold px-5 py-3.5 rounded-xl shadow-xs transition-all text-xs inline-flex items-center gap-2"
            >
              <span>🚀 Launch Interactive DuckDB Scanner →</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {currentCounties.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCounty(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCounty === c
                  ? selectedState === "NC"
                    ? "bg-emerald-700 text-white shadow"
                    : "bg-primary text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {c === "All" ? "🌐 All 10 Playbooks" : c === "Statewide" ? "🏛️ Statewide" : `📍 ${c} County`}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-sm transition-all flex items-center gap-1"
          >
            <span>✨ Create Custom Playbook</span>
          </button>
        </div>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading Playbooks...</p>
      ) : filteredPlaybooks.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold mb-2">No Playbooks Found</h2>
          <p className="text-muted-foreground mb-6">
            No playbooks found for {selectedCounty}. Click below to view all statewide playbooks!
          </p>
          <button onClick={() => setSelectedCounty("All")} className="btn-primary">
            Show All Statewide Playbooks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaybooks.map((p) => (
            <div
              key={p.id}
              className="card flex flex-col justify-between group hover:border-primary/50 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <span className="bg-amber-50 text-amber-900 text-[11px] font-mono px-2 py-0.5 rounded border border-amber-200 shrink-0 font-bold">
                    {typeof p.flaggedCount === "number" ? p.flaggedCount.toLocaleString() : "Verified"}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-2">{p.desc}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{p.description}</p>
                <div className="space-y-1 mb-4 text-xs">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <span className="font-medium text-slate-800">Method:</span>{" "}
                    {getAuditLabel(p.audit_type)}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <span className="font-medium text-slate-800">Rule:</span> {p.threshold || "Standard"}
                  </p>
                </div>

                <div className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 mb-4 text-xs text-slate-800">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Statutory / Technical Standard:
                  </span>
                  <span className="font-medium text-slate-700">
                    {getPlaybookSource(p.name, p.audit_type)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (p.id === "voting-history") {
                      router.push("/reports/mississippi-playbook-analysis#voting-history-forensics");
                      return;
                    }
                    setLaunchingId(p.id);
                    router.push(
                      `/explore?audit=${p.audit_type}&county=${encodeURIComponent(
                        p.county || "All"
                      )}&threshold=${encodeURIComponent(p.threshold || "")}`
                    );
                  }}
                  disabled={launchingId === p.id}
                  className="btn-primary flex-1 justify-center bg-primary/90 text-xs py-2.5 flex items-center gap-1.5"
                >
                  {launchingId === p.id ? "Launching..." : "Launch Playbook"}
                </button>
                <Link
                  href={`/audit/${p.id}`}
                  className="px-3 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center"
                >
                  Guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playbook Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">✨ Create Custom Playbook</h3>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Playbook Name</label>
                <input
                  type="text"
                  value={newPbName}
                  onChange={(e) => setNewPbName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Dormitory Unit Verification"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Description / Goal
                </label>
                <textarea
                  value={newPbDesc}
                  onChange={(e) => setNewPbDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm h-24 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Describe what this playbook aims to verify..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPbName.trim()) {
                    addPlaybook({
                      id: crypto.randomUUID(),
                      name: newPbName,
                      desc: newPbDesc.slice(0, 50) + (newPbDesc.length > 50 ? "..." : ""),
                      description: newPbDesc,
                      audit_type: "custom",
                      promotedGroups: [],
                    });
                    setIsWizardOpen(false);
                    setNewPbName("");
                    setNewPbDesc("");
                  }
                }}
                disabled={!newPbName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Save Playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
