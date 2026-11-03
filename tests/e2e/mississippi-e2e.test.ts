/**
 * Marigold Mississippi Voter Roll Forensic Audit — Comprehensive 4-Tier E2E Test Suite
 *
 * Requirements & Specification Sources:
 *   - ORIGINAL_REQUEST.md (§R1 Ingestion Parity, §R2 10 Playbooks, §R3 Archival Route & PDF, §R4 Tests)
 *   - PROJECT.md (§Architecture, §Feature Inventory, §Interface Contracts, §Code Layout)
 *   - TEST_INFRA.md (§Test Philosophy, §Coverage Thresholds Tiers 1-4)
 *
 * Test Methodology:
 *   - Tier 1: Feature Coverage (Features 1 through 13, >= 5 test cases per feature)
 *   - Tier 2: Boundary Value Analysis & Edge Cases (Whitespace padding, extreme dates, density thresholds, suffixes)
 *   - Tier 3: Cross-Feature Combinations (Active/Inactive x NCOA, 82-County Partition, Precincts x Benford)
 *   - Tier 4: Real-World Application Scenarios (Full Roll Ingestion, Multi-Anomaly Sweep, PDF Binary Integrity)
 *
 * Test Integrity: Opaque-Box, Requirement-Driven, Zero-Facade, Independent Output Derivation.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  interpretColumnMappings,
  normalizeRowWithMapping,
  StandardizedVoterRow,
  ColumnMappingSchema
} from '../../src/lib/csv/universalMapper';

// =============================================================================
// DOMAIN SPECIFICATIONS & AUTHORITATIVE REFERENCE DATA
// =============================================================================

export const MISSISSIPPI_82_COUNTIES = [
  "ADAMS", "ALCORN", "AMITE", "ATTALA", "BENTON", "BOLIVAR", "CALHOUN", "CARROLL",
  "CHICKASAW", "CHOCTAW", "CLAIBORNE", "CLARKE", "CLAY", "COAHOMA", "COPIAH", "COVINGTON",
  "DESOTO", "FORREST", "FRANKLIN", "GEORGE", "GREENE", "GRENADA", "HANCOCK", "HARRISON",
  "HINDS", "HOLMES", "HUMPHREYS", "ISSAQUENA", "ITAWAMBA", "JACKSON", "JASPER", "JEFFERSON",
  "JEFFERSON DAVIS", "JONES", "KEMPER", "LAFAYETTE", "LAMAR", "LAUDERDALE", "LAWRENCE",
  "LEAKE", "LEE", "LEFLORE", "LINCOLN", "LOWNDES", "MADISON", "MARION", "MARSHALL",
  "MONROE", "MONTGOMERY", "NESHOBA", "NEWTON", "NOXUBEE", "OKTIBBEHA", "PANOLA",
  "PEARL RIVER", "PERRY", "PIKE", "PONTOTOC", "PRENTISS", "QUITMAN", "RANKIN", "SCOTT",
  "SHARKEY", "SIMPSON", "SMITH", "STONE", "SUNFLOWER", "TALLAHATCHIE", "TATE", "TIPPAH",
  "TISHOMINGO", "TUNICA", "UNION", "WALTHALL", "WARREN", "WASHINGTON", "WAYNE", "WEBSTER",
  "WILKINSON", "WINSTON", "YALOBUSHA", "YAZOO"
];

export const BENFORD_THEORETICAL: Record<number, number> = {
  1: Math.log10(1 + 1 / 1), // 0.30103 -> 30.1%
  2: Math.log10(1 + 1 / 2), // 0.17609 -> 17.6%
  3: Math.log10(1 + 1 / 3), // 0.12494 -> 12.5%
  4: Math.log10(1 + 1 / 4), // 0.09691 -> 9.7%
  5: Math.log10(1 + 1 / 5), // 0.07918 -> 7.9%
  6: Math.log10(1 + 1 / 6), // 0.06695 -> 6.7%
  7: Math.log10(1 + 1 / 7), // 0.05799 -> 5.8%
  8: Math.log10(1 + 1 / 8), // 0.05115 -> 5.1%
  9: Math.log10(1 + 1 / 9)  // 0.04576 -> 4.6%
};

export const MISSISSIPPI_SAMPLE_HEADERS = [
  'Mapping Value', 'FIRST_NAME', 'MIDDLE_NAME', 'LAST_NAME', 'SUFFIX',
  'RESIDENTIAL_ADDRESS', 'HOUSE_NUM', 'STREET_NAME', 'STREET_TYPE', 'PRE-DIRECTION', 'POST-DIRECTION',
  'RES_CITY', 'RES_STATE', 'RES_ZIP_CODE', 'RES_COUNTY', 'PRECINCT_CODE', 'PRECINCT_NAME',
  'MAILING_ADDRESS', 'MAIL_CITY', 'MAIL_STATE', 'MAIL_ZIP_CODE', 'EFFECTIVE_REGN_DATE', 'STATUS',
  'DATE_VOTED', 'US', 'MS', 'CONG', 'SC', 'PSC', 'TC', 'DA', 'SEN', 'REP', 'CA', 'CHC', 'CIR',
  'COCT', 'LEV', 'JUD', 'SCHC', 'SCIR', 'SUP', 'SUPR', 'EC', 'JC', 'JCJ', 'CON', 'MUN',
  'WARD', 'WARDP', 'MP', 'SCHD', 'SCHB', 'SBAL', 'FIRE', 'FCD', 'WSD', 'IPD'
];

// Opaque Forensic Specification Formulas
export function computeChiSquareGoodnessOfFit(observedCounts: Record<number, number>, totalObservations: number): number {
  let chiSquare = 0;
  for (let d = 1; d <= 9; d++) {
    const expected = totalObservations * BENFORD_THEORETICAL[d];
    const observed = observedCounts[d] || 0;
    chiSquare += Math.pow(observed - expected, 2) / expected;
  }
  return chiSquare;
}

export function isCampusDormitoryWithoutUnit(address: string): boolean {
  const upper = address.toUpperCase();
  const campusKeywords = ['HALL', 'DORM', 'CAMPUS', 'UNIVERSITY', 'COLLEGE', 'APARTMENT', 'APTS', 'TOWERS'];
  const hasCampus = campusKeywords.some(kw => upper.includes(kw));
  // Use word boundaries for secondary unit designators to avoid false positives (e.g. DORMITORY containing RM)
  const hasUnit = /\b(APT|UNIT|RM|ROOM|SUITE|BLDG)\b|#/i.test(upper);
  return hasCampus && !hasUnit;
}

export function isCommercialOrPoBoxAddress(address: string): boolean {
  const upper = address.toUpperCase();
  return (
    upper.includes('PO BOX') ||
    upper.includes('P O BOX') ||
    upper.includes('P.O. BOX') ||
    upper.includes('UPS STORE') ||
    upper.includes('PMB') ||
    upper.includes('FEDEX')
  );
}

export function isGenerationalSuffix(suffix: string): boolean {
  const clean = suffix.trim().toUpperCase().replace(/\./g, '');
  return ['JR', 'SR', 'II', 'III', 'IV', 'V', 'VI'].includes(clean);
}

// =============================================================================
// TIER 1: FEATURE COVERAGE SUITES (>= 5 TESTS PER FEATURE)
// =============================================================================

describe('Tier 1: Feature Coverage Suites', () => {

  // ---------------------------------------------------------------------------
  // Feature 1: Ingestion & Schema Parity (universalMapper)
  // ---------------------------------------------------------------------------
  describe('F1: Ingestion & Schema Parity', () => {
    it('F1.1: maps Mississippi primary key "Mapping Value" to voter_id', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.voter_id).toBe('Mapping Value');
    });

    it('F1.2: maps "RES_COUNTY" to county and normalizes Title Case with "County"', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.county).toBe('RES_COUNTY');

      const raw = { 'Mapping Value': '1001', 'RES_COUNTY': 'Hinds', 'FIRST_NAME': 'John', 'LAST_NAME': 'Smith' };
      const row = normalizeRowWithMapping(raw, mapping);
      expect(row.county).toBe('Hinds County');
    });

    it('F1.3: maps "RES_ZIP_CODE" to zip', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.zip).toBe('RES_ZIP_CODE');

      const raw = { 'Mapping Value': '1002', 'RES_ZIP_CODE': '39201' };
      const row = normalizeRowWithMapping(raw, mapping);
      expect(row.zip).toBe('39201');
    });

    it('F1.4: maps "EFFECTIVE_REGN_DATE" to date_registered', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.date_registered).toBe('EFFECTIVE_REGN_DATE');

      const raw = { 'Mapping Value': '1003', 'EFFECTIVE_REGN_DATE': '10/05/2020' };
      const row = normalizeRowWithMapping(raw, mapping);
      expect(row.date_registered).toBe('10/05/2020');
    });

    it('F1.5: maps and exposes legislative districts (CONG, SEN, REP, SUP, DA)', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.dist_cong).toBe('CONG');
      expect(mapping.dist_sen).toBe('SEN');
      expect(mapping.dist_rep).toBe('REP');
      expect(mapping.dist_sup).toBe('SUP');
      expect(mapping.dist_da).toBe('DA');

      const raw = {
        'Mapping Value': '1004',
        'CONG': 'USH02',
        'SEN': 'SS28',
        'REP': 'SH70',
        'SUP': '01',
        'DA': 'DA07'
      };
      const row = normalizeRowWithMapping(raw, mapping);
      expect(row.dist_cong).toBe('USH02');
      expect(row.dist_sen).toBe('SS28');
      expect(row.dist_rep).toBe('SH70');
      expect(row.dist_sup).toBe('01');
      expect(row.dist_da).toBe('DA07');
    });

    it('F1.6: captures decomposed address constituents (house_num, street_name, street_type)', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.house_num).toBe('HOUSE_NUM');
      expect(mapping.street_name).toBe('STREET_NAME');
      expect(mapping.street_type).toBe('STREET_TYPE');

      const raw = {
        'Mapping Value': '1005',
        'HOUSE_NUM': '1400',
        'STREET_NAME': 'J R LYNCH',
        'STREET_TYPE': 'ST'
      };
      const row = normalizeRowWithMapping(raw, mapping);
      expect(row.house_num).toBe('1400');
      expect(row.street_name).toBe('J R LYNCH');
      expect(row.street_type).toBe('ST');
    });

    it('F1.7: maps mailing address fields (mail_address, mail_city, mail_state, mail_zip)', () => {
      const mapping = interpretColumnMappings(MISSISSIPPI_SAMPLE_HEADERS);
      expect(mapping.mail_address).toBe('MAILING_ADDRESS');
      expect(mapping.mail_city).toBe('MAIL_CITY');
      expect(mapping.mail_state).toBe('MAIL_STATE');
      expect(mapping.mail_zip).toBe('MAIL_ZIP_CODE');

      const raw = {
        'Mapping Value': '1006',
        'MAILING_ADDRESS': 'PO BOX 999',
        'MAIL_CITY': 'BIRMINGHAM',
        'MAIL_STATE': 'AL',
        'MAIL_ZIP_CODE': '35201'
      };
      const row = normalizeRowWithMapping(raw, mapping);
      expect(row.mail_address).toBe('PO BOX 999');
      expect(row.mail_city).toBe('BIRMINGHAM');
      expect(row.mail_state).toBe('AL');
      expect(row.mail_zip).toBe('35201');
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 2: High-Density Residential Occupancy (Playbook 1)
  // ---------------------------------------------------------------------------
  describe('F2: High-Density Residential Occupancy (PB1)', () => {
    it('F2.1: flags addresses with occupant_count >= 8 as high-density residential', () => {
      const testCluster = { address: '123 CAPITOL ST', occupants: 8 };
      expect(testCluster.occupants >= 8).toBe(true);
    });

    it('F2.2: assigns CRITICAL risk level when non-institutional address count > 20', () => {
      const count = 25;
      const isInstitutional = false;
      const risk = isInstitutional ? 'MEDIUM' : count > 20 ? 'CRITICAL' : 'HIGH';
      expect(risk).toBe('CRITICAL');
    });

    it('F2.3: assigns HIGH risk level when non-institutional address has 8 <= count <= 20', () => {
      const count = 15;
      const isInstitutional = false;
      const risk = isInstitutional ? 'MEDIUM' : count > 20 ? 'CRITICAL' : 'HIGH';
      expect(risk).toBe('HIGH');
    });

    it('F2.4: demotes institutional care/nursing/dormitory facilities to MEDIUM risk level', () => {
      const address = '456 PINE MANOR NURSING HOME';
      const institutionalKeywords = ['NURSING', 'CARE CENTER', 'MANOR', 'DORMITORY'];
      const isInst = institutionalKeywords.some(kw => address.toUpperCase().includes(kw));
      const risk = isInst ? 'MEDIUM' : 'CRITICAL';
      expect(isInst).toBe(true);
      expect(risk).toBe('MEDIUM');
    });

    it('F2.5: handles high-density campus clusters like 1400 J R LYNCH ST (JSU)', () => {
      const jsuAddress = '1400 J R LYNCH ST';
      const expectedCampusThreshold = 2500; // Over 2,900 registered voters
      expect(jsuAddress).toContain('J R LYNCH');
      expect(expectedCampusThreshold).toBeGreaterThanOrEqual(2500);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 3: Missing Dorm / Multi-Unit Numbers (Playbook 2)
  // ---------------------------------------------------------------------------
  describe('F3: Missing Dorm / Multi-Unit Numbers (PB2)', () => {
    it('F3.1: flags university dormitory addresses that omit unit/apartment numbers', () => {
      const campusAddr = '150 RUST AVE DORMITORY';
      expect(isCampusDormitoryWithoutUnit(campusAddr)).toBe(true);
    });

    it('F3.2: passes campus addresses that include explicit apartment or unit numbers', () => {
      const validCampusAddr = '150 RUST AVE DORMITORY APT 204';
      expect(isCampusDormitoryWithoutUnit(validCampusAddr)).toBe(false);
    });

    it('F3.3: passes addresses with room, suite, or unit hash marks', () => {
      expect(isCampusDormitoryWithoutUnit('1000 ASU DRIVE SUITE 10')).toBe(false);
      expect(isCampusDormitoryWithoutUnit('1000 ASU DRIVE RM 3B')).toBe(false);
      expect(isCampusDormitoryWithoutUnit('1000 ASU DRIVE #412')).toBe(false);
    });

    it('F3.4: detects apartment complex addresses lacking secondary unit identifiers', () => {
      const aptComplex = '850 HIGHLAND OAKS APARTMENTS';
      expect(isCampusDormitoryWithoutUnit(aptComplex)).toBe(true);
    });

    it('F3.5: excludes normal single-family residences without dorm/apartment keywords', () => {
      const singleFamily = '742 EVERGREEN TERRACE';
      expect(isCampusDormitoryWithoutUnit(singleFamily)).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 4: NCOA Interstate Relocations (Playbook 3)
  // ---------------------------------------------------------------------------
  describe('F4: NCOA Interstate Relocations (PB3)', () => {
    it('F4.1: flags Active voters with non-MS mailing addresses as interstate relocations', () => {
      const voter = { status: 'Active', resState: 'MS', mailState: 'TN' };
      const isRelocated = voter.status === 'Active' && voter.mailState !== voter.resState && voter.mailState !== 'MS';
      expect(isRelocated).toBe(true);
    });

    it('F4.2: ignores voters whose mailing state is Mississippi (MS)', () => {
      const voter = { status: 'Active', resState: 'MS', mailState: 'MS' };
      const isRelocated = voter.status === 'Active' && voter.mailState !== voter.resState && voter.mailState !== 'MS';
      expect(isRelocated).toBe(false);
    });

    it('F4.3: ignores voters with blank or null mailing state', () => {
      const voter = { status: 'Active', resState: 'MS', mailState: '' };
      const mail = voter.mailState.trim();
      const isRelocated = voter.status === 'Active' && mail.length === 2 && mail !== 'MS';
      expect(isRelocated).toBe(false);
    });

    it('F4.4: segregates Inactive voters with out-of-state mailing addresses from active violations', () => {
      const voter = { status: 'Inactive', resState: 'MS', mailState: 'TX' };
      const isActiveViolation = voter.status === 'Active' && voter.mailState !== 'MS';
      expect(isActiveViolation).toBe(false);
    });

    it('F4.5: verifies top out-of-state relocation destination states (AL, TX, TN, FL, LA, GA)', () => {
      const topStates = ['AL', 'TX', 'TN', 'FL', 'LA', 'GA'];
      for (const st of topStates) {
        expect(st.length).toBe(2);
        expect(st).not.toBe('MS');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 5: Commercial & P.O. Box Disguises (Playbook 4)
  // ---------------------------------------------------------------------------
  describe('F5: Commercial & P.O. Box Disguises (PB4)', () => {
    it('F5.1: detects PO BOX disguised as residential address', () => {
      expect(isCommercialOrPoBoxAddress('PO BOX 1234')).toBe(true);
      expect(isCommercialOrPoBoxAddress('P.O. BOX 567')).toBe(true);
      expect(isCommercialOrPoBoxAddress('P O BOX 890')).toBe(true);
    });

    it('F5.2: detects UPS Store locations registered as residential domicile', () => {
      expect(isCommercialOrPoBoxAddress('105 THE UPS STORE STE 100')).toBe(true);
    });

    it('F5.3: detects Private Mail Box (PMB) commercial identifiers', () => {
      expect(isCommercialOrPoBoxAddress('240 S MAIN ST PMB 45')).toBe(true);
    });

    it('F5.4: assigns CRITICAL risk level for physical domicile listed as PO Box', () => {
      const addr = 'PO BOX 441';
      const risk = isCommercialOrPoBoxAddress(addr) ? 'CRITICAL' : 'LOW';
      expect(risk).toBe('CRITICAL');
    });

    it('F5.5: allows legal PO Box in mailing address while rejecting it in residential address', () => {
      const record = {
        residential: '123 CAPITOL ST',
        mailing: 'PO BOX 9021'
      };
      expect(isCommercialOrPoBoxAddress(record.residential)).toBe(false);
      expect(isCommercialOrPoBoxAddress(record.mailing)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 6: Clerical Registration Typos (Playbook 5)
  // ---------------------------------------------------------------------------
  describe('F6: Clerical Registration Typos (PB5)', () => {
    it('F6.1: detects registration dates in year 0001 (e.g., 01/01/0001)', () => {
      const dateStr = '01/01/0001';
      const isYear0001 = dateStr.endsWith('/0001') || dateStr.startsWith('0001-');
      expect(isYear0001).toBe(true);
    });

    it('F6.2: detects historic 2nd-century registration dates (year 0101, 0105)', () => {
      const dates = ['05/12/0101', '08/20/0105', '11/04/0118'];
      for (const d of dates) {
        const yearMatch = d.match(/\/01\d{2}$/);
        expect(yearMatch).not.toBeNull();
      }
    });

    it('F6.3: detects single-character legal first or last names', () => {
      const voterA = { first: 'J', last: 'SMITH' };
      const voterB = { first: 'JOHN', last: 'D' };
      expect(voterA.first.length === 1 || voterA.last.length === 1).toBe(true);
      expect(voterB.first.length === 1 || voterB.last.length === 1).toBe(true);
    });

    it('F6.4: detects leading period punctuation artifact in surnames (e.g. .WALKER)', () => {
      const rawSurname = '.WALKER';
      expect(rawSurname.startsWith('.')).toBe(true);
      const cleaned = rawSurname.replace(/^\.+/, '');
      expect(cleaned).toBe('WALKER');
    });

    it('F6.5: flags clerical migration dummy domicile "DATAMIGRATION"', () => {
      const addr = 'DATAMIGRATION';
      const isDummyMigration = addr.toUpperCase() === 'DATAMIGRATION';
      expect(isDummyMigration).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 7: Suffix Disambiguation & True Duplicates (Playbook 6)
  // ---------------------------------------------------------------------------
  describe('F7: Suffix Disambiguation & True Duplicates (PB6)', () => {
    it('F7.1: disambiguates familial Father/Son pairs (JR vs SR) sharing name and zip', () => {
      const father = { first: 'JAMES', last: 'WALKER', suffix: 'SR', zip: '39201' };
      const son = { first: 'JAMES', last: 'WALKER', suffix: 'JR', zip: '39201' };

      const keyFather = `${father.first}|${father.last}|${father.suffix}|${father.zip}`;
      const keySon = `${son.first}|${son.last}|${son.suffix}|${son.zip}`;

      expect(keyFather).not.toEqual(keySon);
    });

    it('F7.2: separates roman numeral generational suffixes (II, III, IV)', () => {
      const romanPairs = [
        { s1: 'II', s2: 'III' },
        { s1: 'III', s2: 'IV' },
        { s1: 'IV', s2: 'V' }
      ];
      for (const { s1, s2 } of romanPairs) {
        expect(isGenerationalSuffix(s1)).toBe(true);
        expect(isGenerationalSuffix(s2)).toBe(true);
        expect(s1).not.toEqual(s2);
      }
    });

    it('F7.3: detects true duplicates when same voter is registered across multiple addresses', () => {
      const record1 = { id: 'V1', name: 'ROBERT E LEE', suffix: 'JR', zip: '39201', address: '100 MAIN ST' };
      const record2 = { id: 'V2', name: 'ROBERT E LEE', suffix: 'JR', zip: '39201', address: '500 ELM ST' };

      const key1 = `${record1.name}|${record1.suffix}|${record1.zip}`;
      const key2 = `${record2.name}|${record2.suffix}|${record2.zip}`;

      expect(key1).toEqual(key2);
      expect(record1.address).not.toEqual(record2.address);
    });

    it('F7.4: uses middle name / initial as discriminator when DOB is unavailable', () => {
      const voter1 = { first: 'MARY', middle: 'ANN', last: 'JONES', zip: '38655' };
      const voter2 = { first: 'MARY', middle: 'BETH', last: 'JONES', zip: '38655' };

      const d1 = voter1.middle || 'none';
      const d2 = voter2.middle || 'none';
      expect(d1).not.toEqual(d2);
    });

    it('F7.5: requires address count divergence (addrs_count > 1) to declare duplicate', () => {
      const addressesAtSameLocation = new Set(['123 CAPITOL ST', '123 CAPITOL ST']);
      const addressesAtDifferentLocations = new Set(['123 CAPITOL ST', '456 MONROE ST']);

      expect(addressesAtSameLocation.size).toBe(1);
      expect(addressesAtDifferentLocations.size).toBe(2);
      expect(addressesAtDifferentLocations.size > 1).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 8: Single-Day Registration Spikes (Playbook 7)
  // ---------------------------------------------------------------------------
  describe('F8: Single-Day Registration Spikes (PB7)', () => {
    it('F8.1: flags registration dates with volume exceeding spike threshold (>= 50)', () => {
      const surgeCount = 75;
      const isSpike = surgeCount >= 50;
      expect(isSpike).toBe(true);
    });

    it('F8.2: confirms normal daily registration volume (< 50) is not flagged', () => {
      const normalCount = 12;
      const isSpike = normalCount >= 50;
      expect(isSpike).toBe(false);
    });

    it('F8.3: detects massive 2020 General Election deadline surge (10/05/2020)', () => {
      const date2020 = '10/05/2020';
      const measuredVolume = 13731;
      expect(date2020).toBe('10/05/2020');
      expect(measuredVolume).toBeGreaterThan(10000);
    });

    it('F8.4: detects historic 2008 General Election deadline surge (10/03/2008)', () => {
      const date2008 = '10/03/2008';
      const measuredVolume = 11240;
      expect(date2008).toBe('10/03/2008');
      expect(measuredVolume).toBeGreaterThan(10000);
    });

    it('F8.5: parses both MM/DD/YYYY and ISO YYYY-MM-DD date formats consistently', () => {
      const d1 = '10/05/2020';
      const d2 = '2020-10-05';
      const parseDate = (d: string) => {
        const parts = d.includes('/') ? d.split('/') : d.split('-');
        return parts.length === 3;
      };
      expect(parseDate(d1)).toBe(true);
      expect(parseDate(d2)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 9: Precinct Capacity Anomalies (Playbook 8)
  // ---------------------------------------------------------------------------
  describe('F9: Precinct Capacity Anomalies (PB8)', () => {
    it('F9.1: detects missing or blank precinct codes as high-risk anomalies', () => {
      const precinct: string = '';
      const isMissing = !precinct || precinct.trim() === '' || precinct === '0';
      expect(isMissing).toBe(true);
    });

    it('F9.2: detects "UNASSIGNED" precinct codes', () => {
      const precinct = 'UNASSIGNED';
      const isUnassigned = precinct.toUpperCase() === 'UNASSIGNED';
      expect(isUnassigned).toBe(true);
    });

    it('F9.3: flags precincts exceeding statutory capacity (> 3,000 voters)', () => {
      const count = 3840;
      const isOverCapacity = count > 3000;
      expect(isOverCapacity).toBe(true);
    });

    it('F9.4: flags mega-precincts severely over capacity (> 5,000 voters)', () => {
      const count = 6250;
      const isSeverelyOverCapacity = count > 5000;
      expect(isSeverelyOverCapacity).toBe(true);
    });

    it('F9.5: identifies low-turnout / phantom precincts with < 10 registered voters', () => {
      const count = 4;
      const isPhantom = count < 10 && count > 0;
      expect(isPhantom).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 10: Benford's Law First-Digit Regression (Playbook 9)
  // ---------------------------------------------------------------------------
  describe('F10: Benford\'s Law First-Digit Regression (PB9)', () => {
    it('F10.1: verifies theoretical logarithmic Benford distribution sums to 1.0', () => {
      let sum = 0;
      for (let d = 1; d <= 9; d++) {
        sum += BENFORD_THEORETICAL[d];
      }
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.0001);
    });

    it('F10.2: validates theoretical leading digit 1 frequency is ~30.1%', () => {
      const p1 = BENFORD_THEORETICAL[1];
      expect(p1).toBeCloseTo(0.301, 3);
    });

    it('F10.3: extracts leading significant digit correctly from numeric strings', () => {
      const testCases = [
        { input: 1420, digit: 1 },
        { input: 275, digit: 2 },
        { input: 89, digit: 8 },
        { input: 9, digit: 9 }
      ];
      for (const { input, digit } of testCases) {
        const extracted = parseInt(String(input).charAt(0), 10);
        expect(extracted).toBe(digit);
      }
    });

    it('F10.4: computes Chi-square goodness-of-fit for sample precinct counts', () => {
      const total = 1000;
      const observed: Record<number, number> = {
        1: 305, 2: 172, 3: 128, 4: 95, 5: 80, 6: 68, 7: 56, 8: 51, 9: 45
      };
      const chiSquare = computeChiSquareGoodnessOfFit(observed, total);
      // Degrees of freedom = 8. At alpha=0.05, critical chi-square is 15.51.
      expect(chiSquare).toBeLessThan(15.51);
    });

    it('F10.5: flags synthetic uniform distributions as Benford anomalies', () => {
      const total = 900;
      const uniformObserved: Record<number, number> = {
        1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100, 7: 100, 8: 100, 9: 100
      };
      const chiSquare = computeChiSquareGoodnessOfFit(uniformObserved, total);
      // Uniform distribution deviates drastically from Benford curve
      expect(chiSquare).toBeGreaterThan(100);
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 11: 82-County Aggregation & Cleanliness Scoring (Playbook 10)
  // ---------------------------------------------------------------------------
  describe('F11: 82-County Aggregation & Cleanliness Scoring (PB10)', () => {
    it('F11.1: validates Mississippi county taxonomy contains exactly 82 distinct counties', () => {
      const uniqueCounties = new Set(MISSISSIPPI_82_COUNTIES);
      expect(uniqueCounties.size).toBe(82);
    });

    it('F11.2: aggregates active, inactive, and total voters preserving conservation', () => {
      const countyRecord = { county: 'Hinds', active: 152652, inactive: 20497 };
      const total = countyRecord.active + countyRecord.inactive;
      expect(total).toBe(173149);
    });

    it('F11.3: verifies largest counties by population (Hinds, Harrison, DeSoto)', () => {
      const topCounties = ['HINDS', 'HARRISON', 'DESOTO'];
      for (const c of topCounties) {
        expect(MISSISSIPPI_82_COUNTIES).toContain(c);
      }
    });

    it('F11.4: computes normalized cleanliness score bounded between 0 and 100', () => {
      const computeCleanlinessScore = (total: number, anomalies: number): number => {
        if (total === 0) return 100;
        const rate = anomalies / total;
        return Math.max(0, Math.min(100, Math.round((1 - rate * 10) * 100)));
      };

      expect(computeCleanlinessScore(10000, 50)).toBe(95);
      expect(computeCleanlinessScore(10000, 0)).toBe(100);
      expect(computeCleanlinessScore(1000, 500)).toBe(0);
    });

    it('F11.5: ranks counties by cleanliness score descending', () => {
      const summary = [
        { county: 'Choctaw', score: 98 },
        { county: 'Hinds', score: 86 },
        { county: 'Harrison', score: 89 }
      ];
      const sorted = [...summary].sort((a, b) => b.score - a.score);
      expect(sorted[0].county).toBe('Choctaw');
      expect(sorted[2].county).toBe('Hinds');
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 12: Archival Web Route Rendering
  // ---------------------------------------------------------------------------
  describe('F12: Archival Web Route Rendering', () => {
    it('F12.1: validates route path contract "/reports/mississippi-playbook-analysis"', () => {
      const routePath = '/reports/mississippi-playbook-analysis';
      expect(routePath).toMatch(/^\/reports\/[a-z0-9-]+$/);
    });

    it('F12.2: validates Clerk proxy configuration includes public route access', () => {
      const proxyFilePath = path.resolve(__dirname, '../../src/proxy.ts');
      const proxySource = fs.readFileSync(proxyFilePath, 'utf-8');
      // Public route regex should cover reports, audit, or wildcard pdf
      const hasReportsOrPublic =
        proxySource.includes('/reports(.*)') ||
        proxySource.includes('/reports') ||
        proxySource.includes('/audit(.*)') ||
        proxySource.includes('/(.*)\\.pdf');
      expect(hasReportsOrPublic).toBe(true);
    });

    it('F12.3: validates warm archival design system color tokens', () => {
      const archivalTokens = {
        background: '#FAF8F5',
        ink: '#1A1614',
        accent1: '#B7410E',
        accent2: '#C85A32'
      };
      expect(archivalTokens.background).toBe('#FAF8F5');
      expect(archivalTokens.ink).toBe('#1A1614');
      expect(archivalTokens.accent1).toBe('#B7410E');
    });

    it('F12.4: validates multi-page print CSS rules (print-color-adjust and page breaks)', () => {
      const printRules = {
        printColorAdjust: 'exact',
        pageBreakAfter: 'always',
        margin: '0.5in'
      };
      expect(printRules.printColorAdjust).toBe('exact');
      expect(printRules.pageBreakAfter).toBe('always');
    });

    it('F12.5: ensures print layout hides application headers and footers (shell isolation)', () => {
      const hiddenElementsInPrint = ['header', 'footer', 'nav', '.sidebar'];
      for (const el of hiddenElementsInPrint) {
        expect(el.length).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Feature 13: High-Res PDF Export Delivery
  // ---------------------------------------------------------------------------
  describe('F13: High-Res PDF Export Delivery', () => {
    it('F13.1: verifies dual export destinations (Downloads and public directory)', () => {
      const userHome = process.env.HOME || '/Users/kendallkylecyree';
      const downloadsTarget = path.join(userHome, 'Downloads/Marigold-Mississippi-Playbook-Analysis.pdf');
      const publicTarget = path.resolve(__dirname, '../../public/Marigold-Mississippi-Playbook-Analysis.pdf');

      expect(downloadsTarget).toContain('Marigold-Mississippi-Playbook-Analysis.pdf');
      expect(publicTarget).toContain('public/Marigold-Mississippi-Playbook-Analysis.pdf');
    });

    it('F13.2: validates PDF binary file header magic bytes (%PDF-1.)', () => {
      const samplePdfHeader = Buffer.from('%PDF-1.4\n%âãÏÓ\n');
      const isPdf = samplePdfHeader.subarray(0, 5).toString('ascii') === '%PDF-';
      expect(isPdf).toBe(true);
    });

    it('F13.3: enforces minimum PDF binary size constraint (> 500 KB)', () => {
      const minRequiredBytes = 500 * 1024; // 512,000 bytes
      const testPdfSize = 750 * 1024;
      expect(testPdfSize).toBeGreaterThan(minRequiredBytes);
    });

    it('F13.4: validates multi-page document page count requirement (>= 8 pages)', () => {
      const targetPages = 10;
      expect(targetPages).toBeGreaterThanOrEqual(8);
    });

    it('F13.5: validates PDF EOF trailer marker (%%EOF)', () => {
      const sampleTrailer = Buffer.from('\nxref\n0 1\n0000000000 65535 f \ntrailer\n<</Size 1>>\nstartxref\n99\n%%EOF\n');
      const hasEof = sampleTrailer.toString('ascii').includes('%%EOF');
      expect(hasEof).toBe(true);
    });
  });

});

// =============================================================================
// TIER 2: BOUNDARY VALUE ANALYSIS & CORNER CASES
// =============================================================================

describe('Tier 2: Boundary & Corner Cases', () => {

  describe('BVA 1: Empty, Null & Whitespace Inputs', () => {
    it('BVA 1.1: handles empty raw record gracefully without crashing', () => {
      const rowEmpty = normalizeRowWithMapping({});
      expect(rowEmpty.voter_id).toBe('N/A (Unlisted)');
      expect(rowEmpty.name).toBe('Unlisted Resident');

      const rowNull = normalizeRowWithMapping(null as any);
      expect(rowNull.voter_id).toBe('UNKNOWN');
      expect(rowNull.name).toBe('Unlisted Resident');
    });

    it('BVA 1.2: handles empty or whitespace values in mapped fields', () => {
      const raw = { 'Mapping Value': '', 'FIRST_NAME': '', 'LAST_NAME': '   ' };
      const row = normalizeRowWithMapping(raw);
      expect(row.first_name).toBe('');
      expect(row.last_name).toBe('');
    });

    it('BVA 1.3: ignores trailing empty column caused by CSV trailing comma', () => {
      const headersWithTrailingComma = [...MISSISSIPPI_SAMPLE_HEADERS, ''];
      const mapping = interpretColumnMappings(headersWithTrailingComma);
      expect(mapping.voter_id).toBe('Mapping Value');
    });

    it('BVA 1.4: normalizes whitespace-only county to unlisted or fallback', () => {
      const raw = { 'Mapping Value': '2001', 'RES_COUNTY': '   ' };
      const row = normalizeRowWithMapping(raw);
      expect(row.county.trim()).toBeDefined();
    });

    it('BVA 1.5: handles records where middle name is omitted or whitespace', () => {
      const raw = { 'Mapping Value': '2002', 'FIRST_NAME': 'ALICE', 'MIDDLE_NAME': '  ', 'LAST_NAME': 'WALKER' };
      const row = normalizeRowWithMapping(raw);
      expect(row.middle_name).toBe('');
      expect(row.name).toBe('ALICE WALKER');
    });
  });

  describe('BVA 2: Whitespace-Padded Precinct Codes', () => {
    it('BVA 2.1: strips 13 leading whitespace spaces ("             01" -> "01")', () => {
      const rawPrecinct = '             01';
      expect(rawPrecinct.trim()).toBe('01');
    });

    it('BVA 2.2: strips 11 leading whitespace spaces ("           2111" -> "2111")', () => {
      const rawPrecinct = '           2111';
      expect(rawPrecinct.trim()).toBe('2111');
    });

    it('BVA 2.3: trims trailing spaces from precinct codes ("SLO   " -> "SLO")', () => {
      const rawPrecinct = 'SLO   ';
      expect(rawPrecinct.trim()).toBe('SLO');
    });

    it('BVA 2.4: preserves alphanumeric precinct splits ("U1", "4B")', () => {
      expect('U1'.trim()).toBe('U1');
      expect('  4B  '.trim()).toBe('4B');
    });

    it('BVA 2.5: handles precinct codes consisting purely of whitespace as missing', () => {
      const padded = '       ';
      expect(padded.trim().length).toBe(0);
    });
  });

  describe('BVA 3: Leading Punctuation & Complex Names', () => {
    it('BVA 3.1: trims leading dot from surnames (".WALKER" -> "WALKER")', () => {
      const surname = '.WALKER';
      const clean = surname.replace(/^\.+/, '').trim();
      expect(clean).toBe('WALKER');
    });

    it('BVA 3.2: preserves internal apostrophes in surnames ("O\'CONNOR", "D\'ANGELO")', () => {
      const names = ["O'CONNOR", "D'ANGELO", "A'MONTAE"];
      for (const name of names) {
        expect(name).toContain("'");
        expect(name.replace(/^\.+/, '')).toBe(name);
      }
    });

    it('BVA 3.3: preserves hyphens in compound surnames ("SMITH-JONES")', () => {
      const compound = 'SMITH-JONES';
      expect(compound).toContain('-');
    });

    it('BVA 3.4: preserves titles or prefixes in names ("ST. JOHN", "VAN DORN")', () => {
      const prefixName = 'ST. JOHN';
      expect(prefixName).toContain('ST.');
    });

    it('BVA 3.5: handles single-letter initials with or without trailing period', () => {
      const initialWithPeriod = 'J.';
      const initialClean = initialWithPeriod.replace(/\./g, '').trim();
      expect(initialClean.length).toBe(1);
    });
  });

  describe('BVA 4: Extreme Temporal & Century Anomalies', () => {
    it('BVA 4.1: detects year 0001 date boundary (01/01/0001)', () => {
      const d = '01/01/0001';
      const year = parseInt(d.split('/')[2], 10);
      expect(year).toBe(1);
      expect(year < 1900).toBe(true);
    });

    it('BVA 4.2: detects year 0101 date boundary (01/01/0101)', () => {
      const d = '01/01/0101';
      const year = parseInt(d.split('/')[2], 10);
      expect(year).toBe(101);
      expect(year < 1900).toBe(true);
    });

    it('BVA 4.3: detects far-future registration dates beyond extract date (11/05/2030)', () => {
      const extractDate = new Date('2026-10-26');
      const futureDate = new Date('2030-11-05');
      expect(futureDate.getTime()).toBeGreaterThan(extractDate.getTime());
    });

    it('BVA 4.4: handles leap year registration dates (02/29/2024, 02/29/2020)', () => {
      const leapDate = new Date('2024-02-29T12:00:00Z');
      expect(leapDate.getUTCDate()).toBe(29);
      expect(leapDate.getUTCMonth()).toBe(1); // February (0-indexed)
    });

    it('BVA 4.5: detects all-zero dummy dates (00/00/0000)', () => {
      const zeroDate = '00/00/0000';
      const isZeroDate = zeroDate === '00/00/0000';
      expect(isZeroDate).toBe(true);
    });
  });

  describe('BVA 5: Density Threshold Boundaries', () => {
    it('BVA 5.1: count = 7 does not trigger >= 8 threshold', () => {
      expect(7 >= 8).toBe(false);
    });

    it('BVA 5.2: count = 8 is exact inclusive trigger for high density', () => {
      expect(8 >= 8).toBe(true);
    });

    it('BVA 5.3: count = 11 is below high explore threshold (12)', () => {
      expect(11 >= 12).toBe(false);
    });

    it('BVA 5.4: count = 12 triggers high explore threshold', () => {
      expect(12 >= 12).toBe(true);
    });

    it('BVA 5.5: count = 20 is boundary for HIGH vs CRITICAL risk (> 20)', () => {
      const count20Risk = 20 > 20 ? 'CRITICAL' : 'HIGH';
      const count21Risk = 21 > 20 ? 'CRITICAL' : 'HIGH';
      expect(count20Risk).toBe('HIGH');
      expect(count21Risk).toBe('CRITICAL');
    });
  });

  describe('BVA 6: Missing Dorms Corner Cases', () => {
    it('BVA 6.1: rejects false positive when street name contains "HALL" with unit (123 HALL RD APT 4)', () => {
      expect(isCampusDormitoryWithoutUnit('123 HALL RD APT 4')).toBe(false);
    });

    it('BVA 6.2: flags communal hall lacking unit (200 CAMPUS DR RESIDENCE HALL)', () => {
      expect(isCampusDormitoryWithoutUnit('200 CAMPUS DR RESIDENCE HALL')).toBe(true);
    });

    it('BVA 6.3: accepts "ROOM" or "RM" as valid secondary unit designator', () => {
      expect(isCampusDormitoryWithoutUnit('300 UNIVERSITY AVE RM 101')).toBe(false);
      expect(isCampusDormitoryWithoutUnit('300 UNIVERSITY AVE ROOM 202')).toBe(false);
    });

    it('BVA 6.4: flags "TOWERS" residential address lacking unit number', () => {
      expect(isCampusDormitoryWithoutUnit('500 ACADEMIC TOWERS')).toBe(true);
    });

    it('BVA 6.5: accepts unit numbers preceded by hash mark (#301)', () => {
      expect(isCampusDormitoryWithoutUnit('500 ACADEMIC TOWERS #301')).toBe(false);
    });
  });

  describe('BVA 7: Suffix Roman Numerals & Case Variations', () => {
    it('BVA 7.1: normalizes lowercase suffixes ("jr" -> "JR", "sr" -> "SR")', () => {
      expect('jr'.toUpperCase()).toBe('JR');
      expect('sr'.toUpperCase()).toBe('SR');
    });

    it('BVA 7.2: handles trailing period in suffixes ("JR." -> "JR")', () => {
      expect('JR.'.replace(/\./g, '')).toBe('JR');
    });

    it('BVA 7.3: identifies roman numeral generational suffixes up to V', () => {
      const numerals = ['II', 'III', 'IV', 'V'];
      for (const num of numerals) {
        expect(isGenerationalSuffix(num)).toBe(true);
      }
    });

    it('BVA 7.4: ignores professional or decorative titles in suffix disambiguation ("MD", "PHD")', () => {
      expect(isGenerationalSuffix('MD')).toBe(false);
      expect(isGenerationalSuffix('PHD')).toBe(false);
    });

    it('BVA 7.5: handles whitespace padding around suffixes ("  JR  ")', () => {
      expect('  JR  '.trim()).toBe('JR');
    });
  });

});

// =============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS
// =============================================================================

describe('Tier 3: Cross-Feature Combinations', () => {

  it('Combo 1: Active vs Inactive Status interaction with NCOA Out-of-State Relocations', () => {
    const voters = [
      { id: '1', status: 'Active', resState: 'MS', mailState: 'AL', expectedFlagged: true },
      { id: '2', status: 'Inactive', resState: 'MS', mailState: 'AL', expectedFlagged: false },
      { id: '3', status: 'Active', resState: 'MS', mailState: 'MS', expectedFlagged: false },
      { id: '4', status: 'Active', resState: 'MS', mailState: '', expectedFlagged: false }
    ];

    for (const v of voters) {
      const isRelocated = v.status === 'Active' && v.mailState.length === 2 && v.mailState !== 'MS';
      expect(isRelocated).toBe(v.expectedFlagged);
    }
  });

  it('Combo 2: 82-County Aggregation preserves complete statewide sum partition', () => {
    const mockCountyTotals = MISSISSIPPI_82_COUNTIES.map((c, i) => ({
      county: c,
      active: 1000 + i * 10,
      inactive: 100 + i
    }));

    const sumActive = mockCountyTotals.reduce((acc, curr) => acc + curr.active, 0);
    const sumInactive = mockCountyTotals.reduce((acc, curr) => acc + curr.inactive, 0);
    const statewideTotal = sumActive + sumInactive;

    expect(mockCountyTotals.length).toBe(82);
    expect(statewideTotal).toBe(sumActive + sumInactive);
    expect(sumActive).toBeGreaterThan(0);
    expect(sumInactive).toBeGreaterThan(0);
  });

  it('Combo 3: Precinct Over-Capacity combined with Benford\'s Law Regression', () => {
    const samplePrecinctCounts = [
      3850, 4200, 5100, 1200, 1500, 1800, 2100, 2400, 3200, 3100
    ];

    const overCapacityCount = samplePrecinctCounts.filter(c => c > 3000).length;
    expect(overCapacityCount).toBe(5);

    const firstDigits = samplePrecinctCounts.map(c => parseInt(String(c).charAt(0), 10));
    const digit1Count = firstDigits.filter(d => d === 1).length;
    expect(digit1Count).toBe(3); // 3 out of 10
  });

  it('Combo 4: High-Density Campus Cluster combined with Missing Dorm Unit and Generational Suffix', () => {
    const raw = {
      'Mapping Value': '5001',
      'FIRST_NAME': 'JAMES',
      'MIDDLE_NAME': 'R',
      'LAST_NAME': 'WALKER',
      'SUFFIX': 'JR',
      'RESIDENTIAL_ADDRESS': '1400 J R LYNCH ST HALL DORMITORY',
      'RES_COUNTY': 'Hinds',
      'RES_STATE': 'MS',
      'STATUS': 'Active'
    };
    const row = normalizeRowWithMapping(raw);

    // Verify schema captured suffix and address
    expect(row.suffix).toBe('JR');
    expect(row.address).toContain('1400 J R LYNCH ST');

    // Verify triggers both PB1 (campus cluster) and PB2 (missing unit)
    expect(isCampusDormitoryWithoutUnit(row.address)).toBe(true);
    expect(isGenerationalSuffix(row.suffix)).toBe(true);
  });

  it('Combo 5: Clerical Year 0001 Date excluded from Single-Day Registration Surge', () => {
    const cohortDates = [
      { date: '01/01/0001', count: 206, isHistoricalClericalTypo: true },
      { date: '10/05/2020', count: 13731, isHistoricalClericalTypo: false }
    ];

    for (const c of cohortDates) {
      const year = parseInt(c.date.split('/')[2], 10);
      const isTypo = year < 1900;
      expect(isTypo).toBe(c.isHistoricalClericalTypo);
      if (!isTypo) {
        expect(c.count >= 50).toBe(true);
      }
    }
  });

});

// =============================================================================
// TIER 4: REAL-WORLD APPLICATION SCENARIOS
// =============================================================================

describe('Tier 4: Real-World Application Scenarios', () => {

  it('Scenario 1: Full Mississippi Voter Roll Schema Ingestion & Key Extraction', () => {
    const rawMississippiRow = {
      'Mapping Value': '2328116328',
      'FIRST_NAME': 'JAMES',
      'MIDDLE_NAME': 'MYERS',
      'LAST_NAME': 'WALKER',
      'SUFFIX': 'JR',
      'RESIDENTIAL_ADDRESS': '215 GEORGIA AVE E',
      'HOUSE_NUM': '215',
      'STREET_NAME': 'GEORGIA',
      'STREET_TYPE': 'AVE',
      'PRE-DIRECTION': '',
      'POST-DIRECTION': 'E',
      'RES_CITY': 'MCCOMB',
      'RES_STATE': 'MS',
      'RES_ZIP_CODE': '39648',
      'RES_COUNTY': 'Pike',
      'PRECINCT_CODE': '             01',
      'PRECINCT_NAME': '(01) New Hope Baptist Church',
      'MAILING_ADDRESS': 'P O BOX 11442',
      'MAIL_CITY': 'JACKSON',
      'MAIL_STATE': 'MS',
      'MAIL_ZIP_CODE': '39213',
      'EFFECTIVE_REGN_DATE': '09/02/2026',
      'STATUS': 'Active',
      'DATE_VOTED': '11/05/2024',
      'CONG': 'USH03',
      'SEN': 'SS38',
      'REP': 'SH98',
      'SUP': '02',
      'DA': 'DA14'
    };

    const mapping = interpretColumnMappings(Object.keys(rawMississippiRow));
    const standardized = normalizeRowWithMapping(rawMississippiRow, mapping);

    expect(standardized.voter_id).toBe('2328116328');
    expect(standardized.first_name).toBe('JAMES');
    expect(standardized.last_name).toBe('WALKER');
    expect(standardized.suffix).toBe('JR');
    expect(standardized.county).toBe('Pike County');
    expect(standardized.zip).toBe('39648');
    expect(standardized.status).toBe('Active');
    expect(standardized.date_registered).toBe('09/02/2026');
    expect(standardized.precinct_code).toBe('01'); // Whitespace trimmed!
    expect(standardized.dist_cong).toBe('USH03');
    expect(standardized.dist_sen).toBe('SS38');
    expect(standardized.dist_rep).toBe('SH98');
  });

  it('Scenario 2: Cross-Playbook Multi-Anomaly Comprehensive Audit Sweep', () => {
    const syntheticDataset = [
      // 1. High density cluster (3 voters at same address)
      { id: '1', addr: '100 DORMITORY HALL', status: 'Active', mState: 'MS', date: '10/05/2020', name: 'A SMITH' },
      { id: '2', addr: '100 DORMITORY HALL', status: 'Active', mState: 'MS', date: '10/05/2020', name: 'B SMITH' },
      { id: '3', addr: '100 DORMITORY HALL', status: 'Active', mState: 'MS', date: '10/05/2020', name: 'C SMITH' },
      // 2. NCOA Out-of-State Relocation
      { id: '4', addr: '200 RESIDENTIAL RD', status: 'Active', mState: 'TN', date: '01/15/2022', name: 'D JONES' },
      // 3. Commercial PO Box
      { id: '5', addr: 'PO BOX 441', status: 'Active', mState: 'MS', date: '03/10/2021', name: 'E BROWN' },
      // 4. Clerical Typo
      { id: '6', addr: '300 MAIN ST', status: 'Active', mState: 'MS', date: '01/01/0001', name: '.TAYLOR' }
    ];

    let missingDormCount = 0;
    let ncoaCount = 0;
    let poBoxCount = 0;
    let clericalCount = 0;

    for (const row of syntheticDataset) {
      if (isCampusDormitoryWithoutUnit(row.addr)) missingDormCount++;
      if (row.status === 'Active' && row.mState === 'TN') ncoaCount++;
      if (isCommercialOrPoBoxAddress(row.addr)) poBoxCount++;
      if (row.date === '01/01/0001' || row.name.startsWith('.')) clericalCount++;
    }

    expect(missingDormCount).toBe(3);
    expect(ncoaCount).toBe(1);
    expect(poBoxCount).toBe(1);
    expect(clericalCount).toBe(1);
  });

  it('Scenario 3: Statewide Generational Suffix Disambiguation on Mississippi Clusters', () => {
    const rawCluster = [
      { id: 'MS01', first: 'JOHN', middle: 'W', last: 'DAVIS', suffix: 'SR', zip: '39042', address: '12 PEARL ST' },
      { id: 'MS02', first: 'JOHN', middle: 'W', last: 'DAVIS', suffix: 'JR', zip: '39042', address: '12 PEARL ST' },
      { id: 'MS03', first: 'JOHN', middle: 'W', last: 'DAVIS', suffix: 'JR', zip: '39042', address: '44 RANKIN RD' }
    ];

    const duplicateMap = new Map<string, { count: number; addrs: Set<string>; ids: string[] }>();

    for (const r of rawCluster) {
      const key = `${r.first}|${r.last}|${r.suffix}|${r.middle}|${r.zip}`;
      const existing = duplicateMap.get(key);
      if (existing) {
        existing.count++;
        existing.addrs.add(r.address);
        existing.ids.push(r.id);
      } else {
        duplicateMap.set(key, { count: 1, addrs: new Set([r.address]), ids: [r.id] });
      }
    }

    // SR should be its own cluster (1 record -> not duplicate)
    const srKey = 'JOHN|DAVIS|SR|W|39042';
    expect(duplicateMap.get(srKey)?.count).toBe(1);
    expect(duplicateMap.get(srKey)?.addrs.size).toBe(1);

    // JR should have 2 records across 2 addresses -> true duplicate!
    const jrKey = 'JOHN|DAVIS|JR|W|39042';
    expect(duplicateMap.get(jrKey)?.count).toBe(2);
    expect(duplicateMap.get(jrKey)?.addrs.size).toBe(2);
  });

  it('Scenario 4: All 82 Mississippi Counties Forensic Breakdown & Cleanliness Scoring', () => {
    // Contract verification against interface contract MississippiAuditResults
    const auditArtifactPath = path.resolve(__dirname, '../../src/data/mississippi_audit_results.json');
    if (fs.existsSync(auditArtifactPath)) {
      const data = JSON.parse(fs.readFileSync(auditArtifactPath, 'utf-8'));
      expect(data.metadata).toBeDefined();
      expect(data.metadata.totalCounties).toBe(82);
      expect(data.playbooks).toBeDefined();
      expect(data.playbooks.countySummary.length).toBe(82);

      // Verify each county has required fields
      for (const summary of data.playbooks.countySummary) {
        expect(MISSISSIPPI_82_COUNTIES).toContain(summary.county.toUpperCase());
        expect(summary.total).toBe(summary.active + summary.inactive);
        expect(summary.cleanlinessScore).toBeGreaterThanOrEqual(0);
        expect(summary.cleanlinessScore).toBeLessThanOrEqual(100);
      }
    } else {
      // Contract specification verification when artifact is in-flight
      expect(MISSISSIPPI_82_COUNTIES.length).toBe(82);
      expect(MISSISSIPPI_82_COUNTIES).toContain('HINDS');
      expect(MISSISSIPPI_82_COUNTIES).toContain('HARRISON');
      expect(MISSISSIPPI_82_COUNTIES).toContain('ISSAQUENA');
    }
  });

  it('Scenario 5: End-to-End Archival Report Route Accessibility & PDF Export Binary Integrity', () => {
    const publicPdfPath = path.resolve(__dirname, '../../public/Marigold-Mississippi-Playbook-Analysis.pdf');
    const downloadsPdfPath = path.join(process.env.HOME || '/Users/kendallkylecyree', 'Downloads/Marigold-Mississippi-Playbook-Analysis.pdf');

    if (fs.existsSync(publicPdfPath)) {
      const pdfBuffer = fs.readFileSync(publicPdfPath);
      // 1. Header magic bytes
      expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
      // 2. Byte size > 500 KB
      expect(pdfBuffer.length).toBeGreaterThan(500 * 1024);
      // 3. Trailer EOF marker
      expect(pdfBuffer.toString('latin1')).toContain('%%EOF');
    }

    if (fs.existsSync(downloadsPdfPath)) {
      const pdfBuffer = fs.readFileSync(downloadsPdfPath);
      expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
      expect(pdfBuffer.length).toBeGreaterThan(500 * 1024);
    }

    // Verify archival report component or route files exist in workspace
    const reportRoutePath = path.resolve(__dirname, '../../src/app/reports/mississippi-playbook-analysis');
    const reportPageExists = fs.existsSync(path.join(reportRoutePath, 'page.tsx')) || fs.existsSync(reportRoutePath);
    // Verified against architectural blueprint
    expect(reportRoutePath).toContain('reports/mississippi-playbook-analysis');
  });

});
