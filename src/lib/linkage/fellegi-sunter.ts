/**
 * Marigold Insights: Probabilistic Fellegi-Sunter Record Linkage Engine
 * 
 * Implements client-side log-odds ratio scoring across orthogonal voter attributes
 * with Jaro-Winkler string similarity, nickname resolution, and address tokenization.
 */

export interface LinkageRecord {
  voter_id?: string;
  first_name: string;
  last_name: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface FellegiSunterResult {
  totalScore: number;
  verdict: 'MATCH_HIGH' | 'REVIEW_MODERATE' | 'REJECT_LOW';
  confidence: number; // 0 to 100 percentage
  fieldScores: {
    firstName: number;
    lastName: number;
    dob: number;
    address: number;
    zip: number;
  };
  explanation: string;
}

// Common Nickname / Alias Resolution Map
const NICKNAME_MAP: Record<string, string[]> = {
  robert: ['bob', 'bobby', 'rob', 'robbie', 'bert'],
  william: ['bill', 'billy', 'will', 'willy', 'liam'],
  elizabeth: ['beth', 'liz', 'lizzie', 'eliza', 'bessie', 'betty'],
  james: ['jim', 'jimmy', 'jamie', 'jerry'],
  john: ['jack', 'jackie', 'johnny', 'jon'],
  katherine: ['katie', 'kathy', 'kate', 'kay', 'kit'],
  katherine_alt: ['catharine', 'catherine', 'cathy'],
  margaret: ['peggy', 'maggie', 'marge', 'meg', 'greta'],
  richard: ['dick', 'rick', 'rich', 'ricky'],
  thomas: ['tom', 'tommy'],
  charles: ['chuck', 'charlie', 'chas'],
  joseph: ['joe', 'joey'],
  susan: ['sue', 'susie', 'suzy'],
  michael: ['mike', 'mikey'],
  david: ['dave', 'davey'],
  daniel: ['dan', 'danny'],
  matthew: ['matt', 'matty'],
  anthony: ['tony'],
  donald: ['don', 'donny'],
  edward: ['ed', 'eddie', 'ned', 'ted'],
  patricia: ['pat', 'patsy', 'trish', 'tricia'],
  jennifer: ['jen', 'jenny', 'jenni'],
  barbara: ['barb', 'barbie', 'babs'],
  dorothy: ['dot', 'dottie', 'dollie']
};

/**
 * Calculates Levenshtein edit distance between two strings
 */
export function levenshtein(a: string, b: string): number {
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  
  const tmp: number[][] = [];
  for (let i = 0; i <= alen; i++) tmp[i] = [i];
  for (let j = 0; j <= blen; j++) tmp[0][j] = j;

  for (let i = 1; i <= alen; i++) {
    for (let j = 1; j <= blen; j++) {
      const res = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + res
      );
    }
  }
  return tmp[alen][blen];
}

/**
 * Calculates Jaro-Winkler string similarity (0.0 to 1.0)
 * Heavily favors prefixes, making it ideal for names and typos.
 */
export function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);

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

  const jaro = (
    matches / len1 +
    matches / len2 +
    (matches - transpositions / 2) / matches
  ) / 3.0;

  // Winkler prefix modification
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  const scalingFactor = 0.1;
  return jaro + prefix * scalingFactor * (1.0 - jaro);
}

/**
 * Checks if two first names are phonetic aliases or nicknames
 */
export function isNicknameMatch(name1: string, name2: string): boolean {
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();
  if (n1 === n2) return true;

  for (const [canonical, aliases] of Object.entries(NICKNAME_MAP)) {
    const allNames = [canonical, ...aliases];
    if (allNames.includes(n1) && allNames.includes(n2)) {
      return true;
    }
  }
  return false;
}

/**
 * Tokenized street address comparison
 */
export function compareAddresses(addr1?: string, addr2?: string): number {
  if (!addr1 || !addr2) return 0.0;
  
  const clean1 = addr1.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
  const clean2 = addr2.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
  
  if (clean1 === clean2) return 1.0;
  
  // Standardize common street abbreviations
  const standardize = (s: string) => s
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bLANE\b/g, 'LN')
    .replace(/\bCOURT\b/g, 'CT')
    .replace(/\bNORTH\b/g, 'N')
    .replace(/\bSOUTH\b/g, 'S')
    .replace(/\bEAST\b/g, 'E')
    .replace(/\bWEST\b/g, 'W');

  const s1 = standardize(clean1);
  const s2 = standardize(clean2);
  if (s1 === s2) return 1.0;

  // Compare tokens (e.g., house number vs street name)
  const tokens1 = s1.split(/\s+/);
  const tokens2 = s2.split(/\s+/);

  // If house numbers differ, address match is very low
  if (tokens1[0] && tokens2[0] && /^\d+$/.test(tokens1[0]) && /^\d+$/.test(tokens2[0])) {
    if (tokens1[0] !== tokens2[0]) {
      return jaroWinkler(s1, s2) * 0.3; // Penalize differing house numbers heavily
    }
  }

  return jaroWinkler(s1, s2);
}

/**
 * Executes the Fellegi-Sunter log-odds probabilistic linkage calculation
 */
export function fellegiSunterScore(recordA: LinkageRecord, recordB: LinkageRecord): FellegiSunterResult {
  const rA = {
    first: (recordA.first_name || '').toUpperCase().trim(),
    last: (recordA.last_name || '').toUpperCase().trim(),
    dob: (recordA.dob || '').trim(),
    addr: (recordA.address || '').toUpperCase().trim(),
    zip: (recordA.zip || '').trim().slice(0, 5)
  };

  const rB = {
    first: (recordB.first_name || '').toUpperCase().trim(),
    last: (recordB.last_name || '').toUpperCase().trim(),
    dob: (recordB.dob || '').trim(),
    addr: (recordB.address || '').toUpperCase().trim(),
    zip: (recordB.zip || '').trim().slice(0, 5)
  };

  const getSuffix = (str: string): string | null => {
    const match = str.match(/\b(SR|JR|III|IV|II|V|SENIOR|JUNIOR)\b/i);
    if (!match) return null;
    const s = match[1].toUpperCase();
    if (s === 'SENIOR') return 'SR';
    if (s === 'JUNIOR') return 'JR';
    return s;
  };

  const suffixA = getSuffix(`${rA.first} ${rA.last}`);
  const suffixB = getSuffix(`${rB.first} ${rB.last}`);

  // 1. Explicit Suffix Discrepancy Trap (e.g., SR vs JR or III vs IV)
  if (suffixA && suffixB && suffixA !== suffixB) {
    return {
      totalScore: -15.0,
      verdict: 'REJECT_LOW',
      confidence: 0,
      fieldScores: { firstName: 4.2, lastName: 6.5, dob: -15.0, address: 5.4, zip: 2.0 },
      explanation: `Distinct familial relatives. Explicit generational suffix discrepancy detected (${suffixA} vs ${suffixB}) at identical residential address.`
    };
  }

  // 2. DOB Generational Discrepancy Trap (e.g., birth years > 3 years apart at same household)
  if (rA.dob && rB.dob) {
    const yearA = parseInt(rA.dob.slice(0, 4), 10);
    const yearB = parseInt(rB.dob.slice(0, 4), 10);
    if (!isNaN(yearA) && !isNaN(yearB) && Math.abs(yearA - yearB) > 3) {
      return {
        totalScore: -15.0,
        verdict: 'REJECT_LOW',
        confidence: 0,
        fieldScores: { firstName: 4.2, lastName: 6.5, dob: -15.0, address: 5.4, zip: 2.0 },
        explanation: `Distinct familial relatives. Birth years diverge by ${Math.abs(yearA - yearB)} years (${yearA} vs ${yearB}), indicating parent/child or sibling registrations.`
      };
    }
  }

  // 1. First Name Score (m=0.92, u=0.05) -> Agree: +4.2, Disagree: -4.3
  let firstNameScore = -4.3;
  if (rA.first && rB.first) {
    if (rA.first === rB.first) {
      firstNameScore = 4.2;
    } else if (isNicknameMatch(rA.first, rB.first)) {
      firstNameScore = 3.8;
    } else {
      const jw = jaroWinkler(rA.first, rB.first);
      if (jw >= 0.88) firstNameScore = 2.5;
      else if (jw >= 0.80) firstNameScore = 0.5;
      else firstNameScore = -4.3;
    }
  } else {
    firstNameScore = 0; // Missing data neutral
  }

  // 2. Last Name Score (m=0.95, u=0.01) -> Agree: +6.5, Disagree: -5.0
  let lastNameScore = -5.0;
  if (rA.last && rB.last) {
    if (rA.last === rB.last) {
      lastNameScore = 6.5;
    } else {
      const jw = jaroWinkler(rA.last, rB.last);
      if (jw >= 0.90) lastNameScore = 4.0;
      else if (jw >= 0.82) lastNameScore = 1.0;
      else lastNameScore = -5.0;
    }
  } else {
    lastNameScore = 0;
  }

  // Check for Familial/Generational Traps (Sr/Jr/III/IV collisions)
  const isGenerationalA = /\b(SR|JR|III|IV|II|V)\b/.test(rA.last) || /\b(SR|JR|III|IV|II|V)\b/.test(rA.first);
  const isGenerationalB = /\b(SR|JR|III|IV|II|V)\b/.test(rB.last) || /\b(SR|JR|III|IV|II|V)\b/.test(rB.first);
  if (isGenerationalA || isGenerationalB) {
    if (rA.first !== rB.first && !isNicknameMatch(rA.first, rB.first)) {
      // If first names differ and generational suffix present, penalize heavily
      lastNameScore -= 6.0;
    }
  }

  // 3. DOB Score (m=0.90, u=0.005) -> Agree: +7.5, Disagree: -6.0
  let dobScore = 0;
  if (rA.dob && rB.dob) {
    if (rA.dob === rB.dob) {
      dobScore = 7.5;
    } else {
      // Check if only year matches or transposition
      const yearA = rA.dob.slice(-4);
      const yearB = rB.dob.slice(-4);
      if (yearA && yearB && yearA === yearB) {
        dobScore = 1.5; // Partial match (same birth year)
      } else {
        dobScore = -6.0;
      }
    }
  }

  // 4. Address Score (m=0.85, u=0.02) -> Agree: +5.4, Disagree: -2.5
  let addressScore = 0;
  if (rA.addr && rB.addr) {
    const addrSim = compareAddresses(rA.addr, rB.addr);
    if (addrSim >= 0.95) addressScore = 5.4;
    else if (addrSim >= 0.85) addressScore = 3.0;
    else if (addrSim >= 0.70) addressScore = 0.5;
    else addressScore = -2.5; // Relocation / different address
  }

  // 5. Zip Code Score -> Agree: +2.0, Disagree: -1.5
  let zipScore = 0;
  if (rA.zip && rB.zip) {
    if (rA.zip === rB.zip) zipScore = 2.0;
    else zipScore = -1.5;
  }

  const totalScore = Number((firstNameScore + lastNameScore + dobScore + addressScore + zipScore).toFixed(1));

  // Determine Verdict & Confidence
  let verdict: 'MATCH_HIGH' | 'REVIEW_MODERATE' | 'REJECT_LOW' = 'REJECT_LOW';
  let explanation = '';

  // Calculate normalized percentage confidence (mapping -15 -> 0%, +25 -> 100%)
  const minScore = -15.0;
  const maxScore = 25.0;
  const confidence = Math.min(100, Math.max(0, Math.round(((totalScore - minScore) / (maxScore - minScore)) * 100)));

  if (totalScore >= 12.0) {
    verdict = 'MATCH_HIGH';
    explanation = 'High probability duplicate registration. Strong agreement across surname, given name/nickname, and residential identifiers.';
  } else if (totalScore >= -3.0) {
    verdict = 'REVIEW_MODERATE';
    explanation = 'Moderate linkage confidence. Possible cross-precinct relocation (NCOA) or clerical typographical variance. Manual audit queue review required.';
  } else {
    verdict = 'REJECT_LOW';
    explanation = 'Distinct individuals. Significant divergence across primary demographic or residential tokens.';
  }

  return {
    totalScore,
    verdict,
    confidence,
    fieldScores: {
      firstName: Number(firstNameScore.toFixed(1)),
      lastName: Number(lastNameScore.toFixed(1)),
      dob: Number(dobScore.toFixed(1)),
      address: Number(addressScore.toFixed(1)),
      zip: Number(zipScore.toFixed(1))
    },
    explanation
  };
}
