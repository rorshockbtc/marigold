import React from 'react';
import MacroTrendsViewer from '@/components/MacroTrendsViewer';
import { Activity, ShieldCheck, HardDrive } from 'lucide-react';

export default function MacroAnalysisPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider w-fit">
            <Activity className="w-3.5 h-3.5" />
            Macro Analysis Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            Statewide Macro Trends
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Go beyond individual voter row anomalies. Ingest state-level aggregated data files to track massive registration spikes, partisan shifts, and massive purge events across entire counties over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
            <HardDrive className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-semibold text-white">100% Client-Side Parsing</h3>
            <p className="text-sm text-gray-400 mt-2">Even massive multi-sheet Excel aggregates are parsed directly in your browser. No data ever touches our servers.</p>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
            <Activity className="w-6 h-6 text-pink-400 mb-3" />
            <h3 className="font-semibold text-white">Automated Schema Detection</h3>
            <p className="text-sm text-gray-400 mt-2">Florida Fair Elections and other formats are automatically normalized into clean time-series datasets instantly.</p>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white">Irrefutable Artifacts</h3>
            <p className="text-sm text-gray-400 mt-2">Visually expose extreme purges and unexplainable data deltas. Ready for immediate PDF export for legislative review.</p>
          </div>
        </div>

        {/* The generalized macro viewer */}
        <MacroTrendsViewer />
      </main>
    </div>
  );
}
