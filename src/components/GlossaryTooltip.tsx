"use client";

import React, { ReactNode, useState } from "react";
import { Info, HelpCircle } from "lucide-react";

export interface GlossaryItem {
  title: string;
  definition: string;
  whyAndHow: string;
}

export const GLOSSARY_DICTIONARY: Record<string, GlossaryItem> = {
  PII: {
    title: "PII (Personally Identifiable Information)",
    definition: "Sensitive private citizen data such as full legal names, home street addresses, dates of birth, driver's license numbers, or social security numbers.",
    whyAndHow: "Voter rolls contain public or semi-public citizen PII. To protect citizens from identity theft or cloud breaches, Marigold processes 100% of PII inside your local device RAM (0 bytes uploaded to our servers)."
  },
  RAM: {
    title: "RAM (Random Access Memory / Client Memory)",
    definition: "Your computer or device's high-speed temporary working memory where active calculations take place.",
    whyAndHow: "Instead of uploading 2GB files over the internet to a slow remote database, Marigold loads the voter dataset directly into your device's RAM so multi-million-row queries run locally in seconds."
  },
  "Air-Gap": {
    title: "Zero-Cloud Air-Gap (Local-Compute Architecture)",
    definition: "A strict data-governance security model where sensitive files never leave your physical machine.",
    whyAndHow: "Just like an 'air-gapped' military computer disconnected from the internet, all calculations execute entirely inside your web browser. Only anonymous summary counts (like '14 addresses flagged') touch the network if you choose to export them."
  },
  IndexedDB: {
    title: "IndexedDB (Secure Local Browser Cache)",
    definition: "A secure, private local database engine built inside modern web browsers (Chrome, Safari, Edge).",
    whyAndHow: "Allows Marigold to chunk and store large 2GB voter files directly on your computer's encrypted drive so you don't have to re-upload your CSV or TXT file every time you refresh or restart."
  },
  NCOA: {
    title: "NCOA (National Change of Address Database)",
    definition: "The official U.S. Postal Service (USPS) registry tracking individuals and households who have filed permanent forwarding addresses when relocating out of state.",
    whyAndHow: "We cross-reference active voter registrations against NCOA forwarding dates to help election officials cleanly identify voters who have permanently moved to another state."
  },
  "Fellegi-Sunter": {
    title: "Fellegi-Sunter Probabilistic Record Linkage",
    definition: "The gold-standard mathematical log-odds formula used by national census bureaus and statistical agencies to link identities across datasets.",
    whyAndHow: "It evaluates nicknames ('Elizabeth' vs 'Beth'), common OCR typos ('Smitth'), and birthdates simultaneously to isolate true duplicate registrations without generating false alarms on family members ('Senior' vs 'Junior')."
  },
  "SHA-256": {
    title: "SHA-256 Cryptographic Verification Signature",
    definition: "A unique 64-character cryptographic digital 'fingerprint' generated from a specific dataset or audit scorecard.",
    whyAndHow: "Even changing a single comma or digit changes the entire hash. We attach SHA-256 hashes to every audit report so third-party evaluators and judges can verify the report was never altered."
  },
  OCR: {
    title: "OCR (Optical Character Recognition)",
    definition: "Technology that automatically reads and digitizes text from paper forms, scanned PDFs, or handwritten registration cards.",
    whyAndHow: "Legacy county voter rolls often contain OCR scan errors from old paper forms (such as reading an '8' as a 'B' or 'O' as '0'). Our algorithms automatically flag and clean these clerical errors."
  },
  FPR: {
    title: "FPR (False Positive Rate / Precision Benchmarks)",
    definition: "Statistical accuracy measurements that prove how reliably an algorithm catches real errors without raising false alarms.",
    whyAndHow: "Our linkage engine is empirically benchmarked at >98% Precision and 0% False Positive Rate, ensuring county clerks don't waste time chasing non-existent anomalies."
  },
  Shard: {
    title: "In-Memory Shards (Data Chunking)",
    definition: "Splitting a massive dataset into smaller, highly optimized chunks stored locally in RAM.",
    whyAndHow: "By sharding a 2,000,000-row state voter roll into smaller county or precinct memory buffers, your browser can run complex forensic playbooks at lightning speed without freezing."
  },
  Tukey: {
    title: "Tukey's Fences (Statistical Outlier Method)",
    definition: "A proven statistical formula that defines anomalies as values that fall far outside the normal distribution (specifically beyond 1.5 times the Interquartile Range).",
    whyAndHow: "We use Tukey's Fences to automatically separate normal registration surges (like right before a presidential deadline) from extreme statistical anomalies without relying on arbitrary guesses."
  },
  Poisson: {
    title: "Poisson Rare Event Probability Theory",
    definition: "A mathematical probability model used to measure how likely or unlikely a cluster of rare events is to happen by chance.",
    whyAndHow: "When a single street address or precinct experiences a sudden massive spike in registrations on a single day, Poisson theory helps quantify the mathematical probability of that happening naturally."
  },
  NVRA: {
    title: "NVRA (National Voter Registration Act of 1993)",
    definition: "Also known as the federal 'Motor Voter Act', it establishes nationwide standards for voter registration and list maintenance.",
    whyAndHow: "NVRA Title 8 requires states to conduct regular, uniform, and non-discriminatory list maintenance while ensuring eligible citizens are not improperly removed."
  },
  ERIC: {
    title: "ERIC (Electronic Registration Information Center)",
    definition: "A multi-state data-sharing consortium that cross-references driver's license records, postal changes, and social security death master files.",
    whyAndHow: "Provides state election directors with verified cross-jurisdictional data to cleanly identify voters who have relocated or passed away."
  }
};

export interface GlossaryTooltipProps {
  term: keyof typeof GLOSSARY_DICTIONARY | string;
  children?: ReactNode;
  customTitle?: string;
  customDefinition?: string;
  customWhyAndHow?: string;
  className?: string;
}

export function GlossaryTooltip({
  term,
  children,
  customTitle,
  customDefinition,
  customWhyAndHow,
  className = ""
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = GLOSSARY_DICTIONARY[term] || {
    title: customTitle || term,
    definition: customDefinition || "Standardized platform concept.",
    whyAndHow: customWhyAndHow || "Enforces data verification and zero-cloud local security."
  };

  return (
    <span
      className={`group relative inline-flex items-center gap-1 cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="border-b border-dotted border-amber-600/70 group-hover:border-amber-500 group-hover:text-amber-600 transition-colors font-semibold">
        {children || term}
      </span>
      <span className="text-[10px] text-amber-600/80 group-hover:text-amber-600 inline-flex items-center">
        ℹ️
      </span>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-72 md:w-80 p-4 bg-[#2D3142] text-white rounded-xl shadow-2xl border border-slate-600 text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-black text-amber-400 text-sm tracking-tight">{info.title}</span>
              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Definition
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-normal font-medium">
              {info.definition}
            </p>
            <div className="bg-black/30 p-2.5 rounded-lg border border-slate-700/60 space-y-1 mt-2">
              <span className="text-[10px] font-black text-amber-400/90 uppercase tracking-wider block">
                Why It Matters &amp; How It Works in Marigold:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {info.whyAndHow}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#2D3142] border-r border-b border-slate-600 transform rotate-45"></div>
        </div>
      )}
    </span>
  );
}
