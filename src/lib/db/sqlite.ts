import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let isInitialized = false;
let dbInstance: Database.Database | null = null;

// Helper to get DB connection with caching to prevent sluggish page navigation
export function getDb() {
  if (dbInstance) return dbInstance;

  const dbPath = path.resolve(process.cwd(), 'voters.db');
  
  if (!fs.existsSync(dbPath)) {
    return null;
  }
  
  dbInstance = new Database(dbPath);
  const db = dbInstance;
  
  if (!isInitialized) {
    // Ensure all necessary tables exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS playbooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        audit_type TEXT NOT NULL,
        threshold INTEGER DEFAULT 12,
        county TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS exclusion_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_type TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_feedback_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_type TEXT NOT NULL,
        predicted_accuracy INTEGER NOT NULL,
        user_feedback TEXT NOT NULL, -- 'met', 'failed', 'exceeded'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_voters_county_address ON voters(county, address);
      CREATE INDEX IF NOT EXISTS idx_voters_names ON voters(last_name, first_name);
      CREATE INDEX IF NOT EXISTS idx_voters_zip ON voters(zip);
      CREATE INDEX IF NOT EXISTS idx_voters_address ON voters(address);

      -- Clean up any legacy out-of-state cartridges
      DELETE FROM playbooks WHERE name LIKE '%Cartridge%' OR name LIKE '%MN %' OR name LIKE '%GA %' OR name LIKE '%TX %';
    `);

    // Ensure Mississippi and North Carolina mission playbooks exist
    const defaults = [
      ['[MS Mission] Hinds County High-Density Residential (>12)', 'density', 12, 'Hinds'],
      ['[MS Mission] DeSoto County Registration Spikes', 'spikes', 0, 'DeSoto'],
      ['[MS Mission] Harrison County Commercial P.O. Box Disguise', 'po-box', 0, 'Harrison'],
      ['[MS Mission] Statewide NCOA Interstate Relocation', 'out-of-state-mailing', 0, ''],
      ['[MS Mission] Madison County Intra-County Duplicates', 'duplicates', 0, 'Madison'],
      ['[MS Mission] Rankin County Missing Unit / Dorm Filter', 'missing-dorm', 50, 'Rankin'],
      ['[MS Mission] Jackson County Clerical Typo Names', 'typo-names', 0, 'Jackson'],
      ['[MS Mission] Lee County Phantom Precincts Check', 'phantom-precincts', 0, 'Lee'],
      ['[NC Mission] Wake County High-Density Occupancy (>15)', 'density', 15, 'Wake'],
      ['[NC Mission] Mecklenburg County Registration Spikes', 'spikes', 0, 'Mecklenburg'],
      ['[NC Mission] Guilford County Commercial P.O. Box Disguise', 'po-box', 0, 'Guilford'],
      ['[NC Mission] Statewide NCOA Interstate Address Mismatch', 'out-of-state-mailing', 0, ''],
      ['[Voting Rights] Urban Precinct Overcrowding & Line Bottlenecks', 'phantom-precincts', 0, 'Statewide'],
      ['[Voting Rights] Campus Housing / Dormitory Verification Audit', 'missing-dorm', 25, 'Statewide'],
      ['[Voting Rights] Sudden Inactive Status & Voter Purge Surge', 'spikes', 0, 'Statewide'],
      ['[Quantile Model] Interquartile Range (IQR) Extreme Occupancy', 'density', 15, 'Statewide'],
      ['[Quantile Model] Poisson Probability Daily Surge Check', 'spikes', 0, 'Statewide'],
      ['[Good Governance] Pending / Suspense Status Processing Bottleneck', 'spikes', 0, 'Statewide'],
      ['[Good Governance] Clean Intra-State Relocation & Duplicate Merge', 'duplicates', 0, 'Statewide']
    ];
    const checkStmt = db.prepare("SELECT COUNT(*) as c FROM playbooks WHERE name = ?");
    const insertStmt = db.prepare(`INSERT INTO playbooks (name, audit_type, threshold, county) VALUES (?, ?, ?, ?)`);
    
    db.transaction(() => {
      for (const item of defaults) {
        const res = checkStmt.get(item[0]) as { c: number };
        if (res.c === 0) {
          insertStmt.run(item[0], item[1], item[2], item[3]);
        }
      }
    })();
    
    isInitialized = true;
  }

  return db;
}

export interface VoterRecord {
  id: number;
  voter_id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  status: string;
  ncoa_flag: string;
  date_registered: string;
}

export function getStats() {
  const db = getDb();
  if (!db) return null;

  const total = db.prepare('SELECT COUNT(*) as count FROM voters').get() as { count: number };
  const ncoa = db.prepare("SELECT COUNT(*) as count FROM voters WHERE ncoa_flag != ''").get() as { count: number };
  
  return {
    totalRecords: total.count,
    ncoaFlags: ncoa.count
  };
}

// ---- PLAYBOOK & EXCLUSION LOGIC ----

export function savePlaybook(name: string, auditType: string, threshold: number, county: string) {
  const db = getDb();
  if (!db) return false;
  db.prepare(`INSERT INTO playbooks (name, audit_type, threshold, county) VALUES (?, ?, ?, ?)`).run(name, auditType, threshold, county);
  return true;
}

export function getPlaybooks() {
  const db = getDb();
  if (!db) return [];
  return db.prepare(`SELECT * FROM playbooks ORDER BY created_at DESC`).all();
}

export function addExclusion(auditType: string, value: string) {
  const db = getDb();
  if (!db) return false;
  db.prepare(`INSERT INTO exclusion_list (audit_type, value) VALUES (?, ?)`).run(auditType, value);
  return true;
}

// ---- ACCURACY PREDICTION & FEEDBACK LOOP ----

export function addAuditFeedback(auditType: string, predictedAccuracy: number, feedback: string) {
  const db = getDb();
  if (!db) return false;
  db.prepare(`INSERT INTO audit_feedback_log (audit_type, predicted_accuracy, user_feedback) VALUES (?, ?, ?)`).run(auditType, predictedAccuracy, feedback);
  return true;
}

export function getAuditAccuracy(auditType: string) {
  const db = getDb();
  if (!db) return 75; // Default baseline

  const logs = db.prepare(`SELECT user_feedback FROM audit_feedback_log WHERE audit_type = ? ORDER BY created_at DESC LIMIT 50`).all(auditType) as { user_feedback: string }[];
  
  let accuracy = 75; // Baseline
  
  for (const log of logs) {
    if (log.user_feedback === 'exceeded') accuracy += 2;
    if (log.user_feedback === 'failed') accuracy -= 3;
    if (log.user_feedback === 'met') accuracy += 0.5;
  }
  
  // Bound the accuracy between 10% and 99%
  return Math.max(10, Math.min(99, Math.round(accuracy)));
}

export function getFeedbackLogs() {
  const db = getDb();
  if (!db) return [];
  return db.prepare(`SELECT audit_type, user_feedback, created_at FROM audit_feedback_log ORDER BY created_at DESC LIMIT 20`).all();
}

// ---- ANOMALY ALGORITHMS ----

export function findHighDensityAddresses(threshold = 12, county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT address, city, state, zip, county, COUNT(*) as occupant_count
    FROM voters
    WHERE address != '' ${countyFilter}
      AND status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'density')
    GROUP BY address, city, state, zip, county
    HAVING COUNT(*) > ?
    ORDER BY occupant_count DESC
    LIMIT 50
  `).all(threshold);

  return rows;
}

export function findMissingDormNumbers(threshold = 50, county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT address, city, state, zip, county, COUNT(*) as occupant_count
    FROM voters
    WHERE address != '' ${countyFilter}
      AND status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND address NOT LIKE '%APT%' 
      AND address NOT LIKE '%ROOM%' 
      AND address NOT LIKE '%RM%' 
      AND address NOT LIKE '%UNIT%' 
      AND address NOT LIKE '%STE%' 
      AND address NOT LIKE '%#%'
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'missing-dorm')
    GROUP BY address, city, state, zip, county
    HAVING COUNT(*) > ?
    ORDER BY occupant_count DESC
    LIMIT 50
  `).all(threshold);

  return rows;
}

export function findPOBoxResidences(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT address, city, state, zip, county, COUNT(*) as occupant_count
    FROM voters
    WHERE (address LIKE '%P O BOX%' OR address LIKE '%PO BOX%' OR address LIKE '%P.O. BOX%' OR address LIKE '%POST OFFICE BOX%' OR address LIKE '%UPS STORE%' OR address LIKE '%PMB%' OR address LIKE '%FEDEX%' OR address LIKE '%MAILBOX%' OR address LIKE '%BOX #%' OR address LIKE '%BOX NO%') ${countyFilter}
      AND status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'po-box')
    GROUP BY address, city, state, zip, county
    ORDER BY occupant_count DESC
    LIMIT 50
  `).all();

  return rows;
}

export function findTypoNames(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT first_name, last_name, address, city, county
    FROM voters
    WHERE (length(first_name) = 1 OR length(last_name) = 1) 
      AND first_name != '' 
      AND last_name != '' ${countyFilter}
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'typo-names')
    LIMIT 50
  `).all();

  return rows;
}

export function findIntraCountyDuplicates(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND a.county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT a.first_name, a.last_name, a.zip, a.county, a.address as address1, b.address as address2
    FROM voters a
    JOIN voters b ON a.first_name = b.first_name 
                 AND a.last_name = b.last_name 
                 AND a.zip = b.zip
    WHERE a.address != b.address AND a.id < b.id ${countyFilter}
      AND a.status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND b.status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND a.address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'duplicates')
    LIMIT 50
  `).all();

  return rows;
}

export function findCommercialAddresses(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT address, city, state, zip, county, COUNT(*) as occupant_count
    FROM voters
    WHERE (address LIKE '%STE %' OR address LIKE '%SUITE %' OR address LIKE '%BLDG %' OR address LIKE '%BUILDING%' OR address LIKE '%FL %' OR address LIKE '%FLOOR%' OR address LIKE '%COMMERCIAL%' OR address LIKE '%OFFICE%' OR address LIKE '%PLAZA%' OR address LIKE '%CTR %' OR address LIKE '%CENTER%' OR address LIKE '%MALL%' OR address LIKE '%WAREHOUSE%' OR address LIKE '%INDUSTRIAL%')
      AND address NOT LIKE '%APT%' ${countyFilter}
      AND status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'commercial')
    GROUP BY address, city, state, zip, county
    HAVING COUNT(*) > 2
    ORDER BY occupant_count DESC
    LIMIT 50
  `).all();

  return rows;
}

export function findRegistrationSpikes(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT date_registered, county, COUNT(*) as registrations
    FROM voters
    WHERE date_registered != '' AND date_registered IS NOT NULL ${countyFilter}
      AND status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND date_registered NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'spikes')
    GROUP BY date_registered, county
    HAVING COUNT(*) > 25
    ORDER BY registrations DESC
    LIMIT 50
  `).all();

  return rows;
}

export function findPhantomPrecincts(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT first_name, last_name, address, city, county, status
    FROM voters
    WHERE status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE') AND (precinct_code = '' OR precinct_code IS NULL OR precinct_code = '0' OR UPPER(precinct_code) = 'UNASSIGNED') ${countyFilter}
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'phantom-precincts')
    LIMIT 50
  `).all();

  return rows;
}

export function findOutOfStateMailing(county = '') {
  const db = getDb();
  if (!db) return [];

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT first_name, last_name, address, city, county, mail_state
    FROM voters
    WHERE mail_state != '' AND mail_state IS NOT NULL AND mail_state != state AND mail_state NOT IN ('NONE', 'NULL', 'NA', 'N/A', 'SAME') ${countyFilter}
      AND status NOT IN ('I', 'INACTIVE', 'C', 'CANCELLED', 'CANCELED', 'P', 'PURGED', 'D', 'DENIED', 'REMOVED', 'R', 'DECEASED', 'INACT', 'S', 'SUSPENSE')
      AND address NOT IN (SELECT value FROM exclusion_list WHERE audit_type = 'out-of-state-mailing')
    LIMIT 50
  `).all();

  return rows;
}

export function analyzeBenfordsLaw(county = '') {
  const db = getDb();
  if (!db) return null;

  const countyFilter = county ? `AND county = '${county.replace(/'/g, "''")}'` : '';
  const rows = db.prepare(`
    SELECT address
    FROM voters
    WHERE address != '' ${countyFilter}
  `).all() as { address: string }[];

  const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0 };
  let total = 0;

  for (const row of rows) {
    // Extract the first digit (1-9) from the address
    const match = row.address.match(/^[^\d]*([1-9])/);
    if (match) {
      counts[match[1]]++;
      total++;
    }
  }

  if (total === 0) return null;

  const expectedPercentages: Record<string, number> = {
    '1': 30.1, '2': 17.6, '3': 12.5, '4': 9.7, '5': 7.9, '6': 6.7, '7': 5.8, '8': 5.1, '9': 4.6
  };

  const results = [];
  let totalVariance = 0;

  for (let i = 1; i <= 9; i++) {
    const digit = i.toString();
    const actualCount = counts[digit];
    const actualPercentage = (actualCount / total) * 100;
    const expectedPercentage = expectedPercentages[digit];
    const variance = Math.abs(actualPercentage - expectedPercentage);
    totalVariance += variance;

    results.push({
      digit,
      actualCount,
      actualPercentage: parseFloat(actualPercentage.toFixed(2)),
      expectedPercentage: expectedPercentage,
      variance: parseFloat(variance.toFixed(2))
    });
  }

  const meanAbsoluteError = totalVariance / 9;
  
  let conclusion = "Normal Distribution (Follows Benford's Law)";
  if (meanAbsoluteError > 2) conclusion = 'Suspicious Distribution (Possible Fabrication)';
  if (meanAbsoluteError > 5) conclusion = 'Highly Anomalous (Likely Fabricated Data)';

  return {
    totalRecordsAnalyzed: total,
    meanAbsoluteError: parseFloat(meanAbsoluteError.toFixed(2)),
    conclusion,
    distribution: results
  };
}
