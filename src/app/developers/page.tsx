"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Zap, ShieldCheck, Code2, Key, Calculator, AlertTriangle } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function DevelopersPage() {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-foreground leading-tight">
          Introduction to the Marigold API
        </h1>
        <p className="text-xl text-secondary leading-relaxed max-w-3xl">
          Welcome to the Marigold Insights Developer Documentation. This wiki serves as the exhaustive, definitive guide to integrating your state's System of Record with our civic data anomaly detection engines.
        </p>
      </div>

      {/* Philosophy Section - Heavy Documentation */}
      <div className="prose prose-slate max-w-none text-secondary">
        <h2 className="text-2xl font-bold text-foreground border-b border-border-soft pb-2 mt-12 mb-6">The Architecture Philosophy</h2>
        <p className="leading-relaxed mb-6">
          Voter integrity paradigms involve massive data tables containing millions of rows. Traditional API paradigms encourage developers to send these massive, raw JSON datasets over the wire to cloud processors. <strong className="text-foreground">Marigold explicitly rejects this paradigm.</strong>
        </p>
        <p className="leading-relaxed mb-6">
          We operate on a <strong className="text-foreground">Zero-Trust, Zero-PII</strong> architecture. Your monolithic infrastructure is the system of record. Marigold is the extremely optimized search and routing layer. At no point should raw Personally Identifiable Information (PII) such as unencrypted Social Security Numbers, exact dates of birth, or full names touch our cloud ingress points. 
        </p>

        <NonTechnicalTranslator 
          title="The Cryptographic Handshake"
          mariContextPrompt="I just read the non-technical translation for The Cryptographic Handshake. Can you explain what a mathematical blindfold means?"
          technicalContent={
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 my-8">
              <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                The Cryptographic Handshake
              </h4>
              <p className="text-sm text-secondary leading-relaxed mb-4">
                Instead of sending us raw citizen data, your server must implement AES-GCM (Galois/Counter Mode) authenticated encryption locally. You hash the dataset, encrypt the anomalous record IDs, and send us the resulting <strong className="text-foreground">Ciphertext</strong> along with the <strong className="text-foreground">Authentication Tag</strong> and <strong className="text-foreground">Initialization Vector (Nonce)</strong>.
              </p>
              <p className="text-sm text-secondary leading-relaxed">
                When we receive this payload, we validate the cryptographic proof without ever reading the underlying identity string. We map the anomaly to a specific standard deviation cluster (Z-Score) and route the encrypted flag back to your system. You decrypt it locally. Our servers remain utterly blind to the identities involved.
              </p>
            </div>
          }
          eli5Content={
            <p>
              Imagine sending a sealed, unbreakable lockbox through the mail instead of a postcard. Instead of sending us a postcard with a voter's real name and address (which a hacker could read), your computer locks that name inside a mathematical lockbox. You send us the lockbox. We run our statistical checks on the outside of the box without ever having the key to open it. We attach our results to the box, send it back, and only <strong>you</strong> can unlock it. This means Marigold's servers remain completely blind to who the voter actually is.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Why Not Standard REST?"
          mariContextPrompt="I just read the non-technical translation for Why Not Standard REST. Can you explain what data sovereignty means?"
          technicalContent={
            <>
              <p className="text-secondary leading-relaxed mb-6">
                State agencies operate on legacy C#, Java, and Mainframe paradigms. Enforcing a standard REST architecture where we own the database creates immense compliance friction (SOC 2, FedRAMP, HIPAA, etc.). By offloading the storage completely to your system, we allow you to utilize our proprietary Fellegi-Sunter log-odds algorithms and standard deviation matrices without violating local data sovereignty laws.
              </p>
            </>
          }
          eli5Content={
            <p>
              Normally, when you use a software tool on the internet, you have to upload all of your files to their servers. This is very dangerous when dealing with sensitive information like voter rolls because of strict government privacy laws. Instead of forcing you to give us the data (which requires expensive lawyers and compliance forms), Marigold simply hands you our mathematical formulas. You run the formulas on your own computer and only tell us the final score. 
            </p>
          }
        />

        <h2 className="text-2xl font-bold text-foreground border-b border-border-soft pb-2 mt-12 mb-6">Navigating This Wiki</h2>
        <p className="text-secondary leading-relaxed mb-6">
          This documentation is intentionally verbose. We have engineered this platform to scale to Series C volume and beyond, handling hundreds of millions of civic queries per hour. Please carefully read the following critical paths:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <Link href="/developers/docs/authentication" className="group p-6 rounded-2xl border border-border-soft bg-card-bg shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Authentication & Tokens</h3>
            <p className="text-sm text-secondary">Learn how to issue Bearer tokens, rotate keys, and establish IP whitelisting for your institutional ingress.</p>
          </Link>

          <Link href="/developers/docs/algorithms/fellegi-sunter" className="group p-6 rounded-2xl border border-border-soft bg-card-bg shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Fellegi-Sunter Matching</h3>
            <p className="text-sm text-secondary">Deep dive into the probabilistic mathematics behind our duplicate record isolation modules.</p>
          </Link>

          <Link href="/developers/docs/api-reference/detect" className="group p-6 rounded-2xl border border-border-soft bg-card-bg shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">API Reference: Detect</h3>
            <p className="text-sm text-secondary">Review the exact JSON schemas, required headers, and expected return codes for the primary analysis loop.</p>
          </Link>

          <Link href="/developers/docs/errors" className="group p-6 rounded-2xl border border-border-soft bg-card-bg shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Error Dictionary</h3>
            <p className="text-sm text-secondary">Debug cryptic cryptographic failures and Z-Score overflows with our canonical error definitions.</p>
          </Link>
        </div>
      </div>
      
      {/* Footer Nav */}
      <div className="pt-8 border-t border-border-soft flex justify-end">
        <Link 
          href="/developers/docs/getting-started"
          className="btn-primary flex items-center gap-2"
        >
          Next: Quickstart Guide
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
