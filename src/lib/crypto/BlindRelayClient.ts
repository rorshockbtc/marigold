/**
 * BlindRelayClient.ts
 * Serializes state, encrypts it with the AES-256 group key, and handles
 * transmission to/from the dumb relay server.
 */

import { exportKeyBytes, importKeyBytes } from "./LocalKeyManager";

export interface EncryptedStateBlob {
  iv: string; // hex
  ciphertext: string; // hex
}

// Helper to convert Uint8Array to Hex string
function buf2hex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Helper to convert Hex string to Uint8Array
function hex2buf(hexString: string): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Encrypt JSON state into a garbled ciphertext blob
export async function encryptState(workspaceKey: CryptoKey, stateObject: any): Promise<EncryptedStateBlob> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const serialized = JSON.stringify(stateObject);
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    workspaceKey,
    enc.encode(serialized)
  );

  return {
    iv: buf2hex(iv.buffer),
    ciphertext: buf2hex(ciphertextBuffer)
  };
}

// Decrypt a garbled ciphertext blob back into JSON state
export async function decryptState(workspaceKey: CryptoKey, blob: EncryptedStateBlob): Promise<any> {
  const dec = new TextDecoder();
  const iv = hex2buf(blob.iv);
  const ciphertext = hex2buf(blob.ciphertext);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    workspaceKey,
    ciphertext as BufferSource
  );

  const jsonString = dec.decode(decryptedBuffer);
  return JSON.parse(jsonString);
}

// Push to the Dumb Relay Server
export async function pushToRelay(groupId: string, blob: EncryptedStateBlob): Promise<void> {
  await fetch(`/api/relay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, blob })
  });
}

// Fetch from the Dumb Relay Server
export async function fetchFromRelay(groupId: string): Promise<EncryptedStateBlob[]> {
  const res = await fetch(`/api/relay?groupId=${encodeURIComponent(groupId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.blobs;
}
