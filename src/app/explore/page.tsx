"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDataQuery } from "@/hooks/useDataQuery";
import { useGroupSync } from "@/hooks/useGroupSync";
import { useKanban } from "@/lib/workspace/KanbanContext";
import { usePlaybooks } from "@/lib/workspace/PlaybookContext";
import { isDemoGroupActive, autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";
import { Filter, Download, ArrowRight, Shield, ShieldAlert, X, Activity, Database, Bot, ChevronDown, ChevronUp, Lock, BarChart3, AlertCircle, RefreshCw, CheckCircle2, BookmarkPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useExportManager } from "@/hooks/useExportManager";
import { DataRequiredState } from "@/components/DataRequiredState";
import { ExploreDataPanel } from "@/components/ExploreDataPanel";
import { FilterControl } from "@/components/ui/FilterControl";
import { ExecutiveBriefingExport } from "@/components/ExecutiveBriefingExport";

interface PlaybookStatus {
  id: string;
  name: string;
  desc: string;
  description: string;
  flaggedCount: number;
  status: "pending" | "running" | "complete" | "error";
  totalScanned: number;
  audit_type: string;
  icon: React.ReactNode;
}

export default function ExplorePage() {
  const [viewMode, setViewMode] = useState<'360_overview' | 'playbook_drilldown'>('360_overview');
  
  const { runAllPlaybooksSweep, runLocalAudit, query: runQuery, queryProgress, isQuerying } = useDataQuery();
  const { publishAuditCache, loadAuditCache } = useGroupSync();
  const { addTask, addNoteToTask, setSelectedTicketId } = useKanban();
  const { addPlaybook } = usePlaybooks();

  const [verboseMode, setVerboseMode] = useState(false);
  const { requestExport } = useExportManager();
  const [results, setResults] = useState<any[]>([]);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  
  const [countyFilter, setCountyFilter] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');

  const [needsZkProceed, setNeedsZkProceed] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  // Playbook Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newPbName, setNewPbName] = useState('');
  const [newPbDesc, setNewPbDesc] = useState('');

  // 360 Audit State
  const [auditorName, setAuditorName] = useState("Local Auditor");
  const [totalRows, setTotalRows] = useState(0);
  const [stateCode, setStateCode] = useState("MS");
  const [jurisdiction, setJurisdiction] = useState("Statewide");
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [isAuditComplete, setIsAuditComplete] = useState(false);
  const [anomalyRecords, setAnomalyRecords] = useState<Record<string, any[]>>({});
  const [lastAuditTime, setLastAuditTime] = useState<string | null>(null);
  const [isUpToDate, setIsUpToDate] = useState(false);
  
  const GROUP_MANIFEST = ["Mississippi_July_2026", "Mari_Research_V1"];
  const [userLocalDatasets, setUserLocalDatasets] = useState<string[]>(["Mississippi_July_2026", "Mari_Research_V1"]);
  const isGroupSynced = GROUP_MANIFEST.every(requiredDataset => userLocalDatasets.includes(requiredDataset));

  const [playbooks, setPlaybooks] = useState<PlaybookStatus[]>([
    { id: "density", name: "High-Density Residential Occupancy", desc: "Identify 12+ voters at single address", description: "Flags single residential street addresses or apartments containing more than 8 active registered voters. Isolates multi-family dorms, fraternity houses, or outdated residential registrations.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "density", icon: <Shield className="w-5 h-5 text-red-500" /> },
    { id: "missing-dorm", name: "Missing Dorm / Unit #", desc: "Campus housing lacking unit numbers", description: "Identifies addresses that appear to be multi-family or campus housing but lack specific unit numbers.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "missing-dorm", icon: <Activity className="w-5 h-5 text-purple-500" /> },
    { id: "out-of-state-mailing", name: "NCOA Interstate Out-of-State Relocations", desc: "Voter residing out of state via mail", description: "Cross-checks active registration addresses against official USPS National Change of Address (NCOA) forwardings where voters moved permanently out of state.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "out-of-state-mailing", icon: <Activity className="w-5 h-5 text-blue-700" /> },
    { id: "po-box", name: "Commercial & P.O. Box Disguises", desc: "PO Box in physical address field", description: "Identifies active voter registrations explicitly listing a commercial UPS Store, FedEx facility, or United States Post Office box as a physical residential domicile.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "po-box", icon: <ShieldAlert className="w-5 h-5 text-orange-500" /> },
    { id: "typo-names", name: "Clerical Typo Check", desc: "1-character first or last names", description: "Finds names with 1-character that are likely typos or test data.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "typo-names", icon: <Activity className="w-5 h-5 text-blue-500" /> },
    { id: "duplicates", name: "Intra-County Exact Name & Zip Duplicates", desc: "Same name & zip at different addresses", description: "Scans the entire jurisdiction for identical First Name, Last Name, and Zip Code pairings registered simultaneously at different physical addresses.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "duplicates", icon: <ShieldAlert className="w-5 h-5 text-yellow-500" /> },
    { id: "commercial", name: "Commercial Disguises", desc: "UPS Stores / commercial PMBs", description: "Identifies UPS Stores or commercial buildings disguised as residential.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "commercial", icon: <Shield className="w-5 h-5 text-gray-500" /> },
    { id: "spikes", name: "Single-Day Registration Volume Spikes", desc: "Massive single-day volume spikes", description: "Detects statistical anomalies where an abnormally large, synchronized batch of voter registrations occurred on exactly the same day.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "spikes", icon: <Activity className="w-5 h-5 text-cyan-500" /> },
    { id: "phantom-precincts", name: "Phantom Precincts & Unassigned Voters", desc: "Active voters missing precinct codes", description: "Isolates active voter records that are entirely missing a mandatory voting precinct code assignment in the underlying database.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "phantom-precincts", icon: <ShieldAlert className="w-5 h-5 text-red-700" /> },
    { id: "benfords-law", name: "Benford's Law Regression (Fabrication Test)", desc: "Mathematical test for fabrication", description: "Analyzes the leading digit distribution of all street addresses against the logarithmic Benford Curve to detect mathematically probable data fabrication or automated generation.", flaggedCount: 0, status: "pending", totalScanned: 0, audit_type: "benfords-law", icon: <Activity className="w-5 h-5 text-indigo-500" /> },
  ]);

  useEffect(() => {
    setIsMounted(true);
    const hasProceeded = sessionStorage.getItem("marigold_zk_proceeded") === "true";
    if (hasProceeded) setNeedsZkProceed(false);

    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("marigold_display_name");
      if (savedName) setAuditorName(savedName);

      const group = localStorage.getItem("marigold_active_group") || "";
      const isConnected = localStorage.getItem("marigold_file_connected") === "true";
      const isDemo = group.toLowerCase().includes("demo") || group.toLowerCase().includes("sandbox");
      if (isConnected || (isDemo && localStorage.getItem("marigold_file_name")?.toUpperCase().includes("DEMO"))) {
        setIsDataLoaded(true);
      } else {
        setIsDataLoaded(false);
      }
      
      const searchParams = new URLSearchParams(window.location.search);
      const pbParam = searchParams.get('playbook');
      const autoRun = searchParams.get('autoRun') === 'true';

      if (pbParam) {
        setViewMode('playbook_drilldown');
        setVerboseMode(true);
        setTimeout(() => {
          runPlaybook(pbParam);
          document.getElementById('audit-results-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else if (autoRun) {
        setViewMode('360_overview');
      }
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
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
          const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
          let directCount = await MarigoldDataEngineService.getTotalRowCount(activeGrp);
          
          if (directCount === 0 && isDemoGroupActive()) {
            await autoLoadSyntheticDemoDataset();
            directCount = await MarigoldDataEngineService.getTotalRowCount(activeGrp);
          }
          setTotalRows(directCount);
          
          let res = await runQuery("", [], 1);
          if (res.rows.length > 0) {
            const row = res.rows[0];
            const st = row.state || "MS";
            setStateCode(st);
            setJurisdiction("Statewide");
          } else {
            setJurisdiction(isDemoGroupActive() ? "Statewide (Demo)" : "Statewide");
          }
        } catch (err) {
          console.error("Failed to query initial audit stats", err);
        }
      };
      loadInitialStats();
    }
  }, [isDataLoaded, runQuery, loadAuditCache]);

  const runSweep = async () => {
    setIsRunningSweep(true);
    setIsAuditComplete(false);
    setAnomalyRecords({});
    
    if (totalRows === 0 && isDemoGroupActive()) {
      await autoLoadSyntheticDemoDataset();
      const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
      const directCount = await MarigoldDataEngineService.getTotalRowCount();
      setTotalRows(directCount);
    }

    try {
      const sweepMap = await runAllPlaybooksSweep(countyFilter);
      
      const updatedPlaybooks = playbooks.map(pb => ({
        ...pb,
        status: "complete" as const,
        flaggedCount: (sweepMap[pb.id] || []).length
      }));

      setPlaybooks(updatedPlaybooks);
      setAnomalyRecords(sweepMap);
      setLastAuditTime(new Date().toISOString());
      setIsUpToDate(true); 

    } catch (err) {
      console.error("360 Sweep failed:", err);
    } finally {
      setIsRunningSweep(false);
      setIsAuditComplete(true);
    }
  };

  const handleZkProceed = () => {
    sessionStorage.setItem("marigold_zk_proceeded", "true");
    setNeedsZkProceed(false);
  };
  
  const runPlaybook = async (id: string, overrideCounty?: string, overrideThreshold?: number) => {
    if (!isDataLoaded) {
      setAuditError("Please connect a dataset or load the Demo file before running playbooks.");
      return;
    }

    setViewMode('playbook_drilldown');
    setAuditError(null);
    setActivePlaybook(id);
    setSelectedRecord(null);
    const finalCounty = overrideCounty !== undefined ? overrideCounty : countyFilter;
    const finalThreshold = overrideThreshold !== undefined ? overrideThreshold : thresholdFilter;
    
    try {
      const data = await runLocalAudit(id, finalCounty, finalThreshold);
      setResults(data);
    } catch (e) {
      console.error(e);
      setAuditError("Error running audit. Make sure your data file is correctly mapped and connected.");
    }
  };

  const filteredResults = results.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (row.name && row.name.toLowerCase().includes(q)) ||
      (row.id && String(row.id).toLowerCase().includes(q)) ||
      (row.address && row.address.toLowerCase().includes(q)) ||
      (row.county && row.county.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    if (filteredResults.length === 0) return;
    
    const activePlaybookInfo = playbooks.find(p => p.id === activePlaybook);

    requestExport({
      contextType: "PLAYBOOK_DRILLDOWN",
      title: activePlaybookInfo ? `${activePlaybookInfo.name} Matches` : "Playbook Drilldown",
      description: `Exporting matches for playbook: ${activePlaybookInfo?.name || activePlaybook}. Contains ${filteredResults.length} flagged records.`,
      data: filteredResults.map(r => ({
        "Voter ID": r.id || r.voter_id,
        "First Name": r.first_name || "",
        "Middle Name": r.middle_name || "",
        "Last Name": r.last_name || "",
        "Address": r.address,
        "City": r.city,
        "State": r.state,
        "Zip": r.zip,
        "County": r.county,
        "Risk Level": r.risk_level,
        "Anomaly Details": r.details,
        "Investigator Notes": ""
      })),
      insights: activePlaybookInfo?.description || "A focused extraction of anomalies found by the active playbook rule."
    });
  };

  const downloadFullAuditPackage = () => {
    if (Object.keys(anomalyRecords).length === 0) return;
    
    requestExport({
      contextType: "FULL_AUDIT",
      title: `${jurisdiction} Full Forensic Audit`,
      description: `Complete export of all anomalies detected in the ${jurisdiction} sweep.`,
      data: Object.values(anomalyRecords).flat().map(r => ({
        "Voter ID": r.id || r.voter_id,
        "First Name": r.first_name || "",
        "Middle Name": r.middle_name || "",
        "Last Name": r.last_name || "",
        "Address": r.address,
        "City": r.city,
        "State": r.state,
        "Zip": r.zip,
        "County": r.county,
        "Risk Level": r.risk_level,
        "Anomaly Details": r.details
      })),
      insights: "Full export across all forensic playbooks."
    });
  };

  const handlePublishDataStory = async () => {
    try {
      const { generateWorkspaceKey, encryptPayload } = await import("@/lib/crypto/LocalKeyManager");
      const { getDirectoryHandle, writeStructuredFile } = await import("@/lib/fs/LocalFSManager");
      const { pushBlobToRelay } = await import("@/lib/relay/clientRelay");
      
      const key = await generateWorkspaceKey();
      const now = new Date();
      const dateStr = now.toISOString().replace(/T/, '_').replace(/:/g, '').split('.')[0];
      const filename = `data-story-${dateStr}.json`;

      const rawStory = JSON.stringify({
        activePlaybook,
        resultsCount: filteredResults.length,
        timestamp: Date.now()
      }, null, 2);
      
      const { ciphertextHex, ivHex } = await encryptPayload(rawStory, key);

      const payload = {
        ciphertext: ciphertextHex,
        iv: ivHex,
        type: "DATA_STORY_SNAPSHOT",
        filename,
        piiRemoved: true
      };
      
      const grp = localStorage.getItem("marigold_active_group") || "default";

      const dirHandle = await getDirectoryHandle(grp.toLowerCase());
      if (dirHandle) {
        await writeStructuredFile(dirHandle, "Data_Stories", filename, JSON.stringify(payload, null, 2));
      }

      await pushBlobToRelay(grp, payload);
      
      setPublishStatus(`Data Story saved to Marigold_Local/Data_Stories/${filename}!`);
      setTimeout(() => setPublishStatus(null), 4500);
    } catch (e) {
      setPublishStatus("Published to local session.");
      setTimeout(() => setPublishStatus(null), 4000);
    }
  };

  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 min-h-screen bg-background">
        <div className="h-10 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  if (needsZkProceed) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background font-sans p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-[24px] border border-border shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-serif text-text-header mb-4">Secure Local Connection</h2>
          <p className="text-sm text-text-body mb-8 leading-relaxed">
            Marigold is creating a secure connection and utilizing the knowledge stored in your computer's files. Marigold is limited to accessing only those files for which you've granted permission and complies with strict data privacy standards.
          </p>
          <Button onClick={handleZkProceed} data-testid="btn-proceed-securely" className="w-full py-4 text-lg font-bold">
            Proceed Securely
          </Button>
        </div>
      </div>
    );
  }

  if (!isDataLoaded) {
    return (
      <DataRequiredState 
        title="No Data Connected" 
        subtitle="You cannot explore or review data because your local files are not linked to Marigold. Please connect a file to proceed." 
      />
    );
  }

  return (
    <div className="relative h-full overflow-hidden flex flex-col bg-background">
      {!isGroupSynced && (
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex items-start gap-3 z-20 shadow-sm shrink-0">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-blue-900">Personal Mode Active</h3>
            <p className="text-sm text-blue-800 mt-1">
              You are currently working in Personal Mode. Any insights you generate will not be shared with the group unless you explicitly choose to publish an anonymous snapshot.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-8 pt-6 pb-2 bg-white z-10 border-b border-border-soft shrink-0">
        <PageHeader
          title={viewMode === '360_overview' ? "Jurisdiction Forensic Sweep" : "Explore Playbook"}
          subtitle={viewMode === '360_overview' ? `Active Jurisdiction: ${jurisdiction} (${totalRows.toLocaleString()} citizen records locked in RAM)` : "Discover anomalies and drill down."}
          actions={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r border-border-soft pr-4 mr-2">
                <Database className="w-4 h-4 text-text-body" />
                <FilterControl
                  label=""
                  value={JSON.stringify(userLocalDatasets)}
                  onChange={(val) => setUserLocalDatasets(JSON.parse(val))}
                  options={[
                    { value: JSON.stringify(["Mississippi_July_2026", "Mari_Research_V1"]), label: "Workspace: Group Collaboration" },
                    { value: JSON.stringify(["Mississippi_August_2026", "Wyoming_VoterRoll"]), label: "Workspace: Personal Research" },
                  ]}
                  className="text-sm font-bold"
                />
              </div>

              {viewMode === 'playbook_drilldown' && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-bold text-text-body">Verbose Row Mode</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 flex ${verboseMode ? 'bg-primary' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${verboseMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={verboseMode} onChange={(e) => setVerboseMode(e.target.checked)} />
                  </label>
                  
                  <Button 
                    onClick={exportCSV}
                    disabled={filteredResults.length === 0}
                    data-testid="btn-generate-report"
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-bold transition-colors ${
                      filteredResults.length > 0 ? 'bg-white border border-border-soft text-text-header hover:bg-surface shadow-sm' : 'opacity-50 cursor-not-allowed bg-surface border border-transparent'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Export Playbook
                  </Button>

                  <Button 
                    onClick={() => {
                      if (filteredResults.length === 0) return;
                      const activePlaybookInfo = playbooks.find(p => p.id === activePlaybook);
                      const id = `card-${Date.now()}`;
                      addTask({
                        id,
                        status: "Needs Triage",
                        title: activePlaybookInfo ? `${activePlaybookInfo.name} Match` : "Drilldown Anomaly",
                        subtitle: `${filteredResults.length} records flagged under ${countyFilter ? countyFilter + ' county' : 'statewide'} search.`,
                        tag: activePlaybookInfo?.name || "Anomaly",
                        tagColor: "text-amber-700",
                        tagBg: "bg-amber-100",
                        icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
                        iconColor: "text-amber-500",
                        borderColor: "border-l-amber-500",
                        meta: "Just now",
                        assignee: "Unassigned",
                        notes: [],
                        attachedRecordIds: filteredResults.map(r => r.id || r.voter_id),
                        playbookId: activePlaybook || undefined,
                        countyFilter: countyFilter || undefined
                      });
                      setSelectedTicketId(id);
                    }}
                    disabled={filteredResults.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-[12px] text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Push to Triage
                  </Button>
                </>
              )}

              {viewMode === '360_overview' && (
                <Button
                  onClick={downloadFullAuditPackage}
                  variant="outline"
                  className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-700 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Full Audit</span>
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 relative min-h-0">
          
          <div className="max-w-6xl mx-auto">
            {/* Filter Toolbar */}
            <div className="bg-white border border-border-soft p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
                <div className="flex flex-col w-full md:w-64">
                  <label className="text-xs font-bold text-text-body mb-1">Target County</label>
                  <input type="text" placeholder="e.g. Franklin (or Statewide)" className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)} />
                </div>
                <Button onClick={() => {
                  if (activePlaybook) runPlaybook(activePlaybook);
                  else runSweep();
                }} disabled={isQuerying || isRunningSweep} className="mt-5 bg-surface border border-border-soft hover:border-primary text-text-header font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                  Update Engine
                </Button>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col w-full md:w-72">
                  <label className="text-xs font-bold text-text-body mb-1">Search Records</label>
                  <input 
                    type="text" 
                    placeholder="Search name, ID, county, address..." 
                    className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
                {viewMode === 'playbook_drilldown' && (
                  <Button 
                    onClick={() => setIsWizardOpen(true)}
                    className="mt-5 bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-sm transition-all text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <BookmarkPlus className="w-4 h-4" /> Save as Playbook
                  </Button>
                )}
              </div>
            </div>
          </div>

          {viewMode === '360_overview' ? (
            <div className="space-y-8 max-w-6xl mx-auto">
              
              {/* Audit Action Banner */}
              <Card className="bg-white p-6 rounded-2xl border border-border-soft shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-text-header mb-1">Automated Forensic Audit</h2>
                    <p className="text-xs text-text-body">
                      Execute civic verification playbooks simultaneously against {totalRows.toLocaleString()} citizen records.
                      {lastAuditTime && (
                        <span className="block mt-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 inline-block">
                          ✓ Group Audit Cache available from {new Date(lastAuditTime).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {!isUpToDate ? (
                      <Button
                        type="button"
                        onClick={() => runSweep()}
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
              </Card>

              {/* Progress Banner */}
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
                      Scanning: All Forensic Playbooks Simultaneously...
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

              {/* 360 Overview Visuals */}
              <ExecutiveBriefingExport
                jurisdictionName={jurisdiction}
                stateCode={stateCode}
                totalRecordsScanned={totalRows}
                cleanlinessPercentage={totalRows > 0 ? Number((Math.max(0, totalRows - playbooks.reduce((acc, pb) => acc + pb.flaggedCount, 0)) / totalRows * 100).toFixed(1)) : 100}
                executionTimestamp={new Date().toISOString()}
                auditorName={auditorName}
                isAuditComplete={isAuditComplete}
                anomalyRecords={anomalyRecords}
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
                      return (
                        <div 
                          key={pb.id} 
                          className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-surface transition-colors cursor-pointer ${pb.status === 'running' ? 'bg-surface' : ''}`}
                          onClick={() => runPlaybook(pb.id)}
                        >
                          <div className="flex items-center gap-4 flex-1 pr-8 mb-4 lg:mb-0">
                            <div className="mt-1 bg-surface p-3 rounded-[12px]">{pb.icon}</div>
                            <div>
                              <h3 className="font-bold text-base text-text-header">{pb.name}</h3>
                              <p className="text-sm text-text-body leading-relaxed">{pb.description || pb.desc}</p>
                            </div>
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
                              data-testid={`btn-playbook-${pb.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                runPlaybook(pb.id);
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

            </div>
          ) : (
            <>
              {/* Playbook Drilldown View */}
              <div className="mb-6 flex items-center gap-4">
                <Button onClick={() => setViewMode('360_overview')} variant="outline" className="flex items-center gap-2 text-text-body text-sm font-bold bg-white cursor-pointer hover:bg-surface">
                  ← Back to 360º Audit
                </Button>
                {activePlaybook && (
                  <h2 className="text-xl font-serif font-bold text-text-header">
                    {playbooks.find(p => p.id === activePlaybook)?.name}
                  </h2>
                )}
              </div>

              {/* Filter Toolbar moved to top of container */}

              {/* Results Area */}
              <Card id="audit-results-panel" className="bg-white border border-border-soft rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                {isQuerying ? (
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <Activity className="w-8 h-8 text-primary animate-pulse mb-4" />
                    <p className="text-sm text-text-body font-mono">Running Local Query Engine ({queryProgress}%)...</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="overflow-auto max-h-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface sticky top-0 z-10 border-b border-border-soft">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-body uppercase tracking-wider">Target / Voter</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-body uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Risk Level</th>
                        {verboseMode && <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Anomaly Summary</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {filteredResults.slice(0, verboseMode ? 1000 : 50).map((row, idx) => (
                        <tr key={idx} onClick={() => setSelectedRecord(row)} className="hover:bg-surface cursor-pointer transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-1">
                              {row.occupant_count > 1 ? (
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Address</span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Voter</span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-text-header">
                              {row.occupant_count > 1 ? row.address : row.name}
                            </div>
                            {verboseMode && <div className="text-xs font-mono text-text-body mt-1">{row.id}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-text-header">
                              {row.occupant_count > 1 ? `${row.occupant_count} Residents` : row.address}
                            </div>
                            <div className="text-xs text-text-body mt-1">{row.city}, {row.state} {row.zip}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${row.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {row.risk_level}
                            </span>
                          </td>
                          {verboseMode && <td className="px-6 py-4"><p className="text-xs text-text-body line-clamp-2 max-w-xs">{row.details}</p></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px]">
                    <Database className="w-8 h-8 text-border-soft mb-4" />
                    <h3 className="text-sm font-bold text-text-header mb-1">Local Database Connected</h3>
                    <p className="text-sm text-text-body">Run this playbook to query against your local files.</p>
                  </div>
                )}
              </Card>
            </>
          )}

        </div>
        
        {viewMode === 'playbook_drilldown' && (
          <div className="absolute right-0 top-0 h-full z-50">
            <ExploreDataPanel
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              isGroupSynced={isGroupSynced}
              handlePublishDataStory={handlePublishDataStory}
              addTask={addTask}
              addNoteToTask={addNoteToTask}
              activePlaybook={activePlaybook}
              playbooks={playbooks as any}
              verboseMode={verboseMode}
            />
          </div>
        )}
      </div>

      {/* Playbook Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">✨ Save as Custom Playbook</h3>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2 mb-4">
                <Filter className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  You are saving your current filters (Target County: {countyFilter || "Statewide"}, Base Playbook: {activePlaybook}) into a repeatable, 1-click playbook.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Playbook Name</label>
                <input 
                  type="text" 
                  value={newPbName}
                  onChange={(e) => setNewPbName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Dormitory Anomaly Scanner"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description / Goal</label>
                <textarea 
                  value={newPbDesc}
                  onChange={(e) => setNewPbDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm h-24 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Describe what this playbook aims to find..."
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
                      desc: newPbDesc.slice(0, 50) + (newPbDesc.length > 50 ? '...' : ''),
                      description: newPbDesc,
                      audit_type: activePlaybook || 'custom',
                      county: countyFilter || undefined,
                      promotedGroups: []
                    });
                    setIsWizardOpen(false);
                    setNewPbName('');
                    setNewPbDesc('');
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
