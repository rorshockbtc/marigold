/**
 * Marigold Server-Side Zero-PII FOSS Refinery
 * =========================================
 * Implements server/isomorphic quantitative methods over aggregated county data:
 *  - Clayton-Kaldor Empirical Bayes small-area shrinkage & 95% credible bounds
 *  - Global Moran's I & Local Getis-Ord Gi* spatial hotspot statistics
 *  - Unsupervised Splink-style Expectation-Maximization (EM) Fellegi-Sunter weights
 *  - HIPAA/CMS <11 small-cell k-anonymity suppression + optional Laplace DP noise
 *  - Zero-copy Apache Arrow IPC stream serialization (`application/vnd.apache.arrow.stream`)
 */

import { tableFromArrays, tableToIPC } from 'apache-arrow';
import * as ss from 'simple-statistics';
import { jStat } from 'jstat';

export interface EmpiricalBayesInputItem {
  id: string;
  group?: string;
  ratePct: number;
  population: number;
}

export interface EmpiricalBayesResultItem extends EmpiricalBayesInputItem {
  priorMeanPct: number;
  credibilityWeight: number;
  smoothedRatePct: number;
  ciLower95Pct: number;
  ciUpper95Pct: number;
}

/**
 * Computes Empirical Bayes small-area smoothed percentages grouped by state/stratum (or global).
 * Shrinks noisy small-population county rates toward the stratum prior mean `mu`.
 */
export function computeEmpiricalBayesRates(
  items: EmpiricalBayesInputItem[]
): EmpiricalBayesResultItem[] {
  const valid = items.filter(
    (it) => Number.isFinite(it.ratePct) && Number.isFinite(it.population) && it.population > 0
  );
  if (valid.length === 0) return [];

  const groups = new Map<string, EmpiricalBayesInputItem[]>();
  for (const it of valid) {
    const g = it.group || '__GLOBAL__';
    const arr = groups.get(g) || [];
    arr.push(it);
    groups.set(g, arr);
  }

  const outById = new Map<string, EmpiricalBayesResultItem>();
  const z95 = jStat.normal.inv(0.975, 0, 1);

  for (const [, groupItems] of groups.entries()) {
    const rates = groupItems.map((g) => g.ratePct);
    const priorMean = ss.mean(rates);
    const totalVar = rates.length > 1 ? ss.variance(rates) : 0;

    // Binomial sampling variance scaled to percentage points (p*(100-p)/N_eff)
    const samplingVars = groupItems.map((it) => {
      const pBounded = Math.max(0.5, Math.min(99.5, priorMean));
      const nEff = Math.max(100, it.population);
      return (pBounded * (100 - pBounded)) / nEff;
    });
    const meanSamplingVar = ss.mean(samplingVars);
    const tau2 = Math.max(0.01, totalVar - meanSamplingVar);

    groupItems.forEach((it, idx) => {
      const sv = samplingVars[idx];
      const weight = tau2 / (tau2 + sv);
      const smoothed = weight * it.ratePct + (1 - weight) * priorMean;
      const posteriorVar = 1 / (1 / tau2 + 1 / sv);
      const posteriorSd = Math.sqrt(Math.max(0.0001, posteriorVar));
      const ciLower = Math.max(0, smoothed - z95 * posteriorSd);
      const ciUpper = Math.min(100, smoothed + z95 * posteriorSd);

      outById.set(it.id, {
        ...it,
        priorMeanPct: Number(priorMean.toFixed(3)),
        credibilityWeight: Number(weight.toFixed(4)),
        smoothedRatePct: Number(smoothed.toFixed(3)),
        ciLower95Pct: Number(ciLower.toFixed(3)),
        ciUpper95Pct: Number(ciUpper.toFixed(3)),
      });
    });
  }

  return valid.map((it) => outById.get(it.id)!);
}

export interface SpatialInputItem {
  id: string;
  state: string;
  value: number;
}

export interface SpatialHotspotItem extends SpatialInputItem {
  getisOrdZ: number;
  pValueTwoTailed: number;
  classification: 'HOTSPOT_99' | 'HOTSPOT_95' | 'COLDSPOT_95' | 'NEUTRAL';
}

export interface SpatialAutocorrelationSummary {
  moransI: number;
  expectedI: number;
  items: SpatialHotspotItem[];
}

/**
 * Computes Global Moran's I and local Getis-Ord Gi* hotspot Z-scores.
 * Uses explicit neighbor adjacency map if supplied, or same-state contiguity weights.
 */
export function computeSpatialAutocorrelation(
  items: SpatialInputItem[],
  neighborsById?: Record<string, string[]>
): SpatialAutocorrelationSummary {
  const valid = items.filter((it) => Number.isFinite(it.value));
  const n = valid.length;
  if (n < 3) {
    return {
      moransI: 0,
      expectedI: n > 1 ? -1 / (n - 1) : 0,
      items: valid.map((it) => ({
        ...it,
        getisOrdZ: 0,
        pValueTwoTailed: 1,
        classification: 'NEUTRAL',
      })),
    };
  }

  const values = valid.map((it) => it.value);
  const meanVal = ss.mean(values);
  const sdVal = ss.standardDeviation(values) || 1;
  const idxById = new Map<string, number>();
  valid.forEach((it, idx) => idxById.set(it.id, idx));

  const stateBuckets = new Map<string, number[]>();
  valid.forEach((it, idx) => {
    const arr = stateBuckets.get(it.state) || [];
    arr.push(idx);
    stateBuckets.set(it.state, arr);
  });

  // Build sparse adjacency weights (self included for Gi* star statistic; excluded for Moran's I)
  const neighborIndicesFor = (i: number): number[] => {
    const id = valid[i].id;
    if (neighborsById && neighborsById[id]) {
      return neighborsById[id]
        .map((nid) => idxById.get(nid))
        .filter((j): j is number => j !== undefined);
    }
    const peers = stateBuckets.get(valid[i].state) || [i];
    return peers;
  };

  let moranNum = 0;
  let s0 = 0;
  const denomSq = values.reduce((acc, v) => acc + (v - meanVal) ** 2, 0) || 1;

  const hotspotItems: SpatialHotspotItem[] = valid.map((it, i) => {
    const explicitOrState = neighborIndicesFor(i);
    const giNeighbors = new Set<number>([i, ...explicitOrState]);

    let sumWij = 0;
    let sumWijSq = 0;
    let weightedSumX = 0;

    for (const j of giNeighbors) {
      const w = j === i ? 1 : 1;
      sumWij += w;
      sumWijSq += w * w;
      weightedSumX += w * values[j];

      if (j !== i) {
        moranNum += (values[i] - meanVal) * (values[j] - meanVal);
        s0 += 1;
      }
    }

    const numZ = weightedSumX - meanVal * sumWij;
    const varTerm = Math.max(1e-9, (n * sumWijSq - sumWij * sumWij) / Math.max(1, n - 1));
    const denomZ = sdVal * Math.sqrt(varTerm);
    const z = numZ / Math.max(1e-9, denomZ);
    const absZ = Math.abs(z);
    const pTwo = Math.max(0, Math.min(1, 2 * (1 - jStat.normal.cdf(absZ, 0, 1))));

    let classification: SpatialHotspotItem['classification'] = 'NEUTRAL';
    if (z >= 2.576) classification = 'HOTSPOT_99';
    else if (z >= 1.96) classification = 'HOTSPOT_95';
    else if (z <= -1.96) classification = 'COLDSPOT_95';

    return {
      ...it,
      getisOrdZ: Number(z.toFixed(4)),
      pValueTwoTailed: Number(pTwo.toFixed(6)),
      classification,
    };
  });

  const moransI = s0 > 0 ? (n / s0) * (moranNum / denomSq) : 0;

  return {
    moransI: Number(moransI.toFixed(4)),
    expectedI: Number((-1 / (n - 1)).toFixed(4)),
    items: hotspotItems,
  };
}

export interface FellegiSunterEMResult {
  converged: boolean;
  iterations: number;
  lambdaPrior: number;
  mProbabilities: number[];
  uProbabilities: number[];
  agreementWeights: number[];
  disagreementWeights: number[];
  pairMatchProbabilities: number[];
}

/**
 * Splink-style unsupervised Expectation-Maximization (EM) solver for Fellegi-Sunter linkage.
 * Learns latent `m_k = P(agree_k | Match)`, `u_k = P(agree_k | Unmatch)`, and prior `lambda`
 * directly from binary comparison vectors without labeled training data.
 */
export function trainUnsupervisedFellegiSunterEM(
  agreementMatrix: boolean[][],
  options?: { maxIterations?: number; tolerance?: number; initialLambda?: number }
): FellegiSunterEMResult {
  const nPairs = agreementMatrix.length;
  const nFields = nPairs > 0 ? agreementMatrix[0].length : 0;
  if (nPairs === 0 || nFields === 0) {
    return {
      converged: true,
      iterations: 0,
      lambdaPrior: 0,
      mProbabilities: [],
      uProbabilities: [],
      agreementWeights: [],
      disagreementWeights: [],
      pairMatchProbabilities: [],
    };
  }

  const maxIter = options?.maxIterations ?? 40;
  const tol = options?.tolerance ?? 1e-5;
  let lambda = Math.max(0.01, Math.min(0.99, options?.initialLambda ?? 0.2));
  const m = Array.from({ length: nFields }, () => 0.88);
  const u = Array.from({ length: nFields }, () => 0.08);
  const posteriors = new Array<number>(nPairs).fill(lambda);

  const clampProb = (p: number) => Math.max(0.001, Math.min(0.999, p));

  let converged = false;
  let iterations = 0;

  for (let iter = 1; iter <= maxIter; iter++) {
    iterations = iter;
    // E-step
    for (let i = 0; i < nPairs; i++) {
      let logLikM = Math.log(lambda);
      let logLikU = Math.log(1 - lambda);
      const row = agreementMatrix[i];
      for (let k = 0; k < nFields; k++) {
        if (row[k]) {
          logLikM += Math.log(m[k]);
          logLikU += Math.log(u[k]);
        } else {
          logLikM += Math.log(1 - m[k]);
          logLikU += Math.log(1 - u[k]);
        }
      }
      const maxLog = Math.max(logLikM, logLikU);
      const expM = Math.exp(logLikM - maxLog);
      const expU = Math.exp(logLikU - maxLog);
      posteriors[i] = expM / (expM + expU);
    }

    // M-step
    const sumG = posteriors.reduce((a, b) => a + b, 0);
    const sumOneMinusG = nPairs - sumG;
    const nextLambda = clampProb(sumG / nPairs);

    let maxDelta = Math.abs(nextLambda - lambda);
    lambda = nextLambda;

    for (let k = 0; k < nFields; k++) {
      let agreeM = 0;
      let agreeU = 0;
      for (let i = 0; i < nPairs; i++) {
        if (agreementMatrix[i][k]) {
          agreeM += posteriors[i];
          agreeU += 1 - posteriors[i];
        }
      }
      const nextM = clampProb((agreeM + 0.01) / (sumG + 0.02));
      const nextU = clampProb((agreeU + 0.01) / (sumOneMinusG + 0.02));
      maxDelta = Math.max(maxDelta, Math.abs(nextM - m[k]), Math.abs(nextU - u[k]));
      m[k] = nextM;
      u[k] = nextU;
    }

    if (maxDelta < tol) {
      converged = true;
      break;
    }
  }

  const agreementWeights = m.map((mk, k) => Number(Math.log2(mk / u[k]).toFixed(4)));
  const disagreementWeights = m.map((mk, k) => Number(Math.log2((1 - mk) / (1 - u[k])).toFixed(4)));

  return {
    converged,
    iterations,
    lambdaPrior: Number(lambda.toFixed(4)),
    mProbabilities: m.map((v) => Number(v.toFixed(4))),
    uProbabilities: u.map((v) => Number(v.toFixed(4))),
    agreementWeights,
    disagreementWeights,
    pairMatchProbabilities: posteriors.map((p) => Number(p.toFixed(4))),
  };
}

export interface CellSuppressionResult {
  suppressed: boolean;
  publishedValue: number | null;
  reason?: string;
}

/**
 * Enforces CMS/HHS k-anonymity cell suppression (default minimum cell size 11)
 * and optional deterministic Laplace(1/epsilon) noise for differential privacy.
 */
export function applyZeroPiiCellSuppression(
  value: number,
  options?: { minCellSize?: number; epsilon?: number; deterministicSeed?: number }
): CellSuppressionResult {
  const minCell = options?.minCellSize ?? 11;
  if (!Number.isFinite(value) || value < 0) {
    return { suppressed: true, publishedValue: null, reason: 'Invalid negative or non-finite count' };
  }
  if (value > 0 && value < minCell) {
    return {
      suppressed: true,
      publishedValue: null,
      reason: `Suppressed under HHS/CMS n < ${minCell} small-cell disclosure rule`,
    };
  }
  if (options?.epsilon && options.epsilon > 0) {
    // Deterministic PRNG if seed provided so unit tests are repeatable; Math.random otherwise
    const uRaw =
      options.deterministicSeed !== undefined
        ? ((Math.sin(options.deterministicSeed) * 10000) % 1 + 1) % 1
        : Math.random();
    const uSigned = Math.max(-0.4999, Math.min(0.4999, uRaw - 0.5));
    const scale = 1 / options.epsilon;
    const laplaceNoise = -scale * Math.sign(uSigned) * Math.log(1 - 2 * Math.abs(uSigned));
    const noisy = Math.max(0, Math.round(value + laplaceNoise));
    return { suppressed: false, publishedValue: noisy };
  }
  return { suppressed: false, publishedValue: value };
}

/**
 * Compiles row objects directly into a columnar Apache Arrow IPC stream (`Uint8Array`).
 * Numeric fields serialize into Float64Array; text/mixed fields serialize cleanly as UTF-8 strings.
 */
export function compileRecordsToArrowIPC(rows: Record<string, any>[]): Uint8Array {
  if (rows.length === 0) {
    const empty = tableFromArrays({ county_fips: [] as string[] });
    return tableToIPC(empty, 'stream');
  }

  const colNames = Object.keys(rows[0]);
  const arrays: Record<string, Float64Array | string[]> = {};

  for (const col of colNames) {
    let allNumeric = true;
    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i][col];
      if (raw === '' || raw === null || raw === undefined) continue;
      if (col === 'county_fips' || col === 'state_abbr' || col === 'state_name' || col === 'county_name' || col === 'fema_latest_incident') {
        allNumeric = false;
        break;
      }
      const num = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(num)) {
        allNumeric = false;
        break;
      }
    }

    if (allNumeric) {
      const buf = new Float64Array(rows.length);
      for (let i = 0; i < rows.length; i++) {
        const raw = rows[i][col];
        if (raw === '' || raw === null || raw === undefined) {
          buf[i] = Number.NaN;
        } else {
          buf[i] = typeof raw === 'number' ? raw : Number(raw);
        }
      }
      arrays[col] = buf;
    } else {
      arrays[col] = rows.map((r) => (r[col] === null || r[col] === undefined ? '' : String(r[col])));
    }
  }

  const arrowTable = tableFromArrays(arrays);
  return tableToIPC(arrowTable, 'stream');
}
