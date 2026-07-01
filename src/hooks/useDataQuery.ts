import { useState, useCallback } from 'react';

export interface QueryResult {
  rows: Array<Record<string, any>>;
  totalMatches: number;
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
            
            const rCounty = String(r.county || r.COUNTY || '').toLowerCase();
            const filterCounty = (countyFilter || '').toLowerCase();
            
            if (!filterCounty || rCounty.includes(filterCounty)) {
              const addr = String(r.address || r.RESIDENTIAL_ADDRESS || r.street_address || '').trim();
              if (addr) {
                const existing = addressCounts.get(addr);
                if (existing) {
                  existing.count++;
                } else {
                  // Keep only essential fields to keep RAM usage flat under ~15MB
                  addressCounts.set(addr, {
                    count: 1,
                    sample: {
                      voter_id: String(r.voter_id || r.id || Math.random()),
                      address: addr,
                      city: String(r.city || r.RESIDENTIAL_CITY || 'Unknown'),
                      state: String(r.state || r.RESIDENTIAL_STATE || 'MS'),
                      zip: String(r.zip || r.RESIDENTIAL_ZIP || ''),
                      county: String(r.county || r.COUNTY || 'Statewide')
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
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: count > 20 ? 'CRITICAL' : 'HIGH',
                    details: `${count} distinct voter IDs registered to this single residential location.`
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
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: 'HIGH',
                    details: `${count} residents without unit/room numbers. Potential unsegmented campus dorm.`
                  });
                }
              }
            } else if (auditType === 'po-box') {
              for (const [addr, { count, sample }] of addressCounts.entries()) {
                const upper = addr.toUpperCase();
                if (upper.includes('P O BOX') || upper.includes('PO BOX') || upper.includes('P.O. BOX')) {
                  results.push({
                    id: sample.voter_id,
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: 'CRITICAL',
                    details: `Commercial / P.O. Box address listed as primary residential domicile.`
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
                    address: addr,
                    city: sample.city,
                    state: sample.state,
                    zip: sample.zip,
                    county: sample.county,
                    occupant_count: count,
                    risk_level: 'MEDIUM',
                    details: `${count} residents registered at this address.`
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
