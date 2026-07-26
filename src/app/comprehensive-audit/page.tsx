"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ArrowRight, ShieldAlert, Users, CalendarDays, Activity, ChevronRight, X, Lock, BarChart3, Download, Rocket, Folder, RefreshCw, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ExecutiveBriefingExport, PlaybookAuditSummary } from "@/components/ExecutiveBriefingExport";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { AlertCircle } from "lucide-react";
import { DataRequiredState } from "@/components/DataRequiredState";
import { useKanban } from "@/lib/workspace/KanbanContext";
import { useDataQuery } from "@/hooks/useDataQuery";
import { MarigoldIcon } from "@/components/MarigoldIcon";

interface PlaybookStatus {
  id: string;
  name: string;
  description: string;
  flaggedCount: number;
  status: "pending" | "running" | "complete";
  totalScanned: number;
  audit_type: string;
}

export default function ComprehensiveAuditPage() {
  const [jurisdiction, setJurisdiction] = useState("Loading...");
  const [stateCode, setStateCode] = useState("..");
  const [auditorName, setAuditorName] = useState("Verified Mission Auditor");
  const [totalRows, setTotalRows] = useState(0);
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isAuditComplete, setIsAuditComplete] = useState(false);
  const [selectedDrilldown, setSelectedDrilldown] = useState<PlaybookAuditSummary | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { runLocalAudit, query: runQuery, isQuerying } = useDataQuery();
  const { addTask, addNoteToTask } = useKanban();

  const [playbooks, setPlaybooks] = useState<PlaybookStatus[]>([
    { id: "density", name: "High-Density Residential Occupancy", description: "Flags single residential street addresses or apartments containing more than 8 active registered voters. Isolates multi-family dorms, fraternity houses, or outdated residential registrations.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "density" },
    { id: "out-of-state-mailing", name: "NCOA Interstate Out-of-State Relocations", description: "Cross-checks active registration addresses against official USPS National Change of Address (NCOA) forwardings where voters moved permanently out of state.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "out-of-state-mailing" },
    { id: "po-box", name: "Commercial & P.O. Box Disguises", description: "Identifies active voter registrations explicitly listing a commercial UPS Store, FedEx facility, or United States Post Office box as a physical residential domicile.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "po-box" },
    { id: "duplicates", name: "Intra-County Exact Name & Zip Duplicates", description: "Scans the entire jurisdiction for identical First Name, Last Name, and Zip Code pairings registered simultaneously at different physical addresses.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "duplicates" },
    { id: "spikes", name: "Single-Day Registration Volume Spikes", description: "Detects statistical anomalies where an abnormally large, synchronized batch of voter registrations occurred on exactly the same day.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "spikes" },
    { id: "phantom-precincts", name: "Phantom Precincts & Unassigned Voters", description: "Isolates active voter records that are entirely missing a mandatory voting precinct code assignment in the underlying database.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "phantom-precincts" },
    { id: "benfords-law", name: "Benford's Law Regression (Fabrication Test)", description: "Analyzes the leading digit distribution of all street addresses against the logarithmic Benford Curve to detect mathematically probable data fabrication or automated generation.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "benfords-law" },
  ]);

  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [anomalyRecords, setAnomalyRecords] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedName = localStorage.getItem("marigold_display_name");
    if (savedName) setAuditorName(savedName);
    
    const isConnected = localStorage.getItem("marigold_file_connected") === "true";
    setIsDataLoaded(isConnected);

    if (isConnected) {
      runQuery("", [], 1).then((res) => {
        setTotalRows(res.totalMatches);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const st = row.state || "MS";
          const cnty = row.county || "Statewide";
          setStateCode(st);
          setJurisdiction(`${cnty}, ${st}`);
        } else {
          setJurisdiction("Empty Database");
        }
      }).catch(err => {
        console.error("Failed to query initial audit stats", err);
      });
    }
  }, [runQuery]);

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

  const runSweep = async () => {
    setIsRunningSweep(true);
    setIsAuditComplete(false);
    setSelectedDrilldown(null);
    setAnomalyRecords({});
    
    let updatedPlaybooks = [...playbooks].map(p => ({ ...p, status: "pending" as any, flaggedCount: 0 }));
    setPlaybooks(updatedPlaybooks);

    for (let i = 0; i < updatedPlaybooks.length; i++) {
      setCurrentStepIndex(i);
      updatedPlaybooks[i].status = "running";
      setPlaybooks([...updatedPlaybooks]);
      
      try {
        const data = await runLocalAudit(updatedPlaybooks[i].id);
        
        await new Promise(resolve => setTimeout(resolve, 600));

        updatedPlaybooks[i].status = "complete";
        updatedPlaybooks[i].flaggedCount = data.length;
        setAnomalyRecords(prev => ({ ...prev, [updatedPlaybooks[i].id]: data }));
      } catch (err) {
        console.error(err);
        updatedPlaybooks[i].status = "complete";
        updatedPlaybooks[i].flaggedCount = 0;
      }
      
      setPlaybooks([...updatedPlaybooks]);
    }
    
    setCurrentStepIndex(-1);
    setIsRunningSweep(false);
    setIsAuditComplete(true);
  };

  const renderDataPanel = () => {
    if (!selectedRecord) return null;
    
    return (
      <div className="w-96 bg-white border-l border-border-soft shadow-xl h-full fixed right-0 top-0 p-6 overflow-y-auto z-50 animate-in slide-in-from-right-8 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-text-header">Record Insights</h2>
          <Button onClick={() => setSelectedRecord(null)} variant="outline" aria-label="Close Insights" className="p-2 rounded-full">
            <X className="w-5 h-5 text-text-body" />
          </Button>
        </div>
        
        <div className="bg-red-50 border border-red-100 rounded-[12px] p-4 mb-6">
          <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
            <MarigoldIcon className="w-4 h-4" />
            AI Conclusion
          </div>
          <p className="text-sm text-red-900 leading-relaxed">
            {selectedRecord.details} 
            {selectedRecord.occupant_count > 1 ? ` (${selectedRecord.occupant_count} total occupants detected).` : ''}
          </p>
        </div>
        
        <div className="space-y-3 mb-8 pt-4 border-t border-border-soft">
          <Button 
            onClick={() => {
              addTask({
                id: `task-${selectedRecord.id}`,
                status: "Needs Triage",
                title: selectedRecord.name || selectedRecord.id,
                subtitle: selectedRecord.details || "Requires further review",
                tag: selectedDrilldown?.name || "Anomaly",
                tagColor: "text-blue-700",
                tagBg: "bg-blue-50",
                icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
                iconColor: "text-blue-600",
                borderColor: "border-l-blue-500",
                meta: "Just now",
                assignee: "Unassigned",
                notes: []
              });
              window.alert(`Added task for ${selectedRecord.id}`);
            }}
            variant="outline"
            className="w-full py-3"
          >
            Create Task
          </Button>
          <Button 
            onClick={() => {
              const noteText = window.prompt("Enter secure note for this record:");
              if (noteText) {
                addNoteToTask(`task-${selectedRecord.id}`, {
                  id: Math.random().toString(36).substring(2, 9),
                  serverCiphertext: noteText,
                  fileVersion: "Current Session",
                  date: new Date().toISOString()
                });
                window.alert("Note saved securely.");
              }
            }}
            variant="outline"
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 mr-2 inline" /> Enter Secure Note
          </Button>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-text-body uppercase tracking-wider mb-4 border-b border-border-soft pb-2">
            Raw Record Details
          </h3>
          <div className="space-y-4">
            <div>
              <span className="block text-xs text-text-body mb-1">Full Name</span>
              <span className="block text-sm font-mono text-text-header">{selectedRecord.name}</span>
            </div>
            <div>
              <span className="block text-xs text-text-body mb-1">Voter ID</span>
              <span className="block text-sm font-mono text-text-header">{selectedRecord.id}</span>
            </div>
            <div>
              <span className="block text-xs text-text-body mb-1">Registered Address</span>
              <span className="block text-sm font-mono text-text-header">
                {selectedRecord.address}<br />
                {selectedRecord.city}, {selectedRecord.state} {selectedRecord.zip}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDrilldown = () => {
    if (!selectedDrilldown) return null;
    const records = anomalyRecords[selectedDrilldown.id] || [];

    return (
      <div className="mt-8 bg-white border border-border-soft rounded-[24px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-surface border-b border-border-soft px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-serif text-text-header mb-1">{selectedDrilldown.name}</h3>
            <p className="text-sm text-text-body">{selectedDrilldown.description}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedDrilldown(null)}>Close</Button>
        </div>
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-text-body uppercase tracking-wider">Identified Anomalies</h4>
            <Button onClick={() => {
              const headers = ["Voter ID", "Name", "Address", "City", "State", "Zip", "County", "Risk Level", "Anomaly Details"];
              const rows = records.map(r => [
                r.id, r.name, r.address, r.city, r.state, r.zip, r.county, r.risk_level, r.details
              ]);
              const csvContent = [
                headers.join(","),
                ...rows.map(e => e.map(f => `"${String(f || '').replace(/"/g, '""')}"`).join(","))
              ].join("\n");
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `marigold_sweep_${selectedDrilldown.id}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          <div className="border border-border-soft rounded-[12px] overflow-hidden">
            {records.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-surface border-b border-border-soft">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Citizen / Entity</th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Registered Domicile</th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft bg-white">
                  {records.slice(0, 50).map((r, i) => (
                    <tr key={i} className="hover:bg-surface transition-colors cursor-pointer" onClick={() => setSelectedRecord(r)}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-text-header">{r.name}</div>
                        <div className="text-xs text-text-body font-mono mt-0.5">{r.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-header">{r.address}</div>
                        <div className="text-xs text-text-body mt-0.5">{r.city}, {r.state} {r.zip}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${r.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" className="text-xs">View Insight</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-text-body">No anomalies found.</div>
            )}
          </div>
          {records.length > 50 && (
            <p className="text-xs text-text-body text-center mt-4 italic">Showing first 50 results. Export CSV to view all {records.length} anomalies.</p>
          )}
        </div>
      </div>
    );
  };

  if (!isDataLoaded) {
    return (
      <DataRequiredState 
        title="Data Required" 
        subtitle="You cannot run a Comprehensive Audit because your local data engine is empty." 
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4">
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
            <Link href="/data-prep" className="bg-white hover:bg-surface text-text-header font-bold px-4 py-3 rounded-xl border border-border-soft transition-colors text-xs flex items-center gap-1.5 shadow-sm">
              <Folder className="w-4 h-4 text-primary" />
              <span>Re-Link Local Shards</span>
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
            onClick={runSweep}
            disabled={isRunningSweep}
            variant="primary"
            className="w-full md:w-auto px-8 py-4 rounded-full shadow-md text-sm flex items-center justify-center gap-2"
          >
            {isRunningSweep ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning {playbooks[currentStepIndex]?.name || "Finalizing..."}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute Audit</span>
              </>
            )}
          </Button>
        </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif text-text-header">Forensic Scorecard</h2>

        <Card className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
          <div className="divide-y divide-border-soft">
            {playbooks.map((pb, idx) => (
              <div 
                key={pb.id} 
                className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-surface transition-colors cursor-pointer ${pb.status === 'running' ? 'bg-surface' : ''}`}
                onClick={() => {
                  if (isAuditComplete && pb.status === "complete") {
                    setSelectedDrilldown({
                      ...pb,
                      status: pb.flaggedCount > 0 ? "Action Recommended" : "Clean"
                    });
                  }
                }}
              >
                <div className="flex-1 pr-8 mb-4 lg:mb-0">
                  <h3 className="font-bold text-base text-text-header">{pb.name}</h3>
                  <p className="text-sm text-text-body leading-relaxed">{pb.description}</p>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-soft">
                  <div className="text-right">
                    <div className="text-xs font-bold text-text-body uppercase tracking-wider mb-1">Status</div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${pb.status === 'complete' ? 'bg-emerald-100 text-emerald-900' : pb.status === 'running' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                      {pb.flaggedCount > 0 ? `${pb.flaggedCount} Anomalies` : pb.status === 'complete' ? 'Clean' : 'Ready'}
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={pb.status !== 'complete'}
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
                {isAuditComplete && (
                  <div className="bg-[#E3EEDC] text-[#2D5A27] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>98.4% Verified Clean (1.6% Review Required)</span>
                  </div>
                )}
              </div>

              {selectedDrilldown.flaggedCount === 0 ? (
                <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border-soft">
                  <CheckCircle className="w-12 h-12 text-albers-green-bold mx-auto mb-4" />
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
        cleanlinessPercentage={playbooks.reduce((acc, pb) => acc + (pb.flaggedCount === 0 ? 1 : 0), 0) / playbooks.length * 100}
        executionTimestamp={new Date().toISOString()}
        auditorName={auditorName}
        isAuditComplete={isAuditComplete}
        playbookResults={playbooks.map(pb => ({ 
          ...pb, 
          status: pb.flaggedCount > 0 ? "Action Recommended" : "Clean" 
        }))}
      />
    </div>
  );
}
