"use client";

import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { useDuckDB } from '../../lib/data/DuckDBProvider';
import {
  isRunningInPipesDesktop,
  shouldRecommendPipesDesktop,
  PIPES_DESKTOP_URLS,
} from '../../lib/desktop/tauriPipesBridge';

interface DropzoneIngesterProps {
  onSchemaExtracted: (fileName: string, schema: any[]) => void;
}

export const DropzoneIngester: React.FC<DropzoneIngesterProps> = ({ onSchemaExtracted }) => {
  const { isReady, registerFileHandle, query } = useDuckDB();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [largeArchiveWarning, setLargeArchiveWarning] = useState<{
    file: File;
    reason: string;
  } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const materializeDuckDBFile = useCallback(
    async (file: File) => {
      if (!isReady) {
        setStatusNote('DuckDB-Wasm engine is still warming up. Please try again in a moment.');
        return;
      }

      setIsProcessing(true);
      setLargeArchiveWarning(null);
      setStatusNote(null);

      try {
        let targetFile = file;

        if (file.name.toLowerCase().endsWith('.zip')) {
          setStatusNote(`Decompressing tabular entry from ${file.name} locally...`);
          const zip = await JSZip.loadAsync(file);
          const entries = Object.values(zip.files).filter(
            (entry) =>
              !entry.dir &&
              !entry.name.startsWith('__MACOSX/') &&
              /\.(csv|tsv|txt)$/i.test(entry.name)
          );
          if (entries.length === 0) {
            throw new Error('No .csv, .tsv, or .txt dataset found inside this .zip archive.');
          }
          entries.sort((a, b) => a.name.length - b.name.length);
          const chosen = entries[0];
          const blob = await chosen.async('blob');
          const baseName = chosen.name.split('/').pop() || 'extracted_dataset.csv';
          targetFile = new File([blob], baseName, { type: 'text/plain' });
        }

        // 1. Register the zero-copy file handle with DuckDB
        await registerFileHandle(targetFile.name, targetFile);

        // 2. Materialize local table `data_file` and describe its schema
        const safeName = targetFile.name.replace(/'/g, "''");
        await query(`CREATE OR REPLACE TABLE data_file AS SELECT * FROM read_csv_auto('${safeName}');`);
        const schemaResult = await query('DESCRIBE data_file;');

        onSchemaExtracted(targetFile.name, schemaResult);
      } catch (err: any) {
        console.error('Error ingesting file:', err);
        setStatusNote(err?.message || 'Unable to stream dataset into DuckDB-Wasm.');
      } finally {
        setIsProcessing(false);
      }
    },
    [isReady, registerFileHandle, query, onSchemaExtracted]
  );

  const processFile = useCallback(
    async (file: File) => {
      const advisor = shouldRecommendPipesDesktop(file);
      if (advisor.recommend && !isRunningInPipesDesktop()) {
        setLargeArchiveWarning({
          file,
          reason: advisor.reason,
        });
        return;
      }
      await materializeDuckDBFile(file);
    },
    [materializeDuckDBFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        processFile(file);
      }
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors duration-200 ${
          isDragging ? 'border-[#B45309] bg-[#FEF3C7]/40' : 'border-[#D6D0C4] bg-[#FAF8F5]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className="w-12 h-12 text-[#B45309]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isProcessing ? (
            <p className="text-[#1C1917] font-semibold">
              {statusNote || 'Extracting metadata & materializing DuckDB table locally...'}
            </p>
          ) : (
            <div>
              <p className="text-[#1C1917] font-semibold">
                Drop .CSV, .TSV, .TXT, or .ZIP dataset here to begin analysis
              </p>
              <p className="text-[#57534E] text-sm mt-1">
                Files remain strictly local in DuckDB-Wasm. Zero PII is transmitted.
              </p>
            </div>
          )}
          {statusNote && !isProcessing && (
            <p className="text-xs font-mono text-[#92400E] bg-[#FEF3C7] px-3 py-1.5 rounded-lg border border-[#F59E0B]/40">
              {statusNote}
            </p>
          )}
        </div>
      </div>

      {largeArchiveWarning && (
        <div className="bg-[#FEF3C7] border border-[#B45309]/40 rounded-xl p-5 text-[#1C1917] space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#92400E]">
            Large Archive Detected ({largeArchiveWarning.file.name})
          </div>
          <p className="text-sm leading-relaxed text-[#451A03]">{largeArchiveWarning.reason}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={PIPES_DESKTOP_URLS.downloadMarigoldModule}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#1C1917] hover:bg-[#B45309] text-white text-xs font-bold transition-colors"
            >
              Open 4GB+ Archive in Pipes Desktop (Marigold Module) &rarr;
            </a>
            <button
              type="button"
              onClick={() => materializeDuckDBFile(largeArchiveWarning.file)}
              className="px-4 py-2.5 rounded-lg border border-[#B45309] bg-white hover:bg-[#FAF8F5] text-[#78350F] text-xs font-bold transition-colors cursor-pointer"
            >
              Continue Browser Wasm Extraction Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
