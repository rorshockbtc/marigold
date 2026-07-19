"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Package, Terminal, ShieldCheck } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";
import { CodeBlock } from "@/components/CodeBlock";

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
        
        <NonTechnicalTranslator 
          title="Node.js / TypeScript SDK"
          mariContextPrompt="I just read the non-technical translation for the Node.js SDK. What exactly is a 'Lego block' in software?"
          technicalContent={
            <>
              <p>
                The official Node.js SDK is strictly typed and built on top of the native <code>node:crypto</code> module. It requires Node v20+ for optimal AES-GCM performance.
              </p>
              <CodeBlock language="bash" code={`npm install @marigold/node-sdk`} />
              <h3>Basic Ingestion Example</h3>
              <p>
                Notice how you never have to interact with Base64 payloads or Buffer concatenation. The SDK abstracts the Zero-PII liability completely.
              </p>
              <CodeBlock language="typescript" title="Node.js Integration" code={`import { MarigoldClient } from '@marigold/node-sdk';

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
}`} />
            </>
          }
          eli5Content={
            <p>
              Node.js is a popular way for websites to do heavy lifting in the background. Think of our Node SDK like a pre-built Lego set. Instead of figuring out how to build a complex security lock from scratch to protect citizen data, a developer just snaps our pre-made Lego block into their website. We automatically lock up all the names and addresses for them so nobody can steal them.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title=".NET / C# SDK"
          mariContextPrompt="I just read the non-technical translation for the .NET / C# SDK. How does a state government use Microsoft systems to securely talk to Marigold?"
          technicalContent={
            <>
              <p>
                For state agencies relying on monolithic Microsoft infrastructure, we publish a highly-optimized NuGet package utilizing <code>System.Security.Cryptography.AesGcm</code>.
              </p>
              <CodeBlock language="bash" code={`dotnet add package Marigold.Net`} />
            </>
          }
          eli5Content={
            <p>
              C# is a computer language built by Microsoft, and it is mostly used by large, older state governments. Our C# tool works like a magical shredder and translator. When a state agency wants to send us a list of voters to check for problems, they run the list through our tool first. It turns the voters' private information into secret, unbreakable codes <i>before</i> the data ever leaves the government's building. 
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Python SDK (Data Science & Pandas)"
          mariContextPrompt="I just read the non-technical translation for the Python SDK. How do data scientists use spreadsheets securely?"
          technicalContent={
            <>
              <p>
                Data Scientists and Data Engineers frequently use Python to parse raw civic CSVs using Pandas or Apache Spark. Our official Python SDK natively hooks into the <code>cryptography</code> library for C-optimized AES-GCM encryption, ensuring massive datasets are encrypted efficiently before leaving your Jupyter notebook or ETL pipeline.
              </p>
              <CodeBlock language="bash" code={`pip install marigold-sdk`} />
              <CodeBlock language="python" title="Python Data Pipeline" code={`import marigold
import pandas as pd

# Marigold abstracts the complex AES-GCM cryptography
client = marigold.Client(api_key="...", master_key="...")

# Easily pipe your Pandas dataframes into the detection engine
df = pd.read_csv("state_voter_roll.csv")
results = client.detect_anomalies(df, module="HIGH_DENSITY")`} />
            </>
          }
          eli5Content={
            <p>
              Data scientists use Python to organize giant spreadsheets. Our Python tool acts like a secure, tamper-proof envelope. Before a researcher sends us a massive spreadsheet to analyze, they put it in our Python envelope. The envelope scrambles and seals the data so tightly that nobody on the internet (not even Marigold's own employees) can read the real names inside. We just analyze the patterns mathematically.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Go (Golang) SDK"
          mariContextPrompt="I just read the non-technical translation for the Go SDK. Why is it important to check millions of records at the exact same time?"
          technicalContent={
            <>
              <p>
                For modern, high-throughput civic microservices requiring massive concurrency, we provide a Go package leveraging the standard library's <code>crypto/aes</code> and <code>crypto/cipher</code> packages.
              </p>
              <CodeBlock language="bash" code={`go get github.com/marigold/marigold-go`} />
            </>
          }
          eli5Content={
            <p>
              Go is a computer language originally built by Google. It is famous because it is incredibly good at doing millions of things at the exact same time without crashing. Our Go tool ensures that if an organization has 10 million voters to check all at once, it can scramble and lock up all 10 million records at lightning speed without getting overwhelmed or making a mistake.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Rust SDK (Extreme Memory Safety)"
          mariContextPrompt="I just read the non-technical translation for the Rust SDK. Why does temporary memory leak private information, and how does Rust stop it?"
          technicalContent={
            <>
              <p>
                For highly paranoid, mission-critical infrastructure where memory leaks or buffer overflows during encryption are absolutely unacceptable, we publish an official Rust crate utilizing the <a href="https://crates.io/crates/ring" className="text-emerald-600 underline">ring</a> cryptography library. This provides unparalleled C-level performance with strict memory-safety guarantees.
              </p>
              <CodeBlock language="bash" code={`cargo add marigold-rs`} />
            </>
          }
          eli5Content={
            <p>
              Rust is a modern language designed to be practically impossible to hack or break. It is used by banks, militaries, and extremely secure environments. Our Rust tool ensures that while a computer is busy scrambling the names and addresses into secret codes, it doesn't accidentally "leak" a single letter of that private information into the computer's temporary scratchpad memory where a hacker might find it.
            </p>
          }
        />

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
