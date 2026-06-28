import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import Database from 'better-sqlite3';

// Initialize the SQLite Database
const dbPath = path.resolve(process.cwd(), 'voters.db');
const db = new Database(dbPath);

console.log(`[INFO] Connected to SQLite Database at ${dbPath}`);

// Setup the Table Schema
db.exec(`
  DROP TABLE IF EXISTS voters;
  CREATE TABLE IF NOT EXISTS voters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voter_id TEXT,
    first_name TEXT,
    last_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    county TEXT,
    status TEXT,
    ncoa_flag TEXT,
    date_registered TEXT
  );
`);

// Optimize for bulk inserts
db.pragma('journal_mode = WAL');
db.pragma('synchronous = OFF');

// Prepare the bulk insert statement
// Note: We use dynamic mapping depending on how messy the CSV headers are.
// We'll insert a raw JSON string if we can't figure it out, or map standard columns.
const insert = db.prepare(`
  INSERT INTO voters (
    first_name, last_name, address, city, state, zip, county, status, ncoa_flag
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Wrap the insert in a transaction for extreme performance
const insertMany = db.transaction((records: any[]) => {
  for (const row of records) {
    insert.run(
      row.FIRST_NAME || row.first_name || row.FirstName || row.first || '',
      row.LAST_NAME || row.last_name || row.LastName || row.last || '',
      row.RESIDENTIAL_ADDRESS || row.address || row.Address || row.street || '',
      row.RES_CITY || row.city || row.City || '',
      row.RES_STATE || row.state || row.State || '',
      row.RES_ZIP_CODE || row.zip || row.ZipCode || row.zipcode || '',
      row.RES_COUNTY || row.county || row.County || '',
      row.STATUS || row.status || row.VoterStatus || '',
      row.NCOA || row.ncoa_flag || row.ncoa || ''
    );
  }
});

async function runIngestion(csvFilePath: string) {
  if (!fs.existsSync(csvFilePath)) {
    console.error(`[ERROR] File not found at ${csvFilePath}`);
    return;
  }

  console.log(`[INFO] Starting ingestion of ${csvFilePath}...`);

  let batch: any[] = [];
  const BATCH_SIZE = 10000;
  let totalProcessed = 0;

  const stream = fs.createReadStream(csvFilePath).pipe(csv({ 
    quote: '\x01',
    escape: '\x01'
  }));

  for await (const row of stream) {
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      totalProcessed += batch.length;
      console.log(`[INFO] Processed ${totalProcessed} rows...`);
      batch = [];
    }
  }

  // Insert any remaining records
  if (batch.length > 0) {
    insertMany(batch);
    totalProcessed += batch.length;
  }

  console.log(`[INFO] Building database indexes for ultra-fast queries...`);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_voters_county_address ON voters(county, address);
    CREATE INDEX IF NOT EXISTS idx_voters_names ON voters(last_name, first_name);
    CREATE INDEX IF NOT EXISTS idx_voters_zip ON voters(zip);
    CREATE INDEX IF NOT EXISTS idx_voters_address ON voters(address);
  `);

  console.log(`[SUCCESS] Ingestion and indexing complete. Total records inserted: ${totalProcessed}`);
}

// In Next.js/Node scripts, we run this directly if invoked
const args = process.argv.slice(2);
const inputPath = args[0] || 'PLEASE_PROVIDE_PATH';

if (inputPath === 'PLEASE_PROVIDE_PATH') {
  console.log("Usage: npx ts-node src/scripts/ingest.ts /absolute/path/to/voter_data.csv");
} else {
  runIngestion(inputPath).catch(console.error);
}
