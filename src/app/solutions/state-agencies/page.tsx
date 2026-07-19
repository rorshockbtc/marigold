import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FEMA-Compliant Election Security for Agencies | Marigold Insights",
  description: "Risk-free statutory voter list maintenance. Zero-PII local compute engine, micro-purchase contracting, and allowable FY26 FEMA HSGP grant alignment.",
  keywords: ["state agency election security", "county clerk audit tool", "FEMA HSGP compliance", "voter list maintenance", "government procurement"],
};

export default function StateAgenciesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground pb-20">
      {/* Reassuring Hero Section */}
      <section className="bg-gradient-to-b from-primary to-slate-900 text-slate-900 py-16 px-6 border-b border-accent shadow-lg">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400">
            <span>🏛️ For State Administrative Agencies & County Clerks</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            Compliant, Risk-Free Data Verification That Never Compromises Citizen Privacy
          </h1>
          <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
            We make statutory list maintenance straightforward, transparent, and 100% local. No complex IT servers to maintain, no expensive multi-year contracts, and no public records ever leaving your building.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link 
              href="/deploy" 
              className="bg-accent hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-lg shadow-md flex items-center justify-center transition-all text-sm"
            >
              Request Grant Qualification Packet →
            </Link>
            <Link 
              href="/compliance" 
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 h-12 rounded-lg border border-slate-600 flex items-center justify-center transition-all text-sm"
            >
              Review FEMA Compliance Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        
        {/* Peace of Mind & Procurement */}
        <section className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl mb-2">
            🤝
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            Procurement You Can Feel Confident Signing
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            As a public official, signing off on new technology shouldn&apos;t come with anxiety over surprise IT costs or public scrutiny. Marigold Insights is structured as a **transparent, flat-rate annual software package ($1,500/year)**. 
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Because our cost falls comfortably below standard sole-source micro-purchase thresholds, you can deploy professional-grade verification tools without lengthy competitive bidding or budget overruns. Furthermore, our software qualifies as an allowable expenditure under the **mandatory FY26 FEMA Homeland Security Grant Program (HSGP) 3% election security minimum spend**, ensuring your agency meets federal requirements effortlessly.
          </p>
        </section>

        {/* Local Processing Differentiation */}
        <section className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl mb-2">
            🔒
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            How It Works: &quot;Share the Rules, Not the Records&quot;
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Traditional software forces you to upload your sensitive voter lists to remote cloud servers. This creates legal data residency hurdles and potential cyber risks.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Marigold takes a completely different approach. Think of our website as a public library of standardized verification recipes. When your staff or authorized citizens open the app, their web browser downloads these mathematical recipes and processes the data **100% locally inside their computer&apos;s own memory**. Citizen files never touch our servers or the internet. You retain total physical control of your records at all times.
          </p>
        </section>

        {/* Future Vision & Collaboration */}
        <section className="bg-slate-50 border border-slate-200 text-slate-900 p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sky-900 border border-sky-600 flex items-center justify-center text-2xl mb-2">
            🌱
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-400">
            Empowering Collaboration & Building for the Future
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            By eliminating technical roadblocks, Marigold allows government employees and community volunteers to speak the same language. Agency staff can easily share helpful search query terms and standardized check templates with local stakeholders, building trust through transparency.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            **Our Long-Term Vision:** We are actively evolving Marigold into a universal query layer that will help citizens easily navigate complex government forms and localized public records that are traditionally hard to search. For today, our focus is dedicating this powerful technology to non-partisan election integrity and accurate list maintenance.
          </p>
          <div className="pt-4">
            <Link 
              href="/deploy" 
              className="inline-flex items-center justify-center bg-accent hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-lg shadow transition-all text-sm"
            >
              Bring Marigold to Your Jurisdiction →
            </Link>
          </div>
        </section>

        {/* Back navigation */}
        <div className="text-center pt-4">
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
            ← Return to Marketing Home
          </Link>
        </div>

      </div>
    </div>
  );
}
