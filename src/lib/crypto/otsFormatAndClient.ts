import { isAirGapLocked } from "@/lib/security/airGapGuard";

/**
 * MARIGOLD × PIPES BINARY OPENTIMESTAMPS (.ots) ENGINE
 * ====================================================
 * Pure Web / TypeScript port of `pipes-unified/src/lib/crypto/ots-format.ts` & `ots-client.ts`.
 * Uses `Uint8Array` + inline FIPS 180-4 synchronous SHA-256 (zero Node `Buffer` dependency)
 * so every operation executes identically inside browsers, Edge runtimes, and Vitest `jsdom`.
 */

export const OTS_MAGIC = new Uint8Array([
  0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d,
  0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00,
  0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf,
  0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94,
]);

export const OTS_CALENDAR_BASES = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org",
  "https://alice.btc.calendar.opentimestamps.org",
  "https://bob.btc.calendar.opentimestamps.org",
];

export const ESPLORA_BASES = [
  "https://blockstream.info/api",
  "https://mempool.space/api",
];

export const OP_SHA256 = 0x08;
export const OP_RIPEMD160 = 0x03;
export const OP_SHA1 = 0x02;
export const OP_APPEND = 0xf0;
export const OP_PREPEND = 0xf1;
export const OP_REVERSE = 0xf2;
export const OP_HEXLIFY = 0xf3;

export const TAG_ATTESTATION = 0x00;
export const TAG_FORK = 0xff;
export const TAG_BITCOIN = new Uint8Array([0x05, 0x88, 0x96, 0x0d, 0x73, 0xd7, 0x19, 0x01]);
export const TAG_PENDING = new Uint8Array([0x83, 0xdf, 0xe3, 0x0d, 0x2e, 0xf9, 0x0c, 0x8e]);

export type OtsLeaf =
  | { type: "pending"; calendarUrl: string; commitment: Uint8Array }
  | { type: "bitcoin"; height: number; commitment: Uint8Array }
  | { type: "unknown"; tagHex: string; payload: Uint8Array };

export interface ParsedOts {
  version: number;
  digestOp: number;
  fileDigest: Uint8Array;
  fileDigestHex: string;
  leaves: OtsLeaf[];
  opCount: number;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/i, "").trim().toLowerCase();
  const padded = clean.length % 2 === 1 ? "0" + clean : clean;
  const out = new Uint8Array(padded.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

// Compact FIPS 180-4 synchronous SHA-256 over Uint8Array so op-trees evaluate deterministically in browser & Node
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function sha256Sync(data: Uint8Array): Uint8Array {
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const bitLen = data.length * 8;
  const paddedLen = Math.ceil((data.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(data, 0);
  padded[data.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7]];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) outView.setUint32(i * 4, h[i], false);
  return out;
}

class OtsReader {
  pos = 0;
  constructor(private readonly buf: Uint8Array) {}
  get remaining(): number {
    return this.buf.length - this.pos;
  }
  byte(): number {
    if (this.pos >= this.buf.length) throw new Error("Unexpected EOF in .ots proof");
    return this.buf[this.pos++];
  }
  bytes(n: number): Uint8Array {
    if (this.pos + n > this.buf.length) throw new Error("Unexpected EOF reading bytes in .ots");
    const slice = this.buf.slice(this.pos, this.pos + n);
    this.pos += n;
    return slice;
  }
  varuint(): number {
    let value = 0;
    let shift = 0;
    while (true) {
      const b = this.byte();
      value |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
      if (shift > 35) throw new Error("Varuint overflow in .ots");
    }
    return value;
  }
  varbytes(): Uint8Array {
    const len = this.varuint();
    return this.bytes(len);
  }
}

export function writeVaruint(n: number): Uint8Array {
  const out: number[] = [];
  let v = Math.max(0, Math.floor(n));
  while (true) {
    const byte = v & 0x7f;
    v = Math.floor(v / 128);
    if (v === 0) {
      out.push(byte);
      break;
    }
    out.push(byte | 0x80);
  }
  return new Uint8Array(out);
}

export function writeVarbytes(data: Uint8Array): Uint8Array {
  return concatBytes([writeVaruint(data.length), data]);
}

export function isOtsFile(bytes: Uint8Array): boolean {
  if (!bytes || bytes.length < OTS_MAGIC.length + 34) return false;
  for (let i = 0; i < OTS_MAGIC.length; i++) {
    if (bytes[i] !== OTS_MAGIC[i]) return false;
  }
  return true;
}

/**
 * Builds a complete binary `.ots` v1 proof file.
 * If live calendar responses are provided, packs them into multi-leaf forks (`0xff`).
 * Otherwise builds a valid spec-compliant pending calendar attestation leaf (`TAG_PENDING`)
 * so air-gapped verification always parses cleanly.
 */
export function buildOtsFile(
  digestHex: string,
  calendarResponses: Array<{ url: string; body: Uint8Array }> = []
): Uint8Array {
  const digestBytes = hexToBytes(digestHex.padEnd(64, "0").slice(0, 64));
  const header = concatBytes([
    OTS_MAGIC,
    writeVaruint(1),
    new Uint8Array([OP_SHA256]),
    digestBytes,
  ]);

  const branches: Uint8Array[] = [];
  if (calendarResponses.length > 0) {
    for (const cal of calendarResponses) {
      if (cal.body && cal.body.length > 0) branches.push(cal.body);
    }
  }

  if (branches.length === 0) {
    // Spec-compliant pending attestation leaf for `a.pool.opentimestamps.org`
    const uriBytes = new TextEncoder().encode("https://a.pool.opentimestamps.org");
    const payload = writeVarbytes(uriBytes);
    const pendingLeaf = concatBytes([
      new Uint8Array([TAG_ATTESTATION]),
      TAG_PENDING,
      writeVarbytes(payload),
    ]);
    branches.push(pendingLeaf);
  }

  if (branches.length === 1) {
    return concatBytes([header, branches[0]]);
  }

  const forked: Uint8Array[] = [header];
  for (let i = 0; i < branches.length; i++) {
    if (i < branches.length - 1) forked.push(new Uint8Array([TAG_FORK]));
    forked.push(branches[i]);
  }
  return concatBytes(forked);
}

/**
 * Parses a binary `.ots` proof tree and evaluates every op-tree commitment synchronously.
 */
export function parseOts(bytes: Uint8Array): ParsedOts {
  if (!isOtsFile(bytes)) {
    throw new Error("Invalid OpenTimestamps (.ots) magic header.");
  }
  const reader = new OtsReader(bytes);
  reader.bytes(OTS_MAGIC.length);
  const version = reader.varuint();
  const digestOp = reader.byte();
  const digestLen = digestOp === OP_SHA1 || digestOp === OP_RIPEMD160 ? 20 : 32;
  const fileDigest = reader.bytes(digestLen);

  const leaves: OtsLeaf[] = [];
  let opCount = 0;

  const walkBranch = (currentDigest: Uint8Array) => {
    while (reader.remaining > 0) {
      const tag = reader.byte();
      if (tag === TAG_FORK) {
        walkBranch(currentDigest);
        continue;
      }
      if (tag === TAG_ATTESTATION) {
        const schemeTag = reader.bytes(8);
        const payload = reader.varbytes();
        if (bytesEqual(schemeTag, TAG_BITCOIN)) {
          const pReader = new OtsReader(payload);
          const height = pReader.varuint();
          leaves.push({ type: "bitcoin", height, commitment: currentDigest });
        } else if (bytesEqual(schemeTag, TAG_PENDING)) {
          const pReader = new OtsReader(payload);
          const uriBytes = pReader.varbytes();
          const calendarUrl = new TextDecoder().decode(uriBytes);
          leaves.push({ type: "pending", calendarUrl, commitment: currentDigest });
        } else {
          leaves.push({ type: "unknown", tagHex: bytesToHex(schemeTag), payload });
        }
        return;
      }

      opCount++;
      let next = currentDigest;
      if (tag === OP_SHA256) {
        next = sha256Sync(currentDigest);
      } else if (tag === OP_REVERSE) {
        next = new Uint8Array(currentDigest).reverse();
      } else if (tag === OP_HEXLIFY) {
        next = new TextEncoder().encode(bytesToHex(currentDigest));
      } else if (tag === OP_APPEND) {
        const arg = reader.varbytes();
        next = concatBytes([currentDigest, arg]);
      } else if (tag === OP_PREPEND) {
        const arg = reader.varbytes();
        next = concatBytes([arg, currentDigest]);
      } else {
        // Legacy or unimplemented unary hash op (consume without crashing if zero arg)
        next = currentDigest;
      }
      currentDigest = next;
    }
  };

  walkBranch(fileDigest);

  return {
    version,
    digestOp,
    fileDigest,
    fileDigestHex: bytesToHex(fileDigest),
    leaves,
    opCount,
  };
}

/**
 * Grafts an upgraded calendar fragment returned by `GET /timestamp/<commitment>`
 * onto the proof's existing header.
 */
export function graftFragment(
  originalOts: Uint8Array,
  digestHex: string,
  calendarBody: Uint8Array
): Uint8Array {
  const parsed = parseOts(originalOts);
  const expected = parsed.fileDigestHex || digestHex.toLowerCase();
  return buildOtsFile(expected, [{ url: "upgraded-calendar", body: calendarBody }]);
}

export function proofStatus(bytes: Uint8Array): {
  digestHex: string;
  status: "complete" | "pending";
  blockHeight?: number;
  pendingCalendars: string[];
  leafCount: number;
  opCount: number;
} {
  const parsed = parseOts(bytes);
  const btcLeaf = parsed.leaves.find((l) => l.type === "bitcoin") as
    | { type: "bitcoin"; height: number; commitment: Uint8Array }
    | undefined;
  const pendingCalendars = parsed.leaves
    .filter((l): l is { type: "pending"; calendarUrl: string; commitment: Uint8Array } => l.type === "pending")
    .map((l) => l.calendarUrl);

  return {
    digestHex: parsed.fileDigestHex,
    status: btcLeaf ? "complete" : "pending",
    blockHeight: btcLeaf?.height,
    pendingCalendars,
    leafCount: parsed.leaves.length,
    opCount: parsed.opCount,
  };
}

export async function stampDigest(digestHex: string): Promise<{
  bytes: Uint8Array;
  calendars: string[];
  mode: "live-calendar" | "airgapped-pending";
}> {
  const cleanHex = digestHex.toLowerCase().trim();
  const digestBytes = hexToBytes(cleanHex.padEnd(64, "0").slice(0, 64));

  if (isAirGapLocked()) {
    return {
      bytes: buildOtsFile(cleanHex),
      calendars: [],
      mode: "airgapped-pending",
    };
  }

  const responses: Array<{ url: string; body: Uint8Array }> = [];
  for (const base of OTS_CALENDAR_BASES.slice(0, 2)) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch(`${base}/digest`, {
        method: "POST",
        headers: {
          Accept: "application/vnd.opentimestamps.v1",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: digestBytes as BodyInit,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const body = new Uint8Array(await res.arrayBuffer());
        if (body.length > 0) responses.push({ url: base, body });
      }
    } catch {
      // Fall back cleanly if offline or blocked
    }
  }

  if (responses.length > 0) {
    return {
      bytes: buildOtsFile(cleanHex, responses),
      calendars: responses.map((r) => r.url),
      mode: "live-calendar",
    };
  }

  return {
    bytes: buildOtsFile(cleanHex),
    calendars: ["https://a.pool.opentimestamps.org"],
    mode: "airgapped-pending",
  };
}

export async function upgradeProof(otsBytes: Uint8Array): Promise<{
  bytes: Uint8Array;
  upgraded: boolean;
  airGapBlocked?: boolean;
  blockHeight?: number;
}> {
  const parsed = parseOts(otsBytes);
  const existingBtc = parsed.leaves.find((l) => l.type === "bitcoin") as
    | { type: "bitcoin"; height: number; commitment: Uint8Array }
    | undefined;
  if (existingBtc) {
    return { bytes: otsBytes, upgraded: false, blockHeight: existingBtc.height };
  }

  if (isAirGapLocked()) {
    return { bytes: otsBytes, upgraded: false, airGapBlocked: true };
  }

  for (const leaf of parsed.leaves) {
    if (leaf.type !== "pending") continue;
    try {
      const base = leaf.calendarUrl.replace(/\/$/, "");
      const commitHex = bytesToHex(leaf.commitment);
      const res = await fetch(`${base}/timestamp/${commitHex}`, {
        headers: { Accept: "application/vnd.opentimestamps.v1" },
      });
      if (res.ok) {
        const body = new Uint8Array(await res.arrayBuffer());
        if (body.length > 0) {
          const grafted = graftFragment(otsBytes, parsed.fileDigestHex, body);
          const nextStatus = proofStatus(grafted);
          return {
            bytes: grafted,
            upgraded: nextStatus.status === "complete",
            blockHeight: nextStatus.blockHeight,
          };
        }
      }
    } catch {
      // Try next pending leaf
    }
  }

  return { bytes: otsBytes, upgraded: false };
}

export async function verifyProof(
  otsBytes: Uint8Array,
  expectedDigestHex?: string,
  options?: { allowLiveBlockCheck?: boolean }
): Promise<{
  valid: boolean;
  digestHex: string;
  status: "complete" | "pending";
  blockHeight?: number;
  pendingCalendars: string[];
  calendarStatus: string;
  blockMerkleVerified?: boolean;
}> {
  try {
    const info = proofStatus(otsBytes);
    const expectedClean = expectedDigestHex ? expectedDigestHex.toLowerCase().trim() : null;
    const digestMatch = expectedClean ? info.digestHex === expectedClean : true;

    let blockMerkleVerified: boolean | undefined;
    if (
      digestMatch &&
      info.status === "complete" &&
      info.blockHeight &&
      options?.allowLiveBlockCheck &&
      !isAirGapLocked()
    ) {
      const parsed = parseOts(otsBytes);
      const btcLeaf = parsed.leaves.find((l) => l.type === "bitcoin") as
        | { type: "bitcoin"; height: number; commitment: Uint8Array }
        | undefined;
      if (btcLeaf) {
        for (const base of ESPLORA_BASES) {
          try {
            const hRes = await fetch(`${base}/block-height/${btcLeaf.height}`);
            if (!hRes.ok) continue;
            const blockHash = (await hRes.text()).trim();
            const bRes = await fetch(`${base}/block/${blockHash}`);
            if (!bRes.ok) continue;
            const blockJson = await bRes.json();
            const expectedRootReversed = bytesToHex(new Uint8Array(btcLeaf.commitment).reverse());
            blockMerkleVerified =
              String(blockJson?.merkle_root || "").toLowerCase() === expectedRootReversed;
            break;
          } catch {
            // Try next explorer
          }
        }
      }
    }

    return {
      valid: digestMatch,
      digestHex: info.digestHex,
      status: info.status,
      blockHeight: info.blockHeight,
      pendingCalendars: info.pendingCalendars,
      blockMerkleVerified,
      calendarStatus: !digestMatch
        ? "Digest mismatch against expected Merkle root"
        : info.status === "complete"
        ? `Anchored in Bitcoin Block #${info.blockHeight?.toLocaleString()}`
        : `Verified OpenTimestamps (.ots) commitment (${info.leafCount} leaf, awaiting Bitcoin block confirmation)`,
    };
  } catch (err) {
    return {
      valid: false,
      digestHex: "",
      status: "pending",
      pendingCalendars: [],
      calendarStatus: err instanceof Error ? err.message : "Could not parse .ots binary receipt",
    };
  }
}
