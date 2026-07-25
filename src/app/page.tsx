"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Search, Target, Users, BookOpen, Fingerprint } from "lucide-react";

const REGIONS = [
  {
    id: 0,
    tab: '🎆 250th Anniversary',
    lyric: 'Proclaim Liberty throughout all the land...',
    region: 'Heritage & Self-Governance',
    location: 'Celebrating 250 Years of American Independence & Civic Legacy',
    bg: '/bg-0.jpg',
    video: '/vid-0.mp4',
  },
  {
    id: 1,
    tab: '🏙️ America the Modern',
    lyric: 'Thriving cities gleam, undimmed by human tears...',
    region: 'Innovation & Metropolis',
    location: 'Celebrating American Enterprise, Modern Infrastructure & Urban Opportunity',
    bg: '/bg-1.jpg',
    video: '/vid-1.mp4',
  },
  {
    id: 2,
    tab: '🌾 America the Beautiful',
    lyric: 'O beautiful for spacious skies and amber waves of grain...',
    region: 'Heartland & Bounty',
    location: 'Celebrating Our Agricultural Plains & Vast Heartlands',
    bg: '/bg-2.jpg',
    video: '/vid-2.mp4',
  },
  {
    id: 3,
    tab: '🏔️ Mountain Majesties',
    lyric: 'For purple mountain majesties above the fruited plain...',
    region: 'Majesty & Preservation',
    location: 'Celebrating Our High Country Glaciers & Natural Heritage',
    bg: '/bg-3.jpg',
    video: '/vid-3.mp4',
  },
  {
    id: 4,
    tab: '🤝 Sea to Shining Sea',
    lyric: 'Crown thy good with brotherhood, from sea to shining sea...',
    region: 'Unity & Transparency',
    location: 'Celebrating 50 States United by Open-Source Citizen Verification',
    bg: '/bg-4.jpg',
    video: '/vid-4.mp4',
  },
  {
    id: 5,
    tab: '🌟 Liberty in Law',
    lyric: 'Confirm thy soul in self-control, thy liberty in law...',
    region: 'Civic Integrity',
    location: 'Celebrating Good Governance & Transparent Election Administration',
    bg: '/bg-5.jpg',
    video: '/vid-5.mp4',
  },
  {
    id: 6,
    tab: '🌉 Alabaster Cities',
    lyric: 'Alabaster cities gleam across the patriot dream...',
    region: 'Urban Vitality',
    location: 'Celebrating the Innovation and Economic Vitality of American Metropolises',
    bg: '/bg-6.jpg',
    video: '/vid-6.mp4',
  },
  {
    id: 7,
    tab: '🦅 Pilgrim Feet',
    lyric: 'O beautiful for pilgrim feet, whose stern impassion\'d stress...',
    region: 'Resilience & Community',
    location: 'Celebrating American Resilience & Local Community Dedication',
    bg: '/bg-7.jpg',
    video: '/vid-7.mp4',
  },
  {
    id: 8,
    tab: '🚀 Freedom Thoroughfare',
    lyric: 'A thoroughfare for freedom beat across the wilderness...',
    region: 'Technological Frontiers',
    location: 'Celebrating Modern Engineering & Civic Progress',
    bg: '/bg-8.jpg',
    video: '/vid-8.mp4',
  },
  {
    id: 9,
    tab: '🗽 Shed His Grace',
    lyric: 'America! America! God shed His grace on thee...',
    region: 'Public Trust',
    location: 'Celebrating Open Records, Public Examination, and True Self-Governance',
    bg: '/bg-9.jpg',
    video: '/vid-9.mp4',
  },
];

export default function MarketingHomePage() {
  const [activeRegion, setActiveRegion] = useState(0);
  const current = REGIONS[activeRegion];
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRegion((prev) => (prev + 1) % REGIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((vid, index) => {
      if (vid) {
        if (index === activeRegion) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [activeRegion]);

  return (
    <div className="pb-24 font-sans bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Editorial Hero Section (WhiteHouse / Cassandra Style) */}
      <section className="w-full text-center py-24 sm:py-36 relative overflow-hidden px-4 sm:px-6">
        
        {/* Soft Background Layer */}
        <div className="absolute inset-0 z-0 bg-background" />
        
        {/* Border Frame for Video to match editorial layout */}
        <div className="absolute inset-0 z-0 opacity-40 overflow-hidden mix-blend-multiply border-b border-border pointer-events-none">
          {REGIONS.map((reg) => (
            <React.Fragment key={reg.id}>
              <div 
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transform origin-center transition-opacity duration-1000 ease-in-out ${
                  activeRegion === reg.id ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundImage: `url("${reg.bg}")` }}
              />
              <video
                ref={(el) => {
                  videoRefs.current[reg.id] = el;
                }}
                src={reg.video}
                poster={reg.bg}
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transform origin-center transition-opacity duration-1000 ease-in-out ${
                  activeRegion === reg.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </React.Fragment>
          ))}
          <div className="absolute inset-0 bg-background/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
          
          {/* Top Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="font-mono text-xs font-bold px-3 py-1.5 uppercase tracking-widest text-foreground border border-foreground/20 bg-foreground/5 rounded-full">
              FY26 FEMA HSGP Compliant
            </span>
            <span className="font-mono text-xs font-bold px-3 py-1.5 uppercase tracking-widest text-foreground border border-foreground/20 bg-card-bg rounded-full shadow-sm">
              Zero Cloud PII Exposure
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-foreground max-w-5xl mx-auto leading-tight drop-shadow-sm px-4">
            Non-Partisan Civic Data Exploration
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl text-foreground max-w-3xl mx-auto leading-loose font-medium">
            Making local public record review straightforward, safe, and transparent. Verify civic data directly on your own personal computer without programming expertise, expensive server costs, or transmitting private records across the internet.
          </p>

          {/* America the Beautiful Animated Lyric Display */}
          <div className="pt-10 pb-4 max-w-4xl mx-auto opacity-90">
            <div className="inline-flex flex-col items-center gap-1.5">
              <span className="text-base sm:text-lg text-foreground font-bold font-serif italic tracking-wide transition-all duration-500">
                "{current.lyric}"
              </span>
              <span className="text-foreground/80 text-xs uppercase tracking-widest font-mono font-bold transition-all duration-500">
                — {current.location}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-10 flex flex-wrap justify-center items-center gap-6">
            <Link href="/sandbox" className="btn-primary h-14 px-8 text-base shadow-sm min-w-[200px] flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Try Public Sandbox
            </Link>
            <Link href="/store" className="btn-secondary h-14 px-8 text-base shadow-sm min-w-[200px] flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              Browse Checklists
            </Link>
          </div>

        </div>
      </section>

      {/* Main Container for Rest of Content */}
      <div className="space-y-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        
        {/* The Three Major Stakeholder Groups */}
        <section className="space-y-16 max-w-6xl mx-auto">
          <div className="text-center space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground tracking-tight">Engineered for Every Civic Stakeholder</h2>
            <p className="text-secondary text-lg leading-loose">
              Whether you are a state agency enforcing compliance, or a citizen volunteer organizing a verification chapter, Marigold's localized architecture empowers your specific role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Group 1: State Administrative Agencies */}
            <div className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm space-y-6 flex flex-col justify-between hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block">
                  State Level
                </span>
                <h3 className="text-2xl font-serif font-bold text-foreground leading-snug">State Administrative Agencies (SAAs)</h3>
                <p className="text-secondary leading-loose">
                  Safely fulfill mandatory FEMA election security spend requirements with zero embarrassing audit surprises. Professional verification structured as a flat-rate micro-purchase.
                </p>
              </div>
              <div className="pt-6 border-t border-border-soft">
                <Link href="/solutions/state-agencies" className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                  Read Procurement Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Group 2: Citizens & Volunteers */}
            <div className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm space-y-6 flex flex-col justify-between hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block">
                  Citizen Level
                </span>
                <h3 className="text-2xl font-serif font-bold text-foreground leading-snug">Citizen Auditors &amp; Volunteers</h3>
                <p className="text-secondary leading-loose">
                  Written in plain, everyday language. You don't need to be a programmer to help maintain accurate community records. Think of Marigold as a smart magnifying glass running right on your computer.
                </p>
              </div>
              <div className="pt-6 border-t border-border-soft">
                <Link href="/solutions/citizens" className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                  Read Citizen Guide <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Group 3: Civic Lead Groups */}
            <div className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm space-y-6 flex flex-col justify-between hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block">
                  Organization Level
                </span>
                <h3 className="text-2xl font-serif font-bold text-foreground leading-snug">Civic Integrity Networks</h3>
                <p className="text-secondary leading-loose">
                  Unify your volunteer chapters across county lines. Share effective search queries and standardized review checklists exclusively with your trusted network without broadcasting public data.
                </p>
              </div>
              <div className="pt-6 border-t border-border-soft">
                <Link href="/solutions/organizations" className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                  Read Coalition Guide <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (The In-Memory Engine) */}
        <section className="bg-foreground text-background rounded-[24px] p-12 sm:p-20 shadow-xl space-y-16 max-w-6xl mx-auto relative overflow-hidden animate-in fade-in duration-1000 slide-in-from-bottom-8">
          {/* subtle background pattern could go here */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Fingerprint className="w-96 h-96" />
          </div>

          <div className="text-center space-y-6 relative z-10 max-w-3xl mx-auto">
            <span className="text-primary font-bold text-xs uppercase tracking-widest font-mono border border-primary/30 px-4 py-2 rounded-full">
              The Technological Breakthrough
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white">Inverting Traditional Cloud Architecture</h2>
            <p className="text-background/80 text-lg leading-loose">
              Traditional platforms force counties to upload sensitive citizen records to centralized cloud servers. Marigold brings the verification algorithms directly down to your local computer instead.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 pt-8 relative z-10">
            <div className="space-y-4">
              <div className="text-sm font-bold text-primary font-mono tracking-widest uppercase border-b border-background/20 pb-2">Step 01</div>
              <h4 className="font-serif font-bold text-white text-2xl tracking-tight">Download Checklist</h4>
              <p className="text-background/70 leading-loose">
                Browse the public library and download a standardized text file (e.g., National Change of Address verification filter) directly to your computer.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold text-primary font-mono tracking-widest uppercase border-b border-background/20 pb-2">Step 02</div>
              <h4 className="font-serif font-bold text-white text-2xl tracking-tight">Select Local File</h4>
              <p className="text-background/70 leading-loose">
                Open your jurisdiction's official spreadsheet on your computer. The browser maps columns securely in local computer RAM without any internet uploads.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold text-primary font-mono tracking-widest uppercase border-b border-background/20 pb-2">Step 03</div>
              <h4 className="font-serif font-bold text-white text-2xl tracking-tight">Instant Audit Results</h4>
              <p className="text-background/70 leading-loose">
                Client-side memory processes up to 100,000 rows per second, isolating clerical formatting errors and producing clean verification reports instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Showcase Grid */}
        <section className="space-y-16 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground tracking-tight">Explore Core System Modules</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8">
            <Link href="/store" className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm hover:border-primary transition-colors group flex justify-between items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-widest font-mono block">Shared Library</span>
                <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">National Audit Checklists</h3>
                <p className="text-secondary leading-relaxed">Crowdsourced verification parameters shareable across state lines.</p>
              </div>
              <span className="text-3xl group-hover:translate-x-2 transition-transform font-light text-primary/50 group-hover:text-primary">→</span>
            </Link>

            <Link href="/data-linkage" className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm hover:border-primary transition-colors group flex justify-between items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-widest font-mono block">Statistical Matching</span>
                <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">Smart Duplicate Finder</h3>
                <p className="text-secondary leading-relaxed">Test our probabilistic fuzzy linkage simulator directly in your browser.</p>
              </div>
              <span className="text-3xl group-hover:translate-x-2 transition-transform font-light text-primary/50 group-hover:text-primary">→</span>
            </Link>

            <Link href="/registry" className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm hover:border-primary transition-colors group flex justify-between items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-widest font-mono block">50-State Index</span>
                <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">State Acquisition Registry</h3>
                <p className="text-secondary leading-relaxed">View formatting parameters and statutory cost structures nationwide.</p>
              </div>
              <span className="text-3xl group-hover:translate-x-2 transition-transform font-light text-primary/50 group-hover:text-primary">→</span>
            </Link>

            <Link href="/roadmap" className="bg-card-bg p-10 rounded-[12px] border border-border shadow-sm hover:border-primary transition-colors group flex justify-between items-center">
              <div className="space-y-3">
                <span className="text-xs font-bold text-primary uppercase tracking-widest font-mono block">Civic Integration</span>
                <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">Technical Roadmap</h3>
                <p className="text-secondary leading-relaxed">Cross-agency integrations and federal grant alignment milestones.</p>
              </div>
              <span className="text-3xl group-hover:translate-x-2 transition-transform font-light text-primary/50 group-hover:text-primary">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
