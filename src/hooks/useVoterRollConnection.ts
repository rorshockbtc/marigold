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

      try {
        const request = indexedDB.open(dbName);
        request.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          const storeName = db.objectStoreNames.contains("rows") ? "rows" : (db.objectStoreNames.contains("records") ? "records" : (db.objectStoreNames.contains("VoterRolls") ? "VoterRolls" : null));
          
          if (db && storeName) {
            const tx = db.transaction([storeName], "readonly");
            const store = tx.objectStore(storeName);
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
              loadedFileName: isDemoMode ? "DEMO_roosevelt_statewide_voter_roll.csv" : "",
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

    // Listen to storage events and BroadcastChannel to sync workspace switching instantly across all tabs
    window.addEventListener("storage", checkDataConnection);

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("marigold_group_sync");
        channel.onmessage = (msg) => {
          if (msg.data?.type === "GROUP_CHANGED" || msg.data?.type === "AUDIT_CACHE_UPDATED") {
            checkDataConnection();
          }
        };
      } catch (e) {}
    }

    return () => {
      window.removeEventListener("storage", checkDataConnection);
      if (channel) channel.close();
    };
  }, [groupName]);

  return state;
}
