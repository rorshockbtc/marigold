import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { profile } = await request.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured. Falling back to static mapper." }, { status: 503 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const schema = {
      type: "OBJECT",
      properties: {
        voter_id: { type: "STRING", description: "Original column name for the Voter ID or registration number" },
        first_name: { type: "STRING" },
        middle_name: { type: "STRING" },
        last_name: { type: "STRING" },
        suffix: { type: "STRING" },
        full_name: { type: "STRING" },
        address: { type: "STRING", description: "Original column name for residential street address" },
        city: { type: "STRING" },
        state: { type: "STRING" },
        zip: { type: "STRING" },
        county: { type: "STRING" },
        status: { type: "STRING", description: "Original column name for voter status (Active/Inactive)" },
        date_registered: { type: "STRING", description: "Original column name for the date the voter registered" },
        precinct_code: { type: "STRING" },
        ncoa_flag: { type: "STRING" }
      }
    };

    const prompt = `You are an expert data analyst. 
I am providing a structural profile of columns from a voter registration dataset. The data has been obfuscated (PII removed), but the data types and formats are preserved.
Map the provided original column names to the required schema fields based on their data types and formats.
Return ONLY valid JSON matching the schema. If a field cannot be matched with confidence, leave it as an empty string.

Column Profiles:
${JSON.stringify(profile, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    if (response.text) {
      return NextResponse.json({ mapping: JSON.parse(response.text) });
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("AI Mapper error", error);
    return NextResponse.json({ error: "Failed to map columns" }, { status: 500 });
  }
}
