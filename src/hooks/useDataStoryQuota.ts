"use client";

import { useState, useEffect } from 'react';

const MONTHLY_FREE_QUOTA = 3;

export function useDataStoryQuota() {
  const [storiesUsed, setStoriesUsed] = useState(0);
  const [isPipesSubscribed, setIsPipesSubscribed] = useState(false);

  useEffect(() => {
    // Check local usage for current month
    const monthKey = `marigold_quota_${new Date().getFullYear()}_${new Date().getMonth()}`;
    const used = parseInt(localStorage.getItem(monthKey) || '0', 10);
    setStoriesUsed(used);

    // Check if user has active Pipes token/subscription
    const pipesToken = localStorage.getItem('pipes_auth_token');
    if (pipesToken) {
      setIsPipesSubscribed(true);
    }
  }, []);

  const incrementQuota = (): boolean => {
    if (isPipesSubscribed) return true; // Unlimited for Pipes Subscribers

    const monthKey = `marigold_quota_${new Date().getFullYear()}_${new Date().getMonth()}`;
    if (storiesUsed >= MONTHLY_FREE_QUOTA) {
      return false; // Quota exceeded! Must subscribe to Pipes.
    }

    const nextUsed = storiesUsed + 1;
    localStorage.setItem(monthKey, nextUsed.toString());
    setStoriesUsed(nextUsed);
    return true;
  };

  return {
    storiesUsed,
    remainingFree: Math.max(0, MONTHLY_FREE_QUOTA - storiesUsed),
    isQuotaExceeded: storiesUsed >= MONTHLY_FREE_QUOTA && !isPipesSubscribed,
    isPipesSubscribed,
    incrementQuota
  };
}
