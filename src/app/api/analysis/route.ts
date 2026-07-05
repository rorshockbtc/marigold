import { NextRequest, NextResponse } from 'next/server';
import { getStats, findHighDensityAddresses, findMissingDormNumbers, findPOBoxResidences, findTypoNames, findIntraCountyDuplicates, findCommercialAddresses, findRegistrationSpikes, findPhantomPrecincts, findOutOfStateMailing, analyzeBenfordsLaw } from '@/lib/db/sqlite';

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action');
    const threshold = parseInt(req.nextUrl.searchParams.get('threshold') || '12', 10);
    const county = req.nextUrl.searchParams.get('county') || '';

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    if (action === 'stats') {
      const stats = getStats();
      if (!stats) return NextResponse.json({ error: "Database not found. Please run the ingestion script." }, { status: 404 });
      return NextResponse.json(stats);
    }

    if (action === 'density') {
      const rows = findHighDensityAddresses(threshold, county);
      return NextResponse.json(rows);
    }

    if (action === 'missing-dorm') {
      const rows = findMissingDormNumbers(threshold > 12 ? threshold : 50, county);
      return NextResponse.json(rows);
    }

    if (action === 'po-box') {
      const rows = findPOBoxResidences(county);
      return NextResponse.json(rows);
    }

    if (action === 'typo-names') {
      const rows = findTypoNames(county);
      return NextResponse.json(rows);
    }

    if (action === 'duplicates') {
      const rows = findIntraCountyDuplicates(county);
      const formatted = rows.map((r: any, idx: number) => ({
        id: `DUP-${idx + 1}`,
        name: `${r.first_name} ${r.last_name}`,
        address: r.address1,
        city: r.county || 'City',
        state: 'MS',
        zip: r.zip,
        county: r.county || 'Statewide',
        occupant_count: 2,
        risk_level: 'HIGH',
        details: `Potential intra-county duplicate: Identical Name & Zip across multiple addresses.`,
        duplicateAddresses: [r.address1, r.address2].filter(Boolean)
      }));
      return NextResponse.json(formatted);
    }

    if (action === 'commercial') {
      const rows = findCommercialAddresses(county);
      return NextResponse.json(rows);
    }

    if (action === 'spikes') {
      const rows = findRegistrationSpikes(county);
      return NextResponse.json(rows);
    }

    if (action === 'phantom-precincts') {
      const rows = findPhantomPrecincts(county);
      return NextResponse.json(rows);
    }

    if (action === 'out-of-state-mailing') {
      const rows = findOutOfStateMailing(county);
      return NextResponse.json(rows);
    }

    if (action === 'benfords-law') {
      const results = analyzeBenfordsLaw(county);
      return NextResponse.json(results || { error: 'No data to analyze' });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
