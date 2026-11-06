"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Search,
  Users,
  BookOpen,
  Fingerprint,
  FileText,
  Globe,
  ShieldCheck,
  Terminal,
  HeartHandshake,
  Building2,
  Layers,
  Download,
} from "lucide-react";

const REGIONS = [
  {
    id: 0,
    tab: "🎆 250th Anniversary",
    lyric: "Proclaim Liberty throughout all the land...",
    region: "Heritage & Self-Governance",
    location: "Celebrating 250 Years of American Independence & Civic Legacy",
    bg: "/bg-0.jpg",
    video: "/vid-0.mp4",
  },
  {
    id: 1,
    tab: "🏙️ America the Modern",
    lyric: "Thriving cities gleam, undimmed by human tears...",
    region: "Innovation & Metropolis",
    location: "Celebrating American Enterprise, Modern Infrastructure & Urban Opportunity",
    bg: "/bg-1.jpg",
    video: "/vid-1.mp4",
  },
  {
    id: 2,
    tab: "🌾 America the Beautiful",
    lyric: "O beautiful for spacious skies and amber waves of grain...",
    region: "Heartland & Bounty",
    location: "Celebrating Our Agricultural Plains & Vast Heartlands",
    bg: "/bg-2.jpg",
    video: "/vid-2.mp4",
  },
  {
    id: 3,
    tab: "🏔️ Mountain Majesties",
    lyric: "For purple mountain majesties above the fruited plain...",
    region: "Majesty & Preservation",
    location: "Celebrating Our High Country Glaciers & Natural Heritage",
    bg: "/bg-3.jpg",
    video: "/vid-3.mp4",
  },
  {
    id: 4,
    tab: "🤝 Sea to Shining Sea",
    lyric: "Crown thy good with brotherhood, from sea to shining sea...",
    region: "Unity & Transparency",
    location: "Celebrating 50 States United by Open-Source Citizen Verification",
    bg: "/bg-4.jpg",
    video: "/vid-4.mp4",
  },
];

export default function MarketingHomePage() {
  const [activeRegion, setActiveRegion] = useState(0);
  const current = REGIONS[activeRegion];
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRegion((prev) => (prev + 1) % REGIONS.length);
    }, 7000);
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
      {/* ---------- HERO SECTION (High Contrast + Above-the-Fold Capability Cards) ---------- */}
      <section className="w-full relative overflow-hidden border-b border-border px-4 sm:px-6 pt-12 pb-14 sm:pt-16 sm:pb-16">
        {/* Background Scenic Layer with High-Readability Warm Veil */}
        <div className="absolute inset-0 z-0 bg-background" />
        <div className="absolute inset-0 z-0 opacity-30 overflow-hidden mix-blend-multiply pointer-events-none">
          {REGIONS.map((reg) => (
            <React.Fragment key={reg.id}>
              <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                  activeRegion === reg.id ? "opacity-100" : "opacity-0"
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
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  activeRegion === reg.id ? "opacity-100" : "opacity-0"
                }`}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FAF8F5]/85 via-[#FAF8F5]/75 to-[#FAF8F5] pointer-events-none" />

        {/* Foreground Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Trust & Privacy Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-3.5 py-1.5 uppercase tracking-wider text-foreground border border-foreground/20 bg-white/90 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              100% Zero-PII Cloud Safe
            </span>
            <span className="font-mono text-xs font-bold px-3.5 py-1.5 uppercase tracking-wider text-foreground border border-foreground/20 bg-white/90 rounded-full shadow-2xs">
              Runs Locally in Your Browser
            </span>
            <span className="font-mono text-xs font-bold px-3.5 py-1.5 uppercase tracking-wider text-primary border border-primary/30 bg-amber-50/90 rounded-full shadow-2xs">
              14 Non-Partisan Checks
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-serif font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]">
            Verify Public Voter Rolls Directly on Your Own Computer.
          </h1>

          {/* Clear, Concrete Subheadline */}
          <p className="mt-5 text-lg sm:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed font-normal">
            Marigold lets citizens, election officials, and civic groups audit millions of voter and ballot records in seconds—<strong>with zero cloud uploads, zero personal data exposed, and ordinary dorms, nursing homes, and Jr./Sr. families filtered out first.</strong>
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3.5">
            <Link
              href="/sign-up"
              className="btn-primary h-13 px-7 text-base font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="h-13 px-7 text-base font-bold rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Explore State Audits (MS &amp; NC)</span>
            </Link>
            <Link
              href="/overview"
              className="btn-secondary h-13 px-6 text-base font-bold rounded-xl bg-white/95 shadow-2xs flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Read 1-Page Overview</span>
            </Link>
          </div>

          {/* 3 Above-the-Fold Quick-Start Cards (So Users Immediately See What Marigold Does) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="group bg-white/95 backdrop-blur-xs border border-border hover:border-primary rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Live Public Reports
                  </span>
                  <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Mississippi &amp; North Carolina Audits
                </h2>
                <p className="mt-1.5 text-sm text-secondary leading-relaxed">
                  Inspect 182 counties and 61.4M verified ballot records across all 14 checks, or print any county&apos;s 1-page PDF dossier.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-soft text-xs font-bold text-primary flex items-center gap-1">
                <span>Browse 82 MS &amp; 100 NC counties →</span>
              </div>
            </Link>

            <Link
              href="/manifold"
              className="group bg-white/95 backdrop-blur-xs border border-border hover:border-primary rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Interactive 3D Studio
                  </span>
                  <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  3D County Priority Map
                </h2>
                <p className="mt-1.5 text-sm text-secondary leading-relaxed">
                  Rotate and compare counties across high-density addresses, out-of-state mailings, and 3,000+ voter precincts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-soft text-xs font-bold text-primary flex items-center gap-1">
                <span>Open 3D County Explorer →</span>
              </div>
            </Link>

            <Link
              href="/sandbox"
              className="group bg-white/95 backdrop-blur-xs border border-border hover:border-primary rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    No Sign-In Needed
                  </span>
                  <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Try the Local Browser Sandbox
                </h2>
                <p className="mt-1.5 text-sm text-secondary leading-relaxed">
                  Test our in-browser DuckDB &amp; Web Worker engine on sample records or drop your own CSV file with zero internet uploads.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border-soft text-xs font-bold text-primary flex items-center gap-1">
                <span>Launch Public Sandbox →</span>
              </div>
            </Link>
          </div>

          {/* Subtle Lyric & Scroll Invitation */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60 text-xs text-secondary">
            <div className="italic font-serif text-sm text-foreground/80">
              &ldquo;{current.lyric}&rdquo; — <span className="not-italic font-sans text-xs text-secondary">{current.location}</span>
            </div>
            <a
              href="#live-benchmarks"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              <span>Scroll to see how Marigold works</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- MAIN CONTENT CONTAINER ---------- */}
      <div className="space-y-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        {/* SECTION 01: Live State Benchmarks (Mississippi & North Carolina) */}
        <section id="live-benchmarks" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <div className="space-y-2 max-w-2xl">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                01 · Live Empirical Benchmarks
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
                See Real Statewide Audits in Action
              </h2>
              <p className="text-secondary text-base sm:text-lg leading-relaxed">
                We ran the exact same 14 non-partisan checks across both <strong>Mississippi (82 counties)</strong> and <strong>North Carolina (100 counties)</strong>. Switch between states at any time or download the printable magazine PDFs for public meetings.
              </p>
            </div>
            <Link
              href="/playbooks"
              className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5 shrink-0"
            >
              <span>View all 14 audit checks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mississippi Card */}
            <div className="bg-white rounded-2xl border border-border p-7 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Mississippi · 82 Counties
                  </span>
                  <span className="font-mono text-xs text-secondary">Oct 26, 2026 Extract</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground">
                  2,112,460 Voters &amp; 25.91M Past Ballots Audited
                </h3>
                <p className="text-sm sm:text-base text-secondary leading-relaxed">
                  100% of past ballots matched a registered voter (+835,571 ballots added in 2025–2026). 64 of 82 counties sit within the normal baseline range; 18 priority counties have focused checklists for County Election Commissioners.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-soft text-center">
                  <div className="bg-background rounded-xl p-3">
                    <div className="font-serif text-xl font-bold text-foreground">25.91M</div>
                    <div className="text-[11px] font-mono uppercase text-secondary mt-0.5">Ballots Verified</div>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <div className="font-serif text-xl font-bold text-foreground">64 / 82</div>
                    <div className="text-[11px] font-mono uppercase text-secondary mt-0.5">Normal Range</div>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <div className="font-serif text-xl font-bold text-primary">82.1%</div>
                    <div className="text-[11px] font-mono uppercase text-secondary mt-0.5">Movers Inactive</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/reports/mississippi-playbook-analysis?state=MS"
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
                >
                  <span>Open Mississippi Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="/Marigold-Mississippi-Playbook-Analysis.pdf"
                  download
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs sm:text-sm font-bold text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span>82-County PDF</span>
                </a>
              </div>
            </div>

            {/* North Carolina Card */}
            <div className="bg-white rounded-2xl border border-border p-7 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    North Carolina · 100 Counties
                  </span>
                  <span className="font-mono text-xs text-secondary">Nov 1, 2026 Extract</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground">
                  7,900,954 Live Voters &amp; 35.53M Past Ballots Audited
                </h3>
                <p className="text-sm sm:text-base text-secondary leading-relaxed">
                  Streamed directly from NCSBE statewide archives (+2,333,428 ballots added in 2025–2026 with 0 orphans). 66 of 100 counties sit in the normal baseline range; 34 have focused checklists for County Boards of Elections.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border-soft text-center">
                  <div className="bg-background rounded-xl p-3">
                    <div className="font-serif text-xl font-bold text-foreground">35.53M</div>
                    <div className="text-[11px] font-mono uppercase text-secondary mt-0.5">Ballots Verified</div>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <div className="font-serif text-xl font-bold text-foreground">66 / 100</div>
                    <div className="text-[11px] font-mono uppercase text-secondary mt-0.5">Normal Range</div>
                  </div>
                  <div className="bg-background rounded-xl p-3">
                    <div className="font-serif text-xl font-bold text-primary">16,858</div>
                    <div className="text-[11px] font-mono uppercase text-secondary mt-0.5">Jr./Sr. Protected</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/reports/mississippi-playbook-analysis?state=NC"
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5"
                >
                  <span>Open North Carolina Report</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="/Marigold-North-Carolina-Playbook-Analysis.pdf"
                  download
                  className="px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs sm:text-sm font-bold text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-primary" />
                  <span>100-County PDF</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: How It Works + Video Walkthrough */}
        <section className="bg-foreground text-background rounded-3xl p-8 sm:p-14 shadow-xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Fingerprint className="w-80 h-80" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest font-mono">
                02 · How Local-Compute Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
                Your Files Stay on Your Computer. The Math Comes to You.
              </h2>
              <p className="text-background/80 text-base sm:text-lg leading-relaxed">
                Traditional platforms force counties and citizens to upload sensitive voter files to centralized cloud servers. Marigold brings the 14 verification playbooks directly into your browser&apos;s local memory instead.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-white/10 px-2.5 py-1 rounded-md shrink-0 mt-0.5">
                    STEP 1
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-white text-lg">Select Any Official Voter File</h4>
                    <p className="text-sm text-background/75 leading-relaxed">
                      Open your county or state CSV/TXT spreadsheet right from your computer drive. Nothing is uploaded over the internet.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-white/10 px-2.5 py-1 rounded-md shrink-0 mt-0.5">
                    STEP 2
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-white text-lg">Automatic False-Alarm Filtering</h4>
                    <p className="text-sm text-background/75 leading-relaxed">
                      Our header-adaptive mapper normalizes state columns and sets aside college dorms, military bases, nursing homes, and Jr./Sr. households automatically.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-white/10 px-2.5 py-1 rounded-md shrink-0 mt-0.5">
                    STEP 3
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-white text-lg">Export Clean County Checklists</h4>
                    <p className="text-sm text-background/75 leading-relaxed">
                      Generate Zero-PII public summaries for public meetings or inspect flagged rows locally inside your authenticated workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/ec_vC_hvzbI?rel=0"
                  title="Marigold Introduction"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: Built for Every Civic Stakeholder */}
        <section className="space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
              03 · Who Uses Marigold
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
              Built for Election Officials, Citizens &amp; Coalitions
            </h2>
            <p className="text-secondary text-base sm:text-lg leading-relaxed">
              Every check is non-partisan—protecting eligible voters from being turned away while giving statutory boards clear list-maintenance checklists.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6 hover:border-primary/50 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block">
                  Election Officials
                </span>
                <h3 className="text-2xl font-serif font-bold text-foreground leading-snug">
                  County Commissioners &amp; State Boards
                </h3>
                <p className="text-sm sm:text-base text-secondary leading-relaxed">
                  Prepare statutory NVRA confirmation notices, verify split-ballot legislative precincts, and fulfill FEMA HSGP election security requirements with zero cloud risk.
                </p>
              </div>
              <div className="pt-4 border-t border-border-soft">
                <Link
                  href="/solutions/state-agencies"
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  Read Official &amp; Agency Guide <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6 hover:border-primary/50 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block">
                  Citizens &amp; Volunteers
                </span>
                <h3 className="text-2xl font-serif font-bold text-foreground leading-snug">
                  Local Citizen Reviewers
                </h3>
                <p className="text-sm sm:text-base text-secondary leading-relaxed">
                  Written in plain, everyday language. You don&apos;t need programming skills to review your county&apos;s public records and bring constructive, factual briefings to public meetings.
                </p>
              </div>
              <div className="pt-4 border-t border-border-soft">
                <Link
                  href="/solutions/citizens"
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  Read Citizen Guide <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-card-bg p-8 rounded-2xl border border-border shadow-2xs flex flex-col justify-between space-y-6 hover:border-primary/50 transition-colors">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-primary flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block">
                  Civic Organizations
                </span>
                <h3 className="text-2xl font-serif font-bold text-foreground leading-snug">
                  Multi-County Coalitions
                </h3>
                <p className="text-sm sm:text-base text-secondary leading-relaxed">
                  Unify volunteer chapters across county lines using standardized 14-playbook rubrics that eliminate false alarms before any findings are shared.
                </p>
              </div>
              <div className="pt-4 border-t border-border-soft">
                <Link
                  href="/solutions/organizations"
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  Read Coalition Guide <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: Support Marigold & Get Started Banner */}
        <section className="rounded-3xl border-2 border-foreground bg-card-bg p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-primary">
              <HeartHandshake className="w-4 h-4" />
              <span>04 · Support Marigold</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
              Help Bring Transparent, Zero-PII Audits to All 50 States
            </h2>
            <p className="text-secondary text-base sm:text-lg leading-relaxed">
              Share our county PDF briefings with your local election board, volunteer to test your state&apos;s voter roll format, or support our non-partisan civic infrastructure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/partnership"
              className="btn-primary h-12 px-6 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-xs"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Support Marigold</span>
            </Link>
            <Link
              href="/sign-up"
              className="btn-secondary h-12 px-6 rounded-xl text-sm font-bold inline-flex items-center gap-2 bg-white"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
