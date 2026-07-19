"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Terminal, Play, Lock, AlertTriangle, Layers } from "lucide-react";

export default function DetectEndpointPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResponse, setSimResponse] = useState<string | null>(null);

  const handleTestEndpoint = () => {
    setIsSimulating(true);
    setSimResponse(null);
    setTimeout(() => {
      setSimResponse(JSON.stringify({
        status: "SUCCESS",
        anomalies_found: 12,
        flags: [
          { record_id: "ROW_99182", flag_reason: "HIGH_DENSITY_RESIDENCE", severity: "HIGH" },
          { record_id: "ROW_10291", flag_reason: "NCOA_MISMATCH", severity: "MEDIUM" }
        ]
      }, null, 2));
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>API Reference</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Anomaly Detection</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md text-sm font-black tracking-widest uppercase">
            POST
          </span>
          <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight text-slate-900">
            /modules/anomalies/detect
          </h1>
        </div>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mt-4">
          Submits an encrypted algorithmic payload to detect civic anomalies. This is the primary workhorse endpoint for the Marigold architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left Column: Schema Docs */}
        <div className="lg:col-span-3 space-y-12">
          <div className="prose prose-slate prose-emerald max-w-none">
            <h2>Headers</h2>
            <p>You must authenticate this request using your institutional Bearer token.</p>
            <table className="min-w-full border-collapse text-sm not-prose mb-8">
              <tbody className="divide-y divide-slate-100 border-y border-slate-200">
                <tr>
                  <td className="py-3 pr-4 font-mono font-bold text-slate-900">Authorization</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-xs">string</td>
                  <td className="py-3 px-4 text-slate-600">Bearer <code>mg_live_...</code></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono font-bold text-slate-900">Content-Type</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-xs">string</td>
                  <td className="py-3 px-4 text-slate-600">Must be <code>application/json</code></td>
                </tr>
              </tbody>
            </table>

            <h2>Request Body Schema</h2>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm space-y-6 not-prose shadow-sm mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 font-bold">session_fingerprint</span>
                  <span className="text-[10px] text-slate-500 font-mono">string</span>
                  <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                </div>
                <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">SHA-256 hash of the dataset batch. Used for idempotency and replay protection.</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 font-bold">anomaly_type</span>
                  <span className="text-[10px] text-slate-500 font-mono">string (enum)</span>
                  <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                </div>
                <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Available values: <code>HIGH_DENSITY</code>, <code>NCOA_MISMATCH</code>, <code>FUZZY_DUPLICATE</code></p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 font-bold">record_identifiers</span>
                  <span className="text-[10px] text-slate-500 font-mono">array of strings</span>
                </div>
                <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Strict array of non-PII Row IDs you are scanning.</p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-900 font-bold">encrypted_vault.payload</span>
                  <span className="text-[10px] text-slate-500 font-mono">string</span>
                  <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 rounded uppercase font-black">Required</span>
                </div>
                <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Base64 encoded AES-GCM output (Nonce + CipherText + AuthTag).</p>
              </div>
            </div>

            <h2>Response Schema</h2>
            <p>A successful <code>200 OK</code> returns the following structure:</p>
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
                  <span className="font-mono text-slate-900 font-bold">flags</span>
                  <span className="text-[10px] text-slate-500 font-mono">array of objects</span>
                </div>
                <p className="text-xs text-slate-600 pl-4 border-l-2 border-slate-200 ml-2">Contains <code>record_id</code>, <code>flag_reason</code>, and <code>severity</code> (LOW/MEDIUM/HIGH/CRITICAL).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Sandbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl sticky top-6">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Terminal className="w-4 h-4" />
                <span>Interactive Sandbox</span>
              </div>
              <button 
                onClick={handleTestEndpoint}
                disabled={isSimulating}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSimulating ? <Lock className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
                {isSimulating ? "EXECUTING..." : "SEND REQUEST"}
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Payload Request</span>
                <pre className="bg-black/50 p-4 rounded-xl border border-slate-800/60 text-xs font-mono text-emerald-300 overflow-x-auto">
{`{
  "session_fingerprint": "e3b0c4429...",
  "anomaly_type": "HIGH_DENSITY",
  "encrypted_vault": {
    "payload": "8f9a0b1c2d3e4f5a6b7c..."
  }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Response</span>
                <div className="bg-black/50 h-56 rounded-xl border border-slate-800/60 overflow-y-auto p-4 relative">
                  {!simResponse && !isSimulating && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600 font-mono">
                      Click "SEND REQUEST" to test endpoint
                    </div>
                  )}
                  {isSimulating && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-emerald-500 font-mono">
                      <Terminal className="w-4 h-4 animate-bounce" />
                      Awaiting server response...
                    </div>
                  )}
                  {simResponse && (
                    <pre className="text-xs font-mono text-slate-300">
                      {simResponse}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              This sandbox uses deterministic synthetic outputs to prevent PII leakage. Production endpoints require a valid Bearer token and AES-GCM encrypted payload.
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
          className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Error Codes Dictionary
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
