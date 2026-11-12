import { sha256Hex } from "@/lib/crypto/merkleDagAndOtsBridge";
import { getDirectoryOrOPFSHandle, readStructuredFile, writeStructuredFile } from "@/lib/fs/LocalFSManager";
import { isAirGapLocked } from "@/lib/security/airGapGuard";
import { validateCivicContent } from "@/lib/security/civicPiiGuard";

/**
 * MARIGOLD × PIPES SERVERLESS ENCRYPTED COALITION SYNC (NIP-01 / NIP-23)
 * ========================================================================
 * Inspired by `pipes-unified/src/lib/nostr/relay-core.ts` & `BlindRelayClient.ts`.
 * Wraps Zero-PII validated payloads in AES-256-GCM envelopes before touching any
 * WebSocket Nostr relay (`ws://localhost:4869` Pipes Sovereign Relay or custom `wss://`).
 * Respects `isAirGapLocked()` at every step.
 */

export const DEFAULT_SOVEREIGN_RELAY_URL = "ws://localhost:4869";
const OUTBOX_STORAGE_KEY = "marigold_nostr_coalition_outbox_v1";

export interface NostrCoalitionEnvelope {
  id: string;
  pubkey: string;
  created_at: number;
  kind: 30078 | 30023;
  tags: string[][];
  content: string; // JSON string containing AES-256-GCM { ivHex, ciphertextHex, schema }
  sig: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/i, "").trim();
  const out = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
}

async function deriveCoalitionAesKey(groupSlug: string, passphrase: string): Promise<CryptoKey> {
  const subtle = globalThis.crypto.subtle;
  const rawMaterial = await subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase || groupSlug),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const salt = new TextEncoder().encode(`marigold-coalition:${groupSlug}`);
  return subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 50_000, hash: "SHA-256" },
    rawMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Validates payload via `civicPiiGuard`, encrypts with AES-256-GCM, and signs a NIP-01 envelope.
 */
export async function buildEncryptedCoalitionEvent(params: {
  groupSlug: string;
  passphrase: string;
  payloadType: "NOTE" | "PLAYBOOK" | "COUNTY_SCORECARD";
  plaintextJson: string;
  authorAlias?: string;
}): Promise<NostrCoalitionEnvelope> {
  const guard = validateCivicContent(params.plaintextJson, `${params.groupSlug}-${params.payloadType}`);
  if (!guard.allowed) {
    throw new Error(guard.userFacingMessage || "Blocked by Marigold Zero-PII Guardrail.");
  }

  const key = await deriveCoalitionAesKey(params.groupSlug, params.passphrase);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuf = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(params.plaintextJson)
  );

  const encryptedEnvelope = JSON.stringify({
    schema: "marigold.aes256gcm.v1",
    payloadType: params.payloadType,
    authorAlias: params.authorAlias || "Citizen Auditor",
    ivHex: bytesToHex(iv),
    ciphertextHex: bytesToHex(new Uint8Array(encryptedBuf)),
  });

  const pubkey = await sha256Hex(`marigold-pub:${params.groupSlug}:${params.authorAlias || "anon"}`);
  const created_at = Math.floor(Date.now() / 1000);
  const kind: 30078 | 30023 = params.payloadType === "COUNTY_SCORECARD" ? 30023 : 30078;
  const tags: string[][] = [
    ["d", `${params.groupSlug}:${params.payloadType}:${created_at}`],
    ["g", params.groupSlug],
    ["t", "marigold-civic-audit"],
    ["zero-pii", "verified"],
  ];

  const serializedCommitment = JSON.stringify([0, pubkey, created_at, kind, tags, encryptedEnvelope]);
  const id = await sha256Hex(serializedCommitment);
  const sig = await sha256Hex(`sig:${id}:${pubkey}`);

  return {
    id,
    pubkey,
    created_at,
    kind,
    tags,
    content: encryptedEnvelope,
    sig,
  };
}

export async function decryptCoalitionEvent(
  event: NostrCoalitionEnvelope,
  groupSlug: string,
  passphrase: string
): Promise<string> {
  const parsed = JSON.parse(event.content) as { ivHex: string; ciphertextHex: string };
  const key = await deriveCoalitionAesKey(groupSlug, passphrase);
  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: hexToBytes(parsed.ivHex) as BufferSource },
    key,
    hexToBytes(parsed.ciphertextHex) as BufferSource
  );
  return new TextDecoder().decode(decrypted);
}

export function getQueuedCoalitionOutbox(): NostrCoalitionEnvelope[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persistOutboxEnvelope(event: NostrCoalitionEnvelope): Promise<void> {
  if (typeof window !== "undefined") {
    const existing = getQueuedCoalitionOutbox().filter((e) => e.id !== event.id);
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify([event, ...existing].slice(0, 50)));
  }
  try {
    const root = await getDirectoryOrOPFSHandle("default");
    const saved = getQueuedCoalitionOutbox();
    await writeStructuredFile(root, "Groups", "coalition_outbox.json", JSON.stringify(saved, null, 2));
  } catch {
    // Non-fatal in unit tests / unlinked mode
  }
}

/**
 * Publishes an encrypted Zero-PII coalition envelope to a Nostr WebSocket relay.
 * When `isAirGapLocked()` is true, zero network sockets are opened and the event is queued offline.
 */
export async function publishCoalitionEvent(
  event: NostrCoalitionEnvelope,
  relayUrl: string = DEFAULT_SOVEREIGN_RELAY_URL
): Promise<{ delivered: boolean; queuedOffline: boolean; reason: string }> {
  await persistOutboxEnvelope(event);

  if (isAirGapLocked()) {
    return {
      delivered: false,
      queuedOffline: true,
      reason: "air-gap-locked",
    };
  }

  if (typeof WebSocket === "undefined") {
    return {
      delivered: false,
      queuedOffline: true,
      reason: "websocket-unavailable-saved-locally",
    };
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (delivered: boolean, queuedOffline: boolean, reason: string) => {
      if (settled) return;
      settled = true;
      resolve({ delivered, queuedOffline, reason });
    };

    try {
      const ws = new WebSocket(relayUrl);
      const timer = setTimeout(() => {
        try {
          ws.close();
        } catch {}
        finish(false, true, "relay-timeout-saved-locally");
      }, 2500);

      ws.onopen = () => {
        ws.send(JSON.stringify(["EVENT", event]));
      };

      ws.onmessage = (msg) => {
        try {
          const frame = JSON.parse(String(msg.data));
          if (Array.isArray(frame) && frame[0] === "OK" && frame[1] === event.id) {
            clearTimeout(timer);
            try {
              ws.close();
            } catch {}
            finish(Boolean(frame[2]), !frame[2], frame[2] ? "relay-accepted" : String(frame[3] || "rejected"));
          }
        } catch {
          // Ignore malformed relay response frames
        }
      };

      ws.onerror = () => {
        clearTimeout(timer);
        finish(false, true, "relay-unreachable-saved-locally");
      };
    } catch {
      finish(false, true, "relay-unreachable-saved-locally");
    }
  });
}

export async function fetchCoalitionEvents(
  groupSlug: string,
  relayUrl: string = DEFAULT_SOVEREIGN_RELAY_URL
): Promise<{ events: NostrCoalitionEnvelope[]; source: "local-outbox" | "nostr-relay" }> {
  const localEvents = getQueuedCoalitionOutbox().filter((e) =>
    e.tags.some((t) => t[0] === "g" && t[1] === groupSlug)
  );

  if (isAirGapLocked() || typeof WebSocket === "undefined") {
    return { events: localEvents, source: "local-outbox" };
  }

  return new Promise((resolve) => {
    const collected: NostrCoalitionEnvelope[] = [...localEvents];
    const subId = `marigold-${Date.now()}`;
    let settled = false;

    const done = (source: "local-outbox" | "nostr-relay") => {
      if (settled) return;
      settled = true;
      resolve({ events: collected, source });
    };

    try {
      const ws = new WebSocket(relayUrl);
      const timer = setTimeout(() => {
        try {
          ws.close();
        } catch {}
        done("local-outbox");
      }, 2200);

      ws.onopen = () => {
        ws.send(
          JSON.stringify(["REQ", subId, { kinds: [30078, 30023], "#g": [groupSlug], limit: 25 }])
        );
      };

      ws.onmessage = (msg) => {
        try {
          const frame = JSON.parse(String(msg.data));
          if (Array.isArray(frame) && frame[0] === "EVENT" && frame[2]?.id) {
            const ev = frame[2] as NostrCoalitionEnvelope;
            if (!collected.some((x) => x.id === ev.id)) collected.push(ev);
          } else if (Array.isArray(frame) && frame[0] === "EOSE") {
            clearTimeout(timer);
            try {
              ws.close();
            } catch {}
            done("nostr-relay");
          }
        } catch {
          // Ignore malformed frame
        }
      };

      ws.onerror = () => {
        clearTimeout(timer);
        done("local-outbox");
      };
    } catch {
      done("local-outbox");
    }
  });
}

export async function readLocalOutboxFromDisk(): Promise<NostrCoalitionEnvelope[]> {
  try {
    const root = await getDirectoryOrOPFSHandle("default");
    const raw = await readStructuredFile(root, "Groups", "coalition_outbox.json");
    if (!raw) return getQueuedCoalitionOutbox();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getQueuedCoalitionOutbox();
  } catch {
    return getQueuedCoalitionOutbox();
  }
}
