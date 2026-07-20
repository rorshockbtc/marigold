"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ArrowDownUp, ShieldAlert } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function HistoricalDeltaPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>API Reference</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Historical Delta</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md text-sm font-black tracking-widest uppercase">
            POST
          </span>
          <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight text-slate-900">
            /modules/historical-delta
          </h1>
        </div>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mt-4">
          Executes a bi-directional inference on two datasets across time, returning aberration trends and shifts rather than point-in-time anomalies.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <NonTechnicalTranslator 
          title="Bi-Directional Analysis"
          mariContextPrompt="I just read the non-technical translation for Bi-Directional Analysis. Why is it important to see changes over time?"
          technicalContent={
            <>
              <p>
                As outlined in the <strong>-3 Mapping Standard</strong>, Marigold does not archive deep historical payloads in memory. For vendors requiring long-term aberration detection (e.g., comparing a Q1 baseline to a Q4 baseline), you must provide both encrypted vaults.
              </p>
              <p>
                The <code>historical-delta</code> endpoint acts as a bi-directional pipe, calculating the ∆ (delta) shift between <code>vault_a</code> (historical) and <code>vault_b</code> (current).
              </p>
            </>
          }
          eli5Content={
            <p>
              Imagine taking a photo of your garden in the spring, and another photo in the fall. If you only look at the fall photo, you might spot some weeds. But if you compare <i>both</i> photos side-by-side, you can see exactly which plants grew the fastest and which ones died. Marigold's Historical Delta tool does exactly this for data. You send us the old data and the new data, and we tell you exactly what drastically changed between the two. 
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Request Schema"
          mariContextPrompt="I just read the non-technical translation for Request Schema. Why do I need to include a fingerprint with my data?"
          technicalContent={
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-6 not-prose shadow-sm mb-8">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">session_fingerprint</span>
                    <span className="text-[10px] text-slate-500 font-mono">string</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">SHA-256 hash representing this specific delta comparison run.</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">encrypted_vault_a</span>
                    <span className="text-[10px] text-slate-500 font-mono">object</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">The baseline/historical dataset encrypted via AES-GCM.</p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">encrypted_vault_b</span>
                    <span className="text-[10px] text-slate-500 font-mono">object</span>
                    <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">The current dataset encrypted via AES-GCM.</p>
                </div>
              </div>

              <CodeBlock
                language="json"
                title="Delta Request Example"
                code={`{
  "session_fingerprint": "9a8b7c6d5e4f3a...",
  "encrypted_vault_a": {
    "payload": "OLD_DATA_BASE64_CIPHERTEXT"
  },
  "encrypted_vault_b": {
    "payload": "NEW_DATA_BASE64_CIPHERTEXT"
  }
}`}
              />
            </>
          }
          eli5Content={
            <p>
              When you send data to our servers, you need to follow our exact format. It's like mailing a package: you need a return address, a destination address, and the package itself. Here, you are sending us a tracking number (the fingerprint) so we know which request this is, along with two locked boxes (Vault A for the old data, and Vault B for the new data). We do all the heavy lifting using these two boxes.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Response Schema"
          mariContextPrompt="I just read the non-technical translation for Response Schema. What is an aberration velocity?"
          technicalContent={
            <>
              <p>
                The response yields the statistical shifts and aberrant trend lines across the two datasets.
              </p>

              <CodeBlock
                language="json"
                title="Delta Response Example"
                code={`{
  "status": "SUCCESS",
  "delta_metrics": {
    "volume_shift_percentage": "+4.2%",
    "aberration_velocity": "HIGH"
  },
  "flag_deltas": [
    {
      "record_id": "ROW_0001",
      "shift_reason": "SUDDEN_DENSITY_INCREASE",
      "severity": "CRITICAL"
    }
  ]
}`}
              />
            </>
          }
          eli5Content={
            <p>
              When Marigold finishes analyzing the two boxes of data you sent, we send back a report. This report is structured in a very specific way so your computer can read it easily. We tell you the overall trends (like if the amount of problems is suddenly growing very fast) and we give you a specific list of the exact records (like "ROW_0001") that had dramatic, alarming changes since the last time you checked.
            </p>
          }
        />

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/api-reference/detect"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Anomaly Detection
        </Link>
        <Link 
          href="/developers/docs/api-reference/list"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-slate-900 hover:text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Active Modules List
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
