import { NextRequest, NextResponse } from "next/server";
import { ChatMessage } from "@/lib/types";
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from "@google/generative-ai";
// @ts-ignore
import { jStat } from 'jstat';

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
- Clerical Typo Check: First/Last names that are 1 character long.
- Intra-County Duplicates: Same Name + Zip, different street address.
- Commercial Disguises: Residences with 'STE', 'BLDG'.

Phase 4 Audits:
- Registration Spikes: Massive single-day registration surges.
- Phantom Precincts: Active voters with no precinct assigned.
- Out-of-State Mailing Loophole: Active voters with out-of-state mail.

Phase 5 & Organization Workflows:
- Mission Control: A page of pre-configured, 1-click Playbooks for volunteers.
- Pro Mode: The sandbox where users can tune threshold sliders and save Playbooks.
- Exclusion Loop (False Positives): Users can click 'Thumbs Down' on any record to banish it from the global organization's search results forever. This prevents duplicate review work across volunteer teams.

Roosevelt & ACME Demo Environment Guidance & Patterns (When in Demo/Sandbox Mode):
- Purpose & Context: When a user is in 'State of Roosevelt (Demo)' or 'ACME Civic Data Sandbox', they are exploring a synthetic ~1,800-row demo voter roll designed specifically for zero-PII audit testing, onboarding, and volunteer training.
- Jurisdictional Structure: The State of Roosevelt consists of 6 fictional/sample counties: Roosevelt, Jefferson, Franklin, Madison, Lincoln, and Liberty.
- Step-by-Step Onboarding & Platform Walkthrough for New Demo Users:
  1. Command Center ('/dashboard'): Explain how volunteers can click "Auto-Load Roosevelt Demo Dataset" or link a local file. Remind them that shared missions sync across the organization while raw records remain safely inside local browser memory (air-gapped RAM).
  2. Review Voter Records ('/explore'): Walk them through filtering by County (e.g. 'Franklin' or 'Roosevelt') and selecting forensic algorithms like High-Density Occupancy, Commercial Mail Drops, or Intra-County Duplicates. Emphasize that clicking any row in the anomaly table opens the right-hand **MVC Anomaly Controller Drawer**, showing corroborating resident rosters, out-of-state address comparisons, or exact duplicate cross-references.
  3. Mission Playbooks ('/playbooks'): Explain how 1-click Playbooks let anyone execute complex statistical scans without math or coding. Highlight that any user can save their own custom Playbook from the '/explore' page under the "✨ AI Briefing & Playbook" tab!
- Guiding New Volunteers: When asked "How does this platform work?", "Can you walk me through Marigold?", or during first-time onboarding in Demo Mode, enthusiastically give them a clean, friendly 3-step walkthrough tailored directly to their active Roosevelt demo environment!

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

Presidential Address on Election Integrity & Declassified Document Hub (July 16, 2026):
- On July 16, 2026, President Trump delivered a major primetime address releasing 50+ previously classified Intelligence Community Assessments (ICAs), FBI case files, and DHS audits across 4 Core Pillars, explorable at '/election-integrity-presidential-address' and 'https://www.whitehouse.gov/election-integrity/':
  * Pillar 1: Vulnerabilities in Electronic Voting & Ballot-Counting Systems (includes CISA Red Team penetration testing and the declassified CIA Venezuela/Maduro memo detailing methods to alter electronic vote totals undetectably during audits).
  * Pillar 2: China's Acquisition of 220M American Voter Files (reveals PRC military/state hackers acquired over 220M U.S. voter records across 18+ states beginning in 2020, assigning specialized data units to map demographics and stoke racial/social polarization between Black and White Americans to impact voter turnout).
  * Pillar 3: Michigan Voter-Registration Investigation (Muskegon FBI raid case files and witness interviews where canvassers admitted to forging signatures and fabricating registrations to hit gift-card bonus quotas, plus a 4-year prosecution timeline).
  * Pillar 4: Noncitizens on State Voter Rolls (DHS audit identifying over 278,000 unauthorized noncitizen voter registrations across California, Pennsylvania, New Jersey, and Nevada due to lack of SAVE database verification and mandatory proof of citizenship).

PROACTIVE BIAS DISCLOSURE & PERSPECTIVE ALIGNMENT (CRITICAL RULE FOR MARI AI):
- Whenever a user asks about the July 16 Presidential Address, White House declassified files, foreign interference, or election integrity controversies, you MUST proactively disclose your AI baseline and ask the user which analytical perspective they want to adopt:
  * "As an AI powered by Google Gemini, my standard baseline weights tend toward mainstream consensus and official agency reports. However, because election data is interpreted through distinct political and analytical lenses, I want to respect your curiosity and perspective without rejecting any viewpoint. Which lens would you like me to focus on?"
  * Perspective 1 (Conservative / Right-Wing Investigative Lens): Incorporates findings and questions raised by outlets such as War Room with Steve Bannon, Gateway Pundit, Natalie Winters, Real America's Voice, Dark to Light, Blaze, Daily Wire, and Fox News. Focuses on intelligence accountability failures, the severity of the 220M China data theft, physical evidence in Michigan, and the necessity of mandatory Voter ID / Proof of Citizenship (the SAVE Act).
  * Perspective 2 (Progressive / Left-Wing & Civil Rights Lens): Incorporates perspectives from Democracy Now, Young Turks, MSNBC, Brennan Center for Justice, and the ACLU. Focuses on how foreign influence operations exploited existing American racial and social fractures to impact turnout, while cautioning against using these disclosures to disenfranchise eligible voters or restrict ballot access through overly aggressive purges.
  * Perspective 3 (Technical Forensic Auditor Lens): Focuses strictly on mathematical validation, Benford's Law distribution curves, local-RAM air-gapped processing, High-Density Occupancy drop box audits, and NCOA relocation crosschecks without cloud risk.
  * Perspective 4 (Legal / Constitutional Lens): Focuses on federal vs. state jurisdictional boundaries, IC assessment legal admissibility, NVRA Title 8 maintenance rules, and constitutional requirements for voter registration.
- Once the user selects or indicates a lens (or if passed via ANALYTICAL LENS INSTRUCTION from the hub page), argue clearly and respectfully from that perspective using verified primary source quotes from the 4 Pillars!

STARTUP FUNDING & FREE TIER AI BANDWIDTH NOTICE:
- Marigold Insights is an independent startup currently running on early free-tier AI server infrastructure. If users experience rate limits or ask about expanding service capacity, inform them that we are actively seeking **sponsors, grantors, philanthropic partners, and technical advisors** to scale our bandwidth and service area.
- Direct them to contact us via X @rorshockbtc, through the contact form (/contact), or directly via email at cubby@colonhyphenbracket.pink.
`;


const runRobustStatisticsDeclaration: FunctionDeclaration = {
  name: "run_robust_statistics",
  description: "Runs rigorous mathematical statistics (mean, median, standard dev, variance, skewness, kurtosis, quartiles) on a database metric.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      metric: {
        type: SchemaType.STRING,
        description: "The metric to analyze. Can be 'occupancy' (voters per address) or 'registrations' (voters registered per day)."
      },
      county: {
        type: SchemaType.STRING,
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
    type: SchemaType.OBJECT,
    properties: {
      county: {
        type: SchemaType.STRING,
        description: "Optional county name to filter the data. Leave blank for statewide."
      }
    }
  }
};

const chartSchema: any = {
  type: SchemaType.OBJECT,
  description: "Optional visualization.",
  properties: {
    type: { type: SchemaType.STRING, description: "Type of chart: 'bar', 'pie', 'line', or 'scatter'. Choose the best one for the inquiry." },
    xAxisLabel: { type: SchemaType.STRING, description: "Optional label for the X-axis" },
    yAxisLabel: { type: SchemaType.STRING, description: "Optional label for the Y-axis" },
    yScaleMin: { type: SchemaType.NUMBER, description: "Optional minimum value for the Y-axis" },
    yScaleMax: { type: SchemaType.NUMBER, description: "Optional maximum value for the Y-axis" },
    series: {
      type: SchemaType.ARRAY,
      description: "The data series to plot.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "The label for this series (e.g., 'Black Voters')" },
          data: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                x: { type: SchemaType.STRING, description: "The X value" },
                y: { type: SchemaType.NUMBER, description: "The Y value" }
              },
              required: ["x", "y"]
            }
          }
        },
        required: ["id", "data"]
      }
    }
  },
  required: ["type", "series"]
};

const queryDatasetDeclaration: FunctionDeclaration = {
  name: "query_dataset",
  description: "Queries the active external or local dataset to get real mathematical aggregations for your charts. ALWAYS use this instead of hallucinating data.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      metric: { type: SchemaType.STRING, description: "What you are measuring (e.g. 'Party Affiliation', 'Age Group')" },
      group_by: { type: SchemaType.STRING, description: "Optional field to group by (e.g. 'Race', 'Year')" },
      dataset_url: { type: SchemaType.STRING, description: "Optional URL of a public dataset to query instead of the local workspace." }
    },
    required: ["metric"]
  }
};

const triageAndFetchDatasetDeclaration: FunctionDeclaration = {
  name: "triage_and_fetch_dataset",
  description: "Hunts for a public dataset URL online when the user's analytical query cannot be answered by the currently active local dataset. Use this to find external data.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      search_query: { type: SchemaType.STRING, description: "The exact search query to find the data online (e.g., 'CDC BRFSS obesity by state CSV')." },
      found_url: { type: SchemaType.STRING, description: "A realistic public URL to the dataset (e.g., a data.gov or census.gov CSV endpoint)." },
      suggested_name: { type: SchemaType.STRING, description: "A short variable name for this dataset (e.g., 'cdc_obesity_2023')." },
      description: { type: SchemaType.STRING, description: "A conversational explanation of what you found." }
    },
    required: ["search_query", "found_url", "suggested_name", "description"]
  }
};

const appendSectionDeclaration: FunctionDeclaration = {
  name: "append_section",
  description: "Appends a new section to the end of the Data Story. Use this to add new charts or paragraphs without overwriting previous work.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING, description: "A unique string ID for this new section (e.g. 'sec_5')" },
      heading: { type: SchemaType.STRING, description: "Section heading" },
      narrative: { type: SchemaType.STRING, description: "The paragraphs/text for this section." },
      chart: chartSchema
    },
    required: ["id", "heading", "narrative"]
  }
};

const updateSectionDeclaration: FunctionDeclaration = {
  name: "update_section",
  description: "Modifies an existing section in the Data Story.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING, description: "The unique string ID of the section to update" },
      heading: { type: SchemaType.STRING, description: "Updated section heading" },
      narrative: { type: SchemaType.STRING, description: "Updated narrative text" },
      chart: chartSchema
    },
    required: ["id", "heading", "narrative"]
  }
};

const updateTitleDeclaration: FunctionDeclaration = {
  name: "update_title",
  description: "Updates the global title/executive summary of the Data Story.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: "Global title of the entire article." }
    },
    required: ["title"]
  }
};

const suggestMissionPlaybookDeclaration: FunctionDeclaration = {
  name: "suggest_mission_playbook",
  description: "Suggests a structured Mission Playbook template based on what the user wants to investigate, returning structured parameters that can be saved in 1-click.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING, description: "Clear, descriptive name for the mission (e.g. '[MS Mission] Hinds County Dorm Filter')" },
      audit_type: { type: SchemaType.STRING, description: "Algorithm code: 'density', 'missing-dorm', 'po-box', 'typo-names', 'duplicates', 'commercial', 'spikes', 'phantom-precincts', or 'out-of-state-mailing'." },
      threshold: { type: SchemaType.NUMBER, description: "Numerical threshold parameter (e.g. 12 for occupancy, 50 for dorms). Defaults to 0." },
      county: { type: SchemaType.STRING, description: "Target county name (e.g. 'Hinds', 'DeSoto', 'Wake') or leave blank for Statewide." },
      description: { type: SchemaType.STRING, description: "Non-technical helpful explanation of what this query finds and why it matters." }
    },
    required: ["name", "audit_type", "threshold", "description"]
  }
};

export async function POST(req: NextRequest) {
  try {
    const { query, history, userApiKey, isFriendlyMode, pageContext, articleState } = await req.json();

    // LOCAL LOGGING INTERCEPT: Write query to file so the Antigravity agent can read it
    try {
      const logPath = path.join(process.cwd(), '__mari_chat.log');
      const logEntry = {
        timestamp: new Date().toISOString(),
        query,
        route: pageContext?.currentRoute || 'unknown',
        dataset: pageContext?.datasetName || 'none',
        historyLength: history?.length || 0,
      };
      fs.appendFileSync(logPath, `[TELEMETRY] ${JSON.stringify(logEntry)}\n`);
    } catch (e) {
      console.error("Failed to log query", e);
    }

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const activeApiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!activeApiKey) {
      return NextResponse.json({ error: "No Gemini API Key configured. Please add one in Settings." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    
    // Fetch live feedback logs for transparency
    const recentFeedback: { audit_type: string; user_feedback: string; created_at: string }[] = [];
    const feedbackContext = recentFeedback.map((f) => `- Audit: ${f.audit_type}, Feedback: ${f.user_feedback}, Date: ${f.created_at}`).join('\\n');

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
      - Is Demo/Sandbox Workspace: ${pageContext.isDemoMode ? "YES (Roosevelt Demo Mode)" : "NO (Live Mode)"}
      
      HOW TO USE THIS CONTEXT:
      - If Is Demo/Sandbox Workspace is YES, or if the user asks how the platform works / requests a walkthrough, enthusiastically walk them through the platform using the Roosevelt Demo dataset (~1,800 rows across 6 counties: Franklin, Roosevelt, Jefferson, Madison, Lincoln, Liberty). Explain how to filter by county, select Phase 2/3 forensic algorithms, click rows to open the right-hand MVC Anomaly Controller Drawer, and save custom Playbooks!
      - If the user is on '/dashboard', orient them to their Command Center, active shards, and team missions.
      - If the user is on '/explore', give them specific tips on filtering, searching by Name/Address, sorting by Z-Score, and verifying anomalies on the grid.
      - If the user is on '/data-prep', guide them through linking their local CSV/TXT file, streaming shards, and understanding air-gapped RAM safety.
      - If the user is on '/playbooks', explain how 1-click Mission Playbooks (like High-Density Occupancy or NCOA Relocation) work and how to execute them.
      - Always tailor your advice to their exact screen and dataset status!
    ` : "";

    const systemInstruction = `
      You are Mari, the highly-qualified Data Investigator for Marigold Insights (J.A.R.V.I.S for data explorers).
      ${modePrompt}
      ${pageContextPrompt}
      
      CORE DIRECTIVES:
      1. ABSOLUTE OPSEC (The Porcupine Defense): You are a "Blind LLM". You are structurally isolated from the user's raw data. You will receive encrypted metadata, mathematical geometry (e.g., standard deviations, Z-scores), and cryptographic placeholders (e.g., [ENTITY_HASH_123]) from the local engine. You must NEVER invent names or mock data. You must weave your narrative around these placeholders, knowing the user's secure browser will instantly decrypt and hydrate them before rendering.
      2. PERSONA (EMPATHY FIRST): You are deferential, patient, and precise. You respect that "privacy takes time." Many users are elderly or non-technical volunteers. If a user signs their name or shares personal details (like 'Ethel (widow)'), you MUST acknowledge them warmly, validate that they are doing good work, and gently guide them. Never use overwhelming jargon. Make them feel respected and safe.
      3. CONCISENESS: Answer in 2-3 short sentences maximum unless explicitly asked for a deep dive. Do not write long essays.
      4. SUBSTACK ARTICLE BUILDER (CRITICAL): The center pane is a 'Data Story'—an article you are co-authoring with the user. You have delta-editing tools: 'append_section', 'update_section', and 'update_title'. Do NOT try to rewrite the whole article at once. Use 'append_section' to add a new paragraph and chart. Use 'query_dataset' to fetch real aggregations instead of hallucinating chart values.
      5. ZERO HALLUCINATION: You do not simulate. You do not generate mock statistics. If you don't know the answer, tell the user you lack the data and provide actionable next steps to acquire it.
      
      CONVERSATIONAL PATTERN FOR STATS:
      - Always bridge the gap between rigorous math and plain English.
      - If provided with Z-scores, kurtosis, or variance by the local engine, explain what those mathematical shapes imply about the real world in kitchen-table analogies.
      
      SUGGESTING MISSIONS / PLAYBOOKS & EXPLORING DATA:
      - Whenever a user asks how to find something or asks for query suggestions, you MUST call 'suggest_mission_playbook'.
      - IMPORTANT: If a user asks a broad analytical question (e.g., 'What are the demographic trends?'), you must evaluate if the currently linked dataset (shown in REAL-TIME PAGE CONTEXT) can answer it. 
        - If YES, you MUST proactively use the 'query_dataset' tool to fetch the real aggregations, then use 'append_section' to build the Data Story.
        - If NO (the active dataset is irrelevant, or no dataset is connected), you MUST use the 'triage_and_fetch_dataset' tool to hunt for a public data URL.
      - If NO dataset is connected, and the user asks a general knowledge or definition question (e.g., 'What is Benford's Law?' or 'How do people use P.O. boxes?'), answer it directly based on your knowledge. Do NOT attempt to use 'query_dataset', as it will fail without data.
      
      ${articleState ? `CURRENT ARTICLE STATE:\n${JSON.stringify(articleState, null, 2)}` : ''}

      Here is the complete documentation of the platform features:
      ---
      ${DOCS_DATA}
      ---
    `;

    const rawHistory = history.map((msg: ChatMessage) => {
      let text = msg.content;
      if (msg.hiddenContext) {
        text += `\n\n${msg.hiddenContext}`;
      }
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text }]
      };
    });

    // GoogleGenerativeAI requires history to strictly alternate and start with 'user'
    let formattedHistory: {role: string, parts: {text: string}[]}[] = [];
    for (const msg of rawHistory) {
      if (formattedHistory.length === 0) {
        if (msg.role === 'user') formattedHistory.push(msg);
      } else if (formattedHistory[formattedHistory.length - 1].role !== msg.role) {
        formattedHistory.push(msg);
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [runRobustStatisticsDeclaration, runBenfordsLawDeclaration, suggestMissionPlaybookDeclaration, appendSectionDeclaration, updateSectionDeclaration, updateTitleDeclaration, queryDatasetDeclaration, triageAndFetchDatasetDeclaration] }]
    });

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { temperature: 0.7 }
    });

    let result = await chat.sendMessage(query);
    let response = result.response;

    const functionCalls = typeof response.functionCalls === 'function' ? response.functionCalls() : undefined;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (!call) return NextResponse.json({ reply: response.text() || "" });
      
      if (call.name === "run_robust_statistics") {
        const { metric, county } = call.args as { metric: string; county?: string };
        return NextResponse.json({ action: 'run_tool', tool: 'run_robust_statistics', args: { metric, county }, reply: response.text() || undefined });
      } else if (call.name === "run_benfords_law") {
        const { county } = call.args as { county?: string };
        return NextResponse.json({ action: 'run_tool', tool: 'run_benfords_law', args: { county }, reply: response.text() || undefined });
      } else if (call.name === "suggest_mission_playbook") {
        return NextResponse.json({ action: 'suggest_playbook', playbook: call.args, reply: response.text() || "I've drafted a Playbook based on your request. You can save it with 1-click." });
      } else if (call.name === "append_section") {
        return NextResponse.json({ action: 'run_tool', tool: 'append_section', args: call.args, reply: response.text() || undefined });
      } else if (call.name === "update_section") {
        return NextResponse.json({ action: 'run_tool', tool: 'update_section', args: call.args, reply: response.text() || undefined });
      } else if (call.name === "update_title") {
        return NextResponse.json({ action: 'run_tool', tool: 'update_title', args: call.args, reply: response.text() || undefined });
      } else if (call.name === "query_dataset") {
        return NextResponse.json({ action: 'run_tool', tool: 'query_dataset', args: call.args, reply: response.text() || undefined });
      } else if (call.name === "triage_and_fetch_dataset") {
        return NextResponse.json({ action: 'run_tool', tool: 'triage_and_fetch_dataset', args: call.args, reply: response.text() || undefined });
      }
    }

    return NextResponse.json({ 
      reply: response.text()
    });

  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const msg = error instanceof Error ? error.message : "An error occurred during processing.";
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exhausted")) {
      return NextResponse.json({ 
        reply: "I'm so sorry, but our community free-tier compute credits have been completely exhausted for the day! This software is developed at a steep discount to help people, but free compute isn't infinite. If you know of grant funding, partnerships, or ways to help us monetize, please reach out via our [Contact Page](/contact). Otherwise, I'll be fully recharged and ready to help tomorrow!"
      });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
