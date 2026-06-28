"use client";

import { useState } from "react";
import { useCSVParser } from "@/hooks/useCSVParser";
import { useCSVExport } from "@/hooks/useCSVExport";
import { DesktopImportGuide } from "@/components/DesktopImportGuide";

export default function DataPrepPage() {
  const { state: parseState, parseFile, clearData } = useCSVParser();
  const { state: exportState, startExport, downloadAll, reset: resetExport } = useCSVExport();
  
  const [rowsPerFile, setRowsPerFile] = useState(250000);

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
          <h3 className="text-xl font-bold mb-2">Drag and drop your massive CSV here</h3>
          <p className="text-muted-foreground mb-6">or click below to browse your computer.</p>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            id="csv-upload" 
            onChange={handleFileSelect} 
          />
          <label htmlFor="csv-upload" className="btn-primary cursor-pointer inline-block">
            Select File
          </label>
        </div>
      )}

      {/* Parse Progress */}
      {parseState.isProcessing && (
        <div className="card space-y-4">
          <h3 className="text-xl font-bold text-primary">Ingesting File...</h3>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div 
              className="bg-primary h-4 transition-all duration-300" 
              style={{ width: `${parseState.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{parseState.rowsParsed.toLocaleString()} rows parsed</span>
            <span>{parseState.progress}%</span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            This is happening entirely in your browser. No data is being sent to the cloud.
          </p>
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

              <DesktopImportGuide />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
