/// <reference lib="webworker" />
import Papa from 'papaparse';

export interface HydrateConfig {
  dbName: string;
}

export interface HydrateWorkerMessage {
  type: 'progress' | 'complete' | 'error';
  percentComplete?: number;
  rowsHydrated?: number;
  message?: string;
  signature?: string;
}

async function generateSignature(columns: string[]): Promise<string> {
  const msg = JSON.stringify(columns);
  const msgUint8 = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

self.onmessage = async (e: MessageEvent<{ action: string; config: HydrateConfig; subDirHandle: any }>) => {
  const { action, config, subDirHandle } = e.data;
  
  if (action === 'start') {
    try {
      if (!subDirHandle) {
        throw new Error("No directory handle provided to hydration worker");
      }

      // 1. Gather all CSV files in the directory
      const csvFiles: any[] = [];
      for await (const entry of subDirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.csv')) {
          csvFiles.push(entry);
        }
      }

      if (csvFiles.length === 0) {
        throw new Error("No chunked CSV files found in this workspace folder.");
      }

      // Sort files alphabetically to ensure they are parsed in order (_shard_01, _shard_02...)
      csvFiles.sort((a, b) => a.name.localeCompare(b.name));

      // 2. Open IndexedDB
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(config.dbName, 1);
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("rows")) {
            db.createObjectStore("rows", { autoIncrement: true });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Clear existing rows before hydrating
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(["rows"], "readwrite");
        const store = tx.objectStore("rows");
        const clearReq = store.clear();
        clearReq.onsuccess = () => resolve();
        clearReq.onerror = () => reject(clearReq.error);
      });

      let totalRowsHydrated = 0;
      let filesProcessed = 0;
      let signature = "";
      
      const totalFiles = csvFiles.length;

      // 3. Process each file
      for (const entry of csvFiles) {
        const fileHandle = await subDirHandle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            chunk: (results, parser) => {
              if (!signature && results.meta.fields && results.meta.fields.length > 0) {
                // Generate signature synchronously is not possible with WebCrypto, 
                // but we can pause parser, generate it, and resume.
                parser.pause();
                generateSignature(results.meta.fields).then(sig => {
                  signature = sig;
                  
                  // Insert the first chunk
                  const tx = db.transaction(["rows"], "readwrite");
                  const store = tx.objectStore("rows");
                  for (const row of results.data) {
                    store.add(row);
                    totalRowsHydrated++;
                  }
                  
                  parser.resume();
                }).catch(reject);
                return;
              }

              const tx = db.transaction(["rows"], "readwrite");
              const store = tx.objectStore("rows");
              for (const row of results.data) {
                store.add(row);
                totalRowsHydrated++;
              }
            },
            complete: () => {
              resolve();
            },
            error: (error) => reject(error)
          });
        });
        
        filesProcessed++;
        self.postMessage({
          type: 'progress',
          percentComplete: Math.round((filesProcessed / totalFiles) * 100),
          rowsHydrated: totalRowsHydrated
        } as HydrateWorkerMessage);
      }

      self.postMessage({ type: 'complete', rowsHydrated: totalRowsHydrated, signature } as HydrateWorkerMessage);
      
    } catch (err: any) {
      self.postMessage({ type: 'error', message: err.message || 'Unknown error during hydration' } as HydrateWorkerMessage);
    }
  }
};
