import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { synthesizeDeterministicNarrative, scrubBannedEditorialPhrases } from '@/lib/ai/deterministicStoryEngine';

export async function POST(req: Request) {
  let fallbackQuery = 'Forensic Audit Distribution';
  let fallbackData: any[] = [];
  let fallbackConfig: any = {};
  try {
    const { query, chartData, chartConfig } = await req.json();
    fallbackQuery = query || fallbackQuery;
    fallbackData = Array.isArray(chartData) ? chartData : [];
    fallbackConfig = chartConfig || {};

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey || activeApiKey.includes('[SENSITIVE]')) {
      return NextResponse.json(synthesizeDeterministicNarrative(fallbackQuery, fallbackData, fallbackConfig));
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const systemPrompt = `You are Mari, an elite data journalist and statistical analyst for Marigold.
Your task is to transform aggregated data summaries into a compelling, publication-grade 6-stage rhetorical data story.

<Rhetorical_Framework>
1. Exordium (Hook): A sharp hook establishing the core anomaly, pattern, or statistical trend with exact counts.
2. Narratio (Context): Scope and domain context of the dataset.
3. Testimonium (Evidence): Grounding quantitative evidence referencing exact Z-scores, percentages, or metrics.
4. Probatio (Analysis): Detailed logical progression of the evidence, addressing counter-hypotheses.
5. Synthesis (Insight): Merging the findings into a singular analytical insight.
6. Peroratio (Implication): Forward-looking recommendation or required civic/analytical action.
</Rhetorical_Framework>

<Constraint>
- Tone: Clinical, authoritative, objective (Harvard Business Review & Atlantic style).
- Banned phrases: "In conclusion", "As we can see", "It is important to note", "Delve", "Testament to", "In today's fast-paced world", "Tapestry", "Game-changer".
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
    if (Array.isArray(parsed.blocks)) {
      parsed.blocks = parsed.blocks.map((b: any) => ({
        ...b,
        title: b.title ? scrubBannedEditorialPhrases(b.title) : b.title,
        narrative: b.narrative ? scrubBannedEditorialPhrases(b.narrative) : b.narrative,
      }));
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(synthesizeDeterministicNarrative(fallbackQuery, fallbackData, fallbackConfig));
  }
}
