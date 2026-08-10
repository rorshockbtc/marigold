"use client";

import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export default function PrintSummaryPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // We expect the data to be in localStorage set by the ExportManager
    const stored = localStorage.getItem("marigold_print_data");
    if (stored) {
      setData(JSON.parse(stored));
      // Trigger print after a short delay so fonts and styles load
      setTimeout(() => {
        window.print();
        // Optional: auto-close after printing, but users might want to save to PDF
      }, 800);
    }
  }, []);

  if (!data) return <div className="p-8 font-sans">Loading report data...</div>;

  return (
    <div className="bg-white min-h-screen text-[#4A352F] p-12 max-w-4xl mx-auto print:p-0 print:max-w-none font-sans">
      <div className="border-b-2 border-[#E8E2D5] pb-8 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-[#4A352F] mb-2">{data.title}</h1>
          <p className="text-xl text-[#7C665F] font-light">Marigold Executive Summary</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#7C665F] mb-1">Generated</p>
          <p className="text-lg text-[#4A352F]">{data.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="bg-[#FDFBF7] p-6 rounded-lg border border-[#E8E2D5]">
          <h2 className="text-sm font-semibold text-[#7C665F] uppercase tracking-wider mb-2">Scope of Audit</h2>
          <p className="text-lg text-[#4A352F] leading-relaxed">{data.description}</p>
        </div>
        <div className="bg-[#FDFBF7] p-6 rounded-lg border border-[#E8E2D5]">
          <h2 className="text-sm font-semibold text-[#7C665F] uppercase tracking-wider mb-2">Records Flagged</h2>
          <p className="text-4xl font-serif text-[#4A352F]">{data.recordCount.toLocaleString()}</p>
          <p className="text-sm text-[#7C665F] mt-2">Requires manual verification</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-serif text-[#4A352F] mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-600" />
          AI Forensic Insights
        </h2>
        <div className="prose prose-stone prose-lg max-w-none text-[#4A352F] bg-white p-8 rounded-lg border border-[#E8E2D5] shadow-sm">
          {data.insights ? (
            <p className="leading-relaxed whitespace-pre-wrap">{data.insights}</p>
          ) : (
            <p className="italic text-[#7C665F]">No specific AI insights generated for this dataset.</p>
          )}
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-[#E8E2D5] text-center text-[#7C665F]">
        <p className="text-sm font-semibold uppercase tracking-wider mb-2">Marigold Insights | Local Compute Pipeline</p>
        <p className="text-xs">Generated securely via air-gapped browser RAM. Zero PII transmitted to cloud servers.</p>
      </div>

      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 1in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
        }
      `}} />
    </div>
  );
}
