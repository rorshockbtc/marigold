import React from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import { ArrowLeft, FileText, Download, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Interactive 3D County Map & Checklist | Marigold Mississippi Voter Roll Guide",
  description:
    "Plain-English 3D county map and single-issue filter across all 82 Mississippi counties (2,112,460 Voter Roll records and 25,911,769 verified past ballots, including +835,571 added in 2025–2026). 100% Voter Privacy Safe.",
};

export default function ManifoldPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#111111]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-5 pb-20">
        {/* Top Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-[#111111]">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-2 text-base font-bold text-[#111111] hover:text-[#B45309] bg-white border-2 border-[#111111] px-4 py-2.5 rounded-xl shadow-2xs transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Back to Mississippi Report
            </Link>
            <span className="inline-flex items-center gap-2 text-base font-mono font-bold text-[#0F5132] bg-[#E8F5E9] border border-[#0F5132]/30 px-4 py-2 rounded-full whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              100% Privacy Safe • All 82 Counties • Plain English
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 text-base font-bold text-[#111111] bg-white hover:bg-[#F5F2EB] border-2 border-[#111111] px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#B45309] shrink-0" />
              What&apos;s New
            </Link>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-2 text-base font-bold text-[#111111] bg-white hover:bg-[#F5F2EB] border-2 border-[#111111] px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4 text-[#B45309] shrink-0" />
              Full 82-County Guide
            </Link>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download="Marigold-Mississippi-Playbook-Analysis.pdf"
              className="inline-flex items-center gap-2 text-base font-bold text-white bg-[#111111] hover:bg-[#2A2927] px-4 py-2.5 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-[#F59E0B] shrink-0" />
              Download PDF
            </a>
          </div>
        </div>

        {/* Interactive 3D County Map Explorer (Unlocked by default) */}
        <ThreatManifold3DExplorer forceUnlocked={true} />
      </div>
    </div>
  );
}
