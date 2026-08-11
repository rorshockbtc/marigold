"use client";

import React, { useState, useEffect } from 'react';
import { X, BarChart3, Lock, Eye, Link as LinkIcon, Info, CheckSquare, Square, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useKanban } from '@/lib/workspace/KanbanContext';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Note } from '@/components/KanbanBoard';

export function TicketRightPanel() {
  const router = useRouter();
  const { cards, selectedTicketId, setSelectedTicketId, addNoteToTask, updateCardDetails } = useKanban();
  const { isDataLoaded, activeGroup } = useWorkspace();
  
  const [newNote, setNewNote] = useState("");
  const [sendToGroup, setSendToGroup] = useState(false);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("");
  const [isEditingEvidence, setIsEditingEvidence] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [showChecklistInput, setShowChecklistInput] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pref = localStorage.getItem('marigold_note_sync_preference');
      if (pref === 'true') setSendToGroup(true);
    }
  }, []);

  const handleToggleSync = (checked: boolean) => {
    setSendToGroup(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('marigold_note_sync_preference', String(checked));
    }
  };

  const selectedCard = cards.find(c => c.id === selectedTicketId) || null;
  const isGroupSynced = isDataLoaded;

  if (!selectedCard) return null;

  const handleSaveNote = () => {
    if (!newNote.trim() || !selectedCard || !isGroupSynced) return;
    
    const tokenizedNote = "[ENCRYPTED_PAYLOAD] " + newNote;
    
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      serverCiphertext: tokenizedNote,
      fileVersion: activeGroup,
      date: new Date().toISOString(),
      isPrivate: !sendToGroup // Set privacy flag based on checkbox
    };

    addNoteToTask(selectedCard.id, note);
    setNewNote("");
  };

  const handlePublishDataStory = () => {
    if (!selectedCard) return;
    
    const snapshotNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      serverCiphertext: "Published a Data Story Snapshot",
      fileVersion: "Snapshot",
      date: new Date().toISOString(),
      isDataStory: true,
      isPrivate: false,
      storyPayload: {
        title: "Cross-Reference: National NCOA Database",
        insight: "This record highly correlates with an out-of-state move registered in Wyoming.",
        confidenceScore: "87%"
      }
    };

    addNoteToTask(selectedCard.id, snapshotNote);
  };

  const handleSaveEvidenceUrl = () => {
    if (!selectedCard || !newEvidenceUrl.trim()) return;
    updateCardDetails(selectedCard.id, { evidenceUrl: newEvidenceUrl.trim() });
    setIsEditingEvidence(false);
  };

  const handleAddChecklist = () => {
    if (!selectedCard || !newChecklistItem.trim()) return;
    const item = { id: crypto.randomUUID(), text: newChecklistItem.trim(), completed: false };
    const currentChecklists = selectedCard.checklists || [];
    updateCardDetails(selectedCard.id, { checklists: [...currentChecklists, item] });
    setNewChecklistItem("");
    setShowChecklistInput(false);
  };

  const handleToggleChecklist = (id: string) => {
    if (!selectedCard) return;
    const currentChecklists = selectedCard.checklists || [];
    const updated = currentChecklists.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    updateCardDetails(selectedCard.id, { checklists: updated });
  };

  return (
    <div className="h-full w-[440px] bg-white shadow-2xl border-l border-border-soft flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-6 shrink-0 p-6 pb-0">
        <h2 className="text-xl font-serif text-text-header">Record Insights</h2>
        <IconButton 
          onClick={() => setSelectedTicketId(null)}
          icon={<X className="w-5 h-5 text-text-body" />}
          aria-label="Close record insights"
          variant="ghost"
          className="p-2 hover:bg-surface rounded-full"
        />
      </div>
      
      <div className="px-6 shrink-0">
        <div className="bg-surface rounded-xl p-4 border border-border-soft mb-6">
          <h4 className="font-serif text-text-header text-xl mb-1">{selectedCard.title}</h4>
          <p className="text-sm text-text-body mb-4">{selectedCard.subtitle}</p>

          {/* Visibility & Publishing */}
          <div className="mb-4">
            <h5 className="text-xs font-bold text-text-body uppercase tracking-wider mb-2">Visibility</h5>
            <div className="flex items-center gap-2">
              {selectedCard.promotedGroups?.includes(activeGroup) ? (
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <Eye className="w-3 h-3" /> Shared with {activeGroup}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <Lock className="w-3 h-3" /> Private
                  </div>
                  <Button 
                    onClick={() => {
                      const current = selectedCard.promotedGroups || [];
                      updateCardDetails(selectedCard.id, { promotedGroups: [...current, activeGroup] });
                    }}
                    variant="outline" 
                    size="sm" 
                    className="text-xs py-1 h-auto border-primary text-primary hover:bg-primary/5"
                  >
                    Promote to Group
                  </Button>
                </div>
              )}
            </div>
          </div>

          {selectedCard.attachedRecordIds && selectedCard.attachedRecordIds.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                let url = '/explore';
                const params = new URLSearchParams();
                if (selectedCard.playbookId) params.append('playbook', selectedCard.playbookId);
                if (selectedCard.countyFilter) params.append('county', selectedCard.countyFilter);
                if (params.toString()) url += `?${params.toString()}`;
                router.push(url);
              }}
              className="w-full flex items-center justify-center gap-2 text-primary font-bold border-primary/20 bg-primary/5 hover:bg-primary/10"
            >
              <Eye className="w-4 h-4" />
              View {selectedCard.attachedRecordIds.length} Underlying Records
            </Button>
          )}

          {/* External Evidence Section */}
          <div className="mt-4 pt-4 border-t border-border-soft">
            <div className="flex items-center gap-2 mb-2 group">
              <h5 className="text-xs font-bold text-text-body uppercase tracking-wider">External Evidence</h5>
              <div className="relative flex items-center">
                <Info className="w-3.5 h-3.5 text-text-body/60 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                  To keep Marigold fast and low cost, we securely sync external URLs (like Google Drive or Dropbox) rather than large files. Need direct photo hosting? Contact us about Marigold Premium!
                </div>
              </div>
            </div>
            
            {!selectedCard.evidenceUrl && !isEditingEvidence ? (
              <Button onClick={() => setIsEditingEvidence(true)} variant="outline" size="sm" className="w-full text-xs text-text-body border-dashed border-border-soft hover:bg-surface-hover">
                <Plus className="w-3 h-3 mr-1" /> Add Evidence URL
              </Button>
            ) : isEditingEvidence ? (
              <div className="flex items-center gap-2">
                <input 
                  type="url" 
                  value={newEvidenceUrl}
                  onChange={e => setNewEvidenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/..." 
                  className="flex-1 text-xs px-2 py-1.5 border border-border-soft rounded bg-white"
                  autoFocus
                />
                <Button onClick={handleSaveEvidenceUrl} variant="primary" size="sm" className="text-xs px-2">Save</Button>
                <Button onClick={() => setIsEditingEvidence(false)} variant="ghost" size="sm" className="text-xs px-2">Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                <a href={selectedCard.evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 break-all flex-1 min-w-0">
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{selectedCard.evidenceUrl}</span>
                </a>
                <button onClick={() => { setNewEvidenceUrl(selectedCard.evidenceUrl || ""); setIsEditingEvidence(true); }} className="text-xs text-blue-600 font-bold px-2 py-1 hover:bg-blue-100 rounded">Edit</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 px-6">
        {/* Actionable Checklists */}
        <div className="mb-6 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-text-body uppercase tracking-wider">Action Items</h3>
            {!showChecklistInput && (
              <button onClick={() => setShowChecklistInput(true)} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Step
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {selectedCard.checklists?.map(item => (
              <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer group border border-transparent hover:border-slate-200 transition-colors">
                <button type="button" onClick={() => handleToggleChecklist(item.id)} className="mt-0.5 shrink-0 text-slate-400 group-hover:text-primary transition-colors">
                  {item.completed ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                </button>
                <span className={`text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.text}
                </span>
              </label>
            ))}
            
            {showChecklistInput && (
              <div className="flex gap-2 p-2">
                <input 
                  type="text" 
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  placeholder="E.g., Verify address on Google Maps" 
                  className="flex-1 text-sm px-3 py-1.5 border border-border-soft rounded bg-white"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleAddChecklist() }}
                />
                <Button onClick={handleAddChecklist} variant="primary" size="sm" className="px-3">Add</Button>
                <Button onClick={() => setShowChecklistInput(false)} variant="ghost" size="sm" className="px-2">Cancel</Button>
              </div>
            )}
            
            {(!selectedCard.checklists || selectedCard.checklists.length === 0) && !showChecklistInput && (
              <p className="text-xs text-slate-400 italic">No action items defined.</p>
            )}
          </div>
        </div>

        <h3 className="text-xs font-bold text-text-body uppercase tracking-wider mb-4 border-b border-border-soft pb-2 shrink-0">Activity & Comments Feed</h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {selectedCard.notes.length === 0 ? (
            <p className="text-sm text-text-body italic">No notes added yet.</p>
          ) : (
            selectedCard.notes.map(note => {
              if (note.isDataStory) {
                return (
                  <div key={note.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200 shadow-sm relative">
                    <div className="flex items-center gap-1 mb-2 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      <BarChart3 className="w-3 h-3" /> Data Story Snapshot
                    </div>
                    <h4 className="font-bold text-sm text-blue-900">{note.storyPayload?.title}</h4>
                    <p className="text-xs text-blue-800 mt-1">{note.storyPayload?.insight}</p>
                    <div className="mt-2 text-[10px] text-blue-600 font-mono">
                      Confidence: {note.storyPayload?.confidenceScore}
                    </div>
                  </div>
                );
              }

              const displayText = note.serverCiphertext.replace("[ENCRYPTED_PAYLOAD] ", "");
              
              const isPrivate = note.isPrivate;

              return (
                <div key={note.id} className={`p-3 rounded-lg border relative group bg-surface border-border-soft`}>
                  <p className={`text-sm whitespace-pre-wrap text-text-header`}>
                    {displayText}
                  </p>
                  
                  <div className="absolute inset-0 bg-black/90 text-white p-2 rounded-lg text-xs hidden group-hover:block overflow-auto font-mono z-50">
                    [Server Payload]<br/>{note.serverCiphertext}
                  </div>

                  <div className="mt-2 flex justify-between items-center text-[10px]">
                    <span className="text-text-body">{new Date(note.date).toLocaleString()}</span>
                    {isPrivate ? (
                      <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Group Synced
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-border-soft shrink-0 pb-6">
          {!isGroupSynced ? (
            <>
              <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200 text-center">
                Note saving disabled. You are in Read-Only Mode until you mount the Group Manifest datasets.
              </div>
              <Button 
                onClick={handlePublishDataStory}
                className="w-full py-3 bg-blue-600 text-white rounded-[12px] font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" /> Publish Data Story Snapshot
              </Button>
              <p className="text-[10px] text-center text-text-body">
                You can still publish anonymized insight snapshots from your independent datasets.
              </p>
            </>
          ) : (
            <>
              <div className="bg-surface border border-border-soft rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Draft a note..."
                  className="w-full text-sm bg-transparent p-3 outline-none resize-none h-24"
                />
                <div className="bg-[#FAF8F5] border-t border-border-soft p-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-text-body cursor-pointer select-none px-1">
                    <input 
                      type="checkbox" 
                      checked={sendToGroup}
                      onChange={(e) => handleToggleSync(e.target.checked)}
                      className="rounded border-border-soft text-primary focus:ring-primary"
                    />
                    Send to group
                  </label>
                  <Button 
                    onClick={handleSaveNote}
                    disabled={!newNote.trim()}
                    className="py-1.5 px-4 bg-primary text-white rounded-lg font-bold shadow-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 text-xs"
                  >
                    {sendToGroup ? "Share & Save" : "Save Private Note"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
