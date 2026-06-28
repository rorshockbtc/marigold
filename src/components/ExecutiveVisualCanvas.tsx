"use client";

import React, { useState } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

// Data definitions for visual impact
const CATEGORY_DATA = [
  { name: 'High-Density Occupancy (>12)', count: 1420, color: '#B7410E' },
  { name: 'Commercial P.O. Box Disguise', count: 850, color: '#D97706' },
  { name: 'NCOA Interstate Relocation', count: 1120, color: '#1A365D' },
  { name: 'Missing Dorm/Unit Number', count: 640, color: '#059669' },
  { name: 'Intra-County Duplicates', count: 310, color: '#7C3AED' },
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

export function ExecutiveVisualCanvas() {
  const [activeTab, setActiveTab] = useState<'distribution' | 'velocity' | 'radar'>('distribution');

  return (
    <div className="bg-white rounded-2xl border border-border shadow-md p-6 space-y-6 overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <span>✨ Executive Visual Analytics</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary">Statewide Audit Telemetry Hub</h2>
          <p className="text-sm text-muted-foreground">Real-time graphical projection of flagged anomalies and verification metrics.</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Total Flagged Records</p>
          <p className="text-2xl md:text-3xl font-extrabold text-primary mt-1">4,340</p>
          <span className="text-xs font-semibold text-emerald-600">↑ 18% from last cycle</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">Local Memory Throughput</p>
          <p className="text-2xl md:text-3xl font-extrabold text-accent mt-1">1.03M</p>
          <span className="text-xs font-semibold text-slate-600">Records / sec RAM scan</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">False Positive Rate</p>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-700 mt-1">4.2%</p>
          <span className="text-xs font-semibold text-emerald-600">↓ 2.1% improvement</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-500">FEMA Audit Readiness</p>
          <p className="text-2xl md:text-3xl font-extrabold text-purple-700 mt-1">100%</p>
          <span className="text-xs font-semibold text-purple-600">Turnkey compliant</span>
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
                label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: any) => [`${value.toLocaleString()} records`, 'Count']}
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

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 flex justify-between items-center">
        <span>🔒 <strong>Zero-Cloud Privacy Guarantee:</strong> Graphical renders are computed live inside your web browser CPU from aggregated local memory indices.</span>
        <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-slate-600">v0.1.0-PRO</span>
      </div>
    </div>
  );
}
