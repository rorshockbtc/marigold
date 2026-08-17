import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Unsplash API Error:", res.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch from Unsplash' }, { status: res.status });
    }

    const photo = await res.json();
    
    if (photo && photo.urls) {
      return NextResponse.json({ 
        url: photo.urls.regular,
        photographerName: photo.user.name,
        photographerUrl: `${photo.user.links.html}?utm_source=marigold_insights&utm_medium=referral`,
        downloadLocation: photo.links.download_location
      });
    } else {
      return NextResponse.json({ error: 'No images found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Error connecting to Unsplash:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
