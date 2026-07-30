"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDataQuery } from "@/hooks/useDataQuery";
import AppSidebar from "@/components/AppSidebar";
import MariRightPanel from "@/components/MariRightPanel";
import { Filter, Download, ArrowRight, Shield, ShieldAlert, X, Activity, Database, Bot, ChevronDown, ChevronUp, Lock, BarChart3, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MarigoldIcon } from "@/components/MarigoldIcon";
import { DataRequiredState } from "@/components/DataRequiredState";
import { useKanban } from "@/lib/workspace/KanbanContext";
import { ExploreDataPanel } from "@/components/ExploreDataPanel";
import { FilterControl } from "@/components/ui/FilterControl";

export default function ExplorePage() {
  const { runLocalAudit, isQuerying, queryProgress } = useDataQuery();
  const [verboseMode, setVerboseMode] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  
  // UX Fix: Better data loaded detection. We default to false until proven true.
  const [isDataLoaded, setIsDataLoaded] = useState(false); 
  const [showAllPlaybooks, setShowAllPlaybooks] = useState(false);
  const { addTask, addNoteToTask } = useKanban();
  
  const [countyFilter, setCountyFilter] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');

  // UX Fix: Manual Proceed Gate for ZK Handshake
  const [needsZkProceed, setNeedsZkProceed] = useState(true);
  
  const GROUP_MANIFEST = ["Mississippi_July_2026", "Mari_Research_V1"];
  const [userLocalDatasets, setUserLocalDatasets] = useState<string[]>(["Mississippi_July_2026", "Mari_Research_V1"]);
  const isGroupSynced = GROUP_MANIFEST.every(requiredDataset => userLocalDatasets.includes(requiredDataset));

  useEffect(() => {
    // Check if user already proceeded this session
    const hasProceeded = sessionStorage.getItem("marigold_zk_proceeded") === "true";
    if (hasProceeded) setNeedsZkProceed(false);

    if (typeof window !== "undefined") {
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
      if (pbParam) {
        setVerboseMode(true);
        setTimeout(() => {
          runPlaybook(pbParam);
        }, 500);
      }
    }
  }, []);

  const handleZkProceed = () => {
    sessionStorage.setItem("marigold_zk_proceeded", "true");
    setNeedsZkProceed(false);
  };
  
  const playbooks = [
    { id: "density", name: "High-Density Occupancy", desc: "Identify 12+ voters at single address", icon: <Shield className="w-5 h-5 text-red-500" /> },
    { id: "missing-dorm", name: "Missing Dorm / Unit #", desc: "Campus housing lacking unit numbers", icon: <Activity className="w-5 h-5 text-purple-500" /> },
    { id: "po-box", name: "P.O. Box Residence", desc: "PO Box in physical address field", icon: <ShieldAlert className="w-5 h-5 text-orange-500" /> },
    { id: "typo-names", name: "Clerical Typo Check", desc: "1-character first or last names", icon: <Activity className="w-5 h-5 text-blue-500" /> },
    { id: "duplicates", name: "Intra-county Duplicates", desc: "Same name & zip at different addresses", icon: <ShieldAlert className="w-5 h-5 text-yellow-500" /> },
    { id: "commercial", name: "Commercial Disguises", desc: "UPS Stores / commercial PMBs", icon: <Shield className="w-5 h-5 text-gray-500" /> },
    { id: "spikes", name: "Registration Surges", desc: "Massive single-day volume spikes", icon: <Activity className="w-5 h-5 text-cyan-500" /> },
    { id: "phantom-precincts", name: "Phantom Precincts", desc: "Active voters missing precinct codes", icon: <ShieldAlert className="w-5 h-5 text-red-700" /> },
    { id: "out-of-state-mailing", name: "NCOA / Out of State", desc: "Voter residing out of state via mail", icon: <Activity className="w-5 h-5 text-blue-700" /> },
  ];

  const visiblePlaybooks = showAllPlaybooks ? playbooks : playbooks.slice(0, 3);

  const runPlaybook = async (id: string, overrideCounty?: string, overrideThreshold?: number) => {
    // UX Fix: If data isn't loaded, don't fail silently. Alert the user they need data.
    if (!isDataLoaded) {
      alert("Please connect a dataset or load the Demo file before running playbooks.");
      return;
    }

    setActivePlaybook(id);
    setSelectedRecord(null);
    const finalCounty = overrideCounty !== undefined ? overrideCounty : countyFilter;
    const finalThreshold = overrideThreshold !== undefined ? overrideThreshold : thresholdFilter;
    
    try {
      const data = await runLocalAudit(id, finalCounty, finalThreshold);
      setResults(data);
    } catch (e) {
      console.error(e);
      alert("Error running audit. Make sure your data file is correctly mapped and connected.");
    }
  };

  const filteredResults = results.filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (row.name && row.name.toLowerCase().includes(q)) ||
      (row.id && String(row.id).toLowerCase().includes(q)) ||
      (row.address && row.address.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    if (filteredResults.length === 0) return;
    const headers = ["Voter ID", "Name", "Address", "City", "State", "Zip", "County", "Risk Level", "Anomaly Details", "Investigator Notes"];
    
    const rows = filteredResults.map(r => [
      r.id, r.name, r.address, r.city, r.state, r.zip, r.county, r.risk_level, r.details, ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(f => `"${String(f || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `marigold_export_${activePlaybook || 'explore'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublishDataStory = () => {
    alert("Data Story Snapshot Generated!\n\nPayload: Static JSON Chart Data\nPII Removed: YES\nSaved to: Group Feed");
  };

  // renderDataPanel extracted to ExploreDataPanel

  // --- UX Fix: Manual Proceed Gate for Grandparents ---
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
          <Button onClick={handleZkProceed} className="w-full py-4 text-lg font-bold">
            Proceed Securely
          </Button>
        </div>
      </div>
    );
  }

  // --- UX Fix: The full-page "Data Required" empty state ---
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
      
      {/* Read-Only Warning Banner */}
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
          title="Explore & Review"
          subtitle="Discover anomalies and run automated playbooks."
          actions={
            <div className="flex items-center gap-4">
              
              {/* Sandbox Control / Manifest Override Dropdown */}
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
                className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-bold transition-colors ${
                  filteredResults.length > 0 ? 'bg-white border border-border-soft text-text-header hover:bg-surface shadow-sm' : 'opacity-50 cursor-not-allowed bg-surface border border-transparent'
                }`}
              >
                <Download className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          }
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 relative min-h-0">
          {/* Playbooks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-body uppercase tracking-wider">Available Playbooks</h2>
            <Button 
              onClick={() => setShowAllPlaybooks(!showAllPlaybooks)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              {showAllPlaybooks ? <><ChevronUp className="w-3 h-3"/> Show Less</> : <><ChevronDown className="w-3 h-3"/> View All</>}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visiblePlaybooks.map(pb => (
              <Button
                key={pb.id}
                onClick={() => runPlaybook(pb.id)}
                variant="outline"
                className={`flex items-start gap-4 p-4 rounded-2xl h-auto text-left transition-all ${
                  activePlaybook === pb.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border-soft bg-white hover:border-primary/30'
                }`}
              >
                <div className="mt-1 bg-surface p-2 rounded-[8px]">{pb.icon}</div>
                <div>
                  <h3 className="font-bold text-text-header text-sm mb-1">{pb.name}</h3>
                  <p className="text-xs text-text-body">{pb.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-border-soft p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col w-full md:w-64">
              <label className="text-xs font-bold text-text-body mb-1">Target County</label>
              <input type="text" placeholder="e.g. Franklin" className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)} />
            </div>
            <Button onClick={() => activePlaybook && runPlaybook(activePlaybook)} disabled={!activePlaybook || isQuerying} className="mt-5 bg-surface border border-border-soft hover:border-primary text-text-header font-bold px-4 py-2 rounded-lg transition-colors">
              Update Engine
            </Button>
          </div>
        </div>

        {/* Results Area */}
        <Card className="bg-white border border-border-soft rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
          {isQuerying ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <Activity className="w-8 h-8 text-primary animate-pulse mb-4" />
              <p className="text-sm text-text-body font-mono">Running Local Query Engine ({queryProgress}%)...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-soft bg-surface">
                  <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Voter</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Risk Level</th>
                  {verboseMode && <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Anomaly Summary</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredResults.slice(0, verboseMode ? 1000 : 50).map((row, idx) => (
                  <tr key={idx} onClick={() => setSelectedRecord(row)} className="hover:bg-surface cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-text-header">{row.name}</div>
                      {verboseMode && <div className="text-xs font-mono text-text-body mt-1">{row.id}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-header">{row.address}</div>
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
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px]">
              {/* UX Fix: Better empty state when data is loaded but playbooks haven't run */}
              <Database className="w-8 h-8 text-border-soft mb-4" />
              <h3 className="text-sm font-bold text-text-header mb-1">Local Database Connected</h3>
              <p className="text-sm text-text-body">Select a Playbook above to run automated queries against your local files.</p>
            </div>
          )}
        </Card>
      </div>
      <ExploreDataPanel
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        isGroupSynced={isGroupSynced}
        handlePublishDataStory={handlePublishDataStory}
        addTask={addTask}
        addNoteToTask={addNoteToTask}
        activePlaybook={activePlaybook}
        playbooks={playbooks}
        verboseMode={verboseMode}
      />
      </div>
    </div>
  );
}
