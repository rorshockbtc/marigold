import { useState, useCallback } from 'react';
import { normalizeRowWithMapping, interpretColumnMappings } from '@/lib/csv/universalMapper';

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
      const db = await openDatabase();
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

  // Pro Mode Audit Traversal Engine reading directly from local IDB (Memory Optimized)
  const runLocalAudit = useCallback(async (
    auditType: string,
    countyFilter?: string,
    threshold: number = 12
  ): Promise<Array<Record<string, any>>> => {
    setIsQuerying(true);
    setQueryProgress(0);
    const wakeLock = await requestScreenWakeLock();
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');
      
      // Memory optimization: collect targeted anomaly structures
      const addressCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
      const dateCounts: Map<string, { count: number; sample: Record<string, any>; residents: any[] }> = new Map();
      const phantomList: Array<Record<string, any>> = [];
      const ncoaList: Array<Record<string, any>> = [];
      const dupMap: Map<string, { count: number; sample: Record<string, any>; addrs: Set<string> }> = new Map();
      const results: Array<Record<string, any>> = [];
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
            if (processed % 4000 === 0 && totalCount > 0) {
              setQueryProgress(Math.min(95, Math.floor((processed / totalCount) * 100)));
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
            
            if (!filterCounty || rCounty.toLowerCase().includes(filterCounty)) {
              const addr = std.address;
              if (addr) {
                const existing = addressCounts.get(addr);
                if (existing) {
                  existing.count++;
                  if (existing.residents) {
                    existing.residents.push({ name: std.name, id: std.voter_id, date: std.date_registered });
                  }
                } else {
                  addressCounts.set(addr, {
                    count: 1,
                    sample: {
                      voter_id: std.voter_id,
                      name: std.name,
                      address: std.address,
                      city: std.city,
                      state: std.state,
                      zip: std.zip,
                      county: rCounty,
                      raw: std.raw
                    },
                    residents: [{ name: std.name, id: std.voter_id, date: std.date_registered }]
                  });
                }
              }

              // Track registration spikes
              if (std.date_registered) {
                const dExisting = dateCounts.get(std.date_registered);
                if (dExisting) {
                  dExisting.count++;
                  if (dExisting.residents) {
                    dExisting.residents.push({ name: std.name, id: std.voter_id, date: std.date_registered });
                  }
                } else {
                  dateCounts.set(std.date_registered, {
                    count: 1,
                    sample: {
                      voter_id: std.voter_id,
                      name: `Surge Cohort (${std.date_registered})`,
                      address: `Multiple Locations Registered on ${std.date_registered}`,
                      city: std.city,
                      state: std.state,
                      zip: std.zip,
                      county: rCounty,
                      raw: std.raw
                    },
                    residents: [{ name: std.name, id: std.voter_id, city: std.city || rCounty || 'Unknown' }]
                  });
                }
              }

              // Track phantom precincts
              if (!std.precinct_code || std.precinct_code === '0' || std.precinct_code.toUpperCase() === 'UNASSIGNED') {
                phantomList.push({
                  id: std.voter_id,
                  name: std.name,
                  address: std.address || 'Unlisted Domicile',
                  city: std.city,
                  state: std.state,
                  zip: std.zip,
                  county: rCounty,
                  occupant_count: 1,
                  risk_level: 'HIGH',
                  details: `Active voter record missing mandatory voting precinct code assignment.`,
                  raw: std.raw
                });
              }

              // Track NCOA / Out of state
              if (std.ncoa_flag || (std.raw && (std.raw.mail_state || std.raw.MAIL_ST) && String(std.raw.mail_state || std.raw.MAIL_ST).toUpperCase() !== 'MS')) {
                const mailAddr = std.raw?.mail_address || std.raw?.mailing_address || std.raw?.mail_street || std.raw?.MAIL_ADDR || std.raw?.MAIL_STREET || `${std.raw?.mail_city || std.raw?.MAIL_CITY || ''}, ${std.raw?.mail_state || std.raw?.MAIL_ST || 'Out of State'} ${std.raw?.mail_zip || std.raw?.MAIL_ZIP || ''}`;
                ncoaList.push({
                  id: std.voter_id,
                  name: std.name,
                  address: std.address || 'Unlisted Domicile',
                  city: std.city,
                  state: std.state,
                  zip: std.zip,
                  county: rCounty,
                  occupant_count: 1,
                  risk_level: 'HIGH',
                  details: `Out-of-state mailing address detected: ${mailAddr}`,
                  raw: std.raw,
                  mailingAddress: String(mailAddr || 'Out-of-State Address Filed')
                });
              }

              // Track intra-county duplicates
              if (std.first_name && std.last_name && std.zip) {
                const dupKey = `${std.first_name.toLowerCase()}|${std.last_name.toLowerCase()}|${std.zip}`;
                const dExisting = dupMap.get(dupKey);
                if (dExisting) {
                  dExisting.count++;
                  if (std.address) dExisting.addrs.add(std.address);
                } else {
                  dupMap.set(dupKey, {
                    count: 1,
                    sample: {
                      voter_id: std.voter_id,
                      name: std.name,
                      address: std.address,
                      city: std.city,
                      state: std.state,
                      zip: std.zip,
                      county: rCounty,
                      raw: std.raw
                    },
                    addrs: new Set(std.address ? [std.address] : [])
                  });
                }
              }
            }
            cursor.continue();
          } else {
            setIsQuerying(false);
            // Process aggregated results based on auditType
            if (auditType === 'density') {
              for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
                if (count >= threshold) {
                  results.push({
                    id: sample.voter_id,
                    name: sample.name,
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: count > 20 ? 'CRITICAL' : 'HIGH',
                    details: `${count} distinct voter IDs registered to this single residential location.`,
                    raw: sample.raw,
                    residentCluster: residents || []
                  });
                }
              }
            } else if (auditType === 'missing-dorm') {
              for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
                const upper = addr.toUpperCase();
                const isDormLike = count >= (threshold > 12 ? threshold : 25) &&
                  !upper.includes('APT') && !upper.includes('RM') && !upper.includes('ROOM') &&
                  !upper.includes('UNIT') && !upper.includes('STE') && !upper.includes('#');
                if (isDormLike) {
                  results.push({
                    id: sample.voter_id,
                    name: sample.name,
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: 'HIGH',
                    details: `${count} residents without unit/room numbers. Potential unsegmented campus dorm.`,
                    raw: sample.raw,
                    residentCluster: residents || []
                  });
                }
              }
            } else if (auditType === 'po-box' || auditType === 'commercial') {
              for (const [addr, { count, sample, residents }] of addressCounts.entries()) {
                const upper = addr.toUpperCase();
                if (upper.includes('P O BOX') || upper.includes('PO BOX') || upper.includes('P.O. BOX') || upper.includes('UPS STORE') || upper.includes('PMB') || upper.includes('FEDEX') || upper.includes('SUITE') || upper.includes('STE') || upper.includes('COMMERCIAL') || upper.includes('BLDG')) {
                  results.push({
                    id: sample.voter_id,
                    name: sample.name,
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: 'CRITICAL',
                    details: `Commercial mail drop, P.O. Box, or business building listed as primary residential domicile.`,
                    raw: sample.raw,
                    residentCluster: residents || []
                  });
                }
              }
            } else if (auditType === 'spikes') {
              for (const [regDate, { count, sample, residents }] of dateCounts.entries()) {
                if (count >= (threshold || 50)) {
                  results.push({
                    id: sample.voter_id,
                    name: sample.name,
                    address: sample.address,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: count > 500 ? 'CRITICAL' : 'HIGH',
                    details: `Unusual registration surge: ${count} new registrations recorded on single day (${regDate}).`,
                    raw: sample.raw,
                    residentCluster: residents || []
                  });
                }
              }
            } else if (auditType === 'phantom-precincts') {
              results.push(...phantomList);
            } else if (auditType === 'out-of-state-mailing') {
              results.push(...ncoaList);
            } else if (auditType === 'duplicates') {
              for (const [key, { count, sample, addrs }] of dupMap.entries()) {
                if (count > 1 && addrs.size > 1) {
                  results.push({
                    id: sample.voter_id,
                    name: sample.name,
                    address: sample.address,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: 'HIGH',
                    details: `Potential intra-county duplicate: ${count} registrations with identical Name & Zip across ${addrs.size} addresses.`,
                    raw: sample.raw,
                    duplicateAddresses: Array.from(addrs)
                  });
                }
              }
            } else {
              // Default fallback: return matching addresses
              const sorted = Array.from(addressCounts.entries()).sort((a, b) => b[1].count - a[1].count);
              for (const [addr, { count, sample, residents }] of sorted) {
                if (count > 1) {
                  results.push({
                    id: sample.voter_id,
                    name: sample.name,
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: count > 20 ? 'CRITICAL' : 'MEDIUM',
                    details: `${count} residents registered at this address.`,
                    raw: sample.raw,
                    residentCluster: residents || []
                  });
                }
              }
            }
            setQueryProgress(100);
            results.sort((a, b) => (b.occupant_count || 0) - (a.occupant_count || 0));
            releaseScreenWakeLock(wakeLock);
            resolve(results);
          }
        };
        request.onerror = () => { setIsQuerying(false); setQueryProgress(0); releaseScreenWakeLock(wakeLock); reject(request.error); };
      });
    } catch (error) {
      setIsQuerying(false);
      setQueryProgress(0);
      releaseScreenWakeLock(wakeLock);
      throw error;
    }
  }, []);

  return { query, runLocalAudit, isQuerying, queryProgress };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoterDataDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
