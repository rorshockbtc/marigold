"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Download, FileCode2, Filter } from "lucide-react";
import {
  DynamicCountySummary,
  buildOnePageCountyBriefHtml,
} from "@/lib/data/dynamicCountyAggregator";
import { CountyAudioBriefingButton } from "@/components/CountyAudioBriefingButton";
import { downloadStandaloneOfflineDossier } from "@/lib/datasets/standaloneOfflineHtmlBundle";

const fmt = (n: number) => Math.round(n).toLocaleString();

export function DynamicCountyReviewerSection({
  counties,
  stateCode,
  jurisdictionName,
  totalDatasetRows,
  onFilterPlaybooksByCounty,
}: {
  counties: DynamicCountySummary[];
  stateCode: string;
  jurisdictionName: string;
  totalDatasetRows: number;
  onFilterPlaybooksByCounty?: (countyName: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"priority" | "top25" | "all">("priority");
  const [search, setSearch] = useState("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>(
    counties[0]?.county || ""
  );
  const [copied, setCopied] = useState(false);
  const [bundleNotice, setBundleNotice] = useState<string | null>(null);

  const selected = useMemo(() => {
    return (
      counties.find((c) => c.county === selectedCountyName) ||
      counties[0] ||
      null
    );
  }, [counties, selectedCountyName]);

  const sortedByName = useMemo(
    () => [...counties].sort((a, b) => a.county.localeCompare(b.county)),
    [counties]
  );

  const priorityCount = useMemo(
    () => counties.filter((c) => c.isPriority).length,
    [counties]
  );

  const displayedPills = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return sortedByName.filter((c) => c.county.toLowerCase().includes(q));
    }
    if (viewMode === "priority") {
      const p = counties.filter((c) => c.isPriority);
      return p.length > 0 ? p : counties.slice(0, 25);
    }
    if (viewMode === "top25") {
      return [...counties].sort((a, b) => b.total - a.total).slice(0, 25);
    }
    return sortedByName;
  }, [counties, search, sortedByName, viewMode]);

  if (!selected) return null;

  const stateName =
    stateCode.toUpperCase() === "NC"
      ? "North Carolina"
      : stateCode.toUpperCase() === "MS"
      ? "Mississippi"
      : jurisdictionName || stateCode;

  const authorityLabel =
    stateCode.toUpperCase() === "NC"
      ? "County Boards of Elections"
      : stateCode.toUpperCase() === "MS"
      ? "County Election Commissioners"
      : "County Election Officials";

  const copyBrief = () => {
    const text = [
      `${selected.county} County (${stateName}) — Priority Score ${selected.priorityScore.toFixed(1)}/100 · Cleanliness ${selected.cleanlinessScore}/100`,
      selected.plainEnglishSummary,
      `Metrics: ${fmt(selected.total)} registered voters (${fmt(selected.active)} active, ${fmt(selected.inactive)} inactive); ${fmt(selected.highDensityCount)} high-density addresses (${fmt(selected.highDensityVoters)} voters); ${fmt(selected.ncoaCount)} active out-of-state mailings; ${fmt(selected.duplicateCount)} same-ZIP duplicate name pairs; ${fmt(selected.overCapacityPrecincts)} large precincts (3,000+).`,
    ].join("\n\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handlePrintCountyPdf = () => {
    const w = window.open("", "_blank", "width=960,height=840");
    if (!w) return;
    const html = buildOnePageCountyBriefHtml(selected, {
      stateCode,
      jurisdictionName,
      totalDatasetRows,
    });
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      try {
        w.print();
      } catch {}
    }, 250);
  };

  const handleDownloadOfflineBundle = async () => {
    try {
      const res = await downloadStandaloneOfflineDossier({
        title: `${selected.county} County, ${stateName} — Voter Roll Review`,
        subtitle: `Zero-PII non-partisan audit dossier computed locally inside browser memory across ${fmt(selected.total)} registered voters.`,
        jurisdictionName: `${selected.county} County`,
        stateCode,
        totalRecords: selected.total,
        cleanlinessScore: selected.cleanlinessScore,
        summaryParagraphs: [selected.plainEnglishSummary],
        metrics: [
          {
            label: "Registered Voters",
            valueWithUnit: `${fmt(selected.total)} voters`,
            detail: `${fmt(selected.active)} active · ${fmt(selected.inactive)} inactive (${selected.inactivePct}%)`,
          },
          {
            label: "High-Density (8+)",
            valueWithUnit: `${fmt(selected.highDensityCount)} addresses`,
            detail: `${fmt(selected.highDensityVoters)} voters at high-density parcels`,
          },
          {
            label: "Out-of-State Mailings",
            valueWithUnit: `${fmt(selected.ncoaCount)} active voters`,
            detail: "Requires statutory NVRA confirmation review",
          },
          {
            label: "Same-ZIP Duplicates",
            valueWithUnit: `${fmt(selected.duplicateCount)} pairs`,
            detail: "Suffix-aware Fellegi-Sunter matching",
          },
          {
            label: "Large Precincts (3,000+)",
            valueWithUnit: `${fmt(selected.overCapacityPrecincts)} precincts`,
            detail: `Largest precinct: ${fmt(selected.maxPrecinctVoters)} voters`,
          },
          {
            label: "Split & Sync Checks",
            valueWithUnit: `${fmt(selected.splitPrecincts)} split · ${fmt(selected.inactiveVotedRecent)} inactive-voted`,
            detail: "Voter protection + GIS ballot style verification",
          },
        ],
        actionItems: [
          `Verify why ${fmt(selected.inactiveVotedRecent)} voters with 2024–2026 ballots are marked Inactive in ${selected.county} County.`,
          `Review ${fmt(selected.highDensityCount)} high-density residential addresses (${fmt(selected.highDensityVoters)} voters) for missing unit numbers.`,
          `Process federal NVRA confirmation notices for ${fmt(selected.ncoaCount)} active out-of-state mailings and reconcile ${fmt(selected.duplicateCount)} same-ZIP duplicate name pairs.`,
        ],
      });
      setBundleNotice(`Saved ${res.filename} (SHA-256 ${res.merkleHashHex.slice(0, 12)}…)`);
      setTimeout(() => setBundleNotice(null), 5000);
    } catch (err) {
      setBundleNotice(err instanceof Error ? err.message : "Could not export offline bundle.");
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DDD6CA] pb-4">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#B45309]">
            Workspace Parity · Dynamic County Reviewer ({counties.length} Counties)
          </div>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#111111]">
            Inspect any county dossier &amp; export a 1-page PDF
          </h2>
        </div>
        {bundleNotice && (
          <span className="rounded-lg border border-[#F59E0B]/50 bg-[#FEF3C7] px-3 py-1.5 text-xs font-bold text-[#78350F]">
            {bundleNotice}
          </span>
        )}
      </div>

      {/* Directory Controls */}
      <div className="rounded-2xl border border-[#111111]/20 bg-white p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD6CA] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              ["priority", `Priority Counties (${priorityCount})`],
              ["top25", "Top 25 by Voters"],
              ["all", `All ${counties.length} Counties (A–Z)`],
            ].map(([mode, label]) => {
              const active = viewMode === mode && !search.trim();
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setViewMode(mode as "priority" | "top25" | "all");
                    setSearch("");
                  }}
                  className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#111111] text-white shadow-xs"
                      : "bg-[#F6F3EC] text-[#2C2825] hover:bg-[#EAE4D8]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${counties.length} counties by name…`}
            aria-label="Filter workspace counties by name"
            className="h-10 w-full sm:w-64 rounded-lg border border-[#111111]/25 bg-[#FAF8F5] px-3.5 text-sm font-medium text-[#111111] placeholder:text-[#78716C] focus:border-[#B45309] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 max-h-44 overflow-y-auto pr-1">
          {displayedPills.map((c) => {
            const isCur = selected.county === c.county;
            return (
              <button
                key={c.county}
                type="button"
                onClick={() => setSelectedCountyName(c.county)}
                className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isCur
                    ? "bg-[#111111] text-white"
                    : c.isPriority
                    ? "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/50 hover:bg-[#FDE68A]"
                    : "bg-[#FAF8F5] text-[#2C2825] border border-[#D6D0C4] hover:bg-[#F2ECE1]"
                }`}
              >
                <span>{c.county}</span>
                <span className={`font-mono text-xs ${isCur ? "text-[#FCD34D]" : "text-[#78716C]"}`}>
                  ({fmt(c.total)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected County Dossier */}
      <div className="rounded-2xl border border-[#111111]/20 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col gap-3">
          <label
            htmlFor="explore-county-select"
            className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#5A534A]"
          >
            Selected County Dossier ({counties.length} Counties in Loaded Roll)
          </label>
          <select
            id="explore-county-select"
            value={selected.county}
            onChange={(e) => setSelectedCountyName(e.target.value)}
            className="h-12 w-full rounded-xl border border-[#111111]/25 bg-[#FAF8F5] px-4 text-base font-bold text-[#111111] focus:border-[#B45309] focus:outline-none"
          >
            {sortedByName.map((c) => (
              <option key={c.county} value={c.county}>
                {c.county} County — {fmt(c.total)} registered voters (Priority Score {c.priorityScore.toFixed(1)})
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={copyBrief}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D6D0C4] bg-white px-4 text-sm font-bold text-[#1C1917] hover:bg-[#FAF8F5] cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4 text-[#57534E]" />}
              <span>{copied ? "Copied Briefing" : "Copy Briefing Text"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCountyPdf}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white px-5 text-sm font-bold shadow-xs cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Print / Export 1-Page County PDF</span>
            </button>

            <CountyAudioBriefingButton
              briefingInput={{
                county: selected.county,
                stateName,
                authorityLabel,
                total: selected.total,
                active: selected.active,
                inactive: selected.inactive,
                priorityScore: selected.priorityScore,
                cleanlinessScore: selected.cleanlinessScore,
                statusLabel: selected.statusLabel,
                highDensityCount: selected.highDensityCount,
                highDensityVoters: selected.highDensityVoters,
                ncoaCount: selected.ncoaCount,
                duplicateCount: selected.duplicateCount,
                overCapacityPrecincts: selected.overCapacityPrecincts,
                splitPrecincts: selected.splitPrecincts,
                inactiveVotedRecent: selected.inactiveVotedRecent,
              }}
            />

            <button
              type="button"
              onClick={handleDownloadOfflineBundle}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#1C1917] bg-[#FAF8F5] hover:bg-[#F2ECE1] px-4 text-sm font-bold text-[#1C1917] cursor-pointer"
            >
              <FileCode2 className="h-4 w-4 text-[#B45309]" />
              <span>Offline .html Bundle</span>
            </button>

            {onFilterPlaybooksByCounty && (
              <button
                type="button"
                onClick={() => onFilterPlaybooksByCounty(selected.county)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] px-4 text-sm font-bold cursor-pointer"
              >
                <Filter className="h-4 w-4 text-[#F59E0B]" />
                <span>Filter Playbooks to {selected.county}</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-[#DDD6CA] pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#FEF3C7] border border-[#F59E0B]/50 px-2.5 py-1 text-xs font-bold text-[#92400E]">
              {selected.statusLabel}
            </span>
            <span className="rounded-md bg-[#FAF8F5] border border-[#D6D0C4] px-2.5 py-1 font-mono text-xs font-bold text-[#111111]">
              Priority Score: {selected.priorityScore.toFixed(1)} / 100
            </span>
            <span className="rounded-md bg-[#FAF8F5] border border-[#D6D0C4] px-2.5 py-1 font-mono text-xs font-bold text-[#111111]">
              Cleanliness Score: {selected.cleanlinessScore} / 100
            </span>
          </div>

          <p className="border-l-4 border-[#B45309] bg-[#FAF8F5] p-4 text-sm sm:text-base leading-relaxed text-[#2C2825]">
            <strong>Plain-English Summary:</strong> {selected.plainEnglishSummary}
          </p>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["Registered Voters", `${fmt(selected.total)} voters`, `${fmt(selected.active)} active · ${fmt(selected.inactive)} inactive (${selected.inactivePct}%)`, false],
            ["High-Density (8+)", `${fmt(selected.highDensityCount)} addresses`, `${fmt(selected.highDensityVoters)} voters at residential parcels`, true],
            ["Out-of-State Mailings", `${fmt(selected.ncoaCount)} active voters`, "NVRA interstate mail-notice review", false],
            ["Same-ZIP Duplicates", `${fmt(selected.duplicateCount)} pairs`, `${fmt(selected.activeDuplicateCount)} active–active name pairs`, false],
            ["Large Precincts (3,000+)", `${fmt(selected.overCapacityPrecincts)} precincts`, `Largest precinct: ${fmt(selected.maxPrecinctVoters)} voters`, false],
            ["Split-Ballot Precincts", `${fmt(selected.splitPrecincts)} precincts`, "Multiple legislative districts", false],
            ["Recent-Vote Inactive", `${fmt(selected.inactiveVotedRecent)} voters`, `${fmt(selected.dormantPre2019Active)} pre-2019 dormant active`, true],
            ["Unparsed 911 GIS", `${fmt(selected.unparsedAddressCount)} records`, `${fmt(selected.registrations2026)} new 2026 registrations`, false],
          ].map(([label, val, sub, hi]) => (
            <div key={label as string} className="rounded-xl border border-[#DDD6CA] bg-[#FAF8F5] p-4">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5A534A]">
                {label as string}
              </dt>
              <dd className={`mt-1 font-serif text-xl font-bold ${hi ? "text-[#B45309]" : "text-[#111111]"}`}>
                {val as string}
              </dd>
              <div className="mt-1 text-xs text-[#57534E]">{sub as string}</div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
