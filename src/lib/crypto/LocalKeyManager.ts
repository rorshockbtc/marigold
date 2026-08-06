/**
 * LocalKeyManager.ts
 * Handles AES-256 generation and PIN-based encryption for the "SaaS Illusion"
 * Zero-Knowledge authentication flow.
 */

// Generate a random 256-bit AES-GCM key for the workspace
export async function generateWorkspaceKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export the CryptoKey to raw bytes for storage/encryption
export async function exportKeyBytes(key: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.exportKey("raw", key);
}

// Import raw bytes back into a CryptoKey
export async function importKeyBytes(keyBytes: ArrayBuffer): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Derive a Key Encryption Key (KEK) from the user's PIN using PBKDF2
export async function deriveKeyFromPIN(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedKeyBlob {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}

// Encrypt the Workspace AES key using the PIN-derived KEK
export async function encryptKeyWithPIN(workspaceKey: CryptoKey, pin: string): Promise<EncryptedKeyBlob> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const kek = await deriveKeyFromPIN(pin, salt);
  const rawWorkspaceKey = await exportKeyBytes(workspaceKey);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    kek,
    rawWorkspaceKey
  );

  return { ciphertext, iv, salt };
}

// Decrypt the Workspace AES key using the PIN-derived KEK
export async function decryptKeyWithPIN(blob: EncryptedKeyBlob, pin: string): Promise<CryptoKey> {
  const kek = await deriveKeyFromPIN(pin, blob.salt);
  
  const rawWorkspaceKey = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: blob.iv as BufferSource },
    kek,
    blob.ciphertext
  );

  return await importKeyBytes(rawWorkspaceKey);
}

// Generate a Zero-Knowledge Proof: Sign a random challenge from the server using the Workspace Key
export async function signChallenge(workspaceKey: CryptoKey, challengeStr: string): Promise<string> {
  const enc = new TextEncoder();
  
  // We use HMAC-SHA256 for the challenge response, using the raw AES key material
  const rawKey = await exportKeyBytes(workspaceKey);
  const hmacKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    hmacKey,
    enc.encode(challengeStr)
  );

  // Convert signature to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Encrypt arbitrary text payload with WebCrypto AES-GCM
export async function encryptPayload(text: string, key: CryptoKey): Promise<{ ciphertextHex: string; ivHex: string }> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(text)
  );
  const ciphertextHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  return { ciphertextHex, ivHex };
}

// Decrypt arbitrary text payload with WebCrypto AES-GCM
export async function decryptPayload(ciphertextHex: string, ivHex: string, key: CryptoKey): Promise<string> {
  const dec = new TextDecoder();
  const ciphertextBytes = new Uint8Array(ciphertextHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const ivBytes = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes as BufferSource },
    key,
    ciphertextBytes
  );
  return dec.decode(decrypted);
}

// Derive a symmetric key from the group name so any group member can decrypt the shared cache
export async function deriveGroupKey(groupName: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(groupName.trim().toLowerCase()),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("marigold_group_shared_salt"),
      iterations: 1000, // Faster for UI responsiveness, still acts as deterministic derivation
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}
