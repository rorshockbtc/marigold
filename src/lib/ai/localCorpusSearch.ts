/**
 * MARIGOLD ZERO-DEPENDENCY LOCAL BM25 CORPUS SEARCH & TAP-OUT LOOP GUARD
 * ======================================================================
 * Provides sub-millisecond offline hybrid lexical search across Marigold's
 * 14 statutory playbooks, Mississippi & North Carolina Zero-PII report briefs,
 * and sovereign privacy documentation — plus the 2-Iteration Tap-Out Guard.
 */

export interface CorpusDoc {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "playbook" | "state_report" | "architecture";
  statutoryCitation?: string;
  tags: string[];
}

export interface LocalBM25Index {
  docs: CorpusDoc[];
  docFreq: Map<string, number>;
  avgLen: number;
  tokenizedDocs: Array<{
    doc: CorpusDoc;
    titleTokens: string[];
    tagTokens: string[];
    summaryTokens: string[];
    contentTokens: string[];
    totalLen: number;
  }>;
}

export interface CorpusHit {
  doc: CorpusDoc;
  score: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

export function buildLocalBM25CorpusIndex(docs: CorpusDoc[]): LocalBM25Index {
  const docFreq = new Map<string, number>();
  let totalLen = 0;

  const tokenizedDocs = docs.map((doc) => {
    const titleTokens = tokenize(doc.title);
    const tagTokens = tokenize(doc.tags.join(" "));
    const summaryTokens = tokenize(doc.summary);
    const contentTokens = tokenize(`${doc.content} ${doc.statutoryCitation || ""}`);
    const allUnique = new Set([...titleTokens, ...tagTokens, ...summaryTokens, ...contentTokens]);
    for (const term of allUnique) {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    }
    const len = titleTokens.length + tagTokens.length + summaryTokens.length + contentTokens.length;
    totalLen += len;
    return { doc, titleTokens, tagTokens, summaryTokens, contentTokens, totalLen: Math.max(1, len) };
  });

  return {
    docs,
    docFreq,
    avgLen: docs.length > 0 ? totalLen / docs.length : 1,
    tokenizedDocs,
  };
}

function scoreFieldTerm(tokens: string[], term: string, weight: number, docLen: number, avgLen: number): number {
  let tf = 0;
  for (const t of tokens) {
    if (t === term) tf += 1;
    else if (term.length >= 4 && (t.startsWith(term) || term.startsWith(t))) tf += 0.65;
  }
  if (tf === 0) return 0;
  const k1 = 1.2;
  const b = 0.75;
  const norm = tf * (k1 + 1) / (tf + k1 * (1 - b + b * (docLen / Math.max(1, avgLen))));
  return norm * weight;
}

export function queryLocalBM25Corpus(
  index: LocalBM25Index,
  query: string,
  limit = 5
): CorpusHit[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const N = Math.max(1, index.docs.length);
  const hits: CorpusHit[] = [];

  for (const entry of index.tokenizedDocs) {
    let score = 0;
    for (const q of qTokens) {
      const df = index.docFreq.get(q) || 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const fieldScore =
        scoreFieldTerm(entry.titleTokens, q, 3.0, entry.totalLen, index.avgLen) +
        scoreFieldTerm(entry.tagTokens, q, 2.5, entry.totalLen, index.avgLen) +
        scoreFieldTerm(entry.summaryTokens, q, 2.0, entry.totalLen, index.avgLen) +
        scoreFieldTerm(entry.contentTokens, q, 1.0, entry.totalLen, index.avgLen);
      score += idf * fieldScore;
    }
    if (score > 0) {
      hits.push({ doc: entry.doc, score: Number(score.toFixed(4)) });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function buildDefaultMarigoldCivicCorpus(): CorpusDoc[] {
  return [
    {
      id: "ms-2026-report",
      title: "Mississippi Statewide Voter Roll Audit (82 Counties, 2.26M Records)",
      summary: "2,265,305 active and inactive registrations and 12,193,971 ballot credits audited locally with zero orphaned ballots.",
      content: "Every past ballot matched a registered voter in Mississippi. 64 of 82 counties sit within the normal baseline range; 18 counties have focused cleanup checklists for County Election Commissioners, led by Hinds, Harrison, Rankin, DeSoto, and Oktibbeha.",
      category: "state_report",
      statutoryCitation: "Miss. Code Ann. § 23-15-153",
      tags: ["mississippi", "ms", "counties", "hinds", "ballots", "commissioners", "overview"],
    },
    {
      id: "nc-2026-report",
      title: "North Carolina Statewide Voter Roll Audit (100 Counties, 7.69M Records)",
      summary: "7,692,000+ active and inactive voter records and 38.07M ballot credits analyzed under N.C.G.S. § 163-82.14.",
      content: "North Carolina County Boards of Elections hold statutory authority over roll maintenance. 79 of 100 counties sit within normal baseline range; 21 counties have focused checklists across Mecklenberg, Wake, Guilford, and university precincts.",
      category: "state_report",
      statutoryCitation: "N.C.G.S. § 163-82.14",
      tags: ["north carolina", "nc", "counties", "wake", "mecklenburg", "boards of elections"],
    },
    {
      id: "playbook-nvra",
      title: "NVRA Status & Ballot Activity Reconciliation (Voter Protection + List Maintenance)",
      summary: "Identifies both Inactive voters who voted in 2024–2026 (voter protection) and pre-2019 dormant Active records (list maintenance).",
      content: "Dual non-partisan NVRA audit ensuring eligible recent voters are not kept in Inactive status while flagging two-federal-cycle dormant Active records with out-of-state mailings for statutory confirmation mailings.",
      category: "playbook",
      statutoryCitation: "52 U.S.C. § 20507 (NVRA)",
      tags: ["nvra", "inactive", "movers", "out-of-state", "voter protection", "pollbook"],
    },
    {
      id: "playbook-density",
      title: "High-Density Residential Occupancy & Missing Dorm Unit Numbers",
      summary: "Filters out campus dormitories, nursing homes, military barracks, and apartment complexes before flagging single-family anomalies.",
      content: "Separates institutional residential buildings (college halls, care facilities) and multi-family complexes missing apartment unit designators from true high-density anomalies (8+ active voters at a single residential street parcel).",
      category: "playbook",
      statutoryCitation: "State Domicile Verification Standard",
      tags: ["high-density", "density", "dorm", "campus", "apartment", "unit", "oktibbeha", "watauga"],
    },
    {
      id: "playbook-benford",
      title: "Benford's Law First-Digit Precinct Regression",
      summary: "Tests the leading digit distribution of precinct voter counts against the logarithmic Benford curve.",
      content: "Organic precinct populations naturally follow Benford's logarithmic distribution (~30.1% starting with digit 1). Deviations indicate artificial precinct splits, capped polling places (>3,000 voters), or administrative boundary anomalies.",
      category: "playbook",
      statutoryCitation: "Forensic Accounting Standard",
      tags: ["benford", "precinct", "digit", "capacity", "3000", "split precinct"],
    },
    {
      id: "playbook-duplicates",
      title: "Fellegi-Sunter & Suffix-Aware Duplicate Name Pair Matching",
      summary: "Protects Jr./Sr./II/III generational family households before identifying exact Name+Middle+Suffix duplicates inside the same 5-digit ZIP.",
      content: "Never conflates fathers and sons living at the same address. Requires matching first, middle, last, and suffix across distinct residential addresses within the same 5-digit ZIP code or matching birth-year discriminators.",
      category: "playbook",
      statutoryCitation: "Record Linkage Methodology",
      tags: ["duplicate", "duplicates", "fellegi-sunter", "suffix", "jr", "sr", "zip"],
    },
    {
      id: "architecture-airgap",
      title: "Zero-Cloud Air-Gap Lock, OPFS Vault & OpenTimestamps (.ots) Custody",
      summary: "All DuckDB-Wasm SQL, Zstd Parquet shards, WebGPU inference, and SHA-256 Merkle-DAG receipts run strictly inside your browser.",
      content: "With Air-Gap Lock engaged, fetch() and WebSocket egress to external hosts are blocked inside browser memory. Only verified Zero-PII summaries (never names, birthdates, voter IDs, or street numbers) are exportable to public HTML bundles or Bitcoin .ots custody proofs.",
      category: "architecture",
      statutoryCitation: "Zero-PII Civic Security Standard",
      tags: ["air-gap", "privacy", "opfs", "parquet", "merkle", "ots", "opentimestamps", "webgpu"],
    },
  ];
}

let cachedIndex: LocalBM25Index | null = null;

export function getDefaultMarigoldCorpusIndex(): LocalBM25Index {
  if (!cachedIndex) {
    cachedIndex = buildLocalBM25CorpusIndex(buildDefaultMarigoldCivicCorpus());
  }
  return cachedIndex;
}

export function synthesizeOfflineGroundedAnswer(
  query: string,
  context?: { datasetName?: string; rowCount?: string | number }
): string {
  const index = getDefaultMarigoldCorpusIndex();
  const hits = queryLocalBM25Corpus(index, query, 3);
  const dsLabel = context?.datasetName && context.datasetName !== "No file linked"
    ? `Active local dataset: **${context.datasetName}** (${Number(context.rowCount || 0).toLocaleString()} rows). `
    : "";

  if (hits.length === 0) {
    return `${dsLabel}Operating in **100% Air-Gapped Local Search** mode. Try asking about Mississippi or North Carolina counties, NVRA voter protection & list maintenance, Benford's Law precinct sizing, high-density dorm exclusions, or Zero-PII OpenTimestamps custody.`;
  }

  const sections = hits.map(
    (h, idx) =>
      `${idx + 1}. **${h.doc.title}**${h.doc.statutoryCitation ? ` *(${h.doc.statutoryCitation})*` : ""}\n   ${h.doc.summary}\n   ${h.doc.content}`
  );

  return `${dsLabel}Grounded strictly from your local **Marigold Civic Corpus (Offline BM25)**:\n\n${sections.join("\n\n")}`;
}

/**
 * 2-Iteration Tap-Out Loop Guard (`maxIterations = 2`):
 * Prevents multi-step tool/SQL retry loops from stalling or spinning indefinitely.
 */
export async function withTapOutLoopGuard<T>(
  stepFn: (iteration: number) => Promise<{ done: boolean; value: T }>,
  options: {
    maxIterations?: number;
    onTapOut: (lastValue: T | undefined, iterations: number) => T;
  }
): Promise<{ result: T; iterations: number; tappedOut: boolean }> {
  const maxIterations = Math.max(1, options.maxIterations ?? 2);
  let lastValue: T | undefined;

  for (let i = 1; i <= maxIterations; i++) {
    const step = await stepFn(i);
    lastValue = step.value;
    if (step.done) {
      return { result: step.value, iterations: i, tappedOut: false };
    }
  }

  return {
    result: options.onTapOut(lastValue, maxIterations),
    iterations: maxIterations,
    tappedOut: true,
  };
}
