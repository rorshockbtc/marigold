"use client";

import React from "react";
import Link from "next/link";
import { Shield, Building2, Users, Network, ChevronRight, Lock, Fingerprint, Database } from "lucide-react";

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* Hero Section */}
      <section className="bg-card-bg border-b border-border-soft py-20 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-block bg-primary/10 text-primary font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-primary/20 shadow-sm">
            Strategic Alliances
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight">
            Partner With Us
          </h1>
          <p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Marigold Insights provides the foundational air-gapped architecture for organizations dedicated to civic integrity, secure data analysis, and transparent election administration.
          </p>
          <div className="pt-6">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm">
              Contact Architecture Desk <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Value Proposition */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Why Partner With Marigold?</h2>
          <p className="text-secondary leading-loose text-lg">
            We solve the fundamental conflict between data transparency and PII privacy. By inverting the cloud model and executing algorithmic analysis locally on the client machine, we empower organizations to conduct massive voter roll audits without triggering statutory privacy violations or requiring extensive cybersecurity procurement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-sm">
            <Lock className="w-8 h-8 text-primary mb-5" />
            <h3 className="font-bold text-lg mb-3">Zero-PII Liability</h3>
            <p className="text-sm text-secondary leading-relaxed">We never ingest raw social security numbers or full identities to our cloud servers, completely isolating your organization from catastrophic data breaches.</p>
          </div>
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-sm">
            <Database className="w-8 h-8 text-primary mb-5" />
            <h3 className="font-bold text-lg mb-3">Instant Scalability</h3>
            <p className="text-sm text-secondary leading-relaxed">Our in-memory algorithms process millions of records in seconds, avoiding the massive server costs usually associated with big data civic analysis.</p>
          </div>
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-sm">
            <Fingerprint className="w-8 h-8 text-primary mb-5" />
            <h3 className="font-bold text-lg mb-3">Non-Partisan Integrity</h3>
            <p className="text-sm text-secondary leading-relaxed">Our codebase is mathematically deterministic. We do not provide ideological filtering, ensuring your audits hold up in bipartisan scrutiny.</p>
          </div>
        </div>
      </section>

      {/* Specific Partner Tracks */}
      <section className="py-16 px-6 bg-card-bg border-t border-b border-border-soft">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Dedicated Partnership Tracks</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-10">
            
            {/* Track 1: Federal & State Agencies */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border-soft pb-3">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Government & Agencies</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed font-bold">Including DHS, State Election Commissions, and County Clerks.</p>
              <p className="text-sm text-secondary leading-relaxed">
                Marigold is designed to fulfill FEMA HSGP (Homeland Security Grant Program) requirements for election security. We provide the technical backbone for state agencies to rapidly verify NCOA (National Change of Address) anomalies and death registry overlaps without exposing internal state data lakes to third-party vendors.
              </p>
            </div>

            {/* Track 2: Civic Integrity Organizations */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border-soft pb-3">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Civic Integrity Networks</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed font-bold">Including ETI (Heritage Foundation), Election Integrity Network, etc.</p>
              <p className="text-sm text-secondary leading-relaxed">
                Empower your local chapters with professional-grade analytical tools. Share standardized SQL search checklists and verification rubrics securely across your coalition. Marigold ensures that your volunteer base is utilizing statistically sound, defensible methodologies for public records review.
              </p>
            </div>

            {/* Track 3: Grassroots Volunteer Groups */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border-soft pb-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Local Citizen Coalitions</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Transform everyday citizens into highly effective data auditors. Our non-technical interface translates complex duplicate-matching algorithms into plain English, allowing local community groups to crowdsource the verification of their own municipal rolls cleanly and legally.
              </p>
            </div>

            {/* Track 4: Technology & Data Providers */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border-soft pb-3">
                <Network className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Data & API Providers</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                If your organization manages commercial datasets (e.g., USPS, DMV, or GIS parcel mapping), integrate your APIs natively into the Marigold execution environment. Provide seamless enrichment layers for jurisdictions seeking to cross-reference multiple trusted data sources.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">Ready to fortify civic infrastructure?</h2>
        <p className="text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
          Reach out to our lead architecture team to discuss customized deployments, institutional licensing, or coalition-wide rollout strategies.
        </p>
        <Link href="/contact" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base mt-4 shadow-md">
          Initiate Partnership Discussion
        </Link>
      </section>

    </div>
  );
}
