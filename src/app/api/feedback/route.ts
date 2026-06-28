import { NextRequest, NextResponse } from 'next/server';
import { addAuditFeedback, getAuditAccuracy } from '@/lib/db/sqlite';

export async function POST(req: NextRequest) {
  try {
    const { auditType, predictedAccuracy, feedback } = await req.json();

    if (!auditType || !feedback) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const success = addAuditFeedback(auditType, predictedAccuracy, feedback);
    if (!success) {
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    // Immediately calculate and return the new accuracy score
    const newAccuracy = getAuditAccuracy(auditType);

    return NextResponse.json({ success: true, newAccuracy });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auditType = req.nextUrl.searchParams.get('auditType');
    if (!auditType) {
      return NextResponse.json({ error: "Missing auditType parameter" }, { status: 400 });
    }

    const accuracy = getAuditAccuracy(auditType);
    return NextResponse.json({ accuracy });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
