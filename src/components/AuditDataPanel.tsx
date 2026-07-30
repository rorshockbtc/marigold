import React from "react";
import { Button } from "@/components/ui/Button";
import { X, Lock, AlertCircle } from "lucide-react";
import { MarigoldIcon } from "@/components/MarigoldIcon";

interface AuditDataPanelProps {
  selectedRecord: any;
  setSelectedRecord: (record: any) => void;
  addTask: (task: any) => void;
  addNoteToTask: (taskId: string, note: any) => void;
  selectedDrilldown: any;
}

export function AuditDataPanel({
  selectedRecord,
  setSelectedRecord,
  addTask,
  addNoteToTask,
  selectedDrilldown
}: AuditDataPanelProps) {
  if (!selectedRecord) return null;
  
  return (
    <div className="w-96 bg-white border-l border-border-soft shadow-xl h-full fixed right-0 top-0 p-8 overflow-y-auto z-50 animate-in slide-in-from-right-8 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-text-header">Record Insights</h2>
        <Button onClick={() => setSelectedRecord(null)} variant="outline" aria-label="Close Insights" className="p-2 rounded-full">
          <X className="w-5 h-5 text-text-body" />
        </Button>
      </div>
      
      <div className="bg-red-50 border border-red-100 rounded-[12px] p-4 mb-6">
        <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
          <MarigoldIcon className="w-4 h-4" />
          AI Conclusion
        </div>
        <p className="text-sm text-red-900 leading-relaxed">
          {selectedRecord.details} 
          {selectedRecord.occupant_count > 1 ? ` (${selectedRecord.occupant_count} total occupants detected).` : ''}
        </p>
      </div>
      
      <div className="space-y-3 mb-8 pt-4 border-t border-border-soft">
        <Button 
          onClick={() => {
            addTask({
              id: `task-${selectedRecord.id}`,
              status: "Needs Triage",
              title: selectedRecord.name || selectedRecord.id,
              subtitle: selectedRecord.details || "Requires further review",
              tag: selectedDrilldown?.name || "Anomaly",
              tagColor: "text-blue-700",
              tagBg: "bg-blue-50",
              icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
              iconColor: "text-blue-600",
              borderColor: "border-l-blue-500",
              meta: "Just now",
              assignee: "Unassigned",
              notes: []
            });
            window.alert(`Added task for ${selectedRecord.id}`);
          }}
          variant="outline"
          className="w-full py-3"
        >
          Create Task
        </Button>
        <Button 
          onClick={() => {
            const noteText = window.prompt("Enter secure note for this record:");
            if (noteText) {
              addNoteToTask(`task-${selectedRecord.id}`, {
                id: Math.random().toString(36).substring(2, 9),
                serverCiphertext: noteText,
                fileVersion: "Current Session",
                date: new Date().toISOString()
              });
              window.alert("Note saved securely.");
            }
          }}
          variant="outline"
          className="w-full py-3 flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4 mr-2 inline" /> Enter Secure Note
        </Button>
      </div>
      
      <div>
        <h3 className="text-xs font-bold text-text-body uppercase tracking-wider mb-4 border-b border-border-soft pb-2">
          Raw Record Details
        </h3>
        <div className="space-y-4">
          <div>
            <span className="block text-xs text-text-body mb-1">Full Name</span>
            <span className="block text-sm font-mono text-text-header">{selectedRecord.name}</span>
          </div>
          <div>
            <span className="block text-xs text-text-body mb-1">Voter ID</span>
            <span className="block text-sm font-mono text-text-header">{selectedRecord.id}</span>
          </div>
          <div>
            <span className="block text-xs text-text-body mb-1">Registered Address</span>
            <span className="block text-sm font-mono text-text-header">
              {selectedRecord.address}<br />
              {selectedRecord.city}, {selectedRecord.state} {selectedRecord.zip}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
