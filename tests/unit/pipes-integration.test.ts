import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  classifyIntentDeterministic,
  generateDeterministicSQLPayload,
  synthesizeDeterministicNarrative,
  scrubBannedEditorialPhrases,
  BANNED_EDITORIAL_PHRASES,
} from '../../src/lib/ai/deterministicStoryEngine';
import {
  buildMarigoldAuditDag,
  verifyDagIntegrity,
  createSovereignCustodyDeed,
  verifySovereignCustodyDeed,
  createDeterministicOtsProofBytes,
  verifyDatasetOtsProof,
} from '../../src/lib/crypto/merkleDagAndOtsBridge';
import {
  evaluateDossierRubric,
  runDatasetBlindSpotCheck,
} from '../../src/lib/pipes/editorialRubricAndGraph';
import {
  calculateMonthlyCredits,
  estimateMarigoldCuratorRoyalties,
  ACTION_PRICES,
} from '../../src/lib/pipes/economics';
import {
  generateMarigoldHarnessBlueprint,
  buildMarigoldSkillMarkdown,
} from '../../src/lib/pipes/marigoldPipesLocalFolder';

describe('Marigold × Pipes Sovereign Integration Suite', () => {
  it('1. unlocks all analytical, demo, and documentation routes in src/proxy.ts', () => {
    const proxyPath = path.join(process.cwd(), 'src/proxy.ts');
    const content = fs.readFileSync(proxyPath, 'utf-8');

    const requiredPublicRoutes = [
      '/overview',
      '/explore',
      '/dashboard',
      '/data-stories',
      '/playbooks',
      '/audit',
      '/onboarding',
      '/election-integrity-presidential-address',
      '/privacy',
      '/terms',
    ];
    for (const route of requiredPublicRoutes) {
      expect(content).toContain(route);
    }
  });

  it('2. executes Tier 0 deterministic intent, DuckDB SQL, and 6-stage rhetorical synthesis with zero banned AI phrases', () => {
    const intent = classifyIntentDeterministic(
      'Synthesize an executive dossier on high-density residential occupancy clusters',
      'Roosevelt_Civic_Benchmark_2026.csv'
    );
    expect(intent.intent).toBe('LOCAL_DATA_DRAFT');

    const sqlPayload = generateDeterministicSQLPayload(
      'Show high-density occupancy clusters >12 per address',
      [
        { column_name: 'res_address', column_type: 'VARCHAR' },
        { column_name: 'county', column_type: 'VARCHAR' },
      ]
    );
    expect(sqlPayload.query).toContain('FROM data_file');
    expect(sqlPayload.query).toContain('res_address');
    expect(sqlPayload.chartType).toBe('bar');

    const narrative = synthesizeDeterministicNarrative(
      'High-density residential occupancy clusters',
      [
        { x: '100 Capitol St', y: 42 },
        { x: '250 University Ave', y: 28 },
        { x: '14 Oak Ln', y: 12 },
      ],
      sqlPayload.chartConfig
    );

    expect(narrative.blocks.length).toBeGreaterThanOrEqual(5);
    const fullText = narrative.blocks
      .map((b) => `${b.title || ''} ${b.narrative || ''}`)
      .join(' ')
      .toLowerCase();

    for (const banned of BANNED_EDITORIAL_PHRASES) {
      expect(fullText).not.toContain(banned.toLowerCase());
    }

    const dirty = 'In conclusion, let us delve into this tapestry of data.';
    const scrubbed = scrubBannedEditorialPhrases(dirty).toLowerCase();
    expect(scrubbed).not.toContain('in conclusion');
    expect(scrubbed).not.toContain('delve');
    expect(scrubbed).not.toContain('tapestry');
  });

  it('3. builds a 3-layer Topological Merkle-DAG, detects tampering, signs ECDSA P-256 Custody Deeds, and verifies .ots binary proofs', async () => {
    const dag = await buildMarigoldAuditDag({
      datasetName: 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: 1800,
      dossierTitle: 'Roosevelt 360° Integrity Dossier',
      dossierContentJson: JSON.stringify({ cleanPct: 97.6, totalFlagged: 412 }),
    });

    expect(dag.dagVersion).toBe('1.0');
    expect(dag.merkleRoot).toMatch(/^[a-f0-9]{64}$/);
    expect(dag.nodeCount).toBeGreaterThanOrEqual(7);

    const verification = await verifyDagIntegrity(dag);
    expect(verification.valid).toBe(true);

    // Tamper test
    const tampered = JSON.parse(JSON.stringify(dag));
    tampered.nodes['dossier:primary'].contentHash = '0'.repeat(64);
    const tamperedCheck = await verifyDagIntegrity(tampered);
    expect(tamperedCheck.valid).toBe(false);

    // Sovereign Custody Deed (ECDSA P-256)
    const deed = await createSovereignCustodyDeed({
      pipe: 'pipe\\marigoldinsights',
      curator: 'Test Citizen Auditor',
      merkleRoot: dag.merkleRoot,
      dagNodeCount: dag.nodeCount,
    });
    expect(deed.signatureScheme).toBe('ECDSA-P256-SHA256');
    const isDeedValid = await verifySovereignCustodyDeed(deed);
    expect(isDeedValid).toBe(true);

    // Bitcoin OpenTimestamps (.ots) binary container verification
    const otsBytes = createDeterministicOtsProofBytes(dag.merkleRoot);
    const otsVerify = verifyDatasetOtsProof(otsBytes, dag.merkleRoot);
    expect(otsVerify.valid).toBe(true);
    expect(otsVerify.digestHex).toBe(dag.merkleRoot);
  });

  it('4. scores dossiers against the Pipes Editorial Rubric v1, identifies blind spots, and computes 70/30 royalties', () => {
    const rubric = evaluateDossierRubric({
      title: 'Forensic 360° Integrity Dossier: Roosevelt Benchmark',
      narratives: [
        'Local DuckDB-Wasm execution across 1,800 records isolated 48 high-density occupancy clusters and 88 commercial mail drops under NVRA list maintenance standards.',
        'Before classifying elevated counts as statutory defects, auditors must check university dormitory baselines and NCOA forwarding dates.',
      ],
      hasCharts: true,
      hasSqlProvenance: true,
    });

    expect(rubric.totalScore).toBeGreaterThanOrEqual(26);
    expect(rubric.passesPublishThreshold).toBe(true);
    expect(rubric.relatedPipes).toContain('marigoldinsights');

    const blindSpots = runDatasetBlindSpotCheck([
      'High-density occupancy clusters and commercial PO Box mail drops',
    ]);
    const densitySpot = blindSpots.find((b) => b.id === 'density');
    const benfordSpot = blindSpots.find((b) => b.id === 'benford');
    expect(densitySpot?.status).toBe('covered');
    expect(benfordSpot?.status).toBe('blind_spot');

    expect(calculateMonthlyCredits(21)).toBe(1050);
    expect(ACTION_PRICES.firstPartyMarigoldHarnessCredits).toBe(10);

    const royalties = estimateMarigoldCuratorRoyalties({
      monthlyExternalMcpQueries: 1000, // 2,000 credits
      monthlySubscriberReads: 1000, // 1,000 credits -> 3,000 total -> 70% = 2,100 credits = $10.50
      isClaimedJurisdiction: false,
    });
    expect(royalties.curatorCredits).toBe(2100);
    expect(royalties.curatorUsd).toBe(10.5);
    expect(royalties.escrowStatus).toContain('Unclaimed Jurisdiction Escrow');
  });

  it('5. generates valid marigold.json Bang Studio harness blueprints and SKILL.md grounding files', async () => {
    const dag = await buildMarigoldAuditDag({
      datasetName: 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: 1800,
      dossierTitle: 'Roosevelt 360° Integrity Dossier',
      dossierContentJson: '{}',
    });

    const harness = generateMarigoldHarnessBlueprint({
      datasetName: 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: 1800,
      dagManifest: dag,
    });

    expect(harness.$schema).toBe('https://pipes.pink/schemas/v1/harness.json');
    expect(harness.namespace).toBe('marigold-duckdb');
    expect(harness.provisionCostCredits).toBe(10);

    const skillMd = buildMarigoldSkillMarkdown({
      datasetName: 'Roosevelt_Civic_Benchmark_2026.csv',
      totalRows: 1800,
      dossierTitle: 'Roosevelt 360° Integrity Dossier',
      narrativePlain: 'Verified 1,800 records locally.',
      dagManifest: dag,
      relatedPipes: ['marigoldinsights', 'election-integrity'],
      bridgedConcepts: ['Zero-ETL DuckDB-Wasm Forensics'],
    });
    expect(skillMd).toContain(dag.merkleRoot);
    expect(skillMd).toContain('PIPE\\MARIGOLDINSIGHTS');
  });
});
