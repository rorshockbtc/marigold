"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Activity, Download } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-20 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-3xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Warm Welcome */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-slate-900 tracking-tight">
            Welcome to Marigold.
          </h1>
          <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
            You cannot break anything here. We built this to be easy, safe, and entirely private. Your data never leaves your computer. 
            <br/><br/>
            <strong>What would you like to do today?</strong>
          </p>
        </div>

        {/* Three Massive Choices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Option 1: Practice */}
          <Link href="/sandbox" className="bg-white border-2 border-slate-200 hover:border-amber-400 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">I want to practice</h2>
            <p className="text-base text-slate-600">
              Use our "Sandbox" with fake, pretend data to see how the system finds errors without any real risk.
            </p>
            <span className="mt-auto pt-4 font-bold text-amber-600 group-hover:underline">Launch Sandbox →</span>
          </Link>

          {/* Option 2: State Trends */}
          <Link href="/macro" className="bg-white border-2 border-slate-200 hover:border-indigo-400 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">See State Trends</h2>
            <p className="text-base text-slate-600">
              Look at safe, high-level charts showing voter shifts across Florida and other states. No personal data.
            </p>
            <span className="mt-auto pt-4 font-bold text-indigo-600 group-hover:underline">View Trends →</span>
          </Link>

          {/* Option 3: Analyze My Data */}
          <Link href="/dashboard" className="bg-white border-2 border-slate-200 hover:border-emerald-400 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">I have my own file</h2>
            <p className="text-base text-slate-600">
              Select a spreadsheet from your computer to check for formatting errors. Remember, we don't save your file.
            </p>
            <span className="mt-auto pt-4 font-bold text-emerald-600 group-hover:underline">Go to Workspace →</span>
          </Link>

        </div>

      </div>
    </div>
  );
}
