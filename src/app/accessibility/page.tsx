import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Keyboard, Eye, MessageSquare } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <Link href="/" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
            <span>← Return to Home</span>
          </Link>
          <div className="inline-block bg-sky-900/60 text-sky-300 font-mono text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider mb-1 border border-sky-500/30">
            Government Accessibility Conformance
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white">
            Section 508 &amp; WCAG 2.1 AA Accessibility Statement
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Conformance Target: Web Content Accessibility Guidelines (WCAG) 2.1 Level AA • Statutory Alignment: Section 508
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">1. Our Commitment to Equal Civic Access</h2>
            <p className="text-slate-200">
              Marigold Insights is dedicated to ensuring that election infrastructure auditing and public civic data exploration are fully accessible to all individuals, including citizens, county election officials, and state personnel with disabilities.
            </p>
            <p>
              We design and engineer our digital workspace in strict accordance with <strong className="text-white font-bold">Section 508 of the Rehabilitation Act (29 U.S.C. 794d)</strong> and the <strong className="text-white font-bold">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> published by the World Wide Web Consortium (W3C).
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Keyboard className="w-4 h-4" />
                <h3 className="font-serif text-white text-base">Full Keyboard Navigability</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All data exploration tables, anomaly filtering drawers, modal dialogs, and interactive statistical charts can be navigated and operated using standard keyboard interfaces (Tab, Shift+Tab, Enter, Escape, and Arrow keys) without requiring a mouse or pointing device.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Eye className="w-4 h-4" />
                <h3 className="font-serif text-white text-base">High Contrast &amp; Visual Clarity</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our user interface color palettes are specifically curated to exceed WCAG AA minimum contrast ratios (4.5:1 for normal text and 3:1 for large text/UI boundaries). This ensures readability under bright municipal office lighting and for users with visual impairments or color blindness.
              </p>
            </div>
          </section>

          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">2. Screen Reader &amp; Assistive Technology Parity</h2>
            <p>
              To support visually impaired election workers and researchers utilizing assistive screen reading software (such as NVDA, JAWS, VoiceOver, and ChromeVox), our codebase implements modern semantic HTML5 landmarks and WAI-ARIA attributes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li><strong className="text-white">Descriptive ARIA Labels:</strong> Dynamic anomaly badges, progress bars, and risk severity indicators are announced cleanly to assistive devices.</li>
              <li><strong className="text-white">Structured Data Tables:</strong> Voter roll anomaly results utilize strict header associations (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded">&lt;th scope=&quot;col&quot;&gt;</code>) so screen reader users can effortlessly traverse multi-thousand-row reports.</li>
              <li><strong className="text-white">Focus Management:</strong> When opening side sheets or anomaly investigation drawers, keyboard focus is automatically trapped within the active dialog and restored upon closure.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-base font-bold uppercase tracking-wider text-white">3. Continuous Auditing &amp; Quality Assurance</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We perform automated and manual accessibility testing during our continuous integration and deployment pipelines using industry-standard auditing toolkits (including Chrome DevTools Accessibility Tree inspection and Lighthouse web.dev guidelines). As web browsers and assistive technologies evolve, we proactively update our UI components to maintain strict Section 508 compliance.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">4. Accommodation Requests &amp; Feedback</h2>
            </div>
            <p>
              We welcome feedback from county election officials, disability rights advocates, and citizens. If you encounter an accessibility barrier or require specific technical accommodations to operate Marigold Insights within your municipal workflow, please contact our compliance engineering team:
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 inline-block">
              <span className="text-xs text-slate-400 block">Accessibility &amp; Section 508 Coordinator:</span>
              <a href="mailto:accessibility@marigoldinsights.org" className="text-amber-400 font-bold hover:underline text-sm font-mono">
                accessibility@marigoldinsights.org
              </a>
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/cookies" className="text-xs text-accent hover:underline font-bold">
            ← Review Cookie &amp; Storage Policy
          </Link>
          <Link href="/compliance" className="bg-primary hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors">
            View Statutory Compliance Center →
          </Link>
        </div>
      </div>
    </div>
  );
}
