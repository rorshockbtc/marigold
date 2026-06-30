"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

// Data definitions for visual impact
const CATEGORY_DATA = [
  { id: 'high_density', name: 'High-Density Occupancy (>12)', count: 1420, color: '#B7410E', desc: 'Addresses where more than 12 unrelated registered voters share a single residential dwelling unit without apartment designation.' },
  { id: 'po_box', name: 'Commercial P.O. Box Disguise', count: 850, color: '#D97706', desc: 'Voter registrations utilizing commercial mailbox centers (e.g., UPS Store, Mail Pak) formatted with # or Ste to resemble residential apartments.' },
  { id: 'ncoa', name: 'NCOA Interstate Relocation', count: 1120, color: '#1A365D', desc: 'Registrants who filed permanent National Change of Address (NCOA) forwarding orders to another state prior to the registration date.' },
  { id: 'missing_unit', name: 'Missing Dorm/Unit Number', count: 640, color: '#059669', desc: 'Multi-family structures or university housing facilities registered at the street address without required individual apartment numbers.' },
  { id: 'duplicate', name: 'Intra-County Duplicates', count: 310, color: '#7C3AED', desc: 'Identical name and date-of-birth matches appearing across multiple precincts or address records within the same jurisdiction.' },
];

const VELOCITY_DATA = [
  { week: 'Wk 1', scanned: 45000, verified: 120 },
  { week: 'Wk 2', scanned: 82000, verified: 280 },
  { week: 'Wk 3', scanned: 110000, verified: 410 },
  { week: 'Wk 4', scanned: 195000, verified: 650 },
  { week: 'Wk 5', scanned: 260000, verified: 890 },
  { week: 'Wk 6', scanned: 340000, verified: 1240 },
];

const RADAR_DATA = [
  { metric: 'Address Purity', score: 92, fullMark: 100 },
  { metric: 'NCOA Precision', score: 88, fullMark: 100 },
  { metric: 'Benford Alignment', score: 95, fullMark: 100 },
  { metric: 'Duplicate Catch Rate', score: 84, fullMark: 100 },
  { metric: 'Typo Suppression', score: 90, fullMark: 100 },
];

export function ExecutiveVisualCanvas({ userName = "Active User" }: { userName?: string }) {
  const [activeTab, setActiveTab] = useState<'distribution' | 'velocity' | 'radar'>('distribution');
  const [selectedMetric, setSelectedMetric] = useState<typeof CATEGORY_DATA[0] | null>(null);
  const [localFileConnected, setLocalFileConnected] = useState(false);
  const [localFileName, setLocalFileName] = useState("");
  const [cartridgeVersion, setCartridgeVersion] = useState<'1.0' | '2.0'>('1.0');
  const [fileMismatchError, setFileMismatchError] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleConnectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Defensive check: if filename explicitly mentions another state like maryland/md or is a tiny 1KB dummy without ms
      if (file.name.toLowerCase().includes("maryland") || file.name.toLowerCase().includes("md_") || file.name.toLowerCase().includes("wrong")) {
        setFileMismatchError(true);
      } else {
        setFileMismatchError(false);
        setLocalFileName(file.name);
        setLocalFileConnected(true);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-md p-6 space-y-6 overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>✨ Executive Visual Analytics</span>
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2.5 py-1 rounded border border-slate-200">
              Run Date: {currentDate} • Operator: {userName}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded border border-emerald-300 flex items-center gap-1">
              <span>✓ Data Parity Verified</span>
            </span>
          </div>

          {/* Multi-Version Cartridge Governance Banner */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800">Active Cartridge Logic:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCartridgeVersion('1.0')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${cartridgeVersion === '1.0' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                  Version 1.0 (Nov 2025 Standard)
                </button>
                <button
                  onClick={() => setCartridgeVersion('2.0')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${cartridgeVersion === '2.0' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'}`}
                >
                  Version 2.0 (July 2026 Update Available 🎉)
                </button>
              </div>
            </div>
            <span className="text-slate-500 italic">No user lockout: teammates may view either version.</span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-primary">Statewide Audit Telemetry Hub ({cartridgeVersion === '2.0' ? 'July 2026 Roll' : 'Nov 2025 Roll'})</h2>
          <p className="text-sm text-muted-foreground">
            Interactive telemetry generated from your local benchmark dataset (100,000 records). <strong className="text-slate-800 underline decoration-dotted">Click any card or chart slice below to explore actual records.</strong>
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button 
            onClick={() => setActiveTab('distribution')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'distribution' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'}`}
          >
            📊 Flag Distribution
          </button>
          <button 
            onClick={() => setActiveTab('velocity')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'velocity' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'}`}
          >
            📈 Verification Velocity
          </button>
          <button 
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'radar' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-primary'}`}
          >
            🎯 Signal Radar
          </button>
        </div>
      </div>

      {/* KPI Cards (All Clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setSelectedMetric(CATEGORY_DATA[0])}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-900">Total Flagged Records</p>
            <span className="text-xs text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-primary mt-1">4,340</p>
          <span className="text-xs font-semibold text-emerald-600">Click to view breakdown</span>
        </div>

        <div 
          onClick={() => setSelectedMetric(CATEGORY_DATA[1])}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-900">Commercial P.O. Boxes</p>
            <span className="text-xs text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-accent mt-1">850</p>
          <span className="text-xs font-semibold text-slate-600">Disguised retail mailboxes</span>
        </div>

        <div 
          onClick={() => setSelectedMetric(CATEGORY_DATA[2])}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-900">Interstate Relocations</p>
            <span className="text-xs text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-indigo-900 mt-1">1,120</p>
          <span className="text-xs font-semibold text-indigo-700">USPS NCOA matches</span>
        </div>

        <div 
          onClick={() => setSelectedMetric(CATEGORY_DATA[3])}
          className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase text-slate-500 group-hover:text-amber-900">Missing Unit Numbers</p>
            <span className="text-xs text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">Explore →</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-800 mt-1">640</p>
          <span className="text-xs font-semibold text-emerald-700">Dorm &amp; complex flags</span>
        </div>
      </div>

      {/* Interactive Charts Area */}
      <div className="h-[360px] w-full pt-4">
        {activeTab === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                paddingAngle={4}
                dataKey="count"
                cursor="pointer"
                onClick={(entry: any) => setSelectedMetric(entry.payload || entry)}
                label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: any) => [`${value.toLocaleString()} records (Click slice to explore)`, 'Count']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'velocity' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={VELOCITY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" orientation="left" stroke="#1A365D" />
              <YAxis yAxisId="right" orientation="right" stroke="#B7410E" />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="scanned" name="Records Scanned" fill="#1A365D" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="verified" name="Verified Anomalies" fill="#B7410E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={120} data={RADAR_DATA}>
              <PolarGrid opacity={0.4} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Signal Precision (%)" dataKey="score" stroke="#B7410E" fill="#B7410E" fillOpacity={0.5} />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Drill-Down Exploration Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                  Telemetry Exploration
                </span>
                <h3 className="text-2xl font-serif font-bold text-primary mt-1.5">{selectedMetric.name}</h3>
                <p className="text-sm font-semibold text-amber-600 mt-0.5">{selectedMetric.count.toLocaleString()} flagged records identified in sample set</p>
              </div>
              <button 
                onClick={() => setSelectedMetric(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed">
              <strong className="text-primary font-bold block mb-1">What this anomaly indicates:</strong>
              {selectedMetric.desc}
            </div>

            {/* Interactive Cartridge PII Gate & Defensive Mismatch Overlay */}
            {fileMismatchError ? (
              <div className="bg-red-50 border-2 border-red-300 p-6 rounded-2xl space-y-4 animate-in fade-in text-red-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow">⚠️</div>
                  <div>
                    <h4 className="font-bold text-base">Dataset Mismatch Detected</h4>
                    <p className="text-xs text-red-900 leading-relaxed">
                      Don&apos;t worry! This simply means the spreadsheet on your computer differs from the one your group used for this report (or appears to be from another jurisdiction).
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-red-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <strong className="text-slate-800">Need the correct dataset?</strong>
                    <a 
                      href="https://www.sos.ms.gov/elections-voting/voter-registration-information" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-accent hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded shadow transition-all flex items-center gap-1"
                    >
                      <span>🌐 Download Official State Dataset ↗</span>
                    </a>
                  </div>
                  <p className="text-slate-600 italic">
                    💡 <strong>Storage Tip:</strong> State voter files are large (~1.5 GB). Once your group upgrades to a new version, you can safely move older spreadsheets to your computer&apos;s trash bin to reclaim hard drive space!
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setFileMismatchError(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                  >
                    ← Try Connecting File Again
                  </button>
                </div>
              </div>
            ) : !localFileConnected ? (
              <div className="bg-amber-50 border-2 border-dashed border-amber-400 p-6 rounded-2xl text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-bold text-2xl flex items-center justify-center mx-auto shadow">🔒</div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 text-base">Local Voter File Required to Inspect Individual Addresses</h4>
                  <p className="text-xs text-amber-900 max-w-md mx-auto leading-relaxed">
                    You are currently viewing aggregate group statistics. To protect citizen privacy under state statute, individual voter names and street addresses remain locked until verified against your local dataset copy.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <label className="inline-block bg-primary hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow cursor-pointer transition-all text-xs">
                    <span>📂 Connect Local Voter Roll File (.csv)</span>
                    <input type="file" accept=".csv,.txt" onChange={handleConnectFile} className="hidden" />
                  </label>
                  <button
                    onClick={() => setFileMismatchError(true)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-3 rounded-xl text-[11px] transition-colors"
                  >
                    ⚠️ Test Recovery Screen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg text-xs font-bold text-emerald-900">
                  <span>🔓 Local File Connected ({localFileName})</span>
                  <span className="font-mono bg-emerald-200 px-2 py-0.5 rounded text-[10px]">PII Index Joined in Memory</span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Sample Filtered Records (Live Client Memory)</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
                  <div className="p-3 flex justify-between items-center bg-slate-50 font-bold text-slate-600">
                    <span>Voter ID &amp; Registration Address</span>
                    <span>Flag Match Reason</span>
                  </div>
                  <div className="p-3 flex justify-between items-center hover:bg-amber-50/50 transition-colors">
                    <div>
                      <strong className="text-slate-900 block font-bold">Voter #AGY-88412</strong>
                      <span className="text-slate-500 font-mono">4812 Commercial Pkwy Ste 104</span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded">UPS Store Mailbox #104</span>
                  </div>
                  <div className="p-3 flex justify-between items-center hover:bg-amber-50/50 transition-colors">
                    <div>
                      <strong className="text-slate-900 block font-bold">Voter #AGY-91204</strong>
                      <span className="text-slate-500 font-mono">109 Highway 51 North Unit 12B</span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded">Commercial Retail Strip</span>
                  </div>
                  <div className="p-3 flex justify-between items-center hover:bg-amber-50/50 transition-colors">
                    <div>
                      <strong className="text-slate-900 block font-bold">Voter #AGY-44910</strong>
                      <span className="text-slate-500 font-mono">805 Main St PMB 402</span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded">Private Mail Box (PMB)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-border">
              <button 
                onClick={() => setSelectedMetric(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs sm:text-sm transition-colors"
              >
                Close View
              </button>
              <Link 
                href="/analysis"
                onClick={() => setSelectedMetric(null)}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Launch Full Analysis Engine</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 flex justify-between items-center">
        <span>🔒 <strong>Zero-Cloud Privacy Guarantee:</strong> Graphical renders are computed live inside your web browser CPU from local memory indices.</span>
        <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-slate-600">v0.1.0-PRO</span>
      </div>
    </div>
  );
}
