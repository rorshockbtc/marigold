import { useState, useCallback } from 'react';
import type { ParseProgress, ParseComplete, ParseError, WorkerMessage } from '../workers/csv-parser.worker';

export interface ParserState {
  isProcessing: boolean;
  progress: number;
  rowsParsed: number;
  bytesProcessed: number;
  totalBytes: number;
  columns: string[];
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

  const parseFile = useCallback((file: File) => {
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

    const worker = new Worker(
      new URL('../workers/csv-parser.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const message = e.data;
      switch (message.type) {
        case 'progress':
          setState(prev => ({
            ...prev,
            rowsParsed: message.rowsParsed,
            bytesProcessed: message.bytesProcessed,
            totalBytes: message.totalBytes,
            progress: message.percentComplete,
          }));
          break;
        case 'complete':
          if (typeof window !== "undefined") {
            localStorage.setItem("marigold_file_connected", "true");
            localStorage.setItem("marigold_file_rows", String(message.totalRows));
            localStorage.setItem("marigold_file_name", file.name);
          }
          setState(prev => ({
            ...prev,
            isProcessing: false,
            columns: message.columns,
            totalRows: message.totalRows,
            progress: 100,
          }));
          worker.terminate();
          break;
        case 'error':
          setState(prev => ({ ...prev, isProcessing: false, error: message.message }));
          worker.terminate();
          break;
      }
    };

    worker.onerror = (error) => {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Worker initialization failed',
      }));
      worker.terminate();
    };

    worker.onmessageerror = () => {
      setState(prev => ({ ...prev, isProcessing: false, error: 'Failed to communicate with worker' }));
      worker.terminate();
    };

    worker.postMessage({ file });
  }, []);

  const clearData = useCallback(async () => {
    const db = await openDatabase();
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

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoterDataDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
