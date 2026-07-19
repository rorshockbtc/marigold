import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Map, GitMerge, Archive, Activity } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function VersioningPage() {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Core Infrastructure</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Data Traversal & Versioning</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Data Traversal & Versioning
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          The <strong>-3 Mapping Standard</strong> for managing multi-gigabyte historical updates and maintaining in-memory traversal routes without archiving raw data.
        </p>
      </div>

      <div className="prose prose-slate max-w-none">
        
        <NonTechnicalTranslator 
          title="The -3 Mapping Standard"
          mariContextPrompt="I just read the non-technical translation for the -3 Mapping Standard. Can you explain why Marigold doesn't just save all the historical data itself?"
          technicalContent={
            <>
              <p>
                States like Mississippi frequently release massive voter roll updates (up to 2.5GB). Across a few years, this data velocity will rapidly chew up memory bounds on consumer devices. Marigold is an optimized inference engine—<strong>we are not a historical data analysis tool or a data lake</strong>.
              </p>
              <p>
                To support anomaly tracking across time while remaining lightweight, Marigold strictly enforces a <strong>-3 Voter Roll Mapping</strong> default. This means Marigold will keep the optimized data traversal maps (the pointers and metadata matrices) in memory for the 3 most recently uploaded state files. 
              </p>
            </>
          }
          eli5Content={
            <p>
              Imagine trying to fit 10 years of heavy phone books into your backpack. It would be impossible to carry. That's what happens if we try to force your computer to hold every historical voter roll file. Instead of keeping the actual phone books, Marigold keeps a lightweight "treasure map" that tells us exactly where the data is stored in the 3 most recent phone books. We keep the map, but you (or your data vendor) keep the heavy books. This keeps Marigold incredibly fast and lightweight.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Optimizing for Workflows, Not Storage"
          mariContextPrompt="I just read the non-technical translation for Workflow Optimization. What is the difference between a system of record and an inference router?"
          technicalContent={
            <>
              <p>
                The mapping files are extremely cheap to store compared to the raw JSON blobs. While we could theoretically keep mappings in memory forever, the DAIO vision mandates a query-driven, optimized UX. 
              </p>
              <p>
                By maintaining only the recent -3 mapping states, we ensure that local memory footprint remains minimal. If a partner needs deep historical analysis, they must calculate the delta (∆) locally and utilize our Bi-Directional Delta API to visualize the aberrations. We provide the map; we are not the source of record. That responsibility lies with the user's hard drive or the external vendor's database.
              </p>
            </>
          }
          eli5Content={
            <p>
              Because we don't hold the raw data, our maps are incredibly tiny. We could technically hold thousands of these maps without slowing your computer down. But Marigold is designed to be a fast, laser-focused tool for finding current anomalies, not a dusty archive for ancient history. If you need to look back 10 years, you use a specialized data vendor (like Elly). We optimize for getting things done right now.
            </p>
          }
        />

      </div>
      
      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/cryptography"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Zero-PII Cryptography
        </Link>
        <Link 
          href="/developers/docs/partner-integrations"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Partner Integrations
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
