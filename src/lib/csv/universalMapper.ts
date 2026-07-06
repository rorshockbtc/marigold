export interface ColumnMappingSchema {
  voter_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  status: string;
  date_registered: string;
  precinct_code: string;
  ncoa_flag: string;
}

export interface StandardizedVoterRow {
  voter_id: string;
  name: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  status: string;
  date_registered: string;
  precinct_code: string;
  ncoa_flag: string;
  raw: Record<string, any>;
}

const FIELD_SYNONYMS: Record<keyof ColumnMappingSchema, string[]> = {
  voter_id: [
    'sosvoterid', 'voterid', 'voterregistrationnumber', 'registrationnumber',
    'sosid', 'voterregnum', 'idnumber', 'statevoterid', 'regnum', 'voteridnum',
    'id', 'voterkey', 'stateid', 'voterregid'
  ],
  first_name: [
    'firstname', 'voterfirstname', 'fname', 'first', 'namefirst', 'givenname'
  ],
  last_name: [
    'lastname', 'voterlastname', 'lname', 'last', 'namelast', 'surname'
  ],
  full_name: [
    'fullname', 'votername', 'name', 'voterfullname', 'displayname'
  ],
  address: [
    'residentialaddress', 'residenceaddress', 'streetaddress', 'resstreet',
    'resaddr', 'resaddress', 'physicaladdress', 'addressline1', 'address1',
    'street', 'domicileaddress', 'address'
  ],
  city: [
    'residentialcity', 'residencecity', 'rescity', 'cityname', 'city',
    'municipality', 'physcity'
  ],
  state: [
    'residentialstate', 'residencestate', 'resstate', 'statename', 'st',
    'state', 'physstate'
  ],
  zip: [
    'residentialzip', 'residencezip', 'reszip', 'zipcode', 'postalcode',
    'zip5', 'zip', 'physzip'
  ],
  county: [
    'countyname', 'cntydesc', 'countycode', 'jurisdiction', 'county',
    'cnty', 'parish', 'countyjurisdiction'
  ],
  status: [
    'voterstatus', 'regstatus', 'registrationstatus', 'activestatus',
    'statuscode', 'status'
  ],
  date_registered: [
    'registrationdate', 'dateregistered', 'regdate', 'origregdate',
    'effectivedate', 'enrolldate', 'appdate', 'dateadded'
  ],
  precinct_code: [
    'precinctname', 'precinctcode', 'precinctid', 'pctcode', 'precinct',
    'pct', 'wardprecinct', 'splitcode'
  ],
  ncoa_flag: [
    'ncoaflag', 'ncoastatus', 'ncoamatch', 'addresschangeflag', 'relocated'
  ]
};

export function interpretColumnMappings(headers: string[]): ColumnMappingSchema {
  const mapping: ColumnMappingSchema = {
    voter_id: '',
    first_name: '',
    last_name: '',
    full_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    county: '',
    status: '',
    date_registered: '',
    precinct_code: '',
    ncoa_flag: ''
  };

  const cleanMap = headers.map(h => ({
    original: h,
    clean: h.toLowerCase().replace(/[^a-z0-9]/g, '')
  }));

  const mappedCols = new Set<string>();

  // 1. Exact clean matches first
  for (const [fieldKey, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    const key = fieldKey as keyof ColumnMappingSchema;
    for (const syn of synonyms) {
      if (mapping[key]) break;
      const match = cleanMap.find(c => c.clean === syn && !mappedCols.has(c.original));
      if (match) {
        mapping[key] = match.original;
        mappedCols.add(match.original);
      }
    }
  }

  // 2. Substring matches for unassigned fields
  for (const [fieldKey, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    const key = fieldKey as keyof ColumnMappingSchema;
    if (mapping[key]) continue;

    for (const syn of synonyms) {
      if (syn.length <= 3) continue;
      if (mapping[key]) break;
      const match = cleanMap.find(c => (c.clean.includes(syn) || syn.includes(c.clean)) && !mappedCols.has(c.original));
      if (match) {
        mapping[key] = match.original;
        mappedCols.add(match.original);
      }
    }
  }

  return mapping;
}

export function normalizeRowWithMapping(rawRow: Record<string, any>, mapping?: ColumnMappingSchema): StandardizedVoterRow {
  if (!rawRow || typeof rawRow !== 'object') {
    return {
      voter_id: 'UNKNOWN',
      name: 'Unlisted Resident',
      first_name: '',
      last_name: '',
      address: '',
      city: 'Unknown City',
      state: 'MS',
      zip: '',
      county: 'Statewide',
      status: 'Active',
      date_registered: '',
      precinct_code: '',
      ncoa_flag: '',
      raw: {}
    };
  }

  const activeMapping = { ...(mapping || interpretColumnMappings(Object.keys(rawRow))) };

  // Self-healing check: if full_name collides with first_name or last_name, clear it
  if (activeMapping.full_name && (activeMapping.full_name === activeMapping.first_name || activeMapping.full_name === activeMapping.last_name)) {
    activeMapping.full_name = '';
  }

  const getValue = (headerKey: string, fallbackKeywords: string[], defaultVal = '') => {
    if (headerKey && rawRow[headerKey] !== undefined && rawRow[headerKey] !== null) {
      const v = String(rawRow[headerKey]).trim();
      if (v !== '') return v;
    }
    // Fallback search across keys if headerKey didn't work
    const keys = Object.keys(rawRow);
    for (const kw of fallbackKeywords) {
      const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const k of keys) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanK === cleanKw) {
          const v = String(rawRow[k]).trim();
          if (v !== '') return v;
        }
      }
    }
    return defaultVal;
  };

  let first = getValue(activeMapping.first_name, ['firstname', 'first', 'voterfirstname', 'fname', 'givenname'], '');
  let last = getValue(activeMapping.last_name, ['lastname', 'last', 'voterlastname', 'lname', 'surname'], '');
  let fullName = getValue(activeMapping.full_name, ['fullname', 'votername', 'name', 'voterfullname', 'displayname'], '');

  if ((!first || !last) && fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      if (!first) first = parts[0];
      if (!last) last = parts[parts.length - 1];
    }
  }

  if (!fullName && (first || last)) {
    fullName = [first, last].filter(Boolean).join(' ');
  }
  if (!fullName) fullName = 'Unlisted Resident';

  return {
    voter_id: getValue(activeMapping.voter_id, ['voterid', 'sosvoterid', 'id'], `REC-${Math.floor(100000 + Math.random() * 900000)}`),
    name: fullName,
    first_name: first,
    last_name: last,
    address: getValue(activeMapping.address, ['address', 'streetaddress', 'residentialaddress', 'address1'], ''),
    city: getValue(activeMapping.city, ['city', 'residentialcity'], 'Unknown City'),
    state: getValue(activeMapping.state, ['state', 'st'], 'MS'),
    zip: getValue(activeMapping.zip, ['zip', 'zipcode'], ''),
    county: getValue(activeMapping.county, ['county', 'countyname', 'jurisdiction'], 'Statewide'),
    status: getValue(activeMapping.status, ['status', 'voterstatus'], 'Active'),
    date_registered: getValue(activeMapping.date_registered, ['regdate', 'date_registered'], ''),
    precinct_code: getValue(activeMapping.precinct_code, ['precinct', 'pct'], ''),
    ncoa_flag: getValue(activeMapping.ncoa_flag, ['ncoaflag', 'ncoa'], ''),
    raw: { ...rawRow }
  };
}
