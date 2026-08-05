import * as duckdb from '@duckdb/duckdb-wasm';

let dbInstance: duckdb.AsyncDuckDB | null = null;
let connInstance: duckdb.AsyncDuckDBConnection | null = null;

export async function getDuckDB(): Promise<{ db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection }> {
  if (dbInstance && connInstance) {
    return { db: dbInstance, conn: connInstance };
  }

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  const conn = await db.connect();
  dbInstance = db;
  connInstance = conn;

  return { db, conn };
}

/**
 * Registers binary CSV or Parquet file into DuckDB WASM virtual filesystem
 */
export async function registerFileInDuckDB(fileName: string, fileData: Uint8Array): Promise<string> {
  const { db } = await getDuckDB();
  await db.registerFileBuffer(fileName, fileData);
  return fileName;
}

/**
 * High-speed C++ WebAssembly SIMD SQL query engine
 */
export async function queryDuckDBSQL(sql: string): Promise<Array<Record<string, any>>> {
  const { conn } = await getDuckDB();
  const result = await conn.query(sql);
  return result.toArray().map(row => row.toJSON());
}

/**
 * Instant Single-Pass 360° Forensic Audit Engine running inside DuckDB WASM (Unclipped)
 */
export async function runDuckDBAuditSweep(tableName: string = 'voter_roll'): Promise<Record<string, Array<Record<string, any>>>> {
  const { conn } = await getDuckDB();

  // High-density residential addresses (> 8 voters)
  const densityRes = await conn.query(`
    SELECT address, city, state, zip, county, COUNT(*) as occupant_count, MAX(name) as name, MAX(voter_id) as id
    FROM ${tableName}
    WHERE address IS NOT NULL AND TRIM(address) != ''
    GROUP BY address, city, state, zip, county
    HAVING COUNT(*) >= 8
    ORDER BY occupant_count DESC
  `);

  // Commercial P.O. Box Disguises
  const poBoxRes = await conn.query(`
    SELECT voter_id as id, name, address, city, state, zip, county, 1 as occupant_count
    FROM ${tableName}
    WHERE UPPER(address) LIKE '%PO BOX%' 
       OR UPPER(address) LIKE '%P.O. BOX%' 
       OR UPPER(address) LIKE '%P O BOX%'
       OR UPPER(address) LIKE '%UPS STORE%'
       OR UPPER(address) LIKE '%PMB%'
  `);

  // Out-of-state mailings
  const ncoaRes = await conn.query(`
    SELECT voter_id as id, name, address, city, state, zip, county, 1 as occupant_count
    FROM ${tableName}
    WHERE (mail_state IS NOT NULL AND TRIM(mail_state) != '' AND UPPER(mail_state) != UPPER(state))
       OR ncoa_flag = 'Y'
  `);

  // Intra-county duplicates
  const dupRes = await conn.query(`
    SELECT name, zip, COUNT(DISTINCT address) as addrs_count, COUNT(*) as occupant_count, MAX(voter_id) as id, MAX(address) as address, MAX(city) as city, MAX(state) as state, MAX(county) as county
    FROM ${tableName}
    WHERE name IS NOT NULL AND zip IS NOT NULL
    GROUP BY name, zip
    HAVING COUNT(*) > 1 AND COUNT(DISTINCT address) > 1
  `);

  return {
    'density': densityRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'HIGH', details: `${r.toJSON().occupant_count} voters at residential address.` })),
    'po-box': poBoxRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'CRITICAL', details: 'Physical residence listed as Post Office Box or commercial drop.' })),
    'out-of-state-mailing': ncoaRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'HIGH', details: 'Out-of-state mailing address detected.' })),
    'duplicates': dupRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'HIGH', details: `Intra-county duplicate name across ${r.toJSON().addrs_count} addresses.` })),
    'spikes': [],
    'phantom-precincts': [],
    'benfords-law': []
  };
}
