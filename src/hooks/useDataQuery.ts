import { useState, useCallback } from 'react';

export interface QueryResult {
  rows: Array<Record<string, any>>;
  totalMatches: number;
}

function extractField(row: Record<string, any>, keywords: string[], fallback = ''): string {
  if (!row || typeof row !== 'object') return fallback;
  const keys = Object.keys(row);
  for (const kw of keywords) {
    const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanKey === cleanKw) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  for (const kw of keywords) {
    const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKw.length <= 3) continue;
    for (const key of keys) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanKey.includes(cleanKw) || cleanKw.includes(cleanKey)) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return fallback;
}

export function useDataQuery() {
  const [isQuerying, setIsQuerying] = useState(false);

  const query = useCallback(async (
    searchTerm: string,
    columns: string[],
    limit: number = 100,
    offset: number = 0
  ): Promise<QueryResult> => {
    setIsQuerying(true);
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');
      const allRows: Array<Record<string, any>> = [];
      let matchCount = 0;

      return new Promise((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const val = cursor.value;
            const rowData = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            
            const matches = !searchTerm || columns.some(col =>
              String(rowData[col] || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matches) {
              matchCount++;
              if (matchCount > offset && allRows.length < limit) allRows.push(rowData);
            }
            cursor.continue();
          } else {
            setIsQuerying(false);
            resolve({ rows: allRows, totalMatches: matchCount });
          }
        };
        request.onerror = () => { setIsQuerying(false); reject(request.error); };
      });
    } catch (error) {
      setIsQuerying(false);
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
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');
      
      // Memory optimization: store lightweight counter map instead of full row objects
      const addressCounts: Map<string, { count: number; sample: Record<string, any> }> = new Map();
      const results: Array<Record<string, any>> = [];

      return new Promise((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const val = cursor.value;
            const r = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            
            const rCounty = extractField(r, ['countyname', 'countycode', 'jurisdiction', 'county'], 'Statewide');
            const filterCounty = (countyFilter || '').toLowerCase();
            
            if (!filterCounty || rCounty.toLowerCase().includes(filterCounty)) {
              const addr = extractField(r, ['residentialaddress', 'residenceaddress', 'streetaddress', 'physicaladdress', 'address1', 'address']);
              if (addr) {
                const existing = addressCounts.get(addr);
                if (existing) {
                  existing.count++;
                } else {
                  const first = extractField(r, ['firstname', 'first'], '');
                  const last = extractField(r, ['lastname', 'last'], '');
                  const fullName = extractField(r, ['fullname', 'votername', 'name', 'firstlastname'], '') || [first, last].filter(Boolean).join(' ') || 'Unlisted Resident';
                  
                  addressCounts.set(addr, {
                    count: 1,
                    sample: {
                      voter_id: extractField(r, ['voterregistrationnumber', 'registrationnumber', 'sosvoterid', 'voterregnum', 'idnumber', 'statevoterid', 'regnum', 'voterid'], `REC-${Math.floor(100000 + Math.random() * 900000)}`),
                      name: fullName,
                      address: addr,
                      city: extractField(r, ['residentialcity', 'residencecity', 'cityname', 'city'], 'Unknown City'),
                      state: extractField(r, ['residentialstate', 'residencestate', 'state'], 'MS'),
                      zip: extractField(r, ['residentialzip', 'residencezip', 'zipcode', 'postalcode', 'zip'], 'N/A'),
                      county: rCounty,
                      raw: typeof r === 'object' && r !== null ? { ...r } : {}
                    }
                  });
                }
              }
            }
            cursor.continue();
          } else {
            setIsQuerying(false);
            // Process aggregated address counts based on auditType
            if (auditType === 'density') {
              for (const [addr, { count, sample }] of addressCounts.entries()) {
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
                    raw: sample.raw
                  });
                }
              }
            } else if (auditType === 'missing-dorm') {
              for (const [addr, { count, sample }] of addressCounts.entries()) {
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
                    raw: sample.raw
                  });
                }
              }
            } else if (auditType === 'po-box') {
              for (const [addr, { count, sample }] of addressCounts.entries()) {
                const upper = addr.toUpperCase();
                if (upper.includes('P O BOX') || upper.includes('PO BOX') || upper.includes('P.O. BOX')) {
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
                    details: `Commercial / P.O. Box address listed as primary residential domicile.`,
                    raw: sample.raw
                  });
                }
              }
            } else {
              // Default fallback: return top dense addresses
              const sorted = Array.from(addressCounts.entries()).sort((a, b) => b[1].count - a[1].count);
              for (const [addr, { count, sample }] of sorted.slice(0, 50)) {
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
                    risk_level: 'MEDIUM',
                    details: `${count} residents registered at this address.`,
                    raw: sample.raw
                  });
                }
              }
            }
            results.sort((a, b) => (b.occupant_count || 0) - (a.occupant_count || 0));
            resolve(results);
          }
        };
        request.onerror = () => { setIsQuerying(false); reject(request.error); };
      });
    } catch (error) {
      setIsQuerying(false);
      throw error;
    }
  }, []);

  return { query, runLocalAudit, isQuerying };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoterDataDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
