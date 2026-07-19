"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Target, Shield, Users, Server, Scale } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function PhilosophyPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Getting Started</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Philosophy</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Why Marigold?
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          The architectural thesis and civic rationale behind Marigold Insights. A verbose exploration for grantors, institutional investors, and sovereign government integrators.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <h2>The Core Problem: Trust vs. Cryptography</h2>
        <p>
          In modern civic technology, state governments and independent auditing organizations face a devastating paradox. Voter registration databases contain highly sensitive Personally Identifiable Information (PII) belonging to millions of citizens. Historically, applying advanced analytics or machine learning to these datasets required uploading them into centralized third-party cloud servers.
        </p>
        <p>
          This created a massive surface area for liability. Centralized databases become honeypots. If a third-party civic startup is breached, the PII of an entire state’s electorate is compromised. Because of this existential risk, state governments rightly refuse to share data, and independent volunteers are relegated to using inadequate desktop software like Microsoft Excel to manually parse millions of rows.
        </p>

        <NonTechnicalTranslator 
          title="The Marigold Solution: Zero-Trust Local Computation"
          mariContextPrompt="I just read the non-technical translation for Local Computation. Can you explain why cloud software is normally so dangerous for voter files?"
          technicalContent={
            <>
              <p>
                Marigold Insights was engineered to mathematically resolve this paradox using a <strong>Zero-Trust Local Execution Architecture</strong>. 
              </p>
              <p>
                Instead of demanding that states or volunteers upload their 2GB CSV datasets to our cloud (which incurs massive AWS bandwidth costs and catastrophic legal liability), the Marigold Web Application leverages WebAssembly (Wasm) and IndexedDB to process the data entirely within the client's volatile RAM. 
              </p>
              <p>
                Our servers <em>never</em> receive the raw voter data. We operate as a cryptographic relay, distributing statistical matching models (Fellegi-Sunter) to the edge. When collaboration is required, the data is encrypted via AES-256-GCM prior to transmission, ensuring that our proprietary databases contain nothing but zero-PII cryptographic ciphertexts.
              </p>
            </>
          }
          eli5Content={
            <p>
              Normally, when you use software on the internet (like Google Drive), you upload your files to their massive servers. For public voter files containing private addresses, doing this is extremely dangerous because hackers can steal the data from the central server. Marigold completely flips this model. Instead of you sending your sensitive files to our servers, we send our "brain" (our software) down to your computer. The analysis happens right there on your desk, and your private citizen data never travels across the internet. 
            </p>
          }
        />

        <h2>The Economic Rationale for Institutional Grantors</h2>
        <p>
          For philanthropic grantors and venture investors, Marigold Insights represents a paradigm shift in unit economics. Traditional SaaS (Software as a Service) platforms face scaling cliffs; the more data their users upload, the higher their AWS database, compute, and egress costs skyrocket.
        </p>
        <p>
          Because Marigold pushes the heavy algorithmic processing to the user's local machine, our cloud infrastructure is extraordinarily lightweight. We only store encrypted pointers, zero-PII summaries, and authentication tokens. This architecture allows us to serve 1,000 active state analysts for a fraction of the cost of a traditional SaaS monolith, rendering Marigold fiercely sustainable and highly profitable even under public-sector budget constraints.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-sm">
            <Shield className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="font-bold text-lg text-slate-900 mb-2">SOC 2 Liability Shield</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              By refusing to ingest plaintext PII, Marigold drastically reduces the scope of SOC 2 Type II compliance audits, allowing rapid deployment into highly regulated state and federal environments.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-sm">
            <Scale className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="font-bold text-lg text-slate-900 mb-2">Political Neutrality</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our algorithms (Z-Score distribution, Fellegi-Sunter) are blind mathematical standards. The engine does not care about demographics or affiliation; it merely reports statistical fact.
            </p>
          </div>
        </div>

        <h2>Building the Civic OS</h2>
        <p>
          Marigold is not just an auditing tool; it is the foundational operating system for decentralized civic transparency. By providing open SDKs and deterministic webhooks, we allow legacy monoliths (like existing state registration portals) to securely bridge into the modern era of AI-driven anomaly detection without risking their citizen mandates.
        </p>
        <p>
          We are engineering the standard by which all future public data will be analyzed: localized, encrypted, and mathematically objective.
        </p>

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
          href="/developers/docs/getting-started"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Quickstart Guide
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
