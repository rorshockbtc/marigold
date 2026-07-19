"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Package, Terminal, ShieldCheck } from "lucide-react";

export default function SDKsPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Getting Started</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Official SDKs</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Official SDKs
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Do not write raw cryptographic buffers if you don't have to. Our official SDKs automatically handle AES-256-GCM encryption, IV nonce generation, and strict Auth Tag validation locally on your servers.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <h2>Node.js / TypeScript SDK</h2>
        <p>
          The official Node.js SDK is strictly typed and built on top of the native <code>node:crypto</code> module. It requires Node v20+ for optimal AES-GCM performance.
        </p>

        <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-6 shadow-sm">
<code>{`npm install @marigold/node-sdk`}</code>
        </pre>

        <h3>Basic Ingestion Example</h3>
        <p>
          Notice how you never have to interact with Base64 payloads or Buffer concatenation. The SDK abstracts the Zero-PII liability completely.
        </p>

        <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed my-6 shadow-sm">
<code>{`import { MarigoldClient } from '@marigold/node-sdk';

// Initialize the client. The Master Key NEVER leaves your server.
const marigold = new MarigoldClient({
  bearerToken: process.env.MARIGOLD_BEARER,
  localMasterKey: process.env.MARIGOLD_MASTER_KEY // Must be 32 bytes
});

async function runAudit() {
  const myDatasetIds = ["ROW_101", "ROW_102", "ROW_103"];

  try {
    // The SDK automatically encrypts the dataset, generates the Session Fingerprint,
    // transmits the payload, and decrypts the resulting flags seamlessly.
    const results = await marigold.anomalies.detect({
      type: "HIGH_DENSITY",
      identifiers: myDatasetIds
    });

    console.log(\`Found \${results.anomaliesFound} anomalies.\`);
    console.log(results.flags); // Decrypted flags ready for your database
    
  } catch (error) {
    if (error.code === 'ERR_RATE_LIMIT_EXCEEDED') {
       // The SDK handles exponential backoff automatically if configured
    }
  }
}
`}</code>
        </pre>

        <h2>.NET / C# SDK</h2>
        <p>
          For state agencies relying on monolithic Microsoft infrastructure, we publish a highly-optimized NuGet package utilizing <code>System.Security.Cryptography.AesGcm</code>.
        </p>

        <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-6 shadow-sm">
<code>{`dotnet add package Marigold.Net`}</code>
        </pre>

        <h2>Python SDK (Data Science & Pandas)</h2>
        <p>
          Data Scientists and Data Engineers frequently use Python to parse raw civic CSVs using Pandas or Apache Spark. Our official Python SDK natively hooks into the <code>cryptography</code> library for C-optimized AES-GCM encryption, ensuring massive datasets are encrypted efficiently before leaving your Jupyter notebook or ETL pipeline.
        </p>

        <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-6 shadow-sm">
<code>{`pip install marigold-sdk`}</code>
        </pre>

        <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed my-6 shadow-sm">
<code>{`import marigold
import pandas as pd

# Marigold abstracts the complex AES-GCM cryptography
client = marigold.Client(api_key="...", master_key="...")

# Easily pipe your Pandas dataframes into the detection engine
df = pd.read_csv("state_voter_roll.csv")
results = client.detect_anomalies(df, module="HIGH_DENSITY")
`}</code>
        </pre>

        <h2>Go (Golang) SDK</h2>
        <p>
          For modern, high-throughput civic microservices requiring massive concurrency, we provide a Go package leveraging the standard library's <code>crypto/aes</code> and <code>crypto/cipher</code> packages.
        </p>

        <pre className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed my-6 shadow-sm">
<code>{`go get github.com/marigold/marigold-go`}</code>
        </pre>

        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl my-8 not-prose flex items-start gap-4 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-emerald-900 mb-1">SOC 2 Liability Shield</h4>
            <p className="text-sm text-emerald-800 leading-relaxed">
              By utilizing the official SDKs, you are shielded from cryptographic implementation liability during third-party SOC 2 Type II audits. The SDK binaries are open-source, deterministically compiled, and audited quarterly by external cryptographers.
            </p>
          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/getting-started"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Quickstart
        </Link>
        <Link 
          href="/developers/docs/authentication"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Authentication
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
