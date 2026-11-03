import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import ThreatManifold3DExplorer from "@/components/ThreatManifold3DExplorer";
import { ArrowLeft, FileText, Download, ShieldCheck, Compass } from "lucide-react";

export const metadata = {
  title: "3D Threat Manifold & Variable Isolation | Marigold Mississippi Election Audit",
  description:
    "Interactive Three.js 3D geometric manifold and variable isolation explorer across all 82 Mississippi counties (2,112,460 Voter Roll records and 25,911,640 Voting History records). 100% Zero-PII.",
};

export default function ManifoldPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Top Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-3">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-[#E5E0D8] px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Mississippi Playbook Report
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-PII • 82 Counties • 28.02M Total Records
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-xl"
            >
              <FileText className="w-3.5 h-3.5 text-amber-800" />
              Read Full Editorial Report
            </Link>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Download Printable PDF
            </a>
          </div>
        </div>

        {/* Interactive Three.js 3D Manifold Explorer */}
        <ThreatManifold3DExplorer />
      </main>
    </div>
  );
}
