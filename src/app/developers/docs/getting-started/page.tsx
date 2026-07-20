"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ShieldCheck, Cpu } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

export default function GettingStartedPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Getting Started</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Quickstart Guide</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Quickstart Guide
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Set up your local environment, install the core algorithms, and conduct your very first civic data audit using the Marigold Local Compute standard.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        <NonTechnicalTranslator 
          title="Prerequisites & True Zero-Cloud Architecture"
          mariContextPrompt="I just read the non-technical translation for Prerequisites. Can you explain why running it locally is better than a cloud API?"
          technicalContent={
            <>
              <p>
                Unlike traditional monolithic architecture, Marigold Insights strictly enforces a <strong>Zero-Cloud, 100% Local Compute</strong> model. We do not expose a REST API for data ingestion, because we refuse to accept your sensitive civic data over the wire.
              </p>
              <ul>
                <li><strong>Runtime Requirements:</strong> You must have Node.js 18+ or a compatible edge runtime (e.g., Cloudflare Workers, Next.js Edge, Bun).</li>
                <li><strong>No Network Egress:</strong> Our NPM package executes entirely in your local process using WebAssembly (WASM) and heavily optimized JavaScript. Your data never leaves your infrastructure.</li>
                <li><strong>Open Standards:</strong> The core algorithms (Fellegi-Sunter, NCOA anomaly heuristics) are fully open-source and auditable.</li>
              </ul>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 my-8 not-prose">
                <h4 className="text-emerald-900 font-bold mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  The Zero-PII Guarantee
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Because everything runs locally, you do not need to hash, salt, or encrypt your Personally Identifiable Information (PII) before analysis. You process the plaintext data directly in your own secure RAM, and the library outputs the flags. No rate limits, no network latency, no data breaches.
                </p>
              </div>
            </>
          }
          eli5Content={
            <p>
              Most tech companies ask you to upload your sensitive spreadsheets to their "cloud" so they can do the math. We think that's a terrible idea for election data. Instead, we give you the math formula to download directly to your own computer. Because you never send us your data, you never have to worry about hackers stealing it from us. It is 100% safe on your desk.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 1: Installing the Core Engine"
          mariContextPrompt="I just read the non-technical translation for Step 1. What exactly does npm install do?"
          technicalContent={
            <>
              <p>
                To get started, install the <code>@marigold/local-core</code> package into your project. We provide TypeScript definitions out of the box for strict type safety.
              </p>

              <CodeBlock
                language="bash"
                title="Terminal"
                code={`# Install the Marigold Local Compute Engine
npm install @marigold/local-core

# If you are using TypeScript, types are included automatically.`}
              />
            </>
          }
          eli5Content={
            <p>
              The first step is downloading the Marigold "engine" onto your computer. Think of it like installing an app on your phone, except programmers do it using a command line. Once it's downloaded, it lives safely on your machine.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 2: Running Your First Audit"
          mariContextPrompt="I just read the non-technical translation for Step 2. Why is running it in memory so fast?"
          technicalContent={
            <>
              <p>
                Because Marigold operates entirely in your local process, there is no need to chunk payloads, implement exponential backoffs, or manage REST API tokens. You simply pass your dataset array into the engine.
              </p>

              <CodeBlock
                language="typescript"
                title="audit.ts"
                code={`import { MarigoldEngine, AnomalyType } from '@marigold/local-core';

// Initialize the local engine
const engine = new MarigoldEngine();

// Your local, plaintext dataset (never leaves your RAM)
const localDataset = [
  { id: "ROW_001", address: "123 Main St", density_code: "APT" },
  { id: "ROW_002", address: "123 Main St", density_code: "APT" }
];

// Execute the audit locally (Synchronous or Async)
const results = engine.detect(localDataset, {
  anomalyType: AnomalyType.HIGH_DENSITY
});

console.log(\`Found \${results.anomalies_found} issues.\`);
console.log(results.flags);`}
              />
            </>
          }
          eli5Content={
            <p>
              Now you just feed your spreadsheet into the engine you downloaded. Because it's happening right on your computer's memory (RAM), it is incredibly fast. You don't have to worry about internet connections dropping or servers crashing. It just works, instantly.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Step 3: Scaling Locally"
          mariContextPrompt="I just read the non-technical translation for Step 3. What does it mean to use Web Workers?"
          technicalContent={
            <>
              <p>
                Civic datasets can exceed 10 million rows. While our engine is highly optimized (capable of evaluating ~500k rows/second on a standard M1 Macbook), analyzing massive datasets on a single thread will block the Node.js event loop or the browser UI.
              </p>
              
              <p>
                We strongly recommend the <strong>Web Worker Strategy</strong> for browser implementations, or <strong>Worker Threads</strong> in Node.js.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8 not-prose">
                <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Multithreading Support
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  The <code>@marigold/local-core</code> package includes a pre-compiled WebAssembly (WASM) multithreading module. If you pass <code>{`{ threads: 'auto' }`}</code> to the engine configuration, it will automatically spawn background workers based on your machine's CPU cores, parallelizing the workload without blocking your main UI.
                </p>
              </div>
            </>
          }
          eli5Content={
            <p>
              If your state has millions of voters, asking your computer to read them all at once might make it freeze for a few seconds. To prevent this, Marigold is smart enough to split the work across all the different "brains" (CPU cores) inside your computer. It does the heavy lifting in the background so your screen stays smooth and responsive.
            </p>
          }
        />

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Introduction
        </Link>
        <Link 
          href="/developers/docs/authentication"
          className="bg-slate-50 border border-slate-200 text-slate-900 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm group"
        >
          <span className="group-hover:text-white">Next: Authentication (Optional)</span>
          <ChevronRight className="w-4 h-4 group-hover:text-white" />
        </Link>
      </div>

    </div>
  );
}
