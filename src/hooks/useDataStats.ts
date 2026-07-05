import { useState, useCallback } from 'react';

export interface ColumnStats {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  uniqueValues: number;
  nullCount: number;
  topValues: Array<{ value: string; count: number }>;
  distribution?: Record<string, number>;
}

export interface DataStats {
  totalRows: number;
  columns: ColumnStats[];
  sampleData: Array<Record<string, any>>;
}

export function useDataStats() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<DataStats | null>(null);

  const analyze = useCallback(async (): Promise<DataStats> => {
    setIsAnalyzing(true);
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');
      const columnValueCounts: Record<string, Record<string, number>> = {};
      const nullCounts: Record<string, number> = {};
      let totalRows = 0;
      let columns: string[] = [];
      const sampleData: Array<Record<string, any>> = [];

      return new Promise((resolve, reject) => {
        const countReq = store.count();
        countReq.onsuccess = () => {
          const totalRows = countReq.result || 0;
          if (totalRows === 0) {
            const result: DataStats = { totalRows: 0, columns: [], sampleData: [] };
            setStats(result);
            setIsAnalyzing(false);
            resolve(result);
            return;
          }

          let rowsSampled = 0;
          const request = store.openCursor();
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor && rowsSampled < 25000) {
              const val = cursor.value;
              const rowData = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
              rowsSampled++;
              if (columns.length === 0) {
                columns = Object.keys(rowData);
                columns.forEach(col => { columnValueCounts[col] = {}; nullCounts[col] = 0; });
              }
              if (sampleData.length < 100) sampleData.push(rowData);
              
              columns.forEach(col => {
                const value = rowData[col];
                if (value === null || value === undefined || value === '') {
                  nullCounts[col]++;
                } else {
                  const strValue = String(value);
                  columnValueCounts[col][strValue] = (columnValueCounts[col][strValue] || 0) + 1;
                }
              });
              cursor.continue();
            } else {
              const columnStats: ColumnStats[] = columns.map(col => {
                const valueCounts = columnValueCounts[col] || {};
                const topValues = Object.entries(valueCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([value, count]) => ({ value, count }));
                return {
                  name: col,
                  type: 'string',
                  uniqueValues: Object.keys(valueCounts).length,
                  nullCount: nullCounts[col] || 0,
                  topValues,
                };
              });

              const result: DataStats = {
                totalRows,
                columns: columnStats,
                sampleData,
              };
              setStats(result);
              setIsAnalyzing(false);
              resolve(result);
            }
          };
          request.onerror = () => { setIsAnalyzing(false); reject(request.error); };
        };
        countReq.onerror = () => { setIsAnalyzing(false); reject(countReq.error); };
      });
    } catch (error) {
      setIsAnalyzing(false);
      throw error;
    }
  }, []);

  return { analyze, stats, isAnalyzing };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoterDataDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
