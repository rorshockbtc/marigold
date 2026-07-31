import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCSVExport } from '@/hooks/useCSVExport';

/**
 * Contract Test: useCSVExport
 *
 * This hook orchestrates Web Worker-based CSV export with progress tracking,
 * multi-file splitting, and blob URL management.
 *
 * WIRING AUDIT: Only consumed by data-prep/page.tsx.
 * The /explore page has an export button that appears to be DEAD —
 * it does not import this hook.
 */

// Mock Worker globally before module loads
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();

  simulateMessage(data: any) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

let mockWorkerInstance: MockWorker;

// Mock URL as both a constructor and static methods
const MockURL = vi.fn(function(this: any, url: string, base?: string) {
  this.href = url;
  this.toString = () => url;
}) as any;
MockURL.createObjectURL = vi.fn(() => 'blob:mock-url');
MockURL.revokeObjectURL = vi.fn();
vi.stubGlobal('URL', MockURL);

vi.stubGlobal('Worker', class {
  onmessage: any = null;
  postMessage: any;
  terminate: any;
  constructor() {
    mockWorkerInstance = new MockWorker();
    this.postMessage = mockWorkerInstance.postMessage;
    this.terminate = mockWorkerInstance.terminate;
    // Proxy onmessage assignment to the mock
    Object.defineProperty(this, 'onmessage', {
      get: () => mockWorkerInstance.onmessage,
      set: (fn) => { mockWorkerInstance.onmessage = fn; },
    });
  }
});

describe('useCSVExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should start export and set isExporting to true', () => {
    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name', 'address'], 1000);
    });

    expect(result.current.state.isExporting).toBe(true);
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.error).toBeNull();
  });

  it('should update progress when worker reports it', () => {
    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name', 'address'], 1000);
    });

    act(() => {
      mockWorkerInstance.simulateMessage({
        type: 'progress',
        percentComplete: 50,
        rowsProcessed: 500,
        totalRows: 1000,
        currentFile: 1,
      });
    });

    expect(result.current.state.progress).toBe(50);
    expect(result.current.state.rowsProcessed).toBe(500);
    expect(result.current.state.totalRows).toBe(1000);
  });

  it('should add file to filesGenerated when worker reports file_ready', () => {
    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name'], 100);
    });

    act(() => {
      mockWorkerInstance.simulateMessage({
        type: 'file_ready',
        blob: new Blob(['test']),
        filename: 'dataset-part-1.csv',
        rowCount: 100,
      });
    });

    expect(result.current.state.filesGenerated).toHaveLength(1);
    expect(result.current.state.filesGenerated[0].filename).toBe('dataset-part-1.csv');
  });

  it('should mark complete and terminate worker on completion', () => {
    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name'], 100);
    });

    act(() => {
      mockWorkerInstance.simulateMessage({ type: 'complete' });
    });

    expect(result.current.state.isExporting).toBe(false);
    expect(result.current.state.isComplete).toBe(true);
    expect(result.current.state.progress).toBe(100);
    expect(mockWorkerInstance.terminate).toHaveBeenCalled();
  });

  it('should handle worker errors gracefully', () => {
    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name'], 100);
    });

    act(() => {
      mockWorkerInstance.simulateMessage({
        type: 'error',
        message: 'IndexedDB access denied',
      });
    });

    expect(result.current.state.isExporting).toBe(false);
    expect(result.current.state.error).toBe('IndexedDB access denied');
  });

  it('should cancel export and terminate worker', () => {
    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name'], 100);
    });

    act(() => {
      result.current.cancelExport();
    });

    expect(result.current.state.isExporting).toBe(false);
    expect(result.current.state.error).toBe('Export cancelled');
  });

  it('should use DEMO prefix when active group contains demo', () => {
    localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');

    const { result } = renderHook(() => useCSVExport());

    act(() => {
      result.current.startExport(['name'], 100);
    });

    const postMessageCall = mockWorkerInstance.postMessage.mock.calls[0][0];
    expect(postMessageCall.config.filePrefix).toBe('DEMO-dataset');
  });
});
