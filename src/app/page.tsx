import React from "react";
import Link from "next/link";
import { ArrowRight, Box, Cpu, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#161413] text-[#f1ebd8] font-sans selection:bg-[#D9777F] selection:text-white">
      
      {/* 
        HERO SECTION 
        Vignelli Grid: Strict alignments, but friendly copy.
      */}
      <section className="relative w-full min-h-[85vh] flex flex-col justify-center px-4 sm:px-8 md:px-16 pt-20 pb-24 overflow-hidden border-b border-white/10">
        
        {/* Architectural Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        ></div>

        <div className="relative max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Typographic Core (Left) */}
          <div className="lg:col-span-8 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-3 px-3 py-1 mb-8 bg-[#110f0e] border border-white/10 rounded-sm">
              <span className="w-2 h-2 rounded-full bg-[#D9777F] animate-pulse"></span>
              <span className="text-[0.65rem] md:text-sm font-medium tracking-[2px] uppercase text-[#f1ebd8]/70">No Cloud Servers Involved</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.05] tracking-tight text-[#f1ebd8] mb-8 font-serif">
              Clean your voter rolls.<br />
              <span className="font-semibold italic text-[#D9777F]">Safely, on your own desk.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#f1ebd8]/80 font-light leading-relaxed max-w-2xl mb-12">
              Most tech companies want you to upload your sensitive spreadsheets to their "cloud." We think that's a terrible idea. Marigold is a tool that runs entirely inside your web browser, letting you find duplicate voters instantly without ever sending your data across the internet. 
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/onboarding" className="group flex items-center justify-center h-14 px-8 bg-[#D9777F] text-white text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-all shadow-[0_4px_14px_rgba(217,119,127,0.2)] hover:bg-[#e3868e] hover:shadow-[0_6px_20px_rgba(217,119,127,0.4)] hover:-translate-y-[1px] w-full sm:w-auto rounded-sm">
                Get Started Now
              </Link>
              <Link href="/developers" className="group flex items-center justify-center h-14 px-8 bg-[#1c1917] border border-white/20 text-[#f1ebd8] text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-all hover:bg-white/10 w-full sm:w-auto rounded-sm">
                How It Works
              </Link>
            </div>
          </div>

          {/* Friendly Abstract Data Visualization (Right) */}
          <div className="lg:col-span-4 relative hidden lg:block h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1917] to-[#110f0e] border border-white/10 shadow-2xl p-8 flex flex-col justify-between overflow-hidden rounded-sm">
              <div className="text-[0.65rem] font-mono text-[#f1ebd8]/40 tracking-widest uppercase">Your Computer's Brain</div>
              <div className="font-mono text-sm leading-relaxed text-[#D9777F] font-bold break-all">
                Loading Spreadsheet...<br/><br/>
                Found 10,492 Rows.<br/>
                No internet connection needed.<br/>
                Checking for duplicates...<br/><br/>
                Wait, did John Smith register at the UPS store again?<br/><br/>
                [STATUS: CAUGHT HIM]
              </div>
              <div className="w-full h-[1px] bg-white/10 my-4"></div>
              <div className="flex justify-between items-end">
                 <span className="text-4xl font-bold text-[#f1ebd8]">100%</span>
                 <span className="text-xs tracking-[2px] uppercase text-[#f1ebd8]/50">Private</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        STRUCTURAL PILLARS 
      */}
      <section className="px-4 sm:px-8 md:px-16 py-24 bg-[#110f0e]">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-16">
            <h2 className="text-[0.75rem] md:text-sm font-medium tracking-[3px] uppercase text-[#D9777F] mb-4">Core Principles</h2>
            <h3 className="text-3xl md:text-4xl font-light text-[#f1ebd8]">Built for people who distrust computers.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10">
            
            {/* Column 1 */}
            <div className="bg-[#1c1917] p-10 flex flex-col group hover:bg-[#211e1c] transition-colors">
              <ShieldCheck className="w-10 h-10 text-[#f1ebd8]/40 mb-8 group-hover:text-[#D9777F] transition-colors stroke-[1.5]" />
              <h4 className="text-2xl font-medium text-[#f1ebd8] mb-4 font-serif">Totally Private</h4>
              <p className="text-base text-[#f1ebd8]/70 leading-loose flex-grow">
                When you drag and drop a file into Marigold, it stays on your computer. We literally don't have the server space to steal your data even if we wanted to. You can disconnect your WiFi and the site still works!
              </p>
            </div>

            {/* Column 2 */}
            <div className="bg-[#1c1917] p-10 flex flex-col group hover:bg-[#211e1c] transition-colors">
              <Cpu className="w-10 h-10 text-[#f1ebd8]/40 mb-8 group-hover:text-[#D9777F] transition-colors stroke-[1.5]" />
              <h4 className="text-2xl font-medium text-[#f1ebd8] mb-4 font-serif">Mathematical Magic</h4>
              <p className="text-base text-[#f1ebd8]/70 leading-loose flex-grow">
                Finding a needle in a haystack of millions of voters is hard. We do the math for you. We highlight the anomalies—like 50 people registered to a 2-bedroom apartment—so you can focus on writing letters, not fighting spreadsheets.
              </p>
            </div>

            {/* Column 3 */}
            <div className="bg-[#1c1917] p-10 flex flex-col group hover:bg-[#211e1c] transition-colors">
              <Box className="w-10 h-10 text-[#f1ebd8]/40 mb-8 group-hover:text-[#D9777F] transition-colors stroke-[1.5]" />
              <h4 className="text-2xl font-medium text-[#f1ebd8] mb-4 font-serif">No Hidden Agendas</h4>
              <p className="text-base text-[#f1ebd8]/70 leading-loose flex-grow">
                Black-box "AI" has no place in civic intelligence. We just run standard, boring statistical formulas. We tell you exactly how they work, and you get exactly the answers the math dictates.
              </p>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
