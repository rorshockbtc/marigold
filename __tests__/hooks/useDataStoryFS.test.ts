import { renderHook, act } from '@testing-library/react';
import { useDataStoryFS } from '../../src/hooks/useDataStoryFS';
import * as LocalFSManager from '../../src/lib/fs/LocalFSManager';
import { ChatSession } from '../../src/lib/types';

// Mock dependencies
jest.mock('../../src/lib/fs/LocalFSManager', () => ({
  getDirectoryHandle: jest.fn(),
  verifyPermission: jest.fn()
}));

describe('useDataStoryFS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useDataStoryFS());
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle saving a data story successfully', async () => {
    // Setup mocks
    const mockFileHandle = { createWritable: jest.fn().mockResolvedValue({ write: jest.fn(), close: jest.fn() }) };
    const mockStoriesDirHandle = { getFileHandle: jest.fn().mockResolvedValue(mockFileHandle) };
    const mockLatestSubDir = { getDirectoryHandle: jest.fn().mockResolvedValue(mockStoriesDirHandle) };
    const mockRootDirHandle = {
      values: jest.fn().mockReturnValue([
        { kind: 'directory', name: '2026-07-30_1000', getDirectoryHandle: mockLatestSubDir.getDirectoryHandle }
      ])
    };

    (LocalFSManager.getDirectoryHandle as jest.Mock).mockResolvedValue(mockRootDirHandle);
    (LocalFSManager.verifyPermission as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useDataStoryFS());
    const mockSession: ChatSession = { id: '123', title: 'Test Story', timestamp: 123, messages: [] };

    await act(async () => {
      const filename = await result.current.saveDataStory(mockSession);
      expect(filename).toContain('test_story_123.json');
    });

    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing directory handle error', async () => {
    (LocalFSManager.getDirectoryHandle as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useDataStoryFS());
    const mockSession: ChatSession = { id: '123', title: 'Test Story', timestamp: 123, messages: [] };

    await act(async () => {
      await expect(result.current.saveDataStory(mockSession)).rejects.toThrow('No Marigold Local folder linked.');
    });

    expect(result.current.error).toContain('No Marigold Local');
  });
});
