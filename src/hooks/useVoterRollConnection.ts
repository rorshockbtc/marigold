import { useState, useEffect } from 'react';
import { getActiveDatabaseName, isDemoGroupActive } from '@/lib/db/dbName';

interface VoterRollConnectionState {
  isDataConnected: boolean;
  loadedRowCount: number | null;
  loadedFileName: string;
}

export function useVoterRollConnection(groupName?: string): VoterRollConnectionState {
  const [state, setState] = useState<VoterRollConnectionState>({
    isDataConnected: false,
    loadedRowCount: null,
    loadedFileName: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDataConnection = () => {
      const grp = groupName || localStorage.getItem("marigold_active_group") || "State of Roosevelt (Demo)";
      const isDemoMode = isDemoGroupActive(grp);
      const dbName = getActiveDatabaseName(grp);

      try {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (db && db.objectStoreNames.contains("rows")) {
            const tx = db.transaction(["rows"], "readonly");
            const store = tx.objectStore("rows");
            const countReq = store.count();
            countReq.onsuccess = () => {
              const count = countReq.result || 0;
              if (isDemoMode) {
                if (count > 0) {
                  setState({
                    isDataConnected: true,
                    loadedRowCount: count,
                    loadedFileName: "DEMO_roosevelt_statewide_voter_roll.csv"
                  });
                } else {
                  setState({
                    isDataConnected: false,
                    loadedRowCount: 0,
                    loadedFileName: "Synthetic DEMO_ dataset required"
                  });
                }
              } else {
                if (count > 0) {
                  localStorage.setItem("marigold_file_connected", "true");
                  localStorage.setItem("marigold_file_rows", String(count));
                  setState({
                    isDataConnected: true,
                    loadedRowCount: count,
                    loadedFileName: localStorage.getItem("marigold_file_name") || ""
                  });
                } else {
                  setState({
                    isDataConnected: false,
                    loadedRowCount: 0,
                    loadedFileName: ""
                  });
                }
              }
            };
          } else {
            setState({
              isDataConnected: false,
              loadedRowCount: 0,
              loadedFileName: isDemoMode ? "Synthetic DEMO_ dataset required" : ""
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
