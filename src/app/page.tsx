"use client";

import React from "react";
import Link from "next/link";
import { Play, Sparkles, BookOpen, ShieldCheck, FileSpreadsheet, HeartHandshake } from "lucide-react";

export default function GrandmaFriendlyHomePage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Marigold Insights",
    "operatingSystem": "All",
    "applicationCategory": "Government & Business Application",
    "description": "Civic data auditing platform that runs completely on your local computer.",
    "offers": {
      "@type": "Offer",
      "price": "1500.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="pb-24 font-sans bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {/* Friendly Hero Section */}
      <section className="w-full text-center py-20 sm:py-28 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 relative overflow-hidden">
        {/* Soft Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <span className="bg-emerald-50 text-emerald-800 font-bold text-sm px-4 py-2 rounded-full border border-emerald-200 shadow-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Your Data Stays on Your Computer. Always.
            </span>
            <span className="bg-blue-50 text-blue-800 font-bold text-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Approved by Government Standards
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-slate-900 leading-tight">
            Find errors in local data. <br/>
            <span className="text-emerald-700">No tech skills needed.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-medium max-w-3xl mx-auto">
            A county clerk recently found 237 formatting errors in her records in just 3 minutes. She didn't need any IT help, and her data never left her laptop.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/onboarding" className="bg-emerald-600 text-white hover:bg-emerald-500 font-extrabold text-xl px-10 py-5 rounded-full shadow-xl transition-transform transform hover:-translate-y-1 w-full sm:w-auto text-center">
              Start Here →
            </Link>
            <a href="/sandbox" target="_blank" rel="noopener noreferrer" className="bg-white text-slate-900 border-4 border-slate-200 hover:border-slate-300 font-bold text-xl px-10 py-4 rounded-full shadow-sm transition-all w-full sm:w-auto text-center">
              Practice in the Sandbox
            </a>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="space-y-24 max-w-5xl mx-auto px-4 sm:px-6 pt-20">
        
        {/* Simple "Who Are You?" Stakeholders */}
        <section id="stakeholders" className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif font-bold text-slate-900">How can we help you today?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the path that best describes you to read a plain-English guide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/solutions/citizens" className="bg-white p-8 rounded-3xl border-4 border-amber-100 hover:border-amber-400 shadow-md transition-all group block text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span className="text-4xl">🙋‍♀️</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">I am a Citizen Volunteer</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Read our plain-language guide on how you can help your community without being a programmer.
              </p>
              <span className="inline-block font-bold text-amber-700 text-lg group-hover:underline">Read the Citizen Guide →</span>
            </Link>

            <Link href="/solutions/organizations" className="bg-white p-8 rounded-3xl border-4 border-emerald-100 hover:border-emerald-400 shadow-md transition-all group block text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span className="text-4xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">I lead a Volunteer Group</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Learn how your local chapter can share checklists and notes safely with other volunteers.
              </p>
              <span className="inline-block font-bold text-emerald-700 text-lg group-hover:underline">Read the Group Guide →</span>
            </Link>

            <Link href="/solutions/state-agencies" className="bg-white p-8 rounded-3xl border-4 border-blue-100 hover:border-blue-400 shadow-md transition-all group block text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span className="text-4xl">🏛️</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">I am a Government Official</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                See how we meet strict security standards and help you verify your records instantly.
              </p>
              <span className="inline-block font-bold text-blue-700 text-lg group-hover:underline">Read the Official Guide →</span>
            </Link>
          </div>
        </section>

        {/* Video Explanation */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border-4 border-slate-100 shadow-xl flex flex-col lg:flex-row gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-4xl font-serif font-bold text-slate-900">
              Watch: Why Your Data is Safe
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              Most software asks you to upload your files to the internet. We don't. Watch this short video to see how Marigold acts like a smart magnifying glass right on your own computer desk.
            </p>
            <ul className="space-y-3 text-lg font-bold text-slate-800">
              <li className="flex items-center gap-3"><ShieldCheck className="text-emerald-600 w-6 h-6"/> No internet upload required.</li>
              <li className="flex items-center gap-3"><ShieldCheck className="text-emerald-600 w-6 h-6"/> Results appear in seconds.</li>
              <li className="flex items-center gap-3"><ShieldCheck className="text-emerald-600 w-6 h-6"/> 100% transparent math.</li>
            </ul>
          </div>
          <div className="w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden border-8 border-slate-100 shadow-lg bg-slate-200 shrink-0">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/AfCvrfkcx5M" 
              title="Marigold Insights Overview" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Simple 3-Step Process */}
        <section className="bg-emerald-50 rounded-3xl p-10 sm:p-16 border-2 border-emerald-100 shadow-md space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif font-bold text-slate-900">How it Works</h2>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              It's as easy as opening a file on your computer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 font-bold text-2xl rounded-full flex items-center justify-center mx-auto">1</div>
              <h3 className="text-2xl font-bold text-slate-900">Pick a Checklist</h3>
              <p className="text-lg text-slate-600">Choose what you want to look for, like finding duplicate names or formatting errors.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 font-bold text-2xl rounded-full flex items-center justify-center mx-auto">2</div>
              <h3 className="text-2xl font-bold text-slate-900">Select Your File</h3>
              <p className="text-lg text-slate-600">Click on your spreadsheet. The system automatically reads the columns for you.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 font-bold text-2xl rounded-full flex items-center justify-center mx-auto">3</div>
              <h3 className="text-2xl font-bold text-slate-900">See Results Instantly</h3>
              <p className="text-lg text-slate-600">In just seconds, the system highlights the exact rows that need your attention.</p>
            </div>
          </div>
        </section>

        {/* Knowledge Base */}
        <section className="bg-white rounded-3xl p-10 border-4 border-amber-100 shadow-lg flex flex-col md:flex-row items-center gap-10 justify-between">
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-4xl font-serif font-bold text-slate-900">Need to read more?</h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              We have a friendly Learning Center that explains exactly how we find duplicate records and formatting errors, written in simple, everyday language.
            </p>
          </div>
          <Link href="/learning-center" className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xl px-10 py-5 rounded-full shadow-sm transition-transform transform hover:-translate-y-1 whitespace-nowrap flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            Go to Learning Center
          </Link>
        </section>

      </div>
    </div>
  );
}
