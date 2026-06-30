import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <Link href="/" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
            <span>← Return to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white">
            Zero-Knowledge Privacy &amp; Federated Node Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Auditing Standard: Local Client RAM Computing • Architecture: WebAssembly Edge Isolation
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">1. The Zero-Cloud PII Guarantee</h2>
            <p>
              Unlike legacy civic auditing platforms or cloud database software, Marigold Insights is built from the ground up to eliminate cloud data liabilities. We do not maintain central repositories of citizen names, birth dates, or residential addresses.
            </p>
            <p>
              When you load a voter roll file (`.csv`) into our exploration workspace, your web browser utilizes the native HTML5 File System Access API and local WebAssembly memory pools to parse records locally on your hard drive. Zero rows are uploaded to our servers.
            </p>
          </section>

          <section className="space-y-3 bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl">
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-wider">2. How Collaborative Cartridges Work Without Leaking Data</h2>
            <p>
              When collaborative audit groups work together on Marigold Insights, our servers route only lightweight **JSON Cartridges** containing mathematical rules and aggregate counts (e.g., *&quot;Flag count: 850 P.O. Box registrations&quot;*).
            </p>
            <p>
              To inspect specific addresses behind a flag, group teammates must load their own local copy of the state dataset into their browser. The client node verifies data parity locally and renders the plain-text addresses on the user&apos;s display.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">3. Account Authentication &amp; Metadata</h2>
            <p>
              For organizational authentication and workspace permissions, we collect only minimal administrative account details (Name, Email Address, and Organization Title). This administrative metadata is stored securely in encrypted authentication containers and is never linked or correlated with local dataset contents.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/terms" className="text-xs text-accent hover:underline font-bold">
            Review Terms of Service &amp; Statutory Liability Agreement →
          </Link>
          <Link href="/onboarding" className="bg-primary hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors">
            Return to Setup Wizard →
          </Link>
        </div>
      </div>
    </div>
  );
}
