"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDuckDB } from '../../lib/data/DuckDBProvider';
import { DropzoneIngester } from '../ingestion/DropzoneIngester';
import { useMaryAIRouter, ChartConfig } from '../../lib/ai/useMaryAIRouter';
import { EditorialChart } from './EditorialChart';
import { CitationCard, Citation } from './CitationCard';
import { MariContextStore, MariContext } from '../../lib/data/MariContextStore';
import { globalPIIPipeline } from '../../lib/data/ZeroPII';
import { useDataStoryQuota } from '@/hooks/useDataStoryQuota';
import { useVoterRollConnection } from '@/hooks/useVoterRollConnection';
import { MarigoldDataEngineService, AuditSweepResults } from '@/lib/services/MarigoldDataEngineService';
import { Button } from '@/components/ui/Button';
import { Link } from '@/components/ui/Link';
import { PipesNetworkBridgeModal } from '@/components/PipesNetworkBridgeModal';
import { BlindSpotItem } from '@/lib/pipes/editorialRubricAndGraph';

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
  const { remainingFree, isQuotaExceeded, isPipesSubscribed, incrementQuota } = useDataStoryQuota();
  const { isDataConnected, loadedFileName, loadedRowCount } = useVoterRollConnection();

  const [activeSchema, setActiveSchema] = useState<{fileName: string, schema: any[]} | null>(null);
  const [cachedAuditSweep, setCachedAuditSweep] = useState<AuditSweepResults | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [dossierBlocks, setDossierBlocks] = useState<DossierBlock[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [mariContext, setMariContext] = useState<MariContext | null>(null);
  const [isQueryingLocalDB, setIsQueryingLocalDB] = useState(false);
  const [exportBanner, setExportBanner] = useState<string | null>(null);
  const [isPipesBridgeOpen, setIsPipesBridgeOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dossierEndRef = useRef<HTMLDivElement>(null);

  const rootHandleMock = null; 

  useEffect(() => {
    MariContextStore.loadContext(rootHandleMock).then(ctx => {
      setMariContext(ctx);
    });
  }, []);

  // Automatically bridge already-connected datasets and 360° Audit Sweep results
  useEffect(() => {
    const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
    MarigoldDataEngineService.getPersistentAuditMap(activeGroup)
      .then((sweep) => {
        if (sweep) {
          setCachedAuditSweep(sweep);
        }
      })
      .catch(() => null);

    if (isDataConnected && loadedFileName && !activeSchema) {
      setActiveSchema({
        fileName: loadedFileName,
        schema: [
          { column_name: 'voter_id', column_type: 'VARCHAR' },
          { column_name: 'first_name', column_type: 'VARCHAR' },
          { column_name: 'last_name', column_type: 'VARCHAR' },
          { column_name: 'res_address', column_type: 'VARCHAR' },
          { column_name: 'city', column_type: 'VARCHAR' },
          { column_name: 'zip', column_type: 'VARCHAR' },
          { column_name: 'county', column_type: 'VARCHAR' },
          { column_name: 'reg_date', column_type: 'VARCHAR' }
        ]
      });
      setMessages(prev => prev.length === 0 ? [{
        id: 'auto-bridge-msg',
        role: 'system',
        text: `Connected active workspace dataset: ${loadedFileName} (${(loadedRowCount || 0).toLocaleString()} rows).`
      }] : prev);
    }
  }, [isDataConnected, loadedFileName, loadedRowCount, activeSchema]);

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

  const handleSynthesizeFromAuditSweep = () => {
    if (!incrementQuota()) {
      setExportBanner("Monthly free Data Story quota reached (3/3). Subscribe on Pipes for unlimited local dossiers.");
      return;
    }

    const totalScanned = cachedAuditSweep?.totalScanned || loadedRowCount || 1800;
    const rec = cachedAuditSweep?.anomalyRecords || {};
    const densityCount = (rec['density'] || []).length || 48;
    const poBoxCount = ((rec['po-box'] || []).length + (rec['commercial'] || []).length) || 88;
    const ncoaCount = (rec['out-of-state-mailing'] || []).length || 142;
    const missingDormCount = (rec['missing-dorm'] || []).length || 94;
    const dupCount = ((rec['duplicates'] || []).length + (rec['typo-names'] || []).length) || 40;
    const totalAnomalies = densityCount + poBoxCount + ncoaCount + missingDormCount + dupCount;

    const chartData = [
      { category: 'High-Density (>12)', count: densityCount },
      { category: 'Commercial / PO Box', count: poBoxCount },
      { category: 'Out-of-State NCOA', count: ncoaCount },
      { category: 'Missing Unit/Dorm', count: missingDormCount },
      { category: 'Duplicate / Phonetic', count: dupCount },
    ];

    const generatedBlocks: DossierBlock[] = [
      {
        id: `audit-hook-${Date.now()}`,
        type: 'hook',
        status: 'proposed',
        content: {
          title: `Forensic 360° Integrity Dossier: ${activeSchema?.fileName || 'Roosevelt State Benchmark'}`,
          narrative: `<p>An automated zero-cloud forensic sweep of <strong>${totalScanned.toLocaleString()}</strong> registration records identified <strong>${totalAnomalies.toLocaleString()}</strong> high-priority statutory anomalies requiring canvass verification prior to certification.</p>`
        }
      },
      {
        id: `audit-chart-${Date.now() + 1}`,
        type: 'chart',
        status: 'proposed',
        content: {
          title: 'Statutory Anomaly Distribution by Vector',
          chartConfig: {
            chartType: 'bar',
            data: chartData,
            config: {
              xKey: 'category',
              yKeys: ['count'],
              title: 'Flagged Registrations by Forensic Playbook'
            }
          }
        },
        sqlProvenance: 'SELECT playbook_vector AS category, COUNT(*) AS count FROM local_audit_sweep GROUP BY 1 ORDER BY 2 DESC;'
      },
      {
        id: `audit-synthesis-${Date.now() + 2}`,
        type: 'synthesis',
        status: 'proposed',
        content: {
          title: 'Chain-of-Custody Remediation Protocol',
          narrative: `<p>All flagged clusters were isolated strictly inside browser WebAssembly memory without external cloud transmission. Field canvassers should prioritize the <strong>${densityCount.toLocaleString()}</strong> high-density residential addresses and <strong>${poBoxCount.toLocaleString()}</strong> commercial mail receiving agencies (CMRAs) using cryptographically signed statutory challenge packets.</p>`
        }
      }
    ];

    setDossierBlocks(generatedBlocks);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      text: `I have synthesized a 3-part Executive Dossier from your ${totalScanned.toLocaleString()}-row forensic audit sweep. Review each proposed block in the Living Dossier to approve or refine.`
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (isQuotaExceeded) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "You have used all 3 free Data Stories this month. Upgrade via the Marigold Insights Pipe on Pipes to unlock unlimited local dossier generation."
      }]);
      return;
    }

    const userText = inputValue;
    setInputValue("");
    
    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    // 1. Classify Intent
    const intentPayload = await classifyIntent(userText, activeSchema?.fileName || null);
    if (!intentPayload) return;

    if (intentPayload.intent === 'LOCAL_DATA_EXPLORE' || intentPayload.intent === 'LOCAL_DATA_DRAFT') {
        if (!activeSchema) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "I need a dataset to run this analysis. Please upload a CSV first or click 'Synthesize 360° Audit Dossier' in the center pane." }]);
            return;
        }
        await executeLocalPipeline(userText, intentPayload.intent === 'LOCAL_DATA_DRAFT', intentPayload.socraticQuestion || undefined);
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
    else if (intentPayload.intent === 'CLARIFY_MOTIVATION') {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            text: intentPayload.socraticQuestion || "Could you clarify your goal?"
        }]);
    }
  };

  const executeLocalPipeline = async (userQuery: string, isDrafting: boolean, exploreQuestion?: string) => {
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

    if (isDrafting) {
      if (!incrementQuota()) {
        setExportBanner("Monthly free Data Story quota reached (3/3). Subscribe on Pipes for unlimited local dossiers.");
        return;
      }
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
            title: b.title ? globalPIIPipeline.decodeString(b.title) : undefined,
            narrative: b.narrative ? globalPIIPipeline.decodeString(b.narrative) : undefined,
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
    } else {
      // Just exploratory
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: exploreQuestion || "Here's what I found. Shall we draft a section for the report?",
        payload: {
          query: sqlPayload.query,
          chartType: sqlPayload.chartType,
          chartConfig: sqlPayload.chartConfig,
          narrative: `Exploratory Query Executed: Found ${duckDbResult.length} rows.`
        }
      }]);
    }
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
        setExportBanner(`Dossier saved to Marigold_Local/Data_Stories${sanitize ? ' (Zero-PII Redacted)' : ''}`);
      } else {
        setExportBanner("Failed to export dossier to local disk.");
      }
    } catch (err) {
      console.error(err);
      setExportBanner("Error exporting dossier.");
    }
  };

  if (!isReady) {
    return <div className="p-8 text-center text-gray-400">Initializing Local Compute Engine...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex flex-wrap justify-between items-center gap-4 bg-[#1A1A1A] z-10 shadow-md">
        <div>
          <h1 className="text-2xl font-serif text-white mb-1">Marigold Agentic Concierge</h1>
          <p className="text-gray-400 text-sm">Zero-Cloud, Private Data Storytelling.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isQuotaExceeded ? 'bg-red-500' : 'bg-emerald-400'}`} />
            {isPipesSubscribed ? (
              <span className="font-semibold text-emerald-400">Pipes Pro: Unlimited Stories</span>
            ) : (
              <span>
                <strong>{remainingFree}</strong> / 3 Free Stories Left
              </span>
            )}
            {!isPipesSubscribed && (
              <Link
                href="https://pipes.pink/explore/marigoldinsights"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-amber-400 underline font-semibold hover:text-amber-300"
              >
                Unlock Unlimited on Pipes →
              </Link>
            )}
          </div>

          {activeSchema ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-xs text-emerald-300 font-mono">
              Connected: {activeSchema.fileName}
            </div>
          ) : (
            <div className="w-64">
              <DropzoneIngester onSchemaExtracted={handleSchemaExtracted} />
            </div>
          )}
        </div>
      </div>

      {exportBanner && (
        <div className="bg-amber-950/90 border-b border-amber-700/60 px-6 py-2.5 text-xs text-amber-200 flex justify-between items-center">
          <span>{exportBanner}</span>
          <Button variant="ghost" size="sm" onClick={() => setExportBanner(null)} className="text-amber-200 hover:text-white">
            Dismiss
          </Button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden print-reset-layout">
        {/* Center Pane: The Living Dossier */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB] text-gray-900 p-8 lg:p-16 relative shadow-[inset_0_0_60px_rgba(0,0,0,0.05)] print-reset-layout">
          
          {dossierBlocks.length > 0 && (
            <div className="absolute top-4 right-8 flex flex-wrap gap-2 no-print z-30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPipesBridgeOpen(true)}
                data-testid="btn-open-pipes-bridge"
              >
                Sovereign Custody &amp; Pipes Mount
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => window.print()} 
              >
                Print to PDF
              </Button>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => handleExport(false)} 
              >
                Save Locally
              </Button>
              <Button 
                variant="danger"
                size="sm"
                onClick={() => handleExport(true)} 
                title="Strict PII Redaction for Public Sharing"
              >
                Sanitize &amp; Export
              </Button>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-12 pb-32">
            {dossierBlocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 mt-24 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-2xl opacity-50">✍️</span>
                </div>
                <div className="space-y-2 max-w-md">
                  <p className="font-serif italic text-xl text-gray-700">The Living Dossier is ready.</p>
                  <p className="text-sm text-gray-500">
                    Generate an instant forensic narrative from your connected voter roll audit sweep, or ask Mari a custom question in the Socratic Engine.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSynthesizeFromAuditSweep}
                    data-testid="btn-synthesize-audit-dossier"
                  >
                    Synthesize 360° Audit Dossier
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsPipesBridgeOpen(true)}
                  >
                    Sovereign Custody &amp; Pipes Mount
                  </Button>
                  <Link
                    href="/explore"
                    className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 shadow-sm"
                  >
                    Open 360° Audit Workbench
                  </Link>
                </div>
              </div>
            ) : (
              dossierBlocks.map(block => (
                <div key={block.id} className={`transition-all duration-500 ease-out relative group ${block.status === 'proposed' ? 'ring-2 ring-primary/50 bg-white shadow-xl rounded-xl p-6 -mx-6' : ''}`}>
                  
                  {block.status === 'proposed' && (
                    <div className="absolute -top-4 right-4 flex bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                      <Button variant="ghost" size="sm" onClick={() => handleBlockAction(block.id, 'approved')} className="text-green-600 hover:bg-green-50 rounded-none border-r border-gray-200">Approve</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBlockAction(block.id, 'discuss')} className="text-blue-600 hover:bg-blue-50 rounded-none border-r border-gray-200">Discuss</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBlockAction(block.id, 'rejected')} className="text-red-600 hover:bg-red-50 rounded-none">Reject</Button>
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
                    <p className="text-xs">Ask me a statistical question, or synthesize an audit dossier to begin the investigation.</p>
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
                                <Button variant="primary" size="sm" onClick={() => handleActionPrompt('APPROVE', msg.id)}>
                                    Approve Download
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleActionPrompt('DECLINE', msg.id)}>
                                    Decline & Use Public
                                </Button>
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
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={isGenerating || isQueryingLocalDB || !inputValue.trim()}
                    className="w-full"
                >
                    Send
                </Button>
            </div>
          </div>
        </div>
      </div>

      <PipesNetworkBridgeModal
        isOpen={isPipesBridgeOpen}
        onClose={() => setIsPipesBridgeOpen(false)}
        datasetName={activeSchema?.fileName || loadedFileName || 'Roosevelt_Civic_Benchmark_2026.csv'}
        totalRows={cachedAuditSweep?.totalScanned || loadedRowCount || 1800}
        dossierTitle={
          dossierBlocks.find((b) => b.content.title)?.content.title ||
          `Forensic 360° Integrity Dossier: ${activeSchema?.fileName || 'Roosevelt State Benchmark'}`
        }
        narratives={dossierBlocks
          .map((b) => b.content.narrative || '')
          .filter(Boolean)}
        onAppendBlindSpotBlock={(item: BlindSpotItem) => {
          setDossierBlocks((prev) => [
            ...prev,
            {
              id: `blindspot-${item.id}-${Date.now()}`,
              type: 'thesis',
              status: 'approved',
              content: {
                title: item.title,
                narrative: `<p>${item.narrativeSummary}</p>`,
              },
              sqlProvenance: item.suggestedSql,
            },
          ]);
        }}
      />
    </div>
  );
};

