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
          description: "Must be one of: 'LOCAL_DATA_EXPLORE', 'LOCAL_DATA_DRAFT', 'WEB_HUNT', 'QUALITATIVE_RESEARCH', 'CLARIFY_MOTIVATION'" 
        },
        reasoning: {
          type: SchemaType.STRING,
          description: "A short 1-sentence explanation of why this intent was chosen."
        },
        proposedDatasetQuery: {
          type: SchemaType.STRING,
          description: "If intent is WEB_HUNT, provide a 3-5 word query to search for the dataset (e.g. 'historical bitcoin transaction latency'). Otherwise null."
        },
        socraticQuestion: {
          type: SchemaType.STRING,
          description: "If intent is CLARIFY_MOTIVATION or LOCAL_DATA_EXPLORE, provide the Socratic question to ask the user. Ask ONE question at a time to uncover their motivation or guide their exploration."
        }
      },
      required: ["intent", "reasoning"]
    };

    const systemPrompt = `You are Mari, the Agentic Socratic Router for Marigold Insights. Your job is to classify a user's prompt into a multi-stage reasoning pipeline.

Pipes is exploratory (consumption driven). Data Stories is generative.
You must enforce a Socratic method: Ask ONE question at a time to understand the user's motivation and goals before drafting a story.

Path A: CLARIFY_MOTIVATION
- The user has provided a vague request, or you need to understand their goals and motivation before proceeding.
- Output a 'socraticQuestion' to ask the user. 
- Example: "Are you looking to find an anomaly in this data, or just understand the general trend?"

Path B: LOCAL_DATA_EXPLORE
- The user is asking an exploratory statistical question about their uploaded data. They do NOT want to generate a formal report yet.
- Current active dataset: ${activeSchemaName || "None"}
- You will query the data to answer their question, but you will also provide a 'socraticQuestion' to guide their next step.

Path C: LOCAL_DATA_DRAFT
- The user explicitly wants to generate a section, report, story, or "Dossier Block" based on the data.
- Current active dataset: ${activeSchemaName || "None"}

Path D: WEB_HUNT
- The user is asking a statistical question, but they have NOT uploaded the required dataset. We need to find and download it.
- Example: "Compare 1990s telecom latencies to Bitcoin." (Requires finding a latency dataset).

Path E: QUALITATIVE_RESEARCH
- The user is asking a purely historical, conceptual, or theoretical question that does not require downloading a CSV.

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
