import { useState, useCallback } from 'react';
import { normalizeRowWithMapping, interpretColumnMappings } from '@/lib/csv/universalMapper';
import { openActiveDatabase, isDemoGroupActive, getActiveDatabaseNameWithFallback } from '@/lib/db/dbName';

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
      const db = await openActiveDatabase(dbName);

      // Get total count first for progress tracking
      const totalCount: number = await new Promise((resolve) => {
        const tx = db.transaction(['rows'], 'readonly');
        const countReq = tx.objectStore('rows').count();
        countReq.onsuccess = () => resolve(countReq.result || 0);
        countReq.onerror = () => resolve(0);
      });

      setQueryProgress(2);

      // Resolve the mapping once before we start batching
      let activeMapping: any = null;
      try {
        const activeGroup = (typeof window !== 'undefined' ? localStorage.getItem("marigold_active_group") : "") || "default";
        const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const savedMap = typeof window !== 'undefined' ? localStorage.getItem(`marigold_file_mapping_${slug}`) : null;
        if (savedMap) activeMapping = JSON.parse(savedMap);
      } catch (e) {}

      // Accumulators for all 7 playbooks
      const addressCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
      const dateCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
      const phantomList: Array<Record<string, any>> = [];
      const ncoaList: Array<Record<string, any>> = [];
      const dupMap: Map<string, { count: number; sample: Record<string, any>; addrs: Set<string> }> = new Map();
      const typoList: Array<Record<string, any>> = [];
      const benfordsLawCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
      let benfordsTotal = 0;
      const filterCounty = (countyFilter || '').toLowerCase();

      // Process one record through all 7 playbooks
      const processRecord = (val: any) => {
        const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
        if (!activeMapping) {
          activeMapping = interpretColumnMappings(Object.keys(raw));
        }
        const std = normalizeRowWithMapping(raw, activeMapping);
        const rCounty = std.county || 'Statewide';
        const statusStr = String(std.status || '').trim().toUpperCase();
        const isInactive = statusStr === 'I' || statusStr === 'INACTIVE' || statusStr === 'C' || statusStr === 'CANCELLED' || statusStr === 'PURGED' || statusStr === 'DECEASED';

        if (filterCounty && !rCounty.toLowerCase().includes(filterCounty)) return;
        if (isInactive) return;

        const addr = std.address;
        if (addr) {
          const existing = addressCounts.get(addr);
          if (existing) {
            existing.count++;
            existing.residents.push({ name: std.name, id: std.voter_id, date: std.date_registered, city: std.city, state: std.state, zip: std.zip });
          } else {
            addressCounts.set(addr, {
              count: 1,
              sample: { voter_id: std.voter_id, name: std.name, address: std.address, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
              residents: [{ name: std.name, id: std.voter_id, date: std.date_registered }]
            });
          }

          const match = addr.match(/^[^\d]*([1-9])/);
          if (match) {
            benfordsLawCounts[match[1]]++;
            benfordsTotal++;
          }
        }

        if (std.date_registered) {
          const dExisting = dateCounts.get(std.date_registered);
          if (dExisting) {
            dExisting.count++;
          } else {
            dateCounts.set(std.date_registered, {
              count: 1,
              sample: { voter_id: std.voter_id, name: `Surge Cohort (${std.date_registered})`, address: `Registered on ${std.date_registered}`, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
              residents: [{ name: std.name, id: std.voter_id }]
            });
          }
        }

        if (!std.precinct_code || std.precinct_code === '0' || std.precinct_code.toUpperCase() === 'UNASSIGNED') {
          phantomList.push({
            id: std.voter_id, name: std.name, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'HIGH', details: 'Missing mandatory precinct assignment.', raw: std.raw
          });
        }

        const homeState = (std.state || 'MS').trim().toUpperCase();
        const mailState = String(std.raw?.mail_state || std.raw?.MAIL_ST || std.raw?.mailing_state || std.raw?.MAIL_STATE || '').trim().toUpperCase();
        const ncoaFlagStr = String(std.ncoa_flag || '').trim().toUpperCase();
        const isExplicitNcoa = ncoaFlagStr === 'Y' || ncoaFlagStr === 'YES' || ncoaFlagStr === 'TRUE';
        const isOutStateMail = mailState.length === 2 && mailState !== homeState && mailState !== 'MS' && mailState !== 'NO' && mailState !== 'NA';
        if (isExplicitNcoa || isOutStateMail) {
          ncoaList.push({
            id: std.voter_id, name: std.name, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'HIGH', details: `Out-of-state relocation/mailing detected: ${mailState || 'NCOA Flagged'}`, raw: std.raw
          });
        }

        const dupFirst = std.first_name || (std.name ? std.name.trim().split(/\s+/)[0] : '');
        const dupLast = std.last_name || (std.name ? std.name.trim().split(/\s+/).pop() : '');
        if (dupFirst && dupLast && std.zip) {
          const dupKey = `${dupFirst.toLowerCase()}|${dupLast.toLowerCase()}|${std.zip}`;
          const dExisting = dupMap.get(dupKey);
          if (dExisting) {
            dExisting.count++;
            if (std.address) dExisting.addrs.add(std.address);
          } else {
            dupMap.set(dupKey, {
              count: 1,
              sample: { voter_id: std.voter_id, name: std.name, address: std.address, city: std.city, state: std.state, zip: std.zip, county: rCounty, raw: std.raw },
              addrs: new Set(std.address ? [std.address] : [])
            });
          }
        }

        const fname = std.first_name || '';
        const lname = std.last_name || '';
        if ((fname.length === 1 || lname.length === 1) && (fname.length > 0 || lname.length > 0)) {
          typoList.push({
            id: std.voter_id, name: std.name || `${fname} ${lname}`, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'MEDIUM', details: 'Clerical 1-character name typo.', raw: std.raw
          });
        }
      };

      // ── Batched getAll() loop ──
      // Read BATCH_SIZE records at a time using a cursor to find the next key range.
      // Between batches, yield to the event loop so the progress bar animates.
      let processed = 0;
      let lastKey: IDBValidKey | undefined = undefined;
      let done = false;

      while (!done) {
        const batchRecords: any[] = await new Promise((resolve, reject) => {
          const tx = db.transaction(['rows'], 'readonly');
          const store = tx.objectStore('rows');
          // If autoIncrement keys, use IDBKeyRange.lowerBound to paginate
          const range = lastKey !== undefined ? IDBKeyRange.lowerBound(lastKey, true) : undefined;
          const req = store.getAll(range, BATCH_SIZE);
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });

        if (batchRecords.length === 0) {
          done = true;
          break;
        }

        // We need the key of the last record to paginate. Read it from a cursor on the same range.
        const batchLastKey: IDBValidKey | undefined = await new Promise((resolve) => {
          const tx = db.transaction(['rows'], 'readonly');
          const store = tx.objectStore('rows');
          const range = lastKey !== undefined ? IDBKeyRange.lowerBound(lastKey, true) : undefined;
          // Open a cursor at the end of our batch to find the last key
          let keyCount = 0;
          let foundKey: IDBValidKey | undefined = undefined;
          const cursorReq = store.openKeyCursor(range);
          cursorReq.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursor | null>).result;
            if (cursor) {
              keyCount++;
              foundKey = cursor.key;
              if (keyCount < batchRecords.length) {
                cursor.continue();
              } else {
                resolve(foundKey);
              }
            } else {
              resolve(foundKey);
            }
          };
          cursorReq.onerror = () => resolve(undefined);
        });

        // Process this batch synchronously (fast — pure JS computation)
        for (let i = 0; i < batchRecords.length; i++) {
          processRecord(batchRecords[i]);
        }

        processed += batchRecords.length;
        lastKey = batchLastKey;

        // Update progress bar
        if (totalCount > 0) {
          setQueryProgress(Math.min(95, Math.floor((processed / totalCount) * 100)));
        }

        // Yield to event loop so the UI can repaint the progress bar
        await new Promise(resolve => setTimeout(resolve, 0));

        if (batchRecords.length < BATCH_SIZE) {
          done = true;
        }
      }

      db.close();

      // ── Aggregate all 7 playbook results ──
      const resultMap: Record<string, Array<Record<string, any>>> = {};

      // 1. Density
      const densityResults: Array<Record<string, any>> = [];
      for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
        if (count >= threshold) {
          densityResults.push({ id: sample.voter_id, name: sample.name, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: count > 20 ? 'CRITICAL' : 'HIGH', details: `${count} voters registered at this address.`, raw: sample.raw, residentCluster: residents });
        }
      }
      resultMap['density'] = densityResults.sort((a, b) => b.occupant_count - a.occupant_count);

      // 2. Out-of-state mailing
      resultMap['out-of-state-mailing'] = ncoaList;

      // 3. PO Box
      const poBoxResults: Array<Record<string, any>> = [];
      for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
        const upper = addr.toUpperCase();
        if (upper.includes('PO BOX') || upper.includes('P O BOX') || upper.includes('P.O. BOX') || upper.includes('UPS STORE') || upper.includes('PMB') || upper.includes('FEDEX')) {
          poBoxResults.push({ id: sample.voter_id, name: sample.name, address: addr, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'CRITICAL', details: 'Commercial P.O. Box or shipping drop listed as residential domicile.', raw: sample.raw, residentCluster: residents });
        }
      }
      resultMap['po-box'] = poBoxResults;

      // 4. Duplicates
      const dupResults: Array<Record<string, any>> = [];
      for (const [key, { count, sample, addrs }] of dupMap.entries()) {
        if (count > 1 && addrs.size > 1) {
          dupResults.push({ id: sample.voter_id, name: sample.name, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Intra-county duplicate name/zip across ${addrs.size} addresses.`, raw: sample.raw });
        }
      }
      resultMap['duplicates'] = dupResults;

      // 5. Spikes
      const spikeResults: Array<Record<string, any>> = [];
      for (const [regDate, { count, sample, residents }] of dateCounts.entries()) {
        if (count >= 50) {
          spikeResults.push({ id: sample.voter_id, name: sample.name, address: sample.address, city: sample.city, state: sample.state, zip: sample.zip, county: sample.county, occupant_count: count, risk_level: 'HIGH', details: `Single-day registration surge: ${count} voters registered on ${regDate}.`, raw: sample.raw });
        }
      }
      resultMap['spikes'] = spikeResults;

      // 6. Phantom Precincts
      resultMap['phantom-precincts'] = phantomList;

      // 7. Benford's Law
      const benfordResults: Array<Record<string, any>> = [];
      for (let i = 1; i <= 9; i++) {
        const digit = i.toString();
        const actualCount = benfordsLawCounts[digit];
        const actualPercentage = benfordsTotal > 0 ? (actualCount / benfordsTotal) * 100 : 0;
        benfordResults.push({ id: `BENFORD-${digit}`, name: `Leading Digit ${digit}`, address: `Actual: ${actualPercentage.toFixed(1)}%`, city: '', state: '', zip: '', county: '', occupant_count: actualCount, risk_level: 'LOW', details: `Digit ${digit} count: ${actualCount}` });
      }
      resultMap['benfords-law'] = benfordResults;

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

        MarigoldDataEngineService.savePersistentAuditMap(activeGroup, {
          groupId: activeGroup,
          timestamp: new Date().toISOString(),
          totalScanned: totalCount,
          anomalyRecords: resultMap,
          severityCounts: { CRITICAL: critical, HIGH: high, MEDIUM: medium, INFO: info }
        }).catch(e => console.warn("Failed to cache sweep", e));
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
      return cached.anomalyRecords[auditType];
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
