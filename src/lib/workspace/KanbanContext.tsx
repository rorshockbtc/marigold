"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { CardData, Note, INITIAL_CARDS } from "@/components/KanbanBoard";
import { deriveGroupKey, encryptPayload, decryptPayload } from "@/lib/crypto/LocalKeyManager";
import { pushBlobToRelay, fetchBlobsFromRelay } from "@/lib/relay/clientRelay";

interface KanbanContextType {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  addTask: (task: CardData) => void;
  addNoteToTask: (taskId: string, note: Note) => void;
  updateCardDetails: (taskId: string, updates: Partial<CardData>) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  isLiveSyncing: boolean;
  isTicketOverlay: boolean;
  setIsTicketOverlay: (val: boolean) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [isTicketOverlay, setIsTicketOverlay] = useState(false);
  const localRevRef = useRef(0);
  const lastPushedRevRef = useRef(-1);

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

  // Poll for remote changes
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollRelay = async () => {
      try {
        const grp = localStorage.getItem("marigold_active_group") || "default";
        const key = await deriveGroupKey(grp);
        const blobs = await fetchBlobsFromRelay(grp);
        
        if (blobs && blobs.length > 0) {
          const kanbanBlobs = blobs.filter((b: any) => b.type === "KANBAN_SYNC");
          if (kanbanBlobs.length > 0) {
            const latest = kanbanBlobs[kanbanBlobs.length - 1];
            if (latest.ciphertext && latest.iv) {
              const decryptedRaw = await decryptPayload(latest.ciphertext, latest.iv, key);
              const remoteCards = JSON.parse(decryptedRaw);
              
              setCards(prev => {
                let changed = false;
                const newCards = [...prev];
                
                remoteCards.forEach((rc: CardData) => {
                  const existingIdx = newCards.findIndex(c => c.id === rc.id);
                  if (existingIdx >= 0) {
                    const existing = newCards[existingIdx];
                    if (existing.status !== rc.status || existing.assignee !== rc.assignee) {
                      newCards[existingIdx] = { ...existing, status: rc.status, assignee: rc.assignee };
                      changed = true;
                    }
                    if (!newCards[existingIdx].promotedGroups?.includes(grp)) {
                      newCards[existingIdx].promotedGroups = [...(newCards[existingIdx].promotedGroups || []), grp];
                      changed = true;
                    }
                    if (rc.evidenceUrl && existing.evidenceUrl !== rc.evidenceUrl) {
                      newCards[existingIdx].evidenceUrl = rc.evidenceUrl;
                      changed = true;
                    }
                    if (rc.checklists) {
                      const existingChecklists = newCards[existingIdx].checklists || [];
                      let checklistChanged = false;
                      const mergedChecklists = [...existingChecklists];
                      rc.checklists.forEach(rcl => {
                        const lclIdx = mergedChecklists.findIndex(c => c.id === rcl.id);
                        if (lclIdx >= 0) {
                          if (mergedChecklists[lclIdx].completed !== rcl.completed || mergedChecklists[lclIdx].text !== rcl.text) {
                            mergedChecklists[lclIdx] = rcl;
                            checklistChanged = true;
                          }
                        } else {
                          mergedChecklists.push(rcl);
                          checklistChanged = true;
                        }
                      });
                      if (checklistChanged) {
                        newCards[existingIdx].checklists = mergedChecklists;
                        changed = true;
                      }
                    }
                    // Merge notes
                    const allNotes = [...newCards[existingIdx].notes];
                    let notesAdded = false;
                    rc.notes.forEach((rn: Note) => {
                      if (!allNotes.find(n => n.id === rn.id)) {
                        allNotes.push(rn);
                        notesAdded = true;
                      }
                    });
                    if (notesAdded) {
                      allNotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      newCards[existingIdx].notes = allNotes;
                      newCards[existingIdx].meta = `${allNotes.length} Note(s)`;
                      changed = true;
                    }
                  } else {
                    newCards.push({ ...rc, promotedGroups: [...(rc.promotedGroups || []), grp] });
                    changed = true;
                  }
                });

                if (changed) {
                  // Increment local rev so it doesn't immediately push back what it just merged
                  localRevRef.current += 1;
                  lastPushedRevRef.current = localRevRef.current;
                  return newCards;
                }
                return prev;
              });
              setIsLiveSyncing(true);
            }
          }
        }
      } catch (err) {
        console.warn("Polling relay failed", err);
        setIsLiveSyncing(false);
      }
    };

    interval = setInterval(pollRelay, 5000);
    // Initial fetch
    pollRelay();
    return () => clearInterval(interval);
  }, []);

  // Push local changes
  useEffect(() => {
    if (cards.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("marigold_kanban_cards", JSON.stringify(cards));

      // Check if we need to push
      if (localRevRef.current > lastPushedRevRef.current) {
        lastPushedRevRef.current = localRevRef.current;
        (async () => {
          try {
            const grp = localStorage.getItem("marigold_active_group") || "default";
            const key = await deriveGroupKey(grp);
            const syncableCards = cards
              .filter(c => c.promotedGroups?.includes(grp))
              .map(c => ({
                ...c,
                notes: c.notes.filter(n => !n.isPrivate)
              }));
            if (syncableCards.length === 0 && cards.length > 0) return; // Nothing to sync for this group

            const rawCards = JSON.stringify(syncableCards);
            const { ciphertextHex, ivHex } = await encryptPayload(rawCards, key);

            await pushBlobToRelay(grp, {
              id: crypto.randomUUID(),
              ciphertext: ciphertextHex,
              iv: ivHex,
              type: "KANBAN_SYNC"
            });
          } catch (err) {
            console.warn("Zero-knowledge relay sync deferred", err);
          }
        })();
      }
    }
  }, [cards]);

  const addTask = (task: CardData) => {
    localRevRef.current += 1;
    setCards((prev) => {
      if (prev.find(c => c.id === task.id)) return prev;
      return [task, ...prev];
    });
  };

  const addNoteToTask = (taskId: string, note: Note) => {
    console.info(`[Telemetry] Kanban: Adding ${note.isPrivate ? "PRIVATE" : "GROUP"} note to ticket ${taskId}`);
    localRevRef.current += 1;
    setCards((prev) => prev.map(c => {
      if (c.id === taskId) {
        return { ...c, notes: [note, ...c.notes], meta: `${c.notes.length + 1} Note(s)` };
      }
      return c;
    }));
  };

  const updateCardDetails = (taskId: string, updates: Partial<CardData>) => {
    localRevRef.current += 1;
    setCards((prev) => prev.map(c => {
      if (c.id === taskId) {
        return { ...c, ...updates };
      }
      return c;
    }));
  };

  // We also need a way to track drags (status changes).
  // React beautiful dnd updates the `cards` state directly from KanbanBoard.tsx.
  // So we intercept `setCards` directly via wrapping if we want, or just let components increment the rev.
  const setCardsWithRev = (action: React.SetStateAction<CardData[]>) => {
    localRevRef.current += 1;
    setCards(action);
  };

  return (
    <KanbanContext.Provider value={{ 
      cards, setCards: setCardsWithRev, addTask, addNoteToTask, updateCardDetails, 
      selectedTicketId, setSelectedTicketId, isLiveSyncing, 
      isTicketOverlay, setIsTicketOverlay 
    }}>
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
