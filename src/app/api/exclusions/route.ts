import { NextRequest, NextResponse } from 'next/server';
import { addExclusion } from '@/lib/db/sqlite';

export async function POST(req: NextRequest) {
  try {
    const { auditType, value } = await req.json();
    if (!auditType || !value) {
      return NextResponse.json({ error: "Missing auditType or value" }, { status: 400 });
    }
    
    addExclusion(auditType, value);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
