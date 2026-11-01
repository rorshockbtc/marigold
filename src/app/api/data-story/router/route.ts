import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';
import { classifyIntentDeterministic } from '@/lib/ai/deterministicStoryEngine';

const RequestSchema = z.object({
  query: z.string().min(1).max(2000),
  activeSchemaName: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  let fallbackQuery = '';
  let fallbackSchemaName: string | null = null;
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { query, activeSchemaName } = parsed.data;
    fallbackQuery = query;
    fallbackSchemaName = activeSchemaName ?? null;

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey || activeApiKey.includes('[SENSITIVE]')) {
      return NextResponse.json(classifyIntentDeterministic(query, fallbackSchemaName));
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        intent: {
          type: SchemaType.STRING,
          description: "Must be one of: 'LOCAL_DATA_EXPLORE', 'LOCAL_DATA_DRAFT', 'WEB_HUNT', 'QUALITATIVE_RESEARCH', 'CLARIFY_MOTIVATION'"
        },
        reasoning: {
          type: SchemaType.STRING,
          description: "A short 1-sentence explanation of why this intent was chosen."
        },
        proposedDatasetQuery: {
          type: SchemaType.STRING,
          description: "If intent is WEB_HUNT, provide a 3-5 word query to search for the dataset. Otherwise null."
        },
        socraticQuestion: {
          type: SchemaType.STRING,
          description: "Provide ONE Socratic question to guide the user's exploration."
        }
      },
      required: ["intent", "reasoning"]
    };

    const systemPrompt = `You are Mari, the Agentic Socratic Router for Marigold Insights. Classify the user's prompt into LOCAL_DATA_EXPLORE, LOCAL_DATA_DRAFT, WEB_HUNT, QUALITATIVE_RESEARCH, or CLARIFY_MOTIVATION. Current active dataset: ${activeSchemaName || "None"}.`;

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
    return NextResponse.json(classifyIntentDeterministic(fallbackQuery, fallbackSchemaName));
  }
}
