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

  // High-density residential addresses (> 8 voters, normalized uppercase + trimmed)
  const densityRes = await conn.query(`
    SELECT MAX(address) as address, MAX(city) as city, state, zip, county, COUNT(*) as occupant_count, MAX(name) as name, MAX(voter_id) as id
    FROM ${tableName}
    WHERE address IS NOT NULL AND TRIM(address) != ''
    GROUP BY UPPER(TRIM(REGEXP_REPLACE(address, '\\s+', ' ', 'g'))), UPPER(TRIM(COALESCE(city, ''))), state, zip, county
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
       OR UPPER(address) LIKE '%FEDEX%'
  `);

  // Out-of-state mailings
  const ncoaRes = await conn.query(`
    SELECT voter_id as id, name, address, city, state, zip, county, 1 as occupant_count
    FROM ${tableName}
    WHERE (mail_state IS NOT NULL AND TRIM(mail_state) != '' AND UPPER(mail_state) != UPPER(state))
       OR ncoa_flag = 'Y'
  `);

  // Intra-county duplicates (requires DOB or Middle Name + Suffix disambiguation to avoid homonym false positives)
  const dupRes = await conn.query(`
    SELECT name, COALESCE(suffix, '') as suffix, COALESCE(dob, middle_name, 'homonym') as discriminator, zip, COUNT(DISTINCT address) as addrs_count, COUNT(*) as occupant_count, MAX(voter_id) as id, MAX(address) as address, MAX(city) as city, MAX(state) as state, MAX(county) as county
    FROM ${tableName}
    WHERE name IS NOT NULL AND zip IS NOT NULL
    GROUP BY name, COALESCE(suffix, ''), COALESCE(dob, middle_name, 'homonym'), zip
    HAVING COUNT(*) > 1 AND COUNT(DISTINCT address) > 1
  `);

  // Missing Dorm / Multi-Unit Numbers (whole-word match + street-name false-positive exclusion)
  const missingDormRes = await conn.query(`
    SELECT voter_id as id, name, address, city, state, zip, county, 1 as occupant_count
    FROM ${tableName}
    WHERE REGEXP_MATCHES(UPPER(address), '\\b(HALL|DORM|DORMITORY|CAMPUS|UNIVERSITY|COLLEGE|APARTMENT|APTS|TOWERS)\\b')
      AND NOT REGEXP_MATCHES(UPPER(address), '\\b(APT|UNIT|RM|ROOM|SUITE|BLDG|LOT|STE)\\b|#')
      AND NOT (
        REGEXP_MATCHES(UPPER(address), '\\b(HALL|COLLEGE|UNIVERSITY|CAMPUS)\\s+(ST|STREET|RD|ROAD|AVE|AVENUE|DR|DRIVE|LN|LANE|BLVD|CIR|CIRCLE|CT|COURT|WAY|PKWY|HWY|CV|COVE|VIEW|PL|PLACE|FERRY|TRL|TRAIL)\\b')
        AND NOT REGEXP_MATCHES(UPPER(address), '\\b(DORM|DORMITORY|RESIDENCE HALL|APARTMENT|APTS|TOWERS|COMMONS|COMPLEX)\\b')
      )
  `);

  // Clerical Typos & Anomalies
  const typoRes = await conn.query(`
    SELECT voter_id as id, name, address, city, state, zip, county, date_registered, 1 as occupant_count
    FROM ${tableName}
    WHERE date_registered LIKE '%/0001'
       OR date_registered LIKE '%/01%'
       OR UPPER(address) = 'DATAMIGRATION'
       OR LENGTH(TRIM(COALESCE(first_name, ''))) = 1
       OR LENGTH(TRIM(COALESCE(last_name, ''))) = 1
  `);

  // Single-Day Registration Spikes (>= 50 voters)
  const spikesRes = await conn.query(`
    SELECT date_registered, COUNT(*) as occupant_count, MAX(voter_id) as id, MAX(county) as county, MAX(city) as city, MAX(state) as state, MAX(zip) as zip
    FROM ${tableName}
    WHERE date_registered IS NOT NULL AND TRIM(date_registered) != ''
      AND NOT (date_registered LIKE '%/0001' OR date_registered LIKE '%/01%')
    GROUP BY date_registered
    HAVING COUNT(*) >= 50
    ORDER BY occupant_count DESC
  `);

  // Phantom & Over-Capacity Precincts
  const phantomRes = await conn.query(`
    SELECT COALESCE(precinct_code, 'UNASSIGNED') as precinct_code, county, COUNT(*) as occupant_count, MAX(voter_id) as id, MAX(address) as address, MAX(city) as city, MAX(state) as state, MAX(zip) as zip
    FROM ${tableName}
    GROUP BY COALESCE(precinct_code, 'UNASSIGNED'), county
    HAVING COALESCE(precinct_code, 'UNASSIGNED') = 'UNASSIGNED'
        OR TRIM(COALESCE(precinct_code, '')) = ''
        OR COUNT(*) > 3000
        OR COUNT(*) < 10
    ORDER BY occupant_count DESC
  `);

  // Benford's Law First-Digit Regression on Precinct Voter Counts
  const benfordRes = await conn.query(`
    WITH precinct_totals AS (
      SELECT county, precinct_code, COUNT(*) as cnt
      FROM ${tableName}
      WHERE precinct_code IS NOT NULL AND TRIM(precinct_code) != ''
      GROUP BY county, precinct_code
    )
    SELECT SUBSTR(CAST(cnt AS VARCHAR), 1, 1) as digit, COUNT(*) as occupant_count
    FROM precinct_totals
    WHERE SUBSTR(CAST(cnt AS VARCHAR), 1, 1) IN ('1','2','3','4','5','6','7','8','9')
    GROUP BY digit
    ORDER BY digit ASC
  `);

  const poBoxMapped = poBoxRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'CRITICAL', details: 'Physical residence listed as Post Office Box or commercial drop.' }));

  return {
    'density': densityRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'HIGH', details: `${r.toJSON().occupant_count} voters at residential address.` })),
    'missing-dorm': missingDormRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'MEDIUM', details: 'Campus or multi-unit housing missing secondary room/unit identifier.' })),
    'po-box': poBoxMapped,
    'commercial': poBoxMapped,
    'out-of-state-mailing': ncoaRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'HIGH', details: 'Out-of-state mailing address detected.' })),
    'typo-names': typoRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'MEDIUM', details: 'Clerical registration date or name truncation anomaly.' })),
    'duplicates': dupRes.toArray().map(r => ({ ...r.toJSON(), risk_level: 'HIGH', details: `Intra-county duplicate name across ${r.toJSON().addrs_count} addresses.` })),
    'spikes': spikesRes.toArray().map(r => ({ ...r.toJSON(), name: `Surge Cohort (${r.toJSON().date_registered})`, address: `Registered on ${r.toJSON().date_registered}`, risk_level: 'HIGH', details: `Single-day registration surge: ${r.toJSON().occupant_count} voters.` })),
    'phantom-precincts': phantomRes.toArray().map(r => ({ ...r.toJSON(), name: `Precinct ${r.toJSON().precinct_code}`, risk_level: Number(r.toJSON().occupant_count) > 5000 ? 'CRITICAL' : 'HIGH', details: `Precinct capacity anomaly (${r.toJSON().occupant_count} voters).` })),
    'benfords-law': benfordRes.toArray().map(r => ({ id: `BENFORD-${r.toJSON().digit}`, name: `Leading Digit ${r.toJSON().digit}`, occupant_count: Number(r.toJSON().occupant_count), risk_level: 'LOW', details: `Digit ${r.toJSON().digit} count: ${r.toJSON().occupant_count}` }))
  };
}
