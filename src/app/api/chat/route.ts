import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
// @ts-ignore
import { jStat } from 'jstat';
import { getDb, getFeedbackLogs, analyzeBenfordsLaw } from '@/lib/db/sqlite';

const DOCS_DATA = `
Phase 2 Audits:
- High-Density Occupancy: Addresses with 12+ voters (institutions).
- Missing Unit/Dorm Number: 50+ voters missing APT/STE.
- P.O. Box in Residence: Physical addresses that are P.O. Boxes.

Phase 3 Audits:
- Fat-Finger Typo Check: First/Last names that are 1 character long.
- Intra-County Duplicates: Same Name + Zip, different street address.
- Commercial Disguises: Residences with 'STE', 'BLDG'.

Phase 4 Audits:
- Registration Spikes: Massive single-day registration surges.
- Phantom Precincts: Active voters with no precinct assigned.
- Out-of-State Mailing Loophole: Active MS voters with out-of-state mail.

Phase 5:
- Mission Control: A page of pre-configured, 1-click Playbooks for volunteers.
- Pro Mode: The sandbox where users can tune threshold sliders and save Playbooks.
- Exclusion Loop (False Positives): Users can click 'Thumbs Down' on any record to banish it from the global organization's search results forever.

Stats 101 Reference (For Non-Nerds):
- Mean (Average): The mathematical average. Prone to being wildly skewed by massive outliers (like nursing homes).
- Median: The middle number. Much safer for finding the 'normal' experience.
- Standard Deviation: How spread out the data is. A high standard deviation means the data is chaotic and full of outliers.
- Z-Score: A statistically valid way to measure exactly how abnormal an outlier is. A Z-Score over 3 means it is mathematically highly suspicious/anomalous.
- Skewness / Kurtosis: Measures if the data leans heavily to one side or has "fat tails" (meaning lots of extreme outliers).
- Benford's Law: A mathematical law used by the IRS to catch fabricated data. The leading digit in a dataset should naturally be '1' 30% of the time, and '9' less than 5% of the time. If data severely violates this curve, it is likely fabricated.
`;

const runRobustStatisticsDeclaration: FunctionDeclaration = {
  name: "run_robust_statistics",
  description: "Runs rigorous mathematical statistics (mean, median, standard dev, variance, skewness, kurtosis, quartiles) on a database metric.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      metric: {
        type: Type.STRING,
        description: "The metric to analyze. Can be 'occupancy' (voters per address) or 'registrations' (voters registered per day)."
      },
      county: {
        type: Type.STRING,
        description: "Optional county name to filter the data. Leave blank for statewide."
      }
    },
    required: ["metric"]
  }
};

const runBenfordsLawDeclaration: FunctionDeclaration = {
  name: "run_benfords_law",
  description: "Runs Benford's Law probability distribution analysis on street addresses to detect data fabrication (human fraud).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      county: {
        type: Type.STRING,
        description: "Optional county name to filter the data. Leave blank for statewide."
      }
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const { query, history, userApiKey } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const activeApiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!activeApiKey) {
      return NextResponse.json({ error: "No Gemini API Key configured. Please add one in Settings." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: activeApiKey });
    
    // Fetch live feedback logs for transparency
    const recentFeedback = getFeedbackLogs();
    const feedbackContext = recentFeedback.map((f: any) => `- Audit: ${f.audit_type}, Feedback: ${f.user_feedback}, Date: ${f.created_at}`).join('\\n');

    const systemInstruction = `
      You are the "ELLY Guide", an incredibly patient and statistically rigorous software tutor.
      
      Your user base consists of two distinct groups:
      1. Non-Nerds (Volunteers): They want to work hard and find anomalies but lack statistical language.
      2. Stats Nerds (like Ken Cyree or Seth Keshel): They demand robust, mathematically valid results (distributions, standard deviations, z-scores).

      GENERAL TONE & PERSONA:
      - You are helping 70-year-old grandmas navigate complex data. Be incredibly empathetic, gentle, and strictly step-by-step.
      - NEVER dump huge walls of text or sound like a marketing brochure. Keep answers short, conversational, and hyper-focused on the user's immediate question.
      - Use markdown to highlight important terms, but explain what you want the user to do NEXT.

      CONVERSATIONAL PATTERN FOR STATS:
      - Always bridge the gap. If a user asks for a simple average, you MUST run your 'run_robust_statistics' tool. 
      - When you return the results, FIRST give the Stats Nerd their rigorous data (Standard Deviation, Skewness, Kurtosis, Z-Scores for outliers).
      - SECOND, immediately provide a "Walkthrough for Non-Nerds" breaking down exactly what those numbers mean in plain English. 
      - Coach the user into statistically valid practices. Explain that relying on averages is dangerous, and they should look at Z-Scores to identify true outliers (like massive nursing homes).
      - Maintain a friendly but highly strict audit documentation tone. 

      HANDLING EMPTY DATABASES:
      - If a tool returns {"error": "Database not connected."}, do NOT apologize for a generic error.
      - Instead, cheerfully inform the user that ELLY has not received any data yet! 
      - Instruct them to go to the "Advanced Stats" or "Data Linkage" page and drag-and-drop their November Voter Roll CSV into the system to initialize the database.

      TRANSPARENCY & ACCURACY PREDICTION:
      - We have a live feedback loop where volunteers rate audits as 'met', 'failed', or 'exceeded'.
      - If a user asks why an audit has a specific Predicted Accuracy score, use the recent feedback log below to transparently explain how past users have rated it.
      
      Recent User Feedback Log:
      ${feedbackContext || 'No feedback logged yet.'}

      Here is the complete documentation of the platform features:
      ---
      ${DOCS_DATA}
      ---
    `;

    // Construct history for multi-turn
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [runRobustStatisticsDeclaration, runBenfordsLawDeclaration] }],
        temperature: 0.7
      }
    });

    let response = await chat.sendMessage({ message: query });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === "run_robust_statistics") {
        const { metric, county } = call.args as any;
        const db = getDb();
        let statsResult = {};

        if (db) {
          try {
            let data: number[] = [];
            const countyFilter = county ? `WHERE county = '${county.replace(/'/g, "''")}'` : '';
            
            if (metric === 'occupancy') {
              const rows = db.prepare(`SELECT COUNT(*) as c FROM voters ${countyFilter} GROUP BY address HAVING c > 0`).all() as any[];
              data = rows.map(r => r.c);
            } else if (metric === 'registrations') {
              const rows = db.prepare(`SELECT COUNT(*) as c FROM voters ${countyFilter} GROUP BY date_registered HAVING c > 0`).all() as any[];
              data = rows.map(r => r.c);
            }

            if (data.length > 0) {
              const vector = jStat(data);
              const maxVal = vector.max();
              const meanVal = vector.mean();
              const stdevVal = vector.stdev();
              // Calculate Z-Score of the maximum outlier
              const maxZScore = stdevVal > 0 ? ((maxVal - meanVal) / stdevVal).toFixed(2) : 0;

              statsResult = {
                metric,
                county: county || "Statewide",
                sampleSize: data.length,
                mean: meanVal,
                median: vector.median(),
                standardDeviation: stdevVal,
                variance: vector.variance(),
                skewness: vector.skewness(),
                kurtosis: vector.kurtosis(),
                quartiles: vector.quartiles(),
                min: vector.min(),
                max: maxVal,
                maxOutlierZScore: maxZScore
              };
            } else {
              statsResult = { error: "No data found for this metric/county." };
            }
          } catch (e: any) {
            statsResult = { error: e.message };
          }
        } else {
          statsResult = { error: "Database not connected." };
        }

        response = await chat.sendMessage({
          message: [{
            functionResponse: {
              name: call.name,
              response: statsResult
            }
          }]
        });
      } else if (call.name === "run_benfords_law") {
        const { county } = call.args as any;
        const db = getDb();
        let statsResult = {};
        
        if (db) {
          try {
            const results = analyzeBenfordsLaw(county || '');
            if (results) {
              statsResult = results;
            } else {
              statsResult = { error: "No data found for this county." };
            }
          } catch (e: any) {
            statsResult = { error: e.message };
          }
        } else {
          statsResult = { error: "Database not connected." };
        }

        response = await chat.sendMessage({
          message: [{
            functionResponse: {
              name: call.name,
              response: statsResult
            }
          }]
        });
      }
    }

    return NextResponse.json({ 
      reply: response.text
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during processing." }, { status: 500 });
  }
}
