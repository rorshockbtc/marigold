"use client";

import { useState } from "react";
import Link from "next/link";

const DOCS_DATA = [
  {
    title: "Mission Control (The To-Do List)",
    category: "Platform Features",
    description: "The Mission Control page is the home base for volunteers. Instead of guessing what to search for, this page provides one-click Playbooks curated by your organization. Click a Playbook, and the system instantly runs a pre-configured audit tailored to your county."
  },
  {
    title: "Pro Mode & Tuning",
    category: "Platform Features",
    description: "Pro Mode allows advanced volunteers to tweak the algorithms. If a threshold of 12 occupants is producing too much noise in an urban county, you can use the sliders to bump it to 25. Once you find the perfect threshold, you can save it as a Playbook for the rest of your team."
  },
  {
    title: "The Self-Teaching Exclusion Loop (False Positives)",
    category: "Platform Features",
    description: "When viewing results, you can click the '👎 Exclude' button on any row. This instantly flags the record (e.g. a nursing home) as a False Positive and saves it to a global database. From that moment on, every single algorithm in the application will automatically filter out that address for all users in your organization, making the system smarter every day."
  },
  {
    title: "High-Density Occupancy",
    category: "Phase 2 Audits",
    description: "Flags addresses with a high number of registered voters (default: 12+). Helps identify undocumented institutions, large communal living spaces, or massive data bloat at a single residence."
  },
  {
    title: "Missing Unit/Dorm Number",
    category: "Phase 2 Audits",
    description: "Filters high-density addresses (50+ voters) that are missing a specific apartment, suite, or dorm room number. Lack of unit numbers can cause mail undeliverability."
  },
  {
    title: "P.O. Box in Residence",
    category: "Phase 2 Audits",
    description: "Identifies records using a P.O. Box as their physical residential address. Under most state laws, voters must register at a physical domicile, not a postal box."
  },
  {
    title: "Fat-Finger Typo Check",
    category: "Phase 3 Audits",
    description: "Finds voters whose first or last name is exactly 1 character long (e.g., 'J Smith'). This indicates a clerk data-entry error that could cause ID-matching issues at the polls."
  },
  {
    title: "Intra-County Duplicates",
    category: "Phase 3 Audits",
    description: "Performs a SQL cross-reference to find pairs of records with the exact same First Name, Last Name, and Zip Code, but entirely different street addresses. Typically signifies an unpurged record when a voter moves across town."
  },
  {
    title: "Commercial Disguises",
    category: "Phase 3 Audits",
    description: "Scans residential addresses for commercial indicators like 'STE', 'SUITE', or 'BLDG' while filtering out apartments. Helps catch voters attempting to register at UPS Stores or commercial offices."
  },
  {
    title: "Registration Spikes",
    category: "Phase 4.1 Audits",
    description: "Groups registrations by date and county to identify massive, unexplained single-day surges. A spike of 2,000 voters on a random Tuesday could indicate a bulk-import glitch or a massive third-party registration drive."
  },
  {
    title: "Phantom Precincts",
    category: "Phase 4.1 Audits",
    description: "Finds ACTIVE voters who fell through the cracks and have a blank precinct assigned to them. A voter without a precinct cannot be assigned a proper ballot on Election Day."
  },
  {
    title: "Out-of-State Mailing Loophole",
    category: "Phase 4.1 Audits",
    description: "Identifies active state voters who permanently forward their mail to an out-of-state address. Long-term out-of-state mailings are a strong indicator of a voter who moved away but never formally canceled their registration."
  },
  {
    title: "The Ghost Voter Check (Premium API)",
    category: "Phase 4.2 Locked",
    description: "Requires secure API integration. Cross-references private Dates of Birth to find unpurged centenarians (110+ years old)."
  },
  {
    title: "Real Estate Zoning Overlay (Premium API)",
    category: "Phase 4.2 Locked",
    description: "Requires API integration (e.g. Zillow) to overlay property zoning records and flag high-density Single-Family zoned homes."
  },
  {
    title: "Live NCOA Flight Risk (Premium API)",
    category: "Phase 4.2 Locked",
    description: "Requires live API access to actively query the National Change of Address database for immediate out-of-state moves."
  },
  {
    title: "Z-Score (Outlier Detection)",
    category: "Stats 101",
    description: "A statistically valid way to measure exactly how abnormal an outlier is. A Z-Score over 3 means a data point is mathematically highly suspicious and requires investigation."
  },
  {
    title: "Skewness & Kurtosis",
    category: "Stats 101",
    description: "Measures if data leans heavily to one side or has 'fat tails' (meaning lots of extreme outliers). Highly relevant when searching for massive registration spikes."
  },
  {
    title: "Standard Deviation vs. Mean",
    category: "Stats 101",
    description: "The Mean (average) is prone to being wildly skewed by massive outliers (like nursing homes). Standard Deviation measures how chaotic or spread out the data is. A high deviation means relying on averages is dangerous."
  }
];

export default function SetupGuidePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocs = DOCS_DATA.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Documentation & Setup</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
          Search the glossary below to understand how the platform works, or scroll down for instructions on connecting your AI API key.
        </p>
      </div>

      {/* Searchable Glossary Section */}
      <div className="card space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-2xl font-bold border-b border-border pb-2 w-full">📖 Algorithm Glossary & Features</h3>
          <div className="w-full md:w-72 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
            <input 
              type="text" 
              placeholder="Search documentation..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No documentation found matching your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocs.map((doc, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-muted/10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-primary">{doc.title}</h4>
                  <span className="text-xs font-semibold px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                    {doc.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Original Setup Guide Section */}
      <div className="card space-y-6 mt-12">
        <div>
          <h3 className="text-2xl font-serif font-bold border-b border-border pb-2">Setting Up Optional AI Guide</h3>
          <p className="text-base leading-relaxed mt-4">
            Marigold Insights includes an optional plain-language AI assistant to help volunteers write custom search queries without programming syntax. To enable this feature, volunteers can configure their own personal API Key so the system connects securely to cloud natural language models.
          </p>
        </div>

        <div className="bg-slate-50 border-l-4 border-amber-500 p-4 rounded-r-md border border-slate-200">
          <h3 className="font-serif font-bold text-lg text-primary mb-2">Free vs. Paid Tiers</h3>
          <p className="text-sm text-slate-600">Standard cloud providers offer two tiers for natural language APIs:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-600">
            <li><strong>Free Tier (Recommended):</strong> Completely free and sufficient for everyday volunteer inquiries.</li>
            <li><strong>Pay-as-you-go:</strong> Only necessary for automated batch processing across millions of records.</li>
          </ul>
        </div>

        <div className="space-y-6 mt-8">
          <div>
            <h4 className="text-lg font-serif font-bold text-primary">Step 1: Obtain API Key</h4>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground text-sm">
              <li>Navigate to your developer portal (e.g., <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent underline font-bold">Google AI Studio</a>).</li>
              <li>Log in using your standard organization or personal account.</li>
            </ol>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold text-primary">Step 2: Generate Key</h4>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground text-sm">
              <li>Click <strong>Get API key</strong> in the developer console.</li>
              <li>Select <strong>Create API key in new project</strong>.</li>
              <li>Copy the generated text string and keep it secure.</li>
            </ol>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold text-primary">Step 3: Connect to Workspace</h4>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground text-sm">
              <li>Open Marigold Insights and navigate to <Link href="/settings" className="text-accent underline font-bold">Group Settings</Link>.</li>
              <li>Paste your key into the designated API box and click <strong>Save Settings</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

    </div>
  );
}
