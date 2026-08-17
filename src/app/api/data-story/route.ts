import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { query, schema, userContext } = await req.json();

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) {
      return NextResponse.json({ error: "Gemini API Key required for Data Stories." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are Mary, an expert data journalist and statistical analyst.
Your job is to take a user's natural language query, their historical interests, and a database schema, and generate a "Data Story".
You must return a STRICT JSON object containing the DuckDB SQL to run, the recommended chart type, and an editorial narrative summarizing the expected result.

Rules:
1. "query": Must be a valid DuckDB SQL string using the provided schema. Do not include markdown formatting.
2. "chartType": Must be one of ["scatter", "bar", "line", "choropleth", "pie"].
3. "narrative": A 3-7 paragraph editorial briefing. If the user asks for a professional tone, use statistical terms (p-values, variance). If plain English, make it simple.

User Context/Interests: ${JSON.stringify(userContext)}
Schema: ${JSON.stringify(schema)}`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: query }] }],
        systemInstruction: systemPrompt,
        generationConfig: { responseMimeType: "application/json" }
    });
    
    const responseText = result.response.text();

    try {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ error: "Invalid JSON from LLM" }, { status: 500 });
    }
  } catch (error) {
    console.error("Data Story Error:", error);
    return NextResponse.json({ error: "Failed to generate Data Story" }, { status: 500 });
  }
}
