"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Zap, ShieldCheck, Code2, Key, Calculator, AlertTriangle } from "lucide-react";

export default function DevelopersPage() {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Introduction to the Marigold API
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Welcome to the Marigold Insights Developer Documentation. This wiki serves as the exhaustive, definitive guide to integrating your state's System of Record with our civic data anomaly detection engines.
        </p>
      </div>

      {/* Philosophy Section - Heavy Documentation */}
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 mt-12 mb-6">The Architecture Philosophy</h2>
        <p className="text-slate-700 leading-relaxed mb-6">
          Voter integrity paradigms involve massive data tables containing millions of rows. Traditional API paradigms encourage developers to send these massive, raw JSON datasets over the wire to cloud processors. <strong>Marigold explicitly rejects this paradigm.</strong>
        </p>
        <p className="text-slate-700 leading-relaxed mb-6">
          We operate on a <strong>Zero-Trust, Zero-PII</strong> architecture. Your monolithic infrastructure is the system of record. Marigold is the extremely optimized search and routing layer. At no point should raw Personally Identifiable Information (PII) such as unencrypted Social Security Numbers, exact dates of birth, or full names touch our cloud ingress points. 
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 my-8">
          <h4 className="text-emerald-900 font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            The Cryptographic Handshake
          </h4>
          <p className="text-sm text-emerald-800 leading-relaxed mb-4">
            Instead of sending us raw citizen data, your server must implement AES-GCM (Galois/Counter Mode) authenticated encryption locally. You hash the dataset, encrypt the anomalous record IDs, and send us the resulting <strong>Ciphertext</strong> along with the <strong>Authentication Tag</strong> and <strong>Initialization Vector (Nonce)</strong>.
          </p>
          <p className="text-sm text-emerald-800 leading-relaxed">
            When we receive this payload, we validate the cryptographic proof without ever reading the underlying identity string. We map the anomaly to a specific standard deviation cluster (Z-Score) and route the encrypted flag back to your system. You decrypt it locally. Our servers remain utterly blind to the identities involved.
          </p>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mt-10 mb-4">Why Not Standard REST?</h3>
        <p className="text-slate-700 leading-relaxed mb-6">
          State agencies operate on legacy C#, Java, and Mainframe paradigms. Enforcing a standard REST architecture where we own the database creates immense compliance friction (SOC 2, FedRAMP, HIPAA, etc.). By offloading the storage completely to your system, we allow you to utilize our proprietary Fellegi-Sunter log-odds algorithms and standard deviation matrices without violating local data sovereignty laws.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 mt-12 mb-6">Navigating This Wiki</h2>
        <p className="text-slate-700 leading-relaxed mb-6">
          This documentation is intentionally verbose. We have engineered this platform to scale to Series C volume and beyond, handling hundreds of millions of civic queries per hour. Please carefully read the following critical paths:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <Link href="/developers/docs/authentication" className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Authentication & Tokens</h3>
            <p className="text-sm text-slate-600">Learn how to issue Bearer tokens, rotate keys, and establish IP whitelisting for your institutional ingress.</p>
          </Link>

          <Link href="/developers/docs/algorithms/fellegi-sunter" className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Fellegi-Sunter Matching</h3>
            <p className="text-sm text-slate-600">Deep dive into the probabilistic mathematics behind our duplicate record isolation modules.</p>
          </Link>

          <Link href="/developers/docs/api-reference/detect" className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">API Reference: Detect</h3>
            <p className="text-sm text-slate-600">Review the exact JSON schemas, required headers, and expected return codes for the primary analysis loop.</p>
          </Link>

          <Link href="/developers/docs/errors" className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-rose-300 transition-all">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Error Dictionary</h3>
            <p className="text-sm text-slate-600">Debug cryptic cryptographic failures and Z-Score overflows with our canonical error definitions.</p>
          </Link>
        </div>
      </div>
      
      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-end">
        <Link 
          href="/developers/docs/getting-started"
          className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Quickstart Guide
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
