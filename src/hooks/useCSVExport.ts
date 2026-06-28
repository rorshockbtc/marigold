import { useState, useCallback, useRef } from 'react';
import type { ExportWorkerMessage } from '../workers/csv-export.worker';

export interface ExportState {
  isExporting: boolean;
  progress: number;
  rowsProcessed: number;
  totalRows: number;
  currentFile: number;
  filesGenerated: Array<{ filename: string; url: string; rowCount: number }>;
  error: string | null;
  isComplete: boolean;
}

export function useCSVExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    rowsProcessed: 0,
    totalRows: 0,
    currentFile: 0,
    filesGenerated: [],
    error: null,
    isComplete: false,
  });

  const workerRef = useRef<Worker | null>(null);
  const blobUrlsRef = useRef<string[]>([]);

  const startExport = useCallback((columns: string[], rowsPerFile: number) => {
    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    setState({
      isExporting: true,
      progress: 0,
      rowsProcessed: 0,
      totalRows: 0,
      currentFile: 0,
      filesGenerated: [],
      error: null,
      isComplete: false,
    });

    const worker = new Worker(
      new URL('../workers/csv-export.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<ExportWorkerMessage>) => {
      const message = e.data;
      switch (message.type) {
        case 'progress':
          setState(prev => ({
            ...prev,
            progress: message.percentComplete,
            rowsProcessed: message.rowsProcessed,
            totalRows: message.totalRows,
            currentFile: message.currentFile,
          }));
          break;
        case 'file_ready':
          const url = URL.createObjectURL(message.blob);
          blobUrlsRef.current.push(url);
          setState(prev => ({
            ...prev,
            filesGenerated: [...prev.filesGenerated, { filename: message.filename, url, rowCount: message.rowCount }],
          }));
          break;
        case 'complete':
          setState(prev => ({ ...prev, isExporting: false, isComplete: true, progress: 100 }));
          worker.terminate();
          break;
        case 'error':
          setState(prev => ({ ...prev, isExporting: false, error: message.message }));
          worker.terminate();
          break;
      }
    };

    worker.postMessage({ action: 'start', config: { rowsPerFile, columns } });
  }, []);

  const cancelExport = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setState(prev => ({ ...prev, isExporting: false, error: 'Export cancelled' }));
  }, []);

  const downloadFile = useCallback((url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAll = useCallback(() => {
    state.filesGenerated.forEach((file, index) => {
      setTimeout(() => downloadFile(file.url, file.filename), index * 500);
    });
  }, [state.filesGenerated, downloadFile]);

  const reset = useCallback(() => {
    blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
    setState({ isExporting: false, progress: 0, rowsProcessed: 0, totalRows: 0, currentFile: 0, filesGenerated: [], error: null, isComplete: false });
  }, []);

  return { state, startExport, cancelExport, downloadFile, downloadAll, reset };
}
