"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Database, 
  Users, 
  Globe, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Mail,
  Filter,
  Bookmark,
  Zap
} from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { DECLASSIFIED_DOCUMENT_INDEX, DeclassifiedDocumentExcerpt } from "@/lib/data/declassifiedIndex";

export default function ElectionIntegrityHub() {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeLens, setActiveLens] = useState<string>("conservative");
  const [mariQuery, setMariQuery] = useState<string>("");
  const [mariResponse, setMariResponse] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("ballots");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>("ballots");

  const pillars = [
    {
      id: 0,
      badge: "§ Pillar 01",
      title: "Vulnerabilities in Electronic Voting & Ballot-Counting Systems",
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      summary: "Declassified Intelligence Community Assessments (ICAs) and CISA technical reports revealing longstanding vulnerabilities across electronic tabulation systems and centralized election repositories.",
      details: "Documents spanning January 2020 through June 2026 prove that intelligence agencies judged centralized voter databases, pollbooks, and official reporting websites to be prime targets for foreign exploitation. Crucially, the disclosures include CIA intelligence memos on methods developed by foreign regimes (such as Maduro in Venezuela) to digitally manipulate vote totals without triggering standard audit alarms.",
      downloadZip: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Vulnerabilities-in-Electronic-Voting-and-Ballot-Counting-Systems.zip",
      keyDocs: [
        { name: "CISA Technical Evaluation Report (2019–2024)", desc: "Comprehensive penetration testing and direct software inspection of state and local election networks." },
        { name: "CIA Venezuela / Maduro Election Rigging Memo (DECLASS 29 JUNE 2026)", desc: "Precise reporting on digital methods developed to alter electronic vote totals undetectably during post-election audits." },
        { name: "National Intelligence Council Assessment (NICA 2020-06885D)", desc: "Formal IC assessment detailing foreign adversary capabilities targeting U.S. election infrastructure." }
      ]
    },
    {
      id: 1,
      badge: "§ Pillar 02",
      title: "China's Acquisition & Exploitation of American Voter Data",
      icon: <Database className="w-5 h-5 text-amber-400" />,
      summary: "Declassified records revealing the People's Republic of China (PRC) illicitly acquired over 220 million American voter files across at least 18 states beginning in 2020.",
      details: "This unprecedented compromise of sensitive American voter profiles included names, physical addresses, phone numbers, and political party affiliations. Intelligence reporting reveals China assigned a specialized military/state data exploitation unit specifically to map and target U.S. demographics. Furthermore, records highlight how foreign operations actively stoked racial and social polarization between Black and White Americans—influencing demographic voter turnout patterns.",
      downloadZip: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Chinas-Acquisition-and-Exploitation-of-American-Voter-Data.zip",
      keyDocs: [
        { name: "200M Voter Records Compromised Memorandum (Redacted)", desc: "Intelligence evaluation of China's acquisition and data broker exploitation across 18 target states." },
        { name: "PRC Analysis on US Voter Registration & Racial Polarization (2018–2023)", desc: "Detailed breakdown of foreign influence operations targeting social fractures and turnout dynamics." },
        { name: "NSA & DNI Internal Coordination Memos (Nov 2020)", desc: "Internal communications showing how early warnings of foreign data compromise were handled across reporting channels." }
      ]
    },
    {
      id: 2,
      badge: "§ Pillar 03",
      title: "Michigan Voter-Registration Investigation",
      icon: <Users className="w-5 h-5 text-blue-400" />,
      summary: "Official FBI Detroit Case Files and Michigan State Police (MSP) referral records detailing large-scale, quota-driven voter registration fabrication.",
      details: "Records stemming from the 2020 raid on a get-out-the-vote organization in Muskegon, Michigan, document canvassers admitting to FBI agents that they signed registration forms in other people's names, submitted fraudulent registrations for non-existent individuals, and were compensated through quota-tied gift cards. The documents expose a four-year investigative timeline illustrating severe delays in prosecuting registration fraud.",
      downloadZip: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Michigan-Voter-Registration-Investigation.zip",
      keyDocs: [
        { name: "Original Muskegon MSP Referral & Raid Summary", desc: "Initial law enforcement findings and physical evidence recovered during the 2020 get-out-the-vote office raid." },
        { name: "FBI Detroit Canvasser Witness Interview Memos", desc: "Direct interview transcripts where canvassers confessed to forging signatures and fabricating registrations for gift card bonuses." },
        { name: "Four-Year Federal Case Timeline & Delay Analysis", desc: "Detailed chronological tracking of how evidence was processed across local, state, and federal DOJ channels." }
      ]
    },
    {
      id: 3,
      badge: "§ Pillar 04",
      title: "Noncitizens on State Voter Rolls",
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      summary: "Department of Homeland Security (DHS) review identifying over 278,000 noncitizens illegally registered to vote across four reviewed states.",
      details: "Following an evaluation of statewide voter rolls and public records across states utilizing (or failing to utilize) the federal SAVE verification database, DHS investigators uncovered approximately 278,000 noncitizens on federal voter rolls in just four states (California, Pennsylvania, New Jersey, and Nevada). The findings highlight nationwide vulnerabilities stemming from the lack of mandatory proof of citizenship during initial registration.",
      downloadZip: "https://www.whitehouse.gov/wp-content/uploads/2026/07/Noncitizens-on-State-Voter-Rolls.zip",
      keyDocs: [
        { name: "Alien Voter Registration Summary Report (DHS Declassified)", desc: "Executive findings detailing over 250k unauthorized registrations identified across public state voter extracts." },
        { name: "Statewide Voter Registration Database Threats Report (July 2026)", desc: "Technical evaluation of how lack of SAVE verification and unverified mail-in registration creates systematic roll exposure." }
      ]
    }
  ];

  // High-interest conservative & analytical topic pills for instant crawling
  const crawlerTopicPills = [
    { label: "ballots", query: "ballots", icon: "🗳️" },
    { label: "ballot paper", query: "ballot paper", icon: "📄" },
    { label: "voting machines", query: "voting machines", icon: "💻" },
    { label: "China (220M files)", query: "China", icon: "🇨🇳" },
    { label: "Venezuela (Maduro memo)", query: "Venezuela", icon: "🛡️" },
    { label: "More votes than residents", query: "More votes than residents", icon: "🚨" },
    { label: "gift card quotas (Muskegon)", query: "gift card quotas", icon: "💳" },
    { label: "278,000 noncitizens (SAVE)", query: "278,000 noncitizens", icon: "🌐" },
    { label: "canvasser confession", query: "canvasser confession", icon: "⚖️" }
  ];

  // Instant Document Crawler Search Filter
  const filteredExcerpts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return DECLASSIFIED_DOCUMENT_INDEX;
    return DECLASSIFIED_DOCUMENT_INDEX.filter(item => 
      item.excerptText.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q)) ||
      item.analyticalNote.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Helper to highlight matching terms in text
  const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400 text-slate-950 font-black px-1 rounded shadow-sm">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const quickTopics = [
    {
      label: "🇨🇳 China's 220M Voter Data & Racial Polarization Operations",
      pillarId: 1,
      prompt: "Explain what the declassified documents say about China acquiring 220 million U.S. voter records and how foreign influence operations stoked racial tensions between Black and White Americans to impact turnout."
    },
    {
      label: "🚨 Michigan / Muskegon Canvasser Confessions & Quotas",
      pillarId: 2,
      prompt: "Summarize the FBI witness interview memos from the Muskegon, Michigan voter registration investigation. How did canvassers fabricate registrations using gift card quotas?"
    },
    {
      label: "🌐 278,000 Noncitizens & SAVE Database Verification Gaps",
      pillarId: 3,
      prompt: "Break down the DHS findings on over 278,000 noncitizens registered to vote across California, Pennsylvania, New Jersey, and Nevada. Why did lack of SAVE verification cause this?"
    },
    {
      label: "🛡️ Venezuela / Maduro 2020 Electronic Tabulation Memo",
      pillarId: 0,
      prompt: "What does the declassified CIA intelligence memo reveal regarding how the Maduro regime in Venezuela manipulated electronic vote totals without triggering audit alarms?"
    }
  ];

  const handleTopicClick = (topic: any) => {
    setActivePillar(topic.pillarId);
    setSelectedTopic(topic.label);
    setMariQuery(topic.prompt);
    triggerMariAnalysis(topic.prompt, activeLens);
  };

  const handleExcerptAskMari = (excerpt: DeclassifiedDocumentExcerpt) => {
    const prompt = `Analyze this exact declassified primary source excerpt from document [${excerpt.docCode}] ("${excerpt.title}", ${excerpt.pageRef}):\n\n"${excerpt.excerptText}"\n\nExplain why this finding is significant through our selected worldview lens and how local-RAM citizen verification solves this exact vulnerability.`;
    setMariQuery(prompt);
    triggerMariAnalysis(prompt, activeLens);
    // Scroll smoothly to Mari chat window
    const chatEl = document.getElementById("mari-chat-section");
    if (chatEl) chatEl.scrollIntoView({ behavior: "smooth" });
  };

  const triggerMariAnalysis = async (queryText: string, lens: string) => {
    setIsQuerying(true);
    setMariResponse(null);

    const lensInstructions: Record<string, string> = {
      conservative: "Adopt a Conservative / Right-Wing investigative analytical lens (incorporating perspectives from War Room with Steve Bannon, Gateway Pundit, Natalie Winters, Real America's Voice, Dark to Light, Blaze, Daily Wire, and Fox News). Focus heavily on the accountability failures of intelligence agencies, the severity of the 220M China data theft, the physical evidence in the Michigan FBI investigation, and why these disclosures demand mandatory Voter ID and Proof of Citizenship (the SAVE Act).",
      progressive: "Adopt a Progressive / Left-Wing and Civil Rights analytical lens (incorporating perspectives from Democracy Now, Young Turks, MSNBC, Brennan Center for Justice, and the ACLU). Examine the data with a focus on how foreign actors (like China) exploited existing American social and racial inequalities to manipulate turnout, while cautioning against using these disclosures to disenfranchise eligible voters or restrict ballot access through overly burdensome purges.",
      technical: "Adopt a strict Technical Forensic and Non-Partisan Auditor lens. Focus exclusively on how these disclosures validate air-gapped local browser memory architecture, how Benford's Law distribution curves catch human-generated registration numbers (Michigan), how High-Density Occupancy checks isolate synthetic drop boxes, and how NCOA crosschecks verify residency without cloud honeypots.",
      legal: "Adopt a Legal and Constitutional lens. Examine the evidentiary standards of the declassified ICAs and FBI memos, analyze jurisdictional boundaries between federal election oversight and state Secretary of State mandates under the NVRA, and evaluate the statutory framework surrounding the SAVE Act."
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            ${queryText}
            
            ANALYTICAL LENS INSTRUCTION:
            ${lensInstructions[lens] || lensInstructions.technical}
            
            Remember to be direct, highly structured, respectful of the user's intelligence and chosen worldview, and provide verifiable references to the 4 Pillars of the July 16, 2026 Presidential Address.
          `,
          history: [],
          pageContext: {
            currentRoute: "/election-integrity-presidential-address",
            activeGroup: "Presidential Address Exploration Hub",
            isDemoMode: false
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMariResponse(data.reply);
      } else {
        setMariResponse("Mari AI encountered high bandwidth demand across our early infrastructure tier. Please select a different analytical lens or try your query again momentarily.");
      }
    } catch (e) {
      setMariResponse("Unable to connect to Mari AI service. Please ensure your local network or Gemini API key is active.");
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Proactive Bias & Startup Funding Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-3 text-xs sm:text-sm shadow-xl sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
            <div>
              <strong className="font-extrabold text-amber-300">Proactive AI Bias Disclosure &amp; Funding Notice:</strong>{" "}
              <span className="text-slate-200">
                AI baseline models generally reflect mainstream consensus weights. To respect your individual worldview, Marigold allows you to explicitly choose your analytical lens below (Conservative, Progressive, Technical, or Legal).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-xs font-bold">
            <Link 
              href="/contact" 
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/40 transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Sponsor / Partner With Us</span>
            </Link>
            <a 
              href="https://x.com/rorshockbtc" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-white transition-colors underline decoration-dotted"
            >
              @rorshockbtc
            </a>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative overflow-hidden pt-12 pb-10 px-4 sm:px-8 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-6xl mx-auto space-y-5 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Declassified Document Hub · July 16, 2026</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 font-bold text-xs">
              4 Primary Pillars · 50+ Declassified ICAs &amp; FBI Records
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Presidential Address on Election Integrity: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              Declassified Intelligence Explorer
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-4xl font-medium leading-relaxed">
            Following President Trump’s primetime address on July 16, 2026, the White House released dozens of previously classified U.S. Intelligence Community Assessments, FBI case timelines, and DHS security reviews. Explore the original primary documents below, crawl text excerpts by topic, select your preferred analytical perspective, and query Mari AI to understand exactly how these findings impact civic data security across America.
          </p>

          {/* Quick External Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://www.whitehouse.gov/election-integrity/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>🏛️ Official White House Release Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              href="/analysis"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <span>🔍 Test Local-RAM Forensic Engines</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        
        {/* Step 1: Analytical Perspective Lens Selector (Proactive Bias Alignment) */}
        <div className="bg-slate-900/90 border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Step 1: Choose Your Worldview &amp; Analytical Lens</span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>How Would You Like Mari AI to Interpret These Findings?</span>
              </h2>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-center font-bold">
              💡 Proactive Bias Disclosure Active
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            Because AI language models are often trained on mainstream institutional summaries that may dismiss or oversimplify divergent viewpoints, we ask you to choose the exact analytical lens you want Mari to adopt when synthesizing these declassified documents:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                id: "conservative",
                title: "Conservative / Investigative Lens",
                sub: "War Room, Gateway Pundit, Natalie Winters, Real America's Voice, Blaze, Daily Wire",
                desc: "Focuses on IC accountability failures, the severity of China's 220M voter data theft, Michigan FBI physical evidence, and the necessity of the SAVE Act."
              },
              {
                id: "progressive",
                title: "Progressive / Civil Rights Lens",
                sub: "Democracy Now, Young Turks, MSNBC, Brennan Center, ACLU",
                desc: "Focuses on how foreign operations exploited American racial & social tensions to impact turnout, while protecting eligible voter ballot access against sweeps."
              },
              {
                id: "technical",
                title: "Technical Forensic Auditor Lens",
                sub: "Marigold Zero-Cloud RAM Engine, CISA Standards, Statistical Verification",
                desc: "Focuses strictly on math: Benford's Law distribution curves, High-Density Occupancy clusters, NCOA relocation flows, and air-gapped local verification."
              },
              {
                id: "legal",
                title: "Legal & Constitutional Lens",
                sub: "Statutory Frameworks, NVRA Title 8, Evidentiary Standards",
                desc: "Focuses on federal vs. state jurisdictional boundaries, IC assessment legal admissibility, and constitutional requirements for voter roll maintenance."
              }
            ].map((lens) => (
              <button
                key={lens.id}
                onClick={() => {
                  setActiveLens(lens.id);
                  if (mariQuery) triggerMariAnalysis(mariQuery, lens.id);
                }}
                className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  activeLens === lens.id
                    ? "bg-amber-500/15 border-amber-500 shadow-md text-white scale-[1.02]"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className={`font-black text-sm ${activeLens === lens.id ? "text-amber-300" : "text-slate-200"}`}>
                      {lens.title}
                    </span>
                    {activeLens === lens.id && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 block font-mono">{lens.sub}</span>
                </div>
                <p className="text-xs leading-normal opacity-90">{lens.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Instant Declassified Document Crawler & Topic Indexer */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">Step 2: Full-Text Document Crawler</span>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <Search className="w-6 h-6 text-amber-400" />
                <span>Search &amp; Highlight Across Primary Declassified Files</span>
              </h2>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg font-bold">
              ⚡ Instant RAM Index ({filteredExcerpts.length} Excerpts Found)
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTagFilter(null);
              }}
              placeholder="Type any topic (e.g. ballots, ballot paper, voting machines, China, Venezuela, More votes than residents)..."
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-white focus:border-amber-500 focus:outline-none placeholder:text-slate-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* High-Interest Topic Pills */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              🔥 High-Interest Topics &amp; Conservative Auditor Priorities (Click to Crawl):
            </span>
            <div className="flex flex-wrap gap-2">
              {crawlerTopicPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(pill.query);
                    setActiveTagFilter(pill.label);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                    searchQuery.toLowerCase() === pill.query.toLowerCase() || activeTagFilter === pill.label
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Crawled Excerpt Cards Grid */}
          <div className="space-y-4 pt-2">
            {filteredExcerpts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-2xl block">🔍</span>
                <p className="text-sm font-bold text-slate-300">No matching text excerpts found for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-xs text-slate-500">Try clicking one of the suggested topic pills above or search for broader terms like &ldquo;ballots&rdquo; or &ldquo;Muskegon&rdquo;.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredExcerpts.map((item) => (
                  <div key={item.id} className="bg-slate-950 border-2 border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-900 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {item.pillarBadge}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Code: {item.docCode} • Declassified: {item.dateDeclassified}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>{item.title}</span>
                        </h4>
                      </div>
                      <span className="text-xs font-mono bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800 whitespace-nowrap font-bold">
                        Location: {item.pageRef}
                      </span>
                    </div>

                    {/* Highlighted Excerpt Box */}
                    <div className="bg-slate-900/90 p-4 rounded-xl border-l-4 border-amber-500 text-sm leading-relaxed text-slate-200 font-medium">
                      <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Verbatim Declassified Excerpt ({item.pageRef}):</span>
                      </div>
                      <p className="italic font-serif text-slate-100 leading-relaxed">
                        &ldquo;{highlightText(item.excerptText, searchQuery)}&rdquo;
                      </p>
                    </div>

                    {/* Analytical Impact & Action Footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-xs">
                      <div className="space-y-1 max-w-2xl">
                        <strong className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Why This Matters &amp; Local Verification Solution:</span>
                        </strong>
                        <p className="text-slate-400 leading-normal font-medium">{item.analyticalNote}</p>
                      </div>

                      <div className="flex items-center gap-2.5 self-stretch sm:self-center justify-end">
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download ZIP</span>
                        </a>
                        <button
                          onClick={() => handleExcerptAskMari(item)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-lg text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask Mari About This Excerpt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Interactive Mari AI Exploration Box */}
        <div id="mari-chat-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow">
                💬
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Mari AI: Declassified Document Assistant</h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Synthesizing directly from the July 16, 2026 release through your selected <span className="text-amber-400 font-bold uppercase">{activeLens}</span> lens.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <input
              type="text"
              value={mariQuery}
              onChange={(e) => setMariQuery(e.target.value)}
              placeholder="Ask Mari anything about the 4 Pillars, China's 220M data theft, Michigan investigations, or local verification..."
              className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-white focus:border-amber-500 focus:outline-none placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && mariQuery.trim()) triggerMariAnalysis(mariQuery, activeLens);
              }}
            />
            <button
              onClick={() => {
                if (mariQuery.trim()) triggerMariAnalysis(mariQuery, activeLens);
              }}
              disabled={isQuerying || !mariQuery.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow transition-all flex items-center gap-2"
            >
              {isQuerying ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Synthesize</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Deep-Dive Buttons inside Chat */}
          <div className="flex flex-wrap gap-2 pt-1">
            {quickTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleTopicClick(topic)}
                className="text-left text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <span>{topic.label}</span>
              </button>
            ))}
          </div>

          {/* Mari Output Box */}
          {mariResponse && (
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Mari AI Synthesis ({activeLens.toUpperCase()} LENS)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Verified Primary Source Context</span>
              </div>
              <div className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap space-y-3">
                {mariResponse}
              </div>
            </div>
          )}
        </div>

        {/* Step 4: The 4 Primary Pillars & Document Download Ledger */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">Step 4: Primary Document Ledger</span>
              <h3 className="text-2xl font-black text-white">Explore &amp; Download the 4 Primary Pillars</h3>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-center overflow-x-auto max-w-full">
              {pillars.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePillar(p.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                    activePillar === p.id ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {p.badge}: {p.title.split(" ")[0]}...
                </button>
              ))}
            </div>
          </div>

          {/* Active Pillar Card */}
          {(() => {
            const p = pillars[activePillar];
            return (
              <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mt-0.5">
                      {p.icon}
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">{p.badge}</span>
                      <h4 className="text-xl sm:text-2xl font-bold text-white mt-1">{p.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">{p.summary}</p>
                    </div>
                  </div>

                  <a
                    href={p.downloadZip}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 whitespace-nowrap self-stretch sm:self-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Pillar ZIP Archive</span>
                  </a>
                </div>

                {/* Full Details & Context */}
                <div className="space-y-3 bg-slate-950/80 p-5 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300 font-medium">
                  <strong className="text-white font-bold block text-xs uppercase tracking-wider text-amber-400">Intelligence Summary &amp; Strategic Context</strong>
                  <p>{p.details}</p>
                </div>

                {/* Key Documents in this Pillar */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Key Declassified Files Included in this Pillar</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {p.keyDocs.map((doc, dIdx) => (
                      <div key={dIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">{doc.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">{doc.desc}</p>
                        </div>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                          <span>Status: Declassified</span>
                          <span className="text-amber-400/80">PDF / Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection to Marigold Verification */}
                <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>How Marigold Solves This Vulnerability</span>
                    </strong>
                    <p className="text-slate-300 leading-normal font-medium">
                      Instead of building a centralized database that foreign actors can hack or scrape, Marigold processes voter rolls 100% locally inside client browser RAM—giving citizen auditors courtroom-ready verification without cloud risk.
                    </p>
                  </div>
                  <Link
                    href="/analysis"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2.5 rounded-lg shadow whitespace-nowrap transition-colors"
                  >
                    Launch Local Audit &rarr;
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Prominent Startup & Free Tier Notice Footer */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 text-slate-200 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <span className="px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 font-black text-[11px] uppercase tracking-wider border border-amber-500/30">
                🚀 Startup Infrastructure Notice &amp; Sponsor Callout
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-white">
                Help Us Scale Marigold Insights &amp; Expand AI Bandwidth
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Mari AI is currently running on early free-tier server infrastructure. As thousands of citizens and county clerks begin exploring these declassified election integrity documents, we are actively seeking <strong className="text-white">sponsors, grantors, philanthropic partners, and technical advisors</strong> to increase our server capacity, AI quota limits, and nationwide service area.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 self-stretch sm:self-center flex-shrink-0">
              <Link
                href="/contact"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Our Team</span>
              </Link>
              <a
                href="https://x.com/rorshockbtc"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>X @rorshockbtc ↗</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <div>
              Direct Inquiry Email: <a href="mailto:cubby@colonhyphenbracket.pink" className="text-amber-400 hover:underline">cubby@colonhyphenbracket.pink</a>
            </div>
            <div>
              Built by Colon Hyphen Bracket LLC · 100% Client-Side Local Verification
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
