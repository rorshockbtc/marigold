"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { Globe, Map, Shield, Sparkles, X, Menu, ArrowRight, ChevronDown, BookOpen, Terminal, Activity } from 'lucide-react';

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
      <header className="bg-slate-100 text-slate-900 py-3.5 px-4 sm:px-8 border-b border-slate-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <MarigoldIcon className="w-7 h-7 flex-shrink-0 text-amber-400 group-hover:scale-105 transition-transform drop-shadow" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-slate-900 leading-none">
                Marigold Insights
              </span>
              <span className="text-[10px] text-[#D96B27] font-bold uppercase tracking-wider mt-0.5">
                Local-Compute Civic Analytics
              </span>
            </div>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <a href="/sandbox" target="_blank" rel="noopener noreferrer" className="hover:text-[#D96B27] transition-colors">Public Sandbox ↗</a>
            <Link href="/investors" className="text-amber-500 font-bold hover:text-amber-600 transition-colors">Investors & Vision</Link>
            <Link href="/store" className="hover:text-[#D96B27] transition-colors">Playbook Library</Link>
            <Link href="/macro" className="hover:text-[#D96B27] transition-colors font-bold text-indigo-600 flex items-center gap-1.5"><Activity className="w-4 h-4"/>Macro Trends</Link>
            <Link href="/compliance" className="hover:text-[#D96B27] transition-colors">FEMA Compliance</Link>
            <Link href="/learning-center" className="hover:text-[#D96B27] transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Docs & FAQ</span>
            </Link>
            <a href="mailto:sales@colonhyphenbracket.pink" className="text-white font-bold hover:text-white transition-colors flex items-center gap-1.5 bg-[#D96B27] px-3.5 py-1.5 rounded-full shadow-sm hover:bg-[#C85A1B]">
              <span>Contact Sales</span>
            </a>
            <div 
              className="relative" 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="flex items-center gap-1 hover:text-slate-900 py-2 transition-colors focus:outline-none"
                aria-expanded={moreDropdownOpen}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 z-50">
                  <div className="bg-slate-50 border border-slate-200 border border-slate-700 rounded-xl shadow-2xl py-2 text-xs">
                    <Link href="/learning-center" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Learning Center</span>
                    </Link>
                    <Link href="/perspectives" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>Worldviews &amp; FAQ</span>
                    </Link>
                    <Link href="/roadmap" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2">
                      <Map className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>Technical Roadmap</span>
                    </Link>
                    <Link href="/deploy" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Bring to Your State</span>
                    </Link>
                    <Link href="/developers" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2 font-bold tracking-tight">
                      <Terminal className="w-4 h-4 text-pink-500 flex-shrink-0" />
                      <span>Dev SDK</span>
                    </Link>
                    <div className="border-t border-slate-200 my-1"></div>
                    <Link href="/election-integrity-presidential-address" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-[#D96B27] font-extrabold hover:bg-slate-100 transition-colors flex items-center gap-2 bg-amber-50">
                      <Sparkles className="w-4 h-4 text-[#D96B27] flex-shrink-0" />
                      <span>White House Intel Hub</span>
                    </Link>
                    <Link href="/anniversary" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-[#D96B27] font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D96B27] flex-shrink-0" />
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
                <button className="btn-secondary px-3 py-1.5 h-auto text-xs sm:text-sm">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="btn-primary px-4 sm:px-5 py-1.5 h-auto text-xs sm:text-sm">
                  Get Started
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link 
                href="/dashboard"
                className="btn-primary px-4 py-1.5 h-auto text-xs sm:text-sm flex items-center gap-1.5"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <UserButton />
            </Show>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2 text-sm font-medium text-slate-700 px-2 pb-2">
            <a href="/sandbox" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27]">Public Sandbox ↗</a>
            <Link href="/investors" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded bg-amber-500 text-black font-bold border border-amber-600 hover:bg-amber-400">Investors & Vision</Link>
            <Link href="/store" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27]">Audit Checklists</Link>
            <Link href="/macro" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 text-indigo-600 font-bold flex items-center gap-2"><Activity className="w-4 h-4"/>Macro Trends</Link>
            <Link href="/registry" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27]">State Registry</Link>
            <Link href="/compliance" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27]">FEMA Compliance</Link>
            <Link href="/partners" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded bg-amber-50 text-[#D96B27] font-bold flex items-center gap-2 border border-amber-200">
              <span>🤝 Beta Partnerships &amp; Grants</span>
            </Link>
            <Link href="/learning-center" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D96B27]" />
              <span>Learning Center</span>
            </Link>
            <Link href="/perspectives" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27] flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Worldviews &amp; FAQ</span>
            </Link>
            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27] flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-700" />
              <span>Technical Roadmap</span>
            </Link>
            <Link href="/deploy" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27] flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Bring to Your State</span>
            </Link>
            <Link href="/developers" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 hover:text-[#D96B27] flex items-center gap-2 font-bold tracking-tight">
              <Terminal className="w-4 h-4 text-pink-500" />
              <span>Dev SDK</span>
            </Link>
            <Link href="/election-integrity-presidential-address" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded bg-amber-50 text-[#D96B27] font-extrabold flex items-center gap-2 border border-amber-200">
              <Sparkles className="w-4 h-4 text-[#D96B27]" />
              <span>White House Intel Hub</span>
            </Link>
            <Link href="/anniversary" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-50 border border-slate-200 text-[#D96B27] font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D96B27]" />
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
          className="bg-white text-[#D96B27] hover:bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow transition-transform hover:scale-105"
        >
          Explore Hub
        </Link>
      </div>

      {/* Persistent Disclaimer Banner */}
      <div className="bg-slate-100 border-b border-border text-slate-700 px-6 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 max-w-6xl mx-auto">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          <span>
            <strong className="font-bold text-slate-900">Privacy Guarantee:</strong> Your data never leaves your computer. No citizen files are ever uploaded or transmitted.
          </span>
        </div>
      </div>
    </>
  );
}
