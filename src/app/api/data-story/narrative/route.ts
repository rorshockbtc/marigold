import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { query, chartData, chartConfig } = await req.json();

    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) return NextResponse.json({ error: "Gemini API Key required." }, { status: 400 });

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const systemPrompt = `You are Mari, the lead data journalist for Marigold Insights.
The user asked a question about a dataset. A local data engine has executed the math and returned the exact aggregated results.
Your job is to write a 3-7 paragraph editorial briefing (a Data Story) explaining these results.

Rules:
1. DO NOT HALLUCINATE. Only write about the numbers provided in the 'Chart Data' below.
2. Use markdown formatting. Use bolding for key numbers.
3. Keep the tone professional but accessible (like the New York Times Upshot).

User Question: ${query}
Chart Context: ${JSON.stringify(chartConfig)}
Aggregated Chart Data (THE HARD FACTS): ${JSON.stringify(chartData)}`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Write the editorial briefing." }] }],
        systemInstruction: systemPrompt,
    });
    
    return NextResponse.json({ narrative: result.response.text() });
  } catch (error) {
    console.error("Narrative Generator Error:", error);
    return NextResponse.json({ error: "Failed to generate narrative" }, { status: 500 });
  }
}
