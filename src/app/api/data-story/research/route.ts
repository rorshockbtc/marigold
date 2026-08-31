import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';

const RequestSchema = z.object({
  query: z.string().min(1).max(3000),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { query } = parsed.data;

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) return NextResponse.json({ error: "Server configuration error." }, { status: 500 });

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        narrative: { 
          type: SchemaType.STRING, 
          description: "A dense, compellingly written 3-7 paragraph editorial essay answering the user's prompt. Must use markdown." 
        },
        citations: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              url: { type: SchemaType.STRING },
              snippet: { type: SchemaType.STRING }
            },
            required: ["title", "url", "snippet"]
          }
        }
      },
      required: ["narrative", "citations"]
    };

    const systemPrompt = `You are Mari, the lead data journalist for Marigold.
The user has asked a deep qualitative/historical question.
You must synthesize a dense, Atlantic-style historical essay. 
Because you do not have local DuckDB data for this, you must generate a set of factual citations (URLs and snippets) that back up your narrative.

Return the JSON payload with the 'narrative' and the 'citations' array.`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: query }] }],
        systemInstruction: systemPrompt,
        generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });
    
    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error) {
    console.error("Research Generator Error:", error);
    return NextResponse.json({ error: "Failed to generate research" }, { status: 500 });
  }
}
