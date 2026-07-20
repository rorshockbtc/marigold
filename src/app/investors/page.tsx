import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Cpu, ServerOff, Database, Key, Building2, TerminalSquare, ArrowRight, Zap, CloudOff, Target, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30">
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-500 text-sm font-bold uppercase tracking-widest mb-8 shadow-2xl backdrop-blur-md">
            <MarigoldIcon className="w-5 h-5 text-amber-500" />
            Investor Overview
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Zero-Trust</span> Future of Civic Data.
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed mb-12">
            State agencies spend billions on monolithic, highly-vulnerable cloud databases. Marigold is the world's first edge-compute civic platform. Infinite scalability. Zero server costs. Unhackable by design.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#monetization" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] flex items-center gap-2">
              View Monetization Strategy <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#problem" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all">
              The $10B Problem
            </a>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-24 px-6 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> The Vulnerability
              </h2>
              <h3 className="text-4xl font-black mb-6">The Civic Data Dinosaur</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Current election software relies on centralized, monolithic cloud servers. As demonstrated by the July 16, 2026 Presidential Declassification detailing the theft of 220 million voter records, these centralized databases are literal honey-pots for foreign adversaries.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-300">
                  <Database className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Massive Server Costs</strong>
                    Processing millions of rows of PII in the cloud costs states millions of dollars annually in AWS fees and contractor bloat.
                  </div>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <ServerOff className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Single Point of Failure</strong>
                    If a cloud server is breached, every single citizen's data is compromised instantly.
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />
              <div className="relative bg-[#111] border border-red-500/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <span className="text-xs font-mono text-gray-500">legacy_architecture.sys</span>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                  </div>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-red-400">&gt; ALERT: Intrusion detected in central cloud bucket</div>
                  <div className="text-gray-400">&gt; Attempting to secure PII tables...</div>
                  <div className="text-red-500 font-bold">&gt; FAILED. 220,000,000 records exfiltrated.</div>
                  <div className="text-gray-500 pt-4 mt-4 border-t border-white/5">
                    Cost of Breach: Immeasurable civic trust.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution & Scalability */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
           <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4" /> The Innovation
          </h2>
          <h3 className="text-4xl md:text-5xl font-black mb-6">Zero-Trust Edge Compute</h3>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Marigold flips the paradigm. Instead of sending data to a server, we send the software to the data. All heavy parsing, auditing, and AI synthesis happens locally in the user's browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-b from-white/10 to-transparent p-[1px] rounded-2xl">
            <div className="bg-[#0a0a0a] rounded-2xl p-8 h-full">
              <CloudOff className="w-10 h-10 text-emerald-400 mb-6" />
              <h4 className="text-xl font-bold mb-3">Unhackable by Design</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                We never store or transmit PII. Because the data never leaves the client device, there is no central honey-pot to hack. It is cryptographically secure (SHA-256 / AES-GCM).
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-b from-amber-500/30 to-transparent p-[1px] rounded-2xl shadow-[0_0_30px_-10px_rgba(245,158,11,0.2)]">
            <div className="bg-[#111] rounded-2xl p-8 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500">99% Margins</span>
              </div>
              <Zap className="w-10 h-10 text-amber-400 mb-6" />
              <h4 className="text-xl font-bold mb-3">Infinite Scalability ($0 Cost)</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Because the end-user's laptop provides the CPU power to parse multi-million row datasets, scaling from 1,000 to 1,000,000 users costs us $0 in backend server compute.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-b from-white/10 to-transparent p-[1px] rounded-2xl">
            <div className="bg-[#0a0a0a] rounded-2xl p-8 h-full">
              <TerminalSquare className="w-10 h-10 text-indigo-400 mb-6" />
              <h4 className="text-xl font-bold mb-3">Rapid Deployment</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Traditional agencies require 9 months and $500k to build monolithic systems. By leveraging AI-agentic architecture, we shipped this enterprise-grade platform in 3 weeks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monetization Models */}
      <section id="monetization" className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Monetization Strategy
            </h2>
            <h3 className="text-4xl md:text-5xl font-black mb-6">How We Generate Revenue</h3>
            <p className="text-gray-400 text-lg max-w-2xl">
              Marigold transitions from a free civic tool to an enterprise powerhouse through three distinct B2B and B2G revenue streams.
            </p>
          </div>

          <div className="space-y-6">
            {/* Tier 1 */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start group hover:border-amber-500/30 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-2xl font-bold">Tier 1: B2G Enterprise SaaS</h4>
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">State Agencies</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-3xl">
                  States currently pay legacy contractors millions of dollars annually for archaic election management systems. We white-label the Marigold engine for State Agencies. They receive a fundamentally unhackable, lightning-fast administrative portal. We replace a $5M contract with a $500k annual SaaS license, realizing 99% margins.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" /> Recurring Revenue
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" /> Sticky Contracts
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start group hover:border-emerald-500/30 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Database className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-2xl font-bold">Tier 2: The Cartridge Marketplace</h4>
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Civic Orgs & Audits</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-3xl">
                  While the base engine is free, specialized forensic algorithms are not. We charge organizations subscriptions for premium "Cartridges". Examples include FEMA Compliance checks, out-of-state National Change of Address (NCOA) macros, and historical anomaly detection. 
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> High Volume
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Low Friction Sales
                  </div>
                </div>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start group hover:border-indigo-500/30 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Key className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-2xl font-bold">Tier 3: Marigold Secure API Licensing</h4>
                  <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Data Vendors</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-3xl">
                  Third-party data vendors (like ELLY) possess massive monolithic databases but lack our zero-trust frontend technology. We license our SHA-256 Cryptographic Vault standard to them. Their users can securely process heavy datasets using the Marigold API, bridging fragmented data silos compliantly.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Enterprise Integration
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Infrastructure Standard
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center border-t border-white/5 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
         <div className="relative z-10">
           <h3 className="text-3xl md:text-4xl font-black mb-6">Ready to disrupt a $10B industry?</h3>
           <p className="text-gray-400 text-lg mb-10">
             We built this platform in weeks, not years. Imagine what we do next.
           </p>
           <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-all">
             Contact the Founder <ArrowUpRight className="w-5 h-5" />
           </Link>
         </div>
      </section>

    </div>
  );
}
