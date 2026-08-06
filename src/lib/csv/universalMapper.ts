export interface ColumnMappingSchema {
  voter_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
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
  middle_name: string;
  last_name: string;
  suffix: string;
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

const MISSISSIPPI_82_COUNTIES = [
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

const FIELD_SYNONYMS: Record<keyof ColumnMappingSchema, string[]> = {
  voter_id: [
    'sosvoterid', 'voterid', 'voterregistrationnumber', 'registrationnumber',
    'sosid', 'voterregnum', 'idnumber', 'statevoterid', 'regnum', 'voteridnum',
    'id', 'voterkey', 'stateid', 'voterregid'
  ],
  first_name: [
    'firstname', 'voterfirstname', 'fname', 'first', 'namefirst', 'givenname'
  ],
  middle_name: [
    'middlename', 'middle', 'mname', 'midname', 'votermiddlename'
  ],
  last_name: [
    'lastname', 'voterlastname', 'lname', 'last', 'namelast', 'surname'
  ],
  suffix: [
    'suffix', 'generation', 'suffixname', 'nametitle', 'votersuffix'
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
    'municipality', 'physcity', 'town', 'residentialcityname'
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
    'countyname', 'cntydesc', 'countyname', 'county', 'cnty'
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
    middle_name: '',
    last_name: '',
    suffix: '',
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

export function extractActualCountyName(rawRow: Record<string, any>): string {
  if (!rawRow || typeof rawRow !== 'object') return 'Hinds County';

  for (const [key, val] of Object.entries(rawRow)) {
    if (val !== undefined && val !== null) {
      const strVal = String(val).trim().toUpperCase();
      if (strVal.startsWith('SC0') || strVal.startsWith('SC1') || strVal.startsWith('CD0') || strVal.startsWith('SD0') || strVal.startsWith('HD0')) {
        continue;
      }
      for (const countyName of MISSISSIPPI_82_COUNTIES) {
        if (strVal === countyName || strVal === `${countyName} COUNTY` || strVal.startsWith(`${countyName} `)) {
          return `${countyName} County`;
        }
      }
    }
  }

  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey.includes('county') || cleanKey.includes('cnty')) {
      if (val !== undefined && val !== null) {
        const strVal = String(val).trim();
        const upperVal = strVal.toUpperCase();
        if (!upperVal.startsWith('SC0') && !upperVal.startsWith('CD0') && upperVal !== '' && upperVal !== 'NULL') {
          return upperVal.includes('COUNTY') ? strVal : `${strVal} County`;
        }
      }
    }
  }

  return 'Hinds County';
}

export function extractActualCityName(rawRow: Record<string, any>): string {
  if (!rawRow || typeof rawRow !== 'object') return '';

  // Prefer residential city over mailing city
  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey.includes('res') && cleanKey.includes('city')) {
      if (val !== undefined && val !== null) {
        const strVal = String(val).trim();
        if (strVal !== '' && strVal !== 'NULL') return strVal;
      }
    }
  }

  // General city fallback search
  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey.includes('city') || cleanKey.includes('town') || cleanKey.includes('municipality')) {
      if (!cleanKey.includes('mail')) {
        if (val !== undefined && val !== null) {
          const strVal = String(val).trim();
          if (strVal !== '' && strVal !== 'NULL') return strVal;
        }
      }
    }
  }

  return '';
}

export function normalizeRowWithMapping(rawRow: Record<string, any>, mapping?: ColumnMappingSchema): StandardizedVoterRow {
  if (!rawRow || typeof rawRow !== 'object') {
    return {
      voter_id: 'UNKNOWN',
      name: 'Unlisted Resident',
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      address: '',
      city: '',
      state: 'MS',
      zip: '',
      county: 'Hinds County',
      status: 'Active',
      date_registered: '',
      precinct_code: '',
      ncoa_flag: '',
      raw: {}
    };
  }

  const activeMapping = { ...(mapping || interpretColumnMappings(Object.keys(rawRow))) };

  const getValue = (headerKey: string, fallbackKeywords: string[], defaultVal = '') => {
    if (headerKey && rawRow[headerKey] !== undefined && rawRow[headerKey] !== null) {
      const v = String(rawRow[headerKey]).trim();
      if (v !== '') return v;
    }
    const keys = Object.keys(rawRow);

    // Fuzzy match for headerKey to bypass hidden \uFEFF BOM characters in raw CSV keys
    if (headerKey) {
      const cleanHeader = headerKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const k of keys) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanHeader) {
          const v = String(rawRow[k]).trim();
          if (v !== '') return v;
        }
      }
    }

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
  let middle = getValue(activeMapping.middle_name, ['middlename', 'middle', 'mname', 'midname'], '');
  let last = getValue(activeMapping.last_name, ['lastname', 'last', 'voterlastname', 'lname', 'surname'], '');
  let suffix = getValue(activeMapping.suffix, ['suffix', 'generation', 'nametitle'], '');
  let fullName = getValue(activeMapping.full_name, ['fullname', 'votername', 'name', 'voterfullname', 'displayname'], '');

  if (!first || !last) {
    for (const [k, v] of Object.entries(rawRow)) {
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!first && (cleanK === 'first' || cleanK === 'firstname' || cleanK === 'voterfirstname')) first = String(v).trim();
      if (!middle && (cleanK === 'middle' || cleanK === 'middlename' || cleanK === 'midname')) middle = String(v).trim();
      if (!last && (cleanK === 'last' || cleanK === 'lastname' || cleanK === 'voterlastname')) last = String(v).trim();
      if (!suffix && (cleanK === 'suffix' || cleanK === 'generation')) suffix = String(v).trim();
    }
  }

  if ((!first || !last) && fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      if (!first) first = parts[0];
      if (!last) last = parts[parts.length - 1];
    }
  }

  if (!fullName || fullName === 'Unlisted Resident' || fullName === first) {
    fullName = [first, middle, last, suffix].filter(Boolean).join(' ');
  }
  if (!fullName) fullName = 'Unlisted Resident';

  const exactCounty = extractActualCountyName(rawRow);
  const exactCity = getValue(activeMapping.city, ['city', 'residentialcity', 'rescity', 'cityname'], extractActualCityName(rawRow));

  return {
    voter_id: getValue(activeMapping.voter_id, ['voterid', 'sosvoterid', 'id'], `REC-${Math.floor(100000 + Math.random() * 900000)}`),
    name: fullName,
    first_name: first,
    middle_name: middle,
    last_name: last,
    suffix: suffix,
    address: getValue(activeMapping.address, ['address', 'streetaddress', 'residentialaddress', 'address1'], ''),
    city: exactCity,
    state: getValue(activeMapping.state, ['state', 'st'], 'MS'),
    zip: getValue(activeMapping.zip, ['zip', 'zipcode'], ''),
    county: exactCounty,
    status: getValue(activeMapping.status, ['status', 'voterstatus'], 'Active'),
    date_registered: getValue(activeMapping.date_registered, ['regdate', 'date_registered'], ''),
    precinct_code: getValue(activeMapping.precinct_code, ['precinct', 'pct'], ''),
    ncoa_flag: getValue(activeMapping.ncoa_flag, ['ncoaflag', 'ncoa'], ''),
    raw: { ...rawRow }
  };
}
