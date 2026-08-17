import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { downloadLocation } = await req.json();

    if (!downloadLocation) {
      return NextResponse.json({ error: 'Download location is required' }, { status: 400 });
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
    }

    const res = await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });

    if (!res.ok) {
      console.error("Unsplash Download Endpoint Error:", res.status);
      return NextResponse.json({ error: 'Failed to trigger download' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error connecting to Unsplash download endpoint:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
