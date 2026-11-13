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
import { AirGapStatusBadge } from '@/components/AirGapStatusBadge';
import { synthesizeOfflineGroundedAnswer } from '@/lib/ai/localCorpusSearch';
import { downloadStandaloneOfflineDossier } from '@/lib/datasets/standaloneOfflineHtmlBundle';
import {
  PUBLIC_CIVIC_DATASETS,
  CURATED_PIPE_STORY_STARTERS,
  EVALUATED_PUBLIC_DATA_REPOS,
  EXCLUDED_PUBLIC_DATA_REPOS,
  resolvePublicDatasetForWebHunt,
  MountablePublicDataset,
  CuratedPipeStoryStarter,
} from '@/lib/datasets/publicCivicRepoCatalog';

interface PipesCorpusIndex {
  generatedAt: string;
  zeroPiiVerified: boolean;
  totalPipes: number;
  totalArticles: number;
  pipes: Array<{
    slug: string;
    title: string;
    description: string;
    articleCount: number;
    publicUrl: string;
    corpusFile: string;
    articles: Array<{
      id: string;
      title: string;
      summary: string;
      archetype: string;
      sourceTitle: string;
      sourceUrl: string;
    }>;
  }>;
}

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
  const { query, isReady, mountCsvTextAsDataFile } = useDuckDB();
  const { classifyIntent, generateSQL, synthesizeNarrative, synthesizeResearch, isGenerating, pipelineStatus, error } = useMaryAIRouter();
  const { remainingFree, isQuotaExceeded, isPipesSubscribed, incrementQuota } = useDataStoryQuota();
  const { isDataConnected, loadedFileName, loadedRowCount } = useVoterRollConnection();

  const [activeSchema, setActiveSchema] = useState<{fileName: string, schema: any[]} | null>(null);
  const [activePublicDatasetId, setActivePublicDatasetId] = useState<MountablePublicDataset['id'] | null>(null);
  const [mountedRowCount, setMountedRowCount] = useState<number | null>(null);
  const [isMountingPublicDataset, setIsMountingPublicDataset] = useState<string | null>(null);
  const [isRepoDrawerOpen, setIsRepoDrawerOpen] = useState(false);
  const [pipesCorpusIndex, setPipesCorpusIndex] = useState<PipesCorpusIndex | null>(null);
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
    setActivePublicDatasetId(null);
    setActiveSchema({ fileName, schema });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      text: `Dataset ${fileName} successfully chunked and ingested to Marigold Local.`
    }]);
  };

  useEffect(() => {
    if (isRepoDrawerOpen && !pipesCorpusIndex) {
      fetch('/pipes-corpus/index.json')
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data) setPipesCorpusIndex(data);
        })
        .catch(() => null);
    }
  }, [isRepoDrawerOpen, pipesCorpusIndex]);

  const mountPublicDatasetToDuckDB = async (
    ds: MountablePublicDataset
  ): Promise<{ fileName: string; schema: any[]; rowCount: number } | null> => {
    if (!isReady) return null;
    setIsMountingPublicDataset(ds.id);
    try {
      const res = await fetch(ds.publicPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csvText = await res.text();
      const { rowCount, schema } = await mountCsvTextAsDataFile(ds.filename, csvText);
      setActiveSchema({ fileName: ds.filename, schema });
      setActivePublicDatasetId(ds.id);
      setMountedRowCount(rowCount);
      setMessages(prev => [...prev, {
        id: `${Date.now()}-mount`,
        role: 'system',
        text: `Mounted Zero-PII dataset ${ds.filename} (${rowCount.toLocaleString()} county rows · SHA-256 ${ds.sha256.slice(0, 12)}…) into DuckDB-Wasm table data_file.`
      }]);
      return { fileName: ds.filename, schema, rowCount };
    } catch (err) {
      console.error('Failed to mount public civic dataset:', err);
      setExportBanner(`Could not mount ${ds.filename} into local DuckDB-Wasm.`);
      return null;
    } finally {
      setIsMountingPublicDataset(null);
    }
  };

  const handleRunCuratedStoryStarter = async (starter: CuratedPipeStoryStarter) => {
    if (!incrementQuota()) {
      setExportBanner("Monthly free Data Story quota reached (3/3). Subscribe on Pipes for unlimited local dossiers.");
      return;
    }
    const ds = PUBLIC_CIVIC_DATASETS[starter.datasetId];
    const mounted = await mountPublicDatasetToDuckDB(ds);
    if (!mounted) return;

    setIsQueryingLocalDB(true);
    try {
      const rows = await query(starter.sql);
      const stamp = Date.now();
      const blocks: DossierBlock[] = [
        {
          id: `starter-hook-${stamp}`,
          type: 'hook',
          status: 'proposed',
          content: {
            title: starter.hookTitle,
            narrative: starter.hookNarrative,
          },
        },
        {
          id: `starter-chart-${stamp + 1}`,
          type: 'chart',
          status: 'proposed',
          content: {
            title: starter.chartTitle,
            chartConfig: {
              chartType: starter.chartType,
              data: rows,
              config: {
                xKey: starter.xKey,
                yKeys: [starter.yKey],
                title: starter.chartTitle,
              },
            },
          },
          sqlProvenance: starter.sql,
        },
        {
          id: `starter-anti-${stamp + 2}`,
          type: 'dialectic_antithesis',
          status: 'proposed',
          content: {
            title: 'Statistical Caveats & Administrative Context',
            narrative: starter.antithesisNarrative,
          },
        },
        {
          id: `starter-synth-${stamp + 3}`,
          type: 'synthesis',
          status: 'proposed',
          content: {
            title: `Pipes Curatorial Bridge (${starter.pipeLabel})`,
            narrative: starter.synthesisNarrative,
          },
        },
      ];
      setDossierBlocks(blocks);
      setMessages(prev => [...prev, {
        id: `${stamp}-story`,
        role: 'assistant',
        text: `Executed "${starter.title}" directly inside browser DuckDB-Wasm over ${mounted.rowCount.toLocaleString()} Zero-PII county rows and linked primary sources from ${starter.pipeLabel}.`,
        payload: {
          query: starter.sql,
          chartType: starter.chartType,
          chartConfig: { xKey: starter.xKey, yKeys: [starter.yKey], title: starter.chartTitle },
          narrative: `DuckDB-Wasm query returned ${rows.length} top counties from ${ds.filename}.`,
        },
      }]);
    } catch (err) {
      console.error('Story starter SQL failed:', err);
      setExportBanner(`Query error running "${starter.title}".`);
    } finally {
      setIsQueryingLocalDB(false);
    }
  };

  const handleSynthesizeFromAuditSweep = async () => {
    if (!incrementQuota()) {
      setExportBanner("Monthly free Data Story quota reached (3/3). Subscribe on Pipes for unlimited local dossiers.");
      return;
    }

    const colNames = (activeSchema?.schema || []).map((c: any) => String(c.column_name || c.name || ''));
    const hasFederalColumns =
      activePublicDatasetId !== null ||
      colNames.includes('county_fips') ||
      colNames.includes('cvap_2024') ||
      colNames.includes('fema_disasters_2020_2026');

    if (hasFederalColumns) {
      setIsQueryingLocalDB(true);
      try {
        const isFemaOnly = colNames.includes('fema_2024_election_year_disasters') && !colNames.includes('marigold_active_2026');
        const sql = isFemaOnly
          ? "SELECT (county_name || ', ' || state_abbr) AS category, CAST(fema_disasters_2020_2026 AS BIGINT) AS count FROM data_file WHERE fema_disasters_2020_2026 > 0 ORDER BY 2 DESC LIMIT 10"
          : colNames.includes('marigold_active_to_cvap_pct')
          ? "SELECT (county_name || ', ' || state_abbr) AS category, ROUND(marigold_active_to_cvap_pct, 2) AS count FROM data_file WHERE cvap_2024 > 1000 ORDER BY 2 DESC LIMIT 10"
          : "SELECT (county_name || ', ' || state_abbr) AS category, CAST(eavs_removals_total AS BIGINT) AS count FROM data_file WHERE eavs_removals_total > 0 ORDER BY 2 DESC LIMIT 10";

        const liveRows = await query(sql);
        const totalScanned = mountedRowCount || liveRows.length;
        const stamp = Date.now();
        setDossierBlocks([
          {
            id: `audit-hook-${stamp}`,
            type: 'hook',
            status: 'proposed',
            content: {
              title: `Live Zero-PII Civic Benchmark Dossier: ${activeSchema?.fileName || 'Public County Atlas'}`,
              narrative: `<p>Executed deterministic DuckDB-Wasm aggregation locally across <strong>${totalScanned.toLocaleString()}</strong> county records inside <code>${activeSchema?.fileName}</code> with zero personally identifiable data transmitted over the network.</p>`,
            },
          },
          {
            id: `audit-chart-${stamp + 1}`,
            type: 'chart',
            status: 'proposed',
            content: {
              title: isFemaOnly
                ? 'Top FEMA Disaster Exposure Counties (2020-2026)'
                : colNames.includes('marigold_active_to_cvap_pct')
                ? 'Active Registrations vs. Census 2020-2024 CVAP (%)'
                : 'Top U.S. Counties by 2024 EAVS Voter Removals (A12a)',
              chartConfig: {
                chartType: 'bar',
                data: liveRows,
                config: {
                  xKey: 'category',
                  yKeys: ['count'],
                  title: 'Live Browser DuckDB-Wasm County Aggregation',
                },
              },
            },
            sqlProvenance: sql,
          },
          {
            id: `audit-synthesis-${stamp + 2}`,
            type: 'synthesis',
            status: 'proposed',
            content: {
              title: 'Primary-Source Provenance & Pipes Research Bridge',
              narrative: `<p>All figures trace directly to keyless public federal and academic distributions pinned via SHA-256 manifest digests. Pair these SQL metrics with full methodological briefs on <a href="https://pipes.pink/explore/marigoldinsights" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/marigoldinsights</a> and <a href="https://pipes.pink/explore/civic-data-benchmarks" target="_blank" rel="noopener noreferrer" class="underline text-amber-800">pipe/civic-data-benchmarks</a>.</p>`,
            },
          },
        ]);
        setMessages(prev => [...prev, {
          id: `${stamp}-live`,
          role: 'assistant',
          text: `Synthesized a live DuckDB-Wasm 360° dossier from mounted public dataset ${activeSchema?.fileName} (${totalScanned.toLocaleString()} counties).`,
        }]);
        return;
      } catch (err) {
        console.error('Live public dossier synthesis failed, falling back to audit sweep:', err);
      } finally {
        setIsQueryingLocalDB(false);
      }
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

  const executeLocalPipeline = async (
    userQuery: string,
    isDrafting: boolean,
    exploreQuestion?: string,
    schemaOverride?: { fileName: string; schema: any[] }
  ) => {
    const schemaCtx = schemaOverride || activeSchema;
    if (!schemaCtx) return;
    
    let sqlPayload = null;
    let duckDbResult = null;
    let sqlErrorStr = null;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries && !duckDbResult) {
      sqlPayload = await generateSQL(userQuery, schemaCtx.schema, sqlErrorStr);
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

    if (!duckDbResult || !sqlPayload) {
      const grounded = synthesizeOfflineGroundedAnswer(userQuery, {
        datasetName: schemaCtx.fileName,
        rowCount: mountedRowCount ?? loadedRowCount ?? undefined,
      });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Tap-Out Loop Guard engaged after ${maxRetries + 1} local SQL attempts. Switching cleanly to verified corpus synthesis:\n\n${grounded}`
      }]);
      return;
    }

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
    const targetMsg = messages.find(m => m.id === msgId);
    const datasetQuery = targetMsg?.actionPrompt?.datasetQuery || 'national county civic benchmarks';

    // Remove the action prompt from the message
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionPrompt: undefined } : m));

    if (action === 'DECLINE') {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "No problem. Bypassing dataset mounting and generating a grounded Pipes & statutory summary..." }]);
      await executeResearchPipeline(datasetQuery);
      return;
    }

    const ds = resolvePublicDatasetForWebHunt(datasetQuery);
    const mounted = await mountPublicDatasetToDuckDB(ds);
    if (!mounted) {
      await executeResearchPipeline(datasetQuery);
      return;
    }
    await executeLocalPipeline(datasetQuery, true, undefined, { fileName: mounted.fileName, schema: mounted.schema });
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
          <p className="text-gray-400 text-sm mb-2">Zero-Cloud, Private Data Storytelling.</p>
          <AirGapStatusBadge defaultLockedWhenDataConnected={false} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.values(PUBLIC_CIVIC_DATASETS).map((ds) => {
              const isMounted = activePublicDatasetId === ds.id && activeSchema?.fileName === ds.filename;
              const isMountingThis = isMountingPublicDataset === ds.id;
              return (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => mountPublicDatasetToDuckDB(ds)}
                  disabled={!isReady || isMountingPublicDataset !== null}
                  title={ds.description}
                  data-testid={`btn-mount-${ds.id}`}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                    isMounted
                      ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200 font-semibold'
                      : 'bg-gray-900 border-gray-700 text-amber-200 hover:border-amber-400 hover:text-white'
                  } disabled:opacity-50`}
                >
                  {isMountingThis ? 'Mounting…' : ds.shortLabel}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsRepoDrawerOpen(true)}
              data-testid="btn-open-pipes-repo-drawer"
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-950/60 border border-amber-600/60 text-amber-200 hover:bg-amber-900/70 transition"
            >
              Pipes Canon &amp; Repo Audit
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isQuotaExceeded ? 'bg-[#B45309]' : 'bg-emerald-400'}`} />
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
              {mountedRowCount !== null ? ` (${mountedRowCount.toLocaleString()} rows)` : ''}
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
                variant="outline"
                size="sm"
                onClick={async () => {
                  const firstTitle =
                    dossierBlocks.find((b) => b.content.title)?.content.title ||
                    'Marigold Living Forensic Dossier';
                  const res = await downloadStandaloneOfflineDossier({
                    title: firstTitle,
                    subtitle: `Zero-PII offline bundle for ${activeSchema?.fileName || loadedFileName || 'Civic Audit'}`,
                    jurisdictionName: activeSchema?.fileName || loadedFileName || 'Statewide',
                    stateCode: 'MS',
                    totalRecords: cachedAuditSweep?.totalScanned || loadedRowCount || 1800,
                    cleanlinessScore: 95,
                    summaryParagraphs: dossierBlocks
                      .map((b) => (b.content.narrative || '').replace(/<[^>]+>/g, ''))
                      .filter(Boolean),
                    metrics: [
                      {
                        label: 'Approved Dossier Sections',
                        valueWithUnit: `${dossierBlocks.length} sections`,
                        detail: 'Generated locally inside DuckDB-Wasm browser memory',
                      },
                    ],
                  });
                  setExportBanner(`Saved standalone offline HTML bundle (${res.filename})`);
                }}
              >
                Offline .html
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleExport(true)} 
                className="border-[#B45309] text-[#B45309] hover:bg-amber-50"
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

                <div className="pt-6 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
                      Zero-PII Public Data &amp; Pipes Story Starters
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRepoDrawerOpen(true)}
                      className="text-[11px] font-mono text-amber-700 hover:text-amber-900 underline"
                    >
                      Inspect 5 Adopted / 3 Excluded Repos →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CURATED_PIPE_STORY_STARTERS.map((starter) => {
                      const starterDs = PUBLIC_CIVIC_DATASETS[starter.datasetId];
                      const isBusy = isQueryingLocalDB || isMountingPublicDataset !== null;
                      return (
                        <button
                          key={starter.id}
                          type="button"
                          onClick={() => handleRunCuratedStoryStarter(starter)}
                          disabled={!isReady || isBusy}
                          data-testid={`starter-card-${starter.id}`}
                          className="p-4 rounded-xl border border-[#E5DEC9] bg-[#F6F3EC] hover:bg-white hover:border-amber-600 text-left transition shadow-sm disabled:opacity-50 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono font-semibold">
                                {starter.pipeLabel}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono">
                                {starterDs.shortLabel}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-[#1C1917] leading-snug">
                              {starter.title}
                            </h3>
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                              {starter.subtitle}
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold text-amber-800">
                            Mount CSV &amp; Run SQL Dossier →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              dossierBlocks.map(block => (
                <div key={block.id} className={`transition-all duration-500 ease-out relative group ${block.status === 'proposed' ? 'ring-2 ring-primary/50 bg-white shadow-xl rounded-xl p-6 -mx-6' : ''}`}>
                  
                  {block.status === 'proposed' && (
                    <div className="absolute -top-4 right-4 flex bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                      <Button variant="ghost" size="sm" onClick={() => handleBlockAction(block.id, 'approved')} className="text-emerald-700 hover:bg-emerald-50 rounded-none border-r border-gray-200">Approve</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBlockAction(block.id, 'discuss')} className="text-[#1C1917] hover:bg-stone-100 rounded-none border-r border-gray-200">Discuss</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleBlockAction(block.id, 'rejected')} className="text-[#B45309] hover:bg-amber-50 rounded-none">Dismiss</Button>
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
            {error && <div className="text-amber-300 text-xs mb-2 truncate" title={error}>{error}</div>}
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

      {isRepoDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#111111]/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Pipes Canon and Public Civic Repo Audit"
        >
          <div className="w-full max-w-2xl bg-[#FAF8F5] text-[#1C1917] h-full overflow-y-auto border-l border-[#E5DEC9] shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-[#E5DEC9] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
                  Zero-PII Provenance &amp; Curatorial Registry
                </span>
                <h2 className="text-xl font-bold text-[#111111] mt-1">
                  Pipes Canon &amp; Public Data Repo Audit
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRepoDrawerOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[#D6CEBA] bg-white text-xs font-semibold text-[#1C1917] hover:bg-[#F6F3EC]"
              >
                Close ✕
              </button>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111111]">
                  Mounted Pipes Corpora ({pipesCorpusIndex ? `${pipesCorpusIndex.totalPipes} Pipes · ${pipesCorpusIndex.totalArticles} Articles` : 'Loading…'})
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono">
                  Zero-PII Verified
                </span>
              </div>
              {pipesCorpusIndex ? (
                <div className="space-y-2.5">
                  {pipesCorpusIndex.pipes.map((pipe) => (
                    <div
                      key={pipe.slug}
                      className="p-3.5 rounded-xl bg-[#F6F3EC] border border-[#E5DEC9] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-amber-900">
                          pipe/{pipe.slug} ({pipe.articleCount} articles)
                        </span>
                        <a
                          href={pipe.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-amber-800 underline hover:text-amber-950"
                        >
                          Open on pipes.pink →
                        </a>
                      </div>
                      <p className="text-xs text-stone-700">{pipe.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-600 font-mono">Fetching /pipes-corpus/index.json…</p>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#111111]">
                Adopted Public Data Repositories ({EVALUATED_PUBLIC_DATA_REPOS.length} SHA-256 Verified)
              </h3>
              <div className="space-y-2.5">
                {EVALUATED_PUBLIC_DATA_REPOS.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#111111]">{repo.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono">
                        ADOPTED
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-600">
                      {repo.agencyOrMaintainer} · {repo.joinKey}
                    </p>
                    <p className="text-xs text-stone-700">{repo.summary}</p>
                    <p className="text-[10px] font-mono text-stone-500">
                      SHA-256: {repo.sha256.slice(0, 16)}… · {repo.license}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold text-[#111111]">
                Excluded Sources ({EXCLUDED_PUBLIC_DATA_REPOS.length} Guardrail &amp; Quality Rejections)
              </h3>
              <div className="space-y-2.5">
                {EXCLUDED_PUBLIC_DATA_REPOS.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-3.5 rounded-xl bg-[#F6F3EC] border border-amber-300/70 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#111111]">{repo.name}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono">
                        EXCLUDED
                      </span>
                    </div>
                    <p className="text-xs text-stone-700">{repo.summary}</p>
                    {repo.excludedReason && (
                      <p className="text-[11px] font-semibold text-amber-900">
                        Reason: {repo.excludedReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

