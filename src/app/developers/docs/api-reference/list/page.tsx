"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Blocks, Code2 } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function ActiveModulesPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>API Reference</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Active Modules List</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-md text-sm font-black tracking-widest uppercase">
            GET
          </span>
          <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight text-slate-900">
            /modules/list
          </h1>
        </div>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mt-4">
          Retrieves the active, compiled algorithmic modules available to your specific SOC 2 compliance tier.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        <NonTechnicalTranslator 
          title="Endpoint Mechanics"
          mariContextPrompt="I just read the non-technical translation for Endpoint Mechanics. What is a statistical module in this context?"
          technicalContent={
            <>
              <p>
                Unlike the <code>detect</code> endpoint, <code>/modules/list</code> does not require an AES-GCM encrypted payload because it does not process any citizen identities. It simply returns the string enums required to populate the <code>anomaly_type</code> field in your future POST requests.
              </p>
            </>
          }
          eli5Content={
            <p>
              Before a government agency can ask Marigold to check for anomalies, they need to know what <i>types</i> of anomalies Marigold is currently looking for. This page is like a menu at a restaurant. Instead of sending us private data, you just ping this address and say, "Can I see the menu?" We reply with a list of all the different algorithms we are currently running today, like finding duplicate addresses or looking for strange spikes in birthdates.
            </p>
          }
        />

        <CodeBlock
          language="bash"
          title="List Modules Request"
          code={`curl -X GET https://api.marigoldinsights.org/v1/modules/list \\
  -H "Authorization: Bearer mg_live_..."`}
        />

        <h2>Response Schema</h2>
        <p>
          The response is a flat JSON array of strings. You should cache this response locally (e.g. Redis) and refresh it every 24 hours, as we routinely deploy new statistical modules over the air.
        </p>

        <CodeBlock
          language="json"
          title="JSON Response"
          code={`[
  "HIGH_DENSITY",
  "NCOA_MISMATCH",
  "FUZZY_DUPLICATE",
  "DOB_SPIKE",
  "COMMERCIAL_ZONING",
  "PO_BOX_RESIDENCE"
]`}
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
          href="/developers/docs/errors"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Error Codes Dictionary
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
