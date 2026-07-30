import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Contract Test: useDataStats
 *
 * This hook analyzes the loaded dataset and returns column statistics:
 * types, unique values, null counts, top values, and sample data.
 *
 * WIRING AUDIT: Only consumed by ExecutiveVisualCanvas.tsx.
 * The dashboard and explore pages could benefit from this analysis
 * but do not consume it — they likely duplicate or skip this logic.
 */

// Mock IndexedDB with cursor-based traversal
const createMockDB = (rows: Record<string, any>[]) => {
  let cursorIndex = 0;

  const mockCursor = {
    get value() {
      return rows[cursorIndex];
    },
    continue: () => {
      cursorIndex++;
      const event = { target: { result: cursorIndex < rows.length ? mockCursor : null } };
      setTimeout(() => cursorOpenReq.onsuccess?.(event as any), 0);
    },
  };

  const cursorOpenReq = {
    result: rows.length > 0 ? mockCursor : null,
    onsuccess: null as any,
    onerror: null as any,
  };

  const countReq = {
    result: rows.length,
    onsuccess: null as any,
    onerror: null as any,
  };

  const store = {
    count: () => {
      setTimeout(() => countReq.onsuccess?.(), 0);
      return countReq;
    },
    openCursor: () => {
      cursorIndex = 0;
      setTimeout(() => {
        const event = { target: { result: rows.length > 0 ? mockCursor : null } };
        cursorOpenReq.onsuccess?.(event as any);
      }, 0);
      return cursorOpenReq;
    },
  };

  return {
    transaction: () => ({ objectStore: () => store }),
    objectStoreNames: { contains: () => true },
  };
};

// Mock the openActiveDatabase function
vi.mock('@/lib/db/dbName', () => ({
  openActiveDatabase: vi.fn(),
  isDemoGroupActive: vi.fn(() => true),
  getActiveDatabaseName: vi.fn(() => 'test_db'),
}));

describe('useDataStats', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return empty stats when database has no rows', async () => {
    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB([]));

    const { useDataStats } = await import('@/hooks/useDataStats');
    const { result } = renderHook(() => useDataStats());

    let stats: any;
    await act(async () => {
      stats = await result.current.analyze();
    });

    expect(stats.totalRows).toBe(0);
    expect(stats.columns).toEqual([]);
    expect(stats.sampleData).toEqual([]);
  });

  it('should analyze columns and return correct statistics', async () => {
    const mockRows = [
      { data: { name: 'Alice', city: 'Chicago', zip: '60601' } },
      { data: { name: 'Bob', city: 'Chicago', zip: '60602' } },
      { data: { name: 'Alice', city: 'Denver', zip: '80201' } },
      { data: { name: null, city: 'Chicago', zip: '60601' } },
    ];

    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB(mockRows));

    const { useDataStats } = await import('@/hooks/useDataStats');
    const { result } = renderHook(() => useDataStats());

    let stats: any;
    await act(async () => {
      stats = await result.current.analyze();
    });

    expect(stats.totalRows).toBe(4);
    expect(stats.columns.length).toBe(3);

    // Check the 'name' column
    const nameCol = stats.columns.find((c: any) => c.name === 'name');
    expect(nameCol).toBeDefined();
    expect(nameCol.uniqueValues).toBe(2); // Alice, Bob
    expect(nameCol.nullCount).toBe(1); // One null

    // Check the 'city' column
    const cityCol = stats.columns.find((c: any) => c.name === 'city');
    expect(cityCol).toBeDefined();
    expect(cityCol.topValues[0].value).toBe('Chicago'); // Most frequent
    expect(cityCol.topValues[0].count).toBe(3);
  });

  it('should track isAnalyzing state correctly', async () => {
    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB([]));

    const { useDataStats } = await import('@/hooks/useDataStats');
    const { result } = renderHook(() => useDataStats());

    expect(result.current.isAnalyzing).toBe(false);

    const analyzePromise = act(async () => {
      await result.current.analyze();
    });

    await analyzePromise;
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should include sample data capped at 100 rows', async () => {
    // Create 150 mock rows
    const mockRows = Array.from({ length: 150 }, (_, i) => ({
      data: { name: `Person ${i}`, city: 'TestCity' },
    }));

    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB(mockRows));

    const { useDataStats } = await import('@/hooks/useDataStats');
    const { result } = renderHook(() => useDataStats());

    let stats: any;
    await act(async () => {
      stats = await result.current.analyze();
    });

    expect(stats.sampleData.length).toBe(100);
    expect(stats.totalRows).toBe(150);
  });
});
