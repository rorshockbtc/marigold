import React from "react";
import { Button } from "@/components/ui/Button";
import { Download, CheckCircle } from "lucide-react";

interface AuditDrilldownProps {
  selectedDrilldown: any;
  setSelectedDrilldown: (drilldown: any) => void;
  anomalyRecords: Record<string, any[]>;
  setSelectedRecord: (record: any) => void;
  isAuditComplete: boolean;
}

export function AuditDrilldown({
  selectedDrilldown,
  setSelectedDrilldown,
  anomalyRecords,
  setSelectedRecord,
  isAuditComplete
}: AuditDrilldownProps) {
  if (!selectedDrilldown) return null;
  const records = anomalyRecords[selectedDrilldown.id] || [];

  return (
    <div className="mt-8 bg-white border border-border-soft rounded-[24px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-surface border-b border-border-soft px-8 py-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif text-text-header mb-1">{selectedDrilldown.name}</h3>
          <p className="text-sm text-text-body">{selectedDrilldown.description}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedDrilldown(null)}>Close</Button>
      </div>
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-text-body uppercase tracking-wider">Identified Anomalies</h4>
          <Button onClick={() => {
            const headers = ["Voter ID", "Name", "Address", "City", "State", "Zip", "County", "Risk Level", "Anomaly Details"];
            const rows = records.map(r => [
              r.id, r.name, r.address, r.city, r.state, r.zip, r.county, r.risk_level, r.details
            ]);
            const csvContent = [
              headers.join(","),
              ...rows.map(e => e.map(f => `"${String(f || '').replace(/"/g, '""')}"`).join(","))
            ].join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `marigold_sweep_${selectedDrilldown.id}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
        <div className="border border-border-soft rounded-[12px] overflow-hidden">
          {records.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-surface border-b border-border-soft">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Citizen / Entity</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Registered Domicile</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft bg-white">
                {records.slice(0, 50).map((r, i) => (
                  <tr key={i} className="hover:bg-surface transition-colors cursor-pointer" onClick={() => setSelectedRecord(r)}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-text-header">{r.name}</div>
                      <div className="text-xs text-text-body font-mono mt-0.5">{r.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-header">{r.address}</div>
                      <div className="text-xs text-text-body mt-0.5">{r.city}, {r.state} {r.zip}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${r.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" className="text-xs">View Insight</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-text-body">No anomalies found.</div>
          )}
        </div>
        {records.length > 50 && (
          <p className="text-xs text-text-body text-center mt-4 italic">Showing first 50 results. Export CSV to view all {records.length} anomalies.</p>
        )}
      </div>
    </div>
  );
}
