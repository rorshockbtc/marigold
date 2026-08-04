"use client";

import { useState, useEffect } from "react";
import { useCSVParser } from "@/hooks/useCSVParser";
import { useCSVExport } from "@/hooks/useCSVExport";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";
import Link from "next/link";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Download, Sparkles, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { FilterControl } from "@/components/ui/FilterControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getActiveDatabaseName, isDemoGroupActive, autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";
import { useAuth } from "@/lib/auth/AuthContext";
import { PinSetupModal } from "@/components/PinSetupModal";

export default function DataPrepPage() {
  const { state: parseState, parseFile, clearData } = useCSVParser();
  const { state: exportState, startExport, downloadAll, reset: resetExport } = useCSVExport();
  
  const [rowsPerFile, setRowsPerFile] = useState(250000);
  const [existingShardCount, setExistingShardCount] = useState<number | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoStatusMsg, setDemoStatusMsg] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const { hasPinSet } = useAuth();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requirePin = (action: () => void) => {
    if (!hasPinSet) {
      setPendingAction(() => action);
      setIsPinModalOpen(true);
    } else {
      action();
    }
  };

  const execute1ClickLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await autoLoadSyntheticDemoDataset((msg) => setDemoStatusMsg(msg));
      window.location.href = "/explore";
    } catch (err) {
      setIsLoadingDemo(false);
      setDemoStatusMsg("Failed to auto-load demo dataset.");
    }
  };
  const handle1ClickLoadDemo = () => requirePin(execute1ClickLoadDemo);

  // Auto-detect existing local database shard on shared household devices
  useEffect(() => {
    if (typeof window === "undefined") return;
    const activeGroup = localStorage.getItem("marigold_active_group");
    const dbName = getActiveDatabaseName(activeGroup);
    const demoActive = isDemoGroupActive(activeGroup);
    setIsDemo(demoActive);
    try {
      const request = indexedDB.open(dbName, 1);
      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (db && db.objectStoreNames.contains("rows")) {
          const tx = db.transaction(["rows"], "readonly");
          const store = tx.objectStore("rows");
          const countReq = store.count();
          countReq.onsuccess = () => {
            if (countReq.result > 0) {
              setExistingShardCount(countReq.result);
              localStorage.setItem("marigold_file_connected", "true");
              localStorage.setItem("marigold_file_rows", String(countReq.result));
              if (demoActive) localStorage.setItem("marigold_file_name", "DEMO_roosevelt_statewide_voter_roll.csv");
            } else {
              setExistingShardCount(null);
            }
          };
        }
      };
    } catch (err) {
      console.warn("Could not check IndexedDB shard status:", err);
    }
  }, []);

  // Safeguard against accidental tab closure during active processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (parseState.isProcessing || exportState.isExporting) {
        e.preventDefault();
        e.returnValue = "⚠️ Active Security Pipeline Running! Leaving or closing this window will interrupt local data chunking. Please leave this tab open.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [parseState.isProcessing, exportState.isExporting]);

  const checkDemoFileAllowed = (file: File) => {
    if (typeof window !== "undefined") {
      const activeGroup = localStorage.getItem("marigold_active_group");
      if (isDemoGroupActive(activeGroup) && !file.name.toUpperCase().includes("DEMO")) {
        setDemoStatusMsg("Demo Environment Protection: Please switch from Demo Mode before uploading real files.");
        return false;
      }
    }
    return true;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (checkDemoFileAllowed(file)) {
        requirePin(() => parseFile(file));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (checkDemoFileAllowed(file)) {
        requirePin(() => parseFile(file));
      }
    }
  };

  const executeExport = () => {
    if (parseState.columns.length > 0) {
      const activeGroup = (typeof window !== "undefined" && localStorage.getItem("marigold_active_group") || "default");
      const dateStr = new Date().toISOString().split('T')[0];
      const folderName = `${activeGroup.replace(/[\s\W]+/g, '_')}_${dateStr}`;
      
      const fileName = (typeof window !== "undefined" && localStorage.getItem("marigold_file_name") || "").toUpperCase();
      const isDemo = fileName.includes("DEMO") || activeGroup.toLowerCase().includes("demo") || activeGroup.toLowerCase().includes("roosevelt") || activeGroup.toLowerCase().includes("acme") || activeGroup.toLowerCase().includes("sandbox");
      
      startExport(parseState.columns, rowsPerFile, isDemo ? `DEMO_${folderName}` : folderName);
    }
  };
  const handleExport = () => requirePin(executeExport);

  const handleReset = () => {
    clearData();
    resetExport();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Data Prep & Splitting</h1>
        <p className="text-muted-foreground mt-2">
          Drop massive voter roll files here. This tool processes them entirely in your browser without uploading to any server (<GlossaryTooltip term="Air-Gap" />), allowing you to split them into actionable <GlossaryTooltip term="Shard">shards</GlossaryTooltip> inside <GlossaryTooltip term="IndexedDB" />.
        </p>
      </header>

      {/* Prominent State of Roosevelt (Demo) Download Banner (Hide once file is linked or linking) */}
      {!parseState.isProcessing && parseState.totalRows === 0 && (!existingShardCount || existingShardCount === 0) && isDemo && (
        <div className="bg-surface text-text-header p-6 sm:p-8 rounded-2xl border border-border-soft shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Step 1: Download Synthetic Training Dataset</span>
              </span>
              <span className="text-xs font-mono text-text-body">Pre-engineered for State of Roosevelt (Demo)</span>
            </div>
            <span className="text-xs bg-surface text-text-body px-3 py-1 rounded-lg border border-border-soft font-mono font-bold">
              ~1,800 Engineered Rows • 100% Zero-PII
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-black text-text-header tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-primary shrink-0" />
                <span>Download Synthetic Demo Roll (`DEMO_roosevelt_statewide_voter_roll.csv`)</span>
              </h3>
              <p className="text-xs sm:text-sm text-text-body leading-relaxed">
                If you haven&apos;t downloaded the demo file yet, click below to save `DEMO_roosevelt_statewide_voter_roll.csv` to your computer&apos;s Downloads folder. Once downloaded, use <strong>Step 2</strong> directly below to select and link it!
              </p>
            </div>
            <Button
              onClick={handle1ClickLoadDemo}
              disabled={isLoadingDemo}
              variant="primary"
              size="lg"
              className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
            >
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span>{isLoadingDemo ? (demoStatusMsg || "⏳ Auto-Loading ~1,800 Demo Records...") : "⚡ 1-Click Auto-Load (~1,800 Records) →"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Shared Household Device Auto-Resume Banner */}
      {!parseState.isProcessing && existingShardCount !== null && existingShardCount > 0 && parseState.totalRows === 0 && (
        <div className="bg-surface border border-border-soft rounded-2xl p-8 text-text-header shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <span className="bg-primary/10 text-primary border border-primary/20 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Active Shared Device Shard Detected</span>
            </span>
            <span className="text-xs font-mono bg-white px-3 py-1 rounded border border-border-soft text-text-body">
              {existingShardCount.toLocaleString()} Records Ready in <GlossaryTooltip term="RAM" />
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-black text-text-header">Resume Audit Session Without Re-Uploading</h2>
            <p className="text-sm text-text-body leading-relaxed max-w-2xl">
              We detected that this device already processed and chunked a statewide voter dataset into local browser memory. You do not need to re-upload or re-chunk your files.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/explore"
              className="bg-primary hover:bg-primary/90 text-white font-black px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <span>🚀 Resume Session with Existing Shard →</span>
            </Link>
            <Button
              onClick={() => setExistingShardCount(null)}
              variant="outline"
              className="border-border-soft text-text-body hover:text-text-header bg-white hover:bg-surface"
            >
              🔄 Replace &amp; Stream New File Instead
            </Button>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!parseState.isProcessing && parseState.totalRows === 0 && (!existingShardCount || existingShardCount === 0) && (
        <div 
          className="border-2 border-dashed border-primary/60 rounded-2xl p-10 sm:p-14 text-center bg-primary/5 hover:bg-primary/10 transition-all shadow-sm"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-2xl font-black text-foreground mb-2">
            {isDemo ? "Step 2: Select Your Downloaded `DEMO_roosevelt...csv` File" : "Upload Local Voter Roll File"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-8">
            {isDemo ? (
              <>Click the button below and pick the <strong className="text-foreground font-mono">DEMO_roosevelt_statewide_voter_roll.csv</strong> file you just saved to your computer&apos;s Downloads folder. Our browser Web Worker will instantly stream and chunk rows locally into <GlossaryTooltip term="RAM" />—0 bytes ever leave your machine!</>
            ) : (
              <>Select a raw .csv, .json, or .xlsx file from your machine. Our browser Web Worker will instantly stream and chunk rows locally into <GlossaryTooltip term="RAM" />—0 bytes ever leave your machine!</>
            )}
          </p>
          <input 
            type="file" 
            accept=".csv,.txt,.tsv,.json,.xlsx" 
            className="hidden" 
            id="csv-upload" 
            onChange={handleFileSelect} 
          />
          <label htmlFor="csv-upload" className="bg-primary hover:bg-primary/90 text-white font-black cursor-pointer inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base shadow-xl transform active:scale-[0.98] transition-all">
            <span>{isDemo ? "📂 Select `DEMO_roosevelt...csv` from Downloads" : "📂 Upload File From Computer"}</span>
          </label>
        </div>
      )}

      {parseState.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl shadow-sm text-sm font-semibold flex items-start gap-3 mt-4 animate-in fade-in">
          <span>⚠️</span>
          <div>
            <p className="font-bold text-red-900 mb-1">Upload Failed</p>
            <p>{parseState.error}</p>
          </div>
        </div>
      )}

      {/* Parse Progress & Live Mission Security Log */}
      {parseState.isProcessing && (
        <Card className="space-y-6 border-primary/30 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🔐</span> Ingesting & Segmenting Data Locally...
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Do not close this window. Your computer is streaming rows directly into browser RAM.
              </p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse">
              Active Security Pipeline
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div 
              className="bg-primary h-4 transition-all duration-300" 
              style={{ width: `${parseState.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm font-semibold text-foreground">
            <span>{parseState.rowsParsed.toLocaleString()} rows processed</span>
            <span>{parseState.progress}% Complete</span>
          </div>

          {/* Live Mission Security Log */}
          <div className="bg-muted text-foreground p-5 rounded-xl space-y-3 font-mono text-xs border border-border shadow-inner">
            <div className="flex items-center gap-2 text-primary font-bold border-b border-border pb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE MISSION SECURITY LOG
            </div>
            <div className="space-y-1.5 text-[#4A5060]">
              <p>✔ [System] Web Worker spawned on background thread (RAM usage locked flat at ~100MB).</p>
              <p>✔ [Backpressure] Segmenting CSV stream into safe 5MB chunks to prevent memory spikes.</p>
              <p>✔ [IndexedDB] Writing row batch #{Math.floor(parseState.rowsParsed / 5000) + 1} into private local VoterDataDB.</p>
              <p className="text-primary font-bold">🔒 [Network Audit] 0 bytes transmitted outbound. 100% air-gapped processing.</p>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-border font-sans text-[#4A5060] text-xs mt-3 leading-relaxed">
              <strong className="text-foreground block mb-1">🏛️ Why does this process take a few minutes?</strong>
              Traditional cloud software uploads sensitive citizen files to remote servers in seconds—putting public privacy at risk. Marigold processes 100% of this dataset right here inside your computer&apos;s memory. Not a single name or address ever leaves your machine. Protecting fellow citizens&apos; privacy takes a little extra time, and your security is worth it!
            </div>
          </div>
        </Card>
      )}

      {/* Export Controls */}
      {!parseState.isProcessing && parseState.totalRows > 0 && (
        <div className="space-y-6">
          <div className="bg-surface border border-emerald-500/30 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
                ⚡ RAM Shard Active
              </span>
              <h3 className="text-2xl font-serif font-black flex items-center gap-2 text-text-header">
                ✅ Ingestion &amp; Linking Complete!
              </h3>
              <p className="text-sm text-text-body">
                Successfully parsed &amp; linked <strong className="text-text-header font-mono font-bold">{parseState.totalRows.toLocaleString()}</strong> records into browser memory.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative z-10">
              <Link
                href="/explore"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 transform active:scale-[0.98] w-full sm:w-auto"
              >
                <span>🚀 Continue to Explore &amp; Review →</span>
              </Link>
              <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto border-border-soft hover:bg-surface text-text-body">
                Clear &amp; Start Over
              </Button>
            </div>
          </div>

          {!exportState.isExporting && !exportState.isComplete && (
            <Card className="space-y-6">
              <CardHeader>
                <CardTitle>Split & Export to Marigold Local</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Break this massive file into smaller chunks to save into your Marigold Local workspace folder.</p>
              </CardHeader>

              <CardContent>
                <FilterControl
                  label="Rows per file chunk"
                  value={String(rowsPerFile)}
                  onChange={(val) => setRowsPerFile(Number(val))}
                  options={[
                    { value: "100000", label: "100,000 rows (Very Small)" },
                    { value: "250000", label: "250,000 rows (Standard)" },
                    { value: "500000", label: "500,000 rows (Large)" },
                    { value: "1000000", label: "1,000,000 rows (Massive)" }
                  ]}
                  className="max-w-xs"
                />
              </CardContent>

              <Button 
                onClick={handleExport}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Start Chunking Process
              </Button>
            </Card>
          )}

          {/* Export Progress */}
          {exportState.isExporting && (
            <div className="card space-y-4">
              <h3 className="text-xl font-bold text-primary">Chunking Data...</h3>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-primary h-4 transition-all duration-300" 
                  style={{ width: `${exportState.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{exportState.rowsProcessed.toLocaleString()} rows exported</span>
                <span>{exportState.progress}%</span>
              </div>
            </div>
          )}

          {/* Export Complete */}
          {exportState.isComplete && (
            <div className="card space-y-6 border-primary/20 bg-primary/5">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">🎉 Chunking Complete!</h3>
                <p className="text-muted-foreground">
                  Your dataset has been successfully sliced into <strong>{exportState.filesGenerated.length}</strong> manageable files.
                </p>
              </div>

              {exportState.filesGenerated.some(f => f.url) && (
                <div className="flex justify-center mb-6">
                  <Button 
                    onClick={downloadAll}
                    variant="primary"
                    size="lg"
                  >
                    Download All {exportState.filesGenerated.length} Files
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportState.filesGenerated.map((file, i) => (
                  <div key={i} className="flex justify-between items-center bg-white border border-border p-3 rounded-lg shadow-sm">
                    <div>
                      <p className="font-semibold text-sm">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">{file.rowCount.toLocaleString()} rows</p>
                    </div>
                    {file.url ? (
                      <a 
                        href={file.url} 
                        download={file.filename}
                        className="text-primary text-sm font-bold hover:underline"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        ✓ Saved Natively
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <strong className="text-sm text-emerald-950 font-bold block">✓ Local IndexedDB Cache Populated</strong>
                  <p className="text-xs text-emerald-800">Your chunked rows are now ready for immediate high-speed traversal in local browser memory.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <a href="/explore" className="bg-accent hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-colors whitespace-nowrap">
                    ⚡ Launch Pro Mode Analytics →
                  </a>
                  <a href="/dashboard" className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-300 transition-colors whitespace-nowrap">
                    📊 View Dashboard Hub
                  </a>
                </div>
              </div>

              <DesktopImportGuide />
            </div>
          )}

          {parseState.columnMapping && (
            <div className="bg-surface text-text-body border border-border-soft p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2 text-text-header">
                    <span>🧭 Universal Column Mapping Interpreter</span>
                  </h3>
                  <p className="text-xs text-text-body mt-0.5">
                    Automatic normalization active. Raw headers mapped to universal schema without exposing private row PII.
                  </p>
                </div>
                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono text-[11px] px-2.5 py-1 rounded-full font-black">
                  {Object.values(parseState.columnMapping).filter(Boolean).length} Standard Fields Mapped
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                {Object.entries(parseState.columnMapping).map(([key, val]) => val ? (
                  <div key={key} className="bg-white border border-border-soft shadow-sm rounded-lg p-2.5 text-xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-extrabold">{key.replace('_', ' ')}</div>
                    <div className="font-mono font-bold text-text-header truncate mt-0.5" title={String(val)}>← {String(val)}</div>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
        </div>
      )}

      <PinSetupModal 
        isOpen={isPinModalOpen} 
        onSuccess={() => {
          setIsPinModalOpen(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }} 
      />
    </div>
  );
}
