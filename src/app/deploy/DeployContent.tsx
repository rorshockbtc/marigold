"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FilterControl } from '@/components/ui/FilterControl';

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
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        jurisdiction: formData.get("jurisdiction"),
        message: formData.get("message")
      };
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Fallback to submitted state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-12 pb-24 font-sans">
      <div className="text-center space-y-3">
        <div className="inline-block bg-primary text-slate-900 font-bold text-xs px-3.5 py-1 rounded uppercase tracking-wider shadow-sm">
          Jurisdictional Onboarding
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary tracking-tight">Bring Marigold Insights to Your Jurisdiction</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
          Request a turnkey, zero-PII local compute deployment or propose custom data integrations tailored for your state or county&apos;s civic records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="bg-slate-50 border border-slate-200 text-slate-900 p-8 rounded-2xl space-y-6 md:col-span-1 shadow-md border border-slate-200">
          <h3 className="text-xl font-serif font-bold border-b border-slate-200 pb-3 text-amber-400">Flexible Contracting</h3>
          <div className="space-y-5 text-sm text-slate-700 leading-relaxed font-normal">
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Statewide FEMA Initiatives</strong>
              Structured directly under FY26 HSGP 3% Election Security allocations to enable comprehensive statewide pilot deployments.
            </div>
            <div>
              <strong className="text-slate-900 block font-bold mb-1">County Micro-Purchases</strong>
              Right-sized invoicing ($1,500/year) tailored for individual County Election Commissions beneath statutory Sole Source thresholds.
            </div>
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Custom Data Integrations</strong>
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
              <Button 
                onClick={() => setSubmitted(false)}
                variant="ghost"
                className="text-sm text-accent hover:text-amber-700 underline font-bold pt-4 block mx-auto"
              >
                Submit another inquiry
              </Button>
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
                  <FilterControl
                    label="Role / Organization *"
                    value="State Administrative Agency (SAA)"
                    onChange={() => {}}
                    options={[
                      { value: "State Administrative Agency (SAA)", label: "State Administrative Agency (SAA)" },
                      { value: "County Election Commission / Clerk", label: "County Election Commission / Clerk" },
                      { value: "Civic Organization / Volunteer Lead", label: "Civic Organization / Volunteer Network" },
                      { value: "Feature Request / Data Provider", label: "Feature Request / Data Provider Integration" },
                      { value: "Other", label: "Other / Independent Researcher" }
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Implementation Timeline &amp; Specific Requirements</label>
                <textarea rows={4} name="message" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-primary focus:ring-2 focus:ring-accent outline-none" placeholder="Please describe your jurisdiction's file formatting or outline any custom data integrations requested..." />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-lg shadow transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? "Transmitting Inquiry..." : "Request Deployment Information →"}
              </Button>
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
