"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export function Navbar() {
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

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
            <Link href="/sandbox" className="hover:text-amber-400 transition-colors">Public Sandbox</Link>
            <Link href="/store" className="hover:text-amber-400 transition-colors">Audit Checklists</Link>
            <Link href="/registry" className="hover:text-amber-400 transition-colors">State Registry</Link>
            <Link href="/compliance" className="hover:text-amber-400 transition-colors">FEMA Compliance</Link>
            
            {/* More Resources Dropdown */}
            <div className="relative" onMouseLeave={() => setMoreDropdownOpen(false)}>
              <button 
                onMouseEnter={() => setMoreDropdownOpen(true)}
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="flex items-center gap-1 hover:text-white py-2 transition-colors focus:outline-none"
              >
                <span>More</span>
                <span className="text-xs">▾</span>
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <Link href="/perspectives" onClick={() => setMoreDropdownOpen(false)} className="block px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    🌐 Worldviews &amp; FAQ
                  </Link>
                  <Link href="/roadmap" onClick={() => setMoreDropdownOpen(false)} className="block px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    🗺️ Technical Roadmap
                  </Link>
                  <Link href="/deploy" onClick={() => setMoreDropdownOpen(false)} className="block px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    🏛️ Bring to Your State
                  </Link>
                  <div className="border-t border-slate-800 my-1"></div>
                  <Link href="/anniversary" onClick={() => setMoreDropdownOpen(false)} className="block px-4 py-2.5 text-amber-400 font-bold hover:bg-slate-800 transition-colors">
                    🎆 250th Celebration
                  </Link>
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
                <span>→</span>
              </Link>
              <UserButton />
            </Show>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3 text-sm font-medium text-slate-300 px-2 pb-2">
            <Link href="/sandbox" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Public Sandbox</Link>
            <Link href="/store" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Audit Checklists</Link>
            <Link href="/registry" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">State Registry</Link>
            <Link href="/compliance" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">FEMA Compliance</Link>
            <Link href="/perspectives" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Worldviews &amp; FAQ</Link>
            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Technical Roadmap</Link>
            <Link href="/deploy" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 hover:text-amber-400">Bring to Your State</Link>
            <Link href="/anniversary" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded hover:bg-slate-900 text-amber-400 font-bold">🎆 250th Celebration</Link>
          </nav>
        )}
      </header>

      {/* Persistent Disclaimer Banner (Hidden on landing page to avoid grey bar above hero) */}
      {pathname !== '/' && (
        <div className="bg-slate-100 border-b border-border text-slate-700 px-6 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-6xl mx-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>
              <strong className="font-bold text-slate-900">Architecture Notice:</strong> This execution engine processes all civic records 100% locally inside client memory. Zero citizen files are ever uploaded or transmitted.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
