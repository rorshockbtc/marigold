"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Play, CheckCircle2, Download, AlertTriangle, FileText, ChevronRight, Eye, Sparkles, RefreshCw, Filter, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataRequiredState } from "@/components/DataRequiredState";
import { useDataQuery } from "@/hooks/useDataQuery";
import { useGroupSync } from "@/hooks/useGroupSync";
import { useKanban } from "@/lib/workspace/KanbanContext";
import { isDemoGroupActive, autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";
import { extractActualCountyName, extractActualCityName } from "@/lib/csv/universalMapper";
import { PageHeader } from "@/components/PageHeader";
import { ExecutiveBriefingExport } from "@/components/ExecutiveBriefingExport";
import { useWorkspace } from "@/lib/workspace/WorkspaceContext";

interface PlaybookStatus {
  id: string;
  name: string;
  description: string;
  flaggedCount: number;
  status: "pending" | "running" | "complete" | "error";
  totalScanned: number;
  audit_type: string;
}

interface DrilldownState {
  playbook: PlaybookStatus;
  records: any[];
}

export default function ComprehensiveAuditPage() {
  const [auditorName, setAuditorName] = useState("Local Auditor");
  const [totalRows, setTotalRows] = useState(0);
  const [stateCode, setStateCode] = useState("MS");
  const [jurisdiction, setJurisdiction] = useState("Statewide, MS");
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [isAuditComplete, setIsAuditComplete] = useState(false);
  const [selectedDrilldown, setSelectedDrilldown] = useState<DrilldownState | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);
  const [isUpToDate, setIsUpToDate] = useState(false);
  const { runAllPlaybooksSweep, runLocalAudit, query: runQuery, queryProgress } = useDataQuery();
  const { publishAuditCache, loadAuditCache } = useGroupSync();
  const { addTask, addNoteToTask } = useKanban();

  const getRowCounty = (r: any) => {
    if (r.county && r.county !== "Statewide" && r.county !== "Unknown" && !String(r.county).toUpperCase().startsWith("SC0")) {
      return r.county;
    }
    if (r.raw) {
      return extractActualCountyName(r.raw);
    }
    return "Hinds County";
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${String(row[h] !== undefined ? row[h] : '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPlaybookCSV = (playbook: any) => {
    const realRows = anomalyRecords[playbook.id] || [];
    const safeName = playbook.name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    if (realRows.length > 0) {
      const formattedRows: any[] = [];
      
      realRows.forEach(r => {
        const countyName = getRowCounty(r);
        if (r.residentCluster && r.residentCluster.length > 0) {
          r.residentCluster.forEach((resident: any) => {
            formattedRows.push({
              County: countyName,
              Voter_ID: resident.id || r.id || r.voter_id,
              Full_Name: resident.name || r.name,
              First_Name: resident.first_name || r.first_name || '',
              Middle_Name: resident.middle_name || r.middle_name || '',
              Last_Name: resident.last_name || r.last_name || '',
              Suffix: resident.suffix || r.suffix || '',
              Address: r.address,
              City: resident.city || r.city || (r.raw ? extractActualCityName(r.raw) : ''),
              State: resident.state || r.state || stateCode,
              Zip: resident.zip || r.zip,
              Total_Occupants_At_Address: r.occupant_count || 1,
              Risk_Level: r.risk_level || "HIGH",
              Flag_Details: r.details
            });
          });
        } else {
          formattedRows.push({
            County: countyName,
            Voter_ID: r.id || r.voter_id,
            Full_Name: r.name,
            First_Name: r.first_name || '',
            Middle_Name: r.middle_name || '',
            Last_Name: r.last_name || '',
            Suffix: r.suffix || '',
            Address: r.address,
            City: r.city || (r.raw ? extractActualCityName(r.raw) : ''),
            State: r.state || stateCode,
            Zip: r.zip,
            Total_Occupants_At_Address: r.occupant_count || 1,
            Risk_Level: r.risk_level || "HIGH",
            Flag_Details: r.details
          });
        }
      });

      downloadCSV(formattedRows, `${safeName}_${selectedCounty ? selectedCounty + '_' : ''}${formattedRows.length}_voter_records.csv`);
    } else {
      const rows = [{
        County: jurisdiction,
        Voter_ID: "MS-104920",
        Name: "Audit Passed",
        Address: "No Anomalies Flagged",
        City: "Jackson",
        State: stateCode || "MS",
        Zip: "39201",
        Total_Occupants_At_Address: 0,
        Risk_Level: "LOW",
        Flag_Details: "0 records flagged by this audit rule"
      }];
      downloadCSV(rows, `${safeName}_summary.csv`);
    }
  };

  const downloadFullAuditPackage = async () => {
    const activeGroup = localStorage.getItem("marigold_active_group") || "default";
    const dateStr = new Date().toISOString().split("T")[0];
    
    // Export complete master CSV containing all playbooks unclipped
    const allExportRows: any[] = [];
    playbooks.forEach(p => {
      const pRows = anomalyRecords[p.id] || [];
      pRows.forEach(r => {
        const countyName = getRowCounty(r);
        if (r.residentCluster && r.residentCluster.length > 0) {
          r.residentCluster.forEach((resident: any) => {
            allExportRows.push({
              County: countyName,
              Playbook_Rule: p.name,
              Risk_Level: r.risk_level || "HIGH",
              Voter_ID: resident.id || r.id || r.voter_id,
              Full_Name: resident.name || r.name,
              First_Name: resident.first_name || r.first_name || '',
              Middle_Name: resident.middle_name || r.middle_name || '',
              Last_Name: resident.last_name || r.last_name || '',
              Suffix: resident.suffix || r.suffix || '',
              Address: r.address,
              City: resident.city || r.city || "Jackson",
              State: resident.state || r.state || stateCode,
              Zip: resident.zip || r.zip,
              Occupants_At_Address: r.occupant_count || 1,
              Details: r.details
            });
          });
        } else {
          allExportRows.push({
            County: countyName,
            Playbook_Rule: p.name,
            Risk_Level: r.risk_level || "HIGH",
            Voter_ID: r.id || r.voter_id,
            Full_Name: r.name,
            First_Name: r.first_name || '',
            Middle_Name: r.middle_name || '',
            Last_Name: r.last_name || '',
            Suffix: r.suffix || '',
            Address: r.address,
            City: r.city || "Jackson",
            State: r.state || r.state || stateCode,
            Zip: r.zip,
            Occupants_At_Address: r.occupant_count || 1,
            Details: r.details
          });
        }
      });
    });

    if (allExportRows.length > 0) {
      downloadCSV(allExportRows, `Marigold_360_Audit_${selectedCounty ? selectedCounty + '_' : ''}${allExportRows.length}_voter_records_${dateStr}.csv`);
    }

    const reportContent = `# Marigold 360° Forensic Audit Summary Report

JURISDICTION GROUP: ${activeGroup}
COUNTY FILTER: ${selectedCounty || "All Counties (Statewide)"}
AUDIT DATE: ${new Date().toLocaleDateString()}
TOTAL RECORDS SCANNED: ${totalRows.toLocaleString()}
TOTAL INDIVIDUAL CITIZEN RECORDS FLAGGED: ${allExportRows.length.toLocaleString()}

----------------------------------------------------------------------
EXECUTIVE SUMMARY OF FINDINGS BY PLAYBOOK:
----------------------------------------------------------------------
${playbooks.map(p => `- ${p.name}: ${(anomalyRecords[p.id] || []).length.toLocaleString()} flagged entries`).join("\n")}

----------------------------------------------------------------------
REPLICATION & VERIFICATION INSTRUCTIONS:
----------------------------------------------------------------------
1. Open Marigold Insights (https://marigoldinsights.org/comprehensive-audit).
2. Select your local voter roll file for ${activeGroup}.
3. Filter by County: "${selectedCounty || 'Statewide'}".
4. Click "Run 360° Audit".
5. Compare the resulting counts against the exported CSV files.
`;

    try {
      const { getDirectoryHandle, writeStructuredFile } = await import("@/lib/fs/LocalFSManager");
      const rootHandle = await getDirectoryHandle(activeGroup.toLowerCase());
      if (rootHandle) {
        await writeStructuredFile(rootHandle, "Data_Stories", `AUDIT_REPORT_${dateStr}.md`, reportContent);
      }
    } catch (e) {
      console.warn("Could not auto-write to Data_Stories folder:", e);
    }
  };

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
    const isDemo = isDemoGroupActive();
    const isLoaded = isConnected || isDemo;
    setIsDataLoaded(isLoaded);

    if (isLoaded) {
      const activeGrp = localStorage.getItem("marigold_active_group") || "default";
      import('@/lib/services/MarigoldDataEngineService').then(({ MarigoldDataEngineService }) => {
        MarigoldDataEngineService.getPersistentAuditMap(activeGrp).then(cached => {
          if (cached && cached.anomalyRecords) {
            setAnomalyRecords(cached.anomalyRecords);
            setIsAuditComplete(true);
            setLastAuditTime(cached.timestamp);
            
            const currentSignature = localStorage.getItem("marigold_dataset_signature");
            if (currentSignature && cached.datasetSignature === currentSignature) {
              setIsUpToDate(true);
            } else {
              setIsUpToDate(false);
            }

            setPlaybooks(prev => prev.map(pb => ({
              ...pb,
              status: "complete" as const,
              flaggedCount: (cached.anomalyRecords[pb.id] || []).length
            })));
          }
        });
      });

      const loadInitialStats = async () => {
        try {
          // USE DIRECT TOTAL ROW COUNT TO FIX MISMATCH
          const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
          let directCount = await MarigoldDataEngineService.getTotalRowCount(activeGrp);
          
          if (directCount === 0 && isDemo) {
            await autoLoadSyntheticDemoDataset();
            directCount = await MarigoldDataEngineService.getTotalRowCount(activeGrp);
          }
          setTotalRows(directCount);
          
          // Fallback just for state code mapping
          let res = await runQuery("", [], 1);
          if (res.rows.length > 0) {
            const row = res.rows[0];
            const st = row.state || "MS";
            const cnty = row.county || (isDemo ? "Roosevelt Statewide" : "Mississippi Statewide");
            setStateCode(st);
            setJurisdiction(`${cnty}, ${st}`);
          } else {
            setJurisdiction(isDemo ? "Roosevelt Statewide (Demo)" : "Mississippi Statewide");
          }
        } catch (err) {
          console.error("Failed to query initial audit stats", err);
        }
      };
      loadInitialStats();
    }
  }, [runQuery, loadAuditCache]);

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
    
    if (totalRows === 0 && isDemoGroupActive()) {
      await autoLoadSyntheticDemoDataset();
      const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
      const directCount = await MarigoldDataEngineService.getTotalRowCount();
      setTotalRows(directCount);
    }

    try {
      const sweepMap = await runAllPlaybooksSweep(selectedCounty);
      
      const updatedPlaybooks = playbooks.map(pb => ({
        ...pb,
        status: "complete" as const,
        flaggedCount: (sweepMap[pb.id] || []).length
      }));

      setPlaybooks(updatedPlaybooks);
      setAnomalyRecords(sweepMap);
      setLastAuditTime(new Date().toISOString());
      setIsUpToDate(true); // Since we just ran it, it's definitely up to date

    } catch (err) {
      console.error("360 Sweep failed:", err);
    } finally {
      setIsRunningSweep(false);
      setIsAuditComplete(true);
    }
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4 font-sans">
      <PageHeader
        badge="360º Comprehensive Audit"
        title="Jurisdiction Forensic Sweep"
        description={`Active Jurisdiction: ${jurisdiction} (${totalRows.toLocaleString()} total citizen records locked in RAM)`}
      />

      {/* Audit Action Banner & County Filter */}
      <Card className="bg-white p-6 rounded-2xl border border-border-soft shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-text-header mb-1">Automated Forensic Audit</h2>
            <p className="text-xs text-text-body">
              Execute all 7 civic verification playbooks simultaneously against {totalRows.toLocaleString()} citizen records.
              {lastAuditTime && (
                <span className="block mt-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 inline-block">
                  ✓ Group Audit Cache available from {new Date(lastAuditTime).toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={downloadFullAuditPackage}
              variant="outline"
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-700 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Audit</span>
            </Button>

            {!isUpToDate ? (
              <Button
                type="button"
                onClick={runSweep}
                disabled={isRunningSweep}
                className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRunningSweep ? 'animate-spin' : ''}`} />
                <span>{isRunningSweep ? "Scanning All Rules..." : "Force Fresh Sweep (~30s)"}</span>
              </Button>
            ) : (
              <span className="flex items-center gap-2 text-emerald-800 font-bold text-xs px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Everything is up to date with the most current version.
              </span>
            )}
          </div>
        </div>

        {/* County Filter Control */}
        <div className="pt-3 border-t border-border-soft flex items-center gap-3">
          <span className="text-xs font-bold text-text-header shrink-0">Filter Audit by County:</span>
          <input
            type="text"
            placeholder="Type county name (e.g. Hinds, Harrison, DeSoto)..."
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border-soft bg-surface text-xs text-text-header outline-none focus:border-primary w-64"
          />
          {selectedCounty && (
            <button
              type="button"
              onClick={() => setSelectedCounty("")}
              className="text-xs font-bold text-primary underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      </Card>

      {/* Live Audit Progress Visibility Banner */}
      {isRunningSweep && (
        <Card className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
              <span>Executing Single-Pass 360° Forensic Audit</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-950">
              {queryProgress}% Complete
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-serif font-black text-emerald-950">
              Scanning: All 7 Forensic Playbooks Simultaneously...
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Evaluating {totalRows.toLocaleString()} citizen records locally in browser memory. Please keep this tab open.
            </p>
          </div>

          <div className="w-full bg-emerald-200/80 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, queryProgress)}%` }}
            />
          </div>
        </Card>
      )}

      {/* 360º Visual Health Dashboard & Executive Export Header */}
      <ExecutiveBriefingExport
        jurisdictionName={jurisdiction}
        stateCode={stateCode}
        totalRecordsScanned={totalRows}
        cleanlinessPercentage={totalRows > 0 ? Number((Math.max(0, totalRows - playbooks.reduce((acc, pb) => acc + pb.flaggedCount, 0)) / totalRows * 100).toFixed(1)) : 100}
        executionTimestamp={new Date().toISOString()}
        auditorName={auditorName}
        isAuditComplete={isAuditComplete}
        playbookResults={playbooks.map(pb => ({ 
          ...pb, 
          status: pb.flaggedCount > 0 ? "Action Recommended" : "Clean" 
        })) as any}
      />

      {/* Forensic Playbooks List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-serif text-text-header font-bold">Forensic Playbooks</h2>

        <Card className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
          <div className="divide-y divide-border-soft">
            {playbooks.map((pb) => {
              const recs = anomalyRecords[pb.id] || [];
              const statusLabel = pb.flaggedCount > 0 ? "Action Recommended" : "Clean";
              return (
                <div 
                  key={pb.id} 
                  className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-surface transition-colors cursor-pointer ${pb.status === 'running' ? 'bg-surface' : ''}`}
                  onClick={() => setSelectedDrilldown({ playbook: pb, records: recs })}
                >
                  <div className="flex-1 pr-8 mb-4 lg:mb-0">
                    <h3 className="font-bold text-base text-text-header">{pb.name}</h3>
                    <p className="text-sm text-text-body leading-relaxed">{pb.description}</p>
                  </div>

                  <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border-soft">
                    <div className="text-right">
                      <div className="text-xs font-bold text-text-body uppercase tracking-wider mb-1">Status</div>
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${pb.status === 'complete' ? 'bg-emerald-100 text-emerald-900' : pb.status === 'running' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                        {pb.flaggedCount > 0 ? `${pb.flaggedCount.toLocaleString()} Anomalies` : pb.status === 'complete' ? 'Clean' : 'Ready'}
                      </span>
                    </div>

                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDrilldown({ playbook: pb, records: recs });
                      }}
                      variant="outline"
                      className="px-5 py-2.5 rounded-full shadow-sm text-sm flex items-center gap-2 shrink-0"
                    >
                      <span>Explore Playbook</span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Drilldown Modal */}
      {selectedDrilldown && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-border-soft">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <div>
                <h3 className="text-xl font-serif font-bold text-text-header">{selectedDrilldown.playbook.name}</h3>
                <p className="text-xs text-text-body">{selectedDrilldown.playbook.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrilldown(null)}
                className="text-text-body hover:text-text-header font-bold text-sm p-1 rounded-lg hover:bg-surface"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border-soft">
              <p className="text-xs font-bold text-text-header">
                Total Flagged Entries: {selectedDrilldown.records.length.toLocaleString()}
              </p>
              <Button
                type="button"
                onClick={() => downloadPlaybookCSV(selectedDrilldown.playbook)}
                variant="outline"
                className="text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Playbook
              </Button>
            </div>

            <div className="space-y-2">
              {selectedDrilldown.records.slice(0, 100).map((r, idx) => (
                <div key={idx} className="p-3 bg-white border border-border-soft rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-text-header">
                    <span>{r.name || r.Full_Name || "Resident"} ({r.id || r.voter_id || "VOTER-ID"})</span>
                    <span className="text-primary font-mono">{getRowCounty(r)}</span>
                  </div>
                  <p className="text-text-body">{r.address}, {r.city || "Jackson"}, {r.state || stateCode} {r.zip}</p>
                  {r.details && <p className="text-emerald-800 font-medium">{r.details}</p>}
                </div>
              ))}
              {selectedDrilldown.records.length > 100 && (
                <p className="text-xs text-center text-text-body pt-2 italic">
                  Showing first 100 preview entries on screen. Click 'Export Playbook' to download all {selectedDrilldown.records.length.toLocaleString()} voter records.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
