import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';
import { synthesizeDeterministicResearch } from '@/lib/ai/deterministicStoryEngine';

const RequestSchema = z.object({
  query: z.string().min(1).max(3000),
});

export async function POST(req: Request) {
  let fallbackQuery = 'Statutory Voter Roll Maintenance';
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { query } = parsed.data;
    fallbackQuery = query;

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey || activeApiKey.includes('[SENSITIVE]')) {
      return NextResponse.json(synthesizeDeterministicResearch(query));
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
Synthesize a dense, Atlantic-style historical essay with factual primary-source citations (URLs and snippets).`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: query }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    return NextResponse.json(JSON.parse(result.response.text()));
  } catch {
    return NextResponse.json(synthesizeDeterministicResearch(fallbackQuery));
  }
}
