"use client";
import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, Clock, FileText, CheckCircle2, X, Filter, Lock, Database, ArrowRightLeft, ShieldAlert, BarChart3 } from 'lucide-react';
import { useKanban } from '@/lib/workspace/KanbanContext';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { FilterControl } from '@/components/ui/FilterControl';

export interface Note {
  id: string;
  serverCiphertext: string;
  fileVersion: string;
  date: string;
  isPrivate?: boolean;
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
  attachedRecordIds?: string[];
  playbookId?: string;
  countyFilter?: string;
}

export const INITIAL_CARDS: CardData[] = [
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
  const { cards, setCards, setSelectedTicketId, isLiveSyncing } = useKanban();
  const { isDataLoaded, activeGroup, jurisdiction } = useWorkspace();

  // Group synchronization logic using the real workspace context
  const isGroupSynced = isDataLoaded; // Or whatever custom logic defined
  const activeEncryptionHash = activeGroup;

  const [groupMembers, setGroupMembers] = useState<string[]>(["Unassigned", "Kyle"]);
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [mountMode, setMountMode] = useState("active");

  useEffect(() => {
    const rawRoster = localStorage.getItem("marigold_roster");
    if (rawRoster) {
      try {
        const parsed = JSON.parse(rawRoster);
        const members = parsed.map((m: any) => m.name);
        setGroupMembers(["Unassigned", ...members]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

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
            <FilterControl
              value={mountMode}
              onChange={(val) => setMountMode(val)}
              options={[
                { value: "active", label: `Mounted: ${jurisdiction} (Active)` },
                { value: "global", label: "Mounted: Global Analytics (Out of Sync)" }
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-text-body" />
          <div className="flex items-center gap-2">
            <FilterControl
              label="Assignee:"
              value={assigneeFilter}
              onChange={(val) => setAssigneeFilter(val)}
              options={uniqueAssignees.map(a => ({ value: a, label: a }))}
            />
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {isLiveSyncing && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Sync
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-bold text-[#528B65] bg-[#E3EEDC] px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" />
              <span>Contextual E2EE Active</span>
            </div>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full pb-8">
          {COLUMNS.map(col => (
            <Column id={col} title={col} isReadOnly={!isGroupSynced} key={col}>
              {filteredCards.filter(c => c.status === col).map(card => (
                <DraggableCard key={card.id} card={card} onClick={() => setSelectedTicketId(card.id)} isReadOnly={!isGroupSynced} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>
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
      
      {card.attachedRecordIds && card.attachedRecordIds.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full w-fit border border-emerald-200 mt-2">
          <Database className="w-3 h-3" />
          <span className="font-bold">{card.attachedRecordIds.length} Clustered Records</span>
        </div>
      )}
    </div>
  );
}
