"use client";

import { useState, useCallback } from "react";
import { getActiveDatabaseName, isDemoGroupActive } from "@/lib/db/dbName";
import { normalizeRowWithMapping, interpretColumnMappings } from "@/lib/csv/universalMapper";
import { MarigoldDataEngineService, AuditSweepResults } from "@/lib/services/MarigoldDataEngineService";

export function useDataQuery() {
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryProgress, setQueryProgress] = useState<number>(0);

  const query = useCallback(
    async (searchTerm: string = "", filters: any[] = [], limit: number = 100): Promise<{ totalMatches: number; rows: any[] }> => {
      setIsQuerying(true);
      const dbName = getActiveDatabaseName();

      return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName);

        req.onerror = () => {
          setIsQuerying(false);
          reject(req.error);
        };

        req.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          const storeName = MarigoldDataEngineService.getValidStoreName(db);

          if (!storeName) {
            setIsQuerying(false);
            db.close();
            return resolve({ totalMatches: 0, rows: [] });
          }

          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);

          const countReq = store.count();
          countReq.onsuccess = () => {
            const totalMatches = countReq.result || 0;

            const rows: any[] = [];
            const cursorReq = store.openCursor();
            let count = 0;

            let activeMapping: any = null;
            try {
              const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
              if (savedMap) activeMapping = JSON.parse(savedMap);
            } catch (err) {}

            cursorReq.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
              if (cursor && count < limit) {
                const val = cursor.value;
                const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
                
                if (!activeMapping) {
                  activeMapping = interpretColumnMappings(Object.keys(raw));
                }

                const std = normalizeRowWithMapping(raw, activeMapping);
                
                if (!searchTerm || JSON.stringify(std).toLowerCase().includes(searchTerm.toLowerCase())) {
                  rows.push(std);
                  count++;
                }
                cursor.continue();
              } else {
                setIsQuerying(false);
                db.close();
                resolve({ totalMatches, rows });
              }
            };

            cursorReq.onerror = () => {
              setIsQuerying(false);
              db.close();
              reject(cursorReq.error);
            };
          };
        };
      });
    },
    []
  );

  const runAllPlaybooksSweep = useCallback(
    async (countyFilter: string = "", threshold: number = 8): Promise<Record<string, Array<Record<string, any>>>> => {
      setIsQuerying(true);
      setQueryProgress(5);

      const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";

      try {
        const sweepData = await MarigoldDataEngineService.executeNative360Sweep(
          activeGroup,
          countyFilter,
          threshold,
          (pct) => setQueryProgress(pct)
        );
        setIsQuerying(false);
        setQueryProgress(100);
        return sweepData.anomalyRecords;
      } catch (err) {
        console.error("Native 360 sweep execution failed:", err);
        setIsQuerying(false);
        setQueryProgress(100);
        return {};
      }
    },
    []
  );

  const runLocalAudit = useCallback(
    async (ruleType: string, countyFilter: string = "", threshold: number = 8): Promise<Array<Record<string, any>>> => {
      const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";

      // 0ms lookup from memory/disk cache first!
      const cached = await MarigoldDataEngineService.getPersistentAuditMap(activeGroup);
      if (cached && cached.anomalyRecords && cached.anomalyRecords[ruleType]) {
        return cached.anomalyRecords[ruleType];
      }

      const allSweep = await runAllPlaybooksSweep(countyFilter, threshold);
      return allSweep[ruleType] || [];
    },
    [runAllPlaybooksSweep]
  );

  return {
    isQuerying,
    queryProgress,
    query,
    runLocalAudit,
    runAllPlaybooksSweep,
  };
}
