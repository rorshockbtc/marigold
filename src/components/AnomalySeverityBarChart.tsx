"use client";

import React from "react";
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface SeverityCounts {
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  INFO: number;
}

interface AnomalySeverityBarChartProps {
  severityCounts: SeverityCounts;
  totalRecordsScanned: number;
  isRunningSweep: boolean;
  queryProgress: number;
}

export function AnomalySeverityBarChart({
  severityCounts,
  totalRecordsScanned,
  isRunningSweep,
  queryProgress
}: AnomalySeverityBarChartProps) {
  const totalAnomalies =
    severityCounts.CRITICAL +
    severityCounts.HIGH +
    severityCounts.MEDIUM +
    severityCounts.INFO;

  const getPercentage = (count: number) => {
    if (totalAnomalies === 0) return 0;
    return Math.round((count / totalAnomalies) * 100);
  };

  return (
    <Card className="bg-white p-6 rounded-2xl border border-border-soft shadow-sm space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-soft pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-text-header">Anomaly Severity & Risk Breakdown</h3>
            <p className="text-xs text-text-body">
              {totalRecordsScanned > 0
                ? `${totalAnomalies.toLocaleString()} total anomaly findings flagged across ${totalRecordsScanned.toLocaleString()} records`
                : "Run a 360º sweep to evaluate severity distribution across active playbooks"}
            </p>
          </div>
        </div>

        {isRunningSweep && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-full text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Scanning: {queryProgress}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar Visual Representation */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-text-header">
          <span>Overall Anomaly Distribution by Severity</span>
          <span>{totalAnomalies.toLocaleString()} Total Anomalies</span>
        </div>

        <div className="h-4 w-full bg-surface rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border-soft">
          {severityCounts.CRITICAL > 0 && (
            <div
              className="bg-red-600 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${Math.max(2, getPercentage(severityCounts.CRITICAL))}%` }}
              title={`Critical Risk: ${severityCounts.CRITICAL.toLocaleString()} (${getPercentage(severityCounts.CRITICAL)}%)`}
            />
          )}
          {severityCounts.HIGH > 0 && (
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.max(2, getPercentage(severityCounts.HIGH))}%` }}
              title={`High Risk: ${severityCounts.HIGH.toLocaleString()} (${getPercentage(severityCounts.HIGH)}%)`}
            />
          )}
          {severityCounts.MEDIUM > 0 && (
            <div
              className="bg-yellow-400 h-full transition-all duration-500"
              style={{ width: `${Math.max(2, getPercentage(severityCounts.MEDIUM))}%` }}
              title={`Medium Risk: ${severityCounts.MEDIUM.toLocaleString()} (${getPercentage(severityCounts.MEDIUM)}%)`}
            />
          )}
          {severityCounts.INFO > 0 && (
            <div
              className="bg-sky-500 h-full rounded-r-full transition-all duration-500"
              style={{ width: `${Math.max(2, getPercentage(severityCounts.INFO))}%` }}
              title={`Info/Notice: ${severityCounts.INFO.toLocaleString()} (${getPercentage(severityCounts.INFO)}%)`}
            />
          )}
          {totalAnomalies === 0 && (
            <div className="bg-emerald-500 h-full w-full rounded-full transition-all duration-500" title="No anomalies flagged" />
          )}
        </div>
      </div>

        {/* Severity Metrics Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Risk</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <p className="text-xl font-serif font-black text-red-900">{severityCounts.CRITICAL.toLocaleString()}</p>
          <p className="text-[10px] text-red-700 font-medium">PO Box & High-Density Dorms</p>
        </div>

        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-xl font-serif font-black text-amber-900">{severityCounts.HIGH.toLocaleString()}</p>
          <p className="text-[10px] text-amber-700 font-medium">NCOA & Intra-County Duplicates</p>
        </div>

        <div className="p-3.5 bg-yellow-50/70 border border-yellow-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-yellow-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Medium Risk</span>
            <Info className="w-4 h-4" />
          </div>
          <p className="text-xl font-serif font-black text-yellow-900">{severityCounts.MEDIUM.toLocaleString()}</p>
          <p className="text-[10px] text-yellow-700 font-medium">Name Typos & Clerical Errors</p>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Audited Baseline</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xl font-serif font-black text-emerald-900">{totalRecordsScanned.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-700 font-medium">Records Verified Active</p>
        </div>
      </div>
    </Card>
  );
}
