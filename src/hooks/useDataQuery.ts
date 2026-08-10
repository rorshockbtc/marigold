import { useState, useCallback } from 'react';
import { normalizeRowWithMapping, interpretColumnMappings } from '@/lib/csv/universalMapper';
import { openActiveDatabase, isDemoGroupActive, getActiveDatabaseNameWithFallback } from '@/lib/db/dbName';
import * as Comlink from 'comlink';

// Helper to manage Screen Wake Lock during heavy local browser RAM traversal
async function requestScreenWakeLock(): Promise<any> {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      return await (navigator as any).wakeLock.request('screen');
    }
  } catch (err) {
    console.warn("Screen Wake Lock not available or denied:", err);
  }
  return null;
}

function releaseScreenWakeLock(wakeLock: any) {
  if (wakeLock && wakeLock.release) {
    wakeLock.release().catch(() => {});
  }
}

export interface QueryResult {
  rows: Array<Record<string, any>>;
  totalMatches: number;
}

export function useDataQuery() {
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryProgress, setQueryProgress] = useState(0);

  const query = useCallback(async (
    searchTerm: string,
    columns: string[],
    limit: number = 100,
    offset: number = 0
  ): Promise<QueryResult> => {
    setIsQuerying(true);
    const wakeLock = await requestScreenWakeLock();
    try {
      const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
      const res = await MarigoldDataEngineService.queryData(searchTerm, columns, limit, offset);
      setIsQuerying(false);
      releaseScreenWakeLock(wakeLock);
      return res;
    } catch (error) {
      setIsQuerying(false);
      releaseScreenWakeLock(wakeLock);
      throw error;
    }
  }, []);

  /**
   * Single-Pass 360° Comprehensive Audit Engine:
   * Evaluates ALL 7 playbooks simultaneously using batched store.getAll() reads.
   * Reads 100K records per batch to avoid V8 heap crashes while maintaining speed.
   * Expected: ~5-8 seconds for 2.2M records (vs 5-10 min with cursor, vs OOM with unbounded getAll).
   */
  const runAllPlaybooksSweep = useCallback(async (
    countyFilter?: string,
    threshold: number = 12
  ): Promise<Record<string, Array<Record<string, any>>>> => {
    setIsQuerying(true);
    setQueryProgress(0);
    const wakeLock = await requestScreenWakeLock();

    const BATCH_SIZE = 100_000;

    try {
      // Use migration-aware DB lookup: if MarigoldDB_xxx is empty, falls back to legacy VoterDataDB
      const dbName = await getActiveDatabaseNameWithFallback();

      let activeMapping: any = null;
      try {
        const activeGroup = (typeof window !== 'undefined' ? localStorage.getItem("marigold_active_group") : "") || "default";
        const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const savedMap = typeof window !== 'undefined' ? localStorage.getItem(`marigold_file_mapping_${slug}`) : null;
        if (savedMap) activeMapping = JSON.parse(savedMap);
      } catch (e) {}

      const worker = new Worker(new URL('../workers/data-processor.worker.ts', import.meta.url), { type: 'module' });
      const DataProcessorWorker = Comlink.wrap<any>(worker);
      
      const onProgress = Comlink.proxy((percent: number) => {
        setQueryProgress(percent);
      });

      const { resultMap, totalCount }: { resultMap: Record<string, any[]>, totalCount: number } = await DataProcessorWorker.runComprehensiveAudit(
        dbName,
        countyFilter || '',
        threshold,
        activeMapping,
        onProgress
      );
      
      worker.terminate();

      // Cache the results to Marigold_Local and IndexedDB before resolving
      const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
      import('@/lib/services/MarigoldDataEngineService').then(({ MarigoldDataEngineService }) => {
        let critical = 0, high = 0, medium = 0, info = 0;
        Object.values(resultMap).forEach(arr => {
          arr.forEach(r => {
            const lvl = String(r.risk_level || 'HIGH').toUpperCase();
            if (lvl === 'CRITICAL') critical++;
            else if (lvl === 'HIGH') high++;
            else if (lvl === 'MEDIUM') medium++;
            else info++;
          });
        });

        const datasetSig = typeof window !== "undefined" ? localStorage.getItem("marigold_dataset_signature") || "" : "";
        
        // Only save the global cache if this is a comprehensive, statewide sweep (no county filter)
        if (!countyFilter) {
          MarigoldDataEngineService.savePersistentAuditMap(activeGroup, {
            groupId: activeGroup,
            timestamp: new Date().toISOString(),
            totalScanned: totalCount,
            datasetSignature: datasetSig,
            anomalyRecords: resultMap,
            severityCounts: { CRITICAL: critical, HIGH: high, MEDIUM: medium, INFO: info }
          }).catch(e => console.warn("Failed to cache sweep", e));
        }
      });

      setQueryProgress(100);
      setIsQuerying(false);
      releaseScreenWakeLock(wakeLock);
      return resultMap;

    } catch (err) {
      setIsQuerying(false);
      setQueryProgress(0);
      releaseScreenWakeLock(wakeLock);
      throw err;
    }
  }, []);

  const runLocalAudit = useCallback(async (
    auditType: string,
    countyFilter?: string,
    threshold: number = 12
  ): Promise<Array<Record<string, any>>> => {
    const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
    const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
    const cached = await MarigoldDataEngineService.getPersistentAuditMap(activeGroup);
    
    if (cached && cached.anomalyRecords && cached.anomalyRecords[auditType]) {
      let records = cached.anomalyRecords[auditType];
      if (countyFilter) {
        records = records.filter(r => (r.county || '').toLowerCase() === countyFilter.toLowerCase());
      }
      return records;
    }

    const sweep = await runAllPlaybooksSweep(countyFilter, threshold);
    return sweep[auditType] || [];
  }, [runAllPlaybooksSweep]);

  const addExclusion = useCallback((auditType: string, value: string) => {
    try {
      const ext = localStorage.getItem('marigold_exclusions');
      const exclusions = ext ? JSON.parse(ext) : {};
      if (!exclusions[auditType]) exclusions[auditType] = [];
      if (!exclusions[auditType].includes(value)) {
        exclusions[auditType].push(value);
        localStorage.setItem('marigold_exclusions', JSON.stringify(exclusions));
      }
    } catch (e) {}
  }, []);

  return { query, runLocalAudit, runAllPlaybooksSweep, addExclusion, isQuerying, queryProgress };
}
