"use client";

import React from "react";
import Link from "next/link";
import { MarigoldIcon } from "@/components/MarigoldIcon";
import { FlaskConical, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background text-foreground py-16 px-6 border-t border-border mt-auto font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
        {/* Brand & Mission Statement */}
        <div className="space-y-4 lg:w-1/3">
          <div className="font-serif font-bold text-foreground text-xl flex items-center gap-3">
            <MarigoldIcon className="w-6 h-6 flex-shrink-0 text-primary drop-shadow-2xs" />
            <span>Marigold Insights</span>
          </div>
          <p className="text-secondary text-sm leading-relaxed max-w-sm">
            Non-partisan civic data exploration engineered for local browser memory execution and 100% Zero-PII cloud compliance.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="bg-muted text-secondary px-3 py-1 rounded-full text-xs font-mono font-bold border border-border-soft inline-block">
              Engine Version 1.3.0
            </span>
            <span className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded-full text-xs font-mono font-bold border border-emerald-200 inline-block">
              Zero-PII Verified
            </span>
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:w-2/3 lg:justify-items-end text-sm">
          {/* Column 1: Audits & Tools */}
          <div className="space-y-3.5 flex flex-col">
            <h4 className="font-bold text-foreground font-serif tracking-tight">Audits &amp; Tools</h4>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="text-primary font-bold hover:text-accent transition-colors"
            >
              State Audits (MS &amp; NC)
            </Link>
            <Link href="/manifold" className="text-secondary hover:text-primary transition-colors">
              3D County Map
            </Link>
            <Link href="/playbooks" className="text-secondary hover:text-primary transition-colors">
              14 Audit Playbooks
            </Link>
            <Link href="/registry" className="text-secondary hover:text-primary transition-colors">
              50-State Voter Registry
            </Link>
            <Link
              href="/sandbox"
              className="text-accent hover:text-primary transition-colors flex items-center gap-1.5 font-bold pt-1"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Public Sandbox</span>
            </Link>
          </div>

          {/* Column 2: Guides & Standards */}
          <div className="space-y-3.5 flex flex-col">
            <h4 className="font-bold text-foreground font-serif tracking-tight">Guides &amp; Standards</h4>
            <Link href="/overview" className="text-secondary hover:text-primary transition-colors font-semibold">
              Overview &amp; One-Pager
            </Link>
            <Link href="/perspectives" className="text-secondary hover:text-primary transition-colors">
              Worldviews &amp; FAQ
            </Link>
            <Link href="/compliance" className="text-secondary hover:text-primary transition-colors">
              FEMA &amp; Zero-PII Standards
            </Link>
            <Link href="/developers" className="text-secondary hover:text-primary transition-colors">
              Developer Docs
            </Link>
            <Link href="/privacy" className="text-secondary hover:text-primary transition-colors">
              Privacy &amp; Terms
            </Link>
          </div>

          {/* Column 3: Support & Corporate */}
          <div className="space-y-3.5 flex flex-col">
            <h4 className="font-bold text-foreground font-serif tracking-tight">Mission &amp; Support</h4>
            <Link
              href="/partnership"
              className="text-primary font-bold hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Support Marigold</span>
            </Link>
            <Link href="/deploy" className="text-secondary hover:text-primary transition-colors">
              Bring to Your State
            </Link>
            <Link href="/updates" className="text-secondary hover:text-primary transition-colors">
              What&apos;s New
            </Link>
            <Link href="/contact" className="text-secondary hover:text-primary transition-colors">
              Contact Us
            </Link>
            <a
              href="https://colonhyphenbracket.pink"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors"
            >
              Colon Hyphen Bracket ↗
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-border-soft flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary">
        <p>
          Architected &amp; Built by{" "}
          <strong className="text-foreground font-bold">Colon Hyphen Bracket, a Wyoming LLC</strong>.
        </p>
        <p>&copy; {new Date().getFullYear()} Marigold Insights. All rights reserved.</p>
      </div>
    </footer>
  );
}
