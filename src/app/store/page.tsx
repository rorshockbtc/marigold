"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartridgeStorePage() {
  const [cartridges, setCartridges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('All');

  useEffect(() => {
    fetch('/api/playbooks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCartridges(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = (cartridge: any) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(cartridge, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${cartridge.name.replace(/\s+/g, '_').toLowerCase()}.checklist.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredCartridges = selectedState === 'All' 
    ? cartridges 
    : cartridges.filter(c => c.name.includes(`[${selectedState}`) || c.county?.includes(selectedState));

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-block bg-primary text-white font-bold text-xs px-3.5 py-1 rounded uppercase tracking-wider mb-2.5 shadow-sm">
            Standardized Civic Library
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-primary">National Audit Checklist Store</h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl leading-relaxed">
            Crowdsourced verification filters engineered to identify clerical errors and data anomalies. Download a checklist to run locally against your jurisdiction&apos;s records.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-border shadow-sm">
          <span className="text-xs font-bold text-slate-700 pl-2">Filter State:</span>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-100 border border-border rounded px-3 py-1.5 text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="All">All Jurisdictions</option>
            <option value="MN">Minnesota (MN)</option>
            <option value="GA">Georgia (GA)</option>
            <option value="NC">North Carolina (NC)</option>
            <option value="TX">Texas (TX)</option>
            <option value="MS">Mississippi (MS)</option>
          </select>
        </div>
      </div>

      {/* Step-by-Step How It Works Guide */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-serif font-bold text-primary">How to Use a Downloaded Audit Checklist</h2>
          <p className="text-sm text-slate-600 mt-1">Follow this simple 3-step workflow on your personal computer without writing code or needing technical software.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">Step 1: Save Checklist</span>
            <h3 className="font-serif font-bold text-primary text-lg">Click Download</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose an audit test below (such as High-Density Dormitory verification) and click **Download Checklist**. A small file ending in `.json` will save to your computer&apos;s Downloads folder.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">Step 2: Open Sandbox</span>
            <h3 className="font-serif font-bold text-primary text-lg">Load Your Spreadsheet</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Navigate to our Public Sandbox or signed-in Dashboard. Click **Browse Hard Drive** and select your county&apos;s official voter list spreadsheet (`.csv`).
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">Step 3: Apply Filter</span>
            <h3 className="font-serif font-bold text-primary text-lg">View Verified Results</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your downloaded `.json` checklist into the inspector panel. Your web browser will instantly highlight any records matching the criteria right on your screen.
            </p>
          </div>
        </div>
      </div>

      {/* Cartridge Directory Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground font-medium">Loading Audit Checklists...</div>
      ) : filteredCartridges.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <p className="text-muted-foreground text-sm">No verification checklists found matching selected jurisdiction filter.</p>
          <button onClick={() => setSelectedState('All')} className="text-accent underline font-bold mt-2 text-sm">Reset Filter</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCartridges.map((c, i) => {
            const isStateSpecific = c.name.startsWith('[');
            const badgeText = isStateSpecific ? c.name.split(']')[0].replace('[', '') : 'National Standard';
            
            return (
              <div 
                key={i} 
                onClick={() => handleDownload(c)}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded border border-slate-200">
                      {badgeText}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded">
                      Local-Only
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-primary group-hover:text-accent transition-colors leading-snug">{c.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automated criteria checking for `{c.audit_type}` anomalies with parameter threshold &gt;= {c.threshold || 0}.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    Rev 1.{i}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(c);
                    }}
                    className="bg-primary group-hover:bg-accent text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2"
                  >
                    <span>Download Checklist</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Footer */}
      <div className="bg-slate-900 text-white rounded-3xl p-10 text-center space-y-4">
        <h3 className="text-2xl font-serif font-bold">Have a Custom Verification Filter?</h3>
        <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
          Export your sorting parameters or statistical thresholds from Pro Mode and share them with the civic community to assist volunteers across America.
        </p>
        <Link href="/analysis" className="inline-block bg-accent hover:bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-lg shadow transition-all">
          Create Checklist in Pro Mode →
        </Link>
      </div>
    </div>
  );
}
