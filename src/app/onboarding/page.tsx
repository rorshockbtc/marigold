"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Database, Shield, Coffee } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#161413] text-[#f1ebd8] font-sans selection:bg-[#D9777F] selection:text-white flex flex-col">
      
      {/* Minimal Header */}
      <header className="h-[68px] border-b border-white/10 px-8 flex items-center justify-between">
        <div className="text-sm font-medium tracking-[2px] uppercase text-[#f1ebd8]/70">
          Welcome to Marigold
        </div>
        <Link href="/" className="text-xs font-medium tracking-[2px] uppercase text-[#f1ebd8]/50 hover:text-[#D9777F] transition-colors">
          Go Back Home
        </Link>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Context & Progress */}
        <div className="lg:col-span-4 border-r border-white/10 bg-[#110f0e] p-8 md:p-12 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-light font-serif mb-12">Getting Started</h1>
            
            {/* Progress Track */}
            <div className="space-y-10">
              
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {step > 1 ? (
                    <div className="w-6 h-6 rounded-sm bg-[#D9777F] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-sm border border-[#D9777F] bg-[#D9777F]/10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#D9777F] rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className={`text-xs md:text-sm tracking-[1.5px] uppercase font-medium ${step >= 1 ? 'text-[#f1ebd8]' : 'text-[#f1ebd8]/40'}`}>
                    The Golden Rule
                  </div>
                  <div className="text-sm text-[#f1ebd8]/50 mt-1 font-light">How we protect your data.</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {step > 2 ? (
                    <div className="w-6 h-6 rounded-sm bg-[#D9777F] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : step === 2 ? (
                    <div className="w-6 h-6 rounded-sm border border-[#D9777F] bg-[#D9777F]/10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#D9777F] rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-sm border border-white/20 bg-[#1c1917]"></div>
                  )}
                </div>
                <div>
                  <div className={`text-xs md:text-sm tracking-[1.5px] uppercase font-medium ${step >= 2 ? 'text-[#f1ebd8]' : 'text-[#f1ebd8]/40'}`}>
                    The "Lemonade" Rule
                  </div>
                  <div className="text-sm text-[#f1ebd8]/50 mt-1 font-light">Handling older computers.</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {step === 3 ? (
                    <div className="w-6 h-6 rounded-sm border border-[#D9777F] bg-[#D9777F]/10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#D9777F] rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-sm border border-white/20 bg-[#1c1917]"></div>
                  )}
                </div>
                <div>
                  <div className={`text-xs md:text-sm tracking-[1.5px] uppercase font-medium ${step === 3 ? 'text-[#f1ebd8]' : 'text-[#f1ebd8]/40'}`}>
                    Ready to Go
                  </div>
                  <div className="text-sm text-[#f1ebd8]/50 mt-1 font-light">Launch the workspace.</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Interaction Window */}
        <div className="lg:col-span-8 p-8 md:p-16 lg:p-24 flex items-center justify-center relative">
          
          <div className="max-w-2xl w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {step === 1 && (
              <div className="space-y-8">
                <Shield className="w-10 h-10 text-[#D9777F] stroke-[1.5]" />
                <h2 className="text-4xl font-light font-serif">The Golden Rule: Never upload your files.</h2>
                <div className="space-y-6 text-[#f1ebd8]/80 leading-relaxed font-light text-base md:text-lg border-l-2 border-white/10 pl-6">
                  <p>
                    Most websites want you to click "Upload" so they can send your data to a giant server farm somewhere. With sensitive election data, that is a huge privacy risk.
                  </p>
                  <p>
                    Marigold is completely different. When you use this tool, the "brain" downloads to your web browser and does all the reading locally. <strong>Your files never, ever leave your personal computer.</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="mt-10 flex items-center justify-between w-full p-6 bg-[#1c1917] border border-white/10 hover:border-[#D9777F] hover:bg-[#211e1c] transition-colors group rounded-sm"
                >
                  <span className="text-sm font-medium tracking-[1.5px] uppercase">I Understand</span>
                  <ArrowRight className="w-5 h-5 text-[#D9777F] group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <Coffee className="w-10 h-10 text-[#D9777F] stroke-[1.5]" />
                <h2 className="text-4xl font-light font-serif">The "Lemonade" Rule</h2>
                <div className="space-y-6 text-[#f1ebd8]/80 leading-relaxed font-light text-base md:text-lg border-l-2 border-white/10 pl-6">
                  <p>
                    Because we refuse to send your data to giant cloud servers, your own computer has to do the heavy lifting of sorting through millions of rows of data. 
                  </p>
                  <p>
                    We optimized our software for modern machines, but if your computer is a little older (maybe from 2008?), it might run a bit slow. <strong>Do not close the tab!</strong> Just go make some lemonade, sit back, and trust that it will finish as soon as possible.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="mt-10 flex items-center justify-between w-full p-6 bg-[#1c1917] border border-white/10 hover:border-[#D9777F] hover:bg-[#211e1c] transition-colors group rounded-sm"
                >
                  <span className="text-sm font-medium tracking-[1.5px] uppercase">I Have Lemons Ready</span>
                  <ArrowRight className="w-5 h-5 text-[#D9777F] group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <Database className="w-10 h-10 text-[#D9777F] stroke-[1.5]" />
                <h2 className="text-4xl font-light font-serif">You are ready.</h2>
                <div className="space-y-6 text-[#f1ebd8]/80 leading-relaxed font-light text-base md:text-lg border-l-2 border-white/10 pl-6">
                  <p>
                    You are now ready to load spreadsheets directly into the tool. 
                  </p>
                  <p>
                    The system will immediately start finding anomalies (like commercial addresses or suspicious densities) as soon as you give it a file.
                  </p>
                </div>
                <Link 
                  href="/dashboard"
                  className="mt-10 flex items-center justify-center w-full p-6 bg-[#D9777F] border border-[#D9777F] hover:bg-[#e3868e] text-white transition-all shadow-[0_4px_14px_rgba(217,119,127,0.3)] hover:-translate-y-[1px] rounded-sm"
                >
                  <span className="text-sm font-medium tracking-[1.5px] uppercase">Launch the Dashboard</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
