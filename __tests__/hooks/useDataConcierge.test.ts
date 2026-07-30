import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Contract Test: useDataConcierge
 *
 * This hook orchestrates AI-driven data discovery and secure ingestion.
 * It transitions through states: IDLE → LOCAL_CHECK → DATA_DISCOVERY → INGESTING → RENDERING.
 * The SecurityScanner validates endpoints and scans payload chunks.
 *
 * WIRING AUDIT: Only consumed by insights/page.tsx.
 * This is a flagship feature — the Data Concierge — but it's wired
 * to exactly 1 page. Other pages that could benefit (data-prep, dashboard)
 * do not consume it.
 */

// Mock fetch
const mockFetch = vi.fn();

// Mock SecurityScanner
vi.mock('@/lib/data/SecurityScanner', () => ({
  SecurityScanner: {
    validateEndpoint: vi.fn(() => ({ safe: true })),
    scanPayloadChunk: vi.fn(() => ({ safe: true })),
  },
}));

// Mock useLocalFileSystem
vi.mock('@/lib/data/useLocalFileSystem', () => ({
  useLocalFileSystem: () => ({
    isConnected: false,
    requestDirectoryAccess: vi.fn(),
    saveFileSilently: vi.fn(),
  }),
}));

describe('useDataConcierge', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  it('should start in IDLE state', async () => {
    const { useDataConcierge } = await import('@/hooks/useDataConcierge');
    const { result } = renderHook(() => useDataConcierge());

    expect(result.current.state).toBe('IDLE');
    expect(result.current.publicData).toBeNull();
    expect(result.current.errorMsg).toBe('');
  });

  it('should transition to DATA_DISCOVERY when API returns fetch_public_data action', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        action: 'fetch_public_data',
        source_url: 'https://sos.example.gov/voters.csv',
        description: 'State voter roll export',
        suggested_dataset_name: 'roosevelt_2026',
      }),
    });

    const { useDataConcierge } = await import('@/hooks/useDataConcierge');
    const { result } = renderHook(() => useDataConcierge());

    await act(async () => {
      await result.current.startQuery('get voter data for Roosevelt', 'Roosevelt Demo');
    });

    expect(result.current.state).toBe('DATA_DISCOVERY');
    expect(result.current.publicData).not.toBeNull();
    expect(result.current.publicData?.source_url).toBe('https://sos.example.gov/voters.csv');
  });

  it('should transition to RENDERING when API returns non-fetch action', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ action: 'render_response', content: 'Here is your answer' }),
    });

    const { useDataConcierge } = await import('@/hooks/useDataConcierge');
    const { result } = renderHook(() => useDataConcierge());

    await act(async () => {
      await result.current.startQuery('what is Marigold?', 'Test Group');
    });

    expect(result.current.state).toBe('RENDERING');
  });

  it('should transition to ERROR when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { useDataConcierge } = await import('@/hooks/useDataConcierge');
    const { result } = renderHook(() => useDataConcierge());

    await act(async () => {
      await result.current.startQuery('query', 'group');
    });

    expect(result.current.state).toBe('ERROR');
    expect(result.current.errorMsg).toBe('Failed to communicate with Mari LLM router.');
  });

  it('should block ingestion when SecurityScanner rejects the endpoint', async () => {
    const { SecurityScanner } = await import('@/lib/data/SecurityScanner');
    (SecurityScanner.validateEndpoint as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      safe: false,
      reason: 'Domain is on blocklist',
    });

    // First, set up publicData by running a query
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        action: 'fetch_public_data',
        source_url: 'https://malicious-site.com/voters.csv',
        description: 'Suspicious source',
        suggested_dataset_name: 'suspicious',
      }),
    });

    const { useDataConcierge } = await import('@/hooks/useDataConcierge');
    const { result } = renderHook(() => useDataConcierge());

    await act(async () => {
      await result.current.startQuery('get data', 'group');
    });

    await act(async () => {
      await result.current.ingestData('jit');
    });

    expect(result.current.state).toBe('ERROR');
    expect(result.current.errorMsg).toContain('SECURITY ALERT');
  });

  it('should reset to IDLE state', async () => {
    const { useDataConcierge } = await import('@/hooks/useDataConcierge');
    const { result } = renderHook(() => useDataConcierge());

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe('IDLE');
    expect(result.current.publicData).toBeNull();
    expect(result.current.errorMsg).toBe('');
  });
});
