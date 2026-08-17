"use client";

import React, { useState, useCallback } from 'react';
import { useDuckDB } from '../../lib/data/DuckDBProvider';

interface DropzoneIngesterProps {
  onSchemaExtracted: (fileName: string, schema: any[]) => void;
}

export const DropzoneIngester: React.FC<DropzoneIngesterProps> = ({ onSchemaExtracted }) => {
  const { isReady, registerFileHandle, query } = useDuckDB();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const processFile = async (file: File) => {
    if (!isReady) {
      console.warn("DuckDB not ready yet.");
      return;
    }
    
    setIsProcessing(true);
    try {
      // 1. Register the zero-copy file handle with DuckDB
      await registerFileHandle(file.name, file);

      // 2. Perform a lightweight DESCRIBE to sniff the metadata without loading rows
      // We use read_csv_auto for robustness.
      const sql = `DESCRIBE SELECT * FROM read_csv_auto('${file.name}') LIMIT 0;`;
      const schemaResult = await query(sql);

      // schemaResult is an array of objects representing columns: [{ column_name: '...', column_type: '...' }, ...]
      console.log(`Schema sniffed for ${file.name}:`, schemaResult);
      
      onSchemaExtracted(file.name, schemaResult);
    } catch (err) {
      console.error("Error ingesting file:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [isReady, registerFileHandle, query, onSchemaExtracted]);

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 ${
        isDragging ? 'border-primary bg-primary/10' : 'border-gray-600 bg-surface'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {isProcessing ? (
          <p className="text-gray-300 font-medium">Extracting metadata (Zero-Copy)...</p>
        ) : (
          <div>
            <p className="text-gray-200 font-medium">Drop dataset here to begin analysis</p>
            <p className="text-gray-400 text-sm mt-1">Files remain strictly local. No PII is transmitted.</p>
          </div>
        )}
      </div>
    </div>
  );
};
