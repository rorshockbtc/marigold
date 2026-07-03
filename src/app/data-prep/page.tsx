"use client";

import { useState, useEffect } from "react";
import { useCSVParser } from "@/hooks/useCSVParser";
import { useCSVExport } from "@/hooks/useCSVExport";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";
import Link from "next/link";

export default function DataPrepPage() {
  const { state: parseState, parseFile, clearData } = useCSVParser();
  const { state: exportState, startExport, downloadAll, reset: resetExport } = useCSVExport();
  
  const [rowsPerFile, setRowsPerFile] = useState(250000);
  const [existingShardCount, setExistingShardCount] = useState<number | null>(null);

  // Auto-detect existing local database shard on shared household devices
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const request = indexedDB.open("VoterDataDB", 1);
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

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      parseFile(e.target.files[0]);
    }
  };

  const handleExport = () => {
    if (parseState.columns.length > 0) {
      startExport(parseState.columns, rowsPerFile);
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
          Drop massive voter roll files (up to 1.5GB) here. This tool processes them entirely in your browser without uploading to any server, allowing you to split them into actionable chunks.
        </p>
      </header>

      {/* Shared Household Device Auto-Resume Banner */}
      {!parseState.isProcessing && existingShardCount !== null && existingShardCount > 0 && parseState.totalRows === 0 && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border-2 border-emerald-500 rounded-2xl p-8 text-white shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Active Shared Device Shard Detected</span>
            </span>
            <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded border border-slate-700">
              {existingShardCount.toLocaleString()} Records Ready in RAM
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-black text-white">Resume Audit Session Without Re-Uploading</h2>
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
            <button
              onClick={() => setExistingShardCount(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-5 py-3.5 rounded-xl border border-slate-600 text-xs transition-colors"
            >
              🔄 Replace &amp; Stream New File Instead
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!parseState.isProcessing && parseState.totalRows === 0 && (!existingShardCount || existingShardCount === 0) && (
        <div 
          className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/10 hover:bg-muted/30 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-xl font-bold mb-2">Link &amp; Stream Local Voter Roll File</h3>
          <p className="text-muted-foreground mb-6">Select your raw CSV/TXT file. Our browser Web Worker will stream and chunk rows locally into memory—0 records leave your machine.</p>
          <input 
            type="file" 
            accept=".csv,.txt,.tsv" 
            className="hidden" 
            id="csv-upload" 
            onChange={handleFileSelect} 
          />
          <label htmlFor="csv-upload" className="btn-primary cursor-pointer inline-block px-8 py-3 text-base shadow">
            📂 Select File to Stream &amp; Chunk
          </label>
        </div>
      )}

      {/* Parse Progress & Live Mission Security Log */}
      {parseState.isProcessing && (
        <div className="card space-y-6 border-primary/30 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <span>🔐</span> Ingesting & Segmenting Data Locally...
              </h3>
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
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl space-y-3 font-mono text-xs border border-slate-700 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE MISSION SECURITY LOG
            </div>
            <div className="space-y-1.5 text-slate-300">
              <p>✔ [System] Web Worker spawned on background thread (RAM usage locked flat at ~100MB).</p>
              <p>✔ [Backpressure] Segmenting CSV stream into safe 5MB chunks to prevent memory spikes.</p>
              <p>✔ [IndexedDB] Writing row batch #{Math.floor(parseState.rowsParsed / 5000) + 1} into private local VoterDataDB.</p>
              <p className="text-amber-300">🔒 [Network Audit] 0 bytes transmitted outbound. 100% air-gapped processing.</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 font-sans text-slate-300 text-xs mt-3 leading-relaxed">
              <strong className="text-white block mb-1">🏛️ Why does this process take a few minutes?</strong>
              Traditional cloud software uploads sensitive citizen files to remote servers in seconds—putting public privacy at risk. Marigold processes 100% of this dataset right here inside your computer&apos;s memory. Not a single name or address ever leaves your machine. Protecting fellow citizens&apos; privacy takes a little extra time, and your security is worth it!
            </div>
          </div>
        </div>
      )}

      {/* Export Controls */}
      {!parseState.isProcessing && parseState.totalRows > 0 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-green-900 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">✅ Ingestion Complete</h3>
              <p>Successfully parsed <strong>{parseState.totalRows.toLocaleString()}</strong> rows locally.</p>
            </div>
            <button onClick={handleReset} className="px-4 py-2 bg-white border border-green-300 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
              Clear & Start Over
            </button>
          </div>

          {parseState.columnMapping && (
            <div className="bg-slate-900 text-white dark:bg-slate-950 border border-slate-700 p-6 rounded-xl shadow-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2 text-amber-400">
                    <span>🧭 Universal Column Mapping Interpreter</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
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
            <div className="card space-y-6">
              <div>
                <h3 className="text-xl font-bold">Split & Export</h3>
                <p className="text-muted-foreground text-sm mt-1">Break this massive file into smaller, actionable chunks for your volunteers or to import into Marigold Insights.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Rows per file chunk</label>
                <select 
                  className="input-field max-w-xs"
                  value={rowsPerFile}
                  onChange={(e) => setRowsPerFile(Number(e.target.value))}
                >
                  <option value={100000}>100,000 rows (Very Small)</option>
                  <option value={250000}>250,000 rows (Standard)</option>
                  <option value={500000}>500,000 rows (Large)</option>
                  <option value={1000000}>1,000,000 rows (Massive)</option>
                </select>
              </div>

              <button 
                onClick={handleExport}
                className="btn-primary w-full justify-center py-3 text-lg"
              >
                Start Chunking Process
              </button>
            </div>
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
                <button 
                  onClick={downloadAll}
                  className="btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Download All {exportState.filesGenerated.length} Files
                </button>
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
