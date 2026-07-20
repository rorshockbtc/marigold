"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Activity, Sigma } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function ZScorePage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Algorithmic Proofs</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Standard Deviation (Z-Score)</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Standard Deviation (Z-Score)
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Marigold utilizes statistical variance models to identify systemic, large-scale anomalies (e.g. mass registration clusters) without relying on deterministic rulesets.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <NonTechnicalTranslator 
          title="The Z-Score Threshold"
          mariContextPrompt="I just read the non-technical translation for the Z-Score Threshold. Why is it better to look at a group rather than just one person?"
          technicalContent={
            <>
              <p>
                Unlike duplicate detection (which is a 1:1 mathematical comparison), modules like <code>HIGH_DENSITY</code> rely on evaluating a record against the entire dataset's distribution curve.
              </p>

              <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl my-8 not-prose flex flex-col md:flex-row gap-8 items-center">
                <div className="w-16 h-16 shrink-0 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Sigma className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">Statistical Variance Formula</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-mono bg-white p-3 border border-slate-200 rounded-lg">
                    Z = (x - μ) / σ
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">
                    Where <strong>x</strong> is the local concentration (e.g., voters at a single address), <strong>μ</strong> is the mean concentration across the zip code, and <strong>σ</strong> is the standard deviation. A Z-score greater than 3.0 indicates a statistically significant anomaly.
                  </p>
                </div>
              </div>
            </>
          }
          eli5Content={
            <p>
              Imagine checking if someone is tall. If you only look at one person, you don't know if they are tall for their age. But if you put them next to 1,000 other people from their town, you can instantly see if they stand out. The Z-Score is our mathematical way of doing exactly this: we don't just look at one voter, we compare them against the "normal" pattern of the entire county. If they stick out too much from the crowd, the Z-Score sets off an alarm.
            </p>
          }
        />

        <NonTechnicalTranslator 
          title="Module Integration"
          mariContextPrompt="I just read the non-technical translation for Module Integration. How does Marigold apply the Z-Score to real data?"
          eli5Content={
            <p>
              When we analyze housing density, we automatically run the Z-Score math for every single house in your data. If one house has 14 voters, but most houses in that county only have 2, the math will shout "this is way too high!" and immediately flag the house for you to investigate.
            </p>
          }
          technicalContent={
            <>
              <h2>Module Integration</h2>
              <p>
                When analyzing housing density, Marigold calculates the rolling Z-Score for every residential structure in your encrypted payload. If an address contains 14 voters, but the mean occupancy in that county is 2.1 (with a standard deviation of 0.8), the Z-Score is computed as <strong>14.875</strong>.
              </p>
              <p>
                This immediately triggers a <code>severity: HIGH</code> flag, returning the encrypted Row ID back to your infrastructure for investigation.
              </p>
            </>
          }
        />

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/algorithms/fellegi-sunter"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Fellegi-Sunter
        </Link>
        <Link 
          href="/developers/docs/api-reference/detect"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-slate-900 hover:text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: API Reference: Detect
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
