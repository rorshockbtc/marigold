import { useState, useCallback } from 'react';
import * as Comlink from 'comlink';
import type { DataProcessorWorker } from '../workers/data-processor.worker';
import { getActiveDatabaseName, openActiveDatabase } from '@/lib/db/dbName';

export interface ParserState {
  isProcessing: boolean;
  progress: number;
  rowsParsed: number;
  bytesProcessed: number;
  totalBytes: number;
  columns: string[];
  columnMapping?: Record<string, string>;
  error: string | null;
  totalRows: number;
}

export function useCSVParser() {
  const [state, setState] = useState<ParserState>({
    isProcessing: false,
    progress: 0,
    rowsParsed: 0,
    bytesProcessed: 0,
    totalBytes: 0,
    columns: [],
    error: null,
    totalRows: 0,
  });

  const parseFile = useCallback(async (file: File) => {
    setState({
      isProcessing: true,
      progress: 0,
      rowsParsed: 0,
      bytesProcessed: 0,
      totalBytes: file.size,
      columns: [],
      error: null,
      totalRows: 0,
    });

    try {
      const workerInstance = new Worker(
        new URL('../workers/data-processor.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      const api = Comlink.wrap<DataProcessorWorker>(workerInstance);
      
      const onProgress = Comlink.proxy((progress: number, rowsParsed: number, message: string) => {
        setState(prev => ({
          ...prev,
          progress,
          rowsParsed,
        }));
      });

      const dbName = getActiveDatabaseName();
      
      const rawResult = await api.ingestCSVFile(file, dbName, onProgress);
      const result = rawResult as { totalRows: number; columns: string[]; columnMapping: Record<string, string> };
      
      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_file_connected", "true");
        localStorage.setItem("marigold_file_rows", String(result.totalRows));
        localStorage.setItem("marigold_file_name", file.name);
        
        let finalMapping = result.columnMapping as Record<string, string>;
        try {
          const oldMapStr = localStorage.getItem("marigold_file_mapping");
          if (oldMapStr && result.columns && result.columns.length > 0) {
            const oldMap = JSON.parse(oldMapStr);
            const mappedValues = Object.values(oldMap).filter(Boolean) as string[];
            if (mappedValues.length > 0) {
              const matchingCount = mappedValues.filter(val => result.columns.includes(val)).length;
              const similarity = matchingCount / mappedValues.length;
              if (similarity >= 0.85) {
                finalMapping = oldMap;
              }
            }
          }
        } catch (e) {}

        if (finalMapping) {
          localStorage.setItem("marigold_file_mapping", JSON.stringify(finalMapping));
        }
      }
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        columns: result.columns,
        columnMapping: result.columnMapping as Record<string, string>,
        totalRows: result.totalRows,
        progress: 100,
      }));
      
      workerInstance.terminate();
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: err.message || 'Worker execution failed',
      }));
    }
  }, []);

  const clearData = useCallback(async () => {
    const dbName = getActiveDatabaseName();
    const db = await openActiveDatabase(dbName);
    const transaction = db.transaction(['rows'], 'readwrite');
    transaction.objectStore('rows').clear();
    setState({
      isProcessing: false,
      progress: 0,
      rowsParsed: 0,
      bytesProcessed: 0,
      totalBytes: 0,
      columns: [],
      error: null,
      totalRows: 0,
    });
  }, []);

  return { state, parseFile, clearData };
}
