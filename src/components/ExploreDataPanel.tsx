import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Lock, AlertCircle, BarChart3 } from "lucide-react";
import { MarigoldIcon } from "@/components/MarigoldIcon";

interface ExploreDataPanelProps {
  selectedRecord: any;
  setSelectedRecord: (record: any) => void;
  isGroupSynced: boolean;
  handlePublishDataStory: () => void;
  addTask: (task: any) => void;
  addNoteToTask: (taskId: string, note: any) => void;
  activePlaybook: string | null;
  playbooks: any[];
  verboseMode: boolean;
}

export function ExploreDataPanel({
  selectedRecord,
  setSelectedRecord,
  isGroupSynced,
  handlePublishDataStory,
  addTask,
  addNoteToTask,
  activePlaybook,
  playbooks,
  verboseMode
}: ExploreDataPanelProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState("Needs Triage");
  const [taskAssignee, setTaskAssignee] = useState("Unassigned");
  const [taskComment, setTaskComment] = useState("");

  if (!selectedRecord) return null;

  const handleCreateTask = () => {
    const authorName = localStorage.getItem("marigold_user_identity") || "Investigator";
    const initialNotes = taskComment.trim() ? [{
      id: Math.random().toString(36).substring(2, 9),
      serverCiphertext: `[ENCRYPTED_PAYLOAD] ${taskComment}`,
      fileVersion: "Current Session",
      date: new Date().toISOString(),
      author: authorName,
      isPrivate: false
    }] : [];

    addTask({
      id: `task-${selectedRecord.id}`,
      status: taskStatus,
      title: selectedRecord.name || selectedRecord.id,
      subtitle: selectedRecord.details || "Requires further review",
      tag: activePlaybook ? playbooks.find(p => p.id === activePlaybook)?.name || "Anomaly" : "Anomaly",
      tagColor: "text-blue-700",
      tagBg: "bg-blue-50",
      icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
      iconColor: "text-blue-600",
      borderColor: "border-l-blue-500",
      meta: "Just now",
      assignee: taskAssignee,
      notes: initialNotes
    });
    setSelectedRecord({ ...selectedRecord, taskCreated: true });
    setIsTaskModalOpen(false);
    setTaskComment("");
  };

  return (
    <div className="w-96 bg-white border-l border-border-soft shadow-xl h-full p-8 overflow-y-auto flex-shrink-0 animate-in slide-in-from-right-8">
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
        {!isGroupSynced ? (
          <>
            <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded-md border border-blue-200 text-center mb-3">
              <AlertCircle className="w-4 h-4 inline mr-2 -mt-0.5" />
              You are in Personal Mode. Notes are disabled to ensure they are not accidentally shared with the group.
            </div>
            <Button 
              onClick={handlePublishDataStory}
              className="w-full py-3 bg-blue-600 text-white rounded-[12px] font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" /> Share Anonymous Insight
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => setIsTaskModalOpen(true)}
              variant="outline"
              className="w-full py-3"
              disabled={selectedRecord.taskCreated}
            >
              {selectedRecord.taskCreated ? 'Task Created' : 'Create Task'}
            </Button>
            <Button 
              onClick={() => {
                const newNote = {
                  id: Math.random().toString(36).substring(2, 9),
                  serverCiphertext: "Verified baseline record note",
                  fileVersion: "Current Session",
                  date: new Date().toISOString(),
                  text: "Verified baseline record note"
                };
                addNoteToTask(`task-${selectedRecord.id}`, newNote);
                setSelectedRecord({ 
                  ...selectedRecord, 
                  notes: [newNote, ...(selectedRecord.notes || [])] 
                });
              }}
              variant="outline"
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Enter Secure Note
            </Button>
          </>
        )}
      </div>
      
      {verboseMode && (
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
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-serif text-lg font-bold">Create Task</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Status</label>
                <select 
                  value={taskStatus} 
                  onChange={e => setTaskStatus(e.target.value)}
                  className="w-full text-sm p-2 border border-border-soft rounded-lg bg-surface"
                >
                  <option>Needs Triage</option>
                  <option>In Review</option>
                  <option>Ready to Submit</option>
                  <option>Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Assignee</label>
                <select 
                  value={taskAssignee} 
                  onChange={e => setTaskAssignee(e.target.value)}
                  className="w-full text-sm p-2 border border-border-soft rounded-lg bg-surface"
                >
                  <option>Unassigned</option>
                  <option>Kyle</option>
                  {/* Additional members would be pulled dynamically */}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Initial Comment</label>
                <textarea 
                  value={taskComment}
                  onChange={e => setTaskComment(e.target.value)}
                  placeholder="Why are you creating this task?"
                  className="w-full text-sm p-2 border border-border-soft rounded-lg bg-surface h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateTask}>Create Task</Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 border-t border-border-soft pt-6">
        <h3 className="text-xs font-bold text-text-body uppercase tracking-wider mb-4 border-b border-border-soft pb-2">
          Action Log
        </h3>
        {selectedRecord.notes && selectedRecord.notes.length > 0 ? (
          <div className="space-y-3">
            {selectedRecord.notes.map((note: any, idx: number) => (
              <div key={idx} className="bg-surface border border-border-soft rounded-lg p-3 text-xs text-text-header">
                {note.text}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-body italic">No secure notes logged for this record yet.</p>
        )}
      </div>
    </div>
  );
}
