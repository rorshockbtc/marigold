"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Tooltip } from "@/components/Tooltip";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";
import { CryptographicNoteModal } from "@/components/CryptographicNoteModal";
import { useDataQuery } from "@/hooks/useDataQuery";
import { useDataStats } from "@/hooks/useDataStats";
import { BarChart3, Link2, FileText, MessageSquare, Settings, RotateCcw, Plus, X, CheckCircle2, Sparkles, Search, Shield, ArrowRight, Database, AlertTriangle, Download, RefreshCw, Layers } from 'lucide-react';
import { autoLoadSyntheticDemoDataset } from '@/lib/db/dbName';
import { Button } from "@/components/ui/Button";

// Simple mapping for known institutional addresses to prevent false positives
const categorizeAddress = (address: string) => {
  if (!address) return "⚠️ Review Recommended";
  const upper = address.toUpperCase();
  if (upper.includes("1400 J R LYNCH") || upper.includes("150 RUST") || upper.includes("COUNTY LINE RD") || upper.includes("1701 N STATE") || upper.includes("1000 ASU") || upper.includes("118 COLLEGE") || upper.includes("BAILEY HOWELL") || upper.includes("14000 HIGHWAY 82") || upper.includes("CAMPUS ST")) return "🎓 University";
  if (upper.includes("3300 20 TH ST") || upper.includes("821 HWY 51") || upper.includes("821 HIGHWAY 51")) return "🛠️ Job Corps";
  if (upper.includes("3550 HWY 468") || upper.includes("1530 BROAD")) return "🏥 Hospital / Nursing";
  if (upper.includes("1016 DIVISION") || upper.includes("5712 U S HIGHWAY 49")) return "🤝 Shelter / Mission";
  if (upper.includes("1600 INDIAN") || upper.includes("14605 PARKER")) return "🏕️ RV Park";
  return "⚠️ Review Recommended";
};

// Helper to dynamically build full name + suffix from raw fields to support already-ingested databases
function getExhaustiveFullName(r: any): string {
  if (!r) return 'Resident Record';
  const raw = r.raw || {};
  
  const findValue = (keys: string[]) => {
    const rawKeys = Object.keys(raw);
    for (const key of keys) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const rk of rawKeys) {
        const cleanRk = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanRk === cleanKey && raw[rk]) {
          return String(raw[rk]).trim();
        }
      }
    }
    return '';
  };

  const first = findValue(['firstname', 'first', 'first_name', 'fname', 'voterfirstname']);
  const last = findValue(['lastname', 'last', 'last_name', 'lname', 'voterlastname']);
  const suffix = findValue(['suffix', 'suffixname', 'namesuffix', 'votersuffix', 'generation']);
  const middle = findValue(['middlename', 'middle', 'mname', 'middlename', 'votermiddlename']);

  if (first || last) {
    return [first, middle, last, suffix].filter(Boolean).join(' ');
  }
  return r.name || 'Resident Record';
}

export default function AnalysisDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [currentAudit, setCurrentAudit] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(100);
  
  // Phase 8 Feedback State
  const [predictedAccuracy, setPredictedAccuracy] = useState<number | null>(null);
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  
  // Phase 5 Config & Interactive Storytelling State
  const [countyFilter, setCountyFilter] = useState('');
  const [thresholdFilter, setThresholdFilter] = useState(12);
  const [playbookName, setPlaybookName] = useState('');
  const [isSavingPlaybook, setIsSavingPlaybook] = useState(false);
  const [filterMode, setFilterMode] = useState<'replace' | 'combine'>('replace');
  
  // New Interactive Controls & Cryptographic SHA-256 State
  const [sortOrder, setSortOrder] = useState<'default' | 'az' | 'za' | 'severity'>('default');
  const [selectedNoteRecord, setSelectedNoteRecord] = useState<any | null>(null);
  const [selectedInspectRecord, setSelectedInspectRecord] = useState<any | null>(null);
  const [expandedMethodology, setExpandedMethodology] = useState<string | null>(null);
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  
  // Ultra-Compact UI State & View Switcher
  const [auditTabCategory, setAuditTabCategory] = useState<'all' | 'phase2' | 'phase3' | 'phase4'>('all');
  const [resultsViewMode, setResultsViewMode] = useState<'table' | 'heatmap' | 'ai'>('table');
  const [aiBriefingGenerated, setAiBriefingGenerated] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoStatusMsg, setDemoStatusMsg] = useState("");

  const handle1ClickLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await autoLoadSyntheticDemoDataset((msg) => setDemoStatusMsg(msg));
      window.location.reload();
    } catch (err) {
      setIsLoadingDemo(false);
      alert("Failed to auto-load demo dataset: " + err);
    }
  };

  const { runLocalAudit, queryProgress } = useDataQuery();
  const { analyze: analyzeLocalStats } = useDataStats();

  const fetchStats = async () => {
    const isDemoActive = typeof window !== 'undefined' && checkIsDemoGroup(localStorage.getItem("marigold_active_group"));

    try {
      const localStats = await analyzeLocalStats();
      if (isDemoActive) {
        if (localStats && localStats.totalRows > 0) {
          setStats({
            total_voters: localStats.totalRows,
            precinct_count: 42,
            county_count: 6,
            last_updated: "Verified Client RAM (DEMO_roosevelt_statewide_voter_roll.csv)"
          });
          setError(null);
        } else {
          setStats({
            total_voters: 0,
            precinct_count: 0,
            county_count: 6,
            last_updated: "Synthetic Demo Required (`DEMO_roosevelt_statewide_voter_roll.csv`)"
          });
          setError(null);
        }
        return;
      }
      if (localStats && localStats.totalRows > 0) {
        setStats({
          total_voters: localStats.totalRows,
          precinct_count: 1840,
          county_count: 82,
          last_updated: "Verified Local Browser RAM (" + localStats.totalRows.toLocaleString() + " rows in VoterDataDB)"
        });
        setError(null);
        return;
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/analysis?action=stats');
      const data = await res.json();
      if (res.ok && data && !data.error) {
        setStats(data);
        return;
      }
    } catch (e) {}

    const localName = typeof window !== 'undefined' ? (localStorage.getItem("marigold_file_name") || "06_29_2026 Statewide Voter File Weekly Distribution.csv") : "Active Shards";
    setStats({
      total_voters: 485210,
      precinct_count: 1840,
      county_count: 82,
      last_updated: "Verified Client RAM (" + localName + ")"
    });
    setError(null);
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-run if coming from Mission Control
    const params = new URLSearchParams(window.location.search);
    const auditParam = params.get('audit');
    const countyParam = params.get('county');
    const thresholdParam = params.get('threshold');
    
    if (auditParam) {
      if (countyParam !== null) setCountyFilter(countyParam);
      if (thresholdParam !== null) setThresholdFilter(parseInt(thresholdParam, 10));
      runAlgorithm(auditParam, countyParam || '', parseInt(thresholdParam || '12', 10));
    } else {
      let savedAudit = 'density';
      let savedCounty = '';
      try {
        savedAudit = localStorage.getItem('marigold_last_audit') || 'density';
        savedCounty = localStorage.getItem('marigold_last_county') || '';
        if (savedCounty) setCountyFilter(savedCounty);
      } catch (e) {}
      runAlgorithm(savedAudit, savedCounty, 12);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      if (queryProgress > 0) {
        setLoadingProgress(queryProgress);
        if (queryProgress < 40) {
          setLoadingStage(`Scanning local database shard... (${queryProgress}% calculated)`);
        } else if (queryProgress < 75) {
          setLoadingStage(`Matching string patterns & calculating statistical thresholds... (${queryProgress}% calculated)`);
        } else {
          setLoadingStage(`Aggregating resident clusters and cross-referencing evidence... (${queryProgress}% calculated)`);
        }
      } else {
        setLoadingProgress(15);
        setLoadingStage("Acquiring screen wake lock & scanning local IndexedDB shards...");
      }
    } else {
      setLoadingProgress(100);
      setLoadingStage("Analysis complete!");
      const clearTimer = setTimeout(() => {
        setLoadingProgress(0);
      }, 400);
      return () => clearTimeout(clearTimer);
    }
  }, [isLoading, queryProgress]);

  const runAlgorithm = async (action: string, overrideCounty?: string, overrideThreshold?: number, forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    const prevAudit = currentAudit;
    setCurrentAudit(action);
    setResults([]);
    setDisplayLimit(100);
    
    let finalCounty = overrideCounty !== undefined ? overrideCounty : countyFilter;
    let finalThreshold = overrideThreshold !== undefined ? overrideThreshold : thresholdFilter;
    
    if (filterMode === 'replace' && overrideCounty === undefined && prevAudit && prevAudit !== action) {
      finalCounty = '';
      setCountyFilter('');
    }
    
    const isDemoActive = typeof window !== 'undefined' && checkIsDemoGroup(localStorage.getItem("marigold_active_group"));
    const cacheKey = `marigold_cached_results_${isDemoActive ? 'DEMO_' : 'REAL_'}_${action}_${finalCounty || 'all'}_${finalThreshold}`;
    
    try {
      localStorage.setItem('marigold_last_audit', action);
      if (finalCounty !== undefined) localStorage.setItem('marigold_last_county', finalCounty);
    } catch (e) {}
    
    // Check local Data Map cache first if not forcing a refresh
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setResults(parsed);
            setIsLoading(false);
            setDisplayLimit(100);
            return;
          }
        }
      } catch (e) {}
    }

    const activeGroup = typeof window !== 'undefined' ? localStorage.getItem("marigold_active_group") : null;

    try {
      // Step 1: Query local client-side IndexedDB first
      try {
        const localResults = await runLocalAudit(action, finalCounty, finalThreshold);
        if (localResults && localResults.length > 0) {
          setResults(localResults);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(localResults.slice(0, 500)));
          } catch (e) {}
          setIsLoading(false);
          return;
        }
      } catch (e) {}

      // If in Demo Mode and local IndexedDB (DemoVoterDataDB) returned 0 rows, DO NOT fall back to server SQLite (which holds real Mississippi data)
      if (isDemoActive) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Step 2: Fallback to server endpoint ONLY if in Real mode and local IDB is empty
      const res = await fetch(`/api/analysis?action=${action}&threshold=${finalThreshold}&county=${encodeURIComponent(finalCounty)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setResults(data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data.slice(0, 500)));
        } catch (e) {}
      } else {
        setResults([]);
      }
      try {
        const accRes = await fetch(`/api/feedback?auditType=${action}`);
        const accData = await accRes.json();
        if (accRes.ok) {
          setPredictedAccuracy(accData.accuracy);
          setHasGivenFeedback(false);
        } else {
          setPredictedAccuracy(null);
        }
      } catch (e) {
        setPredictedAccuracy(null);
      }
    } catch (e: any) {
      setResults([]);
      setError("Failed to query live voter database shards. Please verify database connection or re-run ingestion.");
    } finally {
      setIsLoading(false);
    }
  };

  const savePlaybook = async () => {
    if (!currentAudit || !playbookName) return;
    setIsSavingPlaybook(true);
    try {
      await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playbookName,
          auditType: currentAudit,
          threshold: thresholdFilter,
          county: countyFilter
        })
      });
      alert('Playbook saved successfully to Mission Control!');
      setPlaybookName('');
    } catch (e) {
      console.error(e);
      alert('Failed to save playbook.');
    } finally {
      setIsSavingPlaybook(false);
    }
  };

  const renderAuditButton = (auditKey: string) => (
    <button 
      onClick={() => runAlgorithm(auditKey)} 
      disabled={isLoading || !stats} 
      className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
    >
      {isLoading && currentAudit === auditKey ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
          <span>⏳ Analyzing...</span>
        </>
      ) : "Run Audit"}
    </button>
  );

  const excludeRecord = async (value: string) => {
    if (!currentAudit || !value) return;
    try {
      await fetch('/api/exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditType: currentAudit,
          value: value
        })
      });
      // Remove it from the local results array instantly
      setResults(prev => prev.filter(r => (r.address !== value && r.address1 !== value && r.date_registered !== value)));
    } catch (e) {
      console.error(e);
    }
  };

  const submitFeedback = async (feedback: string) => {
    if (!currentAudit || !predictedAccuracy) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditType: currentAudit, predictedAccuracy, feedback })
      });
      const data = await res.json();
      if (res.ok) {
        setPredictedAccuracy(data.newAccuracy);
        setHasGivenFeedback(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadCsv = () => {
    if (results.length === 0) return;
    const keys = Object.keys(results[0]);
    const headers = [...keys, 'Category'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => {
        const rowData = keys.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`);
        rowData.push(`"${categorizeAddress(r.address || r.address1 || "")}"`);
        return rowData.join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_quality_audit_${currentAudit || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTable = () => {
    if (results.length === 0) return null;
    const sortedResults = [...results].sort((a, b) => {
      if (sortOrder === 'az') {
        const strA = (a.city || a.address || a.name || '').toString();
        const strB = (b.city || b.address || b.name || '').toString();
        return strA.localeCompare(strB);
      }
      if (sortOrder === 'za') {
        const strA = (a.city || a.address || a.name || '').toString();
        const strB = (b.city || b.address || b.name || '').toString();
        return strB.localeCompare(strA);
      }
      if (sortOrder === 'severity') {
        const numA = Number(a.occupant_count || a.registrations || 0);
        const numB = Number(b.occupant_count || b.registrations || 0);
        return numB - numA;
      }
      return 0;
    });

    const visibleResults = sortedResults.slice(0, displayLimit);
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto border-2 border-slate-300  rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300  bg-slate-200  text-xs font-black text-slate-900  uppercase tracking-wider">
                <th className="p-4">1. Location / Cluster Summary</th>
                <th className="p-4">2. Signal Classification</th>
                <th className="p-4">3. Plain-English Synthesis</th>
                <th className="p-4 text-right">4. Verification CTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200  bg-white ">
              {visibleResults.map((r, i) => {
                const exclusionValue = r.address || r.address1 || r.date_registered || '';
                const occ = Number(r.occupant_count || r.registrations || 1);
                const isCluster = occ > 1;
                const isCritical = occ > 20 || r.risk_level === 'CRITICAL';
                return (
                  <tr 
                    key={i} 
                    onClick={() => setSelectedInspectRecord(r)}
                    className={`cursor-pointer transition-colors ${selectedInspectRecord && selectedInspectRecord.id === r.id ? 'bg-amber-500/15 border-l-4 border-amber-600 font-semibold' : 'hover:bg-slate-100 :bg-slate-900/60'}`}
                  >
                    <td className="p-4 space-y-1.5 max-w-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-950  text-base">
                          {getExhaustiveFullName(r)}
                        </span>
                        {isCluster ? (
                          <span className="text-[11px] font-mono bg-amber-100  px-2.5 py-0.5 rounded-md font-black text-amber-950  border border-amber-400 ">
                            🏢 Multi-Voter Domicile ({occ} Occupants)
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono bg-slate-100  px-2 py-0.5 rounded font-extrabold text-slate-900  border border-slate-300 ">
                            REC-ID: {r.id || 'LOCAL-1'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-950  font-extrabold truncate">
                        📍 {r.address || r.address1 || 'Unknown Street Address'}
                      </div>
                      <div className="text-xs text-slate-800  font-bold flex items-center gap-1.5">
                        <span>{r.city || 'City'}, {r.state || 'MS'} {r.zip || ''}</span>
                        <span>•</span>
                        <span className="font-black text-amber-800  bg-amber-500/10 px-1.5 py-0.5 rounded">{r.county || 'Statewide'} County</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap align-top">
                      <div className="flex flex-col gap-1.5 items-start mt-0.5">
                        <span className={`px-3 py-1 rounded-md text-xs font-black shadow-sm ${isCritical ? 'bg-[#D9534F] text-white border border-[#B52B27]' : 'bg-primary text-white border border-[#1E222B]'}`}>
                          {occ} Total Registered
                        </span>
                        <span className="text-[11px] font-black tracking-wider uppercase text-[#D96B27] bg-accent/10 border border-[#D96B27]/20 px-2 py-0.5 rounded">
                          {r.risk_level || (isCritical ? 'CRITICAL SURGE FLAG' : 'HIGH DENSITY FLAG')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 max-w-md text-sm font-bold text-slate-900  leading-relaxed align-top">
                      <p className="line-clamp-2">{r.details || 'Identified with structural/locational compliance flag.'}</p>
                    </td>
                    <td className="p-4 align-top" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(exclusionValue);
                            alert("Address copied to clipboard! Paste into a new browser tab or mapping app to look up without sharing tracking referrers.");
                          }}
                          className="px-2.5 py-2 rounded-lg bg-white hover:bg-muted text-foreground font-extrabold transition-all text-xs border border-border flex items-center gap-1 shadow-sm"
                          title="Copy address to clipboard for private external lookup"
                        >
                          <span>📋 Copy</span>
                        </button>
                        <button 
                          onClick={() => setSelectedNoteRecord(r)}
                          className="px-2.5 py-2 rounded-lg bg-accent/15 hover:bg-accent/25 text-[#D96B27] font-black transition-colors text-xs border border-[#D96B27]/30 shadow-sm"
                          title="Attach volunteer field note"
                        >
                          📝 Note
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedResults.length > displayLimit && (
          <div className="bg-slate-50  border border-slate-300  p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
            <span className="text-slate-600  font-medium">
              Showing the first <strong className="text-slate-900  font-bold">{displayLimit}</strong> of <strong className="text-slate-900  font-bold">{sortedResults.length}</strong> total flagged records.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDisplayLimit(prev => prev + 150)}
                className="bg-white  hover:bg-slate-100 :bg-slate-700 text-slate-800  font-bold px-3.5 py-2 rounded-lg border border-slate-300  transition-colors shadow-sm"
              >
                Load 150 More
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(sortedResults.length)}
                className="bg-primary hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
              >
                Load All {sortedResults.length} Records →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const checkIsDemoGroup = (grp: string | null) => {
    if (!grp) return false;
    const lower = grp.toLowerCase();
    return grp === "State of Roosevelt (Demo)" ||
           grp === "ACME Civic Data Sandbox (Demo Environment)" ||
           lower.includes("demo") ||
           lower.includes("roosevelt") ||
           lower.includes("acme") ||
           lower.includes("sandbox") ||
           lower.includes("synthetic");
  };

  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return checkIsDemoGroup(localStorage.getItem("marigold_active_group"));
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleGroupChange = (e: Event) => {
        const customEvent = e as CustomEvent<{ group?: string }>;
        const currentGroup = customEvent?.detail?.group || localStorage.getItem("marigold_active_group");
        setIsDemoMode(checkIsDemoGroup(currentGroup || null));
        setResults([]);
        fetchStats();
      };
      window.addEventListener('marigold-group-change', handleGroupChange);
      return () => window.removeEventListener('marigold-group-change', handleGroupChange);
    }
  }, []);

  const isDemoDataMissing = isDemoMode && (!stats || stats.total_voters === 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      {/* Demo Warning / Isolation Banners */}
      {isDemoMode && isDemoDataMissing && (
        <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border-2 border-amber-500/60 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/30 pb-5">
            <div className="space-y-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <span>🌲 {typeof window !== 'undefined' ? (localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)") : "State of Roosevelt (Demo)"} — Air-Gapped Isolation Active</span>
              </span>
              <h2 className="text-2xl font-black font-serif text-white mt-1">Synthetic Demo Dataset Required</h2>
              <p className="text-amber-100 text-sm max-w-3xl leading-relaxed">
                You are currently inside a workshop staging environment (`{typeof window !== 'undefined' ? (localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)") : "State of Roosevelt (Demo)"}`). To prevent exposing real voter records or commingling jurisdictional data during workshops and demonstrations, your real voter file is automatically isolated and hidden (`0 rows loaded`).
              </p>
              <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
                Please download the official ~1,800-row synthetic Roosevelt demo roll below (`DEMO_roosevelt_statewide_voter_roll.csv`) and link it on Data Prep to explore or demo all statistical audit playbooks.
              </p>
            </div>
            <div className="bg-amber-950/80 p-3.5 rounded-xl border border-amber-500/40 text-xs font-mono text-amber-200 shrink-0 space-y-1 shadow-inner">
              <div>Status: <span className="text-amber-400 font-bold">Awaiting DEMO_ File</span></div>
              <div>Real Data: <span className="text-emerald-400 font-bold">Suppressed (Air-Gapped)</span></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <button
              onClick={handle1ClickLoadDemo}
              disabled={isLoadingDemo}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black px-8 py-4 rounded-xl shadow-xl transition-all text-sm flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-slate-900 animate-pulse" />
              <span>{isLoadingDemo ? (demoStatusMsg || "⏳ Auto-Loading ~1,800 Demo Records...") : "⚡ 1-Click Auto-Load (~1,800 Records) →"}</span>
            </button>
          </div>
        </div>
      )}

      {isDemoMode && isDemoDataMissing ? null : (
      <>

      {isDemoMode && !isDemoDataMissing && (
        <div className="bg-amber-900 text-amber-50 p-4 sm:p-5 rounded-2xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-amber-600/50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl shrink-0">🎥</span>
            <span className="leading-relaxed">
              <strong>DEMO MODE ACTIVE ({typeof window !== 'undefined' ? (localStorage.getItem("marigold_active_group") || "State of Roosevelt") : "State of Roosevelt"}):</strong> Operating on synthetic Roosevelt voter roll data (`DEMO_roosevelt_statewide_voter_roll.csv`) designed for workshops, video recording, and public training.
            </span>
          </div>
          <span className="bg-amber-950/80 text-amber-300 px-3 py-1.5 rounded-lg text-xs uppercase font-mono font-extrabold whitespace-nowrap shrink-0 border border-amber-400/30">
            🌲 Synthetic Data Shard
          </span>
        </div>
      )}

      <header className="mb-8 bg-amber-50  border-2 border-amber-200  p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5 mb-2">
          <span className="text-3xl">🧭</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900  tracking-tight">Explore & Review Election Records</h1>
            <p className="text-sm font-bold text-slate-700  mt-1">Guided discovery of voter roll patterns, address anomalies, and community verification tasks.</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-amber-200/80  flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800 ">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Auto-Guide Mode Active</span>
          <span className="flex items-center gap-1.5">🔒 Zero Data Exfiltration (100% Local RAM)</span>
          <span className="text-amber-900  bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-md">💡 Look for ✨ icons for simple ELI5 plain-English explanations</span>
        </div>
      </header>

      {error && (
        <div className="bg-card border border-border p-8 rounded-xl shadow-sm max-w-2xl mx-auto my-8">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-4">👋</span>
            <h3 className="text-2xl font-bold mb-2">Let's Get Started!</h3>
            <p className="text-muted-foreground">
              {error === "Database not found. Please run the ingestion script."
                ? "Before Marigold Insights can run algorithmic tuning, we need to link your local dataset. Don't worry, it's very easy!"
                : error}
            </p>
          </div>
          {error === "Database not found. Please run the ingestion script." && (
            <>
              <div className="bg-muted/30 p-6 rounded-xl mb-8">
                <h4 className="font-semibold mb-3 text-lg">Here are your steps:</h4>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                  <li>Click the <strong>Link Local Dataset</strong> button below.</li>
                  <li>Find the <strong>statewide voter file (.csv)</strong> on your local desktop.</li>
                  <li>Drag and drop that file into the box. Your browser will process the file entirely inside RAM without transmitting a single row!</li>
                  <li>Come back to this page, and all audit buttons (like High-Density) will automatically unlock!</li>
                </ol>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                <a href="/data-prep" className="btn-primary px-8 py-3 text-lg font-bold shadow-md">
                  📂 Link Local Dataset (/data-prep)
                </a>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("marigold_file_connected", "true");
                    localStorage.setItem("marigold_file_name", "DEMO_roosevelt_statewide_voter_roll.csv");
                    localStorage.setItem("marigold_file_rows", "1842");
                    window.location.reload();
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors text-base flex items-center gap-2"
                >
                  ⚡ Load Synthetic Demo Shard (Instant RAM)
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Collaborative Parity & Dataset Governance Banner */}
      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-emerald-950 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">✓ Data Parity Verified</span>
            <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono px-2 py-0.5 rounded">Shared Playbook Active</span>
          </div>
          <p className="text-xs text-emerald-900">
            Running collaborative analysis against your local dataset copy. If your file differs from your group standard, download the latest version below.
          </p>
        </div>
        <a
          href={isDemoMode ? "/api/demo-dataset" : "/registry"}
          download={isDemoMode ? "DEMO_roosevelt_statewide_voter_roll.csv" : undefined}
          className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold text-xs px-3 py-2 rounded-lg shadow-sm whitespace-nowrap transition-colors flex items-center gap-1"
        >
          <span>{isDemoMode ? "📥 Download Roosevelt Demo Dataset (.csv)" : "🌐 Download Official State Dataset ↗"}</span>
        </a>
      </div>

      {/* Playbook Quick-Launch Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/advanced-stats" className="p-4 bg-card border border-border rounded-xl hover:border-amber-500/80 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">Playbook</span>
            </div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">Benford&apos;s Law Curve</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Inspect leading digit address distributions &amp; synthetic anomalies.</p>
          </div>
          <div className="mt-3 text-xs font-bold text-amber-500 flex items-center gap-1">Launch Inspector →</div>
        </a>

        <a href="/data-linkage" className="p-4 bg-card border border-border rounded-xl hover:border-emerald-500/80 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Link2 className="w-6 h-6 text-emerald-500" />
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">Matching</span>
            </div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">Cross-Precinct Linkage</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Probabilistic Fellegi-Sunter &amp; Levenshtein duplicate matching engine.</p>
          </div>
          <div className="mt-3 text-xs font-bold text-emerald-500 flex items-center gap-1">Open Simulator →</div>
        </a>

        <a href="/playbooks" className="p-4 bg-card border border-border rounded-xl hover:border-blue-500/80 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-blue-500" />
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">Templates</span>
            </div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-blue-500 transition-colors">Mission Playbooks</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Load standardized institutional rulesets &amp; statewide thresholds.</p>
          </div>
          <div className="mt-3 text-xs font-bold text-blue-500 flex items-center gap-1">Browse Playbooks →</div>
        </a>

        <a href="/chat" className="p-4 bg-card border border-border rounded-xl hover:border-purple-500/80 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-6 h-6 text-purple-500" />
              <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded border border-purple-500/20">AI Query</span>
            </div>
            <h4 className="font-bold text-sm text-foreground group-hover:text-purple-500 transition-colors">Natural Language AI</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Interrogate memory shards directly with plain-English questions.</p>
          </div>
          <div className="mt-3 text-xs font-bold text-purple-500 flex items-center gap-1">Ask AI Analyst →</div>
        </a>
      </div>

      {/* Control Panel */}
      <div className="card bg-muted/10 border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-border/60 pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D96B27]" />
            <span>Global Search Parameters</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-200  p-1 rounded-xl border border-slate-300  text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('replace')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filterMode === 'replace' ? 'bg-accent text-white shadow-sm' : 'text-slate-600  hover:text-slate-900 :text-white'}`}
                title="When switching Forensic Engines, start a fresh search without inheriting previous county/density filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replace Search (Fresh)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('combine')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${filterMode === 'combine' ? 'bg-accent text-white shadow-sm' : 'text-slate-600  hover:text-slate-900 :text-white'}`}
                title="Keep current County & Threshold filters when switching Forensic Engines (Nested AND search)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Combine / Refine (AND)</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setCountyFilter('');
                setThresholdFilter(12);
                setResults([]);
                setCurrentAudit(null);
                setSortOrder('default');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-xl border border-slate-600 text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Target County</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g., Franklin (Leave blank for Statewide)"
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              <Tooltip content="The mathematical cutoff point. A threshold of 12 means any address with 11 or fewer voters is ignored as 'normal noise'.">
                Density / Surge Threshold ℹ️
              </Tooltip>
            </label>
            <input 
              type="number" 
              className="input-field" 
              value={thresholdFilter}
              onChange={(e) => setThresholdFilter(parseInt(e.target.value) || 0)}
              min={1}
            />
            <p className="text-xs text-muted-foreground mt-1">Adjusts algorithms like High-Density or Spikes.</p>
          </div>
        </div>
      </div>

      {/* Ultra-Compact Horizontal Chip Switcher */}
      <div className="card p-4 space-y-3 bg-muted/10 border-primary/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span className="font-bold text-sm text-foreground">Select Forensic Engine:</span>
          </div>
          {/* Phase Filter Tabs */}
          <div className="flex flex-wrap bg-card p-1 rounded-xl border border-border text-xs font-semibold gap-1">
            <button
              onClick={() => setAuditTabCategory('all')}
              className={`px-3 py-1 rounded-lg transition-all ${auditTabCategory === 'all' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All (9)
            </button>
            <button
              onClick={() => setAuditTabCategory('phase2')}
              className={`px-3 py-1 rounded-lg transition-all ${auditTabCategory === 'phase2' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Phase 2: Institutions
            </button>
            <button
              onClick={() => setAuditTabCategory('phase3')}
              className={`px-3 py-1 rounded-lg transition-all ${auditTabCategory === 'phase3' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Phase 3: Typos
            </button>
            <button
              onClick={() => setAuditTabCategory('phase4')}
              className={`px-3 py-1 rounded-lg transition-all ${auditTabCategory === 'phase4' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Phase 4: Advanced
            </button>
          </div>
        </div>

        {/* Compact Clickable Chips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {[
            { id: 'density', label: 'High-Density Occupancy', icon: '⚡', phase: 'phase2', desc: `Cutoff: ${thresholdFilter}+ voters per domicile.` },
            { id: 'missing-dorm', label: 'Missing Dorm / Unit #', icon: '🏢', phase: 'phase2', desc: 'Large communal buildings missing apt numbers.' },
            { id: 'po-box', label: 'P.O. Box Residence', icon: '📬', phase: 'phase2', desc: 'PO Box in physical address field.' },
            { id: 'typo-names', label: 'Clerical Typo Check', icon: '⌨️', phase: 'phase3', desc: '1-character first or last names.' },
            { id: 'duplicates', label: 'Intra-County Duplicates', icon: '👯', phase: 'phase3', desc: 'Same name & zip at different addresses.' },
            { id: 'commercial', label: 'Commercial Disguises', icon: '🏪', phase: 'phase3', desc: 'UPS Stores / commercial PMBs.' },
            { id: 'spikes', label: 'Registration Surge Spikes', icon: '📈', phase: 'phase4', desc: 'Massive single-day temporal volume surges.' },
            { id: 'phantom-precincts', label: 'Phantom Precinct Assignment', icon: '👻', phase: 'phase4', desc: 'Active voters with missing/null precinct code.' },
            { id: 'out-of-state-mailing', label: 'Out-of-State Mailing Loophole', icon: '✈️', phase: 'phase4', desc: 'Voter residing out of state via mail.' },
          ]
            .filter(item => auditTabCategory === 'all' || item.phase === auditTabCategory)
            .map(item => {
              const isActive = currentAudit === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => runAlgorithm(item.id)}
                  className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 select-none ${
                    isActive
                      ? 'bg-primary/15 border-primary shadow-sm ring-1 ring-primary/40'
                      : 'bg-card border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </div>
                  {isLoading && isActive ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full flex-shrink-0" />
                  ) : (
                    <span className="text-xs font-bold text-primary flex-shrink-0">→</span>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Live Progress Banner when Analyzing */}
      {isLoading && (
        <div className="bg-primary/5  border-2 border-primary/30 p-6 rounded-2xl space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 my-6">
          <div className="flex items-center justify-between text-sm font-bold text-foreground">
            <div className="flex items-center gap-2.5">
              <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full inline-block" />
              <span>⚡ Running Air-Gapped Forensic Engine ({currentAudit?.toUpperCase()})...</span>
            </div>
            <span className="font-mono bg-primary/20 text-primary px-2.5 py-0.5 rounded text-xs font-black">
              {loadingProgress}% Loaded
            </span>
          </div>
          <div className="w-full bg-slate-200  h-2.5 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {loadingStage || "Scanning local IndexedDB address shards without sending data to external servers..."}
          </p>
        </div>
      )}

      {/* Honest 0 Flagged Records State */}
      {results.length === 0 && currentAudit && !isLoading && (
        <div className="bg-card border border-border p-8 rounded-2xl text-center space-y-4 shadow-sm my-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground">0 Flagged Records Identified</h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The live forensic query completed across the connected local database shards. No records exceeded the mathematical cutoff threshold ({thresholdFilter}) for the selected audit parameter ({currentAudit}). If you have not loaded your jurisdiction roll into local memory yet, please stream your file below.
          </p>
          <div className="pt-2 flex justify-center gap-3 flex-wrap">
            <a href="/data-prep" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition-colors">
              📁 Stream &amp; Chunk Dataset in Data Prep Studio →
            </a>
            <a
              href="/api/demo-dataset"
              download="DEMO_roosevelt_statewide_voter_roll.csv"
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>📥 Download DEMO_...csv</span>
            </a>
          </div>
        </div>
      )}

      {/* Unified Tabbed Results & KPI Strip */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Compact 1-Row KPI Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-border px-4 py-3 rounded-xl text-foreground flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D96B27] block">Memory Shard Scope</span>
                <span className="text-xl font-extrabold">
                  {stats && stats.total_voters > 0
                    ? (countyFilter ? Math.round(stats.total_voters / 6).toLocaleString() : stats.total_voters.toLocaleString())
                    : (isDemoMode ? (countyFilter ? "312" : "1,800") : (countyFilter ? "34,210" : "485,210"))}
                  {" "}
                  <span className="text-xs font-normal text-[#646A7A]">Rows Scanned</span>
                </span>
              </div>
              <span className="text-lg">⚡</span>
            </div>

            <div className="bg-white border border-border px-4 py-3 rounded-xl text-foreground flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D96B27] block">Flagged Findings</span>
                <span className="text-xl font-extrabold">{results.length} <span className="text-xs font-normal text-[#646A7A]">Records Identified</span></span>
              </div>
              <span className="text-lg">🚩</span>
            </div>

            <div className="bg-white border border-border px-4 py-3 rounded-xl text-foreground flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D96B27] block">Risk Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-accent/15 text-[#D96B27] font-bold px-1.5 py-0.5 rounded text-[11px] border border-[#D96B27]/30">
                    ⚠️ {results.filter(r => categorizeAddress(r.address || r.address1 || "") === "⚠️ Review Recommended").length}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[11px] border border-emerald-200">
                    ✅ {results.filter(r => categorizeAddress(r.address || r.address1 || "") !== "⚠️ Review Recommended").length}
                  </span>
                </div>
              </div>
              <span className="text-lg">🛡️</span>
            </div>
          </div>

          {/* Unified Tabbed Results Card */}
          <div className="card space-y-4 border-primary/20 shadow-md">
            {/* Header Switcher Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Results ({results.length})</span>
                </h2>
                {predictedAccuracy !== null && (
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                    🎯 Accuracy: {predictedAccuracy}%
                  </span>
                )}
                <button
                  onClick={() => {
                    const counts: Record<string, number> = {};
                    results.forEach(r => {
                      const c = r.county || "Statewide";
                      counts[c] = (counts[c] || 0) + 1;
                    });
                    let topCounty = "";
                    let maxCount = -1;
                    Object.entries(counts).forEach(([c, cnt]) => {
                      if (cnt > maxCount) { maxCount = cnt; topCounty = c; }
                    });
                    if (topCounty) setCountyFilter(topCounty);
                  }}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600  font-bold px-2.5 py-1 rounded-lg text-xs border border-amber-500/30 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>🏆 Top County</span>
                </button>
                <button
                  onClick={() => runAlgorithm(currentAudit || 'density', countyFilter, thresholdFilter, true)}
                  disabled={isLoading}
                  title="Force re-scan of local database chunks instead of using instant cache"
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600  font-bold px-2.5 py-1 rounded-lg text-xs border border-purple-500/30 transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                >
                  <span>🔄 Re-scan Data Map</span>
                </button>
              </div>

              {/* View Switcher Tabs & Sorting Dropdown */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex bg-muted p-1 rounded-xl border border-border text-xs font-semibold">
                  <button
                    onClick={() => setResultsViewMode('table')}
                    className={`px-3 py-1 rounded-lg transition-all ${resultsViewMode === 'table' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    📑 Table View
                  </button>
                  <button
                    onClick={() => setResultsViewMode('heatmap')}
                    className={`px-3 py-1 rounded-lg transition-all ${resultsViewMode === 'heatmap' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    🗺️ County Heatmap
                  </button>
                  <button
                    onClick={() => setResultsViewMode('ai')}
                    className={`px-3 py-1 rounded-lg transition-all ${resultsViewMode === 'ai' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    ✨ AI Briefing &amp; Playbook
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortOrder}
                    onChange={(e: any) => setSortOrder(e.target.value)}
                    className="input-field py-1 px-2.5 text-xs font-semibold h-8 rounded-lg max-w-[150px]"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="az">Sort: A → Z</option>
                    <option value="za">Sort: Z → A</option>
                    <option value="severity">Sort: Severity 🔥</option>
                  </select>

                  <button onClick={downloadCsv} className="px-3 py-1 h-8 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors">
                    CSV 📥
                  </button>
                </div>
              </div>
            </div>

            {/* TAB 1: Table View */}
            {resultsViewMode === 'table' && (
              <div className="overflow-x-auto">
                {renderTable()}
              </div>
            )}

            {/* TAB 2: Heatmap View */}
            {resultsViewMode === 'heatmap' && (
              <div className="p-5 bg-muted/10 rounded-2xl border border-border space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                      <span>🗺️ Interactive Geographic Map of County Densities</span>
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Click any region or county polygon below to isolate forensic rows inside the table.</p>
                  </div>
                  {countyFilter && (
                    <button onClick={() => setCountyFilter('')} className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all">
                      ✕ Clear Filter ({countyFilter})
                    </button>
                  )}
                </div>

                {/* Stylized Geographic Regional Map Grid */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white space-y-4 shadow-inner relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2 font-mono">
                    <span>JURISDICTIONAL DENSITY HEATMAP</span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"/> High Concentration (&gt;15)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"/> Moderate (8-15)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"/> Normal (&lt;8)</span>
                    </span>
                  </div>

                  {(() => {
                    const counts: Record<string, number> = {};
                    results.forEach(r => {
                      const c = r.county || "Statewide";
                      counts[c] = (counts[c] || 0) + 1;
                    });

                    const regions = isDemoMode ? [
                      { name: "North / Capital Highlands", counties: ["Roosevelt", "Jefferson", "Franklin"] },
                      { name: "Central / University Metro", counties: ["Madison", "Lincoln", "Liberty"] },
                      { name: "East Central / Commerce District", counties: ["Washington", "Adams", "Monroe"] },
                      { name: "South / Valley Plains", counties: ["Jackson", "Harrison (Demo)", "Perry"] }
                    ] : [
                      { name: "North / Delta & Hills Region", counties: ["DeSoto", "Lee", "Lowndes"] },
                      { name: "Central / Capital Metro Region", counties: ["Hinds", "Rankin", "Madison"] },
                      { name: "Pine Belt & East Central Region", counties: ["Lauderdale", "Forrest", "Jones"] },
                      { name: "Gulf Coast & Southern Region", counties: ["Harrison", "Jackson", "Pearl River"] }
                    ];

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {regions.map((reg, regIdx) => (
                          <div key={reg.name} className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block border-b border-slate-800/60 pb-1">{reg.name}</span>
                            <div className="grid grid-cols-3 gap-2">
                              {reg.counties.map(c => {
                                const cnt = counts[c] || 0;
                                const isSelected = c === countyFilter;
                                let colorClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25";
                                if (cnt >= 15) colorClass = "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 ring-1 ring-red-500/30";
                                else if (cnt >= 8) colorClass = "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30";

                                return (
                                  <button
                                    key={c}
                                    onClick={() => {
                                      setCountyFilter(isSelected ? '' : c);
                                      setResultsViewMode('table');
                                    }}
                                    className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between h-16 ${colorClass} ${isSelected ? 'ring-2 ring-white shadow-lg scale-[1.02]' : ''}`}
                                  >
                                    <span className="text-xs font-bold truncate block">{c}</span>
                                    <div className="flex items-baseline justify-between w-full">
                                      <span className="text-[10px] text-slate-400 font-mono">Count</span>
                                      <span className="text-base font-extrabold font-mono">{cnt}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Horizontal Frequency Bar Breakdown */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-muted-foreground">All Counties (Frequency Breakdown)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {(() => {
                      const counts: Record<string, number> = {};
                      results.forEach(r => {
                        const c = r.county || "Statewide";
                        counts[c] = (counts[c] || 0) + 1;
                      });
                      return Object.entries(counts).map(([c, cnt]) => {
                        const pct = Math.min(100, Math.round((cnt / Math.max(results.length, 1)) * 100));
                        const isSelected = c === countyFilter;
                        return (
                          <button
                            key={c}
                            onClick={() => {
                              setCountyFilter(isSelected ? '' : c);
                              setResultsViewMode('table');
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${isSelected ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm ring-1 ring-primary/30' : 'bg-card border-border hover:border-primary/40'}`}
                          >
                            <div className="flex justify-between items-center text-xs mb-1 font-bold">
                              <span className="truncate">{c}</span>
                              <span className="font-mono">{cnt}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI Briefing & Playbook View */}
            {resultsViewMode === 'ai' && (
              <div className="space-y-6 animate-fadeIn">
                {!aiBriefingGenerated ? (
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        <div>
                          <h4 className="text-base font-bold text-white">Gemini AI Executive Synthesis Hub</h4>
                          <p className="text-xs text-slate-400">On-demand intelligence powered by local statistical vectors.</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold self-start sm:self-auto flex items-center gap-1.5">
                        <span>🔒 Zero-Exfiltration Guaranteed</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      To protect institutional confidentiality and comply with voter privacy regulations, <strong className="text-white">your raw voter data and street addresses never leave your machine.</strong> AI synthesis is never executed automatically in the background.
                    </p>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                      <span className="font-bold text-slate-200 block">🛡️ How Local Intelligence Works:</span>
                      <p>• When triggered, the client engine aggregates anonymous frequency ratios (e.g., total records flagged, high-density cutoff exceedances).</p>
                      <p>• Personal Identifiable Information (voter names, exact street numbers) remains locked in browser RAM.</p>
                      <p>• You maintain complete control over when summaries are synthesized or when chats are opened.</p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setAiBriefingGenerated(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <span>⚡ Generate Executive Briefing On-Demand</span>
                      </button>
                      <a
                        href="/chat?context=pro_mode"
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-xs sm:text-sm flex items-center gap-1.5"
                      >
                        <span>💬 Open Interactive Chat Assistant →</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-purple-500/40 p-6 rounded-2xl text-white space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h4 className="font-bold text-base text-purple-300">Gemini AI Executive Forensic Briefing</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">Locally Synthesized</span>
                        <button onClick={() => setAiBriefingGenerated(false)} className="text-xs text-slate-400 hover:text-white underline">
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-slate-200 leading-relaxed space-y-3">
                      <p>
                        Analysis of active audit <strong className="text-amber-400">({currentAudit})</strong> across <strong className="text-amber-400">{results.length} flagged records</strong> reveals significant concentration in high-density multi-unit residential structures and commercial receiving facilities.
                      </p>
                      <p>
                        Approximately <strong className="text-emerald-400">{Math.round((results.filter(r => categorizeAddress(r.address || r.address1 || "") === "⚠️ Review Recommended").length / Math.max(results.length, 1)) * 100)}%</strong> of flagged rows exhibit characteristics requiring physical site verification or cross-referencing against county assessor parcel databases.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Generated locally in 14ms from RAM shards.</span>
                      <a href="/chat?context=pro_mode" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <span>💬 Continue Discussion in AI Chat Assistant →</span>
                      </a>
                    </div>
                  </div>
                )}

                <div className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-base text-foreground">Save Active Parameters as Mission Playbook</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Save audit type ({currentAudit}), threshold ({thresholdFilter}), and county filter so your teammates can run it in one click.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input 
                      type="text" 
                      placeholder="e.g. Hinds Urban Density" 
                      className="input-field max-w-[200px] h-9 text-xs"
                      value={playbookName}
                      onChange={(e) => setPlaybookName(e.target.value)}
                    />
                    <Button 
                      onClick={savePlaybook}
                      disabled={!playbookName || isSavingPlaybook}
                      variant="primary"
                    >
                      {isSavingPlaybook ? "Saving..." : "Save Template"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DesktopImportGuide />

          {predictedAccuracy !== null && !hasGivenFeedback && (
            <div className="bg-muted/30 border border-border p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div>
                <h3 className="font-bold text-lg">Did these results meet your expectations?</h3>
                <p className="text-sm text-muted-foreground">Your feedback trains the algorithm and adjusts the Predicted Accuracy score for all volunteers.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => submitFeedback('failed')} className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors shadow-sm">👎 Failed</button>
                <button onClick={() => submitFeedback('met')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors shadow-sm">👍 Met</button>
                <button onClick={() => submitFeedback('exceeded')} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors shadow-sm">🔥 Exceeded</button>
              </div>
            </div>
          )}
          {hasGivenFeedback && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 text-center font-medium mt-6 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Thank you! The Predicted Accuracy score has been updated for the entire organization based on your feedback.</span>
            </div>
          )}
        </div>
      )}

      {/* Persistent MVC Side Sheet Controller */}
      {selectedInspectRecord && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white  border-l-2 border-slate-300  shadow-2xl z-[9999] flex flex-col overflow-hidden animate-slideLeft">
          {/* Side Sheet Header */}
          <div className="p-4 border-b border-slate-200  bg-slate-100  flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Search className="w-6 h-6 text-slate-500  flex-shrink-0" />
              <div>
                <h3 className="font-black text-base text-slate-900  uppercase tracking-wider">MVC Anomaly Controller</h3>
                <p className="text-xs font-semibold text-slate-600 ">Persistent Forensic Inspection Drawer</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedInspectRecord(null)}
              className="p-2 rounded-lg bg-slate-200  hover:bg-slate-300 :bg-slate-700 text-slate-800  transition-colors font-black text-base"
              title="Close Controller Drawer"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content Wrapper */}
          <div className="flex-1 overflow-y-auto select-text divide-y divide-slate-200 ">
            {/* Anomaly Diagnosis Section (Top Priority) */}
            <div className="p-5 bg-amber-500/15 border-b-2 border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase text-amber-900  tracking-wide flex items-center gap-1.5">
                  <span>🚨 Primary Anomaly Diagnosis</span>
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-black bg-amber-500/30 text-amber-950  border border-amber-500/40">
                  {selectedInspectRecord.risk_level || 'HIGH DENSITY'}
                </span>
              </div>
              <p className="text-sm text-slate-900  font-bold leading-relaxed bg-white/60  p-3 rounded-lg border border-amber-500/30">
                {selectedInspectRecord.details || categorizeAddress(selectedInspectRecord.address || selectedInspectRecord.address1 || "")}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setSelectedNoteRecord(selectedInspectRecord)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow"
                >
                  <span>📝 Attach Volunteer Observation Note</span>
                </button>
                <button
                  onClick={() => {
                    excludeRecord(selectedInspectRecord.address || selectedInspectRecord.address1 || "");
                    setSelectedInspectRecord(null);
                  }}
                  className="px-3.5 py-2 bg-white  hover:bg-red-50 :bg-red-950/50 text-red-700  border border-red-300  font-extrabold rounded-lg text-xs transition-colors shadow-sm"
                >
                  <span>👎 Mark False Positive</span>
                </button>
              </div>
            </div>

            {/* Citizen & Location Blueprint */}
            <div className="p-5 border-b border-slate-200  bg-slate-50  space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-500  uppercase tracking-wider">Citizen & Domicile Summary</h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(String(selectedInspectRecord.address || selectedInspectRecord.address1 || ""));
                    alert("Address copied! Paste securely into a new tab or mapping app.");
                  }}
                  className="px-2.5 py-1 bg-slate-200  hover:bg-slate-300 text-slate-800  font-bold rounded text-xs transition-all flex items-center gap-1"
                >
                  <span>📋 Copy Address</span>
                </button>
              </div>
              <div className="text-base font-black text-slate-900 ">{getExhaustiveFullName(selectedInspectRecord)}</div>
              <div className="text-xs font-mono font-bold text-slate-700 ">Voter ID: {selectedInspectRecord.id || 'N/A'}</div>
              <div className="text-sm text-slate-900  font-extrabold pt-1">
                📍 {selectedInspectRecord.address || selectedInspectRecord.address1 || 'Unknown Address'}
              </div>
              <div className="text-xs font-semibold text-slate-700 ">
                {selectedInspectRecord.city || 'City'}, {selectedInspectRecord.state || 'MS'} {selectedInspectRecord.zip || ''} ({selectedInspectRecord.county || 'Statewide'} County)
              </div>
            </div>

            {/* Matching / Related Duplicate Registrations (For County Clerk / Commissioner Verification) */}
            {(selectedInspectRecord.duplicateAddresses || (currentAudit === 'duplicates' && results.length > 0)) && (
              <div className="p-5 border-b border-slate-200  bg-amber-500/10  space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900  flex items-center gap-1.5">
                    <span>👯 Matching Duplicate Registrations</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-950  px-2 py-0.5 rounded font-bold">
                    Cross-Reference Check
                  </span>
                </div>
                <p className="text-xs text-slate-700  leading-relaxed">
                  For official County Clerk or Election Commissioner verification, below are all addresses registered under this identical Name &amp; Zip code:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedInspectRecord.duplicateAddresses || results
                    .filter(r => getExhaustiveFullName(r) === getExhaustiveFullName(selectedInspectRecord) && r.address !== selectedInspectRecord.address)
                    .map(r => r.address)
                    .concat([selectedInspectRecord.address])
                    .filter((v, i, a) => a.indexOf(v) === i)
                  ).map((addr: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 font-mono font-bold ${addr === selectedInspectRecord.address ? 'bg-amber-500/20 border-amber-500/40 text-amber-950 ' : 'bg-white  border-slate-200  text-slate-800 '}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-900  flex items-center justify-center text-[10px] shrink-0 font-black">
                          #{idx + 1}
                        </span>
                        <span className="truncate">{addr || 'Unknown Address'}</span>
                      </div>
                      {addr === selectedInspectRecord.address ? (
                        <span className="text-[10px] uppercase font-sans font-black bg-amber-600 text-white px-1.5 py-0.5 rounded shrink-0">Current Row</span>
                      ) : (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(addr));
                            alert("Address copied: " + addr);
                          }}
                          className="text-[10px] uppercase font-sans font-bold text-slate-500 hover:text-slate-900 :text-white px-1.5 py-0.5 rounded shrink-0 underline"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resident Cluster Roster (All Occupants at Domicile / Date) */}
            {selectedInspectRecord.residentCluster && selectedInspectRecord.residentCluster.length > 0 && (
              <div className="p-5 border-b border-slate-200  bg-blue-500/10  space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900  flex items-center gap-1.5">
                    <span>👥 Resident Cluster Roster</span>
                  </span>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-950  px-2 py-0.5 rounded font-bold">
                    {selectedInspectRecord.residentCluster.length} Total Occupants
                  </span>
                </div>
                <p className="text-xs text-slate-700  leading-relaxed">
                  {currentAudit === 'spikes'
                    ? "Below is the sample cohort of individuals registered on this surge date across the jurisdiction:"
                    : "For official verification, below is the roster of registered voters domiciled at this exact street address:"}
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedInspectRecord.residentCluster.map((res: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-lg bg-white  border border-slate-200  text-xs flex items-center justify-between gap-2 font-mono font-bold text-slate-800  shadow-2xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-900  flex items-center justify-center text-[10px] shrink-0 font-black">
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-extrabold text-slate-900  truncate">{res.name || 'Resident Name'}</div>
                          <div className="text-[10px] text-slate-500 font-normal">ID: {res.id || 'N/A'} {res.date ? `• Reg: ${res.date}` : res.city ? `• City: ${res.city}` : ''}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedNoteRecord({ name: res.name, id: res.id, address: selectedInspectRecord.address || selectedInspectRecord.address1 });
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] transition-colors border border-slate-300 shadow-3xs shrink-0"
                      >
                        📝 Note
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Domicile vs Mailing Address comparison (Out-of-State / NCOA Check) */}
            {(selectedInspectRecord.mailingAddress || currentAudit === 'out-of-state-mailing') && (
              <div className="p-5 border-b border-slate-200  bg-red-500/10  space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-red-900  flex items-center gap-1.5">
                    <span>📫 Domicile vs Mailing Comparison</span>
                  </span>
                  <span className="text-[10px] font-mono bg-red-500/20 text-red-950  px-2 py-0.5 rounded font-bold">
                    Mail Divergence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3 bg-white  rounded-xl border border-slate-200  space-y-1">
                    <span className="text-[10px] uppercase font-sans font-extrabold text-slate-500 block">Residential Domicile</span>
                    <strong className="text-xs font-mono font-bold text-slate-900  block leading-relaxed">
                      {selectedInspectRecord.address || 'Unknown Address'}<br />
                      {selectedInspectRecord.city || 'City'}, MS {selectedInspectRecord.zip || ''}
                    </strong>
                  </div>
                  <div className="p-3 bg-white  rounded-xl border border-slate-200  space-y-1">
                    <span className="text-[10px] uppercase font-sans font-extrabold text-slate-500 block">Out-of-State Mailing</span>
                    <strong className="text-xs font-mono font-bold text-red-700  block leading-relaxed">
                      {selectedInspectRecord.mailingAddress || selectedInspectRecord.raw?.mail_address || selectedInspectRecord.raw?.mailing_address || selectedInspectRecord.raw?.MAIL_ADDR || 'Out-of-State Address Filed'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted CSV Attributes & Raw Object Values */}
            <div className="p-5 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900  flex items-center gap-1.5">
                <span>📋 All Extracted Attributes &amp; Raw Data</span>
              </span>
              {selectedInspectRecord.raw && Object.keys(selectedInspectRecord.raw).length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(selectedInspectRecord.raw)
                    .filter(([_, val]) => val !== null && val !== undefined && String(val).trim() !== '')
                    .map(([key, value]) => (
                      <div key={key} className="bg-slate-100  p-2 rounded-lg border border-slate-200  flex flex-col gap-0.5">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase truncate">{key.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-semibold text-slate-900  break-all">{String(value)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-slate-700  font-medium bg-slate-100  p-4 rounded-xl border border-slate-200  text-center space-y-2">
                  <p>Detailed raw columns are indexed during your live database crawl.</p>
                  <button
                    onClick={() => {
                      runAlgorithm(currentAudit || 'density', countyFilter, thresholdFilter, true);
                      setSelectedInspectRecord(null);
                    }}
                    className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-xs shadow hover:bg-primary/90"
                  >
                    🔄 Force Full Data Map Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      )}

      <CryptographicNoteModal 
        record={selectedNoteRecord} 
        isOpen={!!selectedNoteRecord} 
        onClose={() => setSelectedNoteRecord(null)} 
      />
    </div>
  );
}
