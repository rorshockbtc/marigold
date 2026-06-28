import { NextRequest, NextResponse } from 'next/server';
import { savePlaybook, getPlaybooks } from '@/lib/db/sqlite';

export async function GET(req: NextRequest) {
  try {
    const rows = getPlaybooks();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, auditType, threshold, county } = await req.json();
    savePlaybook(name, auditType, threshold || 0, county || '');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
