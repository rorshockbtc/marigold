import { useState, useCallback } from 'react';
import { openActiveDatabase, isDemoGroupActive } from '@/lib/db/dbName';

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
      const { MarigoldDataEngineService } = await import('@/lib/services/MarigoldDataEngineService');
      const res = await MarigoldDataEngineService.analyzeData();
      setStats(res);
      setIsAnalyzing(false);
      return res;
    } catch (error) {
      setIsAnalyzing(false);
      throw error;
    }
  }, []);

  return { analyze, stats, isAnalyzing };
}
