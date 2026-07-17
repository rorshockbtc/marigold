"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { Globe, Map, Shield, Sparkles, X, Menu, ArrowRight, ChevronDown, BookOpen } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMoreDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMoreDropdownOpen(false);
    }, 250);
  };

  return (
    <>
      <header className="bg-slate-950 text-white py-3.5 px-4 sm:px-8 border-b border-slate-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <MarigoldIcon className="w-7 h-7 flex-shrink-0 text-amber-400 group-hover:scale-105 transition-transform drop-shadow" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-white leading-none">
                Marigold Insights
              </span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mt-0.5">
                Local-Compute Civic Analytics
              </span>
            </div>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="/sandbox" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Public Sandbox ↗</a>
            <Link href="/store" className="hover:text-amber-400 transition-colors">Audit Checklists</Link>
            <Link href="/registry" className="hover:text-amber-400 transition-colors">State Registry</Link>
            <Link href="/compliance" className="hover:text-amber-400 transition-colors">FEMA Compliance</Link>
            <Link href="/partners" className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-sm">
              <span>🤝 Partnerships</span>
            </Link>
            
            {/* More Resources Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="flex items-center gap-1 hover:text-white py-2 transition-colors focus:outline-none"
                aria-expanded={moreDropdownOpen}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 z-50">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 text-xs">
                    <Link href="/learning-center" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Learning Center</span>
                    </Link>
                    <Link href="/perspectives" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>Worldviews &amp; FAQ</span>
                    </Link>
                    <Link href="/roadmap" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                      <Map className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Technical Roadmap</span>
                    </Link>
                    <Link href="/deploy" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Bring to Your State</span>
                    </Link>
                    <div className="border-t border-slate-800 my-1"></div>
                    <Link href="/election-integrity-presidential-address" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-amber-300 font-extrabold hover:bg-slate-800 transition-colors flex items-center gap-2 bg-amber-500/10">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>White House Intel Hub</span>
                    </Link>
                    <Link href="/anniversary" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-amber-400 font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>250th Celebration</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Anchored Auth Buttons */}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-lg shadow-md transition-all transform hover:-translate-y-0.5">
                  Get Started
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link 
                href="/dashboard"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm rounded-lg shadow transition-all flex items-center gap-1.5"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <UserButton />
            </Show>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2 text-sm font-medium text-slate-300 px-2 pb-2">
            <a href="/sandbox" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Public Sandbox ↗</a>
            <Link href="/store" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Audit Checklists</Link>
            <Link href="/registry" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">State Registry</Link>
            <Link href="/compliance" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">FEMA Compliance</Link>
            <Link href="/partners" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded bg-amber-500/10 text-amber-400 font-bold flex items-center gap-2 border border-amber-500/30">
              <span>🤝 Beta Partnerships &amp; Grants</span>
            </Link>
            <Link href="/learning-center" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Learning Center</span>
            </Link>
            <Link href="/perspectives" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Worldviews &amp; FAQ</span>
            </Link>
            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400 flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-400" />
              <span>Technical Roadmap</span>
            </Link>
            <Link href="/deploy" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Bring to Your State</span>
            </Link>
            <Link href="/election-integrity-presidential-address" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded bg-amber-500/15 text-amber-300 font-extrabold flex items-center gap-2 border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>White House Intel Hub</span>
            </Link>
            <Link href="/anniversary" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 text-amber-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>250th Celebration</span>
            </Link>
          </nav>
        )}
      </header>

      {/* Breaking Presidential Address Announcement Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shadow-md">
        <span>🏛️ [July 16 Presidential Address] Explore 50+ Declassified Election Integrity Files &amp; Multi-Perspective AI Analysis &rarr;</span>
        <Link 
          href="/election-integrity-presidential-address" 
          className="bg-slate-950 text-amber-300 hover:bg-slate-900 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow transition-transform hover:scale-105"
        >
          Explore Hub
        </Link>
      </div>

      {/* Persistent Disclaimer Banner */}
      <div className="bg-slate-100 border-b border-border text-slate-700 px-6 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 max-w-6xl mx-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          <span>
            <strong className="font-bold text-slate-900">Architecture Notice:</strong> This execution engine processes all civic records 100% locally inside client memory. Zero citizen files are ever uploaded or transmitted.
          </span>
        </div>
      </div>
    </>
  );
}
