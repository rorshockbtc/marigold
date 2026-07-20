"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Menu, X, Type, AlertTriangle } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname() || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setMounted(true);
    const savedScale = localStorage.getItem('marigold_large_text');
    if (savedScale === 'true') {
      setIsLargeText(true);
    }
    
    const savedWarning = localStorage.getItem('marigold_mobile_warning_dismissed');
    if (savedWarning === 'true') {
      setShowMobileWarning(false);
    }
  }, []);

  // Handle Text Scale Toggle
  useEffect(() => {
    if (!mounted) return;
    
    if (isLargeText) {
      document.documentElement.style.fontSize = '20px';
      localStorage.setItem('marigold_large_text', 'true');
    } else {
      document.documentElement.style.fontSize = '16px';
      localStorage.setItem('marigold_large_text', 'false');
    }
  }, [isLargeText, mounted]);

  const dismissWarning = () => {
    setShowMobileWarning(false);
    localStorage.setItem('marigold_mobile_warning_dismissed', 'true');
  };

  return (
    <>
      {/* Mobile Warning Banner */}
      {showMobileWarning && (
        <div className="md:hidden bg-[#D9777F] text-white p-3 text-sm flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
            <span className="font-medium leading-tight">
              Hey there! Mobile is great for browsing, but the data restrictions are much harder on a phone. For users who want performance, Marigold is completely desktop-first.
            </span>
          </div>
          <button 
            onClick={dismissWarning}
            className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className="h-[68px] min-h-[68px] bg-[#110f0e] border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 transition-all">
        
        {/* Brand Architecture */}
        <Link href="/" className="flex flex-col gap-0.5 group">
          <div className="font-sans text-[0.85rem] font-medium tracking-[2.5px] uppercase text-[#f1ebd8] group-hover:text-[#D9777F] transition-colors">
            Marigold Insights
          </div>
          <div className="font-sans text-[0.65rem] font-light tracking-[0.5px] text-[#f1ebd8]/60 uppercase">
            Local-Compute Civic Analytics
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link href="/sandbox" className="inline-flex items-center px-4 py-2 text-[0.72rem] font-medium tracking-[1px] uppercase text-[#f1ebd8] hover:text-white bg-white/5 border border-white/10 hover:border-[#D9777F] hover:bg-white/10 transition-all rounded-[4px] mx-1">
            Sandbox
          </Link>
          <Link href="/macro" className="inline-flex items-center px-4 py-2 text-[0.72rem] font-medium tracking-[1px] uppercase text-[#f1ebd8] hover:text-white bg-white/5 border border-white/10 hover:border-[#D9777F] hover:bg-white/10 transition-all rounded-[4px] mx-1">
            State Trends
          </Link>
          <Link href="/learning-center" className="inline-flex items-center px-4 py-2 text-[0.72rem] font-medium tracking-[1px] uppercase text-[#f1ebd8] hover:text-white bg-white/5 border border-white/10 hover:border-[#D9777F] hover:bg-white/10 transition-all rounded-[4px] mx-1">
            Knowledge Base
          </Link>
          <Link href="/developers" className="inline-flex items-center px-4 py-2 text-[0.72rem] font-medium tracking-[1px] uppercase text-[#f1ebd8] hover:text-white bg-white/5 border border-white/10 hover:border-[#D9777F] hover:bg-white/10 transition-all rounded-[4px] mx-1">
            Architecture
          </Link>
          
          <div className="w-[1px] h-[18px] bg-white/20 mx-2"></div>

          {/* Action Area */}
          <div className="flex items-center gap-3 ml-2">
            
            {/* Display Toggle */}
            <button
              onClick={() => setIsLargeText(!isLargeText)}
              title="Toggle Large Text"
              className={`p-2 rounded-md transition-colors ${isLargeText ? 'bg-[#D9777F] text-white' : 'text-[#f1ebd8]/70 hover:text-white hover:bg-white/10'}`}
            >
              <Type className="w-4 h-4" />
            </button>

            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button className="text-[0.72rem] font-medium tracking-[1px] uppercase text-[#f1ebd8]/70 hover:text-white px-2 transition-colors focus:outline-none">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="inline-flex items-center justify-center px-5 py-2 text-[0.75rem] font-medium tracking-[1.5px] uppercase text-white bg-[#D9777F] border border-[#D9777F] shadow-[0_4px_14px_rgba(217,119,127,0.3)] hover:bg-[#e3868e] hover:border-[#e3868e] hover:shadow-[0_6px_18px_rgba(217,119,127,0.45)] hover:-translate-y-[1px] transition-all rounded-full focus:outline-none">
                  Initialize
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2 text-[0.75rem] font-medium tracking-[1.5px] uppercase text-white bg-[#D9777F] border border-[#D9777F] shadow-[0_4px_14px_rgba(217,119,127,0.3)] hover:bg-[#e3868e] hover:border-[#e3868e] hover:shadow-[0_6px_18px_rgba(217,119,127,0.45)] hover:-translate-y-[1px] transition-all rounded-full focus:outline-none"
              >
                Enter Workspace
              </Link>
              <div className="ml-2">
                <UserButton />
              </div>
            </Show>
          </div>
        </nav>

        {/* Mobile Actions */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setIsLargeText(!isLargeText)}
            title="Toggle Large Text"
            className={`p-1.5 rounded-md transition-colors ${isLargeText ? 'bg-[#D9777F] text-white' : 'text-[#f1ebd8]/70 hover:text-white hover:bg-white/10'}`}
          >
            <Type className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#f1ebd8]/70 hover:text-white p-1.5 focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-[#1c1917] border-b border-white/10 px-4 py-4 flex flex-col gap-2">
          <Link href="/sandbox" className="px-4 py-3 border border-white/10 rounded bg-white/5 text-[0.75rem] font-medium tracking-[1px] uppercase text-[#f1ebd8]">Sandbox</Link>
          <Link href="/macro" className="px-4 py-3 border border-white/10 rounded bg-white/5 text-[0.75rem] font-medium tracking-[1px] uppercase text-[#f1ebd8]">State Trends</Link>
          <Link href="/learning-center" className="px-4 py-3 border border-white/10 rounded bg-white/5 text-[0.75rem] font-medium tracking-[1px] uppercase text-[#f1ebd8]">Knowledge Base</Link>
          <Link href="/developers" className="px-4 py-3 border border-white/10 rounded bg-white/5 text-[0.75rem] font-medium tracking-[1px] uppercase text-[#f1ebd8]">Architecture</Link>
        </nav>
      )}

      {/* Guided Context Bar */}
      <div className="h-[46px] min-h-[46px] bg-[#1c1917] border-b border-white/10 px-4 sm:px-8 flex items-center overflow-x-auto z-[9] gap-3">
        <span className="font-sans text-[0.7rem] font-normal tracking-[1.5px] uppercase text-[#f1ebd8]/50 whitespace-nowrap">
          Current Context:
        </span>
        <span className="inline-flex items-center px-3 py-1 bg-white/5 border border-[#D9777F] text-white font-sans text-[0.72rem] font-normal tracking-[1px] rounded-[4px] whitespace-nowrap shadow-[0_0_12px_rgba(217,119,127,0.25)]">
          System Overview
        </span>
      </div>
    </>
  );
}
