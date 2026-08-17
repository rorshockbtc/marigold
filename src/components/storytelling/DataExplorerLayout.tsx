"use client";

import React, { useState, useEffect } from 'react';
import { useDuckDB } from '../../lib/data/DuckDBProvider';
import { DropzoneIngester } from '../ingestion/DropzoneIngester';
import { useMaryAIRouter, DataStoryPayload } from '../../lib/ai/useMaryAIRouter';
import { EditorialBriefing } from './EditorialBriefing';
import { EditorialChart } from './EditorialChart';
import { MariContextStore, MariContext } from '../../lib/data/MariContextStore';
import { LocalPlaybookStore } from '../../lib/data/LocalPlaybookStore';

export const DataExplorerLayout: React.FC = () => {
  const { query, isReady } = useDuckDB();
  const { generateDataStory, isGenerating, error } = useMaryAIRouter();

  const [activeSchema, setActiveSchema] = useState<{fileName: string, schema: any[]} | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [storyPayload, setStoryPayload] = useState<DataStoryPayload | null>(null);
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [mariContext, setMariContext] = useState<MariContext | null>(null);
  const [isQueryingLocalDB, setIsQueryingLocalDB] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Conceptually, you'd have a global FileSystemDirectoryHandle for the root folder
  // For this prototype, we'll pass null or mock it since LocalFSManager requires it.
  const rootHandleMock = null; // Replace with actual context in production

  useEffect(() => {
    // Load context on mount
    MariContextStore.loadContext(rootHandleMock).then(ctx => {
      setMariContext(ctx);
    });
  }, []);

  const handleSchemaExtracted = (fileName: string, schema: any[]) => {
    setActiveSchema({ fileName, schema });
  };

  const handleRunInquiry = async () => {
    if (!activeSchema || !mariContext || !userQuery) return;

    // 1. Generate Story
    const payload = await generateDataStory(userQuery, activeSchema.schema, mariContext);
    if (!payload) return;

    setStoryPayload(payload);
    setSaveSuccess(false);

    // 2. Execute SQL Locally via DuckDB
    setIsQueryingLocalDB(true);
    try {
      const result = await query(payload.query);
      setChartData(result);

      // Save to context history
      MariContextStore.addHistoricalQuery(rootHandleMock, userQuery).then(() => {
        MariContextStore.loadContext(rootHandleMock).then(setMariContext);
      });
    } catch (dbErr) {
      console.error("Local DuckDB Execution Error:", dbErr);
    } finally {
      setIsQueryingLocalDB(false);
    }
  };

  const handleSavePlaybook = async () => {
    if (!storyPayload) return;
    const success = await LocalPlaybookStore.savePlaybook(rootHandleMock, {
      id: `playbook_${Date.now()}`,
      name: `Analysis of ${activeSchema?.fileName}`,
      description: userQuery,
      queryTemplate: storyPayload.query,
      chartType: storyPayload.chartType,
      createdAt: Date.now()
    });
    setSaveSuccess(success);
  };

  if (!isReady) {
    return <div className="p-8 text-center text-gray-400">Initializing Local Compute Engine...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white mb-2">Marigold Data Explorer</h1>
        <p className="text-gray-400">Zero-Cloud, Private Data Storytelling.</p>
      </div>

      {/* Step 1: Ingestion */}
      {!activeSchema ? (
        <DropzoneIngester onSchemaExtracted={handleSchemaExtracted} />
      ) : (
        <div className="bg-surface border border-gray-700 p-6 rounded-lg">
          <h3 className="text-xl text-white font-medium mb-4">Dataset Ready: {activeSchema.fileName}</h3>
          
          {/* Step 2: The Inquiry */}
          <div className="flex flex-col space-y-4">
            <textarea
              className="w-full bg-[#1A1A1A] border border-gray-600 rounded p-4 text-white focus:outline-none focus:border-primary"
              rows={4}
              placeholder="E.g., If this county lost 20,000 people over a decade, do the local voter rolls drop by a corresponding 20,000 people, or do they remain artificially high?"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
            <button
              onClick={handleRunInquiry}
              disabled={isGenerating || isQueryingLocalDB || !userQuery.trim()}
              className="self-end bg-primary text-white px-6 py-2 rounded font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? "Analyzing Context..." : isQueryingLocalDB ? "Computing Locally..." : "Run Inquiry"}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>
      )}

      {/* Step 3: The Presentation */}
      {storyPayload && chartData && (
        <div className="bg-surface border border-gray-700 p-8 rounded-xl shadow-2xl animate-fade-in">
          <EditorialBriefing narrative={storyPayload.narrative} />
          
          <div className="mt-8">
            <EditorialChart chartType={storyPayload.chartType} data={chartData} />
          </div>

          {/* Action Footer */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-700 pt-6">
            <button 
              className="text-primary hover:text-white transition-colors"
              onClick={() => {
                setStoryPayload(null);
                setChartData(null);
                setActiveSchema(null);
                setUserQuery("");
              }}
            >
              ← Run Another Inquiry
            </button>
            <div className="space-x-4 flex items-center">
              <button className="border border-gray-500 text-gray-300 px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                Add to Kanban
              </button>
              <button 
                onClick={handleSavePlaybook}
                className="bg-primary text-white px-6 py-2 rounded font-medium shadow-[0_0_15px_rgba(226,125,96,0.3)] hover:bg-opacity-90 transition-all"
              >
                {saveSuccess ? "✓ Saved to Marigold Local" : "Save Analysis as Playbook"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
