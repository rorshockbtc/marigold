"use client";

import { useState } from 'react';
import { globalPIIPipeline } from '../data/ZeroPII';
import {
  classifyIntentDeterministic,
  generateDeterministicSQLPayload,
  synthesizeDeterministicNarrative,
  synthesizeDeterministicResearch,
  tryLocalOllamaOrByokJSON,
} from './deterministicStoryEngine';

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
  intent: 'LOCAL_DATA_EXPLORE' | 'LOCAL_DATA_DRAFT' | 'WEB_HUNT' | 'QUALITATIVE_RESEARCH' | 'CLARIFY_MOTIVATION';
  reasoning: string;
  proposedDatasetQuery: string | null;
  socraticQuestion: string | null;
}

export function useMaryAIRouter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classifyIntent = async (naturalLanguageQuery: string, activeSchemaName: string | null): Promise<IntentPayload | null> => {
    setIsGenerating(true);
    setError(null);
    setPipelineStatus("Analyzing intent locally...");
    try {
      // Tier 1: Optional Local Ollama / BYOK
      const localIntent = await tryLocalOllamaOrByokJSON<IntentPayload>(
        naturalLanguageQuery,
        `Classify query into JSON with intent ('LOCAL_DATA_EXPLORE'|'LOCAL_DATA_DRAFT'|'WEB_HUNT'|'QUALITATIVE_RESEARCH'|'CLARIFY_MOTIVATION'), reasoning, proposedDatasetQuery, socraticQuestion. Active dataset: ${activeSchemaName || 'None'}`
      );
      if (localIntent && localIntent.intent) return localIntent;

      // Tier 0: Zero-cost deterministic intent router (instant, 0 server cost)
      return classifyIntentDeterministic(naturalLanguageQuery, activeSchemaName);
    } catch {
      return classifyIntentDeterministic(naturalLanguageQuery, activeSchemaName);
    } finally {
      setIsGenerating(false);
      setPipelineStatus(null);
    }
  };

  const synthesizeResearch = async (naturalLanguageQuery: string): Promise<any> => {
    setIsGenerating(true);
    setError(null);
    setPipelineStatus("Compiling statutory and methodological research...");
    try {
      const res = await fetch('/api/data-story/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery })
      });
      if (res.ok) {
        return await res.json();
      }
      return synthesizeDeterministicResearch(naturalLanguageQuery);
    } catch {
      return synthesizeDeterministicResearch(naturalLanguageQuery);
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
    setPipelineStatus("Compiling DuckDB-Wasm SQL query...");

    try {
      // If a previous LLM SQL attempt failed, immediately use the verified deterministic SQL engine
      if (sqlError) {
        return generateDeterministicSQLPayload(naturalLanguageQuery, schema);
      }

      const scrubbedSchema = schema.map(col => ({
        ...col,
        column_name: globalPIIPipeline.encodeValue(col.column_name)
      }));

      // Tier 1: Optional Local Ollama / BYOK
      const localSql = await tryLocalOllamaOrByokJSON<SQLPayload>(
        `Query: ${naturalLanguageQuery}\nSchema: ${JSON.stringify(scrubbedSchema)}`,
        `Return JSON { query: "SELECT ... FROM data_file ...", chartType: "bar"|"line"|"scatter"|"pie", chartConfig: { xAxisKey: "x", yAxisKey: "y", title: "..." } }`
      );
      if (localSql && localSql.query) {
        localSql.query = globalPIIPipeline.decodeString(localSql.query);
        return localSql;
      }

      // Tier 0 / Server Cascade: call server endpoint (which itself falls back to deterministic SQL at $0 cost)
      const res = await fetch('/api/data-story/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery, schema: scrubbedSchema, sqlError })
      });

      if (res.ok) {
        const payload: SQLPayload = await res.json();
        payload.query = globalPIIPipeline.decodeString(payload.query);
        return payload;
      }

      return generateDeterministicSQLPayload(naturalLanguageQuery, schema);
    } catch {
      return generateDeterministicSQLPayload(naturalLanguageQuery, schema);
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
    setPipelineStatus("Synthesizing 6-stage rhetorical narrative...");

    try {
      // Tier 1: Optional Local Ollama / BYOK
      const localNarrative = await tryLocalOllamaOrByokJSON<{ blocks: any[]; nextSocraticQuestion: string }>(
        `Query: ${naturalLanguageQuery}\nChartConfig: ${JSON.stringify(chartConfig)}\nAggregatedData: ${JSON.stringify(chartData)}`,
        `Return JSON { nextSocraticQuestion: string, blocks: [{ type: 'hook'|'thesis'|'chart'|'dialectic_antithesis'|'synthesis', title?: string, narrative?: string }] }`
      );
      if (localNarrative && Array.isArray(localNarrative.blocks) && localNarrative.blocks.length > 0) {
        return localNarrative;
      }

      // Tier 0 / Server Cascade
      const res = await fetch('/api/data-story/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalLanguageQuery, chartData, chartConfig })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.blocks) && data.blocks.length > 0) {
          return {
            blocks: data.blocks,
            nextSocraticQuestion: data.nextSocraticQuestion || "What would you like to investigate next?"
          };
        }
      }

      return synthesizeDeterministicNarrative(naturalLanguageQuery, chartData, chartConfig);
    } catch {
      return synthesizeDeterministicNarrative(naturalLanguageQuery, chartData, chartConfig);
    } finally {
      setIsGenerating(false);
      setPipelineStatus(null);
    }
  };

  return { classifyIntent, generateSQL, synthesizeNarrative, synthesizeResearch, isGenerating, pipelineStatus, error };
}
