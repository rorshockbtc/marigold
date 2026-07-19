import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Target, Shield, Users, Server, Scale } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function PhilosophyPage() {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Getting Started</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">Why Marigold?</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Why Marigold?
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Understanding the existential need for local-compute infrastructure in the era of hyperscale data breaches, and our vision for the Data Analysis and Inference Optimizer (DAIO).
        </p>
      </div>

      <div className="prose prose-slate max-w-none">
        
        <NonTechnicalTranslator 
          title="The Honeypot Problem"
          mariContextPrompt="I just read the non-technical translation for The Honeypot Problem. Why are centralized databases so dangerous?"
          technicalContent={
            <>
              <p>
                The fundamental paradox of civic data management is that <strong>aggregation creates vulnerability</strong>. When a state agency centralizes 10 million voter records into a single AWS RDS instance to run deduplication scripts, they have inadvertently created a "honeypot" for state-sponsored threat actors.
              </p>
              <p>
                Marigold solves this by pushing the compute down to the edge. We do not want your data. We want your data to stay exactly where it is. By utilizing WebAssembly and local-memory execution, Marigold shifts the burden of proof from a centralized server back to the local client. We distribute the vulnerability footprint to zero.
              </p>
            </>
          }
          eli5Content={
            <p>
              If a bank puts all its gold from every branch into one giant vault, robbers know exactly where to attack. That giant vault is called a "honeypot." Cloud databases work the same way. By putting every voter's data in one central location, hackers only have to break into one place. Marigold fixes this by never moving the data. Instead of sending the gold to a central vault to be counted, we send our "counting machine" directly to the local branches, doing the math without moving the money.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="The DAIO Paradigm (Data Analysis & Inference Optimizer)"
          mariContextPrompt="I just read the non-technical translation for DAIO. Can you explain what data agnostic means?"
          technicalContent={
            <>
              <p>
                While Marigold is currently focused on securing and analyzing civic voter rolls, the underlying architecture is entirely dataset-agnostic. Marigold is fundamentally a <strong>DAIO (Data Analysis and Inference Optimizer)</strong>.
              </p>
              <p>
                Our core value proposition is simplifying complex statistical analysis for non-technical users on massive, local datasets. Whether the data is a state voter roll, highly regulated medical billing records (HIPAA), or complex financial ledgers, the Marigold DAIO engine can map, traverse, and execute probabilistic inferences on the data entirely in local memory.
              </p>
            </>
          }
          eli5Content={
            <p>
              Think of Marigold like a highly advanced magnifying glass. Right now, we are using this magnifying glass to look at voter rolls. But the magnifying glass doesn't care what you put under it! In the future, doctors could use our magnifying glass to find errors in medical billing, or accountants could use it to find fraud in spreadsheets. We call this a DAIO (Data Analysis and Inference Optimizer)—a tool that helps regular people easily spot patterns in massive piles of data without needing a PhD in computer science.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="The Cartridge Ecosystem"
          mariContextPrompt="I just read the non-technical translation for Cartridges. How could a researcher use a cartridge to find correlations?"
          technicalContent={
            <>
              <p>
                To support the DAIO paradigm, Marigold utilizes a <strong>Cartridge</strong> architecture. A Cartridge is a modular, community-built correlation matrix that runs natively within the Marigold local-compute environment.
              </p>
              <p>
                Researchers can use our LLM assistant (Mari) to build custom Cartridges. For example, an academic researcher might ask, <i>"What is the statistical correlation between LED streetlights and violent crime incidents?"</i> Mari generates the execution logic into a deployable Cartridge. The user executes the Cartridge against their local dataset, and Marigold returns plain-English data visualizations and Z-Score confidence intervals—all without exfiltrating the raw data.
              </p>
            </>
          }
          eli5Content={
            <p>
              Remember the old video game consoles where you could plug in different game cartridges (like Mario or Zelda)? Marigold works exactly like that, but for data. A researcher can create a "Cartridge" that asks a specific question, like "Do LED streetlights cause more crime?" They plug this Cartridge into Marigold, feed it their data, and Marigold spits out easy-to-read charts and answers. If you have a crazy hypothesis, you can build a Cartridge to test it instantly!
            </p>
          }
        />

      </div>
      
      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Introduction
        </Link>
        <Link 
          href="/developers/docs/getting-started"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Quickstart Guide
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
