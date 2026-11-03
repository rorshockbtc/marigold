import React from "react";
import Link from "next/link";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import { ArrowLeft, FileText, Download, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Interactive 3D County Map & Checklist | Marigold Mississippi Voter Roll Guide",
  description:
    "Plain-English 3D county map and single-issue filter across all 82 Mississippi counties (2,112,460 Voter Roll records and 25,911,640 past ballots). 100% Voter Privacy Safe.",
};

export default function ManifoldPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#111111]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-4 pb-20">
        {/* Top Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-[#111111]">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-[#D9381E] bg-white border border-[#111111] px-3.5 py-2 rounded-lg shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Full Mississippi Report
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0F5132] bg-[#E8F5E9] border border-[#0F5132]/30 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Privacy Safe • All 82 Counties • Written in Plain English
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/updates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] bg-white hover:bg-[#F5F2EB] border border-[#111111] px-3.5 py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9381E]" />
              What&apos;s New (Plain-English Post)
            </Link>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111111] bg-white hover:bg-[#F5F2EB] border border-[#111111] px-3.5 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#D9381E]" />
              Full 82-County Guide
            </Link>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download="Marigold-Mississippi-Playbook-Analysis.pdf"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#111111] hover:bg-[#2A2927] px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
              Download Printable PDF
            </a>
          </div>
        </div>

        {/* Interactive 3D County Map Explorer (Unlocked by default) */}
        <ThreatManifold3DExplorer forceUnlocked={true} />
      </div>
    </div>
  );
}
