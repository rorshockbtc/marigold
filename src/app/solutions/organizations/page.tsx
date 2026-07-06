"use client";

import React from 'react';
import Link from 'next/link';

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-slate-900 text-white py-16 px-6 border-b border-accent shadow-lg">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-400">
            <span>🌐 For Good-Governance Organizations & Coalitions</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            Strategic Alignment Without Compromising Group Privacy
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Coordinate multi-county verification teams effortlessly. Share successful search terms, custom audit playbooks, and standardized review checklists exclusively with your trusted network.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link 
              href="/sign-up" 
              className="bg-accent hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-lg shadow-md flex items-center justify-center transition-all text-sm"
            >
              Register Your Organization →
            </Link>
            <Link 
              href="/store" 
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 h-12 rounded-lg border border-slate-600 flex items-center justify-center transition-all text-sm"
            >
              Explore Playbook Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        
        {/* Collaborative Efficiency */}
        <section className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl mb-2">
            🔗
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            Unify Your County Chapters
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Too often, volunteer organizations suffer from duplicated effort. A county team in the north might spend weeks developing a clever way to audit commercial mailing addresses, while a chapter in the south struggles with the exact same problem from scratch.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Marigold Insights bridges this gap. Group Administrators can create custom **Mission Playbooks**—pre-packaged sets of search criteria and review checklists—and instantly push them to all authorized organization members. Everyone works from the same playbook with consistent, standardized methodologies.
          </p>
        </section>

        {/* Enhanced Privacy & Controlled Sharing */}
        <section className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-2xl mb-2">
            🔐
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
            Better Privacy: Keep Your Strategy Within Your Team
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            When your coalition discovers a critical statistical anomaly or refines a specific search query term, you shouldn&apos;t have to broadcast your investigative strategies to the entire internet just to collaborate.
          </p>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            Our platform features **isolated group workspaces**. You can share successful search queries, notes, and progress reports strictly within your verified organization members. At the same time, because all actual voter file processing remains 100% local on each volunteer&apos;s personal device, your organization never takes on the liability of centrally hosting or storing voter rolls.
          </p>
        </section>

        {/* Administration & Role Transfer */}
        <section className="bg-slate-900 text-white p-8 md:p-10 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-900/50 border border-amber-500/50 flex items-center justify-center text-2xl mb-2">
            👑
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-400">
            Seamless Leadership & Admin Transfer
          </h2>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            Organizations grow and leadership changes over time. Marigold includes intuitive administrative controls that allow chapter chairs to transfer admin rights, invite new members, or rename workspaces with a single click—ensuring institutional continuity without IT headaches.
          </p>
          <div className="pt-4">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center bg-accent hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-lg shadow transition-all text-sm"
            >
              Get Started with Marigold Organizations →
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
