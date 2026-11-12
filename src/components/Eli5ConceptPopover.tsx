"use client";

import React, { useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";

export type MarigoldConceptKey =
  | "Merkle-DAG"
  | "OpenTimestamps"
  | "OPFS"
  | "Zstd Parquet"
  | "Benford"
  | "NVRA"
  | "BlindRelay"
  | "AirGap";

const CONCEPT_COPY: Record<MarigoldConceptKey, { title: string; summary: string }> = {
  "Merkle-DAG": {
    title: "What is a Merkle-DAG fingerprint?",
    summary:
      "Think of it as a tamper-evident digital wax seal. If even one number or row in the underlying data changes later, the 64-character SHA-256 fingerprint changes completely, proving what was audited and when.",
  },
  OpenTimestamps: {
    title: "What is a Bitcoin .ots receipt?",
    summary:
      "OpenTimestamps anchors only your anonymous 32-byte report fingerprint onto the Bitcoin blockchain—never any voter data. Years from now, anyone can verify the receipt to prove your audit numbers existed at that exact date.",
  },
  OPFS: {
    title: "What is OPFS Local Storage?",
    summary:
      "Origin Private File System (OPFS) is a high-speed private vault built inside your own web browser. Multi-million-row voter rolls stay on your device across reloads with zero cloud uploads and zero permission popups.",
  },
  "Zstd Parquet": {
    title: "Why Zstd Parquet Shards?",
    summary:
      "Parquet stores spreadsheet columns compressed like a columnar database so Marigold can reopen millions of rows in under 1.5 seconds instead of re-reading raw CSV text from scratch.",
  },
  Benford: {
    title: "What does Benford's Law check?",
    summary:
      "In organic precinct voter counts, numbers beginning with '1' appear about 30% of the time while '9' appears under 5%. Deviations highlight unusual precinct splits or capped polling locations above 3,000 voters.",
  },
  NVRA: {
    title: "Why dual Voter Protection & NVRA Maintenance?",
    summary:
      "Federal NVRA rules protect active voters from improper removal while guiding routine mail-confirmation notices. Checking both recent-vote Inactive records (to prevent pollbook delays) and long-dormant movers keeps rolls both fair and accurate.",
  },
  BlindRelay: {
    title: "How Encrypted Coalition Sync works",
    summary:
      "Your coalition notes and county scorecards are checked for Zero-PII and locked with AES-256-GCM encryption on your device before ever touching a relay server. Even the relay operator sees only unreadable ciphertext.",
  },
  AirGap: {
    title: "What does Air-Gap Lock do?",
    summary:
      "When Air-Gap Lock is on, Marigold hard-blocks external network requests inside your tab. SQL queries, AI corpus search, audio briefings, and SHA-256 verification continue running strictly inside your device memory.",
  },
};

export function Eli5ConceptPopover({
  concept,
  label,
}: {
  concept: MarigoldConceptKey;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const info = CONCEPT_COPY[concept];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full border border-[#D6D0C4] bg-[#FAF8F5] px-2.5 py-0.5 text-[11px] font-bold text-[#78350F] hover:bg-[#FEF3C7] transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3 h-3 text-[#B45309] shrink-0" />
        <span>{label || `Plain English: ${concept}`}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={info.title}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-xl border-2 border-[#1C1917] bg-[#FAF8F5] p-4 shadow-xl text-left text-[#1C1917]"
        >
          <div className="flex items-start justify-between gap-2 border-b border-[#DDD6CA] pb-2 mb-2">
            <span className="text-xs font-serif font-bold text-[#111111]">{info.title}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#57534E] hover:text-[#111111] cursor-pointer"
              aria-label="Close explanation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-[#3A3530] font-sans">{info.summary}</p>
        </div>
      )}
    </span>
  );
}
