"use client";
import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, Clock, FileText, CheckCircle2, X, Filter, Lock, Database, ArrowRightLeft, ShieldAlert, BarChart3 } from 'lucide-react';
import { useKanban } from '@/lib/workspace/KanbanContext';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

export interface Note {
  id: string;
  serverCiphertext: string;
  fileVersion: string;
  date: string;
  isDataStory?: boolean;
  storyPayload?: any; 
}

export interface CardData {
  id: string;
  status: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
  meta: string;
  assignee: string;
  notes: Note[];
}

const INITIAL_CARDS: CardData[] = [
  {
    id: "card-1",
    status: "Needs Triage",
    title: "100 Campus Dr",
    subtitle: "64 registered voters at this single domicile.",
    tag: "High Density",
    tagColor: "text-[#D36C95]",
    tagBg: "bg-[#F9E6E9]",
    icon: <AlertTriangle className="w-4 h-4 text-[#E05B37]" />,
    iconColor: "text-[#E05B37]",
    borderColor: "border-l-[#E05B37]",
    meta: "2h ago",
    assignee: "Unassigned",
    notes: []
  },
  {
    id: "card-2",
    status: "In Review",
    title: "Justin Murphy",
    subtitle: "Flagged for out of state relocation to CA.",
    tag: "NCOA Move",
    tagColor: "text-[#735496]",
    tagBg: "bg-[#E6E1F6]",
    icon: <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">K</div>,
    iconColor: "",
    borderColor: "border-l-[#D97706]",
    meta: "1 Note",
    assignee: "Kyle",
    notes: [{
      id: "note-demo",
      serverCiphertext: "[CTX_FExVXVlBSVw=] flagged due to NCOA.",
      fileVersion: "Mississippi_July_2026",
      date: new Date().toISOString()
    }]
  }
];

const COLUMNS = ["Needs Triage", "In Review", "Ready to Submit", "Resolved"];

export function KanbanBoard() {
  const { cards, setCards, addNoteToTask } = useKanban();
  const { isDataLoaded, activeGroup, jurisdiction } = useWorkspace();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Group synchronization logic using the real workspace context
  const isGroupSynced = isDataLoaded; // Or whatever custom logic defined
  const activeEncryptionHash = activeGroup;

  const [groupMembers, setGroupMembers] = useState<string[]>(["Unassigned", "Kyle"]);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setGroupMembers(["Unassigned", "Kyle", "Cubby", "Sarah", "Alex"]);
    }, 500);
  }, []);

  const selectedCard = cards.find(c => c.id === selectedCardId) || null;

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isGroupSynced) return; // Prevent drag-and-drop state changes if in Read-Only Mode
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCards(cards.map(card => {
        if (card.id === active.id) {
          return { ...card, status: over.id as string };
        }
        return card;
      }));
    }
  };

  const handleSaveNote = () => {
    if (!newNote.trim() || !selectedCard || !isGroupSynced) return;
    
    const tokenizedNote = "[ENCRYPTED_PAYLOAD] " + newNote; // TODO: Move encryption to Data Layer
    
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      serverCiphertext: tokenizedNote,
      fileVersion: activeEncryptionHash,
      date: new Date().toISOString()
    };

    addNoteToTask(selectedCard.id, note);
    setNewNote("");
  };

  // Mock pushing a "Data Story Snapshot" from an independent dataset
  const handlePublishDataStory = () => {
    if (!selectedCard) return;
    
    const snapshotNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      serverCiphertext: "Published a Data Story Snapshot",
      fileVersion: "Snapshot",
      date: new Date().toISOString(),
      isDataStory: true,
      storyPayload: {
        title: "Cross-Reference: National NCOA Database",
        insight: "This record highly correlates with an out-of-state move registered in Wyoming.",
        confidenceScore: "87%"
      }
    };

    addNoteToTask(selectedCard.id, snapshotNote);
  };

  const uniqueTags = ["All", ...Array.from(new Set(cards.map(c => c.tag)))];
  const uniqueAssignees = ["All", ...groupMembers];
  const filteredCards = cards.filter(c => {
    const matchAssignee = assigneeFilter === "All" || c.assignee === assigneeFilter;
    const matchTag = tagFilter === "All" || c.tag === tagFilter;
    return matchAssignee && matchTag;
  });

  return (
    <div className="flex-1 flex flex-col relative h-full">
      
      {/* Sandbox Degradation Banner */}
      {!isGroupSynced && (
        <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Read-Only Mode: Disconnected</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your local workspace is currently disconnected from any verified dataset. To prevent corrupting the group's encryption map, you have been temporarily degraded to Read-Only Mode. 
            </p>
          </div>
        </div>
      )}

      {/* Control Bar & Sandbox Indicator */}
      <div className="flex flex-col gap-4 mb-6 bg-surface p-4 rounded-xl border border-border-soft">
        
        <div className="flex justify-between items-center border-b border-border-soft pb-4">
          <div className="flex items-center gap-2">
            <Database className={`w-5 h-5 ${isGroupSynced ? "text-emerald-500" : "text-amber-500"}`} />
            <h2 className="font-serif text-lg font-bold">Sandbox: <span className={isGroupSynced ? "text-emerald-700" : "text-amber-700"}>{isGroupSynced ? "Group Synced" : "Desynced (Read-Only)"}</span></h2>
          </div>
          
          <div className="flex gap-4">
            <select 
              className="bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs text-text-body font-bold outline-none"
              defaultValue="active"
            >
              <option value="active">Mounted: {jurisdiction} (Active)</option>
              <option value="global">Mounted: Global Analytics (Out of Sync)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-text-body" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-header">Assignee:</span>
            <select 
              value={assigneeFilter} 
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-sm bg-white border border-border-soft rounded-md px-2 py-1 outline-none"
            >
              {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          
          <div className="ml-auto flex items-center gap-2 text-xs font-bold text-[#528B65] bg-[#E3EEDC] px-3 py-1.5 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Contextual E2EE Active</span>
          </div>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full pb-8">
          {COLUMNS.map(col => (
            <Column id={col} title={col} isReadOnly={!isGroupSynced} key={col}>
              {filteredCards.filter(c => c.status === col).map(card => (
                <DraggableCard key={card.id} card={card} onClick={() => setSelectedCardId(card.id)} isReadOnly={!isGroupSynced} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>

      {selectedCard && (
        <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-border-soft z-30 p-6 flex flex-col animate-in slide-in-from-right-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-xl font-serif text-text-header">Record Insights</h2>
            <button onClick={() => setSelectedCardId(null)} className="p-2 hover:bg-surface rounded-full">
              <X className="w-5 h-5 text-text-body" />
            </button>
          </div>
          
          <div className="bg-surface rounded-xl p-4 border border-border-soft mb-6 shrink-0">
            <h4 className="font-serif text-text-header text-xl mb-1">{selectedCard.title}</h4>
            <p className="text-sm text-text-body">{selectedCard.subtitle}</p>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-text-body uppercase tracking-wider mb-4 border-b border-border-soft pb-2 shrink-0">Group Notes & Stories</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {selectedCard.notes.length === 0 ? (
                <p className="text-sm text-text-body italic">No notes added yet.</p>
              ) : (
                selectedCard.notes.map(note => {
                  
                  // Render a Data Story Snapshot (Static, Anonymized, Safe for Group Sync)
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

                  const displayText = note.serverCiphertext.replace("[ENCRYPTED_PAYLOAD] ", ""); // TODO: Move decryption to Data Layer

                  return (
                    <div key={note.id} className={`p-3 rounded-lg border relative group bg-surface border-border-soft`}>
                      <p className={`text-sm whitespace-pre-wrap text-text-header`}>
                        {displayText}
                      </p>
                      
                      <div className="absolute inset-0 bg-black/90 text-white p-2 rounded-lg text-xs hidden group-hover:block overflow-auto font-mono z-50">
                        [Server Payload]<br/>{note.serverCiphertext}
                      </div>

                      <span className="text-[10px] text-text-body mt-2 block flex justify-between items-center">
                        <span>{new Date(note.date).toLocaleString()}</span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-auto space-y-3 pt-4 border-t border-border-soft shrink-0">
              {!isGroupSynced ? (
                <>
                  <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200 text-center">
                    Note saving disabled. You are in Read-Only Mode until you mount the Group Manifest datasets.
                  </div>
                  <button 
                    onClick={handlePublishDataStory}
                    className="w-full py-3 bg-blue-600 text-white rounded-[12px] font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" /> Publish Data Story Snapshot
                  </button>
                  <p className="text-[10px] text-center text-text-body">
                    You can still publish anonymized insight snapshots from your independent datasets.
                  </p>
                </>
              ) : (
                <>
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type a note (PII tokenized locally)..."
                    className="w-full text-sm bg-surface border border-border-soft rounded-md p-3 outline-none resize-none h-24"
                  />
                  <button 
                    onClick={handleSaveNote}
                    disabled={!newNote.trim()}
                    className="w-full py-3 bg-primary text-white rounded-[12px] font-bold shadow-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" /> Save Encrypted Note
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ id, title, isReadOnly, children }: { id: string, title: string, isReadOnly: boolean, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id, disabled: isReadOnly });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-text-header uppercase tracking-wider text-xs">{title}</h3>
        <span className="bg-surface px-2 py-0.5 rounded-full text-xs font-bold text-text-body border border-border-soft">
          {React.Children.count(children)}
        </span>
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex-1 rounded-[16px] min-h-[200px] transition-colors p-2 ${isOver ? 'bg-primary/5 border border-primary/20 border-dashed' : 'bg-transparent'}`}
      >
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

function DraggableCard({ card, onClick, isReadOnly }: { card: CardData, onClick: () => void, isReadOnly: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id, disabled: isReadOnly });
  const style = transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : undefined;
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`card border-l-4 ${card.borderColor} bg-white hover:-translate-y-1 transition-transform text-left shadow-sm ${isReadOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`${card.tagBg} ${card.tagColor} text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider`}>{card.tag}</span>
        <div className="flex gap-2 items-center">
          {card.assignee !== 'Unassigned' && (
            <span className="text-[10px] font-bold text-text-body px-1.5 py-0.5 bg-surface rounded border border-border-soft uppercase">
              {card.assignee.charAt(0)}
            </span>
          )}
        </div>
      </div>
      <h4 className="font-serif text-text-header text-lg mb-1">{card.title}</h4>
      <p className="text-xs text-text-body mb-4">{card.subtitle}</p>
    </div>
  );
}
