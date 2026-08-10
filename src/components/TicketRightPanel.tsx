"use client";

import React, { useState, useEffect } from 'react';
import { X, BarChart3, Lock, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useKanban } from '@/lib/workspace/KanbanContext';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Note } from '@/components/KanbanBoard';

export function TicketRightPanel() {
  const router = useRouter();
  const { cards, selectedTicketId, setSelectedTicketId, addNoteToTask } = useKanban();
  const { isDataLoaded, activeGroup } = useWorkspace();
  
  const [newNote, setNewNote] = useState("");
  const [sendToGroup, setSendToGroup] = useState(false);

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
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 px-6">
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
