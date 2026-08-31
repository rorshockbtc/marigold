import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { z } from 'zod';

const RequestSchema = z.object({
  query: z.string().min(1).max(2000),
  schema: z.array(z.any()),
  sqlError: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = RequestSchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { query, schema, sqlError } = parsed.data;

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) return NextResponse.json({ error: "Server configuration error." }, { status: 500 });

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

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

    let systemPrompt = `You are a strict data engineering API.
Your job is to read a CSV schema and a user query, and return ONLY a valid DuckDB SQL statement and a chart configuration for Nivo.
The SQL query MUST read from a table named 'data_file'.
Example query: SELECT county as x, count(*) as y FROM data_file GROUP BY county ORDER BY y DESC LIMIT 10
Schema: ${JSON.stringify(schema)}`;

    if (sqlError) {
      systemPrompt += `\n\nCRITICAL: Your previous SQL attempt failed with error: ${sqlError}\nPlease correct your DuckDB SQL syntax.`;
    }

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
    console.error("SQL Generator Error:", error);
    return NextResponse.json({ error: "Failed to generate SQL payload" }, { status: 500 });
  }
}
