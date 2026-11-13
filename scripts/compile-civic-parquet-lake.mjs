#!/usr/bin/env node
/**
 * Compiles all 5 Zero-PII CSVs in `public/datasets/civic/` into Zstd-compressed
 * Apache Parquet shards via DuckDB Node Runtime (`@duckdb/duckdb-wasm`), verifies
 * `PAR1` magic bytes + row count parity, and updates `public/datasets/civic/manifest.json`.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const duckdb = require('@duckdb/duckdb-wasm/dist/duckdb-node-blocking.cjs');

const MARIGOLD_ROOT = path.resolve(import.meta.dirname, '..');
const CIVIC_DIR = path.join(MARIGOLD_ROOT, 'public', 'datasets', 'civic');
const DUCKDB_DIST = path.join(MARIGOLD_ROOT, 'node_modules', '@duckdb', 'duckdb-wasm', 'dist');
const HIGHLIGHTS_PATH = '/tmp/marigold_public_lake_cache/verified_highlights.json';
const MANIFEST_PATH = path.join(CIVIC_DIR, 'manifest.json');

const DATASETS = [
  { key: 'usCountyAtlas', csv: 'us_county_election_admin_cvap_2024.csv' },
  { key: 'msNcBenchmarks', csv: 'ms_nc_audit_vs_federal_benchmarks_2026.csv' },
  { key: 'femaContinuity', csv: 'fema_county_election_continuity_2020_2026.csv' },
  { key: 'publicHealthAccess', csv: 'us_county_public_health_access_2024.csv' },
  { key: 'irsFdicFiscal', csv: 'us_county_irs_migration_fdic_banking_2024.csv' },
];

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

async function main() {
  const db = await duckdb.createDuckDB(
    {
      mvp: {
        mainModule: path.join(DUCKDB_DIST, 'duckdb-mvp.wasm'),
        mainWorker: path.join(DUCKDB_DIST, 'duckdb-node-mvp.worker.cjs'),
      },
      eh: {
        mainModule: path.join(DUCKDB_DIST, 'duckdb-eh.wasm'),
        mainWorker: path.join(DUCKDB_DIST, 'duckdb-node-eh.worker.cjs'),
      },
    },
    new duckdb.VoidLogger(),
    duckdb.NODE_RUNTIME
  );
  await db.instantiate();
  const conn = db.connect();

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const highlights = fs.existsSync(HIGHLIGHTS_PATH)
    ? JSON.parse(fs.readFileSync(HIGHLIGHTS_PATH, 'utf8'))
    : null;

  // Ensure all 9 evaluated upstream sources are recorded once
  if (highlights) {
    const existingIds = new Set((manifest.upstreamSources || []).map((s) => s.id));
    const additions = [
      {
        id: 'cdc-places-2024-county',
        name: 'CDC PLACES 2024 Release (County GIS-Friendly Format)',
        url: 'https://data.cdc.gov/api/views/i46a-9kgh/rows.csv?accessType=DOWNLOAD',
        sha256: highlights.rawSourceSha256.cdc_places_2024,
        license: '17 U.S.C. 105 Federal Public Domain',
      },
      {
        id: 'hhs-hospitals-nchs-mortality',
        name: 'HHS Registered Acute Hospital Counts & CDC NCHS County Drug Mortality',
        url: 'https://healthdata.gov/api/views/vz64-k9wr/rows.csv?accessType=DOWNLOAD',
        sha256: {
          hhs_hospitals: highlights.rawSourceSha256.hhs_hospitals,
          cdc_nchs_drug_mortality: highlights.rawSourceSha256.cdc_nchs_drug_mortality,
        },
        license: '17 U.S.C. 105 Federal Public Domain',
      },
      {
        id: 'irs-soi-migration-2022-2023',
        name: 'IRS Statistics of Income (SOI) 2022-2023 County-to-County Migration',
        url: 'https://www.irs.gov/pub/irs-soi/countyinflow2223.csv',
        sha256: {
          inflow_2223: highlights.rawSourceSha256.irs_inflow_2223,
          outflow_2223: highlights.rawSourceSha256.irs_outflow_2223,
        },
        license: '17 U.S.C. 105 Federal Public Domain',
      },
      {
        id: 'fdic-sod-2024',
        name: 'FDIC 2024 Summary of Deposits (76,727 Branches Rolled to County FIPS)',
        url: 'https://banks.data.fdic.gov/api/sod?filters=YEAR%3A2024&format=json',
        sha256: highlights.rawSourceSha256.fdic_sod_2024,
        license: '17 U.S.C. 105 Federal Public Domain',
      },
    ];
    for (const src of additions) {
      if (!existingIds.has(src.id)) {
        manifest.upstreamSources.push(src);
      }
    }
    manifest.publicHealthAndFiscalHighlights = {
      national: highlights.national,
      mississippiSummary: {
        counties: highlights.mississippi.counties,
        hospitalDeserts: highlights.mississippi.hospitalDeserts,
        meanDisabilityPct: highlights.mississippi.meanDisabilityPct,
        meanLackTransportPct: highlights.mississippi.meanLackTransportPct,
        meanDiabetesPct: highlights.mississippi.meanDiabetesPct,
        fdicBranches: highlights.mississippi.fdicBranches,
        fdicDepositsMillions: highlights.mississippi.fdicDepositsMillions,
        bankingDeserts: highlights.mississippi.bankingDeserts,
        irsTotalNetReturns: highlights.mississippi.irsTotalNetReturns,
        irsTotalNetAgiMillions: highlights.mississippi.irsTotalNetAgiMillions,
      },
      northCarolinaSummary: {
        counties: highlights.northCarolina.counties,
        hospitalDeserts: highlights.northCarolina.hospitalDeserts,
        meanDisabilityPct: highlights.northCarolina.meanDisabilityPct,
        meanLackTransportPct: highlights.northCarolina.meanLackTransportPct,
        meanDiabetesPct: highlights.northCarolina.meanDiabetesPct,
        fdicBranches: highlights.northCarolina.fdicBranches,
        fdicDepositsMillions: highlights.northCarolina.fdicDepositsMillions,
        bankingDeserts: highlights.northCarolina.bankingDeserts,
        irsTotalNetReturns: highlights.northCarolina.irsTotalNetReturns,
        irsTotalNetAgiMillions: highlights.northCarolina.irsTotalNetAgiMillions,
      },
    };
  }

  for (const ds of DATASETS) {
    const absCsv = path.resolve(CIVIC_DIR, ds.csv);
    const parquetName = ds.csv.replace(/\.csv$/i, '.parquet');
    const absParquet = path.resolve(CIVIC_DIR, parquetName);

    if (fs.existsSync(absParquet)) {
      fs.unlinkSync(absParquet);
    }

    const escCsv = absCsv.replace(/'/g, "''");
    const escParquet = absParquet.replace(/'/g, "''");

    // Preserve leading zeros on 5-digit county_fips
    conn.query(`
      CREATE OR REPLACE TEMP TABLE _stage_tbl AS
      SELECT * FROM read_csv_auto('${escCsv}', types={'county_fips': 'VARCHAR'}, sample_size=-1);
    `);

    const countRes = conn.query('SELECT COUNT(*) AS cnt FROM _stage_tbl;');
    const rowCount = Number(countRes.toArray()[0].toJSON().cnt);

    const descRes = conn.query('DESCRIBE _stage_tbl;');
    const columns = descRes.toArray().map((r) => String(r.toJSON().column_name));

    conn.query(`COPY _stage_tbl TO '${escParquet}' (FORMAT PARQUET, COMPRESSION ZSTD);`);

    // Verify Parquet readable + magic header PAR1
    const buf = fs.readFileSync(absParquet);
    const magic = buf.subarray(0, 4).toString('ascii');
    if (magic !== 'PAR1') {
      throw new Error(`Invalid Parquet magic ${magic} for ${parquetName}`);
    }
    const pqCountRes = conn.query(`SELECT COUNT(*) AS cnt FROM read_parquet('${escParquet}');`);
    const pqRowCount = Number(pqCountRes.toArray()[0].toJSON().cnt);
    if (pqRowCount !== rowCount) {
      throw new Error(`Parquet row mismatch on ${parquetName}: ${pqRowCount} !== ${rowCount}`);
    }

    const csvBytes = fs.statSync(absCsv).size;
    const csvSha256 = sha256File(absCsv);
    const parquetBytes = buf.byteLength;
    const parquetSha256 = sha256File(absParquet);

    manifest.datasets[ds.key] = {
      filename: ds.csv,
      publicPath: `/datasets/civic/${ds.csv}`,
      bytes: csvBytes,
      rows: rowCount,
      sha256: csvSha256,
      parquetFilename: parquetName,
      parquetPath: `/datasets/civic/${parquetName}`,
      parquetBytes,
      parquetSha256,
      columns,
    };

    console.log(
      `[PARQUET OK] ${parquetName}: ${rowCount} rows | CSV ${(csvBytes / 1024).toFixed(1)} KB -> Parquet ${(parquetBytes / 1024).toFixed(1)} KB | sha256=${parquetSha256}`
    );
  }

  manifest.generatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`\nUpdated ${MANIFEST_PATH}`);

  conn.close();
}

main().catch((err) => {
  console.error('Failed compiling Parquet lake:', err);
  process.exit(1);
});
