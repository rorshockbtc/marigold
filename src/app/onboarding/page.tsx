"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Database, Shield, Terminal } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#161413] text-[#f1ebd8] font-sans selection:bg-[#D9777F] selection:text-white flex flex-col">
      
      {/* Minimal Header */}
      <header className="h-[68px] border-b border-white/10 px-8 flex items-center justify-between">
        <div className="text-[0.65rem] font-medium tracking-[2px] uppercase text-[#f1ebd8]/70">
          System Initialization Sequence
        </div>
        <Link href="/" className="text-[0.65rem] font-medium tracking-[2px] uppercase text-[#f1ebd8]/50 hover:text-[#D9777F] transition-colors">
          Abort Sequence
        </Link>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Context & Progress */}
        <div className="lg:col-span-4 border-r border-white/10 bg-[#110f0e] p-8 md:p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-light font-serif mb-12">Initialization</h1>
            
            {/* Progress Track */}
            <div className="space-y-8">
              
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {step > 1 ? (
                    <div className="w-5 h-5 rounded-sm bg-[#D9777F] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-sm border border-[#D9777F] bg-[#D9777F]/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#D9777F] rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className={`text-[0.7rem] tracking-[1.5px] uppercase font-medium ${step >= 1 ? 'text-[#f1ebd8]' : 'text-[#f1ebd8]/40'}`}>
                    Architecture Briefing
                  </div>
                  <div className="text-[0.75rem] text-[#f1ebd8]/50 mt-1 font-light">Zero-trust fundamentals.</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {step > 2 ? (
                    <div className="w-5 h-5 rounded-sm bg-[#D9777F] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : step === 2 ? (
                    <div className="w-5 h-5 rounded-sm border border-[#D9777F] bg-[#D9777F]/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#D9777F] rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-sm border border-white/20 bg-[#1c1917]"></div>
                  )}
                </div>
                <div>
                  <div className={`text-[0.7rem] tracking-[1.5px] uppercase font-medium ${step >= 2 ? 'text-[#f1ebd8]' : 'text-[#f1ebd8]/40'}`}>
                    Environment Setup
                  </div>
                  <div className="text-[0.75rem] text-[#f1ebd8]/50 mt-1 font-light">Local processing requirements.</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {step === 3 ? (
                    <div className="w-5 h-5 rounded-sm border border-[#D9777F] bg-[#D9777F]/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#D9777F] rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-sm border border-white/20 bg-[#1c1917]"></div>
                  )}
                </div>
                <div>
                  <div className={`text-[0.7rem] tracking-[1.5px] uppercase font-medium ${step === 3 ? 'text-[#f1ebd8]' : 'text-[#f1ebd8]/40'}`}>
                    Execution Standard
                  </div>
                  <div className="text-[0.75rem] text-[#f1ebd8]/50 mt-1 font-light">Deployment verification.</div>
                </div>
              </div>

            </div>
          </div>
          
          <div className="text-[0.6rem] font-mono text-[#f1ebd8]/30 uppercase mt-12">
            Marigold Systems<br/>v2.0.4 [STABLE]
          </div>
        </div>

        {/* Right Column: Interaction Window */}
        <div className="lg:col-span-8 p-8 md:p-16 lg:p-24 flex items-center justify-center relative">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <div className="max-w-2xl w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {step === 1 && (
              <div className="space-y-8">
                <Shield className="w-8 h-8 text-[#D9777F] stroke-[1.5]" />
                <h2 className="text-3xl font-light font-serif">The Zero-Cloud Paradigm</h2>
                <div className="space-y-6 text-[#f1ebd8]/70 leading-relaxed font-light text-sm md:text-base border-l border-white/10 pl-6">
                  <p>
                    Traditional analytics require the transmission of sensitive voter data to external servers. This introduces unacceptable security liabilities and compliance friction.
                  </p>
                  <p>
                    Marigold operates differently. We deploy the algorithmic logic to your local machine. Your data remains perfectly isolated on your hard drive, processed by your local CPU.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="mt-8 flex items-center justify-between w-full p-4 bg-[#1c1917] border border-white/10 hover:border-[#D9777F] hover:bg-[#211e1c] transition-colors group"
                >
                  <span className="text-[0.75rem] font-medium tracking-[1.5px] uppercase">Acknowledge & Proceed</span>
                  <ArrowRight className="w-4 h-4 text-[#D9777F] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <Terminal className="w-8 h-8 text-[#D9777F] stroke-[1.5]" />
                <h2 className="text-3xl font-light font-serif">Local Environment</h2>
                <div className="space-y-6 text-[#f1ebd8]/70 leading-relaxed font-light text-sm md:text-base border-l border-white/10 pl-6">
                  <p>
                    Because execution occurs entirely on your hardware, you are required to allocate computational resources. The engine requires a minimum of 4GB RAM to parse standard state-level density matrices.
                  </p>
                  <div className="bg-[#110f0e] p-4 border border-white/10 font-mono text-xs text-[#D9777F]">
                    {'>'} NODE_ENV=production <br/>
                    {'>'} ALLOCATING HEAP MEMORY... <br/>
                    {'>'} VERIFIED LOCAL CONTEXT
                  </div>
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="mt-8 flex items-center justify-between w-full p-4 bg-[#1c1917] border border-white/10 hover:border-[#D9777F] hover:bg-[#211e1c] transition-colors group"
                >
                  <span className="text-[0.75rem] font-medium tracking-[1.5px] uppercase">Confirm Hardware Specs</span>
                  <ArrowRight className="w-4 h-4 text-[#D9777F] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <Database className="w-8 h-8 text-[#D9777F] stroke-[1.5]" />
                <h2 className="text-3xl font-light font-serif">Data Ingestion Readiness</h2>
                <div className="space-y-6 text-[#f1ebd8]/70 leading-relaxed font-light text-sm md:text-base border-l border-white/10 pl-6">
                  <p>
                    You are now prepared to load CSV exports directly into the browser sandbox. The parsing engine is strictly typed to handle standardized SOS exports.
                  </p>
                  <p>
                    Execution of the Fellegi-Sunter heuristic will begin immediately upon file drop.
                  </p>
                </div>
                <Link 
                  href="/dashboard"
                  className="mt-8 flex items-center justify-center w-full p-4 bg-[#D9777F] border border-[#D9777F] hover:bg-[#e3868e] text-white transition-all shadow-[0_4px_14px_rgba(217,119,127,0.3)] hover:shadow-[0_6px_18px_rgba(217,119,127,0.45)] hover:-translate-y-[1px]"
                >
                  <span className="text-[0.75rem] font-medium tracking-[1.5px] uppercase">Launch Workspace</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
