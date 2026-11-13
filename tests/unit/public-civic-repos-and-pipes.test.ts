import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validateCivicContent } from '../../src/lib/security/civicPiiGuard';
import { normalizeDuckDBValue } from '../../src/lib/data/DuckDBProvider';
import {
  EVALUATED_PUBLIC_DATA_REPOS,
  EXCLUDED_PUBLIC_DATA_REPOS,
  PUBLIC_CIVIC_DATASETS,
  CURATED_PIPE_STORY_STARTERS,
  resolvePublicDatasetForWebHunt,
} from '../../src/lib/datasets/publicCivicRepoCatalog';
import {
  generateDeterministicSQLPayload,
  synthesizeDeterministicResearch,
} from '../../src/lib/ai/deterministicStoryEngine';
import {
  getDefaultMarigoldCorpusIndex,
  queryLocalBM25Corpus,
} from '../../src/lib/ai/localCorpusSearch';

const MARIGOLD_ROOT = path.resolve(__dirname, '../..');
const DATASETS_DIR = path.join(MARIGOLD_ROOT, 'public/datasets/civic');
const PIPES_CORPUS_DIR = path.join(MARIGOLD_ROOT, 'public/pipes-corpus');

describe('Public Civic Data Repositories & Pipes Integration', () => {
  it('validates public/datasets/civic/manifest.json, exact row counts, SHA-256 digests, sentinel cleanliness, and Zero-PII compliance', () => {
    const manifestPath = path.join(DATASETS_DIR, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestRaw);
    expect(validateCivicContent(manifestRaw, 'manifest.json').allowed).toBe(true);

    const expectedCounts: Record<string, number> = {
      'us_county_election_admin_cvap_2024.csv': 3222,
      'ms_nc_audit_vs_federal_benchmarks_2026.csv': 182,
      'fema_county_election_continuity_2020_2026.csv': 3210,
    };

    for (const [filename, expectedRowCount] of Object.entries(expectedCounts)) {
      const filePath = path.join(DATASETS_DIR, filename);
      expect(fs.existsSync(filePath)).toBe(true);

      const csvText = fs.readFileSync(filePath, 'utf-8').trim();
      const lines = csvText.split(/\r?\n/);
      expect(lines.length - 1).toBe(expectedRowCount);

      // Verify Zero-PII guard passes on full CSV
      const piiCheck = validateCivicContent(csvText, filename);
      expect(piiCheck.allowed).toBe(true);
      expect(piiCheck.isSensitive).toBe(false);

      // Verify no EAVS negative sentinel values (-99, -88, -77) leaked into numeric cells
      const headers = lines[0].split(',');
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',');
        for (let c = 0; c < cells.length; c++) {
          const val = cells[c].trim();
          const col = headers[c];
          if (col !== 'net_domestic_mig_2020_2024' && col !== 'turnout_change_2020_to_2024_pct') {
            expect(['-99', '-88', '-77', '-99.0', '-88.0', '-77.0']).not.toContain(val);
          }
        }
      }

      // Verify SHA-256 matches catalog metadata
      const digest = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
      const dsEntry = Object.values(PUBLIC_CIVIC_DATASETS).find((d) => d.filename === filename);
      expect(dsEntry).toBeDefined();
      expect(dsEntry!.sha256).toBe(digest);
      expect(dsEntry!.rows).toBe(expectedRowCount);
    }

    expect(manifest).toBeTruthy();
  });

  it('validates public/pipes-corpus/index.json (4 Pipes, 24 Articles) and Zero-PII compliance across all exported bundles', () => {
    const indexPath = path.join(PIPES_CORPUS_DIR, 'index.json');
    expect(fs.existsSync(indexPath)).toBe(true);

    const indexRaw = fs.readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(indexRaw);
    expect(index.totalPipes).toBe(4);
    expect(index.totalArticles).toBe(24);
    expect(Array.isArray(index.pipes)).toBe(true);
    expect(index.pipes).toHaveLength(4);
    expect(validateCivicContent(indexRaw, 'index.json').allowed).toBe(true);

    for (const pipe of index.pipes) {
      const corpusFile = path.join(PIPES_CORPUS_DIR, path.basename(pipe.corpusFile));
      expect(fs.existsSync(corpusFile)).toBe(true);
      const raw = fs.readFileSync(corpusFile, 'utf-8');
      const check = validateCivicContent(raw, path.basename(corpusFile));
      expect(check.allowed).toBe(true);
      expect(check.isSensitive).toBe(false);
    }
  });

  it('normalizes DuckDB BigInt and nested values safely for UI charting and JSON serialization', () => {
    expect(normalizeDuckDBValue(BigInt(42))).toBe(42);
    expect(normalizeDuckDBValue(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(5))).toBe('9007199254740996');
    expect(normalizeDuckDBValue({ count: BigInt(123), items: [BigInt(1), 'NC'] })).toEqual({
      count: 123,
      items: [1, 'NC'],
    });
    expect(normalizeDuckDBValue(null)).toBeNull();
  });

  it('exposes 5 adopted repos, 3 excluded repos, 3 mountable datasets, 4 story starters, and intent-aware dataset resolver', () => {
    expect(EVALUATED_PUBLIC_DATA_REPOS).toHaveLength(5);
    expect(EXCLUDED_PUBLIC_DATA_REPOS).toHaveLength(3);
    expect(Object.keys(PUBLIC_CIVIC_DATASETS)).toHaveLength(3);
    expect(CURATED_PIPE_STORY_STARTERS).toHaveLength(4);

    for (const repo of EXCLUDED_PUBLIC_DATA_REPOS) {
      expect(repo.excludedReason).toBeTruthy();
    }

    expect(resolvePublicDatasetForWebHunt('Check Hurricane Helene DR-4827-NC FEMA continuity').id).toBe('femaContinuity');
    expect(resolvePublicDatasetForWebHunt('Compare Mississippi and North Carolina Brunswick migration').id).toBe('msNcBenchmarks');
    expect(resolvePublicDatasetForWebHunt('National EAVS confirmation notices and removals').id).toBe('usCountyAtlas');
  });

  it('generates deterministic SQL payloads tailored to FEMA, EAVS removals, and CVAP county schemas', () => {
    const femaSchema = [
      { column_name: 'county_name', column_type: 'VARCHAR' },
      { column_name: 'state_abbr', column_type: 'VARCHAR' },
      { column_name: 'fema_disasters_2020_2026', column_type: 'BIGINT' },
      { column_name: 'cvap_2024', column_type: 'DOUBLE' },
    ];
    const femaSql = generateDeterministicSQLPayload('Show FEMA disaster declarations across counties', femaSchema);
    expect(femaSql.query).toContain('fema_disasters_2020_2026');

    const eavsSchema = [
      { column_name: 'county_name', column_type: 'VARCHAR' },
      { column_name: 'state_abbr', column_type: 'VARCHAR' },
      { column_name: 'eavs_removals_total', column_type: 'BIGINT' },
      { column_name: 'cvap_2024', column_type: 'DOUBLE' },
    ];
    const eavsSql = generateDeterministicSQLPayload('Compare NVRA A12a voter removals by county', eavsSchema);
    expect(eavsSql.query).toContain('eavs_removals_total');

    const cvapSchema = [
      { column_name: 'county_name', column_type: 'VARCHAR' },
      { column_name: 'state_abbr', column_type: 'VARCHAR' },
      { column_name: 'marigold_active_to_cvap_pct', column_type: 'DOUBLE' },
      { column_name: 'cvap_2024', column_type: 'DOUBLE' },
    ];
    const cvapSql = generateDeterministicSQLPayload('Which counties have highest active registration vs CVAP?', cvapSchema);
    expect(cvapSql.query).toContain('marigold_active_to_cvap_pct');

    const research = synthesizeDeterministicResearch('Compare EAVS 2024 confirmation notices and CVAP MOE');
    expect(research.citations.length).toBeGreaterThan(0);
    expect(research.narrative.length).toBeGreaterThan(20);
  });

  it('grounds offline BM25 corpus search against EAVS A10a, Hurricane Helene DR-4827-NC, and Brunswick migration', () => {
    const index = getDefaultMarigoldCorpusIndex();

    const eavsHits = queryLocalBM25Corpus(index, 'EAVS A10a confirmation notices sentinel', 3);
    expect(eavsHits.length).toBeGreaterThan(0);
    expect(eavsHits[0].doc.title + ' ' + eavsHits[0].doc.content).toMatch(/EAVS|A10a/i);

    const heleneHits = queryLocalBM25Corpus(index, 'Hurricane Helene DR-4827-NC Washoe disaster continuity', 3);
    expect(heleneHits.length).toBeGreaterThan(0);
    expect(heleneHits.map((h) => `${h.doc.title} ${h.doc.content}`).join(' ')).toMatch(/DR-4827-NC|Helene/i);

    const brunswickHits = queryLocalBM25Corpus(index, 'Brunswick migration CVAP 90% MOE', 3);
    expect(brunswickHits.length).toBeGreaterThan(0);
    expect(brunswickHits.map((h) => `${h.doc.title} ${h.doc.content}`).join(' ')).toMatch(/Brunswick|CVAP/i);
  });

  it('ensures .vercelignore and Clerk proxy allowlist public civic CSVs and Pipes JSON corpora', () => {
    const vercelIgnore = fs.readFileSync(path.join(MARIGOLD_ROOT, '.vercelignore'), 'utf-8');
    expect(vercelIgnore).toContain('!public/datasets/civic/*.csv');

    const proxyTs = fs.readFileSync(path.join(MARIGOLD_ROOT, 'src/proxy.ts'), 'utf-8');
    expect(proxyTs).toContain("'/datasets(.*)'");
    expect(proxyTs).toContain("'/pipes-corpus(.*)'");
    expect(proxyTs).toContain('datasets|pipes-corpus');
  });
});
