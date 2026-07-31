"use client";

import React from "react";
import { Shield, CheckCircle, AlertTriangle, FileText } from "lucide-react";

interface PlaybookResult {
  id: string;
  name: string;
  description: string;
  flaggedCount: number;
  status: string;
}

interface ExecutiveReportPDFTemplateProps {
  jurisdictionName: string;
  stateCode: string;
  totalRecordsScanned: number;
  cleanlinessPercentage: number;
  executionTimestamp: string;
  auditorName: string;
  playbookResults: PlaybookResult[];
}

export function ExecutiveReportPDFTemplate({
  jurisdictionName,
  stateCode,
  totalRecordsScanned,
  cleanlinessPercentage,
  executionTimestamp,
  auditorName,
  playbookResults
}: ExecutiveReportPDFTemplateProps) {
  const totalAnomalies = playbookResults.reduce((acc, pb) => acc + pb.flaggedCount, 0);

  return (
    <div id="printable-executive-report" className="hidden print:block bg-white p-12 text-slate-900 font-sans max-w-4xl mx-auto space-y-8">
      {/* Official Letterhead */}
      <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
            OFFICIAL CIVIC DATA AUDIT BRIEFING
          </span>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Jurisdiction Health Report
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Target Area: <strong>{jurisdictionName}</strong> ({totalRecordsScanned.toLocaleString()} Citizen Records Evaluated)
          </p>
        </div>
        <div className="text-right text-xs text-slate-500 font-mono">
          <div>Date: {new Date(executionTimestamp).toLocaleDateString()}</div>
          <div>Auditor: {auditorName}</div>
          <div className="text-emerald-700 font-bold mt-1">Status: Baseline Certified</div>
        </div>
      </div>

      {/* Headline Executive Summary */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-serif font-bold text-slate-800 border-b border-slate-200 pb-2">
          1. Executive Summary & Health Score
        </h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Clean Baseline</span>
            <strong className="text-2xl font-bold text-emerald-700">{cleanlinessPercentage.toFixed(1)}%</strong>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Total Scanned</span>
            <strong className="text-2xl font-bold text-slate-800">{totalRecordsScanned.toLocaleString()}</strong>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Flagged Anomalies</span>
            <strong className="text-2xl font-bold text-amber-700">{totalAnomalies}</strong>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">
          Automated forensic auditing across 7 verified playbooks evaluated {totalRecordsScanned.toLocaleString()} active citizen registrations in {jurisdictionName}. The overall cleanliness rating is <strong>{cleanlinessPercentage.toFixed(1)}%</strong>. A total of {totalAnomalies} potential anomalies require board verification.
        </p>
      </div>

      {/* Playbook Anomaly Breakdown Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-slate-800 border-b border-slate-200 pb-2">
          2. Playbook Audit Findings
        </h2>
        <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
          <thead className="bg-slate-100 font-bold text-slate-700">
            <tr>
              <th className="p-3">Forensic Playbook</th>
              <th className="p-3">Audit Scope</th>
              <th className="p-3 text-right">Flagged Count</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {playbookResults.map((pb) => (
              <tr key={pb.id}>
                <td className="p-3 font-bold text-slate-900">{pb.name}</td>
                <td className="p-3 text-slate-600">{pb.description}</td>
                <td className="p-3 text-right font-bold font-mono text-slate-800">{pb.flaggedCount}</td>
                <td className="p-3 text-right">
                  <span className={`px-2 py-0.5 rounded font-bold ${pb.flaggedCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                    {pb.flaggedCount > 0 ? 'Action Recommended' : 'Clean'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Discovered Opportunities & Recommended Action Steps */}
      <div className="border-t border-slate-200 pt-6 space-y-3 text-xs text-slate-700">
        <h2 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider">
          3. Board Recommendations & Next Steps
        </h2>
        <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
          <li><strong>High-Density Domicile Verification:</strong> Cross-check the flagged addresses against county property rolls and commercial zoning records.</li>
          <li><strong>NCOA Out-of-State Relocations:</strong> Send standard confirmation notices to voters with registered USPS permanent out-of-state moves.</li>
          <li><strong>Duplicate Resolution:</strong> Merge active duplicate records with matching first name, last name, and birthdate pairings.</li>
        </ol>
      </div>

      {/* Official Sign-off Footer */}
      <div className="border-t-2 border-slate-900 pt-6 flex justify-between items-center text-xs text-slate-500">
        <div>Generated via <strong>Marigold Insights Air-Gapped Engine</strong> • Zero Cloud Exposure</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
}
