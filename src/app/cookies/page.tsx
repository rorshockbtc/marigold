import React from 'react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <Link href="/" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
            <span>← Return to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white">
            Cookie &amp; Local Storage Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Compliance Standard: Zero-Tracking Edge Architecture • Effective Date: July 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3 bg-emerald-950/40 border border-emerald-500/30 p-5 rounded-2xl">
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-wider">1. The Zero-Tracking Guarantee</h2>
            <p className="text-slate-200">
              Marigold Insights is engineered from the ground up for strict government and civic compliance. <strong className="text-white font-bold">We use ZERO third-party advertising, marketing, behavioral profiling, or cross-site surveillance cookies.</strong>
            </p>
            <p>
              Because we do not deploy commercial ad trackers (such as Google Analytics, Facebook Pixels, or third-party data brokers), our platform does not require intrusive opt-in consent banners under GDPR, CCPA, CPRA, or state cybersecurity mandates. Your interaction with public civic data remains entirely private.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">2. Strictly Necessary Authentication Cookies</h2>
            <p>
              To provide secure access to organizational workspaces, multi-user audit teams, and administrative tools, we utilize <strong className="text-amber-400 font-semibold">Clerk Authentication</strong>. When you sign in, Clerk places strictly necessary session cookies (e.g., <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">__client_uat</code>, <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">__session</code>) in your browser.
            </p>
            <p>
              These cookies are essential for verifying your identity, maintaining secure cryptographic session boundaries, and preventing unauthorized access to your team&apos;s workspace. They are never shared with advertisers or used to track your browsing history outside of Marigold Insights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">3. Local Browser Storage &amp; IndexedDB Architecture</h2>
            <p>
              To fulfill our <strong className="text-sky-300 font-semibold">Zero-Cloud PII Guarantee</strong>, Marigold Insights performs massive data linkage and anomaly detection directly on your personal machine using WebAssembly (Wasm) and local browser memory rather than remote cloud servers. To enable this high-speed local processing, we utilize two native HTML5 browser storage mechanisms:
            </p>
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-[11px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded">LOCALSTORAGE</span>
                <h3 className="font-serif font-bold text-white text-base">User Preferences &amp; Playbooks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We store your custom column header mappings (<code className="text-slate-300">marigold_file_mapping</code>), custom anomaly detection playbooks, and UI state preferences locally on your hard drive so you do not have to re-configure your workspace between sessions.
                </p>
              </div>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                <span className="font-mono font-bold text-[11px] bg-sky-900/60 text-sky-300 px-2 py-0.5 rounded">INDEXEDDB</span>
                <h3 className="font-serif font-bold text-white text-base">Local Civic Dataset Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you ingest a state voter roll or municipal spreadsheet, the records are stored inside an isolated local database (<code className="text-slate-300">MarigoldDB</code>) within your browser&apos;s sandbox. This data never leaves your computer and is never transmitted to our cloud servers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">4. Data Destruction &amp; Sanitization Protocol</h2>
            <p>
              State election statutes and municipal IT standards require strict data sanitization and disposal schedules for citizen rolls. Because Marigold Insights processes datasets entirely within your local browser memory and IndexedDB sandbox, <strong className="text-emerald-400 font-bold">you retain 100% control over data destruction</strong>.
            </p>
            <p>
              To permanently destroy and purge all ingested civic records from your machine, simply click the <strong className="text-white">&quot;Clear Workspace Data&quot;</strong> button in our data preparation tab or clear your browser&apos;s site data/cache. Upon action, your browser instantaneously sanitizes and frees the local memory sectors, satisfying state data destruction requirements without needing third-party vendor certificates.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/privacy" className="text-xs text-accent hover:underline font-bold">
            ← Review Zero-Knowledge Privacy Policy
          </Link>
          <Link href="/compliance" className="bg-primary hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors">
            View Statutory Compliance Center →
          </Link>
        </div>
      </div>
    </div>
  );
}
