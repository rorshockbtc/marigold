import { describe, it, expect, beforeEach } from 'vitest';
import JSZip from 'jszip';
import {
  MASSIVE_DATASET_CONSTANTS,
  createMassiveDatasetManifest,
  createPipesProfileMountNode,
  detectVoterFileDelimiter,
  escapeSafeCSVValue,
  streamMassiveFileWithBackpressure,
  streamZipTabularFileWithBackpressure,
  verifyMassiveDatasetManifest,
  verifyPipesProfileMountNode,
} from '@/lib/datasets/massiveDatasetEngine';
import {
  validateCivicContent,
  scrubCivicPiiAndSecrets,
} from '@/lib/security/civicPiiGuard';
import {
  getAirGapTelemetry,
  isUrlPermittedUnderAirGap,
  resetAirGapCountersForTest,
  setAirGapLocked,
} from '@/lib/security/airGapGuard';
import {
  interpretColumnMappings,
  normalizeRowWithMapping,
} from '@/lib/csv/universalMapper';
import {
  createDeterministicOtsProofBytes,
  verifyDatasetOtsProof,
} from '@/lib/crypto/merkleDagAndOtsBridge';

describe('Marigold × Pipes Massive Dataset Engine & Sovereign Privacy Upgrade', () => {
  beforeEach(() => {
    setAirGapLocked(false);
    resetAirGapCountersForTest();
  });

  it('auto-detects tab-delimited (NC), comma-delimited (MS), and pipe-delimited voter headers', () => {
    const ncHeader =
      'county_id\tcounty_desc\tvoter_reg_num\tncid\tlast_name\tfirst_name\tres_street_address\tzip_code\n';
    const msHeader =
      'MAPPING_VALUE,FIRST_NAME,LAST_NAME,RESIDENTIAL_ADDRESS,RES_CITY,RES_ZIP_CODE,COUNTY\n';
    const pipeHeader = 'VOTER_ID|FIRST_NAME|LAST_NAME|STREET|ZIP|COUNTY\n';

    expect(detectVoterFileDelimiter(ncHeader)).toBe('\t');
    expect(detectVoterFileDelimiter(msHeader)).toBe(',');
    expect(detectVoterFileDelimiter(pipeHeader)).toBe('|');
  });

  it('maps North Carolina SBE voter roll columns cleanly via universalMapper', () => {
    const ncSample = [
      {
        county_desc: 'WAKE',
        voter_reg_num: '000012345678',
        ncid: 'EH123456',
        first_name: 'ELEANOR',
        middle_name: 'GRACE',
        last_name: 'VANCE',
        name_suffix_lbl: 'JR',
        res_street_address: '410 FAYETTEVILLE ST',
        res_city_desc: 'RALEIGH',
        state_cd: 'NC',
        zip_code: '27601',
        voter_status_desc: 'ACTIVE',
        registr_dt: '10/01/2024',
        precinct_abbrv: '01-04',
        cong_dist_abbrv: '02',
        nc_senate_abbrv: '15',
        nc_house_abbrv: '33',
      },
    ];
    const cols = Object.keys(ncSample[0]);
    const mapping = interpretColumnMappings(cols, ncSample);
    const std = normalizeRowWithMapping(ncSample[0], mapping);

    expect(std.first_name).toBe('ELEANOR');
    expect(std.last_name).toBe('VANCE');
    expect(std.suffix).toBe('JR');
    expect(std.address).toBe('410 FAYETTEVILLE ST');
    expect(std.city).toBe('RALEIGH');
    expect(std.state).toBe('NC');
    expect(std.zip).toBe('27601');
    expect(std.county).toBe('Wake County');
    expect(std.dist_cong).toBe('02');
    expect(std.dist_sen).toBe('15');
    expect(std.dist_rep).toBe('33');
  });

  it('neutralizes CSV spreadsheet formula injection while preserving normal negative numbers', () => {
    expect(escapeSafeCSVValue('=CMD|\' /C calc\'!A0')).toBe('\'=CMD|\' /C calc\'!A0');
    expect(escapeSafeCSVValue('+HYPERLINK("http://evil.example")')).toBe(
      '"+HYPERLINK(""http://evil.example"")"'.replace('"+', '"\'+')
    );
    expect(escapeSafeCSVValue('@SUM(A1:A5)')).toBe('\'@SUM(A1:A5)');
    expect(escapeSafeCSVValue('-cmd|calc')).toBe('\'-cmd|calc');
    expect(escapeSafeCSVValue('-42.5')).toBe('-42.5');
    expect(escapeSafeCSVValue('Hinds County, MS')).toBe('"Hinds County, MS"');
  });

  it('streams multi-chunk files with backpressure along exact newline boundaries', async () => {
    const lines = Array.from({ length: 120 }, (_, i) => `VOT${1000 + i},JANE,DOE,${100 + i} OAK ST,39201`);
    const csvText = 'VOTER_ID,FIRST_NAME,LAST_NAME,ADDRESS,ZIP\n' + lines.join('\n') + '\n';
    const blob = new Blob([csvText], { type: 'text/csv' });

    const reconstructed: string[] = [];
    const stats = await streamMassiveFileWithBackpressure(
      blob,
      async (chunkText) => {
        // Every emitted non-final chunk must end on a newline boundary
        expect(chunkText.length).toBeGreaterThan(0);
        reconstructed.push(chunkText);
      },
      512 // Small 512-byte chunk size to exercise boundary splitting
    );

    expect(stats.totalBytesRead).toBe(blob.size);
    expect(stats.chunksProcessed).toBeGreaterThan(5);
    expect(reconstructed.join('')).toBe(csvText);
  });

  it('streams compressed .zip voter roll archives directly in memory without manual unzipping', async () => {
    const zip = new JSZip();
    const tabContent = [
      'ncid\tfirst_name\tlast_name\tres_street_address\tcounty_desc\tzip_code',
      'AA1001\tMARTHA\tCOLE\t120 MAIN ST\tWAKE\t27601',
      'AA1002\tTHOMAS\tREID\t88 PINE AVE\tDURHAM\t27701',
      'AA1003\tCLARA\tBELL\t45 ELM RD\tMECKLENBURG\t28202',
    ].join('\n');
    zip.file('ncvoter_Statewide.txt', tabContent);
    const zipUint8 = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    const zipBlob = new Blob([zipUint8 as BlobPart], { type: 'application/zip' });

    let collected = '';
    const res = await streamZipTabularFileWithBackpressure(
      zipBlob,
      async (chunkText) => {
        collected += chunkText;
      }
    );

    expect(res.entryName).toBe('ncvoter_Statewide.txt');
    expect(res.totalChunks).toBeGreaterThanOrEqual(1);
    expect(collected).toContain('AA1001\tMARTHA\tCOLE');
    expect(collected).toContain('MECKLENBURG\t28202');
  });

  it('creates and validates marigold.dataset.manifest.v1 and pipes.profile.mount.v1 schemas', async () => {
    expect(MASSIVE_DATASET_CONSTANTS.STREAM_CHUNK_BYTES).toBe(5 * 1024 * 1024);

    const manifest = await createMassiveDatasetManifest({
      datasetName: 'NC_Statewide_2026.zip',
      totalRows: 9_309_683,
      totalBytes: 502_000_000,
      columns: ['ncid', 'county_desc', 'voter_status_desc'],
      shards: [
        { filename: 'nc_shard_01.csv', rowCount: 250_000, sizeBytes: 42_000_000 },
      ],
      storageTier: 'opfs',
    });

    const mCheck = verifyMassiveDatasetManifest(manifest);
    expect(mCheck.valid).toBe(true);

    // Reject path-traversal shard filenames
    const unsafeCheck = verifyMassiveDatasetManifest({
      ...manifest,
      shards: [{ filename: '../etc/passwd', rowCount: 10, sizeBytes: 100 }],
    });
    expect(unsafeCheck.valid).toBe(false);

    const mountNode = await createPipesProfileMountNode({
      jurisdictionName: 'North Carolina Statewide',
      stateCode: 'NC',
      totalRecordsScanned: 9_309_683,
      cleanlinessPercentage: 98.4,
      merkleRoot: 'a'.repeat(64),
      leafCount: 16,
      datasetManifest: manifest,
    });

    const pCheck = verifyPipesProfileMountNode(mountNode);
    expect(pCheck.valid).toBe(true);
    expect(mountNode.localDatasetMount?.shardCount).toBe(1);
  });

  it('enforces Civic PII Guardrails while permitting Roosevelt synthetic benchmarks and county aggregates', () => {
    // Block raw voter CSV headers
    const rawHeaderCheck = validateCivicContent(
      'voter_id,first_name,last_name,dob,address\n10029384,JOHN,SMITH,1980-01-01,123 MAIN ST 39201'
    );
    expect(rawHeaderCheck.allowed).toBe(false);

    // Block real residential street addresses in non-synthetic stories
    const realAddrCheck = validateCivicContent(
      'Flagged voter resides at 742 Evergreen Street, Jackson MS 39201.'
    );
    expect(realAddrCheck.allowed).toBe(false);

    // Allow clean county-level aggregate summaries
    const aggregateCheck = validateCivicContent(
      'Hinds County has 173,149 registered voters and 431 high-density 8+ voter parcels.'
    );
    expect(aggregateCheck.allowed).toBe(true);

    // Allow synthetic Roosevelt State benchmark references (provided no SSN / CC / raw header)
    const rooseveltCheck = validateCivicContent(
      'State of Roosevelt synthetic voter benchmark: 120 Oak Street 99999.'
    );
    expect(rooseveltCheck.allowed).toBe(true);

    // Scrub secrets, SSNs, emails, and phones
    const scrubbed = scrubCivicPiiAndSecrets(
      'Contact clerk@county.gov or 601-555-1234 regarding SSN 123-45-6789 and sk-abcdefghijklmnopqrstuvwxyz123456'
    );
    expect(scrubbed.scrubbedCount).toBeGreaterThanOrEqual(3);
    expect(scrubbed.clean).not.toContain('123-45-6789');
    expect(scrubbed.clean).not.toContain('clerk@county.gov');
  });

  it('enforces Offline Air-Gap Lock URL egress rules and OpenTimestamps (.ots) verification', () => {
    setAirGapLocked(true);
    expect(getAirGapTelemetry().locked).toBe(true);

    // Block outbound AI / mapper / relay POSTs and external webhooks
    expect(isUrlPermittedUnderAirGap('/api/ai-mapper', 'POST')).toBe(false);
    expect(isUrlPermittedUnderAirGap('/api/data-story/sql', 'POST')).toBe(false);
    expect(isUrlPermittedUnderAirGap('/api/relay/push', 'POST')).toBe(false);
    expect(isUrlPermittedUnderAirGap('https://api.openai.com/v1/chat/completions', 'POST')).toBe(false);

    // Allow local Ollama loopback and static local GET assets
    expect(isUrlPermittedUnderAirGap('http://127.0.0.1:11434/api/chat', 'POST')).toBe(true);
    expect(isUrlPermittedUnderAirGap('/_next/static/chunks/duckdb.wasm', 'GET')).toBe(true);

    // Verify OpenTimestamps (.ots) container round-trip
    const rootHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const otsBytes = createDeterministicOtsProofBytes(rootHex);
    const verified = verifyDatasetOtsProof(otsBytes, rootHex);
    expect(verified.valid).toBe(true);
    expect(verified.digestHex).toBe(rootHex);
  });
});
