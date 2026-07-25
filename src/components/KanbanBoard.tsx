"use client";
import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, Clock, FileText, CheckCircle2, X } from 'lucide-react';

interface CardData {
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
    meta: "2h ago"
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
    meta: "1 Note"
  },
  {
    id: "card-3",
    status: "Resolved",
    title: "Andrew Young",
    subtitle: "Confirmed military deployment via DoD list.",
    tag: "False Positive",
    tagColor: "text-[#528B65]",
    tagBg: "bg-[#E3EEDC]",
    icon: <CheckCircle2 className="w-4 h-4 text-[#528B65]" />,
    iconColor: "text-[#528B65]",
    borderColor: "border-l-[#528B65]",
    meta: "Resolved"
  }
];

const COLUMNS = ["Needs Triage", "In Review", "Ready to Submit", "Resolved"];

export function KanbanBoard() {
  const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
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

  return (
    <div className="flex-1 relative">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full pb-8">
          {COLUMNS.map(col => (
            <Column key={col} id={col} title={col}>
              {cards.filter(c => c.status === col).map(card => (
                <DraggableCard key={card.id} card={card} onClick={() => setSelectedCard(card)} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>

      {/* SideSheet for Record Details */}
      {selectedCard && (
        <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-border-soft z-30 p-6 flex flex-col animate-in slide-in-from-right-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-text-header">Record Insights</h2>
            <button onClick={() => setSelectedCard(null)} className="p-2 hover:bg-surface rounded-full">
              <X className="w-5 h-5 text-text-body" />
            </button>
          </div>
          <div className="bg-surface rounded-xl p-4 border border-border-soft mb-6">
            <div className="flex justify-between items-start mb-2">
              <span className={`${selectedCard.tagBg} ${selectedCard.tagColor} text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider`}>{selectedCard.tag}</span>
              {selectedCard.icon}
            </div>
            <h4 className="font-serif text-text-header text-xl mb-1">{selectedCard.title}</h4>
            <p className="text-sm text-text-body">{selectedCard.subtitle}</p>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-text-body uppercase tracking-wider mb-4 border-b border-border-soft pb-2">Status Timeline</h3>
            <p className="text-sm text-text-body mb-4">Current Status: <strong>{selectedCard.status}</strong></p>
            <p className="text-sm text-text-body italic">More detailed timeline and raw record data would be loaded here for review.</p>
          </div>
          <div className="mt-auto space-y-3 pt-6 border-t border-border-soft">
            <button className="w-full py-3 bg-primary text-white rounded-[12px] font-bold shadow-sm hover:opacity-90 transition-opacity">
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
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
          {React.Children.count(children) === 0 && (
            <div className="border border-dashed border-border-soft rounded-[12px] h-32 flex items-center justify-center text-text-body text-sm bg-surface/50">
              Empty
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DraggableCard({ card, onClick }: { card: CardData, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id });
  const style = transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : undefined;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`card cursor-grab active:cursor-grabbing border-l-4 ${card.borderColor} bg-white hover:-translate-y-1 transition-transform text-left shadow-sm`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`${card.tagBg} ${card.tagColor} text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider`}>{card.tag}</span>
        {card.icon}
      </div>
      <h4 className="font-serif text-text-header text-lg mb-1">{card.title}</h4>
      <p className="text-xs text-text-body mb-4">{card.subtitle}</p>
      <div className="flex items-center justify-between text-xs text-text-body">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {card.meta}</span>
      </div>
    </div>
  );
}
