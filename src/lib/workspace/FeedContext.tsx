"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useGroupSync } from "@/hooks/useGroupSync";

export interface FeedEvent {
  id: string;
  type: "playbook_promoted" | "ticket_promoted" | "system_alert";
  message: string;
  timestamp: string;
  author: string;
  meta?: any;
}

interface FeedContextType {
  feedEvents: FeedEvent[];
  addFeedEvent: (event: Omit<FeedEvent, "id" | "timestamp" | "author">) => void;
  clearFeed: () => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const { loadAuditCache } = useGroupSync(); // use this just as a trigger loop

  useEffect(() => {
    const loadFeeds = () => {
      try {
        const stored = localStorage.getItem("marigold_feed");
        if (stored) {
          setFeedEvents(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load feed", e);
      }
    };
    loadFeeds();
  }, []);

  // Poll relay for FEED_SYNC packets
  useEffect(() => {
    const pollRelay = async () => {
      const grp = localStorage.getItem("marigold_active_group");
      if (!grp) return;

      try {
        const res = await fetch(`/api/relay?groupId=${grp}`);
        if (!res.ok) return;
        const data = await res.json();
        const packets = data.packets || [];

        const incomingEvents: FeedEvent[] = [];
        packets.forEach((pkt: any) => {
          if (pkt.blob && pkt.blob.type === "FEED_SYNC") {
            incomingEvents.push(pkt.blob.event);
          }
        });

        if (incomingEvents.length > 0) {
          setFeedEvents(prev => {
            const newFeeds = [...incomingEvents, ...prev];
            // Deduplicate by id
            const unique = newFeeds.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
            const sorted = unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            localStorage.setItem("marigold_feed", JSON.stringify(sorted));
            return sorted;
          });
        }
      } catch (e) {
        // Silent poll error
      }
    };

    pollRelay();
    const interval = setInterval(pollRelay, 5000);
    return () => clearInterval(interval);
  }, []);

  const addFeedEvent = async (eventBase: Omit<FeedEvent, "id" | "timestamp" | "author">) => {
    const author = localStorage.getItem("marigold_display_name") || "Investigator";
    const newEvent: FeedEvent = {
      ...eventBase,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      author
    };

    // Update local state immediately
    setFeedEvents(prev => {
      const next = [newEvent, ...prev];
      localStorage.setItem("marigold_feed", JSON.stringify(next));
      return next;
    });

    // Push to relay
    const grp = localStorage.getItem("marigold_active_group");
    if (grp) {
      try {
        await fetch("/api/relay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: grp,
            blob: { type: "FEED_SYNC", event: newEvent }
          })
        });
      } catch (e) {
        console.error("Failed to push feed event", e);
      }
    }
  };

  const clearFeed = () => {
    setFeedEvents([]);
    localStorage.removeItem("marigold_feed");
  };

  return (
    <FeedContext.Provider value={{ feedEvents, addFeedEvent, clearFeed }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
}
