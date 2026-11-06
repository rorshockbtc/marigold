"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { MarigoldIcon } from "@/components/MarigoldIcon";
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Globe,
  Map,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  Code,
  FileText,
  HeartHandshake,
  Users,
  Building2,
  CheckSquare,
  Layers,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function Navbar() {
  const pathname = usePathname() || "";
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"explore" | "resources" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      ref={navRef}
      className="bg-background/95 backdrop-blur-md text-foreground py-3.5 px-4 sm:px-8 border-b border-border shadow-2xs sticky top-0 z-50 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setOpenDropdown(null)}>
          <MarigoldIcon className="w-7 h-7 flex-shrink-0 text-primary group-hover:scale-105 transition-transform drop-shadow-2xs" />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
              Marigold Insights
            </span>
            <span className="text-[0.65rem] text-secondary font-semibold uppercase tracking-wider mt-1">
              Local-Compute Civic Analytics
            </span>
          </div>
        </Link>

        {/* Center Navigation — Grouped & Easy to Scan */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {/* 1. Flagship State Audits */}
          <Link
            href="/reports/mississippi-playbook-analysis"
            onClick={() => setOpenDropdown(null)}
            className={`px-3 py-2 rounded-lg font-bold transition-colors ${
              isActive("/reports")
                ? "bg-amber-500/15 text-primary"
                : "text-primary hover:bg-amber-500/10"
            }`}
          >
            State Audits (MS &amp; NC)
          </Link>

          {/* 2. 3D County Map */}
          <Link
            href="/manifold"
            onClick={() => setOpenDropdown(null)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              isActive("/manifold")
                ? "bg-muted text-foreground font-semibold"
                : "text-secondary hover:text-foreground hover:bg-muted/60"
            }`}
          >
            3D County Map
          </Link>

          {/* 3. Explore Tools Dropdown (Grouped into 2 Clear Columns) */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("explore")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "explore" ? null : "explore")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none ${
                openDropdown === "explore"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-secondary hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>Explore Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === "explore" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "explore" && (
              <div className="absolute left-0 top-full pt-2 w-[540px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-white border border-border rounded-2xl shadow-xl p-5 grid grid-cols-2 gap-6 text-sm">
                  {/* Column 1: Interactive Tools */}
                  <div className="space-y-2">
                    <div className="px-2.5 pb-1.5 border-b border-border-soft text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
                      Interactive Tools
                    </div>
                    <Link
                      href="/sandbox"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Terminal className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Public Sandbox</div>
                        <div className="text-xs text-secondary leading-snug">
                          Test local-browser CSV analysis with zero cloud uploads
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/playbooks"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">14 Audit Playbooks</div>
                        <div className="text-xs text-secondary leading-snug">
                          All 14 non-partisan voter roll &amp; ballot checks explained
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/registry"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Map className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">50-State Registry</div>
                        <div className="text-xs text-secondary leading-snug">
                          Public voter file access rules, prices &amp; formats by state
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/store"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <BookOpen className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Audit Checklists</div>
                        <div className="text-xs text-secondary leading-snug">
                          Downloadable SQL &amp; verification templates
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Column 2: Who Uses Marigold */}
                  <div className="space-y-2">
                    <div className="px-2.5 pb-1.5 border-b border-border-soft text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
                      Guides by Role
                    </div>
                    <Link
                      href="/overview"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/60 transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-primary">Overview &amp; One-Pager</div>
                        <div className="text-xs text-secondary leading-snug">
                          2-minute plain-English summary &amp; printable PDF
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/solutions/citizens"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Users className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">For Citizens &amp; Volunteers</div>
                        <div className="text-xs text-secondary leading-snug">
                          Review local rolls without programming skills
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/solutions/state-agencies"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Building2 className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">For Election Officials</div>
                        <div className="text-xs text-secondary leading-snug">
                          County commissioners, boards &amp; FEMA HSGP compliance
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/solutions/organizations"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Layers className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">For Civic Coalitions</div>
                        <div className="text-xs text-secondary leading-snug">
                          Coordinate county chapters with zero PII exposure
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Resources & Trust Dropdown (Grouped into 2 Clear Sections) */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("resources")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "resources" ? null : "resources")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer focus:outline-none ${
                openDropdown === "resources"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-secondary hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>Resources</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === "resources" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "resources" && (
              <div className="absolute right-0 top-full pt-2 w-[520px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-white border border-border rounded-2xl shadow-xl p-5 grid grid-cols-2 gap-6 text-sm">
                  {/* Section 1: Trust, Methodology & News */}
                  <div className="space-y-2">
                    <div className="px-2.5 pb-1.5 border-b border-border-soft text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
                      Methodology &amp; Trust
                    </div>
                    <Link
                      href="/updates"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">What&apos;s New</div>
                        <div className="text-xs text-secondary leading-snug">
                          Plain-English release notes &amp; audit updates
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/perspectives"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Worldviews &amp; FAQ</div>
                        <div className="text-xs text-secondary leading-snug">
                          How all parties benefit from clean, accurate rolls
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/compliance"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Shield className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">FEMA &amp; Zero-PII Standards</div>
                        <div className="text-xs text-secondary leading-snug">
                          Air-gapped browser security &amp; statutory compliance
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/election-integrity-presidential-address"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Why Local Compute Matters</div>
                        <div className="text-xs text-secondary leading-snug">
                          Preventing centralized cloud database breaches
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Section 2: Technical & Expansion */}
                  <div className="space-y-2">
                    <div className="px-2.5 pb-1.5 border-b border-border-soft text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
                      Developers &amp; State Rollout
                    </div>
                    <Link
                      href="/deploy"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Map className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Bring to Your State</div>
                        <div className="text-xs text-secondary leading-snug">
                          Request a statewide 14-playbook benchmark audit
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/developers"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Code className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Developer API &amp; Docs</div>
                        <div className="text-xs text-secondary leading-snug">
                          Algorithms, schemas &amp; verification proofs
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/roadmap"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Layers className="w-4 h-4 text-stone-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">Technical Roadmap</div>
                        <div className="text-xs text-secondary leading-snug">
                          Upcoming state integrations &amp; milestones
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/anniversary"
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary">250th Anniversary</div>
                        <div className="text-xs text-secondary leading-snug">
                          Celebrating 250 years of American self-governance
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Support Marigold (Top-Level Dedicated Link) */}
          <Link
            href="/partnership"
            onClick={() => setOpenDropdown(null)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive("/partnership") || isActive("/partners")
                ? "bg-amber-500/15 text-primary font-bold"
                : "text-secondary hover:text-primary hover:bg-muted/60 font-semibold"
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-amber-700" />
            <span>Support Marigold</span>
          </Link>
        </nav>

        {/* Right Action Anchored Auth Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:block text-sm font-semibold text-secondary hover:text-primary px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 sm:px-5 py-2.5 text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <UserButton />
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-secondary hover:text-primary rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu — Cleanly Divided into Sections */}
      {mobileMenuOpen && (
        <nav className="lg:hidden mt-3 pt-4 border-t border-border-soft space-y-5 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Section 1: Flagship Audits */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
              Live State Audits
            </div>
            <Link
              href="/reports/mississippi-playbook-analysis"
              onClick={() => setMobileMenuOpen(false)}
              className="text-primary font-bold px-3 py-2 rounded-xl flex items-center gap-2.5 bg-amber-50/80 border border-amber-200/60"
            >
              <FileText className="w-4 h-4 text-amber-700 shrink-0" />
              <span>State Playbook Reports (MS &amp; NC)</span>
            </Link>
            <Link
              href="/manifold"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground font-semibold px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2.5"
            >
              <Globe className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Interactive 3D County Map</span>
            </Link>
          </div>

          {/* Section 2: Explore Tools & Guides */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
              Tools &amp; Role Guides
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <Link
                href="/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground font-semibold px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Overview &amp; One-Pager</span>
              </Link>
              <Link
                href="/sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground font-semibold px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-amber-700" />
                <span>Public Sandbox</span>
              </Link>
              <Link
                href="/playbooks"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground font-semibold px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4 text-amber-700" />
                <span>14 Guided Playbooks</span>
              </Link>
              <Link
                href="/registry"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground font-semibold px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2"
              >
                <Map className="w-4 h-4 text-amber-700" />
                <span>50-State Registry</span>
              </Link>
              <Link
                href="/solutions/citizens"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary font-medium px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-stone-600" />
                <span>For Citizens &amp; Volunteers</span>
              </Link>
              <Link
                href="/solutions/state-agencies"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary font-medium px-3 py-2 rounded-xl hover:bg-muted flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-stone-600" />
                <span>For Election Officials</span>
              </Link>
            </div>
          </div>

          {/* Section 3: Support & Resources */}
          <div className="space-y-1.5 border-t border-border-soft pt-3">
            <div className="px-2 text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
              Mission &amp; Support
            </div>
            <Link
              href="/partnership"
              onClick={() => setMobileMenuOpen(false)}
              className="text-primary font-bold px-3 py-2 rounded-xl hover:bg-amber-50 flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-amber-700" />
              <span>Support Marigold</span>
            </Link>
            <div className="grid grid-cols-2 gap-1">
              <Link
                href="/updates"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-muted text-xs"
              >
                What&apos;s New
              </Link>
              <Link
                href="/perspectives"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-muted text-xs"
              >
                Worldviews &amp; FAQ
              </Link>
              <Link
                href="/deploy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-muted text-xs"
              >
                Bring to Your State
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary font-medium px-3 py-1.5 rounded-lg hover:bg-muted text-xs"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
