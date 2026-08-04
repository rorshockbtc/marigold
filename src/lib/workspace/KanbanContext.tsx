"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CardData, Note } from "@/components/KanbanBoard";
import { generateWorkspaceKey, encryptPayload } from "@/lib/crypto/LocalKeyManager";

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
    const stored = typeof window !== "undefined" ? localStorage.getItem("marigold_kanban_cards") : null;
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCards(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse kanban cards", e);
      }
    }
  }, []);

  useEffect(() => {
    if (cards.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("marigold_kanban_cards", JSON.stringify(cards));

      // Asynchronously encrypt & sync via zero-knowledge relay
      (async () => {
        try {
          const key = await generateWorkspaceKey();
          const rawCards = JSON.stringify(cards);
          const { ciphertextHex, ivHex } = await encryptPayload(rawCards, key);
          const grp = localStorage.getItem("marigold_active_group") || "default";

          await fetch("/api/relay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId: grp,
              blob: {
                ciphertext: ciphertextHex,
                iv: ivHex,
                type: "KANBAN_SYNC"
              }
            })
          });
        } catch (err) {
          console.warn("Zero-knowledge relay sync deferred", err);
        }
      })();
    }
  }, [cards]);

  const addTask = (task: CardData) => {
    setCards((prev) => {
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
