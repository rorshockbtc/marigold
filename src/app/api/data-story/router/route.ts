import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';

const RequestSchema = z.object({
  query: z.string().min(1).max(2000),
  activeSchemaName: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { query, activeSchemaName } = parsed.data;

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) return NextResponse.json({ error: "Server configuration error." }, { status: 500 });

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        intent: { 
          type: SchemaType.STRING, 
          description: "Must be one of: 'LOCAL_DATA', 'WEB_HUNT', or 'QUALITATIVE_RESEARCH'" 
        },
        reasoning: {
          type: SchemaType.STRING,
          description: "A short 1-sentence explanation of why this intent was chosen."
        },
        proposedDatasetQuery: {
          type: SchemaType.STRING,
          description: "If intent is WEB_HUNT, provide a 3-5 word query to search for the dataset (e.g. 'historical bitcoin transaction latency'). Otherwise null."
        }
      },
      required: ["intent", "reasoning"]
    };

    const systemPrompt = `You are the Marigold Agentic Router. Your job is to classify a user's prompt into one of three execution paths.

Path A: LOCAL_DATA
- The user is asking a mathematical/statistical question about a dataset they have already uploaded.
- Current active dataset: ${activeSchemaName || "None"}

Path B: WEB_HUNT
- The user is asking a mathematical/statistical question, but they have NOT uploaded the required dataset. We need to find and download it for them.
- Example: "Compare 1990s telecom latencies to Bitcoin." (Requires finding a latency dataset).

Path C: QUALITATIVE_RESEARCH
- The user is asking a purely historical, conceptual, or theoretical question that does not require downloading a CSV for local statistical math.
- Example: "Write an essay on Alan Turing and binary code."

Analyze the prompt and return the strictly formatted JSON.`;

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
    console.error("Router Generator Error:", error);
    return NextResponse.json({ error: "Failed to classify intent" }, { status: 500 });
  }
}
