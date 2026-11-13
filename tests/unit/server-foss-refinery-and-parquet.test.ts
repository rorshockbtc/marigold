import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { tableFromIPC } from 'apache-arrow';
import {
  computeEmpiricalBayesRates,
  computeSpatialAutocorrelation,
  trainUnsupervisedFellegiSunterEM,
  applyZeroPiiCellSuppression,
  compileRecordsToArrowIPC,
} from '../../src/lib/server/civicFossRefinery';
import { GET } from '../../src/app/api/civic-lake/route';
import { PUBLIC_CIVIC_DATASETS } from '../../src/lib/datasets/publicCivicRepoCatalog';

describe('Server Zero-PII FOSS Refinery & /api/civic-lake Endpoint', () => {
  it('computes Clayton-Kaldor Empirical Bayes rates with stronger shrinkage on small populations', () => {
    const results = computeEmpiricalBayesRates([
      { id: 'tiny-outlier', group: 'MS', ratePct: 48.0, population: 400 },
      { id: 'mid-county', group: 'MS', ratePct: 38.0, population: 12000 },
      { id: 'large-urban', group: 'MS', ratePct: 30.0, population: 240000 },
    ]);

    expect(results).toHaveLength(3);
    const tiny = results.find((r) => r.id === 'tiny-outlier')!;
    const large = results.find((r) => r.id === 'large-urban')!;

    expect(tiny.credibilityWeight).toBeLessThan(large.credibilityWeight);
    expect(tiny.smoothedRatePct).toBeLessThan(tiny.ratePct);
    expect(tiny.smoothedRatePct).toBeGreaterThan(tiny.priorMeanPct);

    for (const r of results) {
      expect(r.ciLower95Pct).toBeLessThanOrEqual(r.smoothedRatePct);
      expect(r.smoothedRatePct).toBeLessThanOrEqual(r.ciUpper95Pct);
    }
  });

  it("detects positive spatial autocorrelation (Moran's I) and Getis-Ord Gi* hotspots on clustered counties", () => {
    const items = [
      { id: 'c1', state: 'HI_CLUSTER', value: 46.0 },
      { id: 'c2', state: 'HI_CLUSTER', value: 45.2 },
      { id: 'c3', state: 'HI_CLUSTER', value: 44.8 },
      { id: 'c4', state: 'LOW_CLUSTER', value: 22.1 },
      { id: 'c5', state: 'LOW_CLUSTER', value: 21.8 },
      { id: 'c6', state: 'LOW_CLUSTER', value: 22.5 },
    ];
    const neighbors = {
      c1: ['c2', 'c3'],
      c2: ['c1', 'c3'],
      c3: ['c1', 'c2'],
      c4: ['c5', 'c6'],
      c5: ['c4', 'c6'],
      c6: ['c4', 'c5'],
    };

    const spatial = computeSpatialAutocorrelation(items, neighbors);
    expect(spatial.moransI).toBeGreaterThan(0.5);

    const hi = spatial.items.find((i) => i.id === 'c1')!;
    const lo = spatial.items.find((i) => i.id === 'c4')!;
    expect(hi.getisOrdZ).toBeGreaterThan(1.96);
    expect(['HOTSPOT_95', 'HOTSPOT_99']).toContain(hi.classification);
    expect(lo.getisOrdZ).toBeLessThan(-1.96);
    expect(lo.classification).toBe('COLDSPOT_95');
  });

  it('trains unsupervised Fellegi-Sunter EM weights and separates matching vs non-matching comparison pairs', () => {
    const matrix: boolean[][] = [
      [true, true, true],
      [true, true, true],
      [true, true, false],
      [true, true, true],
      [false, false, false],
      [false, false, false],
      [false, true, false],
      [false, false, false],
      [false, false, true],
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];

    const em = trainUnsupervisedFellegiSunterEM(matrix);
    expect(em.iterations).toBeGreaterThan(0);
    expect(em.agreementWeights.every((w) => w > 0)).toBe(true);
    expect(em.mProbabilities[0]).toBeGreaterThan(em.uProbabilities[0]);
    expect(em.pairMatchProbabilities[0]).toBeGreaterThan(0.9);
    expect(em.pairMatchProbabilities[4]).toBeLessThan(0.1);
  });

  it('enforces CMS/HHS <11 small-cell suppression and repeatable Laplace differential privacy', () => {
    expect(applyZeroPiiCellSuppression(5)).toEqual({
      suppressed: true,
      publishedValue: null,
      reason: 'Suppressed under HHS/CMS n < 11 small-cell disclosure rule',
    });
    expect(applyZeroPiiCellSuppression(10).suppressed).toBe(true);
    expect(applyZeroPiiCellSuppression(0)).toEqual({ suppressed: false, publishedValue: 0 });
    expect(applyZeroPiiCellSuppression(11)).toEqual({ suppressed: false, publishedValue: 11 });

    const a = applyZeroPiiCellSuppression(150, { epsilon: 1.0, deterministicSeed: 42 });
    const b = applyZeroPiiCellSuppression(150, { epsilon: 1.0, deterministicSeed: 42 });
    expect(a).toEqual(b);
    expect(a.suppressed).toBe(false);
    expect(typeof a.publishedValue).toBe('number');
  });

  it('compiles county records into zero-copy Apache Arrow IPC preserving leading-zero county_fips', () => {
    const bytes = compileRecordsToArrowIPC([
      { county_fips: '01001', county_name: 'Autauga', state_abbr: 'AL', metric: 34.5 },
      { county_fips: '28053', county_name: 'Humphreys', state_abbr: 'MS', metric: 46.04 },
    ]);
    const decoded = tableFromIPC(bytes);
    expect(decoded.numRows).toBe(2);
    expect(decoded.get(0)?.toJSON()).toEqual({
      county_fips: '01001',
      county_name: 'Autauga',
      state_abbr: 'AL',
      metric: 34.5,
    });
  });

  it('serves GET /api/civic-lake for format=summary (MS 82), format=arrow (NC 100), and format=parquet (PAR1)', async () => {
    const summaryReq = new NextRequest(
      'https://marigoldinsights.org/api/civic-lake?dataset=publicHealthAccess&format=summary&state=MS'
    );
    const summaryRes = await GET(summaryReq);
    expect(summaryRes.status).toBe(200);
    const summaryJson = await summaryRes.json();
    expect(summaryJson.zeroPiiVerified).toBe(true);
    expect(summaryJson.dataset.filteredRows).toBe(82);
    expect(summaryJson.empiricalBayesTop.length).toBeGreaterThan(0);

    const arrowReq = new NextRequest(
      'https://marigoldinsights.org/api/civic-lake?dataset=irsFdicFiscal&format=arrow&state=NC'
    );
    const arrowRes = await GET(arrowReq);
    expect(arrowRes.status).toBe(200);
    expect(arrowRes.headers.get('content-type')).toBe('application/vnd.apache.arrow.stream');
    const arrowBuf = new Uint8Array(await arrowRes.arrayBuffer());
    const arrowTable = tableFromIPC(arrowBuf);
    expect(arrowTable.numRows).toBe(100);

    const pqReq = new NextRequest(
      'https://marigoldinsights.org/api/civic-lake?dataset=publicHealthAccess&format=parquet'
    );
    const pqRes = await GET(pqReq);
    expect(pqRes.status).toBe(200);
    expect(pqRes.headers.get('content-type')).toBe('application/vnd.apache.parquet');
    expect(pqRes.headers.get('x-dataset-sha256')).toBe(PUBLIC_CIVIC_DATASETS.publicHealthAccess.parquetSha256);
    const pqBytes = Buffer.from(await pqRes.arrayBuffer());
    expect(pqBytes.subarray(0, 4).toString('ascii')).toBe('PAR1');
  });
});
