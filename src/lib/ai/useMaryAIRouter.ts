"use client";

import { useState } from 'react';
import { globalPIIPipeline } from '../data/ZeroPII';
import { MariContext } from '../data/MariContextStore';

export interface ChartConfig {
  xAxisKey?: string;
  yAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  seriesKeys?: string[];
}

export interface SQLPayload {
  query: string;
  chartType: 'bar' | 'scatter' | 'line' | 'pie';
  chartConfig: ChartConfig;
}

export interface IntentPayload {
  intent: 'LOCAL_DATA' | 'WEB_HUNT' | 'QUALITATIVE_RESEARCH';
  reasoning: string;
  proposedDatasetQuery: string | null;
}

export function useMaryAIRouter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classifyIntent = async (naturalLanguageQuery: string, activeSchemaName: string | null): Promise<IntentPayload | null> => {
    setIsGenerating(true);
    setError(null);
    setPipelineStatus("Analyzing intent...");
    try {
      const res = await fetch('/api/data-story/router', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery, activeSchemaName })
      });
      if (!res.ok) throw new Error("Failed to classify intent");
      return await res.json();
    } catch (err: unknown) {
      console.error("Intent Classifier Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
      setPipelineStatus(null);
    }
  };

  const synthesizeResearch = async (naturalLanguageQuery: string): Promise<any> => {
    setIsGenerating(true);
    setError(null);
    setPipelineStatus("Compiling historical and qualitative research...");
    try {
      const res = await fetch('/api/data-story/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery })
      });
      if (!res.ok) throw new Error("Failed to compile research");
      return await res.json();
    } catch (err: unknown) {
      console.error("Research Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
      setPipelineStatus(null);
    }
  };

  const generateSQL = async (
    naturalLanguageQuery: string,
    schema: any[],
    sqlError: string | null = null
  ): Promise<SQLPayload | null> => {
    setIsGenerating(true);
    setError(null);
    setPipelineStatus("Analyzing schema & establishing constraints...");

    try {
      const scrubbedSchema = schema.map(col => ({
        ...col,
        column_name: globalPIIPipeline.encodeValue(col.column_name)
      }));

      const res = await fetch('/api/data-story/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery, schema: scrubbedSchema, sqlError })
      });

      if (!res.ok) throw new Error("Failed to generate SQL payload");

      const payload: SQLPayload = await res.json();
      
      // Decode the generated SQL so DuckDB can read the real column names
      payload.query = globalPIIPipeline.decodeString(payload.query);
      return payload;
    } catch (err: any) {
      console.error("SQL Gen Error:", err);
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setIsGenerating(false);
      setPipelineStatus(null);
    }
  };

  const synthesizeNarrative = async (
    naturalLanguageQuery: string,
    chartData: any[],
    chartConfig: ChartConfig
  ): Promise<{ blocks: any[], nextSocraticQuestion: string } | null> => {
    setIsGenerating(true);
    setError(null);
    setPipelineStatus("Synthesizing editorial narrative...");

    try {
      const res = await fetch('/api/data-story/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery, chartData, chartConfig })
      });

      if (!res.ok) throw new Error("Failed to generate narrative");

      const data = await res.json();
      return {
        blocks: data.blocks || [],
        nextSocraticQuestion: data.nextSocraticQuestion || "What would you like to investigate next?"
      };
    } catch (err: any) {
      console.error("Narrative Gen Error:", err);
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setIsGenerating(false);
      setPipelineStatus(null);
    }
  };

  return { classifyIntent, generateSQL, synthesizeNarrative, synthesizeResearch, isGenerating, pipelineStatus, error };
}
