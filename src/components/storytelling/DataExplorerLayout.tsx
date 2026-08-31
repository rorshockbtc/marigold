"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDuckDB } from '../../lib/data/DuckDBProvider';
import { DropzoneIngester } from '../ingestion/DropzoneIngester';
import { useMaryAIRouter, ChartConfig } from '../../lib/ai/useMaryAIRouter';
import { EditorialBriefing } from './EditorialBriefing';
import { EditorialChart } from './EditorialChart';
import { CitationCard, Citation } from './CitationCard';
import { MariContextStore, MariContext } from '../../lib/data/MariContextStore';

export interface DataStoryPayload {
  query: string;
  chartType: string;
  chartConfig?: ChartConfig;
  narrative: string;
}

type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text?: string;
  payload?: DataStoryPayload;
  chartData?: any[];
  citations?: Citation[];
  actionPrompt?: {
    type: 'APPROVE_DOWNLOAD';
    datasetQuery: string;
  };
}

export const DataExplorerLayout: React.FC = () => {
  const { query, isReady } = useDuckDB();
  const { classifyIntent, generateSQL, synthesizeNarrative, synthesizeResearch, isGenerating, pipelineStatus, error } = useMaryAIRouter();

  const [activeSchema, setActiveSchema] = useState<{fileName: string, schema: any[]} | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [mariContext, setMariContext] = useState<MariContext | null>(null);
  const [isQueryingLocalDB, setIsQueryingLocalDB] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const rootHandleMock = null; 

  useEffect(() => {
    MariContextStore.loadContext(rootHandleMock).then(ctx => {
      setMariContext(ctx);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSchemaExtracted = (fileName: string, schema: any[]) => {
    setActiveSchema({ fileName, schema });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      text: `Dataset ${fileName} successfully chunked and ingested to Marigold Local.`
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    
    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    // 1. Classify Intent
    const intentPayload = await classifyIntent(userText, activeSchema?.fileName || null);
    if (!intentPayload) return;

    if (intentPayload.intent === 'LOCAL_DATA') {
        if (!activeSchema) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "I need a dataset to run this analysis. Please upload a CSV first." }]);
            return;
        }
        await executeLocalPipeline(userText);
    } 
    else if (intentPayload.intent === 'WEB_HUNT') {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            text: `I need the dataset for "${intentPayload.proposedDatasetQuery}" to answer this. Should I download and ingest it to your local disk?`,
            actionPrompt: { type: 'APPROVE_DOWNLOAD', datasetQuery: intentPayload.proposedDatasetQuery! }
        }]);
    }
    else if (intentPayload.intent === 'QUALITATIVE_RESEARCH') {
        await executeResearchPipeline(userText);
    }
  };

  const executeLocalPipeline = async (userQuery: string) => {
    if (!activeSchema) return;
    
    let sqlPayload = null;
    let duckDbResult = null;
    let sqlErrorStr = null;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries && !duckDbResult) {
      sqlPayload = await generateSQL(userQuery, activeSchema.schema, sqlErrorStr);
      if (!sqlPayload) return;

      setIsQueryingLocalDB(true);
      try {
        duckDbResult = await query(sqlPayload.query);
      } catch (dbErr: unknown) {
        console.error("Local DuckDB Execution Error:", dbErr);
        sqlErrorStr = dbErr instanceof Error ? dbErr.message : "DuckDB syntax error";
        retryCount++;
      } finally {
        setIsQueryingLocalDB(false);
      }
    }

    if (!duckDbResult || !sqlPayload) return;

    const narrativeStr = await synthesizeNarrative(userQuery, duckDbResult, sqlPayload.chartConfig);
    if (!narrativeStr) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      payload: {
        query: sqlPayload.query,
        chartType: sqlPayload.chartType,
        chartConfig: sqlPayload.chartConfig,
        narrative: narrativeStr
      },
      chartData: duckDbResult
    }]);
  };

  const executeResearchPipeline = async (userQuery: string) => {
    const research = await synthesizeResearch(userQuery);
    if (!research) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      text: research.narrative,
      citations: research.citations
    }]);
  };

  const handleActionPrompt = async (action: 'APPROVE' | 'DECLINE', msgId: string) => {
    // Remove the action prompt from the message
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionPrompt: undefined } : m));

    if (action === 'DECLINE') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "No problem. Bypassing local data execution. Generating a qualitative summary based on public research..." }]);
        // Mocking the original user text since we don't store it in the action prompt directly for this prototype
        await executeResearchPipeline("Provide a qualitative summary based on public research.");
    } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: "[MOCK] Downloading 40GB dataset to Marigold_Local... (This would trigger the background ingestor)" }]);
    }
  };

  if (!isReady) {
    return <div className="p-8 text-center text-gray-400">Initializing Local Compute Engine...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-white mb-1">Marigold Agentic Concierge</h1>
          <p className="text-gray-400 text-sm">Zero-Cloud, Private Data Storytelling.</p>
        </div>
        {!activeSchema && (
          <div className="w-64">
             <DropzoneIngester onSchemaExtracted={handleSchemaExtracted} />
          </div>
        )}
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
                Ask me a statistical question, or upload a dataset to begin.
            </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'system' && (
                <div className="w-full text-center text-gray-500 text-xs font-mono">{msg.text}</div>
            )}

            {msg.role === 'user' && (
                <div className="bg-gray-800 text-white p-4 rounded-xl max-w-2xl text-sm">
                    {msg.text}
                </div>
            )}

            {msg.role === 'assistant' && (
                <div className="bg-surface border border-gray-700 p-6 rounded-xl max-w-4xl shadow-xl">
                    {/* Render Qualitative Narrative & Citations */}
                    {msg.text && <EditorialBriefing narrative={msg.text} />}
                    {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-6 border-t border-gray-800 pt-6">
                            <h4 className="text-white text-sm font-medium mb-4">Verification Sources</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {msg.citations.map((cite, idx) => (
                                    <CitationCard key={idx} index={idx} citation={cite} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Render Quantitative Data Story */}
                    {msg.payload && msg.chartData && (
                        <div>
                            <EditorialBriefing narrative={msg.payload.narrative} />
                            <div className="mt-8">
                                <EditorialChart chartType={msg.payload.chartType} data={msg.chartData} />
                            </div>
                        </div>
                    )}

                    {/* Render Action Prompts (Path B) */}
                    {msg.actionPrompt && msg.actionPrompt.type === 'APPROVE_DOWNLOAD' && (
                        <div className="mt-6 flex space-x-4">
                            <button onClick={() => handleActionPrompt('APPROVE', msg.id)} className="bg-primary text-white px-6 py-2 rounded font-medium shadow-[0_0_15px_rgba(226,125,96,0.3)] hover:bg-opacity-90">
                                Approve Download to Local Disk
                            </button>
                            <button onClick={() => handleActionPrompt('DECLINE', msg.id)} className="bg-transparent border border-gray-500 text-gray-300 px-6 py-2 rounded hover:bg-gray-800">
                                Decline & Use Public Summary
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        ))}

        {(isGenerating || isQueryingLocalDB) && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-surface border border-gray-700 p-4 rounded-xl text-primary text-sm font-medium">
                    {isQueryingLocalDB ? "Computing Locally..." : pipelineStatus || "Thinking..."}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-800 bg-[#1A1A1A]">
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <div className="flex space-x-4">
            <input
                type="text"
                className="flex-1 bg-[#242424] border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-primary"
                placeholder="E.g., Compare 1990s telecom latency to Bitcoin block confirmations..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                disabled={isGenerating || isQueryingLocalDB}
            />
            <button
                onClick={handleSendMessage}
                disabled={isGenerating || isQueryingLocalDB || !inputValue.trim()}
                className="bg-primary text-white px-8 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
                Send
            </button>
        </div>
      </div>
    </div>
  );
};
