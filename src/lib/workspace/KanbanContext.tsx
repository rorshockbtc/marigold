"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CardData, Note } from "@/components/KanbanBoard";

interface KanbanContextType {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  addTask: (task: CardData) => void;
  addNoteToTask: (taskId: string, note: Note) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from IndexedDB or a local database.
    // For now, we'll store it in localStorage to share across pages.
    const stored = localStorage.getItem("marigold_kanban_cards");
    if (stored) {
      try {
        setCards(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse kanban cards", e);
      }
    } else {
      // Default initial cards
      setCards([]);
    }
  }, []);

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem("marigold_kanban_cards", JSON.stringify(cards));
    }
  }, [cards]);

  const addTask = (task: CardData) => {
    setCards((prev) => {
      // Prevent duplicates
      if (prev.find(c => c.id === task.id)) return prev;
      return [task, ...prev];
    });
  };

  const addNoteToTask = (taskId: string, note: Note) => {
    setCards((prev) => prev.map(c => {
      if (c.id === taskId) {
        return { ...c, notes: [note, ...c.notes], meta: `${c.notes.length + 1} Note(s)` };
      }
      return c;
    }));
  };

  return (
    <KanbanContext.Provider value={{ cards, setCards, addTask, addNoteToTask }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  return context;
}
