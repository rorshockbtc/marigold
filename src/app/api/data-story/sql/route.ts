import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';
import { generateDeterministicSQLPayload } from '@/lib/ai/deterministicStoryEngine';

const RequestSchema = z.object({
  query: z.string().min(1).max(2000),
  schema: z.array(z.any()),
  sqlError: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  let fallbackQuery = 'county distribution';
  let fallbackSchema: any[] = [];
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { query, schema, sqlError } = parsed.data;
    fallbackQuery = query;
    fallbackSchema = schema;

    const activeApiKey = process.env.GEMINI_API_KEY;
    // Zero-cost deterministic fallback if no valid API key or if a previous SQL error occurred
    if (!activeApiKey || activeApiKey.includes('[SENSITIVE]') || sqlError) {
      return NextResponse.json(generateDeterministicSQLPayload(query, schema));
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: "The valid DuckDB SQL query string." },
        chartType: { type: SchemaType.STRING, description: "Must be 'bar', 'line', 'scatter', or 'pie'" },
        chartConfig: {
          type: SchemaType.OBJECT,
          properties: {
            xAxisKey: { type: SchemaType.STRING },
            yAxisKey: { type: SchemaType.STRING },
            xAxisLabel: { type: SchemaType.STRING },
            yAxisLabel: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING }
          },
          required: ["title"]
        }
      },
      required: ["query", "chartType", "chartConfig"]
    };

    const systemPrompt = `You are a strict data engineering API.
Your job is to read a CSV schema and a user query, and return ONLY a valid DuckDB SQL statement and a chart configuration for Nivo.
The SQL query MUST read from a table named 'data_file'.
Example query: SELECT county as x, count(*) as y FROM data_file GROUP BY county ORDER BY y DESC LIMIT 10
Schema: ${JSON.stringify(schema)}

Chart Selection Rules:
1. 'scatter' - USE THIS when comparing two continuous numerical variables or plotting correlations over time.
2. 'line' - USE THIS when showing trends over time where data is continuous.
3. 'pie' - USE THIS for showing proportions of a whole with fewer than 7 categories.
4. 'bar' - USE THIS for comparing discrete categories (e.g., counties, addresses, buckets).`;

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
    // Graceful zero-cost fallback so user queries never fail with 500
    return NextResponse.json(generateDeterministicSQLPayload(fallbackQuery, fallbackSchema));
  }
}
