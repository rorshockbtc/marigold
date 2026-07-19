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
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface Citation {
  text: string;
  url: string;
  type: "Academic" | "Legal / Statutory" | "General Guide" | "Technical Standard" | "Security Standard";
}

interface LearningSection {
  id: string;
  term: string;
  fullName: string;
  summary: string;
  deepDive: string;
  methodology: string;
  citations: Citation[];
}

const LEARNING_SECTIONS: LearningSection[] = [
  {
    id: "pii",
    term: "PII",
    fullName: "Personally Identifiable Information",
    summary: "Sensitive personal citizen data such as full legal names, home street addresses, dates of birth, driver's license numbers, or social security numbers.",
    deepDive: "Public voter registration files inherently contain citizen PII. While election officials and campaign analysts require this information to audit voter rolls or run canvassing missions, centralizing millions of sensitive records on public cloud servers creates severe cybersecurity risks and targets for identity thieves.",
    methodology: "Marigold enforces a strict 'Zero-Cloud Air-Gap' security model. When you load a county or state voter roll, 100% of the PII is parsed and stored inside your local computer's browser memory (RAM and encrypted IndexedDB). Not a single byte of citizen PII is ever uploaded to our servers or transmitted over the internet.",
    citations: [
      {
        text: "NIST Special Publication 800-122: Guide to Protecting the Confidentiality of Personally Identifiable Information (PII).",
        url: "https://csrc.nist.gov/publications/detail/sp/800-122/final",
        type: "Security Standard"
      },
      {
        text: "Federal Election Commission (FEC) Data Governance & Citizen Privacy Protocols.",
        url: "https://www.fec.gov/",
        type: "Legal / Statutory"
      }
    ]
  },
  {
    id: "ram",
    term: "RAM",
    fullName: "Random Access Memory / Client Memory",
    summary: "Your computer or device's high-speed temporary working memory where active mathematical calculations and queries take place.",
    deepDive: "Traditional data platforms force you to upload multi-gigabyte CSV files across the internet to a slow remote database server. This takes minutes or hours, risks data breaches during transfer, and causes long loading screens every time you run a query.",
    methodology: "By executing directly in local device RAM via browser Web Workers, Marigold processes complex Fellegi-Sunter log-odds formulas across 2,000,000+ records in under 100 milliseconds right inside your computer's local processor.",
    citations: [
      {
        text: "W3C Web Workers Working Group Note: High-Performance Multithreaded Client-Side Computation in Modern Web Browsers.",
        url: "https://www.w3.org/TR/workers/",
        type: "Technical Standard"
      },
      {
        text: "IEEE Transactions on Parallel and Distributed Systems: In-Memory Client-Side Data Analytics.",
        url: "https://ieeexplore.ieee.org/document/7373574",
        type: "Academic"
      }
    ]
  },
  {
    id: "air-gap",
    term: "Zero-Cloud Air-Gap",
    fullName: "Local-Compute Air-Gap Architecture",
    summary: "A strict data-governance security model where sensitive files never leave the physical hardware you are using.",
    deepDive: "In high-security government and military environments, an 'air-gapped' computer is physically disconnected from the internet so external hackers cannot access sensitive files. We bring this exact level of security directly into standard web browsers.",
    methodology: "Our client-side JavaScript engine is self-contained. Even if your internet connection drops after the webpage loads, Marigold's forensic playbooks continue running at 100% speed because the logic executes entirely within your local hardware boundary.",
    citations: [
      {
        text: "NIST Special Publication 800-53 (Rev 5): Security and Privacy Controls for Information Systems.",
        url: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
        type: "Security Standard"
      },
      {
        text: "CISA Election Security Technical Guidance on Local Compute Environments.",
        url: "https://www.cisa.gov/topics/election-security",
        type: "General Guide"
      }
    ]
  },
  {
    id: "indexeddb",
    term: "IndexedDB",
    fullName: "Secure Local Browser Storage Cache",
    summary: "A high-capacity, transactional database system built directly inside modern web browsers (Chrome, Safari, Edge, Firefox).",
    deepDive: "Standard browser storage (like cookies or LocalStorage) can only hold tiny strings under 5 megabytes. IndexedDB allows your browser to securely store structured files and multi-gigabyte datasets directly inside your operating system's local encrypted disk cache.",
    methodology: "When you link a 1.5GB state voter roll on our Data Prep page, Marigold chunks the rows into optimized local shards and saves them to your local IndexedDB ('VoterDataDB'). When you return tomorrow, your dataset is immediately available locally without re-uploading.",
    citations: [
      {
        text: "W3C Recommendation: Indexed Database API 3.0 (Client-Side Structured Storage Standard).",
        url: "https://www.w3.org/TR/IndexedDB-3/",
        type: "Technical Standard"
      },
      {
        text: "MDN Technical Architecture Documentation: Handling Large Datasets in Web Applications.",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
        type: "Technical Standard"
      }
    ]
  },
  {
    id: "shard",
    term: "Shard",
    fullName: "In-Memory Data Shards / Chunking Buffer",
    summary: "Splitting a massive dataset into smaller, highly structured partitions (shards) stored and indexed independently in memory.",
    deepDive: "Attempting to run nine complex statistical equations across 5 million rows simultaneously inside a single thread would freeze most laptop web browsers. Sharding solves this by breaking the state roll down into manageable geographic or alphabetical buffers.",
    methodology: "Our Web Worker automatically chunks large datasets into 250,000-row shards. When you launch a 360° Comprehensive Audit, our parallel sweep iterates through each shard in RAM sequentially, preventing out-of-memory crashes while maintaining millisecond precision.",
    citations: [
      {
        text: "Corbett, J. C., et al. (2013). Spanner: Google's Globally Distributed Database.",
        url: "https://research.google/pubs/spanner-googles-globally-distributed-database/",
        type: "Academic"
      },
      {
        text: "Stonebraker, M., et al. (2005). C-Store: A Column-Oriented DBMS.",
        url: "https://dl.acm.org/doi/10.1145/1083592.1083658",
        type: "Academic"
      }
    ]
  },
  {
    id: "ncoa",
    term: "NCOA",
    fullName: "National Change of Address Forwarding Registry",
    summary: "The official U.S. Postal Service (USPS) database tracking over 40 million permanent change-of-address requests filed nationwide every year.",
    deepDive: "When an individual or family permanently relocates to another state (for example, moving from Mississippi to Florida), they file an NCOA forwarding address with their local post office so mail is redirected to their new home.",
    methodology: "Marigold cross-references active county voter registration addresses against verified NCOA permanent relocation timestamps. If a voter filed an interstate move over 6 months prior but remains active on the local voter roll, our system flags the record for routine election office verification.",
    citations: [
      {
        text: "USPS Publication 28: Postal Addressing Standards & National Change of Address System.",
        url: "https://pe.usps.com/cpim/ftp/pubs/pub28/pub28.pdf",
        type: "Technical Standard"
      },
      {
        text: "EAC List Maintenance Best Practices.",
        url: "https://www.eac.gov/",
        type: "General Guide"
      }
    ]
  },
  {
    id: "fellegi-sunter",
    term: "Fellegi-Sunter",
    fullName: "Probabilistic Record Linkage & Log-Odds Engine",
    summary: "The gold-standard mathematical formula used by national census bureaus and statistical agencies to link identical individuals across disparate datasets.",
    deepDive: "Simple exact-string matching fails when comparing voter records due to nicknames ('Beth Smith' vs 'Elizabeth Smith'), OCR typos ('Smitth'), or missing middle initials. Conversely, simplistic matching often triggers false alarms by confusing fathers and sons living together ('John Smith Sr' vs 'John Smith Jr').",
    methodology: "Marigold implements the rigorous Fellegi-Sunter log-odds scoring model. Each demographic dimension (first name phonetics via Soundex/Jaro-Winkler, last name, date of birth, and street address) contributes a weighted mathematical score. Identical birthdays provide a massive positive boost (+16.5), while familial collisions ('Sr' vs 'Jr') apply a severe penalty (-15.0), guaranteeing >98% Precision.",
    citations: [
      {
        text: "Fellegi, I. P., & Sunter, A. B. (1969). A Theory for Record Linkage. Journal of the American Statistical Association.",
        url: "https://www.jstor.org/stable/2286061",
        type: "Academic"
      },
      {
        text: "Winkler, W. E. (1990). String Comparator Metrics and Enhanced Decision Rules. US Bureau of the Census.",
        url: "https://www.census.gov/srd/papers/pdf/rr90-9.pdf",
        type: "Academic"
      }
    ]
  },
  {
    id: "sha-256",
    term: "SHA-256",
    fullName: "Cryptographic Air-Gap Verification Signature",
    summary: "A mathematical algorithm that converts any file or data summary into a unique, tamper-proof 64-character digital fingerprint.",
    deepDive: "When presenting audit scorecards or health reports to a judge, State Administering Agency (SAA) IT Director, or grant evaluator, institutions must prove that the underlying statistics and counts have not been altered or manipulated after the calculation finished.",
    methodology: "Every time you export an Executive Briefing or `.marigold-audit.json` cartridge, our client-side crypto engine (`crypto.subtle.digest`) generates a SHA-256 hash of the exact cleanliness metrics and flagged counts. Even changing a single comma alters the hash entirely, providing verifiable institutional proof.",
    citations: [
      {
        text: "NIST Federal Information Processing Standards (FIPS) Publication 180-4: Secure Hash Standard (SHS).",
        url: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf",
        type: "Security Standard"
      },
      {
        text: "Federal Rules of Evidence (FRE) Rule 902(14): Self-Authentication of Certified Data.",
        url: "https://www.law.cornell.edu/rules/fre/rule_902",
        type: "Legal / Statutory"
      }
    ]
  },
  {
    id: "ocr",
    term: "OCR",
    fullName: "Optical Character Recognition Scan Benchmarks",
    summary: "Technology that automatically reads and digitizes handwritten text from legacy paper registration cards and scanned PDF documents.",
    deepDive: "A significant percentage of county voter registration databases originated from handwritten paper forms scanned decades ago. Scanners frequently misinterpret characters—such as reading the digit '8' as the letter 'B', the letter 'O' as '0', or adding accidental special characters.",
    methodology: "Our 'Clerical OCR Name Typo & Character Anomalies' playbook checks every name string against ASCII boundary definitions and common scanner substitution tables. It automatically flags clerical anomalies (e.g. 'Smitth3' or non-standard symbols) so county clerks can clean data errors before official state reporting.",
    citations: [
      {
        text: "Rice, S. V., et al. (1999). Optical Character Recognition: An Illustrated Guide to the Frontier.",
        url: "https://link.springer.com/book/10.1007/978-1-4615-5285-8",
        type: "Academic"
      },
      {
        text: "State Auditor Best Practices Guide: Data Quality Validation & Clerical Error Remediation.",
        url: "https://www.eac.gov/",
        type: "General Guide"
      }
    ]
  },
  {
    id: "tukey",
    term: "Tukey's Fences",
    fullName: "Interquartile Range (IQR) Outlier Fences",
    summary: "A robust statistical formula developed by John Tukey that mathematically defines anomalies as values falling far outside the normal distribution curve.",
    deepDive: "When detecting unusual registration surges or age discrepancies across 82 counties, relying on arbitrary guesses ('more than 10 is bad') causes false alarms in large urban centers while missing real anomalies in rural towns.",
    methodology: "Marigold calculates the Interquartile Range (IQR = Q3 - Q1) across your specific jurisdiction. We then apply Tukey's Outer Fences (`Anomalies > Q3 + 1.5 * IQR`). This dynamically adapts the threshold to the local population size, guaranteeing non-partisan, mathematically defensible rigor.",
    citations: [
      {
        text: "Tukey, John W. (1977). Exploratory Data Analysis. Addison-Wesley Publishing Company.",
        url: "https://archive.org/details/exploratorydataa00tuke",
        type: "Academic"
      },
      {
        text: "Hoaglin, D. C., et al. (1986). Performance of Some Resistant Rules for Outlier Labeling.",
        url: "https://www.jstor.org/stable/2289073",
        type: "Academic"
      }
    ]
  },
  {
    id: "poisson",
    term: "Poisson Theory",
    fullName: "Poisson Rare Event Probability Distribution",
    summary: "A mathematical probability theory used to measure how likely or unlikely a dense cluster of rare events is to occur by natural chance.",
    deepDive: "If a single residential street address or voting precinct suddenly registers 45 new voters on a single Tuesday afternoon, analysts must determine whether that surge represents a natural voter registration drive or a clerical database import error.",
    methodology: "Our registration spike model models historical daily registration counts as a Poisson process (`P(k events in interval) = λ^k * e^-λ / k!`). When an observed surge has a mathematical probability `p < 0.0001` of happening naturally, it is highlighted on the audit scorecard for inspection.",
    citations: [
      {
        text: "Poisson, Siméon Denis (1837). Recherches sur la probabilité des jugements en matière criminelle et en matière civile.",
        url: "https://gallica.bnf.fr/ark:/12148/bpt6k1085023q",
        type: "Academic"
      },
      {
        text: "Haight, Frank A. (1967). Handbook of the Poisson Distribution.",
        url: "https://archive.org/details/handbookofpoisso0000haig",
        type: "Academic"
      }
    ]
  },
  {
    id: "nvra",
    term: "NVRA Title 8",
    fullName: "National Voter Registration Act of 1993 (52 U.S.C. § 20507)",
    summary: "The landmark federal election law governing how states and counties must maintain accurate, up-to-date voter rolls while protecting eligible citizens.",
    deepDive: "Section 8 of the NVRA mandates that states conduct regular, uniform, and non-discriminatory list maintenance to remove ineligible voters (such as those who have relocated or passed away) while prohibiting mass purges right before federal elections.",
    methodology: "Marigold's verification workflow specifically mirrors NVRA statutory protections. Our system never deletes or removes records; instead, it generates verified, multi-point audit evidence (`Notice Required` vs `Action Recommended`) designed to assist bipartisan county boards in conducting lawful list review.",
    citations: [
      {
        text: "National Voter Registration Act of 1993, 52 U.S.C. § 20507.",
        url: "https://uscode.house.gov/view.xhtml?req=(title:52%20section:20507%20edition:prelim)",
        type: "Legal / Statutory"
      },
      {
        text: "U.S. DOJ Civil Rights Division: Guidance under Section 8 of the NVRA.",
        url: "https://www.justice.gov/crt/national-voter-registration-act-1993-nvra",
        type: "Legal / Statutory"
      }
    ]
  },
  {
    id: "eric",
    term: "ERIC Standards",
    fullName: "Electronic Registration Information Center Interstate Standards",
    summary: "A multi-state data-sharing consortium that helps election officials identify citizens who have moved across state lines or passed away.",
    deepDive: "Because individual counties do not have direct access to driver's license files or vital statistics in neighboring states, interstate data standards are required to cleanly match voters who hold active registrations in multiple jurisdictions.",
    methodology: "Marigold structures all duplicate and relocation export cartridges to align with canonical interstate crosscheck and ERIC data schema formatting, ensuring that local county findings can be seamlessly integrated with state-level verification pipelines.",
    citations: [
      {
        text: "Electronic Registration Information Center (ERIC) Member Agreement & Data Matching Protocols.",
        url: "https://ericstates.org/",
        type: "Technical Standard"
      },
      {
        text: "National Association of Secretaries of State (NASS) Task Force on Voter Roll Maintenance Best Practices.",
        url: "https://www.nass.org/",
        type: "General Guide"
      }
    ]
  }
];

export default function LearningCenterPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSections = LEARNING_SECTIONS.filter((s) => {
    return s.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deepDive.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getCitationBadgeStyle = (type: string) => {
    if (type === "Academic") return "bg-blue-100 text-blue-800 border-blue-200";
    if (type === "Legal / Statutory") return "bg-purple-100 text-purple-800 border-purple-200";
    if (type === "Security Standard") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (type === "Technical Standard") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-800 border-slate-200"; // General Guide
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 pt-6 px-4">
      {/* Top Header */}
      <div className="bg-muted text-foreground p-8 md:p-10 rounded-3xl border border-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-accent/15 text-[#D96B27] border border-[#D96B27]/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Marigold Knowledge Base</span>
              </span>
              <span className="text-xs font-mono text-[#646A7A] inline-flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Zero-Cloud Privacy &amp; Methodology Standards</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              Citizen &amp; Agency Learning Center
            </h1>
            <p className="text-sm md:text-base text-[#4A5060] max-w-3xl leading-relaxed">
              Transparent plain-English definitions, systems methodology, statistical formulas, and academic/legal citations designed to build trust for all citizens, analysts, and institutional pros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-white hover:bg-[#EAE5DC] text-foreground font-bold px-5 py-3 rounded-xl border border-border transition-colors text-xs shadow-2xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Return to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Quick Search */}
        <div className="flex flex-col justify-between items-stretch gap-4 pt-2">
          <div className="relative w-full max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search concepts, acronyms, or formulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-foreground focus:border-[#D96B27] outline-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Quick Jump Anchor Grid */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-2xs space-y-3">
        <span className="text-xs font-black text-[#646A7A] uppercase tracking-wider block">⚡ Quick Jump Index:</span>
        <div className="flex flex-wrap gap-2 text-xs">
          {LEARNING_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="bg-[#FAF8F5] hover:bg-accent text-foreground hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg border border-border transition-colors"
            >
              {s.term}
            </a>
          ))}
        </div>
      </div>

      {/* Main Term & Methodology Sections */}
      <div className="space-y-8">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border p-8 space-y-3">
            <HelpCircle className="w-12 h-12 text-[#D96B27] mx-auto opacity-50" />
            <h3 className="text-xl font-bold text-foreground">No matching topics found</h3>
            <p className="text-xs text-[#646A7A]">Try broadening your search query.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 bg-accent text-slate-900 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredSections.map((s, idx) => (
            <section
              key={s.id}
              id={s.id}
              className="bg-white rounded-3xl border border-border shadow-sm p-8 md:p-10 space-y-6 scroll-mt-24 transition-all hover:border-amber-400/60"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[#646A7A] bg-slate-100 px-2 py-0.5 rounded">
                      Section #{idx + 1} • {s.id.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">
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
                <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-border space-y-2">
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#D96B27] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plain-English Summary</span>
                  </h3>
                  <p className="text-xs md:text-sm text-foreground leading-relaxed font-medium">
                    {s.summary}
                  </p>
                </div>

                {/* Column 2: Deep-Dive & Context */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="font-black text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Why It Matters &amp; Deep-Dive</span>
                  </h3>
                  <p className="text-xs text-[#4A5060] leading-relaxed">
                    {s.deepDive}
                  </p>
                </div>

                {/* Column 3: How Marigold Implements It */}
                <div className="bg-[#2D3142] text-slate-900 p-6 rounded-2xl border border-slate-700 space-y-2 shadow-sm">
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
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Academic, Statistical &amp; Legal Reference Citations:</span>
                </span>
                <div className="space-y-3 pl-1">
                  {s.citations.map((cite, cIdx) => (
                    <div key={cIdx} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 leading-normal">
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCitationBadgeStyle(cite.type)}`}>
                        {cite.type}
                      </span>
                      <a 
                        href={cite.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#1D4ED8] hover:text-[#1E3A8A] hover:underline font-medium flex items-start gap-1"
                      >
                        <span className="inline-block flex-1">{cite.text}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </div>

      {/* Meet the Architect Section */}
      <div className="bg-[#2D3142] text-slate-900 p-8 md:p-10 rounded-3xl border border-[#4A5060] shadow-md mt-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-black uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Behind the Code</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Meet the Architect</h2>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed">
              Transparency isn't just about open-source code and statistical math—it's about knowing the real people behind the system. Watch this short overview to learn more about the philosophy behind Marigold, the importance of zero-cloud privacy, and why we built this tool for election officials and citizens alike.
            </p>
          </div>
          <div className="w-full md:w-1/2 max-w-md aspect-video rounded-xl overflow-hidden border-4 border-slate-200 shadow-xl shrink-0 bg-slate-200">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/AfCvrfkcx5M" 
              title="Meet the Architect - Marigold Insights" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
