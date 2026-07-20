"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Terminal, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function DetectEndpointPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResponse, setSimResponse] = useState<string | null>(null);

  const handleTestEndpoint = () => {
    setIsSimulating(true);
    setSimResponse(null);
    setTimeout(() => {
      setSimResponse(JSON.stringify({
        status: "SUCCESS",
        anomalies_found: 2,
        execution_time_ms: 14,
        flags: [
          { record_id: "ROW_99182", flag_reason: "HIGH_DENSITY_RESIDENCE", severity: "HIGH" },
          { record_id: "ROW_10291", flag_reason: "NCOA_MISMATCH", severity: "MEDIUM" }
        ]
      }, null, 2));
      setIsSimulating(false);
    }, 400); // Super fast local execution simulation
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>API Reference</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Anomaly Detection</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md text-sm font-black tracking-widest uppercase">
            LOCAL
          </span>
          <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight text-slate-900">
            engine.detect()
          </h1>
        </div>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mt-4">
          Executes the core algorithmic engine against a local array of records. Because this runs entirely in memory, you do not need to encrypt the payload before passing it to this function.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left Column: Schema Docs */}
        <div className="lg:col-span-3 space-y-12">
          <div className="prose prose-slate prose-emerald max-w-none">

            <NonTechnicalTranslator 
              title="Function Parameters and Return Type"
              mariContextPrompt="I just read the non-technical translation for Parameters. Why is this easier than a REST API?"
              technicalContent={
                <>
                  <h2>Parameters</h2>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-6 not-prose shadow-sm mb-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                         <span className="font-mono text-slate-900 font-bold">dataset</span>
                         <span className="text-[10px] text-slate-500 font-mono">Array&lt;Object&gt;</span>
                         <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">An array of Javascript objects representing your rows. No encryption required; data remains in local heap.</p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">options.anomalyType</span>
                        <span className="text-[10px] text-slate-500 font-mono">AnomalyType (enum)</span>
                        <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Available values: <code>HIGH_DENSITY</code>, <code>NCOA_MISMATCH</code>, <code>FUZZY_DUPLICATE</code></p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">options.threads</span>
                        <span className="text-[10px] text-slate-500 font-mono">number | 'auto'</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Number of background workers to spawn. Defaults to single-threaded.</p>
                    </div>
                  </div>

                  <h2>Return Object</h2>
                  <p>The function returns synchronously (unless multithreaded) with the following structure:</p>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-6 not-prose shadow-sm mb-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">status</span>
                        <span className="text-[10px] text-slate-500 font-mono">string</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Returns <code>SUCCESS</code>.</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">anomalies_found</span>
                        <span className="text-[10px] text-slate-500 font-mono">integer</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Total count of rows that failed the algorithmic proof.</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">execution_time_ms</span>
                        <span className="text-[10px] text-slate-500 font-mono">number</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Time taken to process the dataset locally.</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-bold">flags</span>
                        <span className="text-[10px] text-slate-500 font-mono">Array&lt;Object&gt;</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Contains <code>record_id</code>, <code>flag_reason</code>, and <code>severity</code>.</p>
                    </div>
                  </div>
                </>
              }
              eli5Content={
                <p>
                  This explains exactly what you have to give the system (a list of your records, and what type of problem you're looking for) and what the system gives you back (a report of how many issues it found and how fast it did the math). Because it happens entirely inside your own computer's memory, you don't have to deal with complicated internet networking or passwords.
                </p>
              }
            />
          </div>
        </div>

        {/* Right Column: Interactive Sandbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl sticky top-6">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Terminal className="w-4 h-4" />
                <span>Local JS Execution Sandbox</span>
              </div>
              <button 
                onClick={handleTestEndpoint}
                disabled={isSimulating}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSimulating ? <Play className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
                {isSimulating ? "RUNNING..." : "RUN LOCALLY"}
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Node.js Input</span>
                <CodeBlock
                  language="typescript"
                  code={`const data = [...]; // 10,000 rows
                  
const results = engine.detect(data, {
  anomalyType: "HIGH_DENSITY"
});`}
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Local Output</span>
                <div className="bg-white shadow-inner h-56 rounded-xl border border-slate-300 overflow-y-auto p-4 relative">
                  {!simResponse && !isSimulating && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600 font-mono">
                      Click "RUN LOCALLY" to execute WASM
                    </div>
                  )}
                  {isSimulating && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-emerald-500 font-mono">
                      <Terminal className="w-4 h-4 animate-bounce" />
                      Crunching arrays...
                    </div>
                  )}
                  {simResponse && (
                    <CodeBlock language="json" code={simResponse} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              Notice the incredible speed. By running this strictly on your local CPU without making network roundtrips, the algorithm executes in a fraction of a second.
            </p>
          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/algorithms/fellegi-sunter"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Fellegi-Sunter Algorithm
        </Link>
        <Link 
          href="/developers/docs/errors"
          className="bg-slate-50 border border-slate-200 text-slate-900 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm group"
        >
          <span className="group-hover:text-white">Next: Error Codes Dictionary</span>
          <ChevronRight className="w-4 h-4 group-hover:text-white" />
        </Link>
      </div>

    </div>
  );
}
