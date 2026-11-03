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
  house_num: string;
  street_name: string;
  street_type: string;
  mail_address: string;
  mail_city: string;
  mail_state: string;
  mail_zip: string;
  precinct_name: string;
  dist_cong: string;
  dist_sen: string;
  dist_rep: string;
  dist_sup: string;
  dist_da: string;
  dist_sc: string;
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
  house_num: string;
  street_name: string;
  street_type: string;
  mail_address: string;
  mail_city: string;
  mail_state: string;
  mail_zip: string;
  precinct_name: string;
  dist_cong: string;
  dist_sen: string;
  dist_rep: string;
  dist_sup: string;
  dist_da: string;
  dist_sc: string;
  dist_ec?: string;
  date_voted?: string;
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

const COUNTY_ALIASES: Record<string, string> = {
  'JEFF DAVIS': 'JEFFERSON DAVIS'
};

export function cleanZip5(rawZip: unknown): string {
  if (rawZip === undefined || rawZip === null) return '';
  const s = String(rawZip).trim();
  const m = s.match(/^(\d{5})(?:\s*-?\s*\d*)?$/);
  return m ? m[1] : s;
}

export function isCleanValue(val: any): boolean {
  if (val === undefined || val === null) return false;
  const s = String(val).trim();
  if (s === '') return false;
  const upper = s.toUpperCase();
  return upper !== 'NULL' && upper !== 'UNDEFINED' && upper !== 'NAN' && upper !== '\\N';
}

export function formatCountyName(rawCounty: string): string {
  if (!rawCounty || !isCleanValue(rawCounty)) return 'Hinds County';
  const clean = String(rawCounty).trim().replace(/\s+County$/i, '').trim();
  if (!clean || !isCleanValue(clean)) return 'Hinds County';
  const rawUpper = clean.toUpperCase();
  const upper = COUNTY_ALIASES[rawUpper] || rawUpper;
  const matched = MISSISSIPPI_82_COUNTIES.find(c => c === upper);
  if (matched) {
    if (matched === 'DESOTO') return 'DeSoto County';
    return matched.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') + ' County';
  }
  return clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') + ' County';
}

export function normalizeSuffix(rawSuffix: unknown): string {
  if (rawSuffix === undefined || rawSuffix === null) return '';
  let s = String(rawSuffix).trim();
  if (!s) return '';

  const lower = s.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'none' || lower === 'nan') {
    return '';
  }

  s = s.replace(/^[.\s*#\-+]+/, '').trim();
  if (!s) return '';

  s = s.toUpperCase();
  s = s.replace(/[.,\s]+$/, '').trim();

  if (s.includes('.')) {
    s = s.replace(/\./g, '').trim();
  }

  if (s === 'JUNIOR') return 'JR';
  if (s === 'SENIOR') return 'SR';

  return s;
}

export function isGenerationalSuffix(suffix: unknown): boolean {
  const clean = normalizeSuffix(suffix);
  return ['JR', 'SR', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].includes(clean);
}

const FIELD_SYNONYMS: Record<keyof ColumnMappingSchema, string[]> = {
  voter_id: [
    'mappingvalue', 'mapping_value', 'mapping val', 'mappingval',
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
    'reszipcode', 'res_zip_code', 'reszip',
    'residentialzip', 'residencezip', 'zipcode', 'postalcode',
    'zip5', 'zip', 'physzip'
  ],
  county: [
    'rescounty', 'residentialcounty', 'res_county',
    'countyname', 'cntydesc', 'county', 'cnty'
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
    'suffix', 'generation', 'suffixname', 'nametitle', 'votersuffix', 'name_suffix', 'voter_suffix', 'title'
  ],
  full_name: [
    'fullname', 'voterfullname', 'displayname'
  ],
  status: [
    'voterstatus', 'regstatus', 'registrationstatus', 'activestatus',
    'statuscode', 'status'
  ],
  date_registered: [
    'effectiveregndate', 'effective_regn_date', 'effectiveregdate', 'effectiveregistrationdate',
    'registrationdate', 'dateregistered', 'regdate', 'origregdate',
    'effectivedate', 'enrolldate', 'appdate', 'dateadded'
  ],
  dob: [
    'dob', 'birthdate', 'dateofbirth', 'voterbirthdate', 'birth_date',
    'bdate', 'birthyear', 'yb', 'yob', 'yearofbirth'
  ],
  precinct_code: [
    'precinctcode', 'precinctid', 'pctcode', 'precinct',
    'pct', 'wardprecinct', 'splitcode', 'precinct_code'
  ],
  ncoa_flag: [
    'ncoaflag', 'ncoastatus', 'ncoamatch', 'addresschangeflag', 'relocated'
  ],
  house_num: [
    'housenum', 'housenumber', 'house_num', 'house_number', 'hn', 'res_house_num', 'reshousenum'
  ],
  street_name: [
    'streetname', 'street_name', 'stname', 'st_name', 'res_street_name', 'resstreetname'
  ],
  street_type: [
    'streettype', 'street_type', 'sttype', 'st_type', 'streettypecode'
  ],
  mail_address: [
    'mailingaddress', 'mailaddress', 'mail_address', 'mailing_address', 'mailaddr', 'mail_addr', 'address2'
  ],
  mail_city: [
    'mailcity', 'mail_city', 'mailingcity', 'mailing_city'
  ],
  mail_state: [
    'mailstate', 'mail_state', 'mailingstate', 'mailing_state'
  ],
  mail_zip: [
    'mailzipcode', 'mail_zip_code', 'mailzip', 'mail_zip', 'mailingzip', 'mailingzipcode', 'mailing_zip'
  ],
  precinct_name: [
    'precinctname', 'precinct_name', 'pctname', 'pct_name', 'precinctdesc', 'precinctdescription'
  ],
  dist_cong: [
    'cong', 'congressional', 'congressionaldistrict', 'dist_cong', 'cd', 'congdist'
  ],
  dist_sen: [
    'sen', 'senate', 'senatedistrict', 'dist_sen', 'sd', 'senatedist'
  ],
  dist_rep: [
    'rep', 'house', 'representative', 'housedistrict', 'dist_rep', 'hd', 'repdist', 'statedist'
  ],
  dist_sup: [
    'sup', 'supr', 'supervisor', 'supervisordistrict', 'dist_sup', 'supervisordist', 'beat'
  ],
  dist_da: [
    'da', 'districtattorney', 'dist_da', 'dadistrict', 'prosecutor'
  ],
  dist_sc: [
    'sc', 'supremecourt', 'dist_sc', 'supremecourtdistrict', 'scdistrict'
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
      case 'mail_zip':
        if (/^\d{5}(\s*-?\s*\d{0,4})?$/.test(val)) matches++;
        break;
      case 'state':
      case 'mail_state':
        if (/^[A-Za-z]{2}$/.test(val) && val.length === 2) matches++;
        break;
      case 'date_registered':
        if (/^\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}$/.test(val)) matches++;
        break;
      case 'address':
      case 'mail_address':
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
      case 'house_num':
        if (/^\d+[A-Za-z]?$/.test(val)) matches++;
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
    ncoa_flag: '',
    house_num: '',
    street_name: '',
    street_type: '',
    mail_address: '',
    mail_city: '',
    mail_state: '',
    mail_zip: '',
    precinct_name: '',
    dist_cong: '',
    dist_sen: '',
    dist_rep: '',
    dist_sup: '',
    dist_da: '',
    dist_sc: ''
  };

  const cleanMap = headers
    .map(h => ({
      original: h,
      clean: h.toLowerCase().replace(/[^a-z0-9]/g, '')
    }))
    .filter(item => item.clean.length > 0);

  const mappedCols = new Set<string>();

  // Extract sample values per header for semantic profiling
  const sampleValueMap = new Map<string, string[]>();
  for (const h of headers) {
    const vals: string[] = [];
    for (const r of sampleRows.slice(0, 50)) {
      if (r && isCleanValue(r[h])) {
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

  for (const [, val] of Object.entries(rawRow)) {
    if (isCleanValue(val)) {
      const rawUpper = String(val).trim().toUpperCase().replace(/\s+COUNTY$/, '');
      const strVal = COUNTY_ALIASES[rawUpper] || rawUpper;
      if (strVal.startsWith('SC0') || strVal.startsWith('SC1') || strVal.startsWith('CD0') || strVal.startsWith('SD0') || strVal.startsWith('HD0')) {
        continue;
      }
      for (const countyName of MISSISSIPPI_82_COUNTIES) {
        if (strVal === countyName || strVal === `${countyName} COUNTY`) {
          return formatCountyName(countyName);
        }
      }
    }
  }

  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey.includes('county') || cleanKey.includes('cnty')) {
      if (isCleanValue(val)) {
        const strVal = String(val).trim();
        const upperVal = strVal.toUpperCase();
        if (!upperVal.startsWith('SC0') && !upperVal.startsWith('CD0')) {
          return formatCountyName(strVal);
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
      if (isCleanValue(val)) return String(val).trim();
    }
  }

  // General city fallback search
  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey.includes('city') || cleanKey.includes('town') || cleanKey.includes('municipality')) {
      if (!cleanKey.includes('mail')) {
        if (isCleanValue(val)) return String(val).trim();
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
      dob: '',
      precinct_code: '',
      ncoa_flag: '',
      house_num: '',
      street_name: '',
      street_type: '',
      mail_address: '',
      mail_city: '',
      mail_state: '',
      mail_zip: '',
      precinct_name: '',
      dist_cong: '',
      dist_sen: '',
      dist_rep: '',
      dist_sup: '',
      dist_da: '',
      dist_sc: '',
      raw: {}
    };
  }

  const activeMapping = { ...(mapping || interpretColumnMappings(Object.keys(rawRow), [rawRow])) };

  const getValue = (headerKey: string, fallbackKeywords: string[], defaultVal = '') => {
    if (headerKey && isCleanValue(rawRow[headerKey])) {
      return String(rawRow[headerKey]).trim();
    }
    const keys = Object.keys(rawRow);

    // Fuzzy match for headerKey to bypass hidden \uFEFF BOM characters in raw CSV keys
    if (headerKey) {
      const cleanHeader = headerKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const k of keys) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanHeader) {
          if (isCleanValue(rawRow[k])) {
            return String(rawRow[k]).trim();
          }
        }
      }
    }

    for (const kw of fallbackKeywords) {
      const cleanKw = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const k of keys) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanK === cleanKw) {
          if (isCleanValue(rawRow[k])) {
            return String(rawRow[k]).trim();
          }
        }
      }
    }
    return defaultVal;
  };

  const stripClericalPrefix = (val: string) => {
    if (!val) return '';
    return val.replace(/^[.\s*#]+/, '').trim();
  };

  let first = stripClericalPrefix(getValue(activeMapping.first_name, ['firstname', 'first', 'voterfirstname', 'fname', 'givenname'], ''));
  let middle = stripClericalPrefix(getValue(activeMapping.middle_name, ['middlename', 'middle', 'mname', 'midname'], ''));
  let last = stripClericalPrefix(getValue(activeMapping.last_name, ['lastname', 'last', 'voterlastname', 'lname', 'surname'], ''));
  let suffix = normalizeSuffix(getValue(activeMapping.suffix, ['suffix', 'generation', 'nametitle'], ''));
  let fullName = stripClericalPrefix(getValue(activeMapping.full_name, ['fullname', 'votername', 'name', 'voterfullname', 'displayname'], ''));

  if (!first || !last || !suffix) {
    for (const [k, v] of Object.entries(rawRow)) {
      if (!isCleanValue(v)) continue;
      const strVal = String(v).trim();
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!first && (cleanK === 'first' || cleanK === 'firstname' || cleanK === 'voterfirstname')) first = stripClericalPrefix(strVal);
      if (!middle && (cleanK === 'middle' || cleanK === 'middlename' || cleanK === 'midname')) middle = stripClericalPrefix(strVal);
      if (!last && (cleanK === 'last' || cleanK === 'lastname' || cleanK === 'voterlastname')) last = stripClericalPrefix(strVal);
      if (!suffix && (cleanK === 'suffix' || cleanK === 'generation')) suffix = normalizeSuffix(strVal);
    }
  }

  if ((!first || !last) && fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const candidateSuffix = normalizeSuffix(parts[parts.length - 1]);
      const isGen = ['JR', 'SR', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'MD', 'ESQ', 'PHD', 'DDS'].includes(candidateSuffix);
      if (isGen) {
        if (!suffix) suffix = candidateSuffix;
        parts.pop();
      }
      if (parts.length >= 1 && !first) first = stripClericalPrefix(parts[0]);
      if (parts.length >= 2 && !last) last = stripClericalPrefix(parts[parts.length - 1]);
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
  } else {
    exactCounty = formatCountyName(exactCounty);
  }

  const precinctCode = getValue(activeMapping.precinct_code, ['precinctcode', 'precinct_code', 'precinct', 'pct', 'precinctid'], '').trim();
  const precinctName = getValue(activeMapping.precinct_name, ['precinctname', 'precinct_name', 'pctname', 'precinctdesc'], '').trim();

  const houseNum = getValue(activeMapping.house_num, ['housenum', 'housenumber', 'house_num', 'hn'], '').trim();
  const streetName = getValue(activeMapping.street_name, ['streetname', 'street_name', 'stname'], '').trim();
  const streetType = getValue(activeMapping.street_type, ['streettype', 'street_type', 'sttype'], '').trim();

  const mailAddress = getValue(activeMapping.mail_address, ['mailingaddress', 'mailaddress', 'mail_address', 'mailing_address', 'mailaddr'], '').trim();
  const mailCity = getValue(activeMapping.mail_city, ['mailcity', 'mail_city', 'mailingcity'], '').trim();
  const mailState = getValue(activeMapping.mail_state, ['mailstate', 'mail_state', 'mailingstate'], '').trim();
  const mailZip = cleanZip5(getValue(activeMapping.mail_zip, ['mailzipcode', 'mail_zip_code', 'mailzip', 'mail_zip', 'mailingzip'], '').trim());

  const distCong = getValue(activeMapping.dist_cong, ['cong', 'dist_cong', 'congressional'], '').trim();
  const distSen = getValue(activeMapping.dist_sen, ['sen', 'dist_sen', 'senate'], '').trim();
  const distRep = getValue(activeMapping.dist_rep, ['rep', 'dist_rep', 'house', 'representative'], '').trim();
  const distSup = getValue(activeMapping.dist_sup, ['supr', 'sup', 'dist_sup', 'supervisor'], '').trim();
  const distDa = getValue(activeMapping.dist_da, ['da', 'dist_da', 'districtattorney'], '').trim();
  const distSc = getValue(activeMapping.dist_sc, ['sc', 'dist_sc', 'supremecourt'], '').trim();
  const distEc = getValue('', ['ec', 'dist_ec', 'electioncommissioner'], '').trim();
  const dateVoted = getValue('', ['datevoted', 'date_voted', 'lastvoted', 'last_voted', 'voteddate'], '').trim();

  return {
    voter_id: getValue(activeMapping.voter_id, ['mappingvalue', 'mapping_value', 'sosvoterid', 'voterid', 'voterregistrationnumber', 'statevoterid'], 'N/A (Unlisted)'),
    name: fullName,
    first_name: first,
    middle_name: middle,
    last_name: last,
    suffix: suffix,
    address: getValue(activeMapping.address, ['address', 'streetaddress', 'residentialaddress', 'address1'], ''),
    city: exactCity,
    state: getValue(activeMapping.state, ['state', 'st'], 'MS'),
    zip: cleanZip5(getValue(activeMapping.zip, ['reszipcode', 'res_zip_code', 'zip', 'zipcode'], '')),
    county: exactCounty,
    status: getValue(activeMapping.status, ['status', 'voterstatus'], 'Active'),
    date_registered: getValue(activeMapping.date_registered, ['effectiveregndate', 'effective_regn_date', 'regdate', 'date_registered', 'registrationdate'], ''),
    dob: getValue(activeMapping.dob, ['dob', 'birthdate', 'dateofbirth', 'birth_date', 'bdate'], ''),
    precinct_code: precinctCode,
    ncoa_flag: getValue(activeMapping.ncoa_flag, ['ncoaflag', 'ncoa'], ''),
    house_num: houseNum,
    street_name: streetName,
    street_type: streetType,
    mail_address: mailAddress,
    mail_city: mailCity,
    mail_state: mailState,
    mail_zip: mailZip,
    precinct_name: precinctName,
    dist_cong: distCong,
    dist_sen: distSen,
    dist_rep: distRep,
    dist_sup: distSup,
    dist_da: distDa,
    dist_sc: distSc,
    dist_ec: distEc,
    date_voted: dateVoted,
    raw: { ...rawRow }
  };
}
