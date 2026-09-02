import { useState, useEffect, useCallback } from 'react';
import { useLocalFileSystem } from '@/lib/data/useLocalFileSystem';
import { SecurityScanner } from '@/lib/data/SecurityScanner';
import localforage from 'localforage';

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

  // Load saved stories from localforage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadStories = async () => {
        try {
          let stored: any = await localforage.getItem("marigold_saved_stories");
          
          if (!stored || stored.length === 0) {
            const oldData = localStorage.getItem("marigold_saved_stories");
            if (oldData) {
              try {
                stored = JSON.parse(oldData);
                if (stored && Array.isArray(stored) && stored.length > 0) {
                  await localforage.setItem("marigold_saved_stories", stored);
                }
              } catch(e) {}
            }
          }

          if (stored && Array.isArray(stored) && stored.length > 0) {
            setSavedStories(stored);
          } else {
            setSavedStories([]);
            await localforage.setItem("marigold_saved_stories", []);
          }
        } catch (e) {
          console.error("Failed to load saved stories:", e);
        }
      };
      loadStories();
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
        localforage.setItem("marigold_saved_stories", next).catch(e => console.error(e));
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
