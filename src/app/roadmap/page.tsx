import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Technical Product Roadmap & Integrations | Marigold Insights",
  description: "Explore our development schedule for NCOA change-of-address databases, municipal GIS map layers, and multi-state data standards.",
  keywords: ["product roadmap", "data integration", "USPS NCOA", "GIS maps", "interoperability framework"],
};

export default function RoadmapPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 font-sans">
      <div className="border-b border-border pb-6 text-center space-y-3">
        <div className="inline-block bg-primary text-slate-900 font-bold text-xs px-3.5 py-1 rounded uppercase tracking-wider shadow-sm">
          Technical Evolution
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-primary">Strategic Product Roadmap</h1>
        <p className="text-muted-foreground text-base max-w-3xl mx-auto leading-relaxed">
          Our ongoing engineering schedule focused on bridging complex civic datasets, streamlining cross-agency verification, and empowering citizens and state employees without requiring specialized programming skills.
        </p>
      </div>

      <div className="space-y-8">
        {/* Current Live Architecture */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            Current Status: Live Production
          </div>
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">Core Infrastructure</span>
            <h2 className="text-2xl font-serif font-bold text-primary">Local-Memory Execution & National Checklist Library</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              We successfully eliminated the need for cloud databases by executing all sorting and statistical matching 100% inside client computer memory. Volunteers and state officials can currently share standardized verification checklists nationwide while keeping sensitive citizen files safely on their local hard drives.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">Zero Cloud PII Uploads</span>
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">Client Memory Sorting</span>
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">FEMA HSGP Compliant</span>
            </div>
          </div>
        </div>

        {/* Next Priority Focus */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden hover:border-slate-400 transition-all">
          <div className="absolute top-0 right-0 bg-accent text-slate-900 font-bold text-xs px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            Next Release Priority
          </div>
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">Interoperability Module</span>
            <h2 className="text-2xl font-serif font-bold text-primary">Cross-Agency Data Integrations</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Navigating government data should not require an engineering degree or custom software scripts. Our upcoming release focuses on seamless, automated integration adapters for complex public datasets—including official USPS National Change of Address (NCOA) registries, municipal GIS mapping layers, and county property tax assessment records. This allows everyday citizens and state employees to cross-verify addresses and occupancy data through simple visual clicks.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">USPS NCOA Alignment</span>
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">Municipal GIS Layers</span>
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">No Engineering Required</span>
            </div>
          </div>
        </div>

        {/* Future Vision */}
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden hover:border-slate-400 transition-all">
          <div className="absolute top-0 right-0 bg-slate-800 text-slate-900 font-bold text-xs px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
            Long-Term Vision
          </div>
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">Standardization</span>
            <h2 className="text-2xl font-serif font-bold text-primary">Interstate Civic Integrity Frameworks</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Establishing a universal, non-partisan data interchange standard across all 50 states and jurisdictions. By decoupling analytical verification logic from raw database formatting, counties across America will be able to adopt unified verification benchmarks and share best practices instantly—reducing administrative costs and building lasting public trust.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">50-State Interoperability</span>
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">Politically Neutral Standards</span>
              <span className="bg-slate-100 px-3 py-1 rounded border border-slate-200">Automated Audit Workflows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Request CTA Box linking to Contact/Deploy Form */}
      <div className="bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">Community Driven Development</span>
          <h3 className="text-2xl font-serif font-bold">Need a Specific Data Integration?</h3>
          <p className="text-slate-700 text-sm leading-relaxed font-normal">
            If your state agency or volunteer network requires integration with a particular municipal dataset or public verification tool, submit a direct feature request to our engineering team.
          </p>
        </div>
        <Link href="/deploy" className="bg-accent hover:bg-amber-600 text-white font-bold text-sm px-8 py-4 rounded-xl shadow whitespace-nowrap transition-all transform hover:-translate-y-0.5">
          Request Feature or Integration →
        </Link>
      </div>
    </div>
  );
}
