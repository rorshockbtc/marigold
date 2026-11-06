"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Building2,
  Users,
  HeartHandshake,
  ChevronRight,
  Lock,
  Fingerprint,
  Database,
  FileText,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Share2,
} from "lucide-react";

export default function SupportMarigoldPage() {
  const [selectedTrack, setSelectedTrack] = useState<"share" | "civic" | "official" | "grant">("civic");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        organization: formData.get("organization"),
        jurisdiction: formData.get("jurisdiction"),
        message: formData.get("message"),
        track: selectedTrack,
      };
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Hero Section */}
      <section className="bg-card-bg border-b border-border-soft py-16 sm:py-20 px-6 sm:px-10 rounded-2xl">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-primary/20 shadow-2xs">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Non-Partisan Civic Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground tracking-tight leading-tight">
            Support Marigold
          </h1>
          <p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Marigold Insights is built on a simple conviction: every citizen, county election commissioner, and civic organization deserves transparent, mathematically honest tools to verify public records—without ever exposing personal voter data to the cloud.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <a
              href="#support-form"
              className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-xl shadow-xs"
            >
              Get Involved or Partner With Us <ChevronRight className="w-4 h-4" />
            </a>
            <Link
              href="/overview"
              className="btn-secondary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold rounded-xl"
            >
              <FileText className="w-4 h-4 text-primary" />
              Download 1-Page Overview
            </Link>
          </div>
        </div>
      </section>

      {/* Four Ways to Support Marigold */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            How You Can Help
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
            Four Ways to Support Clean, Privacy-Safe Civic Data
          </h2>
          <p className="text-secondary text-base sm:text-lg leading-relaxed">
            Whether you are an individual citizen, a county election official, a volunteer group, or a grant foundation, here is how you can help expand Marigold across all 50 states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Way 1: Share Reports with Local Officials */}
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground">
                1. Share Reports With County Officials
              </h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                The fastest way to support Marigold is to bring our <strong>Zero-PII County Briefings</strong> to your local County Election Commissioners or County Board of Elections. Every report separates ordinary dorms, nursing homes, and Jr./Sr. families first so officials only review real clerical tasks.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Download the Mississippi (82-County) or North Carolina (100-County) PDF
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Print a 1-page dossier for your specific county in 10 seconds
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-border-soft flex flex-wrap gap-3">
              <Link
                href="/reports/mississippi-playbook-analysis"
                className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                Open State Audits (MS &amp; NC) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Way 2: Civic & Volunteer Testing */}
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground">
                2. Volunteer &amp; State Schema Testing
              </h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                Have a public voter roll from your county or state? Test it in our local-browser scanner and let us know how our 14 non-partisan playbooks map to your state&apos;s column headers. Your feedback helps us standardize all 50 states.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Early access for local citizen chapters &amp; academic researchers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Custom header mapping for your state&apos;s voter file format
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-border-soft">
              <a
                href="#support-form"
                onClick={() => setSelectedTrack("civic")}
                className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                Join Civic Testing Network <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Way 3: Government & County Pilots */}
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground">
                3. County &amp; State Agency Pilots
              </h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                We partner with County Election Commissioners, County Boards of Elections, and State Administrative Agencies to run zero-cloud list-maintenance and voter-protection audits eligible for FEMA HSGP Election Security grants.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  100% local browser execution—zero third-party cloud PII liability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Protects both voter access (recent-vote inactives) and clean rolls
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-border-soft">
              <a
                href="#support-form"
                onClick={() => setSelectedTrack("official")}
                className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                Request an Official Pilot Briefing <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Way 4: Grants, Sponsorships & Strategic Investment */}
          <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground">
                4. Grants, Sponsorships &amp; Strategic Backing
              </h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                Sponsor a statewide public audit benchmark, fund open-access civic research, or inquire about strategic investment in Colon Hyphen Bracket LLC&apos;s local-compute civic platform.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 font-medium pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Sponsor public 14-playbook audits for additional states
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Philanthropic grants &amp; strategic GovTech capital inquiries
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-border-soft">
              <a
                href="#support-form"
                onClick={() => setSelectedTrack("grant")}
                className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                Inquire About Grants or Sponsorship <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Non-Partisan Pledge */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-border-soft shadow-2xs">
            <Lock className="w-7 h-7 text-primary mb-4" />
            <h3 className="font-serif font-bold text-lg mb-2">Zero-PII Cloud Liability</h3>
            <p className="text-sm text-secondary leading-relaxed">
              We never upload raw voter names, birth dates, or street numbers to cloud servers. All file scanning happens inside your own computer&apos;s local memory.
            </p>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-border-soft shadow-2xs">
            <Database className="w-7 h-7 text-primary mb-4" />
            <h3 className="font-serif font-bold text-lg mb-2">False Alarms Filtered First</h3>
            <p className="text-sm text-secondary leading-relaxed">
              University dorms, military bases, nursing homes, and Jr./Sr. fathers and sons are separated automatically before any county checklist is generated.
            </p>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-border-soft shadow-2xs">
            <Fingerprint className="w-7 h-7 text-primary mb-4" />
            <h3 className="font-serif font-bold text-lg mb-2">Strictly Non-Partisan</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Our 14 checks include both voter-protection safeguards (preventing active voters marked Inactive from being turned away) and statutory list-maintenance checks.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Support / Partnership Contact Form */}
      <section id="support-form" className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
              Connect With Our Team
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              Support or Partner With Marigold
            </h2>
            <p className="text-sm sm:text-base text-secondary">
              Select how you would like to get involved and send us a note directly.
            </p>
          </div>

          {/* Track Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[
              ["civic", "Volunteer / Test"],
              ["official", "County / State Pilot"],
              ["grant", "Grant / Sponsor"],
              ["share", "General Support"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTrack(id as "share" | "civic" | "official" | "grant")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedTrack === id
                    ? "bg-foreground text-background border-foreground shadow-2xs"
                    : "bg-background text-secondary border-border hover:border-foreground/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <h3 className="font-serif font-bold text-xl text-emerald-950">
                Thank you for supporting Marigold
              </h3>
              <p className="text-sm text-emerald-900">
                We have received your message and will follow up shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Jane Doe"
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane@example.org"
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                    Organization / Role (Optional)
                  </label>
                  <input
                    type="text"
                    name="organization"
                    placeholder="County Commissioner, Civic Group, etc."
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                    State / County
                  </label>
                  <input
                    type="text"
                    name="jurisdiction"
                    placeholder="e.g., Wake County, NC or Hinds County, MS"
                    className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                  How would you like to support or collaborate? *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us about your county, state voter file, organization, or how you'd like to help..."
                  className="w-full p-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-12 rounded-xl font-bold text-sm shadow-xs cursor-pointer"
              >
                {loading ? "Sending..." : "Send Message to Marigold Team →"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
