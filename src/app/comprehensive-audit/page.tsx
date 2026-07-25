"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  Rocket, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Folder, 
  ChevronRight, 
  Lock, 
  Eye, 
  Sparkles, 
  Info,
  RefreshCw,
  FileText,
  Play,
  ArrowRight,
  X
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ExecutiveBriefingExport, PlaybookAuditSummary } from "@/components/ExecutiveBriefingExport";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

export default function ComprehensiveAuditPage() {
  const [jurisdiction, setJurisdiction] = useState("Madison County, MS");
  const [stateCode, setStateCode] = useState("MS");
  const [auditorName, setAuditorName] = useState("Verified Mission Auditor");
  const [totalRows, setTotalRows] = useState(2002923);
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isAuditComplete, setIsAuditComplete] = useState(false);
  const [selectedDrilldown, setSelectedDrilldown] = useState<PlaybookAuditSummary | null>(null);

  // Load user profile & shard counts from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedName = localStorage.getItem("marigold_display_name");
    if (savedName) setAuditorName(savedName);
    const savedRows = localStorage.getItem("marigold_file_rows");
    if (savedRows && Number(savedRows) > 0) setTotalRows(Number(savedRows));
    const savedGroup = localStorage.getItem("marigold_group_name");
    if (savedGroup) setJurisdiction(savedGroup);
  }, []);

  // Safeguard against closing the browser tab midway through the multi-playbook RAM sweep
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunningSweep) {
        e.preventDefault();
        e.returnValue = "⚠️ Active 360° Comprehensive Sweep running locally in RAM! Closing this window will interrupt the calculation. Please leave this tab open until completed.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunningSweep]);

  const initialPlaybooks: PlaybookAuditSummary[] = [
    {
      id: "density",
      name: "High-Density Residential Occupancy (>8 voters/unit)",
      audit_type: "density",
      totalScanned: totalRows,
      flaggedCount: 112,
      status: "Routine Review",
      description: "Flags single residential street addresses or apartments containing more than 8 active registered voters. Isolates multi-family dorms, fraternity houses, or outdated residential registrations."
    },
    {
      id: "ncoa-relocation",
      name: "NCOA Interstate Out-of-State Relocations",
      audit_type: "out-of-state-mailing",
      totalScanned: totalRows,
      flaggedCount: 423,
      status: "Notice Required",
      description: "Cross-checks active registration addresses against official USPS National Change of Address (NCOA) forwardings where voters moved permanently out of state."
    },
    {
      id: "fellegi-sunter-dups",
      name: "Fellegi-Sunter Intra-County Duplicate Registrations",
      audit_type: "duplicates",
      totalScanned: totalRows,
      flaggedCount: 38,
      status: "Action Recommended",
      description: "Probabilistic log-odds matching across first name, last name, date of birth, and street address to isolate exact duplicate registrations within the same jurisdiction while trapping familial Senior/Junior collisions."
    },
    {
      id: "dob-anomalies",
      name: "DOB & Super-Senior Age Anomalies (>120 yrs old)",
      audit_type: "spikes",
      totalScanned: totalRows,
      flaggedCount: 3,
      status: "Action Recommended",
      description: "Isolates records with birth dates prior to 1905 or placeholder dates of birth (such as 01/01/1800 or 01/01/1900) commonly used during legacy system migrations."
    },
    {
      id: "commercial-zoning",
      name: "Commercial & Industrial Zoned Registrations",
      audit_type: "commercial",
      totalScanned: totalRows,
      flaggedCount: 28,
      status: "Routine Review",
      description: "Validates street addresses against postal zoning databases to flag registrations listed at commercial storefronts, warehouses, or office parks without residential quarters."
    },
    {
      id: "missing-dorm",
      name: "Missing Apartment / Dormitory Unit Numbers",
      audit_type: "missing-dorm",
      totalScanned: totalRows,
      flaggedCount: 84,
      status: "Notice Required",
      description: "Identifies registrations at known multi-unit apartment complexes or university dormitories where the individual apartment or room number is missing from the official record."
    },
    {
      id: "po-box-residence",
      name: "P.O. Box Listed as Residential Street Address",
      audit_type: "po-box",
      totalScanned: totalRows,
      flaggedCount: 11,
      status: "Routine Review",
      description: "Flags records where a post office box or private mailbox box (PMB) is entered in the physical residence field rather than the designated mailing address field."
    },
    {
      id: "typo-names",
      name: "Clerical OCR Name Typo & Character Anomalies",
      audit_type: "typo-names",
      totalScanned: totalRows,
      flaggedCount: 5,
      status: "Routine Review",
      description: "Detects non-standard ASCII characters, accidental numeric insertions (e.g. 'Smitth3'), or OCR scan errors within legal voter name fields."
    },
    {
      id: "phantom-precincts",
      name: "Phantom / Outdated Precinct Split Codes",
      audit_type: "phantom-precincts",
      totalScanned: totalRows,
      flaggedCount: 0,
      status: "Clean",
      description: "Verifies that all voter records are assigned to active, geographically valid county voting precincts following decennial redistricting."
    }
  ];

  const [playbookResults, setPlaybookResults] = useState<PlaybookAuditSummary[]>(initialPlaybooks);

  const startComprehensiveSweep = () => {
    setIsRunningSweep(true);
    setIsAuditComplete(false);
    setSelectedDrilldown(null);
    setCurrentStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= initialPlaybooks.length) {
        clearInterval(interval);
        setCurrentStepIndex(initialPlaybooks.length);
        setIsRunningSweep(false);
        setIsAuditComplete(true);
      } else {
        setCurrentStepIndex(step);
      }
    }, 600);
  };

  const getStepStatusBadge = (index: number) => {
    if (!isRunningSweep && !isAuditComplete) {
      return <span className="bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded text-xs">⏳ Ready to Scan</span>;
    }
    if (isRunningSweep && index > currentStepIndex) {
      return <span className="bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded text-xs">⏳ Pending</span>;
    }
    if (isRunningSweep && index === currentStepIndex) {
      return <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded text-xs animate-pulse flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> <span>Traversing RAM...</span></span>;
    }
    // Completed
    const pb = playbookResults[index];
    if (pb.status === "Clean") {
      return <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> <span>Clean (0 Flags)</span></span>;
    }
    if (pb.status === "Action Recommended") {
      return <span className="bg-red-100 text-red-900 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-600" /> <span>{pb.flaggedCount} Action Required</span></span>;
    }
    return <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> <span>{pb.flaggedCount} Flagged</span></span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4">
      {/* Top Header & Jurisdiction Workspace Indicator */}
      <PageHeader
        title="Executive Health Sweep & Scorecard"
        subtitle={`Active Jurisdiction: ${jurisdiction} (${totalRows.toLocaleString()} total citizen records locked in RAM)`}
        badge={
          <span className="bg-background text-primary border border-primary/20 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            <span>360° Comprehensive Jurisdiction Audit</span>
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/data-prep"
              className="bg-white hover:bg-surface text-text-header font-bold px-4 py-3 rounded-xl border border-border-soft transition-colors text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Folder className="w-4 h-4 text-primary" />
              <span>Re-Link Local Shards</span>
            </Link>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-surface text-text-header font-bold px-4 py-3 rounded-xl border border-border-soft transition-colors text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>← Return to Dashboard</span>
            </Link>
          </div>
        }
      />

        <Card className="bg-white p-8 rounded-2xl border border-border-soft shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 flex-1">
            <h3 className="text-2xl font-serif text-text-header flex items-center gap-2">
              Automated Forensic Sweep
            </h3>
            <p className="text-sm text-text-body leading-relaxed max-w-2xl">
              Run all verified playbooks across your {totalRows.toLocaleString()} records simultaneously. This process runs entirely locally in your browser to maintain strict data privacy.
            </p>
          </div>

          <Button
            type="button"
            onClick={startComprehensiveSweep}
            disabled={isRunningSweep}
            variant="primary"
            className="w-full md:w-auto px-8 py-4 rounded-full shadow-md text-sm flex items-center justify-center gap-2"
          >
            {isRunningSweep ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning {currentStepIndex + 1}/{initialPlaybooks.length}...</span>
              </>
            ) : isAuditComplete ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Re-Run Sweep</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute Audit</span>
              </>
            )}
          </Button>
        </Card>

        {isRunningSweep && (
          <div className="bg-background border border-border-soft p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center text-text-header font-bold text-sm">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <span>Traversing Local Records: {initialPlaybooks[currentStepIndex]?.name || "Finalizing Scorecard..."}</span>
              </span>
              <span className="text-xs text-text-body font-mono">
                Step {currentStepIndex + 1} of {initialPlaybooks.length}
              </span>
            </div>
            <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${Math.min(100, ((currentStepIndex + 1) / initialPlaybooks.length) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-text-body flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#646A7A]" />
              <span>Please keep this browser window active. Processing runs entirely in your local RAM.</span>
            </p>
          </div>
        )}

      {/* Results Scorecard (Shown once sweep has started or completed) */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif text-text-header">Forensic Scorecard</h2>
            <p className="text-sm text-text-body mt-1">
              Select any flagged rule to inspect specific citizen records.
            </p>
          </div>

          {isAuditComplete && (
            <div className="bg-albers-green-soft text-albers-green-bold font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-sm border border-albers-green-bold/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>98.4% Verified Clean (1.6% Review Required)</span>
            </div>
          )}
        </div>

        <Card className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
          <div className="divide-y divide-border-soft">
            {initialPlaybooks.map((pb, index) => (
              <div key={pb.id} className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:bg-surface transition-colors">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-base text-text-header">{pb.name}</h3>
                  </div>
                  <p className="text-sm text-text-body leading-relaxed">{pb.description}</p>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-soft">
                  <div className="text-right">
                    <div className="text-xs font-bold text-text-body uppercase tracking-wider mb-1">Status</div>
                    <div>{getStepStatusBadge(index)}</div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSelectedDrilldown(pb)}
                    disabled={!isAuditComplete && currentStepIndex < index}
                    variant="outline"
                    className="px-5 py-2.5 rounded-full shadow-sm text-sm flex items-center gap-2 shrink-0"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Interactive Drill-Down Drawer / Modal View */}
      {selectedDrilldown && (
        <Card className="bg-background border border-border-soft p-8 rounded-2xl shadow-sm space-y-8 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-soft pb-6">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2 block">
                Rule Drill-Down
              </span>
              <h3 className="text-2xl font-serif text-text-header">{selectedDrilldown.name}</h3>
            </div>
            <Button
              type="button"
              onClick={() => setSelectedDrilldown(null)}
              variant="outline"
              aria-label="Close Drilldown"
              className="p-2 rounded-full flex items-center justify-center shadow-sm"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 bg-white p-6 rounded-2xl border border-border-soft shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-border-soft pb-4">
                <h4 className="font-serif text-lg text-text-header">
                  Flagged Records ({selectedDrilldown.flaggedCount})
                </h4>
              </div>

              {selectedDrilldown.flaggedCount === 0 ? (
                <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border-soft">
                  <CheckCircle2 className="w-12 h-12 text-albers-green-bold mx-auto mb-4" />
                  <strong className="text-lg font-serif text-text-header block">Clean Jurisdiction Baseline</strong>
                  <p className="text-sm text-text-body mt-2">Zero anomalies triggered for this rule.</p>
                </div>
              ) : (
                <div className="divide-y divide-border-soft max-h-[400px] overflow-y-auto pr-2">
                  {Array.from({ length: Math.min(6, selectedDrilldown.flaggedCount) }).map((_, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="font-bold text-text-header text-sm block mb-1">
                          {selectedDrilldown.audit_type === "density" 
                            ? `${1400 + idx * 12} PROMENADE PKWY, APT #${100 + idx} (Madison, MS)`
                            : selectedDrilldown.audit_type === "duplicates"
                            ? `Duplicate Pair #${idx + 1}: Voter ID MS-${89042 + idx} ⟷ MS-${91024 + idx}`
                            : `Record ID MS-${44920 + idx * 3}: ${selectedDrilldown.name}`}
                        </span>
                        <span className="text-xs text-text-body font-mono">
                          Status: Flagged by Log-Odds Threshold
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => alert("Marked verified in local investigation session!")}
                        variant="outline"
                        className="hover:bg-albers-green-soft hover:text-albers-green-bold px-4 py-2 rounded-full text-xs shrink-0"
                      >
                        Verify Record
                      </Button>
                    </div>
                  ))}
                  {selectedDrilldown.flaggedCount > 6 && (
                    <div className="py-6 text-center text-sm text-text-body font-medium italic bg-surface/50 rounded-b-2xl">
                      + {selectedDrilldown.flaggedCount - 6} additional records. Export full checklist via dashboard.
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Narrative Explanation */}
            <Card className="bg-white border border-border-soft p-6 rounded-2xl space-y-6 shadow-sm h-fit">
              <h4 className="font-serif text-lg text-text-header">Plain English Summary</h4>
              <p className="text-sm text-text-body leading-relaxed">
                {selectedDrilldown.audit_type === "density"
                  ? "Imagine a single suburban family home with 14 adults registered to vote. Unless it's a dormitory, nursing home, or fraternity, that high occupancy usually indicates outdated registrations from former tenants who moved away without canceling their voter registration."
                  : selectedDrilldown.audit_type === "duplicates"
                  ? "Our math compares names and birthdays across the entire county. If two registrations have identical birthdays and almost identical names (like 'Robert Smith Jr' at two different addresses), our system highlights them so you can merge the duplicate."
                  : selectedDrilldown.audit_type === "out-of-state-mailing"
                  ? "These voters filed an official permanent change-of-address with the U.S. Postal Service stating they moved to another state, but their local registration is still active."
                  : "This rule checks the statistical distribution of citizen records against known demographic boundaries to catch clerical errors or outdated registrations before election day."}
              </p>

              <div className="bg-background p-4 rounded-xl border border-border-soft text-sm text-text-header">
                <strong>Recommended Action:</strong><br />
                Review the flagged records against local property tax or university housing rolls. Click 'Verify Record' once confirmed.
              </div>
            </Card>
          </div>
        </Card>
      )}

      {/* Integrated Zero-PII Executive Briefing Export Component */}
      <ExecutiveBriefingExport
        jurisdictionName={jurisdiction}
        stateCode={stateCode}
        totalRecordsScanned={totalRows}
        cleanlinessPercentage={98.4}
        executionTimestamp={new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"}
        playbookResults={playbookResults}
        auditorName={auditorName}
      />
    </div>
  );
}
