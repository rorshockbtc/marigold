'use client';

import React from 'react';
import Link from 'next/link';

export default function SemiquincentennialPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-100 font-sans pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Hero Video Section */}
      <section className="relative w-full py-32 md:py-48 px-6 text-center overflow-hidden border-b border-slate-200">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none transform scale-105 transition-all duration-1000 -z-10"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1546955870-90060241d09f?auto=format&fit=crop&w=2000&q=80")' }}
        />
        <video
          src="/hero-montage.mp4"
          poster="https://images.unsplash.com/photo-1546955870-90060241d09f?auto=format&fit=crop&w=2000&q=80"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-lg">
            <span>🎆 Semiquincentennial Celebration</span>
            <span>•</span>
            <span>1776 – 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 drop-shadow-sm">
            250 Years of <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent">We the People</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
            On July 4, 2026, the United States of America marks its 250th birthday. True self-governance derives its legitimacy not from closed bureaucratic vaults, but from the active, informed verification of everyday citizens.
          </p>

          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/perspectives"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:scale-105 transition-all duration-200"
            >
              Explore Worldviews & Data
            </Link>
            <a
              href="/sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200/80 border border-slate-700 text-slate-900 font-semibold hover:bg-slate-800 transition-all duration-200 backdrop-blur-md"
            >
              Launch Local Sandbox ↗
            </a>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            The Semiquincentennial Civic Pledge
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            As we celebrate two and a half centuries of independence, Marigold Insights empowers American citizens across all 50 states with open-source transparency tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50 border border-slate-200/60 border border-slate-200 rounded-3xl p-8 space-y-4 hover:border-slate-700 transition-colors shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              🔔
            </div>
            <h3 className="text-xl font-bold text-slate-900">Proclaim Liberty & Verification</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Just as the Liberty Bell proclaimed liberty throughout the land, public voter registries must remain open to public examination. Transparency is the bedrock of electoral trust.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 border border-slate-200 rounded-3xl p-8 space-y-4 hover:border-slate-700 transition-colors shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-slate-900">100% Client-Side Privacy</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              In the true American spirit of individual privacy and liberty, your citizen analyses execute locally inside your browser memory. Zero files are uploaded to central servers.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 border border-slate-200 rounded-3xl p-8 space-y-4 hover:border-slate-700 transition-colors shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
              🤝
            </div>
            <h3 className="text-xl font-bold text-slate-900">Bridging the Partisan Divide</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Whether analyzing physical domicile verification (Security), transfer benchmarks (Efficiency), or precinct overcrowding (Rights), data empowers citizens to understand diverse perspectives.
            </p>
          </div>
        </div>
      </section>

      {/* Historical Quote Banner */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-200 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 text-9xl text-slate-800/30 font-serif pointer-events-none select-none">
            “
          </div>
          <blockquote className="relative z-10 space-y-4">
            <p className="text-lg sm:text-2xl font-serif italic text-slate-200 leading-relaxed">
              &ldquo;Governments are instituted among Men, deriving their just powers from the consent of the governed.&rdquo;
            </p>
            <footer className="text-sm font-bold text-amber-400 tracking-wider uppercase">
              — The Declaration of Independence, July 4, 1776
            </footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
