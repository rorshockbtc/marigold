"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, CheckCircle2, ArrowRight, Building2, Users, Database, Cpu, Mail, Lock, Award, TrendingUp } from 'lucide-react';

export default function PartnersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'civic' | 'investor' | 'research'>('civic');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Web3Forms access key
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "0a997a5d-fccb-46f4-bc7b-7df7ec33d90d";
    formData.append("access_key", accessKey);
    formData.append("partnership_track", selectedTrack.toUpperCase());

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      setSubmitted(true);
    } catch {
      alert("Submission failed. Please email our partnership team directly at partnerships@colonhyphenbracket.com.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-16 md:py-24 px-4 sm:px-8 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10 animate-in fade-in duration-500">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional Beta Partnership Program</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight text-white leading-tight">
            Unbiased Statistical Mapping. <br className="hidden sm:inline" />
            <span className="text-amber-400">Zero Political Narrative.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Marigold Insights is currently selecting state-level civic organizations, election researchers, and data teams for our **Beta Partnership Program**. Join an enterprise-grade network dedicated to mathematical truth and voter roll integrity.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a 
              href="#partnership-form" 
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Apply for Pilot Partnership</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#data-honesty" 
              className="bg-slate-900/80 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl border border-slate-700 shadow transition-all text-sm sm:text-base"
            >
              Read Our Data Honesty Pledge ↓
            </a>
          </div>
        </div>
      </section>

      {/* The Non-Partisan Data Honesty Positioning */}
      <section id="data-honesty" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
              Our Core Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
              The Math Doesn&apos;t Care About Politics. <br />
              <span className="text-slate-600">Neither Do We.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              There is a massive growing market of researchers, election commissioners, and civic volunteer groups who are exhausted by partisan tools, sensationalized headlines, and black-box algorithms. You just want raw, clean, verifiable data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Pure Statistical Reality</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We apply peer-reviewed mathematical formulas (Tukey&apos;s Interquartile Fences, Poisson distributions, Benford&apos;s Law) to uncover clerical typos, NCOA anomalies, and occupancy spikes without narrative distortion.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Zero-PII Air-Gapped Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                By processing 100% of voter files inside local browser RAM (Web Workers), our platform completely eliminates data exfiltration risks and PII liability under state non-dissemination statutes.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-primary">Institutional Procurement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Structured to meet stringent state and municipal procurement standards. Eligible for FEMA FY26 Homeland Security Grant Program (HSGP) 3% Election Security allocations and county micro-purchases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Partnership Tracks */}
      <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-primary">Three Ways to Partner With Marigold</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            We are building an ecosystem uniting state election officials, volunteer civic auditors, and strategic investors around institutional-grade software.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Track 1: Civic & Local Data Testing */}
          <div 
            onClick={() => setSelectedTrack('civic')}
            className={`bg-white rounded-3xl p-8 border-2 transition-all cursor-pointer flex flex-col justify-between shadow-sm relative overflow-hidden ${selectedTrack === 'civic' ? 'border-amber-500 ring-4 ring-amber-500/10 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            {selectedTrack === 'civic' && (
              <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Selected Track
              </span>
            )}
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">Civic &amp; Local Data Testing Partners</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>The Value Exchange:</strong> We provide your organization with early turnkey access to our enterprise mapping tools and Playbook libraries. In exchange, your team conducts localized data testing and provides jurisdictional feedback.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Free early Beta access for all county volunteers</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Custom Playbook adaptation for your state schema</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Zero-PII collaborative secure note sharing</li>
              </ul>
            </div>
            <div className="pt-6">
              <a href="#partnership-form" className="w-full inline-block text-center bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow">
                Select Civic Testing Track →
              </a>
            </div>
          </div>

          {/* Track 2: Strategic Investment & Grants */}
          <div 
            onClick={() => setSelectedTrack('investor')}
            className={`bg-slate-950 text-white rounded-3xl p-8 border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xl relative overflow-hidden ${selectedTrack === 'investor' ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-slate-800 hover:border-slate-700'}`}
          >
            {selectedTrack === 'investor' && (
              <span className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Selected Track
              </span>
            )}
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Strategic Investment &amp; Angel Funding</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>For Angels &amp; Grant Officers:</strong> Marigold is built by institutional software architects at Colon Hyphen Bracket LLC. We welcome strategic inquiries from high-net-worth investors, foundation directors, and grant officers.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Scalable B2B SaaS &amp; Government GovTech model</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Defensible local-compute IP &amp; zero-liability architecture</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Direct equity, seed rounds, or strategic grant structuring</li>
              </ul>
            </div>
            <div className="pt-6">
              <a href="#partnership-form" className="w-full inline-block text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-all shadow">
                Select Strategic Investor Track →
              </a>
            </div>
          </div>

          {/* Track 3: State Agency & Academic */}
          <div 
            onClick={() => setSelectedTrack('research')}
            className={`bg-white rounded-3xl p-8 border-2 transition-all cursor-pointer flex flex-col justify-between shadow-sm relative overflow-hidden ${selectedTrack === 'research' ? 'border-amber-500 ring-4 ring-amber-500/10 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            {selectedTrack === 'research' && (
              <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Selected Track
              </span>
            )}
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">State Agencies &amp; Academic Researchers</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>For Election Officials &amp; Universities:</strong> Request turnkey evaluation environments for county clerks or academic research teams conducting longitudinal voter roll mobility studies.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" /> Compliant with FEMA FY26 HSGP security mandates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" /> Custom data formatting for state MCVR/QVF files</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" /> Dedicated technical onboarding &amp; clerk training</li>
              </ul>
            </div>
            <div className="pt-6">
              <a href="#partnership-form" className="w-full inline-block text-center bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow">
                Select State Agency Track →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Inquiry Form & Direct Contact */}
      <section id="partnership-form" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Institutional Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary">
              Initiate Partnership or Funding Inquiry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Select your track below. Direct inquiries are reviewed daily by our systems architects and leadership at Colon Hyphen Bracket LLC.
            </p>
          </div>

          {/* Direct Email Banner for Investors */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-white block font-sans text-sm">For grant inquiries, angel funding, or strategic investment:</strong>
                <span>You may also email our executive desk directly for confidential deck &amp; term sheet discussions.</span>
              </div>
            </div>
            <a 
              href="mailto:partnerships@colonhyphenbracket.com?subject=Strategic%20Inquiry%3A%20Marigold%20Insights" 
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow"
            >
              Email Executive Desk ↗
            </a>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-800 font-bold text-3xl shadow">
                ✓
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary">Inquiry Transmitted Successfully</h3>
              <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                Thank you for your interest in Marigold Insights. Our leadership team has received your proposal and will respond within 24 business hours.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-all"
                >
                  Submit another inquiry
                </button>
                <a 
                  href="/sandbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-primary hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all"
                >
                  Explore Public Sandbox ↗
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Selected Partnership Track *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('civic')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-2 ${selectedTrack === 'civic' ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                  >
                    <span>👥 Civic Testing Beta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('investor')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-2 ${selectedTrack === 'investor' ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                  >
                    <span>📈 Investor / Grants</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('research')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-2 ${selectedTrack === 'research' ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                  >
                    <span>🏛️ State Agency / Academic</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Full Name / Title *</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50/50" placeholder="e.g., Dr. Jane Doe (Research Lead)" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Institutional Email Address *</label>
                  <input required name="email" type="email" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50/50" placeholder="jdoe@organization.org" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Organization / Foundation / Agency *</label>
                  <input required name="organization" type="text" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50/50" placeholder="e.g., Midwest Civic Data Coalition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Target Jurisdiction / Coverage Area *</label>
                  <input required name="jurisdiction" type="text" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50/50" placeholder="e.g., Statewide Ohio or Multi-State" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Inquiry Details &amp; Proposed Collaboration *</label>
                <textarea 
                  required
                  rows={4} 
                  name="message" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-primary focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50/50" 
                  placeholder={
                    selectedTrack === 'civic' ? "Please outline your organization's volunteer network size and which county/state datasets you can assist with testing..." :
                    selectedTrack === 'investor' ? "Please indicate your investment firm, angel network, or grant structuring timeline..." :
                    "Please describe your state agency's evaluation parameters or university research scope..."
                  } 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg transition-all text-base flex items-center justify-center gap-2"
              >
                {loading ? "Transmitting Institutional Inquiry..." : "Submit Partnership Proposal →"}
              </button>
              
              <p className="text-center text-xs text-slate-500 font-medium">
                🔒 All submissions are treated under strict mutual confidentiality by Colon Hyphen Bracket LLC.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
