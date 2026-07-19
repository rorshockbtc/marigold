import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <Link href="/" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
            <span>← Return to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-slate-900">
            Terms of Service &amp; Statutory Data Liability Agreement
          </h1>
          <p className="text-xs text-slate-600 font-mono">
            Effective Date: June 30, 2026 • Document Version: 2.1-CIVIC-FED
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">1. Acceptance of Terms &amp; Zero-Trust Protocol Architecture</h2>
            <p>
              By accessing, registering an account with, or utilizing Marigold Insights (&quot;Platform&quot;), you acknowledge and agree that Marigold Insights provides local browser computational protocols, statistical benchmarking logic, and client-side visualization engines. The Platform operates under a **Zero-Trust Federated Node Architecture**.
            </p>
            <p>
              Under no circumstances does Marigold Insights transmit, ingest, host, sync, or store official state voter registration rolls, citizen street addresses, or Personally Identifiable Information (&quot;PII&quot;) on cloud servers or remote database clusters. All data processing occurs strictly inside your local machine&apos;s browser memory.
            </p>
          </section>

          <section className="space-y-3 bg-slate-100/80 border border-amber-500/30 p-5 rounded-2xl">
            <h2 className="text-lg font-bold text-amber-400 uppercase tracking-wider">2. User Lawful Acquisition Warranty &amp; Statutory Liability Protection</h2>
            <p>
              You explicitly warrant and certify that any public dataset, voter file spreadsheet (`.csv`), or municipal record connected locally to your browser tab was acquired lawfully and in strict compliance with your jurisdiction&apos;s statutory election laws and Secretary of State administrative codes.
            </p>
            <p>
              <strong>Limitation of Liability:</strong> Marigold Insights assumes zero responsibility or liability for how users acquire public civic records or whether users possess lawful statutory eligibility to view specific jurisdictional files. If you connect a dataset that you are not legally authorized to possess under state law, you assume sole and complete legal liability for such actions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">3. Strict Prohibition on Commercial &amp; Unlawful Use</h2>
            <p>
              In accordance with state statutes governing voter registration rolls (including NVRA regulations and state Secretary of State rules), you agree that any insights, statistical anomalies, or records processed via Marigold Insights shall NOT be used for:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Commercial solicitation, advertising, or direct marketing.</li>
              <li>Harassment, intimidation, or unlawful interference with citizen voting rights.</li>
              <li>Public dissemination of private residential addresses where restricted by state privacy statutes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">4. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Marigold Insights, its open-source contributors, collaborative organizations, and engineering developers from any claims, statutory fines, or legal actions arising from your unauthorized dataset acquisition, improper file sharing, or violation of state election data regulations.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-slate-500">
            Questions regarding compliance? Contact compliance@marigoldinsights.org
          </span>
          <Link href="/onboarding" className="bg-primary hover:bg-slate-800 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs transition-colors">
            Proceed to Setup Wizard →
          </Link>
        </div>
      </div>
    </div>
  );
}
