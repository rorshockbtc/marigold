import { useState, useCallback, useRef } from 'react';
import type { ExportWorkerMessage } from '../workers/csv-export.worker';
import { getActiveDatabaseName } from '@/lib/db/dbName';
import { getBestAvailableSovereignStorage, verifyPermission, writeStructuredFile } from '@/lib/fs/LocalFSManager';
import { createMassiveDatasetManifest, DatasetShardDescriptor } from '@/lib/datasets/massiveDatasetEngine';

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

    let directoryHandle: FileSystemDirectoryHandle | null = null;
    let storageTier: 'native-fs' | 'opfs' | 'indexeddb' = 'opfs';
    let activeGroup = "default";
    let prefix = customPrefix;
    const emittedShards: DatasetShardDescriptor[] = [];

    if (typeof window !== "undefined") {
      activeGroup = (localStorage.getItem("marigold_active_group") || "default").toLowerCase();
      
      const fileName = (localStorage.getItem("marigold_file_name") || "").toUpperCase();
      if (!prefix) {
        if (fileName.includes("DEMO") || activeGroup.includes("demo") || activeGroup.includes("roosevelt") || activeGroup.includes("acme") || activeGroup.includes("sandbox")) {
          prefix = "DEMO-dataset";
        } else {
          const safeGroup = activeGroup.replace(/[^a-z0-9]/gi, '_');
          const dateStr = new Date().toISOString().split('T')[0];
          prefix = `${safeGroup}_${dateStr}`;
        }
      }

      try {
        const bestStorage = await getBestAvailableSovereignStorage(activeGroup);
        storageTier = bestStorage.tier;
        if (bestStorage.handle) {
          const hasPerm = await verifyPermission(bestStorage.handle, true);
          if (hasPerm) {
            directoryHandle = bestStorage.handle;
          }
        }
      } catch (err) {
        console.warn("Failed to resolve Triple-Tier Sovereign Storage handle:", err);
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
            const targetSubDir = prefix || "Exports";
            if (message.blob) {
              emittedShards.push({
                filename: message.filename,
                rowCount: message.rowCount,
                sizeBytes: message.blob.size,
              });
              url = URL.createObjectURL(message.blob);
              blobUrlsRef.current.push(url);

              try {
                await writeStructuredFile(
                  directoryHandle,
                  `Uploaded_Data/${targetSubDir}`,
                  message.filename,
                  message.blob
                );
              } catch (err) {
                console.warn("Failed to persist shard to local sovereign storage:", err);
              }
            }
            
            setState(prev => ({
              ...prev,
              filesGenerated: [...prev.filesGenerated, { filename: message.filename, url, rowCount: message.rowCount }],
            }));
          })();
          break;
        case 'complete':
          (async () => {
            try {
              const targetSubDir = prefix || "Exports";
              const totalShardBytes = emittedShards.reduce((sum, s) => sum + s.sizeBytes, 0);
              if (emittedShards.length > 0) {
                const manifest = await createMassiveDatasetManifest({
                  datasetName: targetSubDir,
                  totalRows: message.totalRows,
                  totalBytes: totalShardBytes,
                  rowsPerShard: rowsPerFile,
                  columns,
                  shards: emittedShards,
                  storageTier,
                });
                await writeStructuredFile(
                  directoryHandle,
                  `Uploaded_Data/${targetSubDir}`,
                  'manifest.json',
                  JSON.stringify(manifest, null, 2)
                );
              }
            } catch (err) {
              console.warn("Could not write marigold.dataset.manifest.v1:", err);
            }
            setState(prev => ({ ...prev, isExporting: false, isComplete: true, progress: 100 }));
            worker.terminate();
          })();
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
      }
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
