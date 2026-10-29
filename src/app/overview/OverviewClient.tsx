"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Fingerprint, 
  HardDrive, 
  FileCheck2, 
  Smartphone,
  ExternalLink,
  Mail
} from 'lucide-react';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export default function OverviewClient() {
  const [copied, setCopied] = useState(false);
  const [showPdfEmbed, setShowPdfEmbed] = useState(false);

  const shareUrl = "https://marigoldinsights.org/overview";
  const pdfUrl = "/Marigold-OnePager.pdf";

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: "Marigold — Big data answers. Nothing leaves your computer.",
          text: "Open massive spreadsheets in your browser, find what matters, and share verified reports with zero cloud uploads.",
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }
    handleCopyLink();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614] selection:bg-amber-100 font-serif">
      {/* Top Banner & Quick Share Toolbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#1A1614]/10 px-4 sm:px-6 py-3 font-sans transition-all">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-[#1A1614] font-serif font-bold text-base hover:opacity-80 transition-opacity">
            <MarigoldIcon className="w-5 h-5 flex-shrink-0 text-[#B45309]" />
            <span>Marigold Insights</span>
            <span className="text-xs font-mono font-normal uppercase text-[#B45309] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-600/20">
              One-Pager
            </span>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium">
            <a
              href={pdfUrl}
              download="Marigold-OnePager.pdf"
              className="inline-flex items-center gap-1.5 bg-[#B45309] hover:bg-[#92400E] text-white px-3.5 py-1.5 rounded-lg shadow-sm font-semibold transition-all hover:shadow"
              title="Download print-ready 1-page PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 px-3 py-1.5 rounded-lg transition-all"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 px-3 py-1.5 rounded-lg transition-all"
              title="Share via device or apps"
            >
              <Share2 className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <a
              href={`mailto:?subject=${encodeURIComponent("Marigold — Big data answers. Nothing leaves your computer.")}&body=${encodeURIComponent(`Check out Marigold: A private, in-browser data engine for analyzing massive civic and enterprise datasets without uploading files.\n\nRead the one-page overview here: https://marigoldinsights.org/overview\nDownload the one-page PDF: https://marigoldinsights.org/Marigold-OnePager.pdf`)}`}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 px-3 py-1.5 rounded-lg transition-all"
              title="Email this one-pager to a colleague"
            >
              <Mail className="w-4 h-4 text-stone-500" />
              <span className="hidden md:inline">Email</span>
            </a>

            <Link
              href="/explore?demo=roosevelt"
              className="inline-flex items-center gap-1 text-[#B45309] hover:text-[#78350F] font-semibold px-2 py-1.5 transition-colors"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Document Card Shell (mimics physical print-sheet elegance) */}
        <article className="bg-[#FAF8F5] border border-stone-300/80 rounded-2xl p-6 sm:p-12 shadow-sm relative">
          {/* Kicker */}
          <div className="font-sans font-bold text-xs sm:text-sm tracking-widest uppercase text-[#B45309] mb-2">
            Marigold · A Pipes Production
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-bold leading-[1.08] tracking-tight mb-4 text-[#1A1614]">
            Big data answers.<br />
            Nothing leaves your computer.
          </h1>

          {/* Lede */}
          <p className="text-lg sm:text-xl text-[#3A322D] leading-relaxed max-w-2xl mb-8">
            Marigold lets anyone open a massive spreadsheet — millions of rows — right in their web browser, find what matters, and share a trustworthy report. No installs, no uploads, no data science degree.
          </p>

          <hr className="border-t border-[#1A1614] my-8" />

          {/* Section: Why People Choose Marigold */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-bold tracking-widest uppercase text-stone-500 mb-6">
              Why people choose Marigold
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm leading-relaxed">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold text-base text-[#1A1614]">
                  <ShieldCheck className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  <span>Private by design</span>
                </div>
                <p className="text-[#3A322D]">
                  Your files are analyzed on your own machine. They are never sent to a cloud server, so sensitive civic and financial records stay strictly yours.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold text-base text-[#1A1614]">
                  <Zap className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  <span>Fast with huge files</span>
                </div>
                <p className="text-[#3A322D]">
                  A professional-grade analysis engine runs inside your browser, effortlessly handling voter rolls and fiscal datasets that freeze ordinary spreadsheet apps.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold text-base text-[#1A1614]">
                  <Fingerprint className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  <span>Proof, not just claims</span>
                </div>
                <p className="text-[#3A322D]">
                  Every report carries a digital fingerprint. If anyone changes a single number or row, the fingerprint no longer matches — tampering is mathematically obvious.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold text-base text-[#1A1614]">
                  <HardDrive className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  <span>Works offline, saves locally</span>
                </div>
                <p className="text-[#3A322D]">
                  Link a <em>Marigold_Local</em> folder on your drive and all work saves directly to your computer. Interactive briefings open anywhere, even with zero internet.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold text-base text-[#1A1614]">
                  <FileCheck2 className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  <span>Plain-language findings</span>
                </div>
                <p className="text-[#3A322D]">
                  Ready-made checks surface anomalies and turn them into clear charts and written executive briefings you can hand directly to a board, court, or the public.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 font-sans font-bold text-base text-[#1A1614]">
                  <Smartphone className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                  <span>Desktop and mobile</span>
                </div>
                <p className="text-[#3A322D]">
                  Read, inspect, and share reports seamlessly from a laptop, tablet, or phone. Locked-down client encryption protects your workspace on shared devices.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-t border-[#1A1614]/30 my-8" />

          {/* Section: How It Works */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-bold tracking-widest uppercase text-stone-500 mb-6">
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="border-t-2 border-[#B45309] pt-3">
                <span className="font-sans font-bold text-[#B45309] text-xs">01</span>
                <b className="block font-sans text-base text-[#1A1614] mb-1">Open</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Drop in a spreadsheet or try the built-in demo. Nothing uploads to a server.
                </p>
              </div>

              <div className="border-t-2 border-[#B45309] pt-3">
                <span className="font-sans font-bold text-[#B45309] text-xs">02</span>
                <b className="block font-sans text-base text-[#1A1614] mb-1">Explore</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Run guided checks or ask questions; interactive charts render in milliseconds.
                </p>
              </div>

              <div className="border-t-2 border-[#B45309] pt-3">
                <span className="font-sans font-bold text-[#B45309] text-xs">03</span>
                <b className="block font-sans text-base text-[#1A1614] mb-1">Prove</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Marigold calculates cryptographic fingerprints for the data and every analytical step.
                </p>
              </div>

              <div className="border-t-2 border-[#B45309] pt-3">
                <span className="font-sans font-bold text-[#B45309] text-xs">04</span>
                <b className="block font-sans text-base text-[#1A1614] mb-1">Share</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Download a self-contained report, host it on your profile, or publish to Pipes.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-t border-[#1A1614]/30 my-8" />

          {/* Section: Who It's For */}
          <section className="mb-10">
            <h2 className="font-sans text-xs font-bold tracking-widest uppercase text-stone-500 mb-6">
              Who it&apos;s for
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 bg-stone-100/60 rounded-xl border border-stone-200">
                <b className="block font-sans text-base text-[#1A1614] mb-1">Civic &amp; election officials</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Audit voter rolls, fiscal registers, and public records without exposing citizen personally identifiable information (PII).
                </p>
              </div>

              <div className="p-4 bg-stone-100/60 rounded-xl border border-stone-200">
                <b className="block font-sans text-base text-[#1A1614] mb-1">Journalists &amp; researchers</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Back investigative stories with mathematically verifiable evidence that readers and editors can independently check.
                </p>
              </div>

              <div className="p-4 bg-stone-100/60 rounded-xl border border-stone-200">
                <b className="block font-sans text-base text-[#1A1614] mb-1">Advisors &amp; organizations</b>
                <p className="text-[#3A322D] leading-relaxed">
                  Deliver living, verifiable client portals and executive briefings instead of dead, easily altered PDFs.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Better Together: Marigold + Pipes */}
          <section className="bg-[#1A1614] text-[#FAF8F5] p-6 sm:p-8 rounded-xl font-sans mb-8">
            <h2 className="text-[#F5B54A] font-bold text-sm tracking-wider uppercase mb-2">
              Better Together: Marigold + Pipes
            </h2>
            <p className="text-stone-300 text-sm mb-4 leading-relaxed font-serif">
              Marigold works 100% on its own. When connected to <b className="text-white font-sans">Pipes</b> — a global network of verified human knowledge — your data findings reach further:
            </p>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li className="flex items-start gap-2">
                <span className="text-[#F5B54A] font-bold mt-0.5">•</span>
                <span><b className="text-white">Publish once, reach everywhere:</b> turn local findings into a verified Pipes story that readers, mobile apps, and AI assistants can reliably cite.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5B54A] font-bold mt-0.5">•</span>
                <span><b className="text-white">Timestamped ownership:</b> seal your dataset receipt with a public, permanent cryptographic proof proving it existed and was yours on that date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5B54A] font-bold mt-0.5">•</span>
                <span><b className="text-white">Get paid for your work:</b> domain curators and analysts earn credit royalties each time their verified data canon is referenced by AI or subscribers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F5B54A] font-bold mt-0.5">•</span>
                <span><b className="text-white">One click from reading to doing:</b> anyone reading a Pipes editorial story can launch its raw dataset live in Marigold with one click to verify findings.</span>
              </li>
            </ul>
          </section>

          {/* Card Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-stone-600 pt-4 border-t border-stone-200">
            <div>
              <b className="text-[#1A1614]">Try it free today</b> — zero account, sign-in, or credit card required.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-[#1A1614] underline">marigoldinsights.org</Link>
              <span>·</span>
              <a href="https://pipes.pink" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A1614] underline inline-flex items-center gap-1">
                <span>pipes.pink</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </article>

        {/* Action Panel Below Document */}
        <section className="mt-8 font-sans p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#1A1614]">Share or Download this One-Pager</h3>
              <p className="text-xs text-stone-500">
                Print-ready single page US Letter PDF for event hand-outs, briefings, boards, or email attachments.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={pdfUrl}
                download="Marigold-OnePager.pdf"
                className="inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF (117 KB)</span>
              </a>

              <button
                onClick={() => setShowPdfEmbed(!showPdfEmbed)}
                className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <FileText className="w-4 h-4 text-stone-600" />
                <span>{showPdfEmbed ? "Hide PDF Viewer" : "Preview PDF"}</span>
              </button>
            </div>
          </div>

          {/* Quick share links for live events */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700">Shareable URL:</span>
              <code className="bg-stone-100 px-2 py-1 rounded text-stone-800 font-mono select-all">
                marigoldinsights.org/overview
              </code>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="hover:text-stone-900 font-medium underline flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy URL"}</span>
              </button>
              <span>·</span>
              <a
                href={`mailto:?subject=${encodeURIComponent("Marigold — Big data answers. Nothing leaves your computer.")}&body=${encodeURIComponent(`Check out Marigold: A private, in-browser data engine for analyzing massive civic and enterprise datasets without uploading files.\n\nRead the one-page overview here: https://marigoldinsights.org/overview\nDownload the one-page PDF: https://marigoldinsights.org/Marigold-OnePager.pdf`)}`}
                className="hover:text-stone-900 font-medium underline flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email to friend/colleague</span>
              </a>
            </div>
          </div>

          {/* Optional Embedded PDF Viewer */}
          {showPdfEmbed && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="w-full h-[600px] sm:h-[800px] rounded-xl overflow-hidden border border-stone-300 bg-stone-100">
                <iframe
                  src={`${pdfUrl}#toolbar=1&view=FitH`}
                  title="Marigold One-Pager PDF Preview"
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
