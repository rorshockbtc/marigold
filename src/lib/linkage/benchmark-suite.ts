/**
 * Marigold Insights: Canonical 1,000-Pair Ground Truth Linkage Benchmark Suite
 * 
 * Executes synthetic verification against Marigold's Fellegi-Sunter engine
 * to empirically establish Precision, Recall, F1-Score, and False Positive Rates.
 */

import { fellegiSunterScore, LinkageRecord, FellegiSunterResult } from './fellegi-sunter';

export interface BenchmarkPair {
  id: string;
  category: 'TYPO_NOISE' | 'NCOA_RELOCATION' | 'FAMILIAL_TRAP' | 'RANDOM_CONTROL';
  recordA: LinkageRecord;
  recordB: LinkageRecord;
  isTrueDuplicate: boolean; // Ground Truth
}

export interface BenchmarkSummary {
  totalPairs: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  categoryBreakdown: {
    typoAccuracy: number;
    ncoaAccuracy: number;
    familialResistance: number;
    randomSpecificity: number;
  };
  executionTimeMs: number;
}

/**
 * Generates the canonical 1,000-pair synthetic ground truth dataset
 */
export function generateGroundTruthDataset(): BenchmarkPair[] {
  const pairs: BenchmarkPair[] = [];

  const firstNames = ['JOHN', 'ROBERT', 'WILLIAM', 'MARY', 'PATRICIA', 'JENNIFER', 'MICHAEL', 'DAVID', 'ELIZABETH', 'JAMES', 'KATHERINE', 'THOMAS', 'JOSEPH', 'SUSAN', 'CHARLES'];
  const lastNames = ['SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'MILLER', 'DAVIS', 'GARCIA', 'RODRIGUEZ', 'WILSON', 'MARTINEZ', 'ANDERSON', 'TAYLOR', 'THOMAS', 'HERNANDEZ'];
  const streets = ['MAIN ST', 'OAK AVE', 'ELM ST', 'MAPLE DR', 'PINE LN', 'CEDAR CT', 'WASHINGTON BLVD', 'LAKE RD', 'HILLSIDE WAY', 'PARK AVE'];
  const zips = ['39201', '39202', '39205', '39501', '38601', '39401'];

  // 1. Category A: Typographical & Clerical Noise (250 pairs -> True Duplicates)
  for (let i = 0; i < 250; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const street = `${100 + i} ${streets[i % streets.length]}`;
    const zip = zips[i % zips.length];
    const dob = `19${60 + (i % 30)}-05-12`;

    // Introduce typographical noise in B
    let lastB = last;
    if (i % 3 === 0) lastB = last + 'S'; // Plural/suffix typo
    else if (i % 3 === 1 && last.length > 3) lastB = last.slice(0, -1); // Dropped char
    
    let firstB = first;
    if (i % 5 === 0 && first === 'ROBERT') firstB = 'BOB';
    if (i % 5 === 1 && first === 'WILLIAM') firstB = 'BILL';
    if (i % 5 === 2 && first === 'ELIZABETH') firstB = 'BETH';

    pairs.push({
      id: `TYPO-${i + 1}`,
      category: 'TYPO_NOISE',
      isTrueDuplicate: true,
      recordA: { first_name: first, last_name: last, address: street, zip, dob, city: 'JACKSON', state: 'MS' },
      recordB: { first_name: firstB, last_name: lastB, address: street, zip, dob, city: 'JACKSON', state: 'MS' }
    });
  }

  // 2. Category B: NCOA / Cross-Precinct Relocations (250 pairs -> True Duplicates)
  for (let i = 0; i < 250; i++) {
    const first = firstNames[(i + 3) % firstNames.length];
    const last = lastNames[(i + 5) % lastNames.length];
    const streetA = `${200 + i} ${streets[i % streets.length]}`;
    const streetB = `${800 + i} ${streets[(i + 2) % streets.length]}`; // Moved across town
    const zipA = zips[i % zips.length];
    const zipB = zips[(i + 1) % zips.length];
    const dob = `19${70 + (i % 25)}-11-20`;

    pairs.push({
      id: `NCOA-${i + 1}`,
      category: 'NCOA_RELOCATION',
      isTrueDuplicate: true,
      recordA: { first_name: first, last_name: last, address: streetA, zip: zipA, dob, city: 'JACKSON', state: 'MS' },
      recordB: { first_name: first, last_name: last, address: streetB, zip: zipB, dob, city: 'GULFPORT', state: 'MS' }
    });
  }

  // 3. Category C: Familial & Generational Traps (250 pairs -> True Negatives!)
  for (let i = 0; i < 250; i++) {
    const last = lastNames[(i + 2) % lastNames.length];
    const street = `${500 + i} ${streets[i % streets.length]}`;
    const zip = zips[i % zips.length];

    // Father vs Son or Mother vs Daughter at exact same address
    const firstA = 'JOHN';
    const firstB = i % 2 === 0 ? 'JOHN' : 'MICHAEL';
    const lastA = i % 2 === 0 ? `${last} SR` : last;
    const lastB = i % 2 === 0 ? `${last} JR` : last;
    const dobA = `19${50 + (i % 15)}-03-10`;
    const dobB = `19${80 + (i % 15)}-08-15`; // Born 30 years later!

    pairs.push({
      id: `FAM-${i + 1}`,
      category: 'FAMILIAL_TRAP',
      isTrueDuplicate: false,
      recordA: { first_name: firstA, last_name: lastA, address: street, zip, dob: dobA, city: 'BILOXI', state: 'MS' },
      recordB: { first_name: firstB, last_name: lastB, address: street, zip, dob: dobB, city: 'BILOXI', state: 'MS' }
    });
  }

  // 4. Category D: Unrelated Random Controls (250 pairs -> True Negatives!)
  for (let i = 0; i < 250; i++) {
    const firstA = firstNames[i % firstNames.length];
    const firstB = firstNames[(i + 7) % firstNames.length];
    const lastA = lastNames[i % lastNames.length];
    const lastB = lastNames[(i + 4) % lastNames.length];
    const streetA = `${10 + i} ${streets[i % streets.length]}`;
    const streetB = `${90 + i} ${streets[(i + 3) % streets.length]}`;
    const dobA = `19${65 + (i % 20)}-01-01`;
    const dobB = `19${85 + (i % 10)}-06-15`;

    pairs.push({
      id: `RND-${i + 1}`,
      category: 'RANDOM_CONTROL',
      isTrueDuplicate: false,
      recordA: { first_name: firstA, last_name: lastA, address: streetA, zip: zips[0], dob: dobA, city: 'JACKSON', state: 'MS' },
      recordB: { first_name: firstB, last_name: lastB, address: streetB, zip: zips[1], dob: dobB, city: 'TUPELO', state: 'MS' }
    });
  }

  return pairs;
}

/**
 * Runs the benchmark suite and returns comprehensive statistical accuracy metrics
 */
export function runLinkageBenchmark(customPairs?: BenchmarkPair[]): BenchmarkSummary {
  const startTime = performance.now();
  const dataset = customPairs || generateGroundTruthDataset();

  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  let typoCorrect = 0;
  let ncoaCorrect = 0;
  let familialCorrect = 0;
  let randomCorrect = 0;

  for (const pair of dataset) {
    const result = fellegiSunterScore(pair.recordA, pair.recordB);
    
    // In our audit workflow, MATCH_HIGH and REVIEW_MODERATE are flagged as potential duplicates
    const isFlaggedAsDuplicate = result.verdict === 'MATCH_HIGH' || result.verdict === 'REVIEW_MODERATE';

    if (pair.isTrueDuplicate) {
      if (isFlaggedAsDuplicate) {
        truePositives++;
        if (pair.category === 'TYPO_NOISE') typoCorrect++;
        if (pair.category === 'NCOA_RELOCATION') ncoaCorrect++;
      } else {
        falseNegatives++;
      }
    } else {
      if (!isFlaggedAsDuplicate) {
        trueNegatives++;
        if (pair.category === 'FAMILIAL_TRAP') familialCorrect++;
        if (pair.category === 'RANDOM_CONTROL') randomCorrect++;
      } else {
        falsePositives++;
      }
    }
  }

  const endTime = performance.now();
  const executionTimeMs = Number((endTime - startTime).toFixed(2));

  const totalPairs = dataset.length;
  const precision = truePositives + falsePositives > 0 
    ? Number(((truePositives / (truePositives + falsePositives)) * 100).toFixed(1)) 
    : 100.0;
  
  const recall = truePositives + falseNegatives > 0 
    ? Number(((truePositives / (truePositives + falseNegatives)) * 100).toFixed(1)) 
    : 100.0;

  const f1Score = precision + recall > 0 
    ? Number(((2 * precision * recall) / (precision + recall)).toFixed(1)) 
    : 100.0;

  const falsePositiveRate = falsePositives + trueNegatives > 0 
    ? Number(((falsePositives / (falsePositives + trueNegatives)) * 100).toFixed(1)) 
    : 0.0;

  const countByCategory = (cat: string) => dataset.filter(p => p.category === cat).length || 1;

  return {
    totalPairs,
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    precision,
    recall,
    f1Score,
    falsePositiveRate,
    categoryBreakdown: {
      typoAccuracy: Number(((typoCorrect / countByCategory('TYPO_NOISE')) * 100).toFixed(1)),
      ncoaAccuracy: Number(((ncoaCorrect / countByCategory('NCOA_RELOCATION')) * 100).toFixed(1)),
      familialResistance: Number(((familialCorrect / countByCategory('FAMILIAL_TRAP')) * 100).toFixed(1)),
      randomSpecificity: Number(((randomCorrect / countByCategory('RANDOM_CONTROL')) * 100).toFixed(1))
    },
    executionTimeMs
  };
}
