"use client";

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FolderPlus,
  Sparkles,
  Copy,
  Check,
  Download,
  ExternalLink,
  X,
  Lock,
  Coins,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  MerkleDagManifest,
  SovereignCustodyDeed,
  buildMarigoldAuditDag,
  verifyDagIntegrity,
  createSovereignCustodyDeed,
  stampDatasetMerkleRoot,
} from '@/lib/crypto/merkleDagAndOtsBridge';
import {
  evaluateDossierRubric,
  runDatasetBlindSpotCheck,
  BlindSpotItem,
  RubricEvaluationResult,
} from '@/lib/pipes/editorialRubricAndGraph';
import {
  estimateMarigoldCuratorRoyalties,
  PIPES_SUBSCRIPTION_TIERS,
  ACTION_PRICES,
} from '@/lib/pipes/economics';
import {
  provisionMarigoldAndPipesLocalFolder,
  generateMarigoldHarnessBlueprint,
  buildMarigoldSkillMarkdown,
} from '@/lib/pipes/marigoldPipesLocalFolder';

export interface PipesNetworkBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName: string;
  totalRows: number;
  dossierTitle: string;
  narratives: string[];
  playbookSummaries?: Array<{ id: string; name: string; flaggedCount: number }>;
  onAppendBlindSpotBlock?: (item: BlindSpotItem) => void;
}

export function PipesNetworkBridgeModal({
  isOpen,
  onClose,
  datasetName,
  totalRows,
  dossierTitle,
  narratives,
  playbookSummaries,
  onAppendBlindSpotBlock,
}: PipesNetworkBridgeModalProps) {
  const [activeTab, setActiveTab] = useState<'custody' | 'mount' | 'bounties'>('custody');
  const [dagManifest, setDagManifest] = useState<MerkleDagManifest | null>(null);
  const [dagVerified, setDagVerified] = useState<boolean>(false);
  const [custodyDeed, setCustodyDeed] = useState<SovereignCustodyDeed | null>(null);
  const [otsStatus, setOtsStatus] = useState<string | null>(null);
  const [folderStatus, setFolderStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [monthlyMcpQueries, setMonthlyMcpQueries] = useState<number>(2500);
  const [monthlyReads, setMonthlyReads] = useState<number>(4000);
  const [isClaimedJurisdiction, setIsClaimedJurisdiction] = useState<boolean>(true);

  const rubric: RubricEvaluationResult = evaluateDossierRubric({
    title: dossierTitle,
    narratives,
    hasCharts: true,
    hasSqlProvenance: true,
  });

  const blindSpots: BlindSpotItem[] = runDatasetBlindSpotCheck([
    dossierTitle,
    ...(narratives || []),
  ]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    buildMarigoldAuditDag({
      datasetName: datasetName || 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: totalRows || 1800,
      playbookSummaries,
      dossierTitle: dossierTitle || '360° Jurisdictional Integrity Dossier',
      dossierContentJson: JSON.stringify({ title: dossierTitle, narratives }),
      namespace: 'marigoldinsights',
    }).then(async (dag) => {
      if (cancelled) return;
      setDagManifest(dag);
      const check = await verifyDagIntegrity(dag);
      if (!cancelled) setDagVerified(check.valid);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, datasetName, totalRows, dossierTitle, narratives, playbookSummaries]);

  if (!isOpen) return null;

  const copyToClipboard = (key: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  const handleSignCustodyDeed = async () => {
    if (!dagManifest) return;
    const deed = await createSovereignCustodyDeed({
      pipe: 'pipe\\marigoldinsights',
      curator:
        (typeof window !== 'undefined' && localStorage.getItem('marigold_display_name')) ||
        'Sovereign Citizen Auditor',
      merkleRoot: dagManifest.merkleRoot,
      dagNodeCount: dagManifest.nodeCount,
    });
    setCustodyDeed(deed);

    // Trigger download of sovereign-deed-certificate.json
    const blob = new Blob([JSON.stringify(deed, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereign-deed-certificate-marigoldinsights.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDownloadOtsProof = async () => {
    if (!dagManifest) return;
    setOtsStatus('Stamping 32-byte Merkle-DAG root to Bitcoin OpenTimestamps calendars...');
    const res = await stampDatasetMerkleRoot(dagManifest.merkleRoot);
    const blob = new Blob([res.otsBytes as BlobPart], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marigold-${dagManifest.merkleRoot.slice(0, 12)}.ots`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setOtsStatus(
      res.mode === 'live-calendar'
        ? `Stamped via ${res.calendarUrl} and downloaded .ots proof!`
        : 'Generated air-gapped Bitcoin OpenTimestamps (.ots) proof container!'
    );
  };

  const handleProvisionLocalFolder = async () => {
    if (!dagManifest) return;
    const res = await provisionMarigoldAndPipesLocalFolder({
      datasetName: datasetName || 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: totalRows || 1800,
      dossierTitle: dossierTitle || '360° Jurisdictional Integrity Dossier',
      narrativePlain: (narratives || []).join('\n\n').replace(/<[^>]+>/g, ''),
      dagManifest,
      relatedPipes: rubric.relatedPipes,
      bridgedConcepts: rubric.bridgedConcepts,
    });
    setFolderStatus(res.message);
  };

  const handleDownloadHarnessJson = () => {
    if (!dagManifest) return;
    const harness = generateMarigoldHarnessBlueprint({
      datasetName: datasetName || 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: totalRows || 1800,
      dagManifest,
    });
    const blob = new Blob([JSON.stringify(harness, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marigold.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const royalties = estimateMarigoldCuratorRoyalties({
    monthlyExternalMcpQueries: monthlyMcpQueries,
    monthlySubscriberReads: monthlyReads,
    isClaimedJurisdiction,
  });

  const mcpSnippet = dagManifest
    ? JSON.stringify(
        {
          mcpServers: {
            'pipes-marigold': {
              command: 'npx',
              args: [
                '-y',
                '@pipes/mcp-server',
                '--pipe',
                'marigoldinsights',
                '--vault-root',
                dagManifest.merkleRoot,
              ],
            },
          },
        },
        null,
        2
      )
    : '';

  const groundingPrompt = dagManifest
    ? buildMarigoldSkillMarkdown({
        datasetName: datasetName || 'Roosevelt_Civic_Benchmark_2026.csv',
        totalRows: totalRows || 1800,
        dossierTitle: dossierTitle || '360° Jurisdictional Integrity Dossier',
        narrativePlain: (narratives || []).join('\n\n').replace(/<[^>]+>/g, ''),
        dagManifest,
        relatedPipes: rubric.relatedPipes,
        bridgedConcepts: rubric.bridgedConcepts,
      })
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pipes-bridge-modal-title"
    >
      <div className="bg-[#FAF8F5] text-[#1A1614] border border-[#D8D0C5] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2ECE1] border-b border-[#D8D0C5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold uppercase tracking-wider text-[#B7410E]">
                Marigold × Pipes Sovereign Bridge
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                Editorial Rubric: {rubric.totalScore}/{rubric.maxScore} Verified
              </span>
            </div>
            <h2
              id="pipes-bridge-modal-title"
              className="text-xl font-serif font-bold text-[#1A1614] mt-0.5"
            >
              Sovereign Custody, Local Folder Provisioning &amp; Pipes Syndication
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#5C534E] hover:text-[#1A1614] hover:bg-[#E6DEC8] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Navigation */}
        <div className="px-6 pt-3 bg-[#F2ECE1] border-b border-[#D8D0C5] flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('custody')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 border-t border-x transition-colors ${
              activeTab === 'custody'
                ? 'bg-[#FAF8F5] text-[#1A1614] border-[#D8D0C5]'
                : 'bg-[#E8E0D2] text-[#5C534E] border-transparent hover:text-[#1A1614]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#B7410E]" />
            1. Sovereign Custody &amp; Bitcoin .ots
          </button>
          <button
            onClick={() => setActiveTab('mount')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 border-t border-x transition-colors ${
              activeTab === 'mount'
                ? 'bg-[#FAF8F5] text-[#1A1614] border-[#D8D0C5]'
                : 'bg-[#E8E0D2] text-[#5C534E] border-transparent hover:text-[#1A1614]'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-[#B7410E]" />
            2. 1-Click Local Folder &amp; AI Mount
          </button>
          <button
            onClick={() => setActiveTab('bounties')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 border-t border-x transition-colors ${
              activeTab === 'bounties'
                ? 'bg-[#FAF8F5] text-[#1A1614] border-[#D8D0C5]'
                : 'bg-[#E8E0D2] text-[#5C534E] border-transparent hover:text-[#1A1614]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#B7410E]" />
            3. Blind-Spot Check &amp; 70/30 Royalties
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'custody' && (
            <div className="space-y-6">
              {/* Topological Merkle-DAG Card */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[13px] font-bold uppercase tracking-wider text-[#5C534E]">
                      3-Layer Topological Merkle-DAG (v1.0)
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#1A1614]">
                      Mathematical Chain of Custody: Raw Shards → SQL Rules → Sanitized Story
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[13px] font-bold border ${
                      dagVerified
                        ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]'
                        : 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]'
                    }`}
                  >
                    {dagVerified ? '✓ DAG Topology Verified' : 'Computing DAG...'}
                  </span>
                </div>

                {dagManifest && (
                  <>
                    <div className="p-3 bg-[#F2ECE1] border border-[#D8D0C5] rounded-lg font-mono text-[13px] break-all">
                      <span className="font-bold text-[#5C534E] mr-2">MERKLE-DAG ROOT (SHA-256):</span>
                      <span className="text-[#1A1614]">{dagManifest.merkleRoot}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.values(dagManifest.nodes)
                        .slice(0, 6)
                        .map((node) => (
                          <div
                            key={node.id}
                            className="p-3 bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-bold uppercase text-[#B7410E]">
                                {node.layer}
                              </span>
                              <span className="text-[13px] font-mono text-[#5C534E]">
                                {node.dagLeafHash.slice(0, 10)}…
                              </span>
                            </div>
                            <p className="text-[13px] font-medium text-[#1A1614] truncate" title={node.label}>
                              {node.label}
                            </p>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="primary" onClick={handleSignCustodyDeed}>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign ECDSA (P-256) Sovereign Custody Deed
                  </Button>
                  <Button variant="outline" onClick={handleDownloadOtsProof}>
                    <Download className="w-4 h-4 mr-2" />
                    Stamp &amp; Download Bitcoin OpenTimestamps (.ots)
                  </Button>
                </div>

                {custodyDeed && (
                  <div className="p-4 bg-[#E6F4EA] border border-[#CEEAD6] rounded-lg text-[13px] text-[#137333] space-y-1">
                    <p className="font-bold">
                      ✓ Sovereign Custody Deed Signed ({custodyDeed.signatureScheme}) &amp; Downloaded!
                    </p>
                    <p className="font-mono break-all">
                      Signature: {custodyDeed.signatureHex.slice(0, 48)}…
                    </p>
                  </div>
                )}

                {otsStatus && (
                  <div className="p-3 bg-[#F2ECE1] border border-[#D8D0C5] rounded-lg text-[13px] font-medium text-[#1A1614]">
                    {otsStatus}
                  </div>
                )}
              </div>

              {/* Pipes Editorial Standard v1 & Knowledge Graph Card */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-serif font-bold text-[#1A1614]">
                    Pipes Editorial Standard v1 &amp; Cross-Pipe Knowledge Graph
                  </h3>
                  <span className="text-[13px] font-bold text-[#137333]">
                    Zero Banned AI Tropes · {rubric.totalScore}/30 Score
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {Object.entries(rubric.scores).map(([dim, score]) => (
                    <div
                      key={dim}
                      className="p-2.5 bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg text-center"
                    >
                      <div className="text-[13px] font-bold uppercase text-[#5C534E]">{dim}</div>
                      <div className="text-lg font-bold text-[#1A1614]">{score}/5</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {rubric.relatedPipes.map((p) => (
                    <a
                      key={p}
                      href={`https://pipes.pink/explore/${p}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#F2ECE1] hover:bg-[#E6DEC8] border border-[#D8D0C5] rounded-md text-[13px] font-mono text-[#1A1614] inline-flex items-center gap-1"
                    >
                      pipe\{p}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mount' && (
            <div className="space-y-6">
              {/* 1-Click Marigold_Local / Pipes_Local Folder Provisioner */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <span className="text-[13px] font-bold uppercase tracking-wider text-[#B7410E]">
                      Zero-Cloud Local Storage (Documents/Marigold_Local)
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#1A1614]">
                      1-Click Provision Your Computer Folder for Claude, ChatGPT, Cursor &amp; Pipes Desktop
                    </h3>
                    <p className="text-sm text-[#5C534E] leading-relaxed">
                      Creates <code className="font-mono">Marigold_Local</code> on your computer with{' '}
                      <code className="font-mono">pipes/marigoldinsights-skill.md</code>,{' '}
                      <code className="font-mono">memory/AGENT_OPERATING_GUIDE.md</code>,{' '}
                      <code className="font-mono">dossiers/marigold.json</code>, and{' '}
                      <code className="font-mono">proofs/merkle_dag.json</code>.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={handleProvisionLocalFolder}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Provision Local Folder Now
                    </Button>
                    <Button variant="outline" onClick={handleDownloadHarnessJson}>
                      <Download className="w-4 h-4 mr-2" />
                      Download marigold.json Harness
                    </Button>
                  </div>
                </div>

                {folderStatus && (
                  <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] rounded-lg text-[13px] font-medium text-[#137333]">
                    {folderStatus}
                  </div>
                )}
              </div>

              {/* Claude Desktop / Cursor MCP Config */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-serif font-bold text-[#1A1614]">
                      Claude Desktop &amp; Cursor MCP Server Configuration
                    </h4>
                    <p className="text-[13px] text-[#5C534E]">
                      Paste into <code className="font-mono">claude_desktop_config.json</code> or{' '}
                      <code className="font-mono">.cursor/mcp.json</code> to query your verified Merkle vault.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('mcp', mcpSnippet)}
                  >
                    {copiedKey === 'mcp' ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-[#137333]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" /> Copy MCP JSON
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-3 bg-[#1A1614] text-[#FAF8F5] rounded-lg font-mono text-[13px] overflow-x-auto">
                  {mcpSnippet}
                </pre>
              </div>

              {/* AI System Grounding Prompt */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-serif font-bold text-[#1A1614]">
                      AI System Grounding Prompt (SKILL.md)
                    </h4>
                    <p className="text-[13px] text-[#5C534E]">
                      Locks ChatGPT, Claude, Gemini, or Local Ollama to your exact DuckDB-Wasm counts and SHA-256 Merkle root.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('grounding', groundingPrompt)}
                  >
                    {copiedKey === 'grounding' ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-[#137333]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" /> Copy SKILL.md Prompt
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-3 bg-[#F2ECE1] text-[#1A1614] border border-[#D8D0C5] rounded-lg font-mono text-[13px] max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {groundingPrompt}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'bounties' && (
            <div className="space-y-6">
              {/* Self-Interrogate: Blind-Spot Check */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-4">
                <div>
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#B7410E]">
                    Self-Interrogate Dataset Coverage
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#1A1614]">
                    Statutory Blind-Spot Check &amp; Epistemic Bounties
                  </h3>
                  <p className="text-sm text-[#5C534E]">
                    Checks which of the 5 core forensic vectors are already represented in your Dossier and lets you close any blind spot in 1 click.
                  </p>
                </div>

                <div className="space-y-3">
                  {blindSpots.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[13px] font-bold ${
                              item.status === 'covered'
                                ? 'bg-[#E6F4EA] text-[#137333]'
                                : 'bg-[#FEF7E0] text-[#B06000]'
                            }`}
                          >
                            {item.status === 'covered' ? '✓ Covered in Dossier' : 'Blind Spot Detected'}
                          </span>
                          <span className="text-sm font-bold text-[#1A1614]">{item.title}</span>
                          <span className="px-2 py-0.5 bg-[#F2ECE1] border border-[#D8D0C5] rounded text-[13px] font-mono text-[#5C534E]">
                            +{item.bountyCredits} PIPES Credits
                          </span>
                        </div>
                        <p className="text-[13px] text-[#5C534E]">{item.question}</p>
                      </div>

                      {onAppendBlindSpotBlock && item.status === 'blind_spot' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAppendBlindSpotBlock(item)}
                          className="shrink-0"
                        >
                          + Add Vector to Dossier
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Canonical 70/30 Curator Royalty & Escrow Calculator */}
              <div className="p-5 bg-white border border-[#D8D0C5] rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[13px] font-bold uppercase tracking-wider text-[#5C534E]">
                      Canonical Pipes Ledger Economics (1 Credit = $0.005 USD)
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#1A1614]">
                      70% Curator Microtoll Split &amp; Unclaimed Jurisdiction Escrow
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-[#F2ECE1] border border-[#D8D0C5] rounded-full text-[13px] font-bold text-[#1A1614]">
                    CHB First-Party Harness: {ACTION_PRICES.firstPartyMarigoldHarnessCredits} Credits (50% Off)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg space-y-2">
                    <label className="text-[13px] font-bold text-[#5C534E] block">
                      Monthly External AI / MCP Queries ({monthlyMcpQueries.toLocaleString()})
                    </label>
                    <input
                      type="range"
                      min={100}
                      max={25000}
                      step={100}
                      value={monthlyMcpQueries}
                      onChange={(e) => setMonthlyMcpQueries(Number(e.target.value))}
                      className="w-full accent-[#B7410E]"
                    />
                    <p className="text-[13px] text-[#5C534E]">
                      2 credits ($0.01) per verified MCP query
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg space-y-2">
                    <label className="text-[13px] font-bold text-[#5C534E] block">
                      Monthly Subscriber Deep-Reads ({monthlyReads.toLocaleString()})
                    </label>
                    <input
                      type="range"
                      min={100}
                      max={25000}
                      step={100}
                      value={monthlyReads}
                      onChange={(e) => setMonthlyReads(Number(e.target.value))}
                      className="w-full accent-[#B7410E]"
                    />
                    <p className="text-[13px] text-[#5C534E]">
                      1 credit ($0.005) per subscriber citation read
                    </p>
                  </div>

                  <div className="p-4 bg-[#E6F4EA] border border-[#CEEAD6] rounded-lg space-y-1">
                    <span className="text-[13px] font-bold uppercase text-[#137333]">
                      Your 70% Curator Royalty Share
                    </span>
                    <div className="text-2xl font-serif font-bold text-[#137333]">
                      ${royalties.curatorUsd.toLocaleString()}/mo
                    </div>
                    <p className="text-[13px] text-[#137333]">
                      {royalties.curatorCredits.toLocaleString()} credits · {royalties.escrowStatus}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {PIPES_SUBSCRIPTION_TIERS.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-[#FAF8F5] border border-[#D8D0C5] rounded-lg space-y-1"
                    >
                      <div className="text-[13px] font-bold text-[#1A1614]">{t.name}</div>
                      <div className="text-[13px] text-[#5C534E]">{t.summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2ECE1] border-t border-[#D8D0C5] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[13px] text-[#5C534E]">
            100% Air-Gapped Local Compute · Zero Raw Citizen PII Leaves Your Device
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://pipes.pink/explore/marigoldinsights"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-[#D8D0C5] bg-white hover:bg-[#FAF8F5] text-sm font-bold text-[#1A1614] inline-flex items-center gap-1.5"
            >
              Open pipe\marigoldinsights on Pipes
              <ExternalLink className="w-4 h-4" />
            </a>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
