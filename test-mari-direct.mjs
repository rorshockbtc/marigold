import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

// Load the system prompt text
const routeContent = fs.readFileSync("src/app/api/chat/route.ts", "utf-8");
const systemPromptMatch = routeContent.match(/const systemInstruction = `([\s\S]*?)`;/);
let systemInstruction = systemPromptMatch ? systemPromptMatch[1] : "";

// Stub missing variables
systemInstruction = systemInstruction.replace("${modePrompt}", "CRITICAL INSTRUCTION FOR ANALYST PRO MODE (ACTIVE):\n Provide exact standard deviations, Z-scores, kurtosis, and data vectors alongside concise explanations.");
systemInstruction = systemInstruction.replace("${pageContextPrompt}", "");
systemInstruction = systemInstruction.replace("${articleState ? `CURRENT ARTICLE STATE:\n${JSON.stringify(articleState, null, 2)}` : ''}", "");
systemInstruction = systemInstruction.replace("${DOCS_DATA}", "docs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// The tools array copied from route.ts
const tools = [{
  functionDeclarations: [
    {
      name: "query_dataset",
      description: "Queries the active external or local dataset to get real mathematical aggregations for your charts. ALWAYS use this instead of hallucinating data.",
      parameters: {
        type: "OBJECT",
        properties: {
          metric: { type: "STRING", description: "What you are measuring" },
          group_by: { type: "STRING", description: "Optional field to group by" },
          dataset_url: { type: "STRING", description: "Optional URL of a public dataset to query instead of the local workspace." }
        },
        required: ["metric"]
      }
    },
    {
      name: "triage_and_fetch_dataset",
      description: "Hunts for a public dataset URL online when the user's analytical query cannot be answered by the currently active local dataset. Use this to find external data.",
      parameters: {
        type: "OBJECT",
        properties: {
          search_query: { type: "STRING", description: "The exact search query to find the data online." },
          found_url: { type: "STRING", description: "A realistic public URL to the dataset." },
          suggested_name: { type: "STRING", description: "A short variable name for this dataset." },
          description: { type: "STRING", description: "A conversational explanation of what you found." }
        },
        required: ["search_query", "found_url", "suggested_name", "description"]
      }
    },
    {
      name: "append_section",
      description: "Appends a new section to the end of the Data Story. Use this to add new charts or paragraphs without overwriting previous work.",
      parameters: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING", description: "A unique string ID for this new section" },
          heading: { type: "STRING", description: "Section heading" },
          narrative: { type: "STRING", description: "The paragraphs/text for this section." }
        },
        required: ["id", "heading", "narrative"]
      }
    }
  ]
}];

const testCases = [
  "What is the correlation between age demographics in Mississippi voter rolls and state-by-state obesity rates?",
  "How do the active voter registrations in Hinds County compare with historical national inflation rates since 1980?",
  "Is there a relationship between the party affiliation split in DeSoto County and national high school graduation rates?"
];

async function runTests() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Please export GEMINI_API_KEY.");
    return;
  }
  
  console.log("Starting tests against raw GoogleGenerativeAI...");
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash", systemInstruction, tools });
  
  for (let i = 0; i < testCases.length; i++) {
    const query = testCases[i];
    console.log(`\n--- Test Case ${i + 1} ---`);
    console.log(`Query: "${query}"`);
    
    try {
      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage(query);
      const res = result.response;
      const functionCalls = res.functionCalls();
      
      let hasTriage = false;
      let hasAppend = false;
      
      if (functionCalls && functionCalls.length > 0) {
        console.log(`Tools Called: ${functionCalls.map(f => f.name).join(", ")}`);
        if (functionCalls.some(f => f.name === "triage_and_fetch_dataset")) hasTriage = true;
        if (functionCalls.some(f => f.name === "append_section")) hasAppend = true;
      }
      
      if (hasTriage && hasAppend) {
        console.log("✅ PASSED: Mari used BOTH triage and append_section as instructed.");
      } else if (hasTriage || hasAppend) {
        console.log("⚠️ PARTIAL: Mari used some tools but not both concurrently.");
      } else {
        console.log("❌ FAILED: Mari did not use tools proactively.");
      }
      
    } catch (err) {
      console.error("Test failed:", err.message);
    }
  }
}

runTests();
