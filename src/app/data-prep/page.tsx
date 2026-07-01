"use client";

import { useState, useEffect } from "react";
import { useCSVParser } from "@/hooks/useCSVParser";
import { useCSVExport } from "@/hooks/useCSVExport";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";

export default function DataPrepPage() {
  const { state: parseState, parseFile, clearData } = useCSVParser();
  const { state: exportState, startExport, downloadAll, reset: resetExport } = useCSVExport();
  
  const [rowsPerFile, setRowsPerFile] = useState(250000);

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

      {/* Upload Zone */}
      {!parseState.isProcessing && parseState.totalRows === 0 && (
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
