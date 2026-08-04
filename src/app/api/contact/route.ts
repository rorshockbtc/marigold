import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate request
    if (!data.email && !data.contact) {
      return NextResponse.json({ error: "Email or contact info is required." }, { status: 400 });
    }

    // Process contact submission (e.g. logging securely or forwarding to webhook)
    console.log("[Contact Submission Received]:", data);

    return NextResponse.json({ 
      success: true, 
      message: "Thank you! Your inquiry has been received. Our team will follow up directly." 
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to process inquiry." }, { status: 500 });
  }
}
