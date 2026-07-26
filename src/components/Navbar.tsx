"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { MarigoldIcon } from '@/components/MarigoldIcon';
import { ChevronDown, ArrowRight, Menu, X, Globe, Map, Shield, Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

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
            <Link href="/sandbox" className="text-secondary hover:text-primary transition-colors">Public Sandbox</Link>
            <Link href="/store" className="text-secondary hover:text-primary transition-colors">Audit Checklists</Link>
            <Link href="/registry" className="text-secondary hover:text-primary transition-colors">State Registry</Link>
            
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
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-border-soft rounded-xl shadow-lg py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link href="/developers" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Terminal className="w-4 h-4 flex-shrink-0" />
                    <span>Developer Docs</span>
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
                  <Link href="/contact" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span>Contact Architecture Desk</span>
                  </Link>
                  <Link href="/partnership" onClick={() => setMoreDropdownOpen(false)} className="px-4 py-2.5 text-secondary hover:bg-muted hover:text-primary transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>Partner With Us</span>
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
            <Link href="/sandbox" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Public Sandbox</Link>
            <Link href="/store" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Audit Checklists</Link>
            <Link href="/registry" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">State Registry</Link>
            <Link href="/developers" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Developer Docs</Link>
            <Link href="/compliance" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">FEMA Compliance</Link>
            <Link href="/perspectives" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Worldviews &amp; FAQ</Link>
            <Link href="/roadmap" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Technical Roadmap</Link>
            <Link href="/deploy" className="text-secondary font-medium px-2 py-1 hover:text-primary transition-colors">Bring to Your State</Link>
            <Link href="/anniversary" className="text-primary font-bold px-2 py-1 transition-colors">250th Celebration</Link>
          </nav>
        )}
      </header>

      {/* Persistent Disclaimer Banner */}
      <div className="bg-card-bg border-b border-border text-foreground px-6 py-2.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse"></span>
          <span>
            <strong className="font-bold">Architecture Notice:</strong> This execution engine processes all civic records 100% locally inside client memory. Zero citizen files are ever uploaded or transmitted.
          </span>
        </div>
      </div>
    </>
  );
}
