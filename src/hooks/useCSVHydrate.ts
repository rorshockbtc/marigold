import { useState, useRef, useCallback } from 'react';
import { getDirectoryHandle, verifyPermission } from '@/lib/fs/LocalFSManager';
import { getActiveDatabaseName } from '@/lib/db/dbName';
import { getMapBySignature, saveMap } from '@/lib/firebase/map';

export interface HydrateState {
  isHydrating: boolean;
  progress: number;
  rowsHydrated: number;
  error: string | null;
  isComplete: boolean;
}

export function useCSVHydrate() {
  const [state, setState] = useState<HydrateState>({
    isHydrating: false,
    progress: 0,
    rowsHydrated: 0,
    error: null,
    isComplete: false,
  });

  const workerRef = useRef<Worker | null>(null);

  const startHydration = useCallback(async () => {
    setState({
      isHydrating: true,
      progress: 0,
      rowsHydrated: 0,
      error: null,
      isComplete: false,
    });

    try {
      const activeGroup = (localStorage.getItem("marigold_active_group") || "default").toLowerCase();
      const rootDirHandle = await getDirectoryHandle(activeGroup);
      
      if (!rootDirHandle) {
        throw new Error("No Marigold Local folder linked. Please link a folder first.");
      }

      const hasPerm = await verifyPermission(rootDirHandle, true);
      if (!hasPerm) {
        throw new Error("Permission denied to read Marigold Local folder.");
      }

      // Find the most recent dataset subfolder
      let latestSubDir: any = null;
      let latestName = "";
      
      for await (const entry of rootDirHandle.values()) {
        if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
          if (entry.name > latestName) {
            latestName = entry.name;
            latestSubDir = entry;
          }
        }
      }

      if (!latestSubDir) {
        // Fallback to checking root if they haven't used the new subfolder structure yet
        latestSubDir = rootDirHandle;
      }

      const worker = new Worker(
        new URL('../workers/csv-hydrate.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      const dbName = getActiveDatabaseName();

      worker.onmessage = async (e: MessageEvent<any>) => {
        const message = e.data;
        if (message.type === 'progress') {
          setState(prev => ({
            ...prev,
            progress: message.percentComplete,
            rowsHydrated: message.rowsHydrated,
          }));
        } else if (message.type === 'complete') {
          // Hook up Firebase Map
          if (message.signature) {
            localStorage.setItem("marigold_dataset_signature", message.signature);
            const firebaseMap = await getMapBySignature(message.signature);
            if (firebaseMap) {
              localStorage.setItem("marigold_file_mapping", JSON.stringify(firebaseMap));
              console.log("✓ Server-Side Map Applied from Firebase during hydration");
            }
          }
          
          localStorage.setItem("marigold_file_connected", "true");
          localStorage.setItem("marigold_file_rows", String(message.rowsHydrated));
          localStorage.setItem("marigold_file_name", latestSubDir.name);
          
          setState(prev => ({ ...prev, isHydrating: false, isComplete: true, progress: 100 }));
          worker.terminate();
        } else if (message.type === 'error') {
          setState(prev => ({ ...prev, isHydrating: false, error: message.message }));
          worker.terminate();
        }
      };

      worker.postMessage({
        action: 'start',
        config: { dbName },
        subDirHandle: latestSubDir
      });

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isHydrating: false, error: err.message || "Failed to start hydration" }));
    }
  }, []);

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    setState({
      isHydrating: false,
      progress: 0,
      rowsHydrated: 0,
      error: null,
      isComplete: false,
    });
  }, []);

  return { state, startHydration, reset };
}
