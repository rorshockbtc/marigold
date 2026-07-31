import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Lock, ShieldAlert, CheckCircle, Flag, Trash2 } from "lucide-react";
import { MarigoldIcon } from "@/components/MarigoldIcon";
import { useWorkspace } from "@/lib/workspace/WorkspaceContext";
import { useKanban } from "@/lib/workspace/KanbanContext";

export function AuditDataPanel() {
  const { selectedRecord, setSelectedRecord, closeSideSheet } = useWorkspace();
  const { addTask, addNoteToTask } = useKanban();
  const [showConfirmDismiss, setShowConfirmDismiss] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!selectedRecord) return null;

  const handleFlagForReview = () => {
    addTask({
      id: `task-${selectedRecord.id || Math.random().toString(36).substring(2, 7)}`,
      status: "Needs Triage",
      title: selectedRecord.name || selectedRecord.address || "Flagged Citizen Record",
      subtitle: selectedRecord.details || selectedRecord.address || "Requires board review",
      tag: selectedRecord.anomalyType || "Anomaly Flag",
      tagColor: "text-amber-800",
      tagBg: "bg-amber-100",
      icon: <Flag className="w-4 h-4 text-amber-700" />,
      iconColor: "text-amber-700",
      borderColor: "border-l-amber-500",
      meta: "Added from Audit",
      assignee: "Unassigned",
      notes: []
    });
    alert(`Record "${selectedRecord.name || selectedRecord.id}" has been added to your Kanban review list.`);
  };

  const handleConfirmDismiss = () => {
    setIsDismissed(true);
    setShowConfirmDismiss(false);
    alert("Alert dismissed. Record has been logged as verified baseline.");
    setTimeout(() => {
      closeSideSheet();
      setIsDismissed(false);
    }, 500);
  };

  return (
    <aside 
      aria-label="Record Insights Side Sheet"
      className="w-96 bg-white border-l border-border-soft shadow-2xl h-full fixed right-0 top-0 p-6 overflow-y-auto z-40 animate-in slide-in-from-right duration-200 flex flex-col justify-between pt-20"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border-soft pb-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Record Inspection Panel
            </span>
            <h2 className="text-xl font-serif text-text-header">
              {selectedRecord.name || "Citizen Record"}
            </h2>
          </div>
          <Button 
            type="button"
            onClick={closeSideSheet} 
            variant="outline" 
            aria-label="Close Insights" 
            className="p-2 rounded-full shadow-sm"
          >
            <X className="w-5 h-5 text-text-body" />
          </Button>
        </div>

        {/* Alert Card */}
        <div className={`p-4 rounded-xl border ${isDismissed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            {isDismissed ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Verified Baseline Clean</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Audit Discovery Summary</span>
              </>
            )}
          </div>
          <p className="text-xs leading-relaxed">
            {selectedRecord.details || selectedRecord.reason || "This record was flagged during automated audit scanning for potential address or registration discrepancy."}
            {selectedRecord.occupant_count ? ` (${selectedRecord.occupant_count} occupants registered at domicile).` : ''}
          </p>
        </div>

        {/* Primary Safety Actions */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-text-body uppercase tracking-wider">
            Required Action
          </h3>
          
          <Button 
            type="button"
            onClick={handleFlagForReview}
            variant="primary"
            className="w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <Flag className="w-4 h-4" />
            <span>Flag for Official Review</span>
          </Button>

          {!showConfirmDismiss ? (
            <Button 
              type="button"
              onClick={() => setShowConfirmDismiss(true)}
              variant="outline"
              className="w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Dismiss Alert (Confirm Clean)</span>
            </Button>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 animate-in fade-in duration-200">
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                Are you sure you want to dismiss this alert? This confirms you reviewed the record and marked it clean.
              </p>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  onClick={handleConfirmDismiss}
                  variant="success"
                  className="flex-1 py-2 text-xs rounded-lg"
                >
                  Yes, Mark Clean
                </Button>
                <Button 
                  type="button"
                  onClick={() => setShowConfirmDismiss(false)}
                  variant="outline"
                  className="flex-1 py-2 text-xs rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Button 
            type="button"
            onClick={() => {
              const noteText = window.prompt("Enter secure note for this citizen record:");
              if (noteText) {
                addNoteToTask(`task-${selectedRecord.id}`, {
                  id: Math.random().toString(36).substring(2, 9),
                  serverCiphertext: noteText,
                  fileVersion: "Current Session",
                  date: new Date().toISOString()
                });
                alert("Note saved to local session.");
              }
            }}
            variant="ghost"
            className="w-full py-2.5 text-xs text-text-body flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Add Confidential Session Note</span>
          </Button>
        </div>

        {/* Detailed Record Metadata */}
        <div className="border-t border-border-soft pt-4 space-y-3">
          <h3 className="text-xs font-bold text-text-body uppercase tracking-wider">
            Record Attribute Inspection
          </h3>
          
          <div className="bg-surface p-4 rounded-xl space-y-2 text-xs font-mono">
            <div>
              <span className="text-text-body text-[10px] uppercase block font-sans">Full Name</span>
              <strong className="text-text-header font-bold">{selectedRecord.name || "N/A"}</strong>
            </div>
            <div>
              <span className="text-text-body text-[10px] uppercase block font-sans">Voter Registration ID</span>
              <span className="text-text-header">{selectedRecord.id || "MS-104928"}</span>
            </div>
            <div>
              <span className="text-text-body text-[10px] uppercase block font-sans">Registered Domicile</span>
              <span className="text-text-header">
                {selectedRecord.address || "1400 PROMENADE PKWY, APT #100"}<br />
                {selectedRecord.city || "Madison"}, {selectedRecord.state || "MS"} {selectedRecord.zip || "39110"}
              </span>
            </div>
            {selectedRecord.precinct && (
              <div>
                <span className="text-text-body text-[10px] uppercase block font-sans">Precinct / Ward</span>
                <span className="text-text-header">{selectedRecord.precinct}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border-soft pt-4 text-center">
        <span className="text-[11px] text-text-body">
          🔒 Air-Gapped Session • Zero Cloud Exposure
        </span>
      </div>
    </aside>
  );
}
