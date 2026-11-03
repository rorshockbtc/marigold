import { describe, it, expect } from 'vitest';
import { interpretColumnMappings, normalizeRowWithMapping } from '@/lib/csv/universalMapper';

describe('Mississippi Schema Ingestion & Universal Mapper Suite', () => {
  const MISSISSIPPI_HEADERS = [
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

  it('correctly maps all Mississippi standard headers without requiring sample rows', () => {
    const mapping = interpretColumnMappings(MISSISSIPPI_HEADERS);

    // Required Mississippi synonym mappings
    expect(mapping.voter_id).toBe('Mapping Value');
    expect(mapping.county).toBe('RES_COUNTY');
    expect(mapping.zip).toBe('RES_ZIP_CODE');
    expect(mapping.date_registered).toBe('EFFECTIVE_REGN_DATE');

    // Standard demographic fields
    expect(mapping.first_name).toBe('FIRST_NAME');
    expect(mapping.middle_name).toBe('MIDDLE_NAME');
    expect(mapping.last_name).toBe('LAST_NAME');
    expect(mapping.suffix).toBe('SUFFIX');
    expect(mapping.address).toBe('RESIDENTIAL_ADDRESS');
    expect(mapping.city).toBe('RES_CITY');
    expect(mapping.state).toBe('RES_STATE');
    expect(mapping.status).toBe('STATUS');
    expect(mapping.precinct_code).toBe('PRECINCT_CODE');

    // Expanded schema fields
    expect(mapping.house_num).toBe('HOUSE_NUM');
    expect(mapping.street_name).toBe('STREET_NAME');
    expect(mapping.street_type).toBe('STREET_TYPE');
    expect(mapping.precinct_name).toBe('PRECINCT_NAME');
    expect(mapping.mail_address).toBe('MAILING_ADDRESS');
    expect(mapping.mail_city).toBe('MAIL_CITY');
    expect(mapping.mail_state).toBe('MAIL_STATE');
    expect(mapping.mail_zip).toBe('MAIL_ZIP_CODE');

    // Legislative and judicial district fields
    expect(mapping.dist_cong).toBe('CONG');
    expect(mapping.dist_sen).toBe('SEN');
    expect(mapping.dist_rep).toBe('REP');
    expect(mapping.dist_sup).toBe('SUP');
    expect(mapping.dist_da).toBe('DA');
    expect(mapping.dist_sc).toBe('SC');
  });

  it('normalizes genuine Mississippi voter roll record with sanitization', () => {
    const rawRecord: Record<string, any> = {
      'Mapping Value': '2328116328',
      'FIRST_NAME': 'JAMES',
      'MIDDLE_NAME': '',
      'LAST_NAME': '.WALKER',
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
      'MAILING_ADDRESS': '215 E GEORGIA AVE',
      'MAIL_CITY': 'MCCOMB',
      'MAIL_STATE': 'MS',
      'MAIL_ZIP_CODE': '39648',
      'EFFECTIVE_REGN_DATE': '09/02/2026',
      'STATUS': 'Active',
      'CONG': 'USH03',
      'SC': 'SC02',
      'DA': 'DA14',
      'SEN': 'SS38',
      'REP': 'SH98',
      'SUP': '             01'
    };

    const mapping = interpretColumnMappings(Object.keys(rawRecord));
    const standardized = normalizeRowWithMapping(rawRecord, mapping);

    // Primary identification and linkage
    expect(standardized.voter_id).toBe('2328116328');

    // Clerical prefix stripping from names
    expect(standardized.last_name).toBe('WALKER');
    expect(standardized.first_name).toBe('JAMES');
    expect(standardized.name).toBe('JAMES WALKER JR');
    expect(standardized.suffix).toBe('JR');

    // Domicile address and constituent fields
    expect(standardized.address).toBe('215 GEORGIA AVE E');
    expect(standardized.house_num).toBe('215');
    expect(standardized.street_name).toBe('GEORGIA');
    expect(standardized.street_type).toBe('AVE');
    expect(standardized.city).toBe('MCCOMB');
    expect(standardized.state).toBe('MS');
    expect(standardized.zip).toBe('39648');
    expect(standardized.county).toBe('Pike County');

    // Precinct sanitization (padded whitespace stripped)
    expect(standardized.precinct_code).toBe('01');
    expect(standardized.precinct_name).toBe('(01) New Hope Baptist Church');

    // Mailing address components
    expect(standardized.mail_address).toBe('215 E GEORGIA AVE');
    expect(standardized.mail_city).toBe('MCCOMB');
    expect(standardized.mail_state).toBe('MS');
    expect(standardized.mail_zip).toBe('39648');

    // Registration and status
    expect(standardized.date_registered).toBe('09/02/2026');
    expect(standardized.status).toBe('Active');

    // Legislative and judicial districts
    expect(standardized.dist_cong).toBe('USH03');
    expect(standardized.dist_sen).toBe('SS38');
    expect(standardized.dist_rep).toBe('SH98');
    expect(standardized.dist_sup).toBe('01');
    expect(standardized.dist_da).toBe('DA14');
    expect(standardized.dist_sc).toBe('SC02');
  });

  it('handles auto-interpretation when no explicit mapping is provided', () => {
    const rawRecord: Record<string, any> = {
      'Mapping Value': '109928374',
      'FIRST_NAME': 'MARY',
      'LAST_NAME': '.JOHNSON',
      'RES_COUNTY': 'Hinds',
      'RES_ZIP_CODE': '39201',
      'EFFECTIVE_REGN_DATE': '01/15/2020',
      'PRECINCT_CODE': '      04A',
      'STATUS': 'Active',
      'MAIL_STATE': 'TN'
    };

    const std = normalizeRowWithMapping(rawRecord);

    expect(std.voter_id).toBe('109928374');
    expect(std.first_name).toBe('MARY');
    expect(std.last_name).toBe('JOHNSON');
    expect(std.name).toBe('MARY JOHNSON');
    expect(std.county).toBe('Hinds County');
    expect(std.zip).toBe('39201');
    expect(std.date_registered).toBe('01/15/2020');
    expect(std.precinct_code).toBe('04A');
    expect(std.mail_state).toBe('TN');
    expect(std.status).toBe('Active');
  });
});
