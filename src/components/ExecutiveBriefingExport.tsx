import React, { useState } from "react";
import { Download, Printer, ShieldCheck, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { ExecutiveReportPDFTemplate } from "@/components/ExecutiveReportPDFTemplate";
import { Button } from "@/components/ui/Button";
import { useExportManager } from "@/hooks/useExportManager";

export interface PlaybookAuditSummary {
  id: string;
  name: string;
  audit_type: string;
  totalScanned: number;
  flaggedCount: number;
  status: "Clean" | "Routine Review" | "Notice Required" | "Action Recommended";
  description: string;
}

export interface ExecutiveBriefingProps {
  jurisdictionName: string;
  stateCode: string;
  totalRecordsScanned: number;
  cleanlinessPercentage: number;
  executionTimestamp: string;
  playbookResults: PlaybookAuditSummary[];
  auditorName: string;
  isAuditComplete: boolean;
  anomalyRecords: Record<string, any[]>;
}

export function ExecutiveBriefingExport({
  jurisdictionName,
  stateCode,
  totalRecordsScanned,
  cleanlinessPercentage,
  executionTimestamp,
  playbookResults,
  auditorName,
  isAuditComplete,
  anomalyRecords,
}: ExecutiveBriefingProps) {
  const { requestExport } = useExportManager();

  const sortedPlaybooks = [...playbookResults].sort((a, b) => b.flaggedCount - a.flaggedCount);
  const totalAnomalies = sortedPlaybooks.reduce((acc, pb) => acc + pb.flaggedCount, 0);
  const cleanRecordsCount = Math.max(0, totalRecordsScanned - totalAnomalies);
  const actualCleanPercentage = totalRecordsScanned > 0 ? Number(((cleanRecordsCount / totalRecordsScanned) * 100).toFixed(1)) : 100;
  const maxFlagged = Math.max(...sortedPlaybooks.map(p => p.flaggedCount), 1);

  const handleExportFullAudit = () => {
    const allExportRows: any[] = [];
    sortedPlaybooks.forEach(p => {
      const pRows = anomalyRecords[p.id] || [];
      pRows.forEach(r => {
        allExportRows.push({
          County: r.county || "Statewide",
          Playbook_Rule: p.name,
          Risk_Level: r.risk_level || "HIGH",
          Voter_ID: r.id || r.voter_id,
          Full_Name: r.name,
          Address: r.address,
          City: r.city || "Jackson",
          State: r.state || stateCode,
          Zip: r.zip,
          Occupants_At_Address: r.occupant_count || 1,
          Details: r.details
        });
      });
    });

    requestExport({
      contextType: "FULL_AUDIT",
      title: "Full 360 Audit Checklist",
      description: `Comprehensive audit of ${totalRecordsScanned.toLocaleString()} records across ${jurisdictionName}. ${totalAnomalies} anomalies were flagged for review.`,
      data: allExportRows,
      insights: `The audit completed with a cleanliness score of ${actualCleanPercentage}%. The most severe issues were found in: ${sortedPlaybooks.slice(0, 3).map(pb => pb.name).join(", ")}. Immediate review of these top categories is recommended.`
    });
  };

  return (
    <div className="space-y-6">
      {/* 360º Visual Health Dashboard Card */}
      <div className="bg-white border border-border-soft p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-soft pb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              360º Jurisdiction Health Snapshot
            </span>
            <h2 className="text-2xl font-serif text-text-header font-bold">
              {jurisdictionName} Executive Overview
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                requestExport({
                  contextType: "FULL_AUDIT",
                  title: `${jurisdictionName} Executive Overview`,
                  description: `Printable overview of ${totalRecordsScanned.toLocaleString()} records.`,
                  data: [],
                  insights: `The audit completed with a cleanliness score of ${actualCleanPercentage}%.`
                });
              }}
              disabled={!isAuditComplete}
              className="flex-1 md:flex-initial"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>

            <Button
              variant="primary"
              onClick={handleExportFullAudit}
              disabled={!isAuditComplete}
              className="flex-1 md:flex-initial"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Visual Metrics & Progress Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">Clean Baseline</span>
            <div className="text-3xl font-bold text-emerald-900">{actualCleanPercentage}%</div>
            <p className="text-xs text-emerald-700">{cleanRecordsCount.toLocaleString()} verified clean citizen records</p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Total Records Evaluated</span>
            <div className="text-3xl font-bold text-slate-900">{totalRecordsScanned.toLocaleString()}</div>
            <p className="text-xs text-slate-600">Air-gapped in local browser memory</p>
          </div>

          <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">Anomalies Needing Review</span>
            <div className="text-3xl font-bold text-amber-900">{totalAnomalies}</div>
            <p className="text-xs text-amber-700">Flagged across {playbookResults.length} playbooks</p>
          </div>
        </div>

        {/* Visual Playbook Risk Bars (Sorted Descending by Severity) */}
        <div className="space-y-3 pt-4 border-t border-border-soft">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-text-body uppercase tracking-wider">
              Playbook Risk Distribution (Ranked by Anomaly Count)
            </h3>
            <span className="text-[11px] text-text-body italic">Highest severity first</span>
          </div>

          <div className="space-y-3">
            {sortedPlaybooks.map((pb) => {
              const barWidth = pb.flaggedCount > 0 ? (pb.flaggedCount / maxFlagged) * 100 : 0;
              return (
                <div key={pb.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-text-header">
                    <span className="font-bold">{pb.name}</span>
                    <span className={pb.flaggedCount > 0 ? 'text-amber-800 font-extrabold' : 'text-emerald-700 font-bold'}>
                      {pb.flaggedCount > 0 ? `${pb.flaggedCount} Anomalies` : '100% Clean'}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${pb.flaggedCount > 20 ? 'bg-rose-600' : pb.flaggedCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${pb.flaggedCount > 0 ? Math.max(4, barWidth) : 100}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Printable Executive Report Template */}
      <ExecutiveReportPDFTemplate
        jurisdictionName={jurisdictionName}
        stateCode={stateCode}
        totalRecordsScanned={totalRecordsScanned}
        cleanlinessPercentage={actualCleanPercentage}
        executionTimestamp={executionTimestamp}
        auditorName={auditorName}
        playbookResults={sortedPlaybooks}
      />
    </div>
  );
}
