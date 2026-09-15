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
  dob: string;
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
  dob: string;
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
    'voterkey', 'stateid', 'voterregid', 'voterregnum', 'voterregno', 'statevoteridnum',
    'voteridnumber', 'statevoteridnumber', 'voter_id', 'voter_reg_num', 'sos_voter_id'
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
    'fullname', 'voterfullname', 'displayname'
  ],
  status: [
    'voterstatus', 'regstatus', 'registrationstatus', 'activestatus',
    'statuscode', 'status'
  ],
  date_registered: [
    'registrationdate', 'dateregistered', 'regdate', 'origregdate',
    'effectivedate', 'enrolldate', 'appdate', 'dateadded'
  ],
  dob: [
    'dob', 'birthdate', 'dateofbirth', 'voterbirthdate', 'birth_date',
    'bdate', 'birthyear', 'yb', 'yob', 'yearofbirth'
  ],
  precinct_code: [
    'precinctname', 'precinctcode', 'precinctid', 'pctcode', 'precinct',
    'pct', 'wardprecinct', 'splitcode'
  ],
  ncoa_flag: [
    'ncoaflag', 'ncoastatus', 'ncoamatch', 'addresschangeflag', 'relocated'
  ]
};

// Jaro-Winkler String Distance Metric
function jaroWinklerDistance(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix scaling
  let prefix = 0;
  const maxPrefix = 4;
  for (let i = 0; i < Math.min(maxPrefix, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

export function evaluateSemanticMatchScore(sampleValues: string[], fieldKey: keyof ColumnMappingSchema): number {
  if (sampleValues.length === 0) return 0;
  let matches = 0;

  for (const rawVal of sampleValues) {
    const val = rawVal.trim();
    if (!val) continue;

    switch (fieldKey) {
      case 'zip':
        if (/^\d{5}(-\d{4})?$/.test(val)) matches++;
        break;
      case 'state':
        if (/^[A-Za-z]{2}$/.test(val) && val.length === 2) matches++;
        break;
      case 'date_registered':
        if (/^\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}$/.test(val)) matches++;
        break;
      case 'address':
        if (/^\d+\s+[A-Za-z0-9\s.,#-]+/.test(val) || /^(PO BOX|P.O. BOX|PMB)/i.test(val)) matches++;
        break;
      case 'first_name':
      case 'last_name':
        if (/^[A-Za-z' -]{2,30}$/.test(val) && !/\d/.test(val)) matches++;
        break;
      case 'voter_id':
        if (/^\d{6,12}$/.test(val) || /^(MS|SOS|VOT)[A-Za-z0-9-]+$/i.test(val)) matches++;
        break;
      case 'status':
        if (/^(ACTIVE|INACTIVE|CANCELLED|PURGED|DECEASED|A|I|C|P)$/i.test(val)) matches++;
        break;
      default:
        // Do not assign false-positive semantic match for unhandled fields
        break;
    }
  }

  return matches / sampleValues.length;
}

export function interpretColumnMappings(headers: string[], sampleRows: Record<string, any>[] = []): ColumnMappingSchema {
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
    dob: '',
    precinct_code: '',
    ncoa_flag: ''
  };

  const cleanMap = headers.map(h => ({
    original: h,
    clean: h.toLowerCase().replace(/[^a-z0-9]/g, '')
  }));

  const mappedCols = new Set<string>();

  // Extract sample values per header for semantic profiling
  const sampleValueMap = new Map<string, string[]>();
  for (const h of headers) {
    const vals: string[] = [];
    for (const r of sampleRows.slice(0, 50)) {
      if (r && r[h] !== undefined && r[h] !== null && String(r[h]).trim() !== '') {
        vals.push(String(r[h]).trim());
      }
    }
    sampleValueMap.set(h, vals);
  }

  // Pass 1: Direct Synonym Exact Match (100% Confidence)
  for (const [fieldKey, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    const key = fieldKey as keyof ColumnMappingSchema;
    for (const item of cleanMap) {
      if (mappedCols.has(item.original) || mapping[key]) continue;
      if (synonyms.includes(item.clean)) {
        mapping[key] = item.original;
        mappedCols.add(item.original);
      }
    }
  }

  // Pass 2: Hybrid Jaro-Winkler + Semantic Matching for Unmapped Headers
  for (const [fieldKey, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    const key = fieldKey as keyof ColumnMappingSchema;
    if (mapping[key]) continue;

    let bestMatchHeader = '';
    let highestScore = 0;

    for (const item of cleanMap) {
      if (mappedCols.has(item.original)) continue;

      let maxLexicalScore = 0;
      for (const syn of synonyms) {
        if (syn.length <= 3) continue;
        const dist = jaroWinklerDistance(item.clean, syn);
        if (dist > maxLexicalScore) maxLexicalScore = dist;
      }

      const sampleVals = sampleValueMap.get(item.original) || [];
      const semanticScore = sampleRows.length > 0 ? evaluateSemanticMatchScore(sampleVals, key) : 0;

      // DeepMind Hybrid Formula: (Lexical * 0.4) + (Semantic * 0.6)
      const hybridScore = sampleRows.length > 0 ? (maxLexicalScore * 0.4) + (semanticScore * 0.6) : maxLexicalScore;

      // Strict Threshold check: Must score at least 0.75 confidence
      if (hybridScore >= 0.75 && hybridScore > highestScore) {
        highestScore = hybridScore;
        bestMatchHeader = item.original;
      }
    }

    if (bestMatchHeader) {
      mapping[key] = bestMatchHeader;
      mappedCols.add(bestMatchHeader);
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
        if (strVal === countyName || strVal === `${countyName} COUNTY`) {
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

  const exactCity = getValue(activeMapping.city, ['city', 'residentialcity', 'rescity', 'cityname'], extractActualCityName(rawRow));
  let exactCounty = getValue(activeMapping.county, ['county', 'rescounty', 'countyname'], '');
  if (!exactCounty) {
    exactCounty = extractActualCountyName(rawRow);
  } else if (!exactCounty.toUpperCase().includes('COUNTY')) {
    exactCounty = exactCounty.charAt(0).toUpperCase() + exactCounty.slice(1).toLowerCase() + ' County';
  }

  return {
    voter_id: getValue(activeMapping.voter_id, ['sosvoterid', 'voterid', 'voterregistrationnumber', 'statevoterid'], 'N/A (Unlisted)'),
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
    dob: getValue(activeMapping.dob, ['dob', 'birthdate', 'dateofbirth', 'birth_date', 'bdate'], ''),
    precinct_code: getValue(activeMapping.precinct_code, ['precinct', 'pct'], ''),
    ncoa_flag: getValue(activeMapping.ncoa_flag, ['ncoaflag', 'ncoa'], ''),
    raw: { ...rawRow }
  };
}
