import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Download, CheckCircle, ChevronLeft, ChevronRight, Layers, Users } from "lucide-react";
import { useKanban } from "@/lib/workspace/KanbanContext";

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
  const { addTask } = useKanban();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const records = selectedDrilldown ? (anomalyRecords[selectedDrilldown.id] || []) : [];

  const totalPages = Math.ceil(records.length / rowsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return records.slice(startIndex, startIndex + rowsPerPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, currentPage, rowsPerPage]);

  if (!selectedDrilldown) return null;

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRecords.map(r => r.id)));
    }
  };

  const handleGroupToTask = () => {
    if (selectedIds.size === 0) return;
    
    // Grab the first selected record to use as title
    const sampleRecord = records.find(r => selectedIds.has(r.id));
    if (!sampleRecord) return;

    addTask({
      id: `task-cluster-${Math.random().toString(36).substring(2, 7)}`,
      status: "Needs Triage",
      title: `${selectedIds.size} Clustered Anomalies`,
      subtitle: `Multiple records matching ${selectedDrilldown.name} criteria. Includes ${sampleRecord.name || sampleRecord.id} and others.`,
      tag: "Bulk Triage",
      tagColor: "text-blue-800",
      tagBg: "bg-blue-100",
      icon: <Layers className="w-4 h-4 text-blue-700" />,
      iconColor: "text-blue-700",
      borderColor: "border-l-blue-500",
      meta: "Added from Audit Bulk Select",
      assignee: "Unassigned",
      notes: [],
      attachedRecordIds: Array.from(selectedIds)
    });
    alert(`${selectedIds.size} records clustered into a new Kanban task.`);
    setSelectedIds(new Set());
  };

  return (
    <div className="mt-8 bg-white border border-border-soft rounded-[24px] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 pb-24 relative">
      <div className="bg-surface border-b border-border-soft px-8 py-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-serif text-text-header mb-1">{selectedDrilldown.name}</h3>
          <p className="text-sm text-text-body">{selectedDrilldown.description}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedDrilldown(null)}>Close</Button>
      </div>
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-text-body uppercase tracking-wider">
            Identified Anomalies ({records.length})
          </h4>
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
            <>
              <table className="w-full text-left">
                <thead className="bg-surface border-b border-border-soft">
                  <tr>
                    <th className="px-6 py-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-border-soft text-primary focus:ring-primary w-4 h-4"
                        checked={selectedIds.size > 0 && selectedIds.size === paginatedRecords.length}
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Citizen / Entity</th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Registered Domicile</th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-xs font-bold text-text-body uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft bg-white">
                  {paginatedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-surface transition-colors cursor-pointer" onClick={() => setSelectedRecord(r)}>
                      <td className="px-6 py-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="rounded border-border-soft text-primary focus:ring-primary w-4 h-4"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelection(r.id)}
                        />
                      </td>
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

              {/* Pagination Controls */}
              <div className="bg-surface border-t border-border-soft px-6 py-3 flex items-center justify-between">
                <div className="text-xs text-text-body">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, records.length)} of {records.length} anomalies
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-body">Rows per page:</span>
                  <select 
                    className="text-xs border border-border-soft rounded p-1"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                      setSelectedIds(new Set());
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        setSelectedIds(new Set());
                      }} 
                      disabled={currentPage === 1}
                      className="px-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-text-body mx-2">Page {currentPage} of {totalPages}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        setSelectedIds(new Set());
                      }} 
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-text-body">No anomalies found.</div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 z-20">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold">{selectedIds.size} records selected</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <Button 
            className="bg-primary text-white hover:bg-primary/90 rounded-full text-sm font-bold px-4"
            onClick={handleGroupToTask}
          >
            <Layers className="w-4 h-4 mr-2" /> Group to Task
          </Button>
        </div>
      )}
    </div>
  );
}
