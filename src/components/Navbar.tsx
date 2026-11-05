"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { ChevronDown, ArrowRight, Menu, X, Globe, Map, Shield, ShieldAlert, Sparkles, Terminal, Code, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { StateSwitcherPill } from '@/lib/data/StateBenchmarkContext';

export function Navbar() {
  const pathname = usePathname() || '';
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  return (
    <>
      <header className="bg-background text-foreground py-4 px-4 sm:px-8 border-b border-border shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <MarigoldIcon className="w-7 h-7 flex-shrink-0 text-primary group-hover:scale-105 transition-transform drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-foreground leading-none group-hover:text-primary transition-colors">
                Marigold Insights
              </span>
              <span className="text-[0.65rem] sm:text-xs text-secondary font-semibold uppercase tracking-wider mt-1">
                Local-Compute Civic Analytics
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link href="/reports/mississippi-playbook-analysis" className="text-primary font-bold hover:opacity-80 transition-colors">State Audits (MS &amp; NC)</Link>
            <Link href="/manifold" className="text-secondary hover:text-primary transition-colors">3D Manifold</Link>
            <Link href="/playbooks" className="text-secondary hover:text-primary transition-colors">14 Playbooks</Link>
            <Link href="/updates" className="text-secondary hover:text-primary transition-colors">What&apos;s New</Link>
            
            {/* More Resources Dropdown */}
            <div 
              className="relative" 
              onMouseLeave={() => {
                setTimeout(() => setMoreDropdownOpen(false), 300);
              }}
            >
              <button 
                onMouseEnter={() => setMoreDropdownOpen(true)}
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="flex items-center gap-1 text-secondary hover:text-primary py-2 transition-colors focus:outline-none"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-border-soft rounded-xl shadow-lg py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/overview" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-primary font-bold hover:bg-muted transition-colors flex items-center gap-2 border-b border-border-soft bg-amber-50/50">
                    <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Overview &amp; One-Pager</span>
                  </Link>
                  <Link href="/reports/mississippi-playbook-analysis" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-semibold">State Playbook Reports (MS &amp; NC)</span>
                  </Link>
                  <Link href="/manifold" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-semibold">Three.js 3D Threat Manifold</span>
                  </Link>
                  <Link href="/updates" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">Release Notes (Plain English)</span>
                  </Link>
                  <Link href="/sandbox" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>Public Sandbox</span>
                  </Link>
                  <Link href="/registry" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Map className="w-4 h-4 flex-shrink-0" />
                    <span>State Registry</span>
                  </Link>
                  <Link href="/developers" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium">Developer API</span>
                  </Link>
                  <Link href="/election-integrity-presidential-address" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Election Integrity (July 16)</span>
                  </Link>
                  <Link href="/compliance" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>FEMA Compliance</span>
                  </Link>
                  <Link href="/perspectives" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span>Worldviews &amp; FAQ</span>
                  </Link>
                  <Link href="/roadmap" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Map className="w-4 h-4 flex-shrink-0" />
                    <span>Technical Roadmap</span>
                  </Link>
                  <Link href="/deploy" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>Bring to Your State</span>
                  </Link>
                  <div className="border-t border-border-soft my-1"></div>
                  <Link href="/anniversary" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-primary font-bold hover:bg-muted transition-colors flex items-center gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>250th Celebration</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Anchored Auth Buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-secondary hover:text-primary px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-[12px] shadow-sm transition-transform transform hover:-translate-y-0.5 flex items-center justify-center">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 text-xs sm:text-sm rounded-[12px] shadow-sm transition-transform transform hover:-translate-y-0.5 flex items-center gap-1.5"
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
              className="lg:hidden p-2 text-secondary hover:text-primary rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-border-soft flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link href="/reports/mississippi-playbook-analysis" onClick={() => setMobileMenuOpen(false)} className="text-primary font-bold px-2 py-1.5 transition-colors flex items-center gap-2 bg-amber-50/60 rounded-lg">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>State Playbook Reports (MS &amp; NC)</span>
            </Link>
            <Link href="/manifold" onClick={() => setMobileMenuOpen(false)} className="text-secondary font-semibold px-2 py-1 hover:text-primary transition-colors">3D Threat Manifold Explorer</Link>
            <Link href="/playbooks" onClick={() => setMobileMenuOpen(false)} className="text-secondary font-semibold px-2 py-1 hover:text-primary transition-colors">14 Guided Playbooks</Link>
            <Link href="/updates" onClick={() => setMobileMenuOpen(false)} className="text-secondary font-semibold px-2 py-1 hover:text-primary transition-colors">What&apos;s New (Release Post)</Link>
            <Link href="/overview" onClick={() => setMobileMenuOpen(false)} className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Overview &amp; One-Pager</Link>
            <Link href="/sandbox" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Public Sandbox</Link>
            <Link href="/registry" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">State Registry</Link>
          </nav>
        )}
      </header>

      {/* Persistent Disclaimer & Active State Benchmark Bar */}
      <div className="bg-card-bg border-b border-border text-foreground px-4 sm:px-6 py-2 text-xs md:text-sm font-medium shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse shrink-0"></span>
            <span>
              <strong className="font-bold">100% Voter Privacy Safe:</strong> All analysis runs locally with zero personal voter names, birth dates, or private single-family house numbers ever displayed or shared.
            </span>
          </div>
          <StateSwitcherPill compact />
        </div>
      </div>
    </>
  );
}

export default Navbar;
