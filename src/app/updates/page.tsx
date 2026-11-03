import React from "react";
import Link from "next/link";
import {
  FileText,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Printer,
  ArrowRight,
  Download,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "What's New: Mississippi 82-County Audit & 3D Manifold Release | Marigold Insights",
  description:
    "Plain-English release notes on the Draft 2 Accént Ink-Saving Edition, Three.js 3D Threat Manifold, 25.91 Million Voting History Audit, and 100% Zero-PII privacy upgrades.",
};

export default function UpdatesReleasePostPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#111111] rounded-2xl border border-[#111111]/15">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 md:py-14">
        {/* Masthead Kicker */}
        <div className="border-t-4 border-[#111111] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs uppercase tracking-widest text-[#D9381E] font-bold pb-4 border-b border-[#E4E0D8]">
            <span>PLATFORM RELEASE BRIEFING · PLAIN-ENGLISH EDITION</span>
            <span>100% ZERO-PII · DETERMINISTIC MATHEMATICS</span>
          </div>

          <h1 className="mt-6 font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-[#111111]">
            Making Election Data Clear, Fair, and Useful for Every County Commissioner
          </h1>

          <p className="mt-4 font-serif text-lg sm:text-xl text-[#4A4845] leading-relaxed">
            How we audited <strong>2,112,460 Mississippi voter registrations</strong> and{" "}
            <strong>25,911,640 historical ballots</strong> across all 82 counties—eliminating 18,093 false alarms, protecting 100% of citizen privacy, and building a 3D map that shows every county exactly where to focus.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 pb-8 border-b border-[#111111]">
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#2A2927] text-white text-xs font-bold px-4 py-2.5 rounded"
            >
              <FileText className="w-4 h-4 text-[#D9381E]" />
              Read the Draft 2 Mississippi Report
            </Link>
            <Link
              href="/manifold"
              className="inline-flex items-center gap-2 bg-[#D9381E] hover:bg-[#B82D16] text-white text-xs font-bold px-4 py-2.5 rounded"
            >
              <Compass className="w-4 h-4" />
              Explore the 3D Threat Manifold
            </Link>
            <a
              href="/Marigold-Mississippi-Playbook-Analysis.pdf"
              download="Marigold-Mississippi-Playbook-Analysis.pdf"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#F5F2EB] text-[#111111] border border-[#111111] text-xs font-bold px-4 py-2.5 rounded"
            >
              <Download className="w-4 h-4" />
              Download Ink-Saving PDF (10 Pages)
            </a>
          </div>
        </div>

        {/* Body Sections in Plain, Everyday Language */}
        <div className="mt-10 space-y-10 text-[15px] leading-[1.75] text-[#222220]">
          <section>
            <div className="font-mono text-xs uppercase tracking-widest text-[#D9381E] font-bold mb-1">
              01 · Stopping False Alarms Before They Start
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#111111] mb-3">
              Why a Nursing Home, a College Dorm, or &ldquo;Marshall Place&rdquo; Is Not Voter Fraud
            </h2>
            <p>
              When ordinary spreadsheet scripts scan a voter roll, they look for simple patterns—like &ldquo;more than 8 voters at one address&rdquo; or the letters <code>&quot;HALL&quot;</code> in a street name. Without common-sense filters, those scripts flag every nursing home, university dormitory, and apartment complex in the state, and they even flag family homes on streets named <em>Marshall Place</em>, <em>Halls Ferry Road</em>, or <em>University Avenue</em>.
            </p>
            <p className="mt-3">
              In this release, we upgraded all 10 playbooks across the entire platform so County Election Commissioners never waste time chasing ghosts:
            </p>
            <ul className="mt-4 space-y-2.5 border-l-2 border-[#111111] pl-5 text-sm">
              <li>
                <strong>Whole-Word Matching Removes 4,346 Street-Name False Positives:</strong> By checking whole words instead of partial letters—and separating college towns from street names—we eliminated 4,346 false alarms on streets like <em>Marshall Pl</em> and <em>Halls Ferry Rd</em>, leaving the <strong>682 genuine campus and apartment records</strong> that actually need a room or unit number.
              </li>
              <li>
                <strong>Nursing Homes &amp; Universities Separated from Houses:</strong> Out of 1,598 high-density addresses statewide, we automatically separate <strong>56 nursing homes and universities (6,788 voters)</strong> and <strong>103 apartment complexes (2,555 voters)</strong> so Commissioners can focus on the 1,439 single-family homes where previous renters moved away without cancelling their old registration.
              </li>
              <li>
                <strong>4,404 Father-and-Son (Jr./Sr.) Households Protected:</strong> When John Smith Sr. and John Smith Jr. live at the same family home, our system recognizes their generational suffixes and protects them from false duplicate flags.
              </li>
              <li>
                <strong>Active vs. Inactive Voters Clearly Separated:</strong> Federal law requires counties to mark relocated voters &ldquo;Inactive&rdquo; and wait two federal election cycles before removing them. We show that <strong>82.1% of all out-of-state mail forwardings (11,178 of 13,622)</strong> are already marked Inactive—leaving only <strong>2,444 Active voters</strong> who need a confirmation postcard.
              </li>
            </ul>
          </section>

          <section className="border-t border-[#E4E0D8] pt-8">
            <div className="font-mono text-xs uppercase tracking-widest text-[#D9381E] font-bold mb-1">
              02 · The New Three.js 3D Threat Manifold
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#111111] mb-3">
              Seeing All 82 Counties in 3D—And Isolating One Issue at a Time
            </h2>
            <p>
              A single 1-to-100 score cannot tell an Election Commissioner <em>what kind</em> of maintenance their county needs. A college county like Oktibbeha or Lafayette has completely different needs than a fast-growing commuter county like DeSoto or Madison.
            </p>
            <p className="mt-3">
              Our new interactive <strong>Three.js 3D Threat Manifold</strong> plots all 82 Mississippi counties across three clear measurements at once:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="border border-[#111111] bg-white p-4">
                <div className="font-mono font-bold text-[#D9381E]">AXIS X · ADDRESSES</div>
                <div className="font-serif font-bold text-base text-[#111111] mt-1">
                  Physical Address Crowding
                </div>
                <p className="text-[#4A4845] mt-1">
                  Measures high-density houses (PB-01), dorms missing room numbers (PB-02), and P.O. Boxes listed as homes (PB-04).
                </p>
              </div>
              <div className="border border-[#111111] bg-white p-4">
                <div className="font-mono font-bold text-[#D9381E]">AXIS Y · RELOCATIONS</div>
                <div className="font-serif font-bold text-base text-[#111111] mt-1">
                  Out-of-State Mail &amp; Duplicates
                </div>
                <p className="text-[#4A4845] mt-1">
                  Measures Active voters receiving mail out of state (PB-03), duplicate registrations (PB-06), and legacy 1801 dates (PB-05).
                </p>
              </div>
              <div className="border border-[#111111] bg-white p-4">
                <div className="font-mono font-bold text-[#D9381E]">AXIS Z · POLLING PLACES</div>
                <div className="font-serif font-bold text-base text-[#111111] mt-1">
                  Precinct Capacity &amp; Turnout
                </div>
                <p className="text-[#4A4845] mt-1">
                  Measures overloaded precincts above 3,000–5,000 voters (PB-08), deadline spikes (PB-07), and 25.9M ballot history (PB-10).
                </p>
              </div>
            </div>
            <p className="mt-4">
              <strong>66 of Mississippi&apos;s 82 counties</strong> sit quietly on the smooth green baseline sheet—meaning their numbers match normal population patterns. For the 16 counties that rise above the sheet, Commissioners can click a single button to isolate X, Y, or Z and see their county&apos;s exact checklist.
            </p>
          </section>

          <section className="border-t border-[#E4E0D8] pt-8">
            <div className="font-mono text-xs uppercase tracking-widest text-[#D9381E] font-bold mb-1">
              03 · 25.91 Million Historical Ballots Cross-Checked
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#111111] mb-3">
              Zero Orphaned Ballots Across the Entire State
            </h2>
            <p>
              We connected all <strong>25,911,640 rows</strong> of Mississippi&apos;s statewide Voting History file directly to the <strong>2,112,460 rows</strong> of the Master Voter Roll. Every single ballot matched a valid registered Voter ID (<strong>100.00% match, 0 orphaned ballots</strong>). We also verified all <strong>1,213,364 unique voters</strong> in the November 2024 General Election and isolated the 88 rows where a voter&apos;s participation credit was scanned twice on the same day so clerks can clean them up in minutes.
            </p>
          </section>

          <section className="border-t border-[#E4E0D8] pt-8">
            <div className="font-mono text-xs uppercase tracking-widest text-[#D9381E] font-bold mb-1">
              04 · 100% Zero-PII &amp; Ink-Saving Print Design
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#111111] mb-3">
              Built to Print Cleanly and Share Safely at Any County Meeting
            </h2>
            <p>
              Election Commissioners often print reports to hand out at Board of Supervisors meetings, Circuit Clerk workshops, and regional ECAM gatherings. We redesigned both the web report and the 10-page PDF in our <strong>Accént Ink-Saving Editorial style</strong>—replacing heavy dark backgrounds with crisp white paper, thin hairline rules, and clear tables that print beautifully on any office printer without wasting toner. And because every personal name and private house number is redacted (<strong>100% Zero-PII</strong>), Commissioners can share this report publicly with complete confidence.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
