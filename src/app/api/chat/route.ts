import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
// @ts-ignore
import { jStat } from 'jstat';
import { getDb, getFeedbackLogs, analyzeBenfordsLaw } from '@/lib/db/sqlite';

const DOCS_DATA = `
Multi-File State Releases (Weekly Delta vs. Historical Master Rolls):
- Many jurisdictions (such as Mississippi) distribute voter records across two distinct files:
  1. Historical Master Baseline File: Contains the primary registration database of active and inactive voters (~1.5 to 2 million records).
  2. Weekly Delta Release File: Contains recent 7-day incremental transactions, address updates, new registrations, and NCOA relocations (~5,000 to 50,000 records).
- How Marigold Handles Them: When both files are staged in our Multi-File Ingestion Console, Marigold combines them inside local browser memory, using the weekly delta records to update or append to baseline historical records.

Local Desktop File Authorization & Legal Compliance (Terms & Privacy):
- Zero-Exfiltration Client-Side RAM Architecture: When a volunteer connects a local voter roll file (.csv, .txt), no data is EVER uploaded to Marigold servers or any external cloud database.
- Authorization & Permissions: You do NOT need to grant Marigold system-wide disk access or install software agents. The web browser uses standard HTML5 File sandbox permissions to read only the exact files you manually drag or select.
- Legal Compliance: Because the records remain strictly isolated inside temporary browser RAM on your local machine, your analysis complies 100% with State Secretary of State non-dissemination agreements and Marigold Terms & Conditions.

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

Phase 5 & Organization Workflows:
- Mission Control: A page of pre-configured, 1-click Playbooks for volunteers.
- Pro Mode: The sandbox where users can tune threshold sliders and save Playbooks.
- Exclusion Loop (False Positives): Users can click 'Thumbs Down' on any record to banish it from the global organization's search results forever. This prevents duplicate review work across volunteer teams.

Mississippi Fair Elections (MSFE) Specific Guidance & Patterns:
- Jurisdictional Focus: MSFE prioritizes Hinds, DeSoto, Madison, and Rankin counties due to high registration velocity and student/institution density.
- Apartment Complex & Dorm Scans: In college towns (e.g., Oxford, Starkville, Hattiesburg) or urban centers (Jackson), volunteers should look for missing apartment numbers (APT/STE) where 50+ voters share a single street address.
- Interstate Relocation (NCOA): Flag active voters who filed National Change of Address forms moving out-of-state but remain on active voting rolls over 180 days later.

Executive Visual Analytics & Chart Interpretation:
- Benford's Law Distribution Curves: Explains whether street address numbers follow natural probability distributions (30% leading 1s). If the actual curve deviates sharply from the expected red line, it indicates human data tampering or synthetic generation.
- NCOA Relocation Flow: Shows net migration across county lines and out-of-state departures.
- Z-Score Anomaly Scatter: Plots occupancy against registration date to visually isolate extreme outliers (Z > 3.0) in the upper right quadrant.

Troubleshooting Local File Linking & Air-Gapped RAM:
- Why Files Are Processed Locally: Marigold uses an air-gapped browser architecture. Large CSVs (2M+ rows) are chunked via Web Workers into local IndexedDB/RAM. No data ever leaves the user's computer.
- Memory Limits / Browser Freezes: If a volunteer experiences sluggishness during ingestion, recommend closing background browser tabs or switching to 'Stream / Chunked Mode' on the Data Settings page.
- Schema Mapping: If columns don't match standard names (e.g. 'VoterID', 'ResStreet'), our Smart Mapping engine detects headers automatically with 85%+ fuzzy similarity.

MVC Anomaly Controller Drawer & Output Interpretation Guide:
- When a user clicks ANY record or address cluster in the Analysis grid, the persistent MVC Anomaly Controller drawer opens on the right. Explain what corroborating evidence they will find for each engine:
- High-Density Occupancy ('density'), Missing Dorms ('missing-dorm'), Commercial Mail Drops ('po-box'): The drawer renders a 'Resident Cluster Roster' listing every registered voter domiciled at that street address (up to 50 residents) with their Voter IDs and registration dates. Instruct users to check this roster to see who is actually living there!
- Intra-County Duplicates ('duplicates'): The drawer renders a 'Matching Duplicate Registrations' cross-reference card listing all addresses registered under that identical Name & Zip code, with 1-click copy buttons for County Clerk verification.
- Out-of-State Mailing Loophole ('out-of-state-mailing'): The drawer renders a 'Side-by-Side Comparison' comparing their Mississippi residence against their out-of-state mailing address.
- Registration Spikes ('spikes'): The drawer renders a 'Resident Cluster Roster' showing the sample cohort of individuals registered on that surge date across the jurisdiction.

User Orientation & Lost User Guidance:
- If a user feels overwhelmed or lost, gently orient them using their real-time pageContext:
- Step 1: Check the top-right dataset indicator to confirm if their voter roll file is linked into browser RAM.
- Step 2: Remind them that Marigold is designed around 1-click exploration—they can click any card on the Dashboard or Playbooks page to run an audit without knowing formulas.
- Step 3: Encourage them to click any row in an analysis table to open the MVC Anomaly Controller drawer and inspect the corroborating resident rosters or address comparisons.

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

const suggestMissionPlaybookDeclaration: FunctionDeclaration = {
  name: "suggest_mission_playbook",
  description: "Suggests a structured Mission Playbook template based on what the user wants to investigate, returning structured parameters that can be saved in 1-click.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Clear, descriptive name for the mission (e.g. '[MS Mission] Hinds County Dorm Filter')" },
      audit_type: { type: Type.STRING, description: "Algorithm code: 'density', 'missing-dorm', 'po-box', 'typo-names', 'duplicates', 'commercial', 'spikes', 'phantom-precincts', or 'out-of-state-mailing'." },
      threshold: { type: Type.NUMBER, description: "Numerical threshold parameter (e.g. 12 for occupancy, 50 for dorms). Defaults to 0." },
      county: { type: Type.STRING, description: "Target county name (e.g. 'Hinds', 'DeSoto', 'Wake') or leave blank for Statewide." },
      description: { type: Type.STRING, description: "Non-technical helpful explanation of what this query finds and why it matters." }
    },
    required: ["name", "audit_type", "threshold", "description"]
  }
};

export async function POST(req: NextRequest) {
  try {
    const { query, history, userApiKey, isFriendlyMode, pageContext } = await req.json();

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

    const modePrompt = isFriendlyMode !== false ? `
      CRITICAL INSTRUCTION FOR FRIENDLY GUIDE MODE (ACTIVE):
      The user has toggled 'Friendly Guide Mode' ON. You MUST explain all data, statistics, and findings strictly in everyday kitchen-table analogies without quoting complex math terms like kurtosis, skewness, or raw vectors. Keep it warm, simple, conversational, and empowering! Never overwhelm them with technical jargon.
    ` : `
      CRITICAL INSTRUCTION FOR ANALYST PRO MODE (ACTIVE):
      The user wants rigorous statistical reporting. Provide exact standard deviations, Z-scores, kurtosis, and data vectors alongside concise explanations.
    `;

    const pageContextPrompt = pageContext ? `
      REAL-TIME PAGE CONTEXT & WORKSPACE AWARENESS (ACTIVE):
      - Current Screen / Route: ${pageContext.currentRoute}
      - Organization / Jurisdiction: ${pageContext.activeGroup}
      - Dataset Linked: ${pageContext.isDataConnected ? `Yes (${pageContext.datasetName}, ${Number(pageContext.datasetRowCount || 0).toLocaleString()} rows loaded in browser RAM)` : "No (Offline / Not Connected)"}
      
      HOW TO USE THIS CONTEXT:
      - If the user is on '/dashboard', orient them to their Command Center, active shards, and team missions.
      - If the user is on '/analysis', give them specific tips on filtering, searching by Name/Address, sorting by Z-Score, and verifying anomalies on the grid.
      - If the user is on '/data-prep', guide them through linking their local CSV/TXT file, streaming shards, and understanding air-gapped RAM safety.
      - If the user is on '/playbooks', explain how 1-click Mission Playbooks (like High-Density Occupancy or NCOA Relocation) work and how to execute them.
      - Always tailor your advice to their exact screen and dataset status!
    ` : "";

    const systemInstruction = `
      You are the "Marigold Guide", an incredibly patient and statistically rigorous software tutor.
      ${modePrompt}
      ${pageContextPrompt}
      
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
      - Instead, cheerfully inform the user that Marigold Insights has not received any data yet! 
      - Instruct them to go to the "Advanced Stats" or "Data Linkage" page and drag-and-drop their November Voter Roll CSV into the system to initialize the database.

      TRANSPARENCY & ACCURACY PREDICTION:
      - We have a live feedback loop where volunteers rate audits as 'met', 'failed', or 'exceeded'.
      - If a user asks why an audit has a specific Predicted Accuracy score, use the recent feedback log below to transparently explain how past users have rated it.
      
      Recent User Feedback Log:
      ${feedbackContext || 'No feedback logged yet.'}

      SUGGESTING MISSIONS / PLAYBOOKS:
      - Whenever a user asks how to find something, wants to explore a subject, or asks for query suggestions (e.g., 'How do I check for college dorms in Hinds?', 'Can we create a mission for out-of-state voters?'), you MUST call 'suggest_mission_playbook'.
      - Help them structure the query by suggesting a clean name, the correct statistical audit_type, an appropriate threshold, and a clear description.

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
        tools: [{ functionDeclarations: [runRobustStatisticsDeclaration, runBenfordsLawDeclaration, suggestMissionPlaybookDeclaration] }],
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
      } else if (call.name === "suggest_mission_playbook") {
        const { name, audit_type, threshold, county, description } = call.args as any;
        const suggestion = { name, audit_type, threshold: threshold || 0, county: county || '', description };
        
        response = await chat.sendMessage({
          message: [{
            functionResponse: {
              name: call.name,
              response: { success: true, message: "Suggested playbook created. Tell the user they can click the Save button below." }
            }
          }]
        });

        return NextResponse.json({
          reply: response.text,
          suggestedPlaybook: suggestion
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
