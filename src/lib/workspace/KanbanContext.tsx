"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CardData, Note, INITIAL_CARDS } from "@/components/KanbanBoard";
import { generateWorkspaceKey, encryptPayload } from "@/lib/crypto/LocalKeyManager";

interface KanbanContextType {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  addTask: (task: CardData) => void;
  addNoteToTask: (taskId: string, note: Note) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("marigold_kanban_cards") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setCards(parsed);
        } else {
          setCards(INITIAL_CARDS);
        }
      } catch (e) {
        console.error("Failed to parse kanban cards", e);
        setCards(INITIAL_CARDS);
      }
    } else {
      setCards(INITIAL_CARDS);
    }
  }, []);

  useEffect(() => {
    if (cards.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("marigold_kanban_cards", JSON.stringify(cards));

      // Asynchronously encrypt & sync via zero-knowledge relay
      (async () => {
        try {
          const key = await generateWorkspaceKey();
          const syncableCards = cards.map(c => ({
            ...c,
            notes: c.notes.filter(n => !n.isPrivate)
          }));
          const rawCards = JSON.stringify(syncableCards);
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
    console.info(`[Telemetry] Kanban: Adding ${note.isPrivate ? "PRIVATE" : "GROUP"} note to ticket ${taskId}`);
    setCards((prev) => prev.map(c => {
      if (c.id === taskId) {
        return { ...c, notes: [note, ...c.notes], meta: `${c.notes.length + 1} Note(s)` };
      }
      return c;
    }));
  };

  return (
    <KanbanContext.Provider value={{ cards, setCards, addTask, addNoteToTask, selectedTicketId, setSelectedTicketId }}>
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
