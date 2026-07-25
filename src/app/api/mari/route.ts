import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { query, localDataKeys, activeGroup } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are Mari, the Data Concierge for Marigold Insights.
      Your job is to determine if a user's analytical query can be answered using data they already have locally, or if you need to fetch public data (e.g., from Data.gov or Google Data Commons).
      
      User Query: "${query}"
      Active User Group: "${activeGroup}"
      Local Data Available: [${(localDataKeys || []).join(', ')}]
      
      Instructions:
      1. If the user's query requires datasets that are NOT in the 'Local Data Available' list, you MUST return an action of "fetch_public_data". Provide a realistic URL to a public CSV or JSON endpoint (e.g., a data.gov or census.gov or cdc.gov CSV URL) and a description of what you found.
      2. If the user's query CAN be answered by the Local Data Available, or if they are just asking a general question that doesn't require data, return an action of "generate_sql" or "chat_response".
      
      Respond strictly in JSON format matching this schema:
      {
        "action": "fetch_public_data" | "generate_sql" | "chat_response",
        "source_url": "URL to public CSV if fetch_public_data, otherwise null",
        "description": "A conversational message explaining what you found (e.g., 'I don't have that locally, but I found the CDC dataset at HealthData.gov...')",
        "suggested_dataset_name": "A short name for the dataset if fetch_public_data (e.g., 'cdc_obesity_2023')"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Mari API Error:", error);
    // Fallback if LLM fails
    return NextResponse.json({
      action: "fetch_public_data",
      source_url: "https://data.cdc.gov/api/views/mock/rows.csv",
      description: "I had trouble reaching my API, but I simulated finding a relevant public dataset for you to explore.",
      suggested_dataset_name: "mock_public_data"
    });
  }
}
