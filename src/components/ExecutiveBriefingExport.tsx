"use client";

import React, { useState } from "react";
import { Download, Printer, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

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
}

export function ExecutiveBriefingExport({
  jurisdictionName,
  stateCode,
  totalRecordsScanned,
  cleanlinessPercentage,
  executionTimestamp,
  playbookResults,
  auditorName,
}: ExecutiveBriefingProps) {
  const [isGeneratingJson, setIsGeneratingJson] = useState(false);
  const [jsonDownloaded, setJsonDownloaded] = useState(false);

  // Generate SHA-256 cryptographic verification hash of the summary statistics (0 bytes PII)
  const generateZeroPiiCartridge = async () => {
    setIsGeneratingJson(true);
    try {
      const summaryPayload = {
        meta: {
          platform: "Marigold Insights - Institutional Engine",
          version: "2.0-airgap",
          timestamp: executionTimestamp,
          jurisdiction: jurisdictionName,
          stateCode: stateCode,
          auditor: auditorName || "Verified Mission Auditor",
          piiExfiltratedBytes: 0,
          clientSideExecution: true,
        },
        metrics: {
          totalRecordsScanned,
          cleanlinessPercentage,
          reviewRequiredPercentage: Number((100 - cleanlinessPercentage).toFixed(2)),
          totalPlaybooksExecuted: playbookResults.length,
        },
        scorecard: playbookResults.map((p) => ({
          playbookId: p.id,
          name: p.name,
          auditType: p.audit_type,
          recordsScanned: p.totalScanned,
          flaggedAnomalies: p.flaggedCount,
          status: p.status,
        })),
      };

      // Create SHA-256 signature string of this exact payload
      const payloadString = JSON.stringify(summaryPayload, null, 2);
      const msgBuffer = new TextEncoder().encode(payloadString);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const finalCartridge = {
        ...summaryPayload,
        cryptographicSignature: {
          algorithm: "SHA-256",
          signatureHash: hashHex,
          verificationPolicy: "Zero-Cloud PII Air-Gap Standard",
          note: "This cartridge contains zero individual citizen rows or PII. Suitable for third-party institutional or grant evaluation.",
        },
      };

      const blob = new Blob([JSON.stringify(finalCartridge, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeJurisdiction = jurisdictionName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      a.download = `${safeJurisdiction}_360_audit_brief_${new Date().toISOString().slice(0, 10)}.marigold-audit.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setJsonDownloaded(true);
      setTimeout(() => setJsonDownloaded(false), 4000);
    } catch (err) {
      console.error("Failed to generate zero-PII cartridge:", err);
    } finally {
      setIsGeneratingJson(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Interactive Control Toolbar (Hidden during Print) */}
      <div className="print:hidden bg-muted border border-border p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D96B27]" />
            <span>Institutional Export &amp; Sharing Engine</span>
          </h3>
          <p className="text-xs text-[#646A7A] mt-0.5 max-w-xl leading-relaxed">
            Export a formal printed memo for your Board of Elections or share a cryptographic Zero-<GlossaryTooltip term="PII" /> JSON summary with journalists and grant evaluators without risking citizen privacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex-1 sm:flex-initial bg-[#2D3142] hover:bg-[#1E212D] text-white font-bold px-5 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 border border-slate-700"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print / Save Executive PDF Brief</span>
          </button>

          <button
            type="button"
            onClick={generateZeroPiiCartridge}
            disabled={isGeneratingJson}
            className="flex-1 sm:flex-initial bg-accent hover:bg-[#C85A1B] text-white font-black px-5 py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {isGeneratingJson ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
            ) : jsonDownloaded ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{jsonDownloaded ? "✓ Cartridge Exported!" : "Export Zero-PII JSON Summary"}</span>
          </button>
        </div>
      </div>

      {/* Print-Only / Printable Agency Memo Header (Only visible when printing or inside printable container) */}
      <div className="hidden print:block bg-white text-black p-8 border-b-2 border-black mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-600">Official Government Agency Audit Briefing</div>
            <h1 className="text-2xl font-black mt-1">JURISDICTION HEALTH AUDIT REPORT</h1>
            <div className="text-sm font-semibold text-gray-700 mt-1">
              Jurisdiction: <strong>{jurisdictionName}, {stateCode}</strong> • Audited by: <strong>{auditorName || "Auditing Officer"}</strong>
            </div>
          </div>
          <div className="text-right text-xs text-gray-600 font-mono">
            <div>Timestamp: {executionTimestamp}</div>
            <div>Verification: SHA-256 Air-Gap Interlock</div>
            <div>PII Exfiltrated: 0 bytes (Local Memory)</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border border-black p-4 mb-6">
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">Total Records Scanned</div>
            <div className="text-xl font-black">{totalRecordsScanned.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">Cleanliness Score</div>
            <div className="text-xl font-black">{cleanlinessPercentage}% Verified Clean</div>
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-gray-600">Review Required</div>
            <div className="text-xl font-black">{(100 - cleanlinessPercentage).toFixed(2)}% Flagged</div>
          </div>
        </div>

        <h2 className="text-base font-bold uppercase border-b border-gray-400 pb-1 mb-3">Forensic Playbook Audit Scorecard</h2>
        <table className="w-full text-left border-collapse border border-gray-300 text-xs mb-8">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2 border border-gray-300">Playbook Rule</th>
              <th className="p-2 border border-gray-300">Scanned</th>
              <th className="p-2 border border-gray-300">Flagged Anomalies</th>
              <th className="p-2 border border-gray-300">Health Status</th>
            </tr>
          </thead>
          <tbody>
            {playbookResults.map((p) => (
              <tr key={p.id} className="border-b border-gray-300">
                <td className="p-2 border border-gray-300 font-bold">{p.name}</td>
                <td className="p-2 border border-gray-300 font-mono">{p.totalScanned.toLocaleString()}</td>
                <td className="p-2 border border-gray-300 font-mono font-bold">{p.flaggedCount.toLocaleString()}</td>
                <td className="p-2 border border-gray-300 font-semibold">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-400 pt-6 mt-12 flex justify-between items-end text-xs">
          <div className="w-64 border-t border-black pt-1 text-center">
            <strong>{auditorName || "Auditing Officer"}</strong>
            <div className="text-[10px] text-gray-600">Authorized SAA / County Signature</div>
          </div>
          <div className="w-48 border-t border-black pt-1 text-center">
            <strong>Date</strong>
          </div>
          <div className="text-right font-mono text-[9px] text-gray-500 max-w-xs">
            Digital Cartridge Verification:<br />
            marigold-zero-cloud-airgap-v2.0
          </div>
        </div>
      </div>
    </div>
  );
}
