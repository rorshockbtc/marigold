import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FeedProvider, useFeed } from '@/lib/workspace/FeedContext';

// Mock localStorage and fetch
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
global.fetch = jest.fn();

describe('FeedContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with empty feed when localStorage is empty', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <FeedProvider>{children}</FeedProvider>;
    const { result } = renderHook(() => useFeed(), { wrapper });

    expect(result.current.feedEvents).toEqual([]);
  });

  it('adds a feed event and persists to localStorage', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <FeedProvider>{children}</FeedProvider>;
    const { result } = renderHook(() => useFeed(), { wrapper });

    await act(async () => {
      await result.current.addFeedEvent({
        type: 'system_alert',
        message: 'test message',
      });
    });

    expect(result.current.feedEvents.length).toBe(1);
    expect(result.current.feedEvents[0].message).toBe('test message');
    expect(JSON.parse(window.localStorage.getItem('marigold_feed') || '[]').length).toBe(1);
  });
});
