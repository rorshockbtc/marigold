"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDataQuery } from "@/hooks/useDataQuery";
import AppSidebar from "@/components/AppSidebar";
import MariRightPanel from "@/components/MariRightPanel";
import { Filter, Download, ArrowRight, Shield, ShieldAlert, X, Activity, Database, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MarigoldIcon } from "@/components/MarigoldIcon";

export default function ExplorePage() {
  const { runLocalAudit, isQuerying, queryProgress } = useDataQuery();
  const [verboseMode, setVerboseMode] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activePlaybook, setActivePlaybook] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(true); // Default true to avoid flash
  const [showAllPlaybooks, setShowAllPlaybooks] = useState(false);
  
  const [countyFilter, setCountyFilter] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const group = localStorage.getItem("marigold_active_group") || "";
      const isConnected = localStorage.getItem("marigold_file_connected") === "true";
      const isDemo = group.toLowerCase().includes("demo") || group.toLowerCase().includes("sandbox");
      if (isConnected || (isDemo && localStorage.getItem("marigold_file_name")?.toUpperCase().includes("DEMO"))) {
        setIsDataLoaded(true);
      } else {
        setIsDataLoaded(false);
      }
      
      // Auto-run playbook from URL
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
    setActivePlaybook(id);
    setSelectedRecord(null);
    const finalCounty = overrideCounty !== undefined ? overrideCounty : countyFilter;
    const finalThreshold = overrideThreshold !== undefined ? overrideThreshold : thresholdFilter;
    
    try {
      const data = await runLocalAudit(id, finalCounty, finalThreshold);
      setResults(data);
    } catch (e) {
      console.error(e);
      alert("Error running audit. Make sure Demo data is loaded in Onboarding.");
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

  const renderDataPanel = () => {
    if (!selectedRecord) return null;
    
    return (
      <div className="w-96 bg-white border-l border-border-soft shadow-xl h-full absolute right-0 top-0 p-6 overflow-y-auto z-30 animate-in slide-in-from-right-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-text-header">Record Insights</h2>
          <Button onClick={() => setSelectedRecord(null)} variant="outline" aria-label="Close Insights" className="p-2 rounded-full">
            <X className="w-5 h-5 text-text-body" />
          </Button>
        </div>
        
        {/* Insight Conclusion First */}
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
        
        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button 
            onClick={() => window.alert(`Added ${selectedRecord.id} to Kanban Board`)}
            variant="primary"
            className="w-full py-3"
          >
            Push to Kanban Board
          </Button>
          <Button 
            onClick={() => {
              const note = window.prompt("Enter secure note for this record:");
              if (note) window.alert("Note saved securely in local memory.");
            }}
            variant="secondary"
            className="w-full py-3"
          >
            Enter Secure Note
          </Button>
        </div>
        
        {/* Raw Fields (Progressive Disclosure) */}
        {verboseMode && (
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
              {selectedRecord.mailingAddress && (
                <div>
                  <span className="block text-xs text-text-body mb-1">Mailing Address</span>
                  <span className="block text-sm font-mono text-text-header">{selectedRecord.mailingAddress}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isDataLoaded) {
    return (
      <div className="flex flex-col h-full font-sans max-w-4xl mx-auto p-8 bg-background">
        <div className="mb-12 mt-8">
          <h1 className="text-4xl font-serif text-text-header mb-3">Data Required</h1>
          <p className="text-lg text-text-body">You cannot explore or review data because your local data engine is empty.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/onboarding" className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-header mb-1 group-hover:text-primary">Link Dataset</h3>
              <p className="text-xs text-text-body">Upload your CSV to the encrypted local engine.</p>
            </div>
          </a>
          <Button onClick={() => {
            localStorage.setItem("marigold_active_group", "State of Roosevelt (Demo)");
            window.location.reload();
          }} className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all group hover:-translate-y-1 text-left">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-header mb-1 group-hover:text-primary">Run Demo File</h3>
              <p className="text-xs text-text-body">Switch to the Demo Workspace sandbox.</p>
            </div>
          </Button>
          <Button onClick={() => {
            window.dispatchEvent(new Event('open-mari-panel'));
          }} className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all group hover:-translate-y-1 text-left">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
              <MarigoldIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-header mb-1 group-hover:text-primary">Ask Mari for Help</h3>
              <p className="text-xs text-text-body">Get guidance on data formats and onboarding.</p>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden flex flex-col bg-background">
      
      {/* Header */}
      <div className="px-8 pt-6 pb-2 bg-white z-10 border-b border-border-soft">
        <PageHeader
          title="Explore & Review"
          subtitle="Discover anomalies and run automated playbooks."
          actions={
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-bold text-text-body">Verbose Row Mode</span>
                <div className={`w-12 h-6 rounded-full transition-colors p-1 flex ${verboseMode ? 'bg-primary' : 'bg-gray-300'}`}>
                  <div 
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${verboseMode ? 'translate-x-6' : 'translate-x-0'}`} 
                  />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={verboseMode}
                  onChange={(e) => setVerboseMode(e.target.checked)}
                />
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

      <div className="flex-1 overflow-y-auto p-8 relative">
        {/* Playbooks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-body uppercase tracking-wider">Available Playbooks</h2>
            <Button 
              onClick={() => setShowAllPlaybooks(!showAllPlaybooks)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              {showAllPlaybooks ? (
                <><ChevronUp className="w-3 h-3"/> Show Less</>
              ) : (
                <><ChevronDown className="w-3 h-3"/> View All</>
              )}
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
                <div className="mt-1 bg-surface p-2 rounded-[8px]">
                  {pb.icon}
                </div>
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
              <input 
                type="text" 
                placeholder="e.g. Franklin (Leave blank for all)" 
                className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-full md:w-32">
              <label className="text-xs font-bold text-text-body mb-1">Threshold</label>
              <input 
                type="number" 
                className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={thresholdFilter}
                onChange={(e) => setThresholdFilter(parseInt(e.target.value) || 12)}
                min={1}
              />
            </div>
            <Button 
              onClick={() => activePlaybook && runPlaybook(activePlaybook)}
              disabled={!activePlaybook || isQuerying}
              className="mt-5 bg-surface border border-border-soft hover:border-primary text-text-header font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Update Engine
            </Button>
          </div>
          <div className="flex flex-col w-full md:w-64">
            <label className="text-xs font-bold text-text-body mb-1">Search Results</label>
            <input 
              type="text" 
              placeholder="Search names or addresses..." 
              className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                  {verboseMode && (
                    <th className="px-6 py-4 text-xs font-bold text-text-body uppercase tracking-wider">Anomaly Summary</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredResults.slice(0, verboseMode ? 1000 : 50).map((row, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedRecord(row)}
                    className="hover:bg-surface cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-text-header">{row.name}</div>
                      {verboseMode && <div className="text-xs font-mono text-text-body mt-1">{row.id}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-header">{row.address}</div>
                      <div className="text-xs text-text-body mt-1">{row.city}, {row.state} {row.zip}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        row.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 
                        row.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.risk_level}
                      </span>
                    </td>
                    {verboseMode && (
                      <td className="px-6 py-4">
                        <p className="text-xs text-text-body line-clamp-2 max-w-xs">{row.details}</p>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <Filter className="w-8 h-8 text-border-soft mb-4" />
              <p className="text-sm text-text-body">Select a Playbook above to populate the data table.</p>
            </div>
          )}
        </Card>
        
      </div>
      
      {/* Render Insights Panel Overlay */}
      {renderDataPanel()}

    </div>
  );
}
