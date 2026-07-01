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

  // Pro Mode Audit Traversal Engine reading directly from local IDB
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
      const addressGroups: Record<string, Array<Record<string, any>>> = {};
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
                if (!addressGroups[addr]) addressGroups[addr] = [];
                addressGroups[addr].push(r);
              }
            }
            cursor.continue();
          } else {
            setIsQuerying(false);
            // Process address groups based on auditType
            if (auditType === 'density') {
              for (const [addr, residents] of Object.entries(addressGroups)) {
                if (residents.length >= threshold) {
                  const sample = residents[0];
                  results.push({
                    id: String(sample.voter_id || sample.id || Math.random()),
                    address: addr,
                    city: String(sample.city || sample.RESIDENTIAL_CITY || 'Unknown'),
                    state: String(sample.state || sample.RESIDENTIAL_STATE || 'MS'),
                    zip: String(sample.zip || sample.RESIDENTIAL_ZIP || ''),
                    county: String(sample.county || sample.COUNTY || 'Statewide'),
                    occupant_count: residents.length,
                    risk_level: residents.length > 20 ? 'CRITICAL' : 'HIGH',
                    details: `${residents.length} distinct voter IDs registered to this single residential location.`
                  });
                }
              }
            } else if (auditType === 'missing-dorm') {
              for (const [addr, residents] of Object.entries(addressGroups)) {
                const upper = addr.toUpperCase();
                const isDormLike = residents.length >= (threshold > 12 ? threshold : 25) &&
                  !upper.includes('APT') && !upper.includes('RM') && !upper.includes('ROOM') &&
                  !upper.includes('UNIT') && !upper.includes('STE') && !upper.includes('#');
                if (isDormLike) {
                  const sample = residents[0];
                  results.push({
                    id: String(sample.voter_id || sample.id || Math.random()),
                    address: addr,
                    city: String(sample.city || 'Unknown'),
                    state: String(sample.state || 'MS'),
                    zip: String(sample.zip || ''),
                    county: String(sample.county || 'Statewide'),
                    occupant_count: residents.length,
                    risk_level: 'HIGH',
                    details: `${residents.length} residents without unit/room numbers. Potential unsegmented campus dorm.`
                  });
                }
              }
            } else if (auditType === 'po-box') {
              for (const [addr, residents] of Object.entries(addressGroups)) {
                const upper = addr.toUpperCase();
                if (upper.includes('P O BOX') || upper.includes('PO BOX') || upper.includes('P.O. BOX')) {
                  const sample = residents[0];
                  results.push({
                    id: String(sample.voter_id || sample.id || Math.random()),
                    address: addr,
                    city: String(sample.city || 'Unknown'),
                    state: String(sample.state || 'MS'),
                    zip: String(sample.zip || ''),
                    county: String(sample.county || 'Statewide'),
                    occupant_count: residents.length,
                    risk_level: 'CRITICAL',
                    details: `Commercial / P.O. Box address listed as primary residential domicile.`
                  });
                }
              }
            } else {
              // Default fallback: return top dense addresses
              const sorted = Object.entries(addressGroups).sort((a, b) => b[1].length - a[1].length);
              for (const [addr, residents] of sorted.slice(0, 50)) {
                if (residents.length > 1) {
                  const sample = residents[0];
                  results.push({
                    id: String(sample.voter_id || sample.id || Math.random()),
                    address: addr,
                    city: String(sample.city || 'Unknown'),
                    state: String(sample.state || 'MS'),
                    zip: String(sample.zip || ''),
                    county: String(sample.county || 'Statewide'),
                    occupant_count: residents.length,
                    risk_level: 'MEDIUM',
                    details: `${residents.length} residents registered at this address.`
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
