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
    {
      id: "eavs-2024-v2-renumbering",
      title: "U.S. EAC 2024 EAVS V2.0 (Feb 2026) — A10a Notices, A12a Removals & Sentinel Cleaning",
      summary: "35,328,942 confirmation notices (A10a), 20,021,606 voter removals (A12a), and 915,949 undeliverable mail ballots across 3,222 matched counties.",
      content: "In the Feb 2026 EAVS V2.0 release, 6,461 local jurisdictions roll cleanly into 3,127 county FIPS units once New England towns and Wisconsin municipalities aggregate to parent counties. Negative sentinels (-99, -88, -77) must normalize to null before summing 203,680,591 active and 22,588,570 inactive voters. See pipe/civic-data-benchmarks.",
      category: "playbook",
      statutoryCitation: "U.S. EAC 2024 EAVS V2.0 & 52 U.S.C. 20507",
      tags: ["eavs", "a10a", "a12a", "removals", "confirmation", "notices", "undeliverable", "provisional", "fips"],
    },
    {
      id: "census-cvap-moe-migration",
      title: "Census 2020-2024 ACS CVAP 90% MOE & Domestic Migration Divergence (MS vs. NC)",
      summary: "Brunswick County NC (106.08%, +33,821 migration) vs. 7 Mississippi upper-MOE counties led by Humphreys (116.01%) and Hinds (100.25%, -17,670 migration).",
      content: "Across North Carolina's 100 counties (7,898,142 CVAP; 6,902,431 active; 971,554 removals led by Mecklenburg 122,082), only Brunswick exceeds its 90% CVAP upper bound due to rapid +33,821 domestic in-migration outpacing 5-year ACS averages. Mississippi's 82 counties (2,221,778 CVAP; 1,882,342 active; 148,200 removals) show 7 counties above CVAP+MOE amid rural out-migration.",
      category: "state_report",
      statutoryCitation: "U.S. Census 2020-2024 ACS CVAP & PopEst",
      tags: ["cvap", "moe", "brunswick", "mecklenburg", "wake", "hinds", "humphreys", "migration", "deaths"],
    },
    {
      id: "openfema-helene-washoe-continuity",
      title: "OpenFEMA 2020-2026 Continuity & Hurricane Helene DR-4827-NC Turnout Surge",
      summary: "39 declared DR-4827-NC counties increased certified votes from 2,338,633 to 2,396,685 while Washoe NV expanded +4.60% across 21 FEMA events.",
      content: "Across 19,551 OpenFEMA DisasterDeclarationsSummaries rows covering 3,210 matched counties, 39 North Carolina Hurricane Helene DR-4827-NC counties grew certified ballots (+58,052 total; Buncombe held at 159,885 vs. 161,569 in 2020). Washoe NV endured 21 declarations (5 in 2024) with +4.60% turnout growth, while coastal Louisiana parishes declined -5.60% to -10.51%. See pipe/disaster-continuity.",
      category: "state_report",
      statutoryCitation: "OpenFEMA DisasterDeclarationsSummaries v2 & MEDSL Returns",
      tags: ["fema", "openfema", "helene", "dr-4827-nc", "washoe", "louisiana", "disaster", "turnout", "buncombe"],
    },
    {
      id: "pipes-curatorial-canon-bridge",
      title: "Mounted Pipes Corpus Index: Six Civic Pipes Across 32 Primary-Source Briefs",
      summary: "32 primary-source curatorial briefs mounted from pipes.pink across 6 civic Pipes with offline Okapi BM25 search.",
      content: "Marigold mounts exported Greater corpus bundles from pipe/marigoldinsights, pipe/civic-data-benchmarks, pipe/disaster-continuity, pipe/election-integrity, pipe/public-health-benchmarks, and pipe/fiscal-migration under /pipes-corpus/index.json so every county SQL query pairs with audited constitutional, epidemiological, fiscal, and statistical context.",
      category: "architecture",
      statutoryCitation: "Pipes Editorial Standard v1",
      tags: ["pipes", "marigoldinsights", "civic-data-benchmarks", "disaster-continuity", "election-integrity", "public-health-benchmarks", "fiscal-migration", "corpus"],
    },
    {
      id: "cdc-places-empirical-bayes-hospital-deserts",
      title: "CDC PLACES 2024, Clayton-Kaldor Empirical Bayes Smoothing & 659 HHS Hospital Deserts",
      summary: "3,143 U.S. counties averaging 32.36% disability and 9.45% lack of transport, joined to 6,732 HHS hospitals (659 hospital deserts) and NCHS mortality.",
      content: "Across 3,143 matched U.S. counties, Clayton-Kaldor Empirical Bayes shrinkage stabilizes rural sample variance while keeping structural hotspots anchored: Humphreys MS shifts from 46.30% raw to 46.04% EB disability with 23.00% lacking transport and 0 acute hospitals; Mississippi averages 39.00% disability with 8 hospital deserts across 82 counties. North Carolina averages 33.35% disability with 18 hospital deserts across 100 counties, led by Robeson NC (41.20% raw / 41.15% EB disability, 43.03 NCHS drug mortality per 100k). See pipe/public-health-benchmarks.",
      category: "state_report",
      statutoryCitation: "CDC PLACES 2024 · HHS Hospitals · NCHS · 45 CFR 164.514",
      tags: ["cdc", "places", "empirical-bayes", "humphreys", "robeson", "hospital-desert", "hhs", "nchs", "disability", "transport"],
    },
    {
      id: "irs-soi-2022-2023-county-agi-migration",
      title: "IRS SOI 2022-2023 County Migration: North Carolina +$3.90B AGI vs. Mississippi -$68.36M",
      summary: "Tax-return verified household inflows and outflows across 3,219 U.S. counties explaining CVAP 5-year ACS survey lag.",
      content: "In the 2022-2023 IRS Statistics of Income migration release across 3,219 linked counties, North Carolina absorbed +39,207 net returns and +$3,898.23M (+$3.90B) net Adjusted Gross Income led by Brunswick NC (+$502.07M, +3,474 returns) and Wake NC (+$363.56M, +3,843 returns). Mississippi saw -3,094 net returns and -$68.36M net AGI led downward by Hinds MS (-$133.79M, -1,415 returns). See pipe/fiscal-migration.",
      category: "state_report",
      statutoryCitation: "IRS SOI County Migration 2022-2023",
      tags: ["irs", "soi", "agi", "migration", "brunswick", "wake", "hinds", "tax", "north-carolina", "mississippi"],
    },
    {
      id: "fdic-2024-summary-of-deposits-credit-access",
      title: "FDIC 2024 Summary of Deposits: 76,727 Branches, $17.40T Deposits & 38 Banking Deserts",
      summary: "County FIPS aggregation of insured bank branches, unique FDIC charters, and rural banking deserts across 3,195 banking counties.",
      content: "Marigold aggregates all 76,727 FDIC 2024 Summary of Deposits branch records ($17,395,742.37M / $17.40T across 3,195 counties, identifying 38 banking deserts) strictly to 5-digit county FIPS keys. North Carolina holds $693,316.31M across 1,986 branches led by Mecklenburg ($432,277.42M) and Wake ($90,333.80M), whereas Mississippi holds $77,824.33M across 1,055 branches led by Hinds ($8,244.05M) with zero banking deserts. See pipe/fiscal-migration.",
      category: "playbook",
      statutoryCitation: "FDIC Summary of Deposits (June 30, 2024)",
      tags: ["fdic", "sod", "banking", "deposits", "branches", "mecklenburg", "wake", "hinds", "banking-desert"],
    },
    {
      id: "server-foss-lakehouse-parquet-arrow-splink-em",
      title: "Zero-PII Server FOSS Lakehouse: Zstd Parquet, Apache Arrow IPC & Unsupervised Fellegi-Sunter EM",
      summary: "Server-side columnar compilation, Empirical Bayes shrinkage, Moran's I / Getis-Ord Gi* hotspots, and CMS <11 cell suppression.",
      content: "Marigold's /api/civic-lake endpoint and compile-civic-parquet-lake pipeline distribute Zstd-compressed Apache Parquet shards (PAR1), zero-copy Apache Arrow IPC streams (application/vnd.apache.arrow.stream), Clayton-Kaldor Empirical Bayes rates, Moran's I and Getis-Ord Gi* spatial hotspot Z-scores, unsupervised Expectation-Maximization (EM) Fellegi-Sunter linkage weights, and CMS <11 small-cell k-anonymity suppression with optional Laplace differential privacy.",
      category: "architecture",
      statutoryCitation: "Apache Arrow IPC · Apache Parquet Zstd · CMS <11 Rule",
      tags: ["parquet", "zstd", "arrow", "ipc", "fellegi-sunter", "em", "moran", "getis-ord", "cell-suppression", "foss"],
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
