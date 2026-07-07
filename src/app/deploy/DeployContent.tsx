"use client";

import React, { useState } from 'react';

export function DeployContent() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Web3Forms access key
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "0a997a5d-fccb-46f4-bc7b-7df7ec33d90d";
    formData.append("access_key", accessKey);

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      setSubmitted(true);
    } catch {
      alert("Submission failed. Please email our team directly or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-12 pb-24 font-sans">
      <div className="text-center space-y-3">
        <div className="inline-block bg-primary text-white font-bold text-xs px-3.5 py-1 rounded uppercase tracking-wider shadow-sm">
          Jurisdictional Onboarding
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary tracking-tight">Bring Marigold Insights to Your Jurisdiction</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
          Request a turnkey, zero-PII local compute deployment or propose custom data integrations tailored for your state or county&apos;s civic records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-6 md:col-span-1 shadow-md border border-slate-800">
          <h3 className="text-xl font-serif font-bold border-b border-slate-800 pb-3 text-amber-400">Flexible Contracting</h3>
          <div className="space-y-5 text-sm text-slate-300 leading-relaxed font-normal">
            <div>
              <strong className="text-white block font-bold mb-1">Statewide FEMA Initiatives</strong>
              Structured directly under FY26 HSGP 3% Election Security allocations to enable comprehensive statewide pilot deployments.
            </div>
            <div>
              <strong className="text-white block font-bold mb-1">County Micro-Purchases</strong>
              Right-sized invoicing ($1,500/year) tailored for individual County Election Commissions beneath statutory Sole Source thresholds.
            </div>
            <div>
              <strong className="text-white block font-bold mb-1">Custom Data Integrations</strong>
              Need support for local municipal GIS layers or USPS change of address feeds? We build dedicated browser mapping adapters.
            </div>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-border shadow-sm md:col-span-2">
          {submitted ? (
            <div className="text-center py-16 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-800 font-bold text-2xl font-sans">
                ✓
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary">Request Received</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                Thank you for reaching out. A systems architect will review your jurisdiction&apos;s data parameters and respond within 24 business hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-sm text-accent hover:text-amber-700 underline font-bold pt-4 block mx-auto"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Full Name *</label>
                  <input required name="name" type="text" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-accent outline-none" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Official Email *</label>
                  <input required name="email" type="email" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-accent outline-none" placeholder="jdoe@agency.gov" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Target Jurisdiction *</label>
                  <input required name="jurisdiction" type="text" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-accent outline-none" placeholder="State Agency or County Commission" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Role / Organization *</label>
                  <select name="role" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-accent outline-none bg-white">
                    <option value="State Administrative Agency (SAA)">State Administrative Agency (SAA)</option>
                    <option value="County Election Commission / Clerk">County Election Commission / Clerk</option>
                    <option value="Civic Organization / Volunteer Lead">Civic Organization / Volunteer Network</option>
                    <option value="Feature Request / Data Provider">Feature Request / Data Provider Integration</option>
                    <option value="Other">Other / Independent Researcher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Implementation Timeline &amp; Specific Requirements</label>
                <textarea rows={4} name="message" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-accent outline-none" placeholder="Please describe your jurisdiction's file formatting or outline any custom data integrations requested..." />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-lg shadow transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? "Transmitting Inquiry..." : "Request Deployment Information →"}
              </button>
              <p className="text-center text-xs text-slate-500 font-medium">
                Your inquiry is confidential and routed directly to lead deployment architects at Colon Hyphen Bracket LLC.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
