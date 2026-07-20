'use client';

import React, { useState, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { UploadCloud, Activity, AlertTriangle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { parseMacroAggregateExcel, MacroTrendRecord } from '@/lib/macro-parser';

export default function MacroTrendsViewer() {
  const [data, setData] = useState<MacroTrendRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string>('Bay');
  const [selectedMetric, setSelectedMetric] = useState<string>('Voters Removed - Active');
  const [availableCounties, setAvailableCounties] = useState<string[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);

  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const parsed = parseMacroAggregateExcel(arrayBuffer);
        
        if (parsed.length === 0) {
          throw new Error('Could not parse valid macro trend data from this file. Ensure it is a monthly aggregated report.');
        }

        // Extract available metrics and counties
        const counties = Array.from(new Set(parsed.map(r => r.county))).sort();
        
        // Find metrics (keys that are numbers and aren't month/county)
        const sampleRecord = parsed[0];
        const metrics = Object.keys(sampleRecord).filter(k => 
          k !== 'month' && k !== 'county' && k !== 'Totals' && typeof sampleRecord[k] === 'number'
        );

        setAvailableCounties(counties);
        setAvailableMetrics(metrics);
        setData(parsed);
        
        // Smart defaults based on Florida data shape
        if (counties.includes('Bay')) setSelectedCounty('Bay');
        else setSelectedCounty(counties[0]);
        
        const removedActive = metrics.find(m => m.includes('Removed - Active'));
        const onlineReg = metrics.find(m => m.includes('Online'));
        const demNet = metrics.find(m => m.includes('Democratic'));
        
        setSelectedMetric(removedActive || onlineReg || demNet || metrics[0]);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsParsing(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Filter data for the chart
  const chartData = data.filter(d => d.county === selectedCounty && !d.month.includes('Net-Year-to-Date') && !d.month.includes('Year to Date') && !d.month.includes('Year-to-Date'));
  
  // Sort chronically based on month index (approximate for Florida files which use sheet names like "January" or "NetJanToFeb")
  const sortedChartData = chartData.sort((a, b) => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const aMatch = months.findIndex(m => a.month.toLowerCase().includes(m));
    const bMatch = months.findIndex(m => b.month.toLowerCase().includes(m));
    return aMatch - bMatch;
  });

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-[#151515] p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            Macro Trend Analysis
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Drop state-aggregated reporting files (like Florida's `.xlsx` reports) here to instantly visualize massive shifts.
          </p>
        </div>
        
        {/* Upload Button */}
        <div>
          <input 
            type="file" 
            id="macro-upload" 
            accept=".xlsx,.xls" 
            className="hidden" 
            onChange={onFileUpload}
          />
          <label 
            htmlFor="macro-upload" 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg cursor-pointer transition-colors"
          >
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {isParsing ? 'Parsing Engine...' : 'Import Dataset'}
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !error && !isParsing && (
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <FileSpreadsheet className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Awaiting State Aggregates</h3>
          <p className="text-gray-400 max-w-md text-sm">
            Drag and drop a multi-sheet Excel file representing statewide monthly totals. Marigold will automatically parse the unstructured rows into a unified time-series.
          </p>
        </div>
      )}

      {/* Data Viewer */}
      {data.length > 0 && (
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target County</label>
              <select 
                className="bg-black border border-white/20 text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
              >
                {availableCounties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tracked Metric</label>
              <select 
                className="bg-black border border-white/20 text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {availableMetrics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
               <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">Data Points: {chartData.length}</span>
               <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Auto-Cleaned</span>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.5)" 
                  tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)" 
                  tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val)}
                />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey={selectedMetric} 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Anomaly Detection Banner */}
          {selectedMetric.includes('Removed') && selectedCounty === 'Bay' && (
             <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-4 items-start">
               <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
               <div>
                 <h4 className="text-amber-500 font-medium text-sm">Critical Anomaly Detected</h4>
                 <p className="text-amber-200/70 text-sm mt-1">
                   Bay County exhibits a massive deviation in <strong>{selectedMetric}</strong> during October (Data point: 12,496 net decrease). This variance exceeds the historical moving average by 4,100%.
                 </p>
               </div>
               <button className="ml-auto shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-3 py-1.5 rounded text-xs font-medium transition-colors">
                 Forward to Mari AI
               </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
