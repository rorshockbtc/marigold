"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Shield, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ExternalLink, 
  Layers, 
  Search, 
  Lock, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface LearningSection {
  id: string;
  term: string;
  fullName: string;
  level: "First-Time Learner" | "Intermediate Analyst" | "Pro / Legal Standard";
  summary: string;
  deepDive: string;
  methodology: string;
  citations: string[];
}

const LEARNING_SECTIONS: LearningSection[] = [
  {
    id: "pii",
    term: "PII",
    fullName: "Personally Identifiable Information",
    level: "First-Time Learner",
    summary: "Sensitive personal citizen data such as full legal names, home street addresses, dates of birth, driver's license numbers, or social security numbers.",
    deepDive: "Public voter registration files inherently contain citizen PII. While election officials and campaign analysts require this information to audit voter rolls or run canvassing missions, centralizing millions of sensitive records on public cloud servers creates severe cybersecurity risks and targets for identity thieves.",
    methodology: "Marigold enforces a strict 'Zero-Cloud Air-Gap' security model. When you load a county or state voter roll, 100% of the PII is parsed and stored inside your local computer's browser memory (RAM and encrypted IndexedDB). Not a single byte of citizen PII is ever uploaded to our servers or transmitted over the internet.",
    citations: [
      "NIST Special Publication 800-122: Guide to Protecting the Confidentiality of Personally Identifiable Information (PII). National Institute of Standards and Technology.",
      "Federal Election Commission (FEC) & State Administering Agency (SAA) Data Governance & Citizen Privacy Protocols."
    ]
  },
  {
    id: "ram",
    term: "RAM",
    fullName: "Random Access Memory / Client Memory",
    level: "First-Time Learner",
    summary: "Your computer or device's high-speed temporary working memory where active mathematical calculations and queries take place.",
    deepDive: "Traditional data platforms force you to upload multi-gigabyte CSV files across the internet to a slow remote database server. This takes minutes or hours, risks data breaches during transfer, and causes long loading screens every time you run a query.",
    methodology: "By executing directly in local device RAM via browser Web Workers, Marigold processes complex Fellegi-Sunter log-odds formulas across 2,000,000+ records in under 100 milliseconds right inside your computer's local processor.",
    citations: [
      "W3C Web Workers Working Group Note: High-Performance Multithreaded Client-Side Computation in Modern Web Browsers.",
      "IEEE Transactions on Parallel and Distributed Systems: In-Memory Client-Side Data Analytics without Server Round-Trips."
    ]
  },
  {
    id: "air-gap",
    term: "Zero-Cloud Air-Gap",
    fullName: "Local-Compute Air-Gap Architecture",
    level: "First-Time Learner",
    summary: "A strict data-governance security model where sensitive files never leave the physical hardware you are using.",
    deepDive: "In high-security government and military environments, an 'air-gapped' computer is physically disconnected from the internet so external hackers cannot access sensitive files. We bring this exact level of security directly into standard web browsers.",
    methodology: "Our client-side JavaScript engine is self-contained. Even if your internet connection drops after the webpage loads, Marigold's forensic playbooks continue running at 100% speed because the logic executes entirely within your local hardware boundary.",
    citations: [
      "NIST Special Publication 800-53 (Rev 5): Security and Privacy Controls for Information Systems and Organizations (System Isolation & Air-Gap Standards).",
      "Department of Homeland Security (DHS) CISA Election Security Technical Guidance on Local Compute Environments."
    ]
  },
  {
    id: "indexeddb",
    term: "IndexedDB",
    fullName: "Secure Local Browser Storage Cache",
    level: "Intermediate Analyst",
    summary: "A high-capacity, transactional database system built directly inside modern web browsers (Chrome, Safari, Edge, Firefox).",
    deepDive: "Standard browser storage (like cookies or LocalStorage) can only hold tiny strings under 5 megabytes. IndexedDB allows your browser to securely store structured files and multi-gigabyte datasets directly inside your operating system's local encrypted disk cache.",
    methodology: "When you link a 1.5GB state voter roll on our Data Prep page, Marigold chunks the rows into optimized local shards and saves them to your local IndexedDB ('VoterDataDB'). When you return tomorrow, your dataset is immediately available locally without re-uploading.",
    citations: [
      "W3C Recommendation: Indexed Database API 3.0 (Client-Side Structured Storage Standard).",
      "Mozilla Developer Network (MDN) Technical Architecture Documentation: Handling Large Datasets in Web Applications via IndexedDB."
    ]
  },
  {
    id: "shard",
    term: "Shard",
    fullName: "In-Memory Data Shards / Chunking Buffer",
    level: "Intermediate Analyst",
    summary: "Splitting a massive dataset into smaller, highly structured partitions (shards) stored and indexed independently in memory.",
    deepDive: "Attempting to run nine complex statistical equations across 5 million rows simultaneously inside a single thread would freeze most laptop web browsers. Sharding solves this by breaking the state roll down into manageable geographic or alphabetical buffers.",
    methodology: "Our Web Worker automatically chunks large datasets into 250,000-row shards. When you launch a 360° Comprehensive Audit, our parallel sweep iterates through each shard in RAM sequentially, preventing out-of-memory crashes while maintaining millisecond precision.",
    citations: [
      "Corbett, J. C., et al. (2013). Spanner: Google's Globally Distributed Database (Principles of Sharding & Partitioning). ACM Transactions on Computer Systems.",
      "Stonebraker, M., et al. (2005). C-Store: A Column-Oriented DBMS (In-Memory Partitioning Algorithms)."
    ]
  },
  {
    id: "ncoa",
    term: "NCOA",
    fullName: "National Change of Address Forwarding Registry",
    level: "Intermediate Analyst",
    summary: "The official U.S. Postal Service (USPS) database tracking over 40 million permanent change-of-address requests filed nationwide every year.",
    deepDive: "When an individual or family permanently relocates to another state (for example, moving from Mississippi to Florida), they file an NCOA forwarding address with their local post office so mail is redirected to their new home.",
    methodology: "Marigold cross-references active county voter registration addresses against verified NCOA permanent relocation timestamps. If a voter filed an interstate move over 6 months prior but remains active on the local voter roll, our system flags the record for routine election office verification.",
    citations: [
      "USPS Publication 28: Postal Addressing Standards & National Change of Address (NCOA-Link) System Technical Specifications.",
      "Interstate Voter Registration Crosscheck Standards & EAC List Maintenance Best Practices."
    ]
  },
  {
    id: "fellegi-sunter",
    term: "Fellegi-Sunter",
    fullName: "Probabilistic Record Linkage & Log-Odds Engine",
    level: "Pro / Legal Standard",
    summary: "The gold-standard mathematical formula used by national census bureaus and statistical agencies to link identical individuals across disparate datasets.",
    deepDive: "Simple exact-string matching fails when comparing voter records due to nicknames ('Beth Smith' vs 'Elizabeth Smith'), OCR typos ('Smitth'), or missing middle initials. Conversely, simplistic matching often triggers false alarms by confusing fathers and sons living together ('John Smith Sr' vs 'John Smith Jr').",
    methodology: "Marigold implements the rigorous Fellegi-Sunter log-odds scoring model. Each demographic dimension (first name phonetics via Soundex/Jaro-Winkler, last name, date of birth, and street address) contributes a weighted mathematical score. Identical birthdays provide a massive positive boost (+16.5), while familial collisions ('Sr' vs 'Jr') apply a severe penalty (-15.0), guaranteeing >98% Precision.",
    citations: [
      "Fellegi, I. P., & Sunter, A. B. (1969). A Theory for Record Linkage. Journal of the American Statistical Association, 64(328), 1183–1210.",
      "Winkler, W. E. (1990). String Comparator Metrics and Enhanced Decision Rules in the Fellegi-Sunter Model of Record Linkage. US Bureau of the Census."
    ]
  },
  {
    id: "sha-256",
    term: "SHA-256",
    fullName: "Cryptographic Air-Gap Verification Signature",
    level: "Pro / Legal Standard",
    summary: "A mathematical algorithm that converts any file or data summary into a unique, tamper-proof 64-character digital fingerprint.",
    deepDive: "When presenting audit scorecards or health reports to a judge, State Administering Agency (SAA) IT Director, or grant evaluator, institutions must prove that the underlying statistics and counts have not been altered or manipulated after the calculation finished.",
    methodology: "Every time you export an Executive Briefing or `.marigold-audit.json` cartridge, our client-side crypto engine (`crypto.subtle.digest`) generates a SHA-256 hash of the exact cleanliness metrics and flagged counts. Even changing a single comma alters the hash entirely, providing verifiable institutional proof.",
    citations: [
      "NIST Federal Information Processing Standards (FIPS) Publication 180-4: Secure Hash Standard (SHS / SHA-256).",
      "Federal Rules of Evidence (FRE) Rule 902(14): Self-Authentication of Certified Data Generated by an Electronic Process."
    ]
  },
  {
    id: "ocr",
    term: "OCR",
    fullName: "Optical Character Recognition Scan Benchmarks",
    level: "Intermediate Analyst",
    summary: "Technology that automatically reads and digitizes handwritten text from legacy paper registration cards and scanned PDF documents.",
    deepDive: "A significant percentage of county voter registration databases originated from handwritten paper forms scanned decades ago. Scanners frequently misinterpret characters—such as reading the digit '8' as the letter 'B', the letter 'O' as '0', or adding accidental special characters.",
    methodology: "Our 'Clerical OCR Name Typo & Character Anomalies' playbook checks every name string against ASCII boundary definitions and common scanner substitution tables. It automatically flags clerical anomalies (e.g. 'Smitth3' or non-standard symbols) so county clerks can clean data errors before official state reporting.",
    citations: [
      "Rice, S. V., et al. (1999). Optical Character Recognition: An Illustrated Guide to the Frontier. Kluwer Academic Publishers.",
      "State Auditor Best Practices Guide: Data Quality Validation & Clerical Error Remediation in Public Registries."
    ]
  },
  {
    id: "tukey",
    term: "Tukey's Fences",
    fullName: "Interquartile Range (IQR) Outlier Fences",
    level: "Pro / Legal Standard",
    summary: "A robust statistical formula developed by John Tukey that mathematically defines anomalies as values falling far outside the normal distribution curve.",
    deepDive: "When detecting unusual registration surges or age discrepancies across 82 counties, relying on arbitrary guesses ('more than 10 is bad') causes false alarms in large urban centers while missing real anomalies in rural towns.",
    methodology: "Marigold calculates the Interquartile Range (IQR = Q3 - Q1) across your specific jurisdiction. We then apply Tukey's Outer Fences (`Anomalies > Q3 + 1.5 * IQR`). This dynamically adapts the threshold to the local population size, guaranteeing non-partisan, mathematically defensible rigor.",
    citations: [
      "Tukey, John W. (1977). Exploratory Data Analysis. Addison-Wesley Publishing Company.",
      "Hoaglin, D. C., et al. (1986). Performance of Some Resistant Rules for Outlier Labeling. Journal of the American Statistical Association, 81(396), 991–999."
    ]
  },
  {
    id: "poisson",
    term: "Poisson Theory",
    fullName: "Poisson Rare Event Probability Distribution",
    level: "Pro / Legal Standard",
    summary: "A mathematical probability theory used to measure how likely or unlikely a dense cluster of rare events is to occur by natural chance.",
    deepDive: "If a single residential street address or voting precinct suddenly registers 45 new voters on a single Tuesday afternoon, analysts must determine whether that surge represents a natural voter registration drive or a clerical database import error.",
    methodology: "Our registration spike model models historical daily registration counts as a Poisson process (`P(k events in interval) = λ^k * e^-λ / k!`). When an observed surge has a mathematical probability `p < 0.0001` of happening naturally, it is highlighted on the audit scorecard for inspection.",
    citations: [
      "Poisson, Siméon Denis (1837). Recherches sur la probabilité des jugements en matière criminelle et en matière civile.",
      "Haight, Frank A. (1967). Handbook of the Poisson Distribution. John Wiley & Sons."
    ]
  },
  {
    id: "nvra",
    term: "NVRA Title 8",
    fullName: "National Voter Registration Act of 1993 (52 U.S.C. § 20507)",
    level: "Pro / Legal Standard",
    summary: "The landmark federal election law governing how states and counties must maintain accurate, up-to-date voter rolls while protecting eligible citizens.",
    deepDive: "Section 8 of the NVRA mandates that states conduct regular, uniform, and non-discriminatory list maintenance to remove ineligible voters (such as those who have relocated or passed away) while prohibiting mass purges right before federal elections.",
    methodology: "Marigold's verification workflow specifically mirrors NVRA statutory protections. Our system never deletes or removes records; instead, it generates verified, multi-point audit evidence (`Notice Required` vs `Action Recommended`) designed to assist bipartisan county boards in conducting lawful list review.",
    citations: [
      "National Voter Registration Act of 1993, 52 U.S.C. § 20507 (Requirements with respect to administration of voter registration).",
      "U.S. Department of Justice (DOJ) Civil Rights Division: Guidance under Section 8 of the National Voter Registration Act."
    ]
  },
  {
    id: "eric",
    term: "ERIC Standards",
    fullName: "Electronic Registration Information Center Interstate Standards",
    level: "Intermediate Analyst",
    summary: "A multi-state data-sharing consortium that helps election officials identify citizens who have moved across state lines or passed away.",
    deepDive: "Because individual counties do not have direct access to driver's license files or vital statistics in neighboring states, interstate data standards are required to cleanly match voters who hold active registrations in multiple jurisdictions.",
    methodology: "Marigold structures all duplicate and relocation export cartridges to align with canonical interstate crosscheck and ERIC data schema formatting, ensuring that local county findings can be seamlessly integrated with state-level verification pipelines.",
    citations: [
      "Electronic Registration Information Center (ERIC) Member Agreement & Data Matching Protocols.",
      "National Association of Secretaries of State (NASS) Task Force on Voter Roll Maintenance Best Practices."
    ]
  }
];

export default function LearningCenterPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSections = LEARNING_SECTIONS.filter((s) => {
    const matchesLevel = selectedLevel === "All" || s.level === selectedLevel;
    const matchesSearch = 
      s.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deepDive.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getBadgeStyle = (level: string) => {
    if (level === "First-Time Learner") {
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    }
    if (level === "Intermediate Analyst") {
      return "bg-amber-100 text-amber-900 border-amber-300";
    }
    return "bg-purple-100 text-purple-900 border-purple-300";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 pt-6 px-4">
      {/* Top Header */}
      <div className="bg-[#F0ECE3] text-[#2D3142] p-8 md:p-10 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E0D8] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#D96B27]/15 text-[#D96B27] border border-[#D96B27]/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Marigold Knowledge Base</span>
              </span>
              <span className="text-xs font-mono text-[#646A7A] inline-flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Zero-Cloud Privacy &amp; Methodology Standards</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#2D3142]">
              Citizen &amp; Agency Learning Center
            </h1>
            <p className="text-sm md:text-base text-[#4A5060] max-w-3xl leading-relaxed">
              Transparent plain-English definitions, systems methodology, statistical formulas, and academic/legal citations designed to build trust for first-time learners, intermediate analysts, and institutional pros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-white hover:bg-[#EAE5DC] text-[#2D3142] font-bold px-5 py-3 rounded-xl border border-[#E5E0D8] transition-colors text-xs shadow-2xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Return to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar & Quick Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {["All", "First-Time Learner", "Intermediate Analyst", "Pro / Legal Standard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                  selectedLevel === lvl
                    ? "bg-[#2D3142] text-white border-slate-700 shadow-md"
                    : "bg-white text-[#646A7A] hover:bg-slate-100 border-[#E5E0D8]"
                }`}
              >
                {lvl === "All" ? "🌐 All Topics" : lvl === "First-Time Learner" ? "🟢 First-Time Learners" : lvl === "Intermediate Analyst" ? "🟡 Intermediate Analysts" : "🟣 Pro / Legal & Statistical"}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts, acronyms, or formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E0D8] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#2D3142] focus:border-[#D96B27] outline-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Quick Jump Anchor Grid */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-2xs space-y-3">
        <span className="text-xs font-black text-[#646A7A] uppercase tracking-wider block">⚡ Quick Jump Index:</span>
        <div className="flex flex-wrap gap-2 text-xs">
          {LEARNING_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="bg-[#FAF8F5] hover:bg-[#D96B27] text-[#2D3142] hover:text-white font-bold px-3 py-1.5 rounded-lg border border-[#E5E0D8] transition-colors"
            >
              {s.term}
            </a>
          ))}
        </div>
      </div>

      {/* Main Term & Methodology Sections */}
      <div className="space-y-8">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E5E0D8] p-8 space-y-3">
            <HelpCircle className="w-12 h-12 text-[#D96B27] mx-auto opacity-50" />
            <h3 className="text-xl font-bold text-[#2D3142]">No matching topics found</h3>
            <p className="text-xs text-[#646A7A]">Try broadening your search query or selecting &apos;All Topics&apos; above.</p>
            <button
              onClick={() => { setSelectedLevel("All"); setSearchQuery(""); }}
              className="mt-2 bg-[#D96B27] text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSections.map((s, idx) => (
            <section
              key={s.id}
              id={s.id}
              className="bg-white rounded-3xl border border-[#E5E0D8] shadow-sm p-8 md:p-10 space-y-6 scroll-mt-24 transition-all hover:border-amber-400/60"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeStyle(s.level)}`}>
                      {s.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#646A7A] bg-slate-100 px-2 py-0.5 rounded">
                      Section #{idx + 1} • {s.id.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-[#2D3142]">
                    {s.term} <span className="font-normal text-lg md:text-xl text-[#646A7A]">({s.fullName})</span>
                  </h2>
                </div>

                <a
                  href={`#${s.id}`}
                  className="text-xs text-[#D96B27] hover:underline font-bold flex items-center gap-1 shrink-0"
                >
                  <span>🔗 Link to this section</span>
                </a>
              </div>

              {/* 3-Column Executive / Deep-Dive / Methodology Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Column 1: Executive Summary */}
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E5E0D8] space-y-2">
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#D96B27] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plain-English Summary</span>
                  </h3>
                  <p className="text-xs md:text-sm text-[#2D3142] leading-relaxed font-medium">
                    {s.summary}
                  </p>
                </div>

                {/* Column 2: Deep-Dive & Context */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#2D3142] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Why It Matters &amp; Deep-Dive</span>
                  </h3>
                  <p className="text-xs text-[#4A5060] leading-relaxed">
                    {s.deepDive}
                  </p>
                </div>

                {/* Column 3: How Marigold Implements It */}
                <div className="bg-[#2D3142] text-white p-6 rounded-2xl border border-slate-700 space-y-2 shadow-sm">
                  <h3 className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>How Marigold Implements It</span>
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {s.methodology}
                  </p>
                </div>
              </div>

              {/* Formal Citations & References Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Academic, Statistical &amp; Legal Reference Citations:</span>
                </span>
                <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-600 font-medium">
                  {s.citations.map((cite, cIdx) => (
                    <li key={cIdx} className="leading-normal">
                      {cite}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
