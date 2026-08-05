import { useState, useCallback } from 'react';
import * as Comlink from 'comlink';
import type { DataProcessorWorker } from '../workers/data-processor.worker';
import { getActiveDatabaseName, openActiveDatabase } from '@/lib/db/dbName';
import { getMapBySignature, saveMap } from '@/lib/firebase/map';

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
  signature: string | null;
}

async function generateSignature(columns: string[]): Promise<string> {
  const msg = JSON.stringify(columns);
  const msgUint8 = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    signature: null,
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
      signature: null,
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
      
      const signature = await generateSignature(result.columns);

      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_file_connected", "true");
        localStorage.setItem("marigold_file_rows", String(result.totalRows));
        localStorage.setItem("marigold_file_name", file.name);
        localStorage.setItem("marigold_dataset_signature", signature);
        
        let finalMapping = result.columnMapping as Record<string, string>;
        
        // 1. Try Firebase First
        const firebaseMap = await getMapBySignature(signature);
        if (firebaseMap) {
          finalMapping = firebaseMap;
          console.log("✓ Server-Side Map Applied from Firebase");
        } else {
          // 2. Fallback to LocalStorage / Heuristics
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

          // 3. Save resulting map to Firebase for the next person
          const activeGroup = localStorage.getItem("marigold_active_group") || "default";
          await saveMap(signature, finalMapping, "system-heuristic", activeGroup);
        }

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
        signature,
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
    const { getActiveDatabaseName, purgeActiveDatabase } = await import('@/lib/db/dbName');
    const dbName = getActiveDatabaseName();
    await purgeActiveDatabase(dbName);

    if (typeof window !== "undefined") {
      localStorage.setItem("marigold_file_connected", "false");
      localStorage.setItem("marigold_file_rows", "0");
      localStorage.removeItem("marigold_file_name");
      localStorage.removeItem("marigold_dataset_signature");
    }

    setState({
      isProcessing: false,
      progress: 0,
      rowsParsed: 0,
      bytesProcessed: 0,
      totalBytes: 0,
      columns: [],
      error: null,
      totalRows: 0,
      signature: null,
    });
  }, []);

  return { state, parseFile, clearData };
}
