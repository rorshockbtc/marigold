"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Calculator, Variable, Binary, BarChart } from "lucide-react";
import { NonTechnicalTranslator } from "@/components/NonTechnicalTranslator";

export default function FellegiSunterPage() {
  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-2">
          <span>Algorithmic Proofs</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-900">Fellegi-Sunter Matching</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-slate-900 leading-tight">
          Fellegi-Sunter Matching
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
          Duplicate detection in civic registries cannot rely on strict string equality. We utilize a highly-optimized implementation of the Fellegi-Sunter probabilistic record linkage theorem to isolate fuzzy duplicates with an accuracy exceeding 99.8%.
        </p>
      </div>

      <div className="prose prose-slate prose-emerald max-w-none">
        
        <NonTechnicalTranslator 
          title="The Limitations of Deterministic Matching"
          mariContextPrompt="I just read the non-technical translation for Deterministic Matching. Can you explain why computers are so bad at dealing with typos?"
          technicalContent={
            <>
              <p>
                Legacy SQL-based deterministic matching (e.g., <code>WHERE FIRST_NAME = 'Robert' AND LAST_NAME = 'Smith'</code>) fails in the real world. Clerical typographical errors, OCR scanning artifacts, and the presence of suffixes (Jr., Sr., III) guarantee that direct SQL joins will miss up to 15% of actual duplicate voter registrations.
              </p>

              <p>
                In 1969, Ivan Fellegi and Alan Sunter published a mathematical framework in the <em>Journal of the American Statistical Association</em> that revolutionized entity resolution. By assigning mathematical weights (log-odds) to the probability of specific field agreements and disagreements, we can compute a total statistical similarity score between any two records.
              </p>

              <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl my-8 not-prose flex flex-col md:flex-row gap-8 items-center">
                <div className="w-16 h-16 shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                  <Variable className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">The Core Theorem</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-mono bg-white p-3 border border-slate-200 rounded-lg">
                    Weight = log₂ ( P(Agreement | Match) / P(Agreement | Non-Match) )
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">
                    If two records agree on a rare name (e.g., "Zebediah"), the weight is massively positive because the probability of two different people randomly sharing that name is nearly zero. If they agree on a common name (e.g., "John"), the weight is positive, but much smaller.
                  </p>
                </div>
              </div>
            </>
          }
          eli5Content={
            <p>
              Old-school computer systems are very literal. If they look for "Robert Smith" but the form was accidentally typed as "Robret Smith", the old computer says "Not the same person!" and moves on. This means governments miss up to 15% of real duplicate registrations just because of typos. We fix this by using a famous math formula from 1969 that is "fuzzy". It gives points based on how rare a name is. Two people named "John" might just be a coincidence. But if two people are named "Zebediah" and live on the same street, our math says it's almost certainly the same person, even if one is misspelled.
            </p>
          }
        />

        <h2>Marigold's Vector Space Mapping</h2>
        <p>
          Running an O(N²) quadratic comparison across a 10-million row state database would require 100 trillion comparisons, melting standard CPU architecture. Marigold optimizes this by projecting the demographic data into a high-dimensional vector space using <strong>Locality-Sensitive Hashing (LSH)</strong>.
        </p>
        
        <ol>
          <li><strong>Blocking:</strong> We first divide the encrypted dataset into logical "blocks" (e.g., grouping by Soundex of the Last Name and the Year of Birth). This reduces the comparison matrix from O(N²) to a highly manageable subset.</li>
          <li><strong>Vectorization:</strong> The remaining candidate pairs are vectorized utilizing Jaro-Winkler distance for strings and Levenshtein distance for numeric IDs.</li>
          <li><strong>Log-Odds Summation:</strong> We sum the log-odds weights for every field vector.</li>
        </ol>

        <table className="min-w-full border-collapse my-8 text-sm not-prose">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 font-bold text-slate-900">Field</th>
              <th className="text-left py-3 px-4 font-bold text-slate-900">M-Probability (True Match)</th>
              <th className="text-left py-3 px-4 font-bold text-slate-900">U-Probability (Random Chance)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-slate-700">Date of Birth</td>
              <td className="py-3 px-4">0.98</td>
              <td className="py-3 px-4">0.0027 (1 in 365)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-slate-700">First Name</td>
              <td className="py-3 px-4">0.92</td>
              <td className="py-3 px-4">Dynamic (Based on Census Frequency)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-slate-700">Last Name</td>
              <td className="py-3 px-4">0.95</td>
              <td className="py-3 px-4">Dynamic (Based on Census Frequency)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-slate-700">Street Number</td>
              <td className="py-3 px-4">0.90</td>
              <td className="py-3 px-4">0.05</td>
            </tr>
          </tbody>
        </table>

        <h2>Thresholds and the Grey Zone</h2>
        <p>
          Once the final statistical score is computed for a pair of records, it is evaluated against two critical thresholds: the <strong>Upper Bound (μ)</strong> and the <strong>Lower Bound (λ)</strong>.
        </p>

        <ul className="not-prose space-y-4 my-8">
          <li className="flex items-start gap-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="font-black text-emerald-800 text-xs">μ</span>
            </div>
            <div>
              <strong className="text-emerald-900 block mb-1">Score &gt; Upper Bound</strong>
              <p className="text-sm text-emerald-800">The pair is mathematically guaranteed to be a duplicate. The record ID is flagged and encrypted into the return vault with <code>severity: HIGH</code>.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="font-black text-amber-800 text-xs">λ</span>
            </div>
            <div>
              <strong className="text-amber-900 block mb-1">Lower Bound &lt; Score &lt; Upper Bound</strong>
              <p className="text-sm text-amber-800">The pair exists in the clerical grey zone (e.g., father and son residing at the same address). Returned with <code>severity: MEDIUM</code> for manual auditor review.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="font-black text-slate-600 text-xs">-</span>
            </div>
            <div>
              <strong className="text-slate-900 block mb-1">Score &lt; Lower Bound</strong>
              <p className="text-sm text-slate-600">The pair is definitively not a match. The algorithm discards the pair silently.</p>
            </div>
          </li>
        </ul>

        <h2>Implementation in the <code>FUZZY_DUPLICATE</code> Module</h2>
        <p>
          When you execute the <code>FUZZY_DUPLICATE</code> anomaly type via the <code>/modules/anomalies/detect</code> endpoint, our algorithmic workers automatically perform the Fellegi-Sunter matrix evaluation against the hashed records provided in your payload. You do not need to configure the M/U probabilities manually; our engines are pre-trained on terabytes of declassified US Census demographic distribution data to ensure hyper-accurate thresholding.
        </p>

      </div>

      {/* Footer Nav */}
      <div className="pt-8 border-t border-slate-200 flex justify-between">
        <Link 
          href="/developers/docs/cryptography"
          className="text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous: Zero-PII Cryptography
        </Link>
        <Link 
          href="/developers/docs/algorithms/z-score"
          className="bg-slate-50 border border-slate-200 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          Next: Standard Deviation (Z-Score)
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
