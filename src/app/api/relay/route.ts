import { NextResponse } from "next/server";

// In a real database, this would be a Postgres table or Redis store.
// For this Phase 2 mock, we hold it in memory.
const globalRelayStore: Record<string, any[]> = {};

export async function POST(req: Request) {
  try {
    const { groupId, blob } = await req.json();
    
    if (!groupId || !blob) {
      return NextResponse.json({ error: "Missing groupId or blob" }, { status: 400 });
    }

    if (!globalRelayStore[groupId]) {
      globalRelayStore[groupId] = [];
    }

    // We blindly store the ciphertext. We literally cannot read it.
    globalRelayStore[groupId].push({
      ...blob,
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true, count: globalRelayStore[groupId].length });
  } catch (err) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }

  const blobs = globalRelayStore[groupId] || [];
  return NextResponse.json({ blobs });
}
