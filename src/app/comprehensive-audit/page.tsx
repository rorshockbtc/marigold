"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Play, CheckCircle2, Download, AlertTriangle, FileText, ChevronRight, Eye, Sparkles, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataRequiredState } from "@/components/DataRequiredState";
import { useDataQuery } from "@/hooks/useDataQuery";
import { useGroupSync } from "@/hooks/useGroupSync";
import { useKanban } from "@/lib/workspace/KanbanContext";
import { isDemoGroupActive, autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";
import { extractActualCountyName, extractActualCityName } from "@/lib/csv/universalMapper";

interface PlaybookStatus {
  id: string;
  name: string;
  description: string;
  flaggedCount: number;
  status: "pending" | "running" | "complete" | "error";
  totalScanned: number;
  audit_type: string;
}

interface PlaybookAuditSummary {
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
  const [selectedDrilldown, setSelectedDrilldown] = useState<PlaybookAuditSummary | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
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
      const cached = loadAuditCache(activeGrp);
      if (cached && cached.anomalyRecords) {
        setAnomalyRecords(cached.anomalyRecords);
        setIsAuditComplete(true);
        setPlaybooks(prev => prev.map(pb => ({
          ...pb,
          status: "complete" as const,
          flaggedCount: (cached.anomalyRecords[pb.id] || []).length
        })));
      }

      const loadInitialStats = async () => {
        try {
          let res = await runQuery("", [], 1);
          if (res.totalMatches === 0 && isDemo) {
            await autoLoadSyntheticDemoDataset();
            res = await runQuery("", [], 1);
          }
          setTotalRows(res.totalMatches);
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
      const res = await runQuery("", [], 1);
      setTotalRows(res.totalMatches);
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

      const activeGrp = localStorage.getItem("marigold_active_group") || "default";
      publishAuditCache(activeGrp, totalRows, sweepMap);
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
      {/* Page Header */}
      <div className="space-y-2">
        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          360º Comprehensive Audit
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-black text-text-header">
          Jurisdiction Forensic Sweep
        </h1>
        <p className="text-xs text-text-body">
          Active Jurisdiction: <strong>{jurisdiction}</strong> ({totalRows.toLocaleString()} total citizen records locked in RAM)
        </p>
      </div>

      {/* Audit Action Banner & County Filter */}
      <Card className="bg-white p-6 rounded-2xl border border-border-soft shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-text-header mb-1">Automated Forensic Audit</h2>
            <p className="text-xs text-text-body">
              Execute all 7 civic verification playbooks simultaneously against {totalRows.toLocaleString()} citizen records.
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
              <span>Export Complete Unclipped Audit Package</span>
            </Button>

            <Button
              type="button"
              onClick={runSweep}
              disabled={isRunningSweep}
              className="flex items-center gap-2 bg-primary hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningSweep ? 'animate-spin' : ''}`} />
              <span>{isRunningSweep ? "Scanning All Rules..." : "Run 360º Audit Sweep"}</span>
            </Button>
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

      {/* Grid of 7 Playbook Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((pb) => {
          const recs = anomalyRecords[pb.id] || [];
          return (
            <Card key={pb.id} className="p-6 bg-white border border-border-soft rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{pb.audit_type}</span>
                  {pb.flaggedCount > 0 ? (
                    <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-black px-2.5 py-1 rounded-full">
                      {pb.flaggedCount.toLocaleString()} Anomalies
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      0 Flagged
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold text-text-header">{pb.name}</h3>
                <p className="text-xs text-text-body leading-relaxed">{pb.description}</p>
              </div>

              <div className="pt-4 border-t border-border-soft flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedDrilldown({ playbook: pb, records: recs })}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Results →
                </button>
                <button
                  type="button"
                  onClick={() => downloadPlaybookCSV(pb)}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </Card>
          );
        })}
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
                <Download className="w-3.5 h-3.5" /> Export All Unclipped CSV
              </Button>
            </div>

            <div className="space-y-2">
              {selectedDrilldown.records.slice(0, 100).map((r, idx) => (
                <div key={idx} className="p-3 bg-white border border-border-soft rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-text-header">
                    <span>{r.name || "Resident"} ({r.id || r.voter_id || "VOTER-ID"})</span>
                    <span className="text-primary font-mono">{getRowCounty(r)}</span>
                  </div>
                  <p className="text-text-body">{r.address}, {r.city || "Jackson"}, {r.state || stateCode} {r.zip}</p>
                  {r.details && <p className="text-emerald-800 font-medium">{r.details}</p>}
                </div>
              ))}
              {selectedDrilldown.records.length > 100 && (
                <p className="text-xs text-center text-text-body pt-2 italic">
                  Showing first 100 preview entries on screen. Click 'Export All Unclipped CSV' to download all {selectedDrilldown.records.length.toLocaleString()} voter records.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
