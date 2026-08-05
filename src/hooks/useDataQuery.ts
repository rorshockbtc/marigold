import { useState, useCallback } from 'react';
import { normalizeRowWithMapping, interpretColumnMappings } from '@/lib/csv/universalMapper';
import { openActiveDatabase, isDemoGroupActive } from '@/lib/db/dbName';

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
      const db = await openActiveDatabase();
      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');
      const allRows: Array<Record<string, any>> = [];
      let matchCount = 0;
      let activeMapping: any = null;

      return new Promise((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const val = cursor.value;
            const rowData = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            if (!activeMapping) {
              try {
                const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
                if (savedMap) activeMapping = JSON.parse(savedMap);
              } catch (e) {}
              if (!activeMapping) {
                activeMapping = interpretColumnMappings(Object.keys(rowData));
              }
            }
            const matches = !searchTerm || columns.some(col =>
              String(rowData[col] || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matches) {
              matchCount++;
              if (matchCount > offset && allRows.length < limit) allRows.push(normalizeRowWithMapping(rowData, activeMapping));
            }
            cursor.continue();
          } else {
            setIsQuerying(false);
            releaseScreenWakeLock(wakeLock);
            resolve({ rows: allRows, totalMatches: matchCount });
          }
        };
        request.onerror = () => { setIsQuerying(false); releaseScreenWakeLock(wakeLock); reject(request.error); };
      });
    } catch (error) {
      setIsQuerying(false);
      releaseScreenWakeLock(wakeLock);
      throw error;
    }
  }, []);

  /**
   * Single-Pass 360° Comprehensive Audit Engine:
   * Evaluates ALL 7 playbooks simultaneously in 1 single cursor pass (< 3 seconds total)
   */
  const runAllPlaybooksSweep = useCallback(async (
    countyFilter?: string,
    threshold: number = 12
  ): Promise<Record<string, Array<Record<string, any>>>> => {
    setIsQuerying(true);
    setQueryProgress(0);
    const wakeLock = await requestScreenWakeLock();

    try {
      const db = await openActiveDatabase();
      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');

      const addressCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
      const dateCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
      const phantomList: Array<Record<string, any>> = [];
      const ncoaList: Array<Record<string, any>> = [];
      const dupMap: Map<string, { count: number; sample: Record<string, any>; addrs: Set<string> }> = new Map();
      const typoList: Array<Record<string, any>> = [];
      const benfordsLawCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
      let benfordsTotal = 0;
      let activeMapping: any = null;

      return new Promise((resolve, reject) => {
        const countReq = store.count();
        let totalCount = 0;
        countReq.onsuccess = () => {
          totalCount = countReq.result || 0;
        };

        const request = store.openCursor();
        let processed = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            processed++;
            if (processed % 10000 === 0 && totalCount > 0) {
              setQueryProgress(Math.min(99, Math.floor((processed / totalCount) * 100)));
            }

            const val = cursor.value;
            const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            if (!activeMapping) {
              try {
                const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
                if (savedMap) activeMapping = JSON.parse(savedMap);
              } catch (e) {}
              if (!activeMapping) {
                activeMapping = interpretColumnMappings(Object.keys(raw));
              }
            }
            const std = normalizeRowWithMapping(raw, activeMapping);
            const rCounty = std.county || 'Statewide';
            const filterCounty = (countyFilter || '').toLowerCase();
            const statusStr = String(std.status || '').trim().toUpperCase();
            const isInactive = statusStr === 'I' || statusStr === 'INACTIVE' || statusStr === 'C' || statusStr === 'CANCELLED' || statusStr === 'PURGED' || statusStr === 'DECEASED';

            if (!filterCounty || rCounty.toLowerCase().includes(filterCounty)) {
              if (!isInactive) {
                const addr = std.address;
                if (addr) {
                  const existing = addressCounts.get(addr);
                  if (existing) {
                    existing.count++;
                    if (existing.residents && existing.residents.length < 10) {
                      existing.residents.push({ name: std.name, id: std.voter_id, date: std.date_registered });
                    }
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
                const mailState = String(std.raw?.mail_state || std.raw?.MAIL_ST || std.raw?.mailing_state || '').trim().toUpperCase();
                if ((std.ncoa_flag && String(std.ncoa_flag).trim() !== '') || (mailState !== '' && mailState !== homeState && mailState !== 'NONE' && mailState !== 'SAME')) {
                  ncoaList.push({
                    id: std.voter_id, name: std.name, address: std.address || 'Unlisted Domicile', city: std.city, state: std.state, zip: std.zip, county: rCounty, occupant_count: 1, risk_level: 'HIGH', details: `Out-of-state mailing state: ${mailState}`, raw: std.raw
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
              }
            }
            cursor.continue();
          } else {
            // Aggregate all 7 playbook results
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

            setQueryProgress(100);
            setIsQuerying(false);
            releaseScreenWakeLock(wakeLock);
            resolve(resultMap);
          }
        };

        request.onerror = () => {
          setIsQuerying(false);
          setQueryProgress(0);
          releaseScreenWakeLock(wakeLock);
          reject(request.error);
        };
      });

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
