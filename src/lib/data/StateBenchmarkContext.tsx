"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import msAudit from "@/data/mississippi_audit_results.json";
import ncAudit from "@/data/north_carolina_audit_results.json";

export type BenchmarkStateCode = "MS" | "NC";

export interface StateMetaConfig {
  code: BenchmarkStateCode;
  name: string;
  shortLabel: string;
  countiesCount: number;
  totalCounties: number;
  defaultCounty: string;
  extractDateLabel: string;
  pdfUrl: string;
  authorityLabel: string;
  authorityCitation: string;
  statutoryAuthorityNote: string;
  auditData: typeof msAudit;
}

export const STATE_BENCHMARKS: Record<BenchmarkStateCode, StateMetaConfig> = {
  MS: {
    code: "MS",
    name: "Mississippi",
    shortLabel: "Mississippi (82 Counties)",
    countiesCount: 82,
    totalCounties: 82,
    defaultCounty: "Hinds",
    extractDateLabel: "October 26, 2026",
    pdfUrl: "/Marigold-Mississippi-Playbook-Analysis.pdf",
    authorityLabel: "County Election Commissioners",
    authorityCitation: "Miss. Code Ann. § 23-15-153",
    statutoryAuthorityNote:
      "Under Mississippi law (Miss. Code Ann. § 23-15-153), County Election Commissioners — not county clerks — hold statutory authority to maintain and remove records from the voter rolls.",
    auditData: msAudit,
  },
  NC: {
    code: "NC",
    name: "North Carolina",
    shortLabel: "North Carolina (100 Counties)",
    countiesCount: 100,
    totalCounties: 100,
    defaultCounty: "Wake",
    extractDateLabel: "November 1, 2026",
    pdfUrl: "/Marigold-North-Carolina-Playbook-Analysis.pdf",
    authorityLabel: "County Boards of Elections",
    authorityCitation: "N.C. Gen. Stat. § 163-82.14",
    statutoryAuthorityNote:
      "Under North Carolina law (N.C. Gen. Stat. § 163-82.14), County Boards of Elections and Election Commissioners hold statutory authority to conduct list maintenance and send NVRA confirmation mailings.",
    auditData: ncAudit as unknown as typeof msAudit,
  },
};

interface StateBenchmarkContextValue {
  activeState: BenchmarkStateCode;
  setActiveState: (st: BenchmarkStateCode) => void;
  stateConfig: StateMetaConfig;
  auditData: typeof msAudit;
}

const StateBenchmarkContext = createContext<StateBenchmarkContextValue>({
  activeState: "MS",
  setActiveState: () => {},
  stateConfig: STATE_BENCHMARKS.MS,
  auditData: msAudit,
});

export function StateBenchmarkProvider({ children }: { children: React.ReactNode }) {
  const [activeState, setActiveStateInternal] = useState<BenchmarkStateCode>("MS");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlState = params.get("state")?.toUpperCase();
    if (urlState === "NC" || urlState === "MS") {
      setActiveStateInternal(urlState);
      localStorage.setItem("marigold_benchmark_state", urlState);
      return;
    }
    const saved = localStorage.getItem("marigold_benchmark_state")?.toUpperCase();
    if (saved === "NC" || saved === "MS") {
      setActiveStateInternal(saved);
    }
  }, []);

  const setActiveState = (st: BenchmarkStateCode) => {
    setActiveStateInternal(st);
    if (typeof window !== "undefined") {
      localStorage.setItem("marigold_benchmark_state", st);
    }
  };

  const stateConfig = STATE_BENCHMARKS[activeState];

  return (
    <StateBenchmarkContext.Provider
      value={{
        activeState,
        setActiveState,
        stateConfig,
        auditData: stateConfig.auditData,
      }}
    >
      {children}
    </StateBenchmarkContext.Provider>
  );
}

export function useStateBenchmark() {
  return useContext(StateBenchmarkContext);
}

export function StateSwitcherPill({
  activeState: propActiveState,
  onSelectState,
  variant = "light",
  compact = false,
}: {
  activeState?: BenchmarkStateCode;
  onSelectState?: (st: BenchmarkStateCode) => void;
  variant?: "light" | "dark" | "compact";
  compact?: boolean;
}) {
  const ctx = useStateBenchmark();
  const activeState = propActiveState ?? ctx.activeState;
  const handleSelect = onSelectState ?? ctx.setActiveState;
  const isCompact = compact || variant === "compact";

  return (
    <div
      className={`inline-flex items-center rounded-xl p-1 border ${
        variant === "dark"
          ? "bg-stone-900 border-stone-700"
          : "bg-[#EFEAE0] border-[#111111]/25"
      }`}
      role="group"
      aria-label="Select State Voter Roll Benchmark"
    >
      {(["MS", "NC"] as BenchmarkStateCode[]).map((code) => {
        const cfg = STATE_BENCHMARKS[code];
        const isCurrent = activeState === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => handleSelect(code)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              isCurrent
                ? "bg-[#111111] text-white shadow-xs"
                : variant === "dark"
                ? "text-stone-300 hover:text-white"
                : "text-[#2C2825] hover:bg-white/60"
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${isCurrent ? "bg-[#F59E0B]" : "bg-stone-400"}`} />
            <span>{isCompact ? `${cfg.name} (${cfg.countiesCount})` : cfg.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
