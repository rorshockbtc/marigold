import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { getRandomRhetoric } from '@/lib/storytelling/rhetoric';

export async function POST(req: Request) {
  try {
    const { query, chartData, chartConfig } = await req.json();

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) return NextResponse.json({ error: "Gemini API Key required." }, { status: 400 });

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        nextSocraticQuestion: { 
          type: SchemaType.STRING, 
          description: "A probing Socratic question to guide the user's next step."
        },
        blocks: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING, description: "Must be 'hook', 'thesis', 'chart', 'dialectic_antithesis', or 'synthesis'" },
              title: { type: SchemaType.STRING, description: "Optional title for this block. Leave empty if 'chart'." },
              narrative: { type: SchemaType.STRING, description: "The text content for this block. Leave empty if 'chart'." }
            },
            required: ["type"]
          }
        }
      },
      required: ["nextSocraticQuestion", "blocks"]
    };

    const rhetoric = getRandomRhetoric();

    const systemPrompt = `You are Mari, the lead data journalist and Socratic tutor for Marigold Insights.
The user asked a question about a dataset. A local data engine has executed the math and returned the exact aggregated results.
Your job is to draft a 3-7 paragraph editorial briefing (a Data Story) explaining these results, AND provide a guiding Socratic question.

Rhetorical Framework: ${rhetoric.name}
${rhetoric.description}
Structure your narrative following these steps:
${rhetoric.structure.map((s, i) => `${i+1}. ${s}`).join('\n')}

Rules:
1. DO NOT HALLUCINATE. Only write about the numbers provided in the 'Chart Data' below.
2. Output a structured JSON object containing 'nextSocraticQuestion' and 'blocks'.
3. 'nextSocraticQuestion' should be a short, engaging question prompting the user's next analytical step. Use this hint: "${rhetoric.socraticPrompt}"
4. In 'blocks', you MUST include exactly ONE block with type 'chart' where the visualization should be inserted.
5. Keep the tone professional but accessible (like the New York Times Upshot).

User Question: ${query}
Chart Context: ${JSON.stringify(chartConfig)}
Aggregated Chart Data (THE HARD FACTS): ${JSON.stringify(chartData)}`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Write the editorial briefing and the Socratic question." }] }],
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
    });
    
    const parsed = JSON.parse(result.response.text());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Narrative Generator Error:", error);
    return NextResponse.json({ error: "Failed to generate narrative" }, { status: 500 });
  }
}
