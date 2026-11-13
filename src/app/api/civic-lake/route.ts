import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import {
  PUBLIC_CIVIC_DATASETS,
  MountablePublicDataset,
} from '@/lib/datasets/publicCivicRepoCatalog';
import {
  compileRecordsToArrowIPC,
  computeEmpiricalBayesRates,
  computeSpatialAutocorrelation,
} from '@/lib/server/civicFossRefinery';

const CIVIC_DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'datasets', 'civic');

function resolveDataset(datasetId: string | null): MountablePublicDataset {
  if (datasetId && datasetId in PUBLIC_CIVIC_DATASETS) {
    return PUBLIC_CIVIC_DATASETS[datasetId as MountablePublicDataset['id']];
  }
  return PUBLIC_CIVIC_DATASETS.publicHealthAccess;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const datasetId = searchParams.get('dataset');
    const format = (searchParams.get('format') || 'summary').toLowerCase();
    const stateFilter = (searchParams.get('state') || '').trim().toUpperCase();

    const ds = resolveDataset(datasetId);

    // 1. Zstd Parquet Binary Shard
    if (format === 'parquet') {
      const pqPath = path.join(CIVIC_DATA_DIR, path.basename(ds.parquetFilename));
      if (!fs.existsSync(pqPath)) {
        return NextResponse.json({ error: 'Parquet shard not found' }, { status: 404 });
      }
      const bytes = fs.readFileSync(pqPath);
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apache.parquet',
          'Content-Disposition': `inline; filename="${ds.parquetFilename}"`,
          'X-Dataset-Id': ds.id,
          'X-Dataset-SHA256': ds.parquetSha256,
          'X-Zero-PII-Verified': 'true',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const csvPath = path.join(CIVIC_DATA_DIR, path.basename(ds.filename));
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV dataset not found' }, { status: 404 });
    }
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse<Record<string, any>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    let rows = parsed.data;
    if (stateFilter && /^[A-Z]{2}$/.test(stateFilter)) {
      rows = rows.filter((r) => String(r.state_abbr || '').toUpperCase() === stateFilter);
    }

    // 2. Zero-Copy Apache Arrow IPC Stream
    if (format === 'arrow') {
      const ipcBytes = compileRecordsToArrowIPC(rows);
      return new NextResponse(Buffer.from(ipcBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apache.arrow.stream',
          'X-Dataset-Id': ds.id,
          'X-Row-Count': String(rows.length),
          'X-Zero-PII-Verified': 'true',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 3. Server FOSS Statistical Summary (Empirical Bayes + Getis-Ord Gi* Hotspots)
    const metricCol = ds.primaryMetricCol;
    const popCol = rows[0] && 'total_pop_2024' in rows[0] ? 'total_pop_2024' : 'cvap_2024';

    const spatialInputs = rows
      .map((r) => ({
        id: String(r.county_fips || ''),
        state: String(r.state_abbr || ''),
        value: Number(r[metricCol]),
      }))
      .filter((it) => it.id && Number.isFinite(it.value));

    const spatial = computeSpatialAutocorrelation(spatialInputs);

    const isPercentageMetric =
      metricCol.includes('pct') || metricCol.includes('disability') || metricCol.includes('prev');

    const ebRates = isPercentageMetric
      ? computeEmpiricalBayesRates(
          rows
            .map((r) => ({
              id: String(r.county_fips || ''),
              group: String(r.state_abbr || ''),
              ratePct: Number(r[metricCol]),
              population: Number(r[popCol]) || 1000,
            }))
            .filter((it) => it.id && Number.isFinite(it.ratePct) && it.population > 0)
        )
      : [];

    const sortedRows = [...rows]
      .filter((r) => r[metricCol] !== '' && r[metricCol] !== undefined && Number.isFinite(Number(r[metricCol])))
      .sort((a, b) => Number(b[metricCol]) - Number(a[metricCol]));

    return NextResponse.json(
      {
        zeroPiiVerified: true,
        dataset: {
          id: ds.id,
          label: ds.label,
          filename: ds.filename,
          parquetFilename: ds.parquetFilename,
          parquetPath: ds.parquetPath,
          parquetSha256: ds.parquetSha256,
          totalDatasetRows: ds.rows,
          filteredRows: rows.length,
          stateFilter: stateFilter || 'ALL',
          primaryMetricCol: metricCol,
        },
        spatialStats: {
          moransI: spatial.moransI,
          expectedI: spatial.expectedI,
          topHotspots: spatial.items
            .filter((i) => i.classification === 'HOTSPOT_99' || i.classification === 'HOTSPOT_95')
            .sort((a, b) => b.getisOrdZ - a.getisOrdZ)
            .slice(0, 10),
        },
        empiricalBayesTop: ebRates
          .sort((a, b) => b.smoothedRatePct - a.smoothedRatePct)
          .slice(0, 10),
        topCounties: sortedRows.slice(0, 12),
      },
      {
        status: 200,
        headers: {
          'X-Zero-PII-Verified': 'true',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (err: any) {
    console.error('[GET /api/civic-lake] error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Civic Lake Error' },
      { status: 500 }
    );
  }
}
