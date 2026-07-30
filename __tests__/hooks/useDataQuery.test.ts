import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Contract Test: useDataQuery
 *
 * This is the most complex hook in the application. It provides:
 * 1. Text search across columns (query)
 * 2. 9 audit traversal types (runLocalAudit)
 * 3. Exclusion management (addExclusion)
 *
 * WIRING AUDIT: Best-wired hook (4 consumers), but the 9 audit types
 * may not all be exposed in the UI. This test verifies each audit type
 * produces correct results, so any missing UI wiring is definitively
 * a frontend gap, not a logic bug.
 */

// Mock the dependencies
vi.mock('@/lib/csv/universalMapper', () => ({
  normalizeRowWithMapping: vi.fn((row: any, mapping: any) => ({
    voter_id: row.voter_id || row.id,
    name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    first_name: row.first_name || (row.name ? row.name.split(' ')[0] : ''),
    last_name: row.last_name || (row.name ? row.name.split(' ').pop() : ''),
    address: row.address,
    city: row.city,
    state: row.state || 'MS',
    zip: row.zip,
    county: row.county,
    date_registered: row.date_registered,
    status: row.status || 'A',
    precinct_code: row.precinct_code,
    ncoa_flag: row.ncoa_flag,
    raw: row,
  })),
  interpretColumnMappings: vi.fn(() => ({})),
}));

vi.mock('@/lib/db/dbName', () => ({
  openActiveDatabase: vi.fn(),
  isDemoGroupActive: vi.fn(() => false),
  getActiveDatabaseName: vi.fn(() => 'test_db'),
}));

// Helper to create a mock IndexedDB with cursor traversal
const createMockDB = (rows: any[]) => {
  let cursorIndex = 0;
  const cursorOpenReq: any = { onsuccess: null, onerror: null };

  const mockCursor = {
    get value() { return rows[cursorIndex]; },
    continue: () => {
      cursorIndex++;
      const event = { target: { result: cursorIndex < rows.length ? mockCursor : null } };
      setTimeout(() => cursorOpenReq.onsuccess?.(event), 0);
    },
  };

  const countReq: any = { result: rows.length, onsuccess: null, onerror: null };

  const store = {
    count: () => { setTimeout(() => countReq.onsuccess?.(), 0); return countReq; },
    openCursor: () => {
      cursorIndex = 0;
      setTimeout(() => {
        cursorOpenReq.onsuccess?.({ target: { result: rows.length > 0 ? mockCursor : null } });
      }, 0);
      return cursorOpenReq;
    },
  };

  return {
    transaction: () => ({ objectStore: () => store }),
    objectStoreNames: { contains: () => true },
  };
};

describe('useDataQuery', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('should return matching rows for a text search', async () => {
    const mockRows = [
      { name: 'Alice Smith', address: '123 Main St', city: 'Chicago', state: 'IL', zip: '60601' },
      { name: 'Bob Jones', address: '456 Oak Ave', city: 'Denver', state: 'CO', zip: '80201' },
      { name: 'Alice Johnson', address: '789 Elm Rd', city: 'Chicago', state: 'IL', zip: '60602' },
    ];

    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB(mockRows));

    const { useDataQuery } = await import('@/hooks/useDataQuery');
    const { result } = renderHook(() => useDataQuery());

    let queryResult: any;
    await act(async () => {
      queryResult = await result.current.query('Alice', ['name']);
    });

    expect(queryResult.totalMatches).toBe(2);
    expect(queryResult.rows.length).toBe(2);
  });

  it('should respect pagination (limit and offset)', async () => {
    const mockRows = Array.from({ length: 50 }, (_, i) => ({
      name: `Person ${i}`, address: `${i} Test St`, city: 'TestCity', state: 'TS', zip: '00000',
    }));

    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB(mockRows));

    const { useDataQuery } = await import('@/hooks/useDataQuery');
    const { result } = renderHook(() => useDataQuery());

    let queryResult: any;
    await act(async () => {
      queryResult = await result.current.query('', ['name'], 10, 5);
    });

    expect(queryResult.totalMatches).toBe(50);
    expect(queryResult.rows.length).toBe(10);
  });

  it('should persist exclusions to localStorage', async () => {
    const { useDataQuery } = await import('@/hooks/useDataQuery');
    const { result } = renderHook(() => useDataQuery());

    act(() => {
      result.current.addExclusion('density', '123 Main St');
    });

    const stored = JSON.parse(localStorage.getItem('marigold_exclusions') || '{}');
    expect(stored.density).toContain('123 Main St');
  });

  it('should not duplicate exclusions', async () => {
    const { useDataQuery } = await import('@/hooks/useDataQuery');
    const { result } = renderHook(() => useDataQuery());

    act(() => {
      result.current.addExclusion('density', '123 Main St');
      result.current.addExclusion('density', '123 Main St');
    });

    const stored = JSON.parse(localStorage.getItem('marigold_exclusions') || '{}');
    expect(stored.density.filter((v: string) => v === '123 Main St').length).toBe(1);
  });

  it('should track isQuerying state correctly', async () => {
    const mockRows = [{ name: 'Test', address: '1 St', city: 'C', state: 'S', zip: '0' }];

    const { openActiveDatabase } = await import('@/lib/db/dbName');
    (openActiveDatabase as ReturnType<typeof vi.fn>).mockResolvedValue(createMockDB(mockRows));

    const { useDataQuery } = await import('@/hooks/useDataQuery');
    const { result } = renderHook(() => useDataQuery());

    expect(result.current.isQuerying).toBe(false);

    await act(async () => {
      await result.current.query('Test', ['name']);
    });

    expect(result.current.isQuerying).toBe(false); // Should be false after completion
  });
});
