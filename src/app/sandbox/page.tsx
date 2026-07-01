"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ExecutiveVisualCanvas } from '@/components/ExecutiveVisualCanvas';

export default function SandboxPage() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [simulatedResults, setSimulatedResults] = useState<any[]>([]);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setFileUploaded(true);
      setSimulatedResults([
        { address: "123 DEMO STREET, SAMPLE CITY (Sandbox Placeholder)", occupants: 423, status: "University Dormitory Example" },
        { address: "456 PLACEHOLDER AVE, TEST TOWN (Sandbox Placeholder)", occupants: 18, status: "High-Density Review Needed (>12)" },
        { address: "789 SYNTHETIC BOULEVARD, MOCK CITY (Sandbox Placeholder)", occupants: 85, status: "Commercial Mailbox Example" }
      ]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 font-sans">
      {/* Prominent Synthetic Warning Banner */}
      <div className="bg-orange-600 text-white p-4 sm:p-5 rounded-2xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">🧪</span>
          <span className="leading-relaxed">
            <strong>ACME CIVIC DATA SANDBOX:</strong> All datasets, occupancy records, and addresses displayed on this page are 100% synthetic simulated mock data generated for demonstration and verification purposes only.
          </span>
        </div>
        <span className="bg-orange-950/60 text-orange-200 px-3 py-1.5 rounded-lg text-xs uppercase font-mono font-extrabold whitespace-nowrap shrink-0">
          Synthetic Demo Mode
        </span>
      </div>

      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white shadow-md">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded uppercase tracking-wider">
            ACME Public Demonstration Workspace
          </span>
          <h2 className="text-2xl font-serif font-bold pt-1">Unauthenticated Testing Sandbox</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Test our in-memory data engine with simulated files or public snapshots. To save custom audit playbooks or join a real state organization team, please sign in.
          </p>
        </div>
        <Link href="/dashboard" className="bg-accent text-white font-bold text-sm px-6 py-3 rounded-lg shadow whitespace-nowrap hover:bg-amber-600 transition-all">
          Sign In to Real Workspace →
        </Link>
      </div>

      <div className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Local-Compute Data Sandbox</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl leading-relaxed">
            Select an official state voter export (.csv). All computations and text sorting occur 100% inside your computer&apos;s memory. Nothing is uploaded to a remote server.
          </p>
        </div>
        <button 
          onClick={() => setShowGuideModal(true)}
          className="bg-white border border-border hover:bg-slate-50 text-primary font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-sky-600 inline-block"></span>
          <span>How Does This Protect Privacy? (Guide)</span>
        </button>
      </div>

      {/* File Drop Zone */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-14 text-center space-y-5 hover:border-slate-500 transition-colors shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-600 font-serif font-bold text-2xl">
          CSV
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-xl font-serif font-bold text-primary">Select Local CSV Export</h3>
          <p className="text-sm text-muted-foreground">Supports pipe-delimited or standard comma-separated spreadsheet files up to 2.5GB.</p>
        </div>

        <label className="inline-block bg-primary hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-lg shadow cursor-pointer transition-all text-sm">
          <span>Browse Hard Drive...</span>
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
        </label>
        {fileName && <p className="text-sm font-mono font-bold text-emerald-700 pt-2">Loaded into local memory: {fileName}</p>}
      </div>

      {/* Simulated Results Table */}
      {fileUploaded && (
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-2">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Active Audit Checklist</span>
              <h3 className="font-serif font-bold text-xl text-primary mt-0.5">High-Density Occupancy Filter</h3>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded border border-emerald-300">
              3 Records Verified in Memory
            </span>
          </div>

          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="p-4">Physical Address</th>
                <th className="p-4">Registered Voters</th>
                <th className="p-4">Automated Categorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {simulatedResults.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary">{r.address}</td>
                  <td className="p-4 font-bold text-accent">{r.occupants}</td>
                  <td className="p-4">
                    <span className="text-xs font-bold px-3 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-4">
            <ExecutiveVisualCanvas userName="Sandbox Demo User" isSandbox={true} />
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-xl text-center space-y-4">
            <h4 className="font-serif font-bold text-2xl">Ready to run comprehensive audits on 2,000,000+ records?</h4>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Sign in to unlock Pro Mode, create persistent group checklists, and access our full suite of automated verification filters.
            </p>
            <Link href="/dashboard" className="inline-block bg-accent hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-lg shadow transition-all">
              Unlock Pro Mode Workspace →
            </Link>
          </div>
        </div>
      )}

      {/* Guide Modal for Older Users */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-border space-y-6 text-foreground animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border pb-4 flex justify-between items-center">
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

              <div className="bg-slate-50 p-4 rounded-xl border border-border space-y-2">
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
                className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-sm transition-all"
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
