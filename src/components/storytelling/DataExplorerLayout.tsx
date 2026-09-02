"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDuckDB } from '../../lib/data/DuckDBProvider';
import { DropzoneIngester } from '../ingestion/DropzoneIngester';
import { useMaryAIRouter, ChartConfig } from '../../lib/ai/useMaryAIRouter';
import { EditorialBriefing } from './EditorialBriefing';
import { EditorialChart } from './EditorialChart';
import { CitationCard, Citation } from './CitationCard';
import { MariContextStore, MariContext } from '../../lib/data/MariContextStore';
import { globalPIIPipeline } from '../../lib/data/ZeroPII';

export interface DataStoryPayload {
  query: string;
  chartType: string;
  chartConfig?: ChartConfig;
  narrative: string;
}

export interface DossierBlock {
  id: string;
  type: 'hook' | 'thesis' | 'chart' | 'dialectic_antithesis' | 'synthesis' | 'paragraph';
  status: 'proposed' | 'approved' | 'rejected';
  content: {
    title?: string;
    narrative?: string;
    chartConfig?: { chartType: string; data: any[]; config: any };
  };
  sqlProvenance?: string;
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
  const [dossierBlocks, setDossierBlocks] = useState<DossierBlock[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [mariContext, setMariContext] = useState<MariContext | null>(null);
  const [isQueryingLocalDB, setIsQueryingLocalDB] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dossierEndRef = useRef<HTMLDivElement>(null);

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

    const aiResponse = await synthesizeNarrative(userQuery, duckDbResult, sqlPayload.chartConfig);
    if (!aiResponse || !Array.isArray(aiResponse.blocks)) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      text: aiResponse.nextSocraticQuestion,
      payload: {
        query: sqlPayload.query,
        chartType: sqlPayload.chartType,
        chartConfig: sqlPayload.chartConfig,
        narrative: "I've drafted a new section in the dossier."
      }
    }]);

    const newDossierBlocks: DossierBlock[] = aiResponse.blocks.map((b: any, index: number) => {
      const isChart = b.type === 'chart';
      return {
        id: Date.now().toString() + '-' + index,
        type: isChart ? 'chart' : b.type,
        status: 'proposed',
        content: {
          title: b.type === 'header' ? globalPIIPipeline.decodeString(b.content) : undefined,
          narrative: b.type === 'paragraph' ? globalPIIPipeline.decodeString(b.content) : undefined,
          chartConfig: isChart ? {
            chartType: sqlPayload!.chartType,
            data: duckDbResult!,
            config: sqlPayload!.chartConfig
          } : undefined
        },
        sqlProvenance: isChart ? sqlPayload!.query : undefined
      };
    });

    setDossierBlocks(prev => [...prev, ...newDossierBlocks]);
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

  const handleBlockAction = (blockId: string, action: 'approved' | 'rejected' | 'discuss') => {
    if (action === 'discuss') {
      const block = dossierBlocks.find(b => b.id === blockId);
      if (block) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          text: `Let's discuss this section: "${block.content.narrative?.substring(0, 50)}..."`
        }]);
      }
      return;
    }
    
    setDossierBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, status: action } : b
    ).filter(b => b.status !== 'rejected'));
  };

  const handleExport = async (sanitize = false) => {
    try {
      const res = await fetch('/api/data-story/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: dossierBlocks, sanitize })
      });
      if (res.ok) {
        alert(`Dossier successfully saved to Marigold_Local/Data_Stories!${sanitize ? ' (PII Redacted)' : ''}`);
      } else {
        alert("Failed to export dossier.");
      }
    } catch (err) {
      console.error(err);
      alert("Error exporting dossier.");
    }
  };

  if (!isReady) {
    return <div className="p-8 text-center text-gray-400">Initializing Local Compute Engine...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A] z-10 shadow-md">
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

      <div className="flex-1 flex overflow-hidden print-reset-layout">
        {/* Center Pane: The Living Dossier */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB] text-gray-900 p-8 lg:p-16 relative shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] print-reset-layout">
          
          {dossierBlocks.length > 0 && (
            <div className="absolute top-4 right-8 flex space-x-3 no-print z-30">
              <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                Print to PDF
              </button>
              <button 
                onClick={() => handleExport(false)} 
                className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-opacity-90 shadow-sm"
              >
                Save Locally
              </button>
              <button 
                onClick={() => handleExport(true)} 
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 shadow-sm"
                title="Strict PII Redaction for Public Sharing"
              >
                Sanitize & Export
              </button>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-12 pb-32">
            {dossierBlocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-32 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-2xl opacity-50">✍️</span>
                </div>
                <p className="font-serif italic text-lg text-gray-500">The Living Dossier is empty.</p>
                <p className="text-sm">Use the Socratic chat to investigate data and propose sections.</p>
              </div>
            ) : (
              dossierBlocks.map(block => (
                <div key={block.id} className={`transition-all duration-500 ease-out relative group ${block.status === 'proposed' ? 'ring-2 ring-primary/50 bg-white shadow-xl rounded-xl p-6 -mx-6' : ''}`}>
                  
                  {block.status === 'proposed' && (
                    <div className="absolute -top-4 right-4 flex bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                      <button onClick={() => handleBlockAction(block.id, 'approved')} className="px-4 py-2 text-xs font-semibold text-green-600 hover:bg-green-50 border-r border-gray-200 transition-colors">Approve</button>
                      <button onClick={() => handleBlockAction(block.id, 'discuss')} className="px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border-r border-gray-200 transition-colors">Discuss</button>
                      <button onClick={() => handleBlockAction(block.id, 'rejected')} className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">Reject</button>
                    </div>
                  )}

                  {block.status === 'proposed' && (
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
                  )}

                  {block.content.title && (
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 leading-snug">{block.content.title}</h2>
                  )}

                  {block.content.narrative && (
                    <div className="prose prose-lg prose-slate max-w-none text-gray-800 font-serif leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content.narrative }} />
                  )}

                  {block.content.chartConfig && (
                    <div className="mt-8 mb-4">
                      <EditorialChart 
                        chartType={block.content.chartConfig.chartType} 
                        data={block.content.chartConfig.data} 
                        config={block.content.chartConfig.config} 
                      />
                    </div>
                  )}
                  
                  {block.sqlProvenance && block.status === 'approved' && (
                    <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-1 rounded">Source Verified</span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={dossierEndRef} />
          </div>
        </div>

        {/* Right Pane: Socratic Chat Engine */}
        <div className="w-96 flex-shrink-0 flex flex-col bg-[#1A1A1A] border-l border-gray-800 shadow-2xl relative z-20 transition-all duration-300 no-print">
          <div className="px-4 py-3 border-b border-gray-800 bg-[#161616]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Socratic Engine
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 italic text-center space-y-4">
                    <p className="text-sm">I am Mari.</p>
                    <p className="text-xs">Ask me a statistical question, or upload a dataset to begin the investigation.</p>
                </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'system' && (
                    <div className="w-full text-center text-gray-500 text-[10px] font-mono tracking-widest">{msg.text}</div>
                )}

                {msg.role === 'user' && (
                    <div className="bg-gray-800 text-white p-3 rounded-lg rounded-tr-sm max-w-[85%] text-sm shadow-sm">
                        {msg.text}
                    </div>
                )}

                {msg.role === 'assistant' && (
                    <div className="bg-[#242424] border border-gray-700/50 p-4 rounded-lg rounded-tl-sm max-w-[90%] shadow-lg">
                        {msg.text && <p className="text-sm text-gray-200 leading-relaxed">{msg.text}</p>}
                        
                        {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider">Sources</h4>
                                {msg.citations.map((cite, idx) => (
                                    <CitationCard key={idx} index={idx} citation={cite} />
                                ))}
                            </div>
                        )}

                        {msg.payload && (
                            <div className="bg-[#1A1A1A] border border-gray-700 p-3 mt-3 rounded text-sm text-gray-300 italic border-l-2 border-l-primary">
                                {msg.payload.narrative}
                            </div>
                        )}

                        {msg.actionPrompt && msg.actionPrompt.type === 'APPROVE_DOWNLOAD' && (
                            <div className="mt-4 flex flex-col space-y-2">
                                <button onClick={() => handleActionPrompt('APPROVE', msg.id)} className="bg-primary text-white text-xs px-4 py-2 rounded font-medium shadow-[0_0_10px_rgba(226,125,96,0.2)] hover:bg-opacity-90">
                                    Approve Download
                                </button>
                                <button onClick={() => handleActionPrompt('DECLINE', msg.id)} className="bg-transparent border border-gray-600 text-gray-400 text-xs px-4 py-2 rounded hover:bg-gray-800 hover:text-gray-300">
                                    Decline & Use Public
                                </button>
                            </div>
                        )}
                    </div>
                )}
              </div>
            ))}

            {(isGenerating || isQueryingLocalDB) && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-[#242424] border border-gray-700/50 p-3 rounded-lg text-primary text-xs font-medium flex items-center space-x-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {isQueryingLocalDB ? "Computing Locally..." : pipelineStatus || "Synthesizing..."}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-[#161616]">
            {error && <div className="text-red-400 text-xs mb-2 truncate" title={error}>{error}</div>}
            <div className="flex flex-col space-y-2">
                <textarea
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary resize-none placeholder-gray-500"
                    placeholder="Ask a question..."
                    rows={2}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(); 
                      }
                    }}
                    disabled={isGenerating || isQueryingLocalDB}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isGenerating || isQueryingLocalDB || !inputValue.trim()}
                    className="w-full bg-primary text-white py-2 rounded font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors text-sm"
                >
                    Send
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
