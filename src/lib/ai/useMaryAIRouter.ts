"use client";

import { useState } from 'react';
import { globalPIIPipeline } from '../data/ZeroPII';
import { MariContext } from '../data/MariContextStore';

export interface DataStoryPayload {
  query: string;
  chartType: string;
  narrative: string;
}

export function useMaryAIRouter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDataStory = async (
    naturalLanguageQuery: string,
    schema: any[],
    userContext: MariContext
  ): Promise<DataStoryPayload | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Scrub Schema (Zero-PII)
      // Hash any potentially sensitive column names.
      const scrubbedSchema = schema.map(col => ({
        ...col,
        column_name: globalPIIPipeline.encodeValue(col.column_name)
      }));

      // 2. Prepare Context Window
      // Measure token size here if needed (conceptual for now, API takes care of large payloads up to 2M)

      // 3. Pervasive Background API Call
      const res = await fetch('/api/data-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: naturalLanguageQuery,
          schema: scrubbedSchema,
          userContext: userContext
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate Data Story");
      }

      const payload: DataStoryPayload = await res.json();

      // 4. Local Resolution (Decode Hashes)
      payload.query = globalPIIPipeline.decodeString(payload.query);
      payload.narrative = globalPIIPipeline.decodeString(payload.narrative);

      return payload;
    } catch (err: any) {
      console.error("MaryAIRouter Error:", err);
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateDataStory, isGenerating, error };
}
