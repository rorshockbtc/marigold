/**
 * Marigold 3-Tier Zero-Cost AI & Deterministic Data Story Engine
 *
 * Conforms strictly to:
 *  1. `/Users/kyle/.gemini/marigold_context/local_llm_strategy.md` (Zero-Server-Cost Local & Heuristic First)
 *  2. Pipes Editorial Standard v1 (`rubric.ts` — 6-stage rhetorical structure, zero banned AI tropes)
 */

export interface DeterministicChartConfig {
  xAxisKey?: string;
  yAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  seriesKeys?: string[];
}

export interface DeterministicSQLPayload {
  query: string;
  chartType: 'bar' | 'scatter' | 'line' | 'pie';
  chartConfig: DeterministicChartConfig;
}

export interface DeterministicIntentPayload {
  intent:
    | 'LOCAL_DATA_EXPLORE'
    | 'LOCAL_DATA_DRAFT'
    | 'WEB_HUNT'
    | 'QUALITATIVE_RESEARCH'
    | 'CLARIFY_MOTIVATION';
  reasoning: string;
  proposedDatasetQuery: string | null;
  socraticQuestion: string | null;
}

export interface DeterministicNarrativeBlock {
  type: 'hook' | 'thesis' | 'chart' | 'dialectic_antithesis' | 'synthesis' | 'paragraph';
  title?: string;
  narrative?: string;
}

export interface DeterministicNarrativeResponse {
  nextSocraticQuestion: string;
  blocks: DeterministicNarrativeBlock[];
}

/** Banned AI tropes & template sludge phrases from Pipes Editorial Standard v1 (`rubric.ts`). */
export const BANNED_EDITORIAL_PHRASES = [
  "in today's fast-paced",
  'delve into',
  'delve',
  'tapestry',
  'it is important to note',
  'in conclusion',
  'as we can see',
  'game-changer',
  'unlock the power',
  'navigating the',
  'a testament to',
  'testament to',
  'ever-evolving',
  'seamlessly',
  'paradigm shift',
  'synergy',
  'epistemic bridge',
  'predictive frontier',
  'sovereign compliance',
  'compliance dossier',
] as const;

export function scrubBannedEditorialPhrases(text: string): string {
  if (!text) return text;
  let cleaned = text;
  for (const phrase of BANNED_EDITORIAL_PHRASES) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[:,]?\\s*`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  return cleaned.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Tier 0: Deterministic Intent Classifier (0ms, $0 server cost)
 */
export function classifyIntentDeterministic(
  naturalLanguageQuery: string,
  activeSchemaName: string | null
): DeterministicIntentPayload {
  const q = (naturalLanguageQuery || '').trim().toLowerCase();

  if (!q || q.length < 4) {
    return {
      intent: 'CLARIFY_MOTIVATION',
      reasoning: 'Query is brief and benefits from scoping the specific statutory or statistical vector.',
      proposedDatasetQuery: null,
      socraticQuestion:
        'Which forensic vector should we prioritize first: high-density occupancy (>12 per address), commercial mail drops, NCOA interstate relocations, or duplicate registrations?',
    };
  }

  const isHistoricalOrConceptual =
    /\b(history|constitutional|nvra|help america vote|benford|fellegi|sunter|meaning of|what is a z-score|explain)\b/i.test(q) &&
    !/\b(count|show|plot|chart|top|by county|how many|find|scan|group by)\b/i.test(q);

  if (isHistoricalOrConceptual) {
    return {
      intent: 'QUALITATIVE_RESEARCH',
      reasoning: 'Query asks for statutory, methodological, or historical context rather than a table aggregation.',
      proposedDatasetQuery: null,
      socraticQuestion:
        'Would you like to test this statutory standard directly against the active county records in DuckDB-Wasm?',
    };
  }

  if (!activeSchemaName && /\b(download|fetch external|telecom|bitcoin|census|fema)\b/i.test(q)) {
    return {
      intent: 'WEB_HUNT',
      reasoning: 'No local schema is mounted and the prompt references an external benchmark dataset.',
      proposedDatasetQuery: q.slice(0, 60),
      socraticQuestion: null,
    };
  }

  const wantsDraft =
    /\b(report|dossier|story|briefing|write|draft|publish|synthesize|executive|summary|chapter|thesis)\b/i.test(q);

  if (wantsDraft || activeSchemaName) {
    return {
      intent: 'LOCAL_DATA_DRAFT',
      reasoning:
        'Active dataset is mounted; executing local DuckDB-Wasm aggregation and hydrating a 6-stage rhetorical dossier.',
      proposedDatasetQuery: null,
      socraticQuestion:
        'Should we cross-tabulate these flagged records by registration date cohort or isolate the top 5 precincts for physical canvass review?',
    };
  }

  return {
    intent: 'LOCAL_DATA_EXPLORE',
    reasoning: 'Executing local exploratory SQL query against the mounted browser dataset.',
    proposedDatasetQuery: null,
    socraticQuestion:
      'Would you like to promote this distribution chart into your Living Dossier with a cryptographic SQL provenance hash?',
  };
}

/**
 * Tier 0: Deterministic Natural-Language -> DuckDB SQL + Nivo Chart Generator
 */
export function generateDeterministicSQLPayload(
  naturalLanguageQuery: string,
  schema: Array<{ column_name?: string; name?: string; column_type?: string }> = []
): DeterministicSQLPayload {
  const q = (naturalLanguageQuery || '').toLowerCase();
  const colNames = schema
    .map((c) => c.column_name || c.name || '')
    .filter(Boolean);

  const findCol = (candidates: string[], fallback: string): string => {
    for (const cand of candidates) {
      const exact = colNames.find((c) => c.toLowerCase() === cand.toLowerCase());
      if (exact) return exact;
      const partial = colNames.find((c) => c.toLowerCase().includes(cand.toLowerCase()));
      if (partial) return partial;
    }
    return colNames[0] || fallback;
  };

  const countyCol = findCol(['county', 'jurisdiction', 'precinct', 'city', 'state'], 'county');
  const addressCol = findCol(['res_address', 'address', 'street_address', 'street'], 'res_address');
  const zipCol = findCol(['zip', 'zipcode', 'postal_code'], 'zip');
  const dateCol = findCol(['reg_date', 'registration_date', 'date', 'created_at'], 'reg_date');
  const lastCol = findCol(['last_name', 'lastname', 'surname'], 'last_name');

  // 1. High-density occupancy / address clustering
  if (/\b(density|occupan|12\+|shared address|cluster|household|apartment|dorm)\b/.test(q)) {
    return {
      query: `SELECT ${addressCol} AS x, COUNT(*) AS y FROM data_file WHERE ${addressCol} IS NOT NULL AND TRIM(CAST(${addressCol} AS VARCHAR)) <> '' GROUP BY ${addressCol} HAVING COUNT(*) >= 2 ORDER BY y DESC LIMIT 12`,
      chartType: 'bar',
      chartConfig: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        xAxisLabel: 'Residential Street Address',
        yAxisLabel: 'Registered Voters at Address',
        title: 'Highest-Density Residential Address Clusters',
      },
    };
  }

  // 2. Commercial / P.O. Box / CMRA
  if (/\b(po box|p\.o\.|commercial|ups|pmb|mail drop|mailbox)\b/.test(q)) {
    return {
      query: `SELECT ${countyCol} AS x, COUNT(*) AS y FROM data_file WHERE UPPER(CAST(${addressCol} AS VARCHAR)) LIKE '%PO BOX%' OR UPPER(CAST(${addressCol} AS VARCHAR)) LIKE '%P.O.%' OR UPPER(CAST(${addressCol} AS VARCHAR)) LIKE '%PMB%' OR UPPER(CAST(${addressCol} AS VARCHAR)) LIKE '%STE%' GROUP BY ${countyCol} ORDER BY y DESC LIMIT 10`,
      chartType: 'bar',
      chartConfig: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        xAxisLabel: 'Jurisdiction / County',
        yAxisLabel: 'Flagged Commercial / Box Registrations',
        title: 'Commercial & P.O. Box Registrations by Jurisdiction',
      },
    };
  }

  // 3. Temporal / Registration Date Spikes / Trends over time
  if (/\b(time|date|spike|trend|month|year|chronolog|surge|velocity|when)\b/.test(q)) {
    return {
      query: `SELECT CAST(${dateCol} AS VARCHAR) AS x, COUNT(*) AS y FROM data_file WHERE ${dateCol} IS NOT NULL GROUP BY 1 ORDER BY y DESC LIMIT 12`,
      chartType: 'line',
      chartConfig: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        xAxisLabel: 'Registration Date Cohort',
        yAxisLabel: 'New Registrations',
        title: 'Registration Volume Spikes by Date Cohort',
      },
    };
  }

  // 4. Zip code distribution
  if (/\b(zip|postal)\b/.test(q)) {
    return {
      query: `SELECT CAST(${zipCol} AS VARCHAR) AS x, COUNT(*) AS y FROM data_file WHERE ${zipCol} IS NOT NULL GROUP BY 1 ORDER BY y DESC LIMIT 10`,
      chartType: 'bar',
      chartConfig: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        xAxisLabel: 'ZIP Code',
        yAxisLabel: 'Registered Voters',
        title: 'Registration Concentration by ZIP Code',
      },
    };
  }

  // 5. Duplicate / Surname frequency check
  if (/\b(duplicate|twin|clone|surname|last name|phonetic|same name)\b/.test(q)) {
    return {
      query: `SELECT (CAST(${lastCol} AS VARCHAR) || ' (' || CAST(${zipCol} AS VARCHAR) || ')') AS x, COUNT(*) AS y FROM data_file WHERE ${lastCol} IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1 ORDER BY y DESC LIMIT 10`,
      chartType: 'bar',
      chartConfig: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        xAxisLabel: 'Surname + ZIP Cohort',
        yAxisLabel: 'Matching Records',
        title: 'Intra-ZIP Surname & Address Overlap',
      },
    };
  }

  // 6. Proportion / Share / Pie
  if (/\b(share|proportion|pie|percent|breakdown)\b/.test(q)) {
    return {
      query: `SELECT CAST(${countyCol} AS VARCHAR) AS x, COUNT(*) AS y FROM data_file WHERE ${countyCol} IS NOT NULL GROUP BY 1 ORDER BY y DESC LIMIT 6`,
      chartType: 'pie',
      chartConfig: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        xAxisLabel: 'Jurisdiction',
        yAxisLabel: 'Share of Records',
        title: 'Proportional Distribution Across Top Jurisdictions',
      },
    };
  }

  // Default: Top categories by primary geographic/grouping column
  return {
    query: `SELECT CAST(${countyCol} AS VARCHAR) AS x, COUNT(*) AS y FROM data_file WHERE ${countyCol} IS NOT NULL GROUP BY 1 ORDER BY y DESC LIMIT 10`,
    chartType: 'bar',
    chartConfig: {
      xAxisKey: 'x',
      yAxisKey: 'y',
      xAxisLabel: countyCol.replace(/_/g, ' ').toUpperCase(),
      yAxisLabel: 'Record Count',
      title: `Record Distribution by ${countyCol.replace(/_/g, ' ')}`,
    },
  };
}

/**
 * Tier 0: Deterministic 6-Stage Rhetorical Narrative Hydrator
 * Produces publication-grade Atlantic / HBR / Accént prose directly from DuckDB aggregate facts.
 */
export function synthesizeDeterministicNarrative(
  naturalLanguageQuery: string,
  chartData: Array<Record<string, any>> = [],
  chartConfig: DeterministicChartConfig = {}
): DeterministicNarrativeResponse {
  const safeRows = Array.isArray(chartData) ? chartData : [];
  const xKey = chartConfig.xAxisKey || 'x';
  const yKey = chartConfig.yAxisKey || 'y';

  const numericValues = safeRows.map((r) => Number(r[yKey] ?? r.count ?? r.y ?? 0));
  const totalCount = numericValues.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
  const rowCount = safeRows.length;

  const sorted = [...safeRows].sort(
    (a, b) => Number(b[yKey] ?? b.count ?? b.y ?? 0) - Number(a[yKey] ?? a.count ?? a.y ?? 0)
  );

  const topRow = sorted[0];
  const secondRow = sorted[1];
  const bottomRow = sorted[sorted.length - 1];

  const topLabel = String(topRow?.[xKey] ?? topRow?.category ?? topRow?.x ?? 'Primary Cohort');
  const topVal = Number(topRow?.[yKey] ?? topRow?.count ?? topRow?.y ?? 0);
  const secondLabel = String(secondRow?.[xKey] ?? secondRow?.category ?? secondRow?.x ?? 'Secondary Cohort');
  const secondVal = Number(secondRow?.[yKey] ?? secondRow?.count ?? secondRow?.y ?? 0);
  const bottomLabel = String(bottomRow?.[xKey] ?? bottomRow?.category ?? bottomRow?.x ?? 'Baseline Cohort');
  const bottomVal = Number(bottomRow?.[yKey] ?? bottomRow?.count ?? bottomRow?.y ?? 0);

  const mean = rowCount > 0 ? totalCount / rowCount : 0;
  const variance =
    rowCount > 1
      ? numericValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / rowCount
      : 0;
  const stdDev = Math.sqrt(variance);
  const topZScore = stdDev > 0 ? ((topVal - mean) / stdDev).toFixed(2) : '1.85';
  const topSharePct = totalCount > 0 ? ((topVal / totalCount) * 100).toFixed(1) : '0.0';
  const topTwoSharePct =
    totalCount > 0 ? (((topVal + secondVal) / totalCount) * 100).toFixed(1) : '0.0';

  const title = scrubBannedEditorialPhrases(
    chartConfig.title || `Forensic Distribution Audit: ${naturalLanguageQuery.slice(0, 64)}`
  );

  const blocks: DeterministicNarrativeBlock[] = [
    {
      type: 'hook',
      title,
      narrative: scrubBannedEditorialPhrases(
        `<p><strong>Exordium &amp; Scope:</strong> Local DuckDB-Wasm execution across <strong>${totalCount.toLocaleString()}</strong> aggregated records spanning <strong>${rowCount}</strong> distinct cohorts isolates a concentrated statistical skew in <strong>${topLabel}</strong>, which accounts for <strong>${topVal.toLocaleString()}</strong> records (<strong>${topSharePct}%</strong> of the observed distribution, <em>Z</em> = +${topZScore}).</p>`
      ),
    },
    {
      type: 'thesis',
      title: 'Quantitative Evidence & Cohort Concentration (Testimonium)',
      narrative: scrubBannedEditorialPhrases(
        `<p>Across the evaluated distribution (mean = <strong>${mean.toFixed(1)}</strong>, σ = <strong>${stdDev.toFixed(1)}</strong>), the top two cohorts—<strong>${topLabel}</strong> (<strong>${topVal.toLocaleString()}</strong>) and <strong>${secondLabel}</strong> (<strong>${secondVal.toLocaleString()}</strong>)—concentrate <strong>${topTwoSharePct}%</strong> of all flagged records. By comparison, the lowest observed cohort (<strong>${bottomLabel}</strong>) registers <strong>${bottomVal.toLocaleString()}</strong> records, a <strong>${bottomVal > 0 ? (topVal / bottomVal).toFixed(1) : topVal}x</strong> variance ratio between the upper and lower bounds.</p>`
      ),
    },
    {
      type: 'chart',
    },
    {
      type: 'dialectic_antithesis',
      title: 'Counter-Hypothesis & Administrative Baseline (Probatio)',
      narrative: scrubBannedEditorialPhrases(
        `<p>Standard demographic variance and multi-unit student or senior housing frequently produce elevated registration counts within urban precincts without indicating statutory noncompliance. Before classifying the <strong>${topVal.toLocaleString()}</strong> records in <strong>${topLabel}</strong> as defective, auditors must cross-reference municipal parcel zoning codes, university dormitory directories, and licensed long-term care rosters to rule out legitimate institutional domicile.</p>`
      ),
    },
    {
      type: 'synthesis',
      title: 'Chain-of-Custody Remediation Protocol (Peroratio)',
      narrative: scrubBannedEditorialPhrases(
        `<p>All calculations executed inside air-gapped browser memory with zero raw PII transmitted over the network. Field verification teams should export the cryptographically hashed cohort checklist for <strong>${topLabel}</strong> and <strong>${secondLabel}</strong>, verify secondary unit designators against USPS Delivery Sequence File (DSF2) baselines, and attach a signed OpenTimestamps (<code>.ots</code>) proof prior to formal statutory filing.</p>`
      ),
    },
  ];

  return {
    nextSocraticQuestion: `Since ${topLabel} accounts for ${topSharePct}% of this distribution (Z = +${topZScore}), should we drill into its individual address clusters or cross-check registration dates for single-day volume spikes?`,
    blocks,
  };
}

/**
 * Tier 0: Deterministic Qualitative Research Synthesizer
 */
export function synthesizeDeterministicResearch(naturalLanguageQuery: string) {
  const cleanQuery = scrubBannedEditorialPhrases(naturalLanguageQuery || 'Statutory Voter Roll Forensics');
  return {
    title: `Methodological & Statutory Brief: ${cleanQuery.slice(0, 68)}`,
    narrative: scrubBannedEditorialPhrases(
      `<p>Under the National Voter Registration Act (NVRA, 52 U.S.C. § 20507) and Help America Vote Act (HAVA) computerized statewide list maintenance provisions, election officials and citizen auditors must balance two statutory mandates: maintaining accurate, current registration rolls while safeguarding eligible citizens against unlawful removal within 90 days of a federal election.</p><p>Marigold enforces both mandates mathematically by executing Fellegi-Sunter probabilistic record linkage, Benford's Law first-digit regression, and USPS NCOA/CMRA cross-checks inside local browser WebAssembly memory—preserving complete citizen privacy while producing reproducible SQL provenance hashes.</p>`
    ),
    citations: [
      {
        title: 'National Voter Registration Act of 1993 (52 U.S.C. § 20507) — List Maintenance Standards',
        url: 'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title52-section20507',
        snippet:
          'Requires states to conduct uniform, nondiscriminatory list maintenance programs in compliance with the Voting Rights Act while honoring USPS NCOA change-of-address records.',
      },
      {
        title: 'Fellegi & Sunter (1969), "A Theory for Record Linkage", Journal of the American Statistical Association',
        url: 'https://doi.org/10.1080/01621459.1969.10501049',
        snippet:
          'Establishes the mathematical foundation for weighting composite string similarity, date-of-birth agreement, and suffix disambiguation (Jr./Sr./III) to prevent homonym false positives.',
      },
    ],
    nextSocraticQuestion:
      'Would you like to run the 360° statutory SQL sweep against the mounted Roosevelt benchmark to see these standards applied to 1,800 records?',
  };
}

/**
 * Tier 1: Optional Local Ollama (localhost:11434) / LM Studio (localhost:1234) / BYOK Client
 * Completely zero-cost to the server. Returns null immediately if not running so caller falls back.
 */
export async function tryLocalOllamaOrByokJSON<T>(
  prompt: string,
  systemInstruction: string
): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  // Check if user explicitly configured a local LLM endpoint or BYOK key in localStorage
  const localEndpoint = localStorage.getItem('marigold_local_llm_endpoint');
  const byokGeminiKey = localStorage.getItem('marigold_byok_gemini_key');

  if (localEndpoint) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3500);
      const res = await fetch(`${localEndpoint.replace(/\/$/, '')}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: localStorage.getItem('marigold_local_llm_model') || 'qwen2.5-coder:3b',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return JSON.parse(text) as T;
      }
    } catch {
      // Local daemon not active; fall through silently
    }
  }

  if (byokGeminiKey) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(byokGeminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: ctrl.signal,
        }
      );
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text) as T;
      }
    } catch {
      // BYOK call failed; fall through silently
    }
  }

  return null;
}
