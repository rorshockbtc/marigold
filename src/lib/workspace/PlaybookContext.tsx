"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { decryptPayload, deriveGroupKey, encryptPayload } from "@/lib/crypto/LocalKeyManager";
import { fetchBlobsFromRelay, pushBlobToRelay } from "@/lib/relay/clientRelay";

export interface CustomPlaybook {
  id: string;
  name: string;
  desc: string;
  description: string;
  audit_type: string; // The base algorithm, e.g., 'density', 'custom'
  threshold?: number;
  county?: string;
  promotedGroups?: string[];
  ownerId?: string; // e.g., "Kyle"
}

interface PlaybookContextType {
  customPlaybooks: CustomPlaybook[];
  setCustomPlaybooks: React.Dispatch<React.SetStateAction<CustomPlaybook[]>>;
  addPlaybook: (pb: CustomPlaybook) => void;
  updatePlaybook: (id: string, updates: Partial<CustomPlaybook>) => void;
  deletePlaybook: (id: string) => void;
}

const PlaybookContext = createContext<PlaybookContextType | undefined>(undefined);

export function PlaybookProvider({ children }: { children: React.ReactNode }) {
  const [customPlaybooks, setCustomPlaybooks] = useState<CustomPlaybook[]>([]);
  const localRevRef = useRef(0);
  const lastPushedRevRef = useRef(-1);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("marigold_custom_playbooks") : null;
    if (stored) {
      try {
        setCustomPlaybooks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse playbooks", e);
      }
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
          const pbBlobs = blobs.filter((b: any) => b.type === "PLAYBOOK_SYNC");
          if (pbBlobs.length > 0) {
            const latest = pbBlobs[pbBlobs.length - 1];
            if (latest.ciphertext && latest.iv) {
              const decryptedRaw = await decryptPayload(latest.ciphertext, latest.iv, key);
              const remotePlaybooks = JSON.parse(decryptedRaw);
              
              setCustomPlaybooks(prev => {
                let changed = false;
                const newPlaybooks = [...prev];
                
                remotePlaybooks.forEach((rp: CustomPlaybook) => {
                  const existingIdx = newPlaybooks.findIndex(p => p.id === rp.id);
                  if (existingIdx >= 0) {
                    const existing = newPlaybooks[existingIdx];
                    // Merge
                    if (existing.name !== rp.name || existing.desc !== rp.desc) {
                      newPlaybooks[existingIdx] = { ...existing, ...rp };
                      changed = true;
                    }
                    if (!newPlaybooks[existingIdx].promotedGroups?.includes(grp)) {
                      newPlaybooks[existingIdx].promotedGroups = [...(newPlaybooks[existingIdx].promotedGroups || []), grp];
                      changed = true;
                    }
                  } else {
                    newPlaybooks.push({ ...rp, promotedGroups: [...(rp.promotedGroups || []), grp] });
                    changed = true;
                  }
                });

                if (changed) {
                  localRevRef.current += 1;
                  lastPushedRevRef.current = localRevRef.current;
                  return newPlaybooks;
                }
                return prev;
              });
            }
          }
        }
      } catch (err) {
        console.warn("Polling playbook relay failed", err);
      }
    };

    interval = setInterval(pollRelay, 5000);
    pollRelay();
    return () => clearInterval(interval);
  }, []);

  // Push local changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("marigold_custom_playbooks", JSON.stringify(customPlaybooks));

      if (localRevRef.current > lastPushedRevRef.current) {
        lastPushedRevRef.current = localRevRef.current;
        (async () => {
          try {
            const grp = localStorage.getItem("marigold_active_group") || "default";
            const key = await deriveGroupKey(grp);
            
            const syncable = customPlaybooks.filter(p => p.promotedGroups?.includes(grp));
            if (syncable.length === 0 && customPlaybooks.length > 0) return;

            const rawPayload = JSON.stringify(syncable);
            const { ciphertextHex, ivHex } = await encryptPayload(rawPayload, key);

            await pushBlobToRelay(grp, {
              id: crypto.randomUUID(),
              ciphertext: ciphertextHex,
              iv: ivHex,
              type: "PLAYBOOK_SYNC"
            });
          } catch (err) {
            console.warn("Playbook sync deferred", err);
          }
        })();
      }
    }
  }, [customPlaybooks]);

  const addPlaybook = (pb: CustomPlaybook) => {
    localRevRef.current += 1;
    setCustomPlaybooks(prev => [pb, ...prev]);
  };

  const updatePlaybook = (id: string, updates: Partial<CustomPlaybook>) => {
    localRevRef.current += 1;
    setCustomPlaybooks(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlaybook = (id: string) => {
    localRevRef.current += 1;
    setCustomPlaybooks(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PlaybookContext.Provider value={{ customPlaybooks, setCustomPlaybooks, addPlaybook, updatePlaybook, deletePlaybook }}>
      {children}
    </PlaybookContext.Provider>
  );
}

export function usePlaybooks() {
  const context = useContext(PlaybookContext);
  if (context === undefined) {
    throw new Error("usePlaybooks must be used within a PlaybookProvider");
  }
  return context;
}
