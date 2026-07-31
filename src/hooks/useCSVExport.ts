import { useState, useCallback, useRef } from 'react';
import type { ExportWorkerMessage } from '../workers/csv-export.worker';
import { getActiveDatabaseName } from '@/lib/db/dbName';
import { getDirectoryHandle } from '@/lib/fs/LocalFSManager';

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

async function verifyPermission(fileHandle: any, readWrite: boolean) {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
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

  const startExport = useCallback(async (columns: string[], rowsPerFile: number, customPrefix?: string) => {
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

    let directoryHandle = null;
    let activeGroup = "default";
    let prefix = customPrefix;

    if (typeof window !== "undefined") {
      activeGroup = (localStorage.getItem("marigold_active_group") || "default").toLowerCase();
      
      const fileName = (localStorage.getItem("marigold_file_name") || "").toUpperCase();
      if (!prefix) {
        if (fileName.includes("DEMO") || activeGroup.includes("demo") || activeGroup.includes("roosevelt") || activeGroup.includes("acme") || activeGroup.includes("sandbox")) {
          prefix = "DEMO-dataset";
        } else {
          // New Naming Convention: State_Date
          const safeGroup = activeGroup.replace(/[^a-z0-9]/gi, '_');
          const dateStr = new Date().toISOString().split('T')[0];
          prefix = `${safeGroup}_${dateStr}`;
        }
      }

      try {
        directoryHandle = await getDirectoryHandle(activeGroup);
        if (directoryHandle) {
          const hasPerm = await verifyPermission(directoryHandle, true);
          if (!hasPerm) {
            directoryHandle = null; // Fallback to blob download if they decline
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve or verify directory handle:", err);
        directoryHandle = null;
      }
    }

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
          (async () => {
            let url = '';
            if (directoryHandle && message.blob) {
              try {
                const subDirHandle = await directoryHandle.getDirectoryHandle(prefix, { create: true });
                const fileHandle = await subDirHandle.getFileHandle(message.filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(message.blob);
                await writable.close();
              } catch (err) {
                console.error("Failed to write to Marigold Local folder:", err);
                url = URL.createObjectURL(message.blob);
              }
            } else if (message.blob) {
              url = URL.createObjectURL(message.blob);
            }
            
            if (url) blobUrlsRef.current.push(url);
            
            setState(prev => ({
              ...prev,
              filesGenerated: [...prev.filesGenerated, { filename: message.filename, url, rowCount: message.rowCount }],
            }));
          })();
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

    worker.postMessage({ 
      action: 'start', 
      config: { 
        rowsPerFile, 
        columns, 
        filePrefix: prefix || "dataset", 
        dbName: getActiveDatabaseName() 
      },
      directoryHandle
    });
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
