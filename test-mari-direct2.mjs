import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

let systemInstruction = fs.readFileSync("src/app/api/chat/route.ts", "utf-8").match(/const systemInstruction = `([\s\S]*?)`;/)[1];
systemInstruction = systemInstruction.replace("${modePrompt}", "");
systemInstruction = systemInstruction.replace("${pageContextPrompt}", "");
systemInstruction = systemInstruction.replace("${articleState ? `CURRENT ARTICLE STATE:\n${JSON.stringify(articleState, null, 2)}` : ''}", "");
systemInstruction = systemInstruction.replace("${DOCS_DATA}", "");

// Override the ZERO HALLUCINATION EXCEPTION to force concurrent tools
systemInstruction = systemInstruction.replace(
  "Second, USE YOUR BROAD TRAINING KNOWLEDGE to proactively generate a chart and a narrative section answering their question using 'append_section'. Do not refuse by saying you don't have internet access; rely on your LLM weights to generate the story!",
  "Second, USE YOUR BROAD TRAINING KNOWLEDGE to proactively generate a chart and a narrative section answering their question using 'append_section'. YOU MUST CALL BOTH TOOLS CONCURRENTLY IN THE EXACT SAME TURN. Do not refuse by saying you don't have internet access; rely on your LLM weights to generate the story!"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

const tools = [{
  functionDeclarations: [
    {
      name: "triage_and_fetch_dataset",
      description: "Hunts for a public dataset URL online.",
      parameters: {
        type: "OBJECT",
        properties: {
          search_query: { type: "STRING" },
          found_url: { type: "STRING" },
          suggested_name: { type: "STRING" },
          description: { type: "STRING" }
        },
        required: ["search_query", "found_url", "suggested_name", "description"]
      }
    },
    {
      name: "append_section",
      description: "Appends a new section to the end of the Data Story.",
      parameters: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          heading: { type: "STRING" },
          narrative: { type: "STRING" }
        },
        required: ["id", "heading", "narrative"]
      }
    }
  ]
}];

const query = "What is the correlation between age demographics in Mississippi voter rolls and state-by-state obesity rates?";

async function runTest() {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash", systemInstruction, tools });
  const chat = model.startChat({ history: [] });
  const result = await chat.sendMessage(query);
  const functionCalls = result.response.functionCalls();
  
  if (functionCalls && functionCalls.length > 0) {
    console.log(`Tools Called: ${functionCalls.map(f => f.name).join(", ")}`);
  } else {
    console.log("No tools called.");
    console.log(result.response.text());
  }
}

runTest();
