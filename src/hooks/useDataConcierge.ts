import { useState, useEffect, useCallback } from 'react';
import { useLocalFileSystem } from '@/lib/data/useLocalFileSystem';
import { SecurityScanner } from '@/lib/data/SecurityScanner';

export type ConciergeState = 'IDLE' | 'LOCAL_CHECK' | 'DATA_DISCOVERY' | 'INGESTING' | 'RENDERING' | 'ERROR';

export interface PublicDataPayload {
  source_url: string;
  description: string;
  suggested_dataset_name: string;
}

export interface DataStoryDataPoint {
  label: string;
  valueA: number; // e.g. Temp (°F), Homeownership (%), Data Centers
  valueB: number; // e.g. Obesity Rate (%), Party Reg (%), Local GDP Impact ($M)
}

export interface DataStory {
  id: string;
  title: string;
  query: string;
  summary: string;
  correlationScore: number; // e.g. +0.82
  sourceUrl: string;
  sourceName: string;
  createdAt: string;
  dataPoints: DataStoryDataPoint[];
  insights: string[];
  isSavedLocally?: boolean;
  articleState?: import('@/lib/types').ArticleState;
}

export function useDataConcierge() {
  const [state, setState] = useState<ConciergeState>('IDLE');
  const [publicData, setPublicData] = useState<PublicDataPayload | null>(null);
  const [activeStory, setActiveStory] = useState<DataStory | null>(null);
  const [savedStories, setSavedStories] = useState<DataStory[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [ingestStatus, setIngestStatus] = useState<string>('');
  const { isConnected, requestDirectoryAccess, saveFileSilently } = useLocalFileSystem();

  // Load saved stories from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("marigold_saved_stories");
        if (stored) {
          setSavedStories(JSON.parse(stored));
        } else {
          setSavedStories([]);
          localStorage.setItem("marigold_saved_stories", JSON.stringify([]));
        }
      } catch (e) {
        console.error("Failed to load saved stories:", e);
      }
    }
  }, []);

  // The startQuery, createStoryFromQuery, and ingestData functions were removed
  // because data fetching, triage, and ingestion have been unified securely into
  // the ChatInterface ReAct loop and LocalDataEngine/DuckDB, guaranteeing no hallucinations.

  const saveStoryLocally = useCallback((storyToSave?: DataStory) => {
    const target = storyToSave || activeStory;
    if (!target) return;

    const updatedStory: DataStory = { ...target, isSavedLocally: true };
    setSavedStories((prev) => {
      const filtered = prev.filter((s) => s.id !== updatedStory.id);
      const next = [updatedStory, ...filtered];
      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_saved_stories", JSON.stringify(next));
      }
      return next;
    });

    if (activeStory && activeStory.id === updatedStory.id) {
      setActiveStory(updatedStory);
    }
  }, [activeStory]);

  const selectSavedStory = (story: DataStory) => {
    setActiveStory(story);
    setState('RENDERING');
  };

  const reset = () => {
    setState('IDLE');
    setPublicData(null);
    setActiveStory(null);
    setErrorMsg('');
  };

  return {
    state,
    publicData,
    activeStory,
    savedStories,
    errorMsg,
    ingestStatus,
    saveStoryLocally,
    selectSavedStory,
    reset
  };
}
