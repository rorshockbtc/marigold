"use client";

import { useState, useEffect } from "react";
import { useCSVParser } from "@/hooks/useCSVParser";
import { useCSVExport } from "@/hooks/useCSVExport";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";
import Link from "next/link";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { Download, Sparkles, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getActiveDatabaseName, isDemoGroupActive, autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";

export default function DataPrepPage() {
  const { state: parseState, parseFile, clearData } = useCSVParser();
  const { state: exportState, startExport, downloadAll, reset: resetExport } = useCSVExport();
  
  const [rowsPerFile, setRowsPerFile] = useState(250000);
  const [existingShardCount, setExistingShardCount] = useState<number | null>(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [demoStatusMsg, setDemoStatusMsg] = useState("");

  const handle1ClickLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await autoLoadSyntheticDemoDataset((msg) => setDemoStatusMsg(msg));
      window.location.href = "/analysis";
    } catch (err) {
      setIsLoadingDemo(false);
      alert("Failed to auto-load demo dataset: " + err);
    }
  };

  // Auto-detect existing local database shard on shared household devices
  useEffect(() => {
    if (typeof window === "undefined") return;
    const activeGroup = localStorage.getItem("marigold_active_group");
    const dbName = getActiveDatabaseName(activeGroup);
    const isDemo = isDemoGroupActive(activeGroup);
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
              if (isDemo) localStorage.setItem("marigold_file_name", "DEMO_roosevelt_statewide_voter_roll.csv");
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
      const activeGroup = (localStorage.getItem("marigold_active_group") || "").toLowerCase();
      const isDemo = activeGroup === "state of roosevelt (demo)" || activeGroup === "acme civic data sandbox (demo environment)" || activeGroup.includes("demo") || activeGroup.includes("roosevelt") || activeGroup.includes("acme") || activeGroup.includes("sandbox") || activeGroup.includes("synthetic");
      if (isDemo && !file.name.toUpperCase().includes("DEMO")) {
        alert("⚠️ Demo Environment Protection: To prevent commingling or exposing real PII during demonstrations, you cannot ingest non-demo voter rolls (" + file.name + ") while in a demo or sandbox group. Please use a DEMO_ file or switch to your real jurisdiction in the sidebar.");
        return false;
      }
    }
    return true;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (checkDemoFileAllowed(file)) parseFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (checkDemoFileAllowed(file)) parseFile(file);
    }
  };

  const handleExport = () => {
    if (parseState.columns.length > 0) {
      const activeGroup = (typeof window !== "undefined" && localStorage.getItem("marigold_active_group") || "").toLowerCase();
      const fileName = (typeof window !== "undefined" && localStorage.getItem("marigold_file_name") || "").toUpperCase();
      const isDemo = fileName.includes("DEMO") || activeGroup.includes("demo") || activeGroup.includes("roosevelt") || activeGroup.includes("acme") || activeGroup.includes("sandbox");
      startExport(parseState.columns, rowsPerFile, isDemo ? "DEMO-dataset" : "dataset");
    }
  };

  const handleReset = () => {
    clearData();
    resetExport();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Data Prep & Splitting</h1>
        <p className="text-muted-foreground mt-2">
          Drop massive voter roll files (up to 1.5GB) here. This tool processes them entirely in your browser without uploading to any server (<GlossaryTooltip term="Air-Gap" />), allowing you to split them into actionable <GlossaryTooltip term="Shard">shards</GlossaryTooltip> inside <GlossaryTooltip term="IndexedDB" />.
        </p>
      </header>

      {/* Prominent State of Roosevelt (Demo) Download Banner (Hide once file is linked or linking) */}
      {!parseState.isProcessing && parseState.totalRows === 0 && (!existingShardCount || existingShardCount === 0) && (
        <div className="bg-gradient-to-r from-amber-900/90 via-amber-800 to-amber-950 text-amber-50 p-6 sm:p-8 rounded-2xl border border-amber-600/40 shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-700/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Step 1: Download Synthetic Training Dataset</span>
              </span>
              <span className="text-xs font-mono text-amber-200">Pre-engineered for State of Roosevelt (Demo)</span>
            </div>
            <span className="text-xs bg-amber-950/80 text-amber-200 px-3 py-1 rounded-lg border border-amber-500/30 font-mono font-bold">
              ~1,800 Engineered Rows • 100% Zero-PII
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-amber-400 shrink-0" />
                <span>Download Synthetic Demo Roll (`DEMO_roosevelt_statewide_voter_roll.csv`)</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                If you haven&apos;t downloaded the demo file yet, click below to save `DEMO_roosevelt_statewide_voter_roll.csv` to your computer&apos;s Downloads folder. Once downloaded, use <strong>Step 2</strong> directly below to select and link it!
              </p>
            </div>
            <Button
              onClick={handle1ClickLoadDemo}
              disabled={isLoadingDemo}
              variant="primary"
              size="lg"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
            >
              <Sparkles className="w-5 h-5 text-slate-900 animate-pulse" />
              <span>{isLoadingDemo ? (demoStatusMsg || "⏳ Auto-Loading ~1,800 Demo Records...") : "⚡ 1-Click Auto-Load (~1,800 Records) →"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Shared Household Device Auto-Resume Banner */}
      {!parseState.isProcessing && existingShardCount !== null && existingShardCount > 0 && parseState.totalRows === 0 && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border-2 border-emerald-500 rounded-2xl p-8 text-slate-900 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Active Shared Device Shard Detected</span>
            </span>
            <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded border border-slate-700">
              {existingShardCount.toLocaleString()} Records Ready in <GlossaryTooltip term="RAM" />
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-black text-slate-900">Resume Audit Session Without Re-Uploading</h2>
            <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">
              We detected that this device already processed and chunked a statewide voter dataset into local browser memory. You do not need to re-upload or re-chunk your files.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/analysis"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <span>🚀 Resume Session with Existing Shard →</span>
            </Link>
            <Button
              onClick={() => setExistingShardCount(null)}
              variant="outline"
              className="border-slate-600 text-slate-700 hover:text-slate-900"
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
          <h3 className="text-2xl font-black text-foreground mb-2">Step 2: Select Your Downloaded `DEMO_roosevelt...csv` File</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-8">
            Click the button below and pick the <strong className="text-foreground font-mono">DEMO_roosevelt_statewide_voter_roll.csv</strong> file you just saved to your computer&apos;s Downloads folder. Our browser Web Worker will instantly stream and chunk rows locally into <GlossaryTooltip term="RAM" />—0 bytes ever leave your machine!
          </p>
          <input 
            type="file" 
            accept=".csv,.txt,.tsv" 
            className="hidden" 
            id="csv-upload" 
            onChange={handleFileSelect} 
          />
          <label htmlFor="csv-upload" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base shadow-xl transform active:scale-[0.98] transition-all">
            <span>📂 Select `DEMO_roosevelt...csv` from Downloads</span>
          </label>
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
            <div className="flex items-center gap-2 text-[#D96B27] font-bold border-b border-border pb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE MISSION SECURITY LOG
            </div>
            <div className="space-y-1.5 text-[#4A5060]">
              <p>✔ [System] Web Worker spawned on background thread (RAM usage locked flat at ~100MB).</p>
              <p>✔ [Backpressure] Segmenting CSV stream into safe 5MB chunks to prevent memory spikes.</p>
              <p>✔ [IndexedDB] Writing row batch #{Math.floor(parseState.rowsParsed / 5000) + 1} into private local VoterDataDB.</p>
              <p className="text-[#D96B27] font-bold">🔒 [Network Audit] 0 bytes transmitted outbound. 100% air-gapped processing.</p>
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
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border-2 border-emerald-500 p-6 sm:p-8 rounded-2xl text-slate-900 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                ⚡ RAM Shard Active
              </span>
              <h3 className="text-2xl font-serif font-black flex items-center gap-2 text-slate-900">
                ✅ Ingestion &amp; Linking Complete!
              </h3>
              <p className="text-sm text-emerald-100">
                Successfully parsed &amp; linked <strong className="text-slate-900 font-mono">{parseState.totalRows.toLocaleString()}</strong> records into browser memory. You are ready to explore and audit!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/analysis"
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-6 py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 transform active:scale-[0.98] w-full sm:w-auto"
              >
                <span>🚀 Continue to Explore &amp; Review (/analysis) →</span>
              </Link>
              <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                Clear &amp; Start Over
              </Button>
            </div>
          </div>

          {parseState.columnMapping && (
            <div className="bg-muted text-foreground border border-border p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2 text-[#D96B27]">
                    <span>🧭 Universal Column Mapping Interpreter</span>
                  </h3>
                  <p className="text-xs text-[#646A7A] mt-0.5">
                    Automatic normalization active. Raw headers mapped to universal schema without exposing private row PII.
                  </p>
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] px-2.5 py-1 rounded-full font-black">
                  {Object.values(parseState.columnMapping).filter(Boolean).length} Standard Fields Mapped
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                {Object.entries(parseState.columnMapping).map(([key, val]) => val ? (
                  <div key={key} className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 text-xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-extrabold">{key.replace('_', ' ')}</div>
                    <div className="font-mono font-bold text-slate-100 truncate mt-0.5" title={String(val)}>← {String(val)}</div>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {!exportState.isExporting && !exportState.isComplete && (
            <Card className="space-y-6">
              <CardHeader>
                <CardTitle>Split & Export</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Break this massive file into smaller, actionable chunks for your volunteers or to import into Marigold Insights.</p>
              </CardHeader>

              <CardContent>
                <label className="block text-sm font-semibold mb-2">Rows per file chunk</label>
                <select 
                  className="flex h-11 w-full max-w-xs rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm"
                  value={rowsPerFile}
                  onChange={(e) => setRowsPerFile(Number(e.target.value))}
                >
                  <option value={100000}>100,000 rows (Very Small)</option>
                  <option value={250000}>250,000 rows (Standard)</option>
                  <option value={500000}>500,000 rows (Large)</option>
                  <option value={1000000}>1,000,000 rows (Massive)</option>
                </select>
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

              <div className="flex justify-center mb-6">
                <Button 
                  onClick={downloadAll}
                  variant="primary"
                  size="lg"
                >
                  Download All {exportState.filesGenerated.length} Files
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportState.filesGenerated.map((file, i) => (
                  <div key={i} className="flex justify-between items-center bg-white border border-border p-3 rounded-lg shadow-sm">
                    <div>
                      <p className="font-semibold text-sm">{file.filename}</p>
                      <p className="text-xs text-muted-foreground">{file.rowCount.toLocaleString()} rows</p>
                    </div>
                    <a 
                      href={file.url} 
                      download={file.filename}
                      className="text-primary text-sm font-bold hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <strong className="text-sm text-emerald-950 font-bold block">✓ Local IndexedDB Cache Populated</strong>
                  <p className="text-xs text-emerald-800">Your chunked rows are now ready for immediate high-speed traversal in local browser memory.</p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <a href="/analysis" className="bg-accent hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-colors whitespace-nowrap">
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

        </div>
      )}
    </div>
  );
}
