"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExecutiveVisualCanvas } from '@/components/ExecutiveVisualCanvas';
import { Sparkles, Shield, Cpu, Database, CheckCircle2, ArrowRight, RefreshCw, HelpCircle, Play, X, Mail, Building2, Users, Lock, FlaskConical, MessageSquare } from 'lucide-react';

export default function SandboxPage() {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed' | 'full_sandbox'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [mariTourState, setMariTourState] = useState<'active' | 'dismissed'>('active');
  const [tourStep, setTourStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // 4-Step Simulation Walkthrough Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simulationState === 'running') {
      if (currentStep < 4) {
        timer = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 1800);
      } else {
        setSimulationState('completed');
      }
    }
    return () => clearTimeout(timer);
  }, [simulationState, currentStep]);

  const handleStartSimulation = () => {
    setCurrentStep(1);
    setSimulationState('running');
  };

  const handleEnterFullSandbox = () => {
    setSimulationState('full_sandbox');
    setMariTourState('active');
    setTourStep(0);
  };

  const handleRestartTour = () => {
    setMariTourState('active');
    setTourStep(0);
  };

  const handleSubmitInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Web3Forms access key
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "0a997a5d-fccb-46f4-bc7b-7df7ec33d90d";
    formData.append("access_key", accessKey);
    formData.append("subject", "Institutional Pilot Inquiry from Public Sandbox");
    formData.append("source", "Public Sandbox B2B Pilot Card");

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      setSubmitted(true);
    } catch {
      alert("Submission failed. Please email our architecture desk directly at partnerships@colonhyphenbracket.com.");
    } finally {
      setLoading(false);
    }
  };

  const SIMULATED_RESULTS = [
    { address: "123 UNIVERSITY WAY, STATE COLLEGE (Simulated Dormitory)", occupants: 423, status: "High-Density Student Domicile" },
    { address: "456 MAIN STREET, SUITE 400 (Simulated Commercial Mailbox)", occupants: 85, status: "Commercial Shipping Center / UPS Store" },
    { address: "789 MAPLE AVENUE, LOT 12 (Simulated Mobile Park)", occupants: 14, status: "High-Density Review Needed (>12)" },
    { address: "101 PINE BOULEVARD, APT 3B (Simulated Mid-Rise)", occupants: 6, status: "Verified Standard Residential" },
    { address: "202 ELM STREET, UNIT 100 (Simulated Clerical Anomaly)", occupants: 42, status: "Z-Score Outlier (>3.5 SD)" }
  ];

  const TOUR_STEPS = [
    {
      title: "1. Z-Score Outlier Detection",
      content: "Notice how Marigold automatically calculates Standard Deviations across your municipality. Instead of manually checking thousands of apartments, any residence exceeding 3.0 SD is instantly highlighted for human verification.",
      badge: "Statistical Math Engine"
    },
    {
      title: "2. Benford's Law & Clerical Analysis",
      content: "When voter rolls are altered or synthetically inflated, the leading digits violate Benford's natural logarithmic distribution. Our engine flags these clerical anomalies in milliseconds without needing external cloud servers.",
      badge: "Clerical Verification"
    },
    {
      title: "3. NCOA Commercial Address Crosscheck",
      content: "By matching against standardized postal formatting rules in local browser memory, Marigold separates legitimate apartment complexes from commercial shipping boxes (like UPS Stores) disguised as residential suites.",
      badge: "Address Sanitization"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32 font-sans px-4 sm:px-6">
      {/* Hot-Pink Alpha Release Warning Banner */}
      <div className="bg-pink-600 text-white p-4 sm:p-5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-3 shadow-lg border border-pink-500 animate-pulse">
        <span className="text-xl shrink-0">⚠️</span>
        <span className="leading-relaxed">
          THIS IS ONLY A DEMONSTRATION. MARIGOLD IS CURRENTLY AN ALPHA RELEASE. Real voter verification pipelines are fully calibrated only for Mississippi.
        </span>
      </div>

      {/* Prominent Synthetic Warning Banner */}
      <div className="bg-orange-600 text-white p-4 sm:p-5 rounded-2xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-orange-500">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">🧪</span>
          <span className="leading-relaxed">
            <strong>SYNTHETIC DEMO ENVIRONMENT:</strong> All datasets, occupancy records, and addresses displayed on this page are 100% simulated fictional mock data generated for demonstration and verification purposes only.
          </span>
        </div>
        <span className="bg-orange-950/60 text-orange-200 px-3 py-1.5 rounded-lg text-xs uppercase font-mono font-extrabold whitespace-nowrap shrink-0 border border-orange-400/30">
          Strict Data Separation
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Interactive B2B Sales &amp; Verification Tool</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold pt-1 text-white">Public Demonstration Sandbox</h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Experience our air-gapped local memory engine without uploading real files. Explore how state election officials, procurement directors, and citizen volunteers verify public data in plain, everyday language.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
          <button 
            onClick={() => setShowGuideModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-3 rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>How Does Privacy Work?</span>
          </button>
          <Link href="/sign-up" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* STATE 0 & RUNNING & COMPLETED: One-Click Simulation Walkthrough */}
      {simulationState !== 'full_sandbox' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-14 shadow-xl space-y-10 animate-in fade-in duration-300">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto font-bold text-2xl shadow-sm">
              <Cpu className="w-8 h-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary tracking-tight">
              Simulate Data Upload &amp; Verification
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              We never ask you to upload sensitive spreadsheets before you understand how our platform operates. Click below to initiate our interactive 4-step simulation walkthrough using fictional municipal data.
            </p>
            
            {simulationState === 'idle' && (
              <div className="pt-4">
                <button
                  onClick={handleStartSimulation}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-base sm:text-lg px-10 py-5 rounded-2xl shadow-2xl transition-all transform hover:-translate-y-1 inline-flex items-center gap-3 group border border-slate-800"
                >
                  <Play className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Simulate Data Upload (One-Click Demo) →</span>
                </button>
              </div>
            )}
          </div>

          {/* 4-Step Walkthrough Sequence Box */}
          {(simulationState === 'running' || simulationState === 'completed') && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Air-Gapped Ingestion Walkthrough</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {simulationState === 'completed' ? "4 / 4 Steps Verified" : `Step ${currentStep} / 4`}
                </span>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className={`flex items-start gap-4 transition-all duration-300 ${currentStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${currentStep > 1 ? 'bg-emerald-500 text-slate-950' : currentStep === 1 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Download Official Source</span>
                      {currentStep === 1 && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">Simulating...</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      You navigate to your state or municipal official election portal to download your raw voter export file (.csv or pipe-delimited).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`flex items-start gap-4 transition-all duration-300 ${currentStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${currentStep > 2 ? 'bg-emerald-500 text-slate-950' : currentStep === 2 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Secure Local Connection</span>
                      {currentStep === 2 && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">Verifying...</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      You log into Marigold Insights. Our air-gapped browser engine verifies your local machine memory is isolated and secure before processing begins.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`flex items-start gap-4 transition-all duration-300 ${currentStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${currentStep > 3 ? 'bg-emerald-500 text-slate-950' : currentStep === 3 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                    {currentStep > 3 ? '✓' : '3'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Zero-PII Ingestion &amp; Shape Analysis</span>
                      {currentStep === 3 && <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">Analyzing...</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      Uploading the file secures your local data and gives Marigold the statistical &ldquo;shape&rdquo; of your roll without compromising voter integrity or transmitting PII over a server.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`flex items-start gap-4 transition-all duration-300 ${currentStep >= 4 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${currentStep >= 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                    {currentStep >= 4 ? '✓' : '4'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-white">
                      <span>Local In-Memory Database Ready</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      Then you download the new file and Marigold runs an optimized local database directly off your file in RAM, allowing for fast/easy exploration! It is as secure as modern cryptography allows—and if you have suggestions to improve it? <a href="#pilot-inquiry" className="text-amber-400 underline font-bold hover:text-amber-300">CONTACT US</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Enter CTA */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  ></div>
                </div>

                {simulationState === 'completed' && (
                  <div className="text-center pt-2 animate-in fade-in zoom-in-95 duration-200 space-y-4">
                    <button
                      onClick={handleEnterFullSandbox}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-4 px-8 rounded-xl shadow-xl transition-all text-base sm:text-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <span>Enter Full Sandbox Mode</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-slate-400">
                      ✨ You are about to enter our interactive simulated admin experience.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 2: FULL SANDBOX INTERACTIVE WORKFLOW */}
      {simulationState === 'full_sandbox' && (
        <div className="space-y-8 animate-in fade-in duration-300 relative">
          
          {/* Mari Walkthrough Guided Overlay / Banner */}
          {mariTourState === 'active' && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border-2 border-amber-500/50 shadow-2xl space-y-6 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow shrink-0">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-white">Mari Assistant Walkthrough</h3>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-400/30">
                        {TOUR_STEPS[tourStep].badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Guided exploration of Marigold&apos;s mathematical verification engine.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-mono font-bold text-amber-400">Step {tourStep + 1} of {TOUR_STEPS.length}</span>
                  <button 
                    onClick={() => setMariTourState('dismissed')}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                    title="Dismiss tour"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 relative z-10 max-w-3xl">
                <h4 className="text-xl font-serif font-bold text-amber-300">{TOUR_STEPS[tourStep].title}</h4>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  {TOUR_STEPS[tourStep].content}
                </p>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 pt-2 border-t border-slate-800/80 relative z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (tourStep < TOUR_STEPS.length - 1) {
                        setTourStep(prev => prev + 1);
                      } else {
                        setMariTourState('dismissed');
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow transition-all text-xs sm:text-sm flex items-center gap-2"
                  >
                    <span>{tourStep < TOUR_STEPS.length - 1 ? "Next Explanation Step →" : "Complete Guided Tour ✓"}</span>
                  </button>
                  <button
                    onClick={() => setMariTourState('dismissed')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-xl border border-slate-600 transition-all text-xs sm:text-sm"
                  >
                    Explore on My Own
                  </button>
                </div>
                
                <span className="text-[11px] text-slate-400 font-mono">
                  💡 You can re-open Mari or start over anytime below.
                </span>
              </div>
            </div>
          )}

          {/* Simulated Results Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                  Simulated Admin Checklist
                </span>
                <h3 className="font-serif font-bold text-2xl text-primary mt-1.5">High-Density Occupancy &amp; Anomaly Filter</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Showing 5 simulated verification flags generated in local memory from our fictional municipal test file.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5 Records Verified in RAM</span>
                </span>
                <button
                  onClick={handleRestartTour}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-300 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart Guide</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
                    <th className="p-4 rounded-l-xl">Physical Address</th>
                    <th className="p-4">Simulated Occupants</th>
                    <th className="p-4 rounded-r-xl">Automated Categorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {SIMULATED_RESULTS.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{r.address}</td>
                      <td className="p-4 font-bold text-amber-600 text-base">{r.occupants}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${
                          r.status.includes('Outlier') ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          r.status.includes('UPS') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          r.status.includes('Verified') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Executive Visual Canvas in Sandbox Mode */}
            <div className="pt-6 border-t border-slate-200">
              <ExecutiveVisualCanvas userName="Sandbox Demo User" isSandbox={true} />
            </div>
          </div>

          {/* Institutional Pilot & Briefing Web3Forms Card */}
          <div id="pilot-inquiry" className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 space-y-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
                <Building2 className="w-3.5 h-3.5" />
                <span>Institutional Pilot &amp; Executive Briefing</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Ready to Run These Checks Against Your Real Voter Roll?
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Signups are fully open—you can create a free account immediately to begin exploring with your local group. To schedule a statewide deployment briefing or share suggestions directly with our executive architecture desk, submit an inquiry below.
              </p>
            </div>

            {submitted ? (
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto font-bold text-2xl">
                  ✓
                </div>
                <h4 className="text-xl font-serif font-bold text-white">Inquiry Transmitted to Executive Desk</h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you! Our architecture desk has received your note and will reach out within 24 business hours to arrange your briefing.
                </p>
                <div className="pt-2 flex justify-center gap-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl border border-slate-700 transition-all"
                  >
                    Submit another note
                  </button>
                  <Link
                    href="/sign-up"
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2 rounded-xl transition-all shadow"
                  >
                    Create Free Account →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-5 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Full Name / Title *</label>
                    <input required name="name" type="text" className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none font-medium" placeholder="e.g., Dr. Jane Doe (State Director)" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Institutional Email *</label>
                    <input required name="email" type="email" className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none font-medium" placeholder="jdoe@jurisdiction.gov" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Organization / Jurisdiction *</label>
                    <input required name="jurisdiction" type="text" className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none font-medium" placeholder="e.g., Ohio County Elections Board" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Inquiry Type *</label>
                    <select name="inquiry_type" className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none font-medium">
                      <option value="Statewide Pilot / Briefing">Schedule Statewide Pilot / Briefing</option>
                      <option value="Volunteer Group Deployment">Volunteer Group Deployment</option>
                      <option value="Technical Suggestion / Feedback">Technical Suggestion / Feedback</option>
                      <option value="Strategic Grant / Funding">Strategic Grant / Funding</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Message / Suggestions *</label>
                  <textarea required rows={3} name="message" className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none font-medium" placeholder="Tell us about your voter roll volume, timeline, or any suggestions to improve our local-compute engine..." />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold py-3.5 px-8 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? "Transmitting Note..." : "Submit Pilot Inquiry & Briefing Request →"}
                  </button>
                  <span className="text-xs text-slate-400">
                    🔒 Direct confidential routing to Colon Hyphen Bracket LLC.
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* Floating Resume/Restart Guide Button when Dismissed */}
          {mariTourState === 'dismissed' && (
            <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={handleRestartTour}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-amber-500 flex items-center gap-2.5 transition-all transform hover:scale-105"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>💬 Continue Mari Guided Tour</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guide Modal for Older Users */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 text-foreground animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-primary">How Local-Compute Protects Your Privacy</h3>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-normal">
              <p>
                When working with sensitive public data like voter registration lists, many citizens and volunteers legitimately worry about digital privacy and government regulations. We designed Marigold Insights specifically to be straightforward and completely secure.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-primary text-base">Traditional Cloud Websites (How others do it)</h4>
                <p className="text-xs text-slate-600">
                  Most modern websites ask you to upload your spreadsheet over the internet to their remote cloud servers. Once uploaded, your file is stored on someone else&apos;s computer, creating risks of data breaches, unauthorized sharing, and complex legal compliance hurdles.
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-950 text-base">The Marigold Local Method (How we do it)</h4>
                <p className="text-xs text-emerald-900">
                  When you use Marigold Insights, **your data file never leaves your computer**. Instead of uploading your spreadsheet to us, our website sends small inspection instructions down to your internet browser. Your web browser reads your spreadsheet locally on your desk, organizes the rows, and displays the findings right on your screen.
                </p>
              </div>

              <h4 className="font-bold text-primary text-base pt-2">Why this matters for your group:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li>**Zero Legal Exposure:** Because sensitive files remain safely on your personal hard drive, you bypass cumbersome data residency audits.</li>
                <li>**Blazing Fast Speed:** Searching millions of records locally avoids slow internet upload bars and freezing progress wheels.</li>
                <li>**Total Control:** You can disconnect from the internet after loading the page and continue running your audit offline.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setShowGuideModal(false)}
                className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow"
              >
                Got It, Return to Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
