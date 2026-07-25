"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ArrowLeft, Play, ShieldCheck, FileText, CheckCircle2, BookOpen, Newspaper } from "lucide-react";
import Link from "next/link";

const PLAYBOOK_DETAILS: Record<string, any> = {
  'density': {
    title: "High-Density Residential Occupancy",
    icon: "⚡",
    subtitle: "Identify 12+ voters registered to a single residential address.",
    story: "Imagine a single suburban family home with 14 adults registered to vote. Unless it's a dormitory, nursing home, or fraternity, that high occupancy usually indicates outdated registrations from former tenants who moved away without canceling their voter registration. This playbook automatically finds these anomalies so you can investigate them.",
    steps: [
      "Scans the entire jurisdiction for identical street addresses.",
      "Filters out known commercial properties and university dorms.",
      "Flags any remaining single-family homes or standard apartments with more than 8 active registered voters."
    ],
    technical: "Uses standard SQL GROUP BY operations on the standardized residence_address_line_1 column, joined with the zoning dataset to exclude multi-unit or commercial exemptions. Threshold set to >8.",
    resources: [
      { title: "U.S. Census Bureau - Understanding Group Quarters", url: "#" },
      { title: "USPS Address Management System Guidelines", url: "#" }
    ],
    newsArticles: [
      { title: "Investigating High-Density Voter Registration Anomalies", source: "Civic Tech Monthly, 2024", url: "#" },
      { title: "How Data Science Uncovers Phantom Voters", source: "The Election Auditor, 2023", url: "#" }
    ]
  },
  'missing-dorm': {
    title: "Missing Dorm / Unit #",
    icon: "🏢",
    subtitle: "Flag large communal buildings missing apartment or room numbers.",
    story: "When living in an apartment building, a voter must include their apartment number to receive mail (like an absentee ballot) securely. This playbook finds voters registered to large known apartment complexes or college dorms who failed to include their specific unit number.",
    steps: [
      "Identifies addresses known to contain multiple independent living units.",
      "Checks registered voters at those addresses for a missing Unit, Apt, or Room number.",
      "Flags records for clerical review or mail-forwarding verification."
    ],
    technical: "Cross-references the USPS Address Management System (AMS) data for buildings marked as 'Multi-Tenant' and filters out records where the secondary_address_designator is null.",
    resources: [
      { title: "USPS DPV (Delivery Point Validation) Standards", url: "#" },
      { title: "NENA Standard for Civic Location Data Exchange", url: "#" }
    ],
    newsArticles: [
      { title: "The Challenge of Multi-Tenant Voter Registration", source: "Civic Data Review, 2025", url: "#" },
      { title: "Fixing Apartment Registration Errors in the Digital Age", source: "Tech & Elections, 2024", url: "#" }
    ]
  },
  'duplicates': {
    title: "Intra-County Duplicates",
    icon: "👯",
    subtitle: "Identify exact Name & Zip matches residing at different addresses.",
    story: "Our Fellegi-Sunter math compares names and birthdays across the entire county. If two registrations have identical birthdays and almost identical names (like 'Robert Smith Jr' at two different addresses), our system highlights them so you can merge the duplicate.",
    steps: [
      "Analyzes the full dataset using probabilistic linkage (Fellegi-Sunter).",
      "Calculates log-odds weights for Name, DOB, and Address similarity.",
      "Flags pairs of records with a high confidence match score."
    ],
    technical: "Executes a record linkage algorithm. Standardizes strings using Jaro-Winkler distance and applies a tunable confidence threshold to catch OCR/clerical typos.",
    resources: [
      { title: "Fellegi-Sunter Model of Record Linkage (JASA, 1969)", url: "#" },
      { title: "Jaro-Winkler String Metric Optimization", url: "#" }
    ],
    newsArticles: [
      { title: "Probabilistic Matching Catches Thousands of Duplicates", source: "Data Governance Today, 2023", url: "#" },
      { title: "Why Exact Matching Fails in Civic Audits", source: "Open Source Civic, 2024", url: "#" }
    ]
  }
};

export default function PlaybookDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const data = PLAYBOOK_DETAILS[id] || {
    title: "Playbook Details",
    icon: "📘",
    subtitle: "Learn how this verification process works.",
    story: "This playbook is designed to help you verify civic data and ensure the highest standards of integrity. It uses established statistical methods and cross-references authoritative datasets.",
    steps: [
      "Analyzes your loaded dataset for specific anomalies.",
      "Cross-references records against trusted civic/postal databases.",
      "Flags records for your review."
    ],
    technical: "Standard statistical analysis and relational joins.",
    resources: [],
    newsArticles: []
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/audit" className="flex items-center gap-2 text-sm text-[#646A7A] hover:text-[#D96B27] mb-6 font-bold transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Playbooks
      </Link>
      
      <PageHeader
        title={data.title}
        subtitle={data.subtitle}
        icon={<span>{data.icon}</span>}
        actions={
          <Link 
            href={`/explore?playbook=${id}`}
            className="btn-primary flex items-center gap-2 font-bold px-6 py-3"
          >
            <Play className="w-4 h-4" />
            Run Playbook
          </Link>
        }
      />

      <div className="space-y-8 mt-4 animate-in fade-in duration-500 slide-in-from-bottom-4">
        {/* The Narrative Trust Section */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5" />
            Why this matters (ELI5)
          </div>
          <p className="text-lg text-text-body leading-relaxed">
            {data.story}
          </p>
        </div>

        {/* Stepwise Process */}
        <div className="bg-[#FAF8F5] p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#646A7A] uppercase tracking-wider mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            How it works
          </div>
          <ul className="space-y-4">
            {data.steps.map((step: string, index: number) => (
              <li key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-text-body mt-1">{step}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Research & Media Expansion */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Resources */}
          {data.resources && data.resources.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#646A7A] uppercase tracking-wider mb-4">
                <BookOpen className="w-4 h-4" />
                Technical Resources
              </div>
              <ul className="space-y-3">
                {data.resources.map((res: any, idx: number) => (
                  <li key={idx}>
                    <a href={res.url} className="text-primary hover:underline text-sm font-medium leading-relaxed block">
                      {res.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* News Articles */}
          {data.newsArticles && data.newsArticles.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#646A7A] uppercase tracking-wider mb-4">
                <Newspaper className="w-4 h-4" />
                In The News
              </div>
              <ul className="space-y-4">
                {data.newsArticles.map((article: any, idx: number) => (
                  <li key={idx} className="group cursor-pointer">
                    <a href={article.url} className="block">
                      <h4 className="text-sm font-bold text-text-header group-hover:text-primary transition-colors leading-relaxed">
                        {article.title}
                      </h4>
                      <p className="text-xs text-text-body mt-1">{article.source}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="border border-border-soft rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-muted px-6 py-4 border-b border-border-soft flex items-center gap-2 font-mono text-sm font-bold text-[#646A7A]">
            <FileText className="w-4 h-4" />
            Technical / Academic Specifications
          </div>
          <div className="bg-white p-6 font-mono text-xs text-[#4A5060] leading-relaxed">
            {data.technical}
          </div>
        </div>
      </div>
    </div>
  );
}
