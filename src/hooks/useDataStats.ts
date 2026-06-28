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
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const rowData = cursor.value.data;
            totalRows++;
            if (columns.length === 0) {
              columns = Object.keys(rowData);
              columns.forEach(col => { columnValueCounts[col] = {}; nullCounts[col] = 0; });
            }
            if (sampleData.length < 100) sampleData.push(rowData);
            // Sample first 50K rows for stats performance
            if (totalRows <= 50000) {
              columns.forEach(col => {
                const value = rowData[col];
                if (value === null || value === undefined || value === '') {
                  nullCounts[col]++;
                } else {
                  const strValue = String(value);
                  columnValueCounts[col][strValue] = (columnValueCounts[col][strValue] || 0) + 1;
                }
              });
            }
            cursor.continue();
          } else {
            const columnStats: ColumnStats[] = columns.map(col => {
              const valueCounts = columnValueCounts[col];
              const topValues = Object.entries(valueCounts)
                .sort((a, b) => b[1] - a[1]).slice(0, 10)
                .map(([value, count]) => ({ value, count }));
              const type = detectType(sampleData.map(row => row[col]).filter(v => v != null));
              return { name: col, type, uniqueValues: Object.keys(valueCounts).length, nullCount: nullCounts[col] || 0, topValues };
            });
            const result: DataStats = { totalRows, columns: columnStats, sampleData: sampleData.slice(0, 10) };
            setStats(result);
            setIsAnalyzing(false);
            resolve(result);
          }
        };
        request.onerror = () => { setIsAnalyzing(false); reject(request.error); };
      });
    } catch (error) {
      setIsAnalyzing(false);
      throw error;
    }
  }, []);

  const getFilteredCount = useCallback(async (filters: Array<{ column: string; value: string }>): Promise<number> => {
    const db = await openDatabase();
    const store = db.transaction(['rows'], 'readonly').objectStore('rows');
    let matchCount = 0;
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const rowData = cursor.value.data;
          const matches = filters.every(({ column, value }) => {
            if (!value) return true;
            return String(rowData[column] || '').toLowerCase().trim() === value.toLowerCase().trim();
          });
          if (matches) matchCount++;
          cursor.continue();
        } else resolve(matchCount);
      };
      request.onerror = () => reject(request.error);
    });
  }, []);

  const getFilteredRows = useCallback(async (
    filters: Array<{ column: string; value: string }>,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ rows: Array<Record<string, any>>; totalMatches: number }> => {
    const db = await openDatabase();
    const store = db.transaction(['rows'], 'readonly').objectStore('rows');
    const matchingRows: Array<Record<string, any>> = [];
    let matchCount = 0;
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const rowData = cursor.value.data;
          const matches = filters.length === 0 || filters.every(({ column, value }) => {
            if (!value) return true;
            return String(rowData[column] || '').toLowerCase().trim() === value.toLowerCase().trim();
          });
          if (matches) {
            matchCount++;
            if (matchCount > offset && matchingRows.length < limit) matchingRows.push(rowData);
          }
          cursor.continue();
        } else resolve({ rows: matchingRows, totalMatches: matchCount });
      };
      request.onerror = () => reject(request.error);
    });
  }, []);

  const getAggregation = useCallback(async (
    groupByColumn: string,
    aggregateColumn?: string
  ): Promise<Record<string, { count: number; values?: number[] }>> => {
    const db = await openDatabase();
    const store = db.transaction(['rows'], 'readonly').objectStore('rows');
    const groups: Record<string, { count: number; values: number[] }> = {};
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const rowData = cursor.value.data;
          const groupKey = String(rowData[groupByColumn] || 'Unknown');
          if (!groups[groupKey]) groups[groupKey] = { count: 0, values: [] };
          groups[groupKey].count++;
          if (aggregateColumn) {
            const numValue = parseFloat(rowData[aggregateColumn]);
            if (!isNaN(numValue)) groups[groupKey].values.push(numValue);
          }
          cursor.continue();
        } else resolve(groups);
      };
      request.onerror = () => reject(request.error);
    });
  }, []);

  return { analyze, stats, isAnalyzing, getFilteredCount, getFilteredRows, getAggregation };
}

function detectType(values: any[]): 'string' | 'number' | 'date' | 'boolean' {
  const sample = values.slice(0, 100);
  if (sample.every(v => !isNaN(parseFloat(v)))) return 'number';
  const boolValues = ['true', 'false', 'yes', 'no', '1', '0'];
  if (sample.every(v => boolValues.includes(String(v).toLowerCase()))) return 'boolean';
  if (sample.every(v => /^\\d{1,4}[-/]\\d{1,2}[-/]\\d{1,4}$/.test(String(v)))) return 'date';
  return 'string';
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoterDataDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
