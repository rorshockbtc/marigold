import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Contract Test: useVoterRollConnection
 *
 * This hook is the foundational data layer for the entire application.
 * It determines whether a dataset is loaded, how many rows exist, and
 * what file is connected. Every data-dependent component ultimately
 * relies on this state.
 *
 * WIRING AUDIT: Only ExecutiveVisualCanvas.tsx consumes this hook.
 * That is a critical gap — dashboard, explore, and other pages should
 * also consume it instead of reading localStorage directly.
 */

// Mock IndexedDB
const mockIndexedDB = () => {
  const stores: Record<string, any[]> = {};

  const mockDB = {
    objectStoreNames: {
      contains: (name: string) => name in stores,
    },
    transaction: (storeNames: string[]) => ({
      objectStore: (name: string) => ({
        count: () => {
          const req = {
            result: stores[name]?.length || 0,
            onsuccess: null as any,
            onerror: null as any,
          };
          setTimeout(() => req.onsuccess?.(), 0);
          return req;
        },
      }),
    }),
  };

  const mockOpen = (dbName: string) => {
    const req = {
      result: mockDB,
      onsuccess: null as any,
      onerror: null as any,
      onupgradeneeded: null as any,
    };
    setTimeout(() => req.onsuccess?.({ target: req }), 0);
    return req;
  };

  const mockDeleteDatabase = (dbName: string) => {
    const req = {
      onsuccess: null as any,
      onerror: null as any,
    };
    setTimeout(() => req.onsuccess?.(), 0);
    return req;
  };

  return {
    open: vi.fn(mockOpen),
    deleteDatabase: vi.fn(mockDeleteDatabase),
    stores,
    mockDB,
  };
};

describe('useVoterRollConnection', () => {
  let mockIDB: ReturnType<typeof mockIndexedDB>;

  beforeEach(() => {
    mockIDB = mockIndexedDB();
    vi.stubGlobal('indexedDB', mockIDB);
    localStorage.clear();
    // Simulate that crypto purge has already happened
    localStorage.setItem('marigold_crypto_purged', 'true');
  });

  it('should report disconnected state when database has no rows store', async () => {
    // DB exists but has no "rows" object store
    const { useVoterRollConnection } = await import('@/hooks/useVoterRollConnection');
    const { result } = renderHook(() => useVoterRollConnection());

    // Wait for async IndexedDB operations
    await vi.waitFor(() => {
      expect(result.current.isDataConnected).toBe(false);
    });
    // Initial state has null for loadedRowCount before any DB check completes
    expect(result.current.loadedRowCount === 0 || result.current.loadedRowCount === null).toBe(true);
  });

  it('should report connected state when database has rows', async () => {
    // Pre-populate the mock store
    mockIDB.stores['rows'] = new Array(1842).fill({ data: {} });

    const { useVoterRollConnection } = await import('@/hooks/useVoterRollConnection');
    const { result } = renderHook(() =>
      useVoterRollConnection('State of Roosevelt (Demo)')
    );

    await vi.waitFor(() => {
      expect(result.current.isDataConnected).toBe(true);
    });
    expect(result.current.loadedRowCount).toBe(1842);
    expect(result.current.loadedFileName).toContain('DEMO_roosevelt');
  });

  it('should trigger crypto purge on first run when purge flag is absent', async () => {
    localStorage.removeItem('marigold_crypto_purged');

    const { useVoterRollConnection } = await import('@/hooks/useVoterRollConnection');
    renderHook(() => useVoterRollConnection());

    await vi.waitFor(() => {
      expect(mockIDB.deleteDatabase).toHaveBeenCalled();
    });
  });

  it('should default to empty state for non-demo groups with no data', async () => {
    const { useVoterRollConnection } = await import('@/hooks/useVoterRollConnection');
    const { result } = renderHook(() =>
      useVoterRollConnection('Real Production Group')
    );

    await vi.waitFor(() => {
      expect(result.current.isDataConnected).toBe(false);
    });
    // loadedRowCount may be null (initial) or 0 (after empty DB check)
    expect(result.current.loadedRowCount === 0 || result.current.loadedRowCount === null).toBe(true);
    expect(result.current.loadedFileName).toBe('');
  });
});
