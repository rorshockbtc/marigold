import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { interpretColumnMappings, normalizeRowWithMapping, ColumnMappingSchema } from '../src/lib/csv/universalMapper';

// Authoritative 82 Mississippi Counties as named in the State voter rolls
const MISSISSIPPI_82_COUNTIES_CANONICAL = [
  'ADAMS', 'ALCORN', 'AMITE', 'ATTALA', 'BENTON', 'BOLIVAR', 'CALHOUN', 'CARROLL',
  'CHICKASAW', 'CHOCTAW', 'CLAIBORNE', 'CLARKE', 'CLAY', 'COAHOMA', 'COPIAH', 'COVINGTON',
  'DESOTO', 'FORREST', 'FRANKLIN', 'GEORGE', 'GREENE', 'GRENADA', 'HANCOCK', 'HARRISON',
  'HINDS', 'HOLMES', 'HUMPHREYS', 'ISSAQUENA', 'ITAWAMBA', 'JACKSON', 'JASPER', 'JEFFERSON',
  'JEFF DAVIS', 'JEFFERSON DAVIS', 'JONES', 'KEMPER', 'LAFAYETTE', 'LAMAR', 'LAUDERDALE', 'LAWRENCE',
  'LEAKE', 'LEE', 'LEFLORE', 'LINCOLN', 'LOWNDES', 'MADISON', 'MARION', 'MARSHALL',
  'MONROE', 'MONTGOMERY', 'NESHOBA', 'NEWTON', 'NOXUBEE', 'OKTIBBEHA', 'PANOLA',
  'PEARL RIVER', 'PERRY', 'PIKE', 'PONTOTOC', 'PRENTISS', 'QUITMAN', 'RANKIN', 'SCOTT',
  'SHARKEY', 'SIMPSON', 'SMITH', 'STONE', 'SUNFLOWER', 'TALLAHATCHIE', 'TATE', 'TIPPAH',
  'TISHOMINGO', 'TUNICA', 'UNION', 'WALTHALL', 'WARREN', 'WASHINGTON', 'WAYNE', 'WEBSTER',
  'WILKINSON', 'WINSTON', 'YALOBUSHA', 'YAZOO'
];
const CANONICAL_COUNTIES_SET = new Set(MISSISSIPPI_82_COUNTIES_CANONICAL);

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details: string) {
  if (condition) {
    results.push({ name, passed: true, details });
  } else {
    results.push({ name, passed: false, details: `FAILED: ${details}` });
    console.error(`❌ [ASSERTION FAILED] ${name}: ${details}`);
  }
}

// =========================================================================
// SECTION 1: Adversarial & Dirty Header Stress Testing
// =========================================================================
console.log('--- SECTION 1: Testing Adversarial & Dirty Headers ---');

const baseHeaders = [
  'Mapping Value', 'FIRST_NAME', 'MIDDLE_NAME', 'LAST_NAME', 'SUFFIX',
  'RESIDENTIAL_ADDRESS', 'HOUSE_NUM', 'STREET_NAME', 'STREET_TYPE',
  'PRE-DIRECTION', 'POST-DIRECTION', 'RES_CITY', 'RES_STATE', 'RES_ZIP_CODE',
  'RES_COUNTY', 'PRECINCT_CODE', 'PRECINCT_NAME', 'MAILING_ADDRESS',
  'MAIL_CITY', 'MAIL_STATE', 'MAIL_ZIP_CODE', 'EFFECTIVE_REGN_DATE',
  'STATUS', 'DATE_VOTED', 'US', 'MS', 'CONG', 'SC', 'PSC', 'TC',
  'DA', 'SEN', 'REP', 'CA', 'CHC', 'CIR', 'CNT', 'LEV', 'COCT',
  'JUD', 'SCHC', 'SCIR', 'SUP', 'SUPR', 'EC', 'JC', 'JCJ', 'CON',
  'MUN', 'WARD', 'WARDP', 'MP', 'SCHD', 'SCHB', 'SBAL', 'FIRE',
  'FCD', 'WSD', 'IPD'
];

// Test 1.1: Standard Mississippi Headers Exact Resolution
const mapping1 = interpretColumnMappings(baseHeaders);
assert(mapping1.voter_id === 'Mapping Value', 'Standard: voter_id mapping', `Expected 'Mapping Value', got '${mapping1.voter_id}'`);
assert(mapping1.county === 'RES_COUNTY', 'Standard: county mapping', `Expected 'RES_COUNTY', got '${mapping1.county}'`);
assert(mapping1.zip === 'RES_ZIP_CODE', 'Standard: zip mapping', `Expected 'RES_ZIP_CODE', got '${mapping1.zip}'`);
assert(mapping1.date_registered === 'EFFECTIVE_REGN_DATE', 'Standard: date_registered mapping', `Expected 'EFFECTIVE_REGN_DATE', got '${mapping1.date_registered}'`);
assert(mapping1.precinct_code === 'PRECINCT_CODE', 'Standard: precinct_code mapping', `Expected 'PRECINCT_CODE', got '${mapping1.precinct_code}'`);
assert(mapping1.street_name === 'STREET_NAME', 'Standard: street_name mapping', `Expected 'STREET_NAME', got '${mapping1.street_name}'`);

// Test 1.2: Adversarial Variations of Mapping Value Header
const adversarialIdHeaders = [
  'mapping value',
  'MAPPING VALUE',
  '  mapping   value  ',
  '\tMapping Value\r\n',
  '\uFEFFMapping Value',
  'mapping_value',
  'Mapping-Value',
  'Mapping.Value',
  'mapping val',
  'MappingVal',
  'MAPPINGVALUE',
  'sos_voter_id',
  'Voter ID',
  'voter_registration_number'
];

for (const dirtyId of adversarialIdHeaders) {
  const testHeaders = baseHeaders.map(h => h === 'Mapping Value' ? dirtyId : h);
  const m = interpretColumnMappings(testHeaders);
  assert(m.voter_id === dirtyId, `Adversarial ID Header: "${dirtyId}"`, `Expected '${dirtyId}', got '${m.voter_id}'`);
}

// Test 1.3: Column Order Inversion & STREET_NAME Precedence Collision
const invertedHeaders = [...baseHeaders].reverse();
const mInverted = interpretColumnMappings(invertedHeaders);
assert(mInverted.voter_id === 'Mapping Value', 'Inverted Order: voter_id mapping', `Expected 'Mapping Value', got '${mInverted.voter_id}'`);
assert(mInverted.street_name === 'STREET_NAME', 'Inverted Order: street_name mapping', `Expected 'STREET_NAME', got '${mInverted.street_name}'`);
assert(mInverted.voter_id !== mInverted.street_name, 'No Collision between voter_id and street_name', `voter_id and street_name both mapped to '${mInverted.voter_id}'`);

// Test 1.4: Adversarial Distractor Columns
const distractorHeaders = [
  'VOTER_STREET_NAME',
  'STREET_NAME',
  'RESIDENTIAL_STREET',
  'RESIDENTIAL_ADDRESS',
  'Mapping Value',
  'MAPPING_NOTE',
  'ID_CARD_EXPIRATION',
  'HOUSE_NUM',
  'RES_COUNTY',
  'PRECINCT_CODE'
];
const mDistractor = interpretColumnMappings(distractorHeaders);
assert(mDistractor.voter_id === 'Mapping Value', 'Distractor Columns: voter_id mapping', `Expected 'Mapping Value', got '${mDistractor.voter_id}'`);
assert(mDistractor.street_name === 'STREET_NAME', 'Distractor Columns: street_name mapping', `Expected 'STREET_NAME', got '${mDistractor.street_name}'`);
assert(mDistractor.house_num === 'HOUSE_NUM', 'Distractor Columns: house_num mapping', `Expected 'HOUSE_NUM', got '${mDistractor.house_num}'`);

// Test 1.5: Dirty variations of county, zip, precinct_code, date_registered
const dirtyVariations = [
  { header: '  res_county  ', expectedField: 'county' },
  { header: 'RES.COUNTY', expectedField: 'county' },
  { header: 'residential_county', expectedField: 'county' },
  { header: ' RES_ZIP_CODE ', expectedField: 'zip' },
  { header: 'res-zip-code', expectedField: 'zip' },
  { header: 'EFFECTIVE-REGN-DATE', expectedField: 'date_registered' },
  { header: 'effective_regn_date', expectedField: 'date_registered' },
  { header: ' PRECINCT_CODE ', expectedField: 'precinct_code' },
  { header: 'precinct_code', expectedField: 'precinct_code' }
];

for (const { header, expectedField } of dirtyVariations) {
  const customHeaders = ['Mapping Value', header, 'STREET_NAME'];
  const m = interpretColumnMappings(customHeaders);
  assert(
    (m as any)[expectedField] === header,
    `Dirty Header: "${header}" -> ${expectedField}`,
    `Expected '${header}' for ${expectedField}, got '${(m as any)[expectedField]}'`
  );
}

// Test 1.6: Normalization without explicit mapping object (Auto-interpretation)
const sampleDirtyRow: Record<string, any> = {
  '\uFEFFMapping Value': '1234567890',
  'FIRST_NAME': '  .JOHN  ',
  'LAST_NAME': '#.DOE  ',
  'STREET_NAME': 'MAIN ST',
  'HOUSE_NUM': '100',
  'RES_COUNTY': 'Hinds',
  'RES_ZIP_CODE': '39201',
  'PRECINCT_CODE': '        05B  ',
  'EFFECTIVE_REGN_DATE': '10/12/2020',
  'STATUS': 'Active'
};

const norm1 = normalizeRowWithMapping(sampleDirtyRow);
assert(norm1.voter_id === '1234567890', 'Auto-norm: voter_id resolved', `Expected '1234567890', got '${norm1.voter_id}'`);
assert(norm1.voter_id !== 'MAIN ST', 'Auto-norm: voter_id is NOT street name', `voter_id was '${norm1.voter_id}'`);
assert(norm1.voter_id !== 'N/A (Unlisted)', 'Auto-norm: voter_id is NOT unlisted', `voter_id was 'N/A (Unlisted)'`);
assert(norm1.first_name === 'JOHN', 'Auto-norm: first_name clerical prefix stripped', `Expected 'JOHN', got '${norm1.first_name}'`);
assert(norm1.last_name === 'DOE', 'Auto-norm: last_name clerical prefix stripped', `Expected 'DOE', got '${norm1.last_name}'`);
assert(norm1.precinct_code === '05B', 'Auto-norm: precinct_code trimmed', `Expected '05B', got '${norm1.precinct_code}'`);
assert(norm1.county === 'Hinds County', 'Auto-norm: county normalized', `Expected 'Hinds County', got '${norm1.county}'`);

// =========================================================================
// SECTION 2: Multi-Chunk Real Row Sampling from Mississippi Voter Roll
// =========================================================================
console.log('\n--- SECTION 2: Multi-Chunk Sampling from Weekly Distribution CSV ---');

const csvPath = path.resolve(
  __dirname,
  '../mississippi voter files most recent Octoer 2026/Weekly Distribution_kkirkpatrick_10262026_94.csv'
);

if (!fs.existsSync(csvPath)) {
  console.error(`CSV file not found at: ${csvPath}`);
  process.exit(1);
}

// Define 5 distinct chunks across the 2,112,460 rows:
const CHUNK_RANGES = [
  { name: 'Chunk 1 (Beginning, rows 1 - 5,000)', start: 2, end: 5001 },
  { name: 'Chunk 2 (Quarter mark, rows 500,000 - 505,000)', start: 500000, end: 505000 },
  { name: 'Chunk 3 (Midpoint, rows 1,000,000 - 1,005,000)', start: 1000000, end: 1005000 },
  { name: 'Chunk 4 (Three-quarter, rows 1,500,000 - 1,505,000)', start: 1500000, end: 1505000 },
  { name: 'Chunk 5 (End of roll, rows 2,107,000 - 2,112,461)', start: 2107000, end: 2112461 }
];

async function runRealDataSamplingStressTest() {
  const fileStream = fs.createReadStream(csvPath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineIndex = 0;
  let headers: string[] = [];
  let mapping: ColumnMappingSchema | null = null;

  let totalRowsTested = 0;
  let unlistedVoterIdCount = 0;
  let streetNameVoterIdCount = 0;
  let nonNumericVoterIdCount = 0;
  let untrimmedPrecinctCodeCount = 0;
  let dirtyNamePrefixCount = 0;
  let invalidCountyCount = 0;
  let missingDateRegCount = 0;

  const observedCanonicalCounties = new Set<string>();
  const chunkCounts: Record<string, number> = {};

  console.log('Streaming and testing multi-chunk samples...');

  for await (const line of rl) {
    lineIndex++;

    if (lineIndex === 1) {
      headers = line.split(',').map(h => h.trim());
      if (headers[headers.length - 1] === '') {
        headers.pop();
      }
      mapping = interpretColumnMappings(headers);
      console.log(`Parsed ${headers.length} headers. voter_id mapped to: '${mapping.voter_id}'`);
      continue;
    }

    const activeChunk = CHUNK_RANGES.find(c => lineIndex >= c.start && lineIndex <= c.end);
    if (!activeChunk) {
      continue;
    }

    if (!line.trim()) continue;

    chunkCounts[activeChunk.name] = (chunkCounts[activeChunk.name] || 0) + 1;
    totalRowsTested++;

    const cols = line.split(',');
    const rawRow: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      rawRow[headers[i]] = cols[i] !== undefined ? cols[i] : '';
    }

    const standardized = normalizeRowWithMapping(rawRow, mapping!);

    // Check 1: voter_id MUST NOT be "N/A (Unlisted)"
    if (standardized.voter_id === 'N/A (Unlisted)' || standardized.voter_id === 'UNKNOWN' || !standardized.voter_id) {
      unlistedVoterIdCount++;
    }

    // Check 2: voter_id MUST NOT be a street name or address
    const streetName = (rawRow['STREET_NAME'] || '').trim();
    const address = (rawRow['RESIDENTIAL_ADDRESS'] || '').trim();
    if (
      (streetName && standardized.voter_id.toUpperCase() === streetName.toUpperCase()) ||
      (address && standardized.voter_id.toUpperCase() === address.toUpperCase())
    ) {
      streetNameVoterIdCount++;
    }

    // Check 3: voter_id format check (Mississippi voter IDs are strictly numeric, 1 to 12 digits)
    if (!/^\d+$/.test(standardized.voter_id)) {
      nonNumericVoterIdCount++;
    }

    // Check 4: precinct_code MUST NOT have leading/trailing whitespace
    if (standardized.precinct_code !== standardized.precinct_code.trim() || standardized.precinct_code.startsWith(' ')) {
      untrimmedPrecinctCodeCount++;
    }

    // Check 5: first_name and last_name MUST NOT have leading periods or clerical prefixes
    if (/^[.\s*#]/.test(standardized.first_name) || /^[.\s*#]/.test(standardized.last_name)) {
      dirtyNamePrefixCount++;
    }

    // Check 6: County normalization resolves to one of the 82 Mississippi counties
    const baseCounty = standardized.county.replace(/\s+County$/i, '').trim().toUpperCase();
    if (!CANONICAL_COUNTIES_SET.has(baseCounty)) {
      invalidCountyCount++;
    } else {
      observedCanonicalCounties.add(baseCounty);
    }

    // Check 7: Date registered
    const rawDate = (rawRow['EFFECTIVE_REGN_DATE'] || '').trim();
    if (rawDate && !standardized.date_registered) {
      missingDateRegCount++;
    }

    if (totalRowsTested % 5000 === 0) {
      console.log(`  Processed ${totalRowsTested} real voter rows... (Current: line ${lineIndex})`);
    }
  }

  console.log(`\nSampling completed. Total rows verified: ${totalRowsTested}`);
  for (const [chunk, count] of Object.entries(chunkCounts)) {
    console.log(`  - ${chunk}: ${count} rows`);
  }
  console.log(`Distinct canonical Mississippi counties observed in sample: ${observedCanonicalCounties.size} / 82`);

  // Assertions on real data results
  assert(totalRowsTested >= 25000, 'Sampling volume', `Sampled ${totalRowsTested} rows (target >= 25,000)`);
  assert(unlistedVoterIdCount === 0, 'Zero "N/A (Unlisted)" voter IDs', `Found ${unlistedVoterIdCount} unlisted voter IDs`);
  assert(streetNameVoterIdCount === 0, 'Zero voter IDs normalized to street names', `Found ${streetNameVoterIdCount} voter IDs matching street names`);
  assert(nonNumericVoterIdCount === 0, '100% valid voter ID format (numeric ^\\d+$)', `Found ${nonNumericVoterIdCount} non-numeric voter IDs`);
  assert(untrimmedPrecinctCodeCount === 0, 'Zero untrimmed precinct codes', `Found ${untrimmedPrecinctCodeCount} padded precinct codes`);
  assert(dirtyNamePrefixCount === 0, 'Zero dirty name prefixes', `Found ${dirtyNamePrefixCount} names with dirty prefixes`);
  assert(invalidCountyCount === 0, '100% valid Mississippi county resolution', `Found ${invalidCountyCount} unmapped or invalid counties`);
  assert(missingDateRegCount === 0, 'Zero missing registration dates when present in source', `Found ${missingDateRegCount} unmapped registration dates`);
  assert(observedCanonicalCounties.size >= 75, 'Wide geographical county distribution (>= 75 counties in sample)', `Observed ${observedCanonicalCounties.size} distinct counties in sample`);

  // Print Summary
  console.log('\n=======================================================');
  console.log('               STRESS TEST SUMMARY');
  console.log('=======================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`Total Assertions: ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.log('\nFailed Tests:');
    for (const f of results.filter(r => !r.passed)) {
      console.log(`  ❌ ${f.name}: ${f.details}`);
    }
    process.exit(1);
  } else {
    console.log('\n✅ ALL ADVERSARIAL AND EMPIRICAL REAL-ROW TESTS PASSED CLEANLY.');
    process.exit(0);
  }
}

runRealDataSamplingStressTest().catch(err => {
  console.error('Stress test script crashed:', err);
  process.exit(1);
});
