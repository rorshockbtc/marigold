import React from "react";
import Link from "next/link";
import { ArrowRight, Box, Cpu, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#161413] text-[#f1ebd8] font-sans selection:bg-[#D9777F] selection:text-white">
      
      {/* 
        HERO SECTION 
        Vignelli Grid: Strict alignments, massive typographic hierarchy.
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
              <span className="text-[0.65rem] font-medium tracking-[2px] uppercase text-[#f1ebd8]/70">Local Compute Engine v2.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.05] tracking-tight text-[#f1ebd8] mb-8 font-serif">
              Definitive intelligence.<br />
              <span className="font-semibold italic text-[#D9777F]">Zero-trust architecture.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#f1ebd8]/70 font-light leading-relaxed max-w-2xl mb-12">
              Marigold Insights is a strictly local-compute civic data platform. We execute mathematical proofs on voter rolls directly in your local memory heap. The data never leaves your infrastructure. 
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/onboarding" className="group flex items-center justify-center h-12 px-8 bg-[#D9777F] text-white text-[0.75rem] font-medium tracking-[1.5px] uppercase transition-all shadow-[0_4px_14px_rgba(217,119,127,0.2)] hover:bg-[#e3868e] hover:shadow-[0_6px_20px_rgba(217,119,127,0.4)] hover:-translate-y-[1px] w-full sm:w-auto">
                Initialize System
              </Link>
              <Link href="/developers" className="group flex items-center justify-center h-12 px-8 bg-[#1c1917] border border-white/20 text-[#f1ebd8] text-[0.75rem] font-medium tracking-[1.5px] uppercase transition-all hover:bg-white/10 w-full sm:w-auto">
                Read Architecture
              </Link>
            </div>
          </div>

          {/* Abstract Data Visualization / Geometry (Right) */}
          <div className="lg:col-span-4 relative hidden lg:block h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1917] to-[#110f0e] border border-white/10 shadow-2xl p-8 flex flex-col justify-between overflow-hidden">
              <div className="text-[0.65rem] font-mono text-[#f1ebd8]/40 tracking-widest uppercase">Memory Hex Dump</div>
              <div className="font-mono text-xs leading-relaxed text-[#D9777F]/60 break-all">
                0x0000 4d 61 72 69 67 6f 6c 64<br/>
                0x0008 20 49 6e 73 69 67 68 74<br/>
                0x0010 73 20 4c 6f 63 61 6c 20<br/>
                0x0018 45 78 65 63 75 74 69 6f<br/>
                ...<br/>
                [ALGORITHM: FELLEGI-SUNTER]<br/>
                [THREADS: AUTO]<br/>
                [STATUS: SECURE]
              </div>
              <div className="w-full h-[1px] bg-white/10 my-4"></div>
              <div className="flex justify-between items-end">
                 <span className="text-3xl font-light text-[#f1ebd8]">0 PII</span>
                 <span className="text-[0.65rem] tracking-[2px] uppercase text-[#f1ebd8]/50">Transmitted</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        STRUCTURAL PILLARS 
        Vignelli Card Grid. 3 Columns. Hard borders. Monochromatic icons.
      */}
      <section className="px-4 sm:px-8 md:px-16 py-24 bg-[#110f0e]">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-16">
            <h2 className="text-[0.75rem] font-medium tracking-[3px] uppercase text-[#D9777F] mb-4">Core Principles</h2>
            <h3 className="text-3xl md:text-4xl font-light text-[#f1ebd8]">Engineered for paranoia.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10">
            
            {/* Column 1 */}
            <div className="bg-[#1c1917] p-10 flex flex-col group hover:bg-[#211e1c] transition-colors">
              <ShieldCheck className="w-8 h-8 text-[#f1ebd8]/40 mb-8 group-hover:text-[#D9777F] transition-colors stroke-[1.5]" />
              <h4 className="text-xl font-medium text-[#f1ebd8] mb-4 font-serif">Zero-Trust Processing</h4>
              <p className="text-[0.85rem] text-[#f1ebd8]/60 leading-loose flex-grow">
                Our architecture inherently distrusts the cloud. No records are transmitted over the wire. The algorithmic engine is downloaded and executed strictly within the local browser sandbox or edge compute node.
              </p>
            </div>

            {/* Column 2 */}
            <div className="bg-[#1c1917] p-10 flex flex-col group hover:bg-[#211e1c] transition-colors">
              <Cpu className="w-8 h-8 text-[#f1ebd8]/40 mb-8 group-hover:text-[#D9777F] transition-colors stroke-[1.5]" />
              <h4 className="text-xl font-medium text-[#f1ebd8] mb-4 font-serif">Mathematical Integrity</h4>
              <p className="text-[0.85rem] text-[#f1ebd8]/60 leading-loose flex-grow">
                Utilizing deterministic heuristics, including the Fellegi-Sunter algorithm and precise density matrices, the engine mathematically proves database anomalies without subjective human intervention.
              </p>
            </div>

            {/* Column 3 */}
            <div className="bg-[#1c1917] p-10 flex flex-col group hover:bg-[#211e1c] transition-colors">
              <Box className="w-8 h-8 text-[#f1ebd8]/40 mb-8 group-hover:text-[#D9777F] transition-colors stroke-[1.5]" />
              <h4 className="text-xl font-medium text-[#f1ebd8] mb-4 font-serif">Auditable Transparency</h4>
              <p className="text-[0.85rem] text-[#f1ebd8]/60 leading-loose flex-grow">
                Black-box algorithms have no place in civic intelligence. The entire codebase and matching criteria are strictly documented. The outputs are perfectly reproducible.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 
        DATA FOOTPRINT SECTION
        Minimalist, typographic emphasis.
      */}
      <section className="px-4 sm:px-8 md:px-16 py-32 bg-[#161413] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-light leading-tight text-[#f1ebd8] mb-6 font-serif">
              The interaction of data <br/>and <span className="italic text-[#D9777F]">absolute privacy.</span>
            </h2>
            <p className="text-[#f1ebd8]/60 leading-relaxed font-light mb-10 max-w-lg">
              Our commitment to the protection of Personally Identifiable Information is absolute. By severing the connection between analysis and cloud storage, we provide military-grade analytical capability with zero compliance liability.
            </p>
            <Link href="/compliance" className="inline-flex items-center gap-3 text-[0.75rem] font-medium tracking-[2px] uppercase text-[#f1ebd8] hover:text-[#D9777F] transition-colors group">
              Read the Compliance Manifesto 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Swiss Poster style abstract graphic */}
          <div className="lg:w-5/12 aspect-square bg-[#110f0e] border border-white/10 relative overflow-hidden flex items-center justify-center p-12">
            <div className="w-full h-full border border-[#D9777F]/30 relative flex items-center justify-center group">
               <div className="absolute top-4 left-4 text-[0.55rem] font-mono text-[#D9777F] uppercase tracking-widest">Fig. 1</div>
               <div className="absolute bottom-4 right-4 text-[0.55rem] font-mono text-[#f1ebd8]/40 uppercase tracking-widest">Isolated System</div>
               {/* Concentric precise squares */}
               <div className="w-3/4 h-3/4 border border-[#f1ebd8]/20 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                 <div className="w-1/2 h-1/2 bg-[#D9777F]/90 transition-transform duration-700 group-hover:rotate-45 shadow-[0_0_30px_rgba(217,119,127,0.3)]"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
