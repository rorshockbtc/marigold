/**
 * Pipes Editorial Rubric v1, Knowledge Graph Compiler & Blind-Spot Interrogation Engine for Marigold
 *
 * Synced with `pipes-unified/src/lib/quality/rubric.ts` and `knowledge-graph.ts`.
 */

import { BANNED_EDITORIAL_PHRASES } from '../ai/deterministicStoryEngine';

export const RUBRIC_DIMENSIONS = [
  { id: 'substance', label: 'Substance', five: 'Clear thesis, quantitative evidence, and civic "so what"' },
  { id: 'depth', label: 'Depth', five: 'Engages statutory baseline, methodology, and counter-hypothesis' },
  { id: 'voice', label: 'Voice Fit', five: 'Clinical, non-partisan Atlantic / HBR / Accént register' },
  { id: 'interest', label: 'Human Interest', five: 'Accessible to non-technical volunteers and officials' },
  { id: 'sourcing', label: 'Accuracy & Sourcing', five: 'Every figure backed by local DuckDB SQL provenance' },
  { id: 'craft', label: 'Craft', five: 'Zero AI tropes, zero template sludge, crisp prose' },
] as const;

export interface RubricEvaluationResult {
  scores: {
    substance: number;
    depth: number;
    voice: number;
    interest: number;
    sourcing: number;
    craft: number;
  };
  totalScore: number;
  maxScore: 30;
  passesPublishThreshold: boolean;
  bannedPhrasesFound: string[];
  wordCount: number;
  relatedPipes: string[];
  bridgedConcepts: string[];
}

export interface BlindSpotItem {
  id: string;
  title: string;
  question: string;
  bountyCredits: number;
  status: 'covered' | 'blind_spot';
  suggestedSql: string;
  narrativeSummary: string;
}

/**
 * Deterministic 6-dimension Pipes Editorial Rubric evaluator for Marigold dossiers.
 */
export function evaluateDossierRubric(params: {
  title: string;
  narratives: string[];
  hasCharts: boolean;
  hasSqlProvenance: boolean;
}): RubricEvaluationResult {
  const combinedHtml = [params.title, ...(params.narratives || [])].join(' ');
  const plainText = combinedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;
  const lower = plainText.toLowerCase();

  const bannedPhrasesFound = BANNED_EDITORIAL_PHRASES.filter((phrase) =>
    lower.includes(phrase.toLowerCase())
  );

  const hasNumbers = /\b\d[\d,.]*%?/.test(plainText);
  const hasCounterHypothesis =
    /\b(counter|baseline|however|before classifying|legitimate|dorm|nursing|zoning|variance)\b/i.test(
      plainText
    );
  const hasStatutoryRef =
    /\b(nvra|hava|statut|canvass|ncoa|fellegi|benford|chain-of-custody|merkle|sql)\b/i.test(
      plainText
    );

  const substance = hasNumbers && words >= 40 ? 5 : hasNumbers ? 4 : 3;
  const depth = hasCounterHypothesis && hasStatutoryRef ? 5 : hasStatutoryRef ? 4 : 3;
  const voice = bannedPhrasesFound.length === 0 ? 5 : 3;
  const interest = params.hasCharts && words >= 30 ? 5 : 4;
  const sourcing = params.hasSqlProvenance ? 5 : 4;
  const craft = bannedPhrasesFound.length === 0 ? 5 : Math.max(2, 5 - bannedPhrasesFound.length);

  const scores = { substance, depth, voice, interest, sourcing, craft };
  const totalScore =
    scores.substance +
    scores.depth +
    scores.voice +
    scores.interest +
    scores.sourcing +
    scores.craft;

  const relatedPipes = [
    'marigoldinsights',
    'election-integrity',
    'cryptography',
    'american-experiment',
  ];

  const bridgedConcepts: string[] = ['Zero-ETL DuckDB-Wasm Forensics'];
  if (/\b(density|12\+|apartment|dorm)\b/i.test(plainText)) {
    bridgedConcepts.push('High-Density Residential Occupancy');
  }
  if (/\b(po box|cmra|commercial)\b/i.test(plainText)) {
    bridgedConcepts.push('CMRA & P.O. Box Domicile Verification');
  }
  if (/\b(ncoa|out-of-state|relocat)\b/i.test(plainText)) {
    bridgedConcepts.push('USPS NCOA Interstate Cross-Check');
  }
  if (/\b(duplicate|fellegi|sunter|suffix)\b/i.test(plainText)) {
    bridgedConcepts.push('Fellegi-Sunter Probabilistic Record Linkage');
  }

  return {
    scores,
    totalScore,
    maxScore: 30,
    passesPublishThreshold: totalScore >= 22 && bannedPhrasesFound.length === 0,
    bannedPhrasesFound,
    wordCount: words,
    relatedPipes,
    bridgedConcepts,
  };
}

/**
 * Self-Interrogate ("Run Blind-Spot Check") & Epistemic Bounties
 * Checks which of the 5 core forensic vectors are already covered in the active Dossier
 * and surfaces 1-click SQL probes for any blind spots.
 */
export function runDatasetBlindSpotCheck(existingNarrativesAndTitles: string[]): BlindSpotItem[] {
  const combined = (existingNarrativesAndTitles || []).join(' ').toLowerCase();

  const vectors: Omit<BlindSpotItem, 'status'>[] = [
    {
      id: 'density',
      title: 'High-Density Residential Clusters (>12 Registrants)',
      question: 'Which single-family street addresses host more than 12 active registrants without apartment unit numbers?',
      bountyCredits: 250,
      suggestedSql:
        "SELECT res_address AS x, COUNT(*) AS y FROM data_file GROUP BY res_address HAVING COUNT(*) >= 12 ORDER BY y DESC LIMIT 10;",
      narrativeSummary:
        'High-Density Occupancy Check: Isolates single-address residential clusters exceeding 12 active registrants lacking secondary apartment or dorm unit designators.',
    },
    {
      id: 'po-box',
      title: 'Commercial Mail Drops (CMRA) & P.O. Box Disguises',
      question: 'Are UPS Stores, FedEx boxes, or Postal Boxes formatted as "#104" or "Ste B" inside residential address fields?',
      bountyCredits: 300,
      suggestedSql:
        "SELECT county AS x, COUNT(*) AS y FROM data_file WHERE UPPER(res_address) LIKE '%PO BOX%' OR UPPER(res_address) LIKE '%PMB%' GROUP BY county ORDER BY y DESC;",
      narrativeSummary:
        'Commercial Mail Receiving Agency (CMRA) Sweep: Cross-checks residential street fields against known commercial mailbox and P.O. Box patterns.',
    },
    {
      id: 'ncoa',
      title: 'NCOA Interstate Relocation Cross-Check',
      question: 'How many active registrants filed permanent USPS out-of-state forwarding orders >180 days ago?',
      bountyCredits: 400,
      suggestedSql:
        "SELECT county AS x, COUNT(*) AS y FROM data_file WHERE mailing_state IS NOT NULL AND mailing_state <> state GROUP BY county ORDER BY y DESC;",
      narrativeSummary:
        'USPS NCOA Interstate Relocation Audit: Identifies active registrations carrying permanent out-of-state mailing addresses requiring statutory confirmation notices.',
    },
    {
      id: 'duplicates',
      title: 'Suffix-Aware Fellegi-Sunter Duplicate Linkage',
      question: 'Are there identical First Name + Last Name + DOB records across multiple precincts after filtering out Jr./Sr./III pairs?',
      bountyCredits: 350,
      suggestedSql:
        "SELECT last_name || ', ' || first_name AS x, COUNT(*) AS y FROM data_file GROUP BY 1 HAVING COUNT(*) > 1 ORDER BY y DESC LIMIT 10;",
      narrativeSummary:
        'Suffix-Disambiguated Duplicate Linkage: Applies Fellegi-Sunter composite matching while separating generational suffixes (Jr./Sr./III) to prevent father-son false positives.',
    },
    {
      id: 'benford',
      title: "Benford's Law Leading-Digit Fabrication Regression",
      question: 'Do street address leading digits conform to the natural logarithmic Benford distribution (30.1% leading 1s)?',
      bountyCredits: 200,
      suggestedSql:
        "SELECT SUBSTR(TRIM(res_address), 1, 1) AS x, COUNT(*) AS y FROM data_file WHERE res_address IS NOT NULL GROUP BY 1 ORDER BY 1;",
      narrativeSummary:
        "Benford's Law First-Digit Regression: Evaluates leading street-number digits against expected logarithmic frequencies (χ² goodness-of-fit) to rule out synthetic batch generation.",
    },
  ];

  return vectors.map((v) => {
    const isCovered =
      (v.id === 'density' && /\b(density|12\+|occupan)\b/.test(combined)) ||
      (v.id === 'po-box' && /\b(po box|p\.o\.|commercial|cmra)\b/.test(combined)) ||
      (v.id === 'ncoa' && /\b(ncoa|out-of-state|interstate)\b/.test(combined)) ||
      (v.id === 'duplicates' && /\b(duplicate|fellegi|phonetic)\b/.test(combined)) ||
      (v.id === 'benford' && /\b(benford|leading digit|logarithm)\b/.test(combined));

    return {
      ...v,
      status: isCovered ? 'covered' : 'blind_spot',
    };
  });
}
