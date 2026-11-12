"use client";

import React, { useEffect, useState } from "react";
import { Lock, Radio, RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eli5ConceptPopover } from "@/components/Eli5ConceptPopover";
import { isAirGapLocked } from "@/lib/security/airGapGuard";
import {
  DEFAULT_SOVEREIGN_RELAY_URL,
  NostrCoalitionEnvelope,
  buildEncryptedCoalitionEvent,
  fetchCoalitionEvents,
  getQueuedCoalitionOutbox,
  publishCoalitionEvent,
} from "@/lib/relay/nostrCoalitionSync";

export function CoalitionRelaySyncCard({ activeGroup }: { activeGroup: string }) {
  const [relayUrl, setRelayUrl] = useState(DEFAULT_SOVEREIGN_RELAY_URL);
  const [passphrase, setPassphrase] = useState("marigold-coalition-key");
  const [outbox, setOutbox] = useState<NostrCoalitionEnvelope[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const groupSlug = (activeGroup || "default").toLowerCase().replace(/[^a-z0-9]+/g, "_");

  useEffect(() => {
    setOutbox(getQueuedCoalitionOutbox());
  }, []);

  const handleBroadcastScorecard = async () => {
    setIsSyncing(true);
    setStatusMsg(null);
    try {
      const payloadJson = JSON.stringify({
        group: activeGroup,
        timestamp: new Date().toISOString(),
        summary: `Zero-PII workspace synchronization pulse for ${activeGroup}`,
        totalRows: Number(localStorage.getItem("marigold_file_rows") || 0),
      });
      const event = await buildEncryptedCoalitionEvent({
        groupSlug,
        passphrase,
        payloadType: "NOTE",
        plaintextJson: payloadJson,
        authorAlias: localStorage.getItem("marigold_display_name") || "Citizen Auditor",
      });
      const res = await publishCoalitionEvent(event, relayUrl);
      setOutbox(getQueuedCoalitionOutbox());
      if (res.reason === "air-gap-locked") {
        setStatusMsg(
          "Air-Gap Lock is ON: encrypted AES-256-GCM envelope queued locally in your sovereign outbox with 0 outbound sockets."
        );
      } else if (res.delivered) {
        setStatusMsg(`Broadcasted encrypted NIP-01 envelope (${event.id.slice(0, 12)}…) to ${relayUrl}`);
      } else {
        setStatusMsg(
          `Saved encrypted envelope locally (${event.id.slice(0, 12)}…). Relay offline or unreachable at ${relayUrl}.`
        );
      }
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Could not encrypt coalition pulse.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullRelay = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchCoalitionEvents(groupSlug, relayUrl);
      setOutbox(res.events);
      setStatusMsg(
        res.source === "nostr-relay"
          ? `Fetched ${res.events.length} encrypted envelope(s) from ${relayUrl}.`
          : `Showing ${res.events.length} encrypted envelope(s) from local sovereign cache.`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white border border-border-soft rounded-2xl p-5 shadow-sm space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD6CA] pb-2.5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#B45309]" />
          <h4 className="text-sm font-serif font-bold text-[#1C1917] uppercase tracking-wider">
            Encrypted Coalition Relay
          </h4>
        </div>
        <Eli5ConceptPopover concept="BlindRelay" label="How it works" />
      </div>

      <p className="text-xs text-[#57534E] leading-relaxed">
        Sync Zero-PII workspace updates across devices using AES-256-GCM encrypted NIP-01 envelopes (`ws://localhost:4869` Pipes Sovereign Relay or custom `wss://`).
      </p>

      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-[#44403C]">
          Relay Endpoint
          <input
            type="text"
            value={relayUrl}
            onChange={(e) => setRelayUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D6D0C4] bg-[#FAF8F5] px-2.5 py-1.5 font-mono text-xs text-[#111111]"
          />
        </label>
        <label className="block text-[11px] font-bold text-[#44403C]">
          Group Encryption Passphrase
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D6D0C4] bg-[#FAF8F5] px-2.5 py-1.5 font-mono text-xs text-[#111111]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="primary"
          disabled={isSyncing}
          onClick={handleBroadcastScorecard}
          className="bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isAirGapLocked() ? "Queue Offline Envelope" : "Broadcast Encrypted Pulse"}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSyncing}
          onClick={handlePullRelay}
          className="border-[#D6D0C4] bg-[#FAF8F5] text-[#1C1917] text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>Refresh ({outbox.length})</span>
        </Button>
      </div>

      {statusMsg && (
        <div className="rounded-lg border border-[#F59E0B]/40 bg-[#FEF3C7]/60 p-2.5 text-[11px] font-medium text-[#78350F] flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#B45309]" />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
}
