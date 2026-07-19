import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Citizen-Led Voter Verification | Marigold Insights",
  description: "Verify local voter rolls using plain, everyday language. A secure, smart magnifying glass running 100% locally on your computer to assist volunteers and retirees.",
  keywords: ["citizen audit", "local data verification", "voter roll compliance", "non-partisan transparency", "retiree volunteering"],
};

export default function CitizensPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground pb-20">
      {/* Friendly Hero Section */}
      <section className="bg-gradient-to-b from-primary to-slate-900 text-slate-900 py-16 px-6 border-b border-accent shadow-lg">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400">
            <span>🔍 For Community Volunteers, Retirees & Citizen Networks</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            Verify Local Data Using Plain, Everyday Language
          </h1>
          <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
            You don&apos;t need to be a programmer or a spreadsheet expert to participate in civic transparency. Think of Marigold as a smart magnifying glass that runs right on your own computer desk.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a 
              href="/sandbox" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-lg shadow-md flex items-center justify-center transition-all text-sm"
            >
              Try the Free Public Sandbox ↗
            </a>
            <Link 
              href="/sign-up" 
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 h-12 rounded-lg border border-slate-600 flex items-center justify-center transition-all text-sm"
            >
              Join Your Local Group
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        
        {/* Simple Explanation for 60-85 year olds */}
        <section className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl mb-2">
            💡
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            No Programming Degree Required
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Have you ever tried opening a public civic file on your computer, only to have Excel freeze up or show confusing error codes? We built Marigold Insights specifically to solve that frustration.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Our software allows you to explore public records by typing conversational questions—just like asking a librarian for assistance. You can pick from standardized check templates designed by experienced researchers, run them with a single click, and view clear, organized results. Everything is formatted in readable fonts with generous spacing designed for comfort and ease of use.
          </p>
        </section>

        {/* Total Privacy & Lawful exploration */}
        <section className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-2xl mb-2">
            🛡️
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            100% Private, Safe & Lawful Exploration
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            When you volunteer to help audit public lists, data privacy is paramount. You should never upload citizen information to random internet websites or unverified cloud storage boxes.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            With Marigold, **your files stay right on your own computer machine**. Our software operates entirely inside your web browser. When you run an analysis, no data is ever transmitted across the internet. This provides a non-partisan, legitimate, and fully lawful way for dedicated citizens to assist in keeping community records accurate and up-to-date.
          </p>
        </section>

        {/* Note for Statisticians & Engineers */}
        <section className="bg-slate-100 p-8 rounded-2xl border border-slate-300 space-y-3">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            ⚙️ Are You a Data Scientist, Statistician, or Software Engineer?
          </h3>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            While our interface is tailored for approachable, non-technical community interaction, the underlying engine is powered by rigorous statistical algorithms (including high-density Poisson distribution checks and NCOA address standardization rules). We believe in complete transparency and open-source validation.
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-semibold">
            To examine our mathematical proofs, inspect our WebAssembly memory slicing architecture, or review our open-source codebase, please refer directly to our <a href="https://github.com/rorshockbtc/marigold" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-accent font-bold">Public GitHub Repository</a>.
          </p>
        </section>

        {/* Call to action */}
        <div className="text-center pt-4 space-y-4">
          <Link 
            href="/sign-up" 
            className="inline-flex items-center justify-center bg-accent hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-lg shadow transition-all text-sm"
          >
            Create Your Free Citizen Account →
          </Link>
          <div>
            <Link href="/" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors block mt-2">
              ← Return to Marketing Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
