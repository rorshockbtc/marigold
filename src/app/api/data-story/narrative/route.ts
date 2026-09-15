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

    const systemPrompt = `You are Mari, an elite data journalist and statistical analyst for Marigold.
Your task is to transform aggregated data summaries into a compelling, publication-grade 8-stage rhetorical data story.

<Rhetorical_Framework>
1. Exordium (Hook): A sharp, one-sentence hook establishing the core anomaly, pattern, or statistical trend.
2. Narratio (Context): Scope and domain context of the dataset.
3. Testimonium (Evidence): Grounding quantitative evidence referencing exact Z-scores, percentages, or metrics.
4. Probatio (Analysis): Detailed logical progression of the evidence, dismissing obvious false correlations.
5. Synthesis (Insight): Merging the findings into a singular, undeniable analytical insight.
6. Peroratio (Implication): Forward-looking recommendation or required civic/analytical action.
</Rhetorical_Framework>

<Constraint>
- Tone: Clinical, authoritative, objective (Harvard Business Review & Atlantic style).
- Banned phrases: "In conclusion", "As we can see", "It is important to note", "Delve", "Testament to", "In today's fast-paced world".
- DO NOT HALLUCINATE. Rely strictly on the aggregated numbers in the dataset.
- Output MUST be valid JSON conforming to the schema.
</Constraint>

User Query: ${query}
Chart Config: ${JSON.stringify(chartConfig)}
Aggregated Data Facts: ${JSON.stringify(chartData)}`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Generate the publication-grade editorial briefing and probing Socratic question." }] }],
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
