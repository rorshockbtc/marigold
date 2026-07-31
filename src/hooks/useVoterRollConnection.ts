import { useState, useEffect } from 'react';
import { getActiveDatabaseName, isDemoGroupActive } from '@/lib/db/dbName';

interface VoterRollConnectionState {
  isDataConnected: boolean;
  isConnected: boolean;
  loadedRowCount: number | null;
  totalRows: number;
  loadedFileName: string;
  activeGroup: string;
  isDemo: boolean;
}

export function useVoterRollConnection(groupName?: string): VoterRollConnectionState {
  const [state, setState] = useState<VoterRollConnectionState>(() => {
    const grp = groupName || (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "State of Roosevelt (Demo)";
    const isConn = typeof window !== "undefined" && localStorage.getItem("marigold_file_connected") === "true";
    const rows = typeof window !== "undefined" ? Number(localStorage.getItem("marigold_file_rows") || "0") : 0;
    const isDemoMode = isDemoGroupActive(grp);
    return {
      isDataConnected: isConn,
      isConnected: isConn,
      loadedRowCount: rows,
      totalRows: rows,
      loadedFileName: typeof window !== "undefined" ? localStorage.getItem("marigold_file_name") || "" : "",
      activeGroup: grp,
      isDemo: isDemoMode,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDataConnection = () => {
      const grp = groupName || localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)";
      const isDemoMode = isDemoGroupActive(grp);
      const dbName = getActiveDatabaseName(grp);
      const isLocalStorageConn = localStorage.getItem("marigold_file_connected") === "true";
      const localRows = Number(localStorage.getItem("marigold_file_rows") || "0");

      // Startup Data Purge: Wipe the old XOR-encrypted database if it hasn't been done yet
      if (!localStorage.getItem("marigold_crypto_purged")) {
        console.warn("Purging old insecure database...");
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onsuccess = () => {
          console.log(`Successfully purged old insecure database: ${dbName}`);
          localStorage.setItem("marigold_crypto_purged", "true");
          checkDataConnection(); // Re-run the connection check
        };
        deleteReq.onerror = () => {
          console.error(`Failed to purge old insecure database: ${dbName}`);
        };
        return; // Wait for the delete to finish before checking connection
      }

      try {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (db && db.objectStoreNames.contains("rows")) {
            const tx = db.transaction(["rows"], "readonly");
            const store = tx.objectStore("rows");
            const countReq = store.count();
            countReq.onsuccess = () => {
              const count = countReq.result || localRows;
              const hasData = count > 0 || isLocalStorageConn;
              setState({
                isDataConnected: hasData,
                isConnected: hasData,
                loadedRowCount: count,
                totalRows: count,
                loadedFileName: localStorage.getItem("marigold_file_name") || (isDemoMode ? "DEMO_roosevelt_statewide_voter_roll.csv" : ""),
                activeGroup: grp,
                isDemo: isDemoMode,
              });
            };
          } else {
            const hasData = isLocalStorageConn;
            setState({
              isDataConnected: hasData,
              isConnected: hasData,
              loadedRowCount: localRows,
              totalRows: localRows,
              loadedFileName: isDemoMode ? "Synthetic DEMO_ dataset required" : "",
              activeGroup: grp,
              isDemo: isDemoMode,
            });
          }
        };
      } catch (err) {
        console.error("IndexedDB connection check failed:", err);
      }
    };

    checkDataConnection();
  }, [groupName]);

  return state;
}
