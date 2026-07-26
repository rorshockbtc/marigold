/**
 * WebCryptoManager
 * 
 * Implements the Marigold Insights Key Management Policy using native WebCrypto (AES-GCM).
 * This ensures zero-knowledge, hardware-accelerated, non-blocking cryptography.
 */

export class WebCryptoManager {
  private static readonly ITERATIONS = 600000; // High work factor for PBKDF2 to resist offline brute force
  private static readonly KEY_LENGTH = 256;
  private static readonly SALT_PREFIX = "marigold_salt_";

  /**
   * Generates a SHA-256 hash for non-PII payloads (like verification signatures).
   */
  public static async generateHash(payload: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derives an AES-GCM key from the User's PIN and the Server-provided Pepper.
   * This mathematically prevents offline brute-forcing of the 4-6 digit PIN.
   */
  public static async deriveKey(pin: string, serverPepper: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    
    // 1. Import the raw PIN + Pepper material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(pin + serverPepper),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // 2. Derive the actual AES-GCM key using PBKDF2
    // We use the serverPepper as the salt as well to ensure uniqueness per user context
    const salt = enc.encode(this.SALT_PREFIX + serverPepper);
    
    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: this.ITERATIONS,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: this.KEY_LENGTH },
      false, // Extracted key cannot be exported/read by JS
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts plaintext data using AES-GCM.
   * Returns a base64 string combining the IV and Ciphertext for easy storage.
   */
  public static async encryptData(plaintext: string, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM
    const encodedPlaintext = enc.encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedPlaintext
    );

    // Combine IV and Ciphertext: IV (12 bytes) + Ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  }

  /**
   * Decrypts a base64 combined IV + Ciphertext string back to plaintext.
   */
  public static async decryptData(encryptedBase64: string, key: CryptoKey): Promise<string> {
    try {
      const combinedRaw = atob(encryptedBase64);
      const combined = new Uint8Array(combinedRaw.length);
      for (let i = 0; i < combinedRaw.length; i++) {
        combined[i] = combinedRaw.charCodeAt(i);
      }

      // Extract IV (first 12 bytes) and Ciphertext
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (error) {
      console.error("Decryption failed. Invalid key or corrupted data.", error);
      throw new Error("Decryption failed");
    }
  }

  /**
   * Convenience method to encrypt a record directly using PIN + Pepper.
   * Warning: For bulk operations, derive the key once and use encryptData to save CPU cycles.
   */
  public static async encryptWithCredentials(plaintext: string, pin: string, pepper: string): Promise<string> {
    const key = await this.deriveKey(pin, pepper);
    return await this.encryptData(plaintext, key);
  }

  /**
   * Convenience method to decrypt a record directly using PIN + Pepper.
   */
  public static async decryptWithCredentials(encryptedBase64: string, pin: string, pepper: string): Promise<string> {
    const key = await this.deriveKey(pin, pepper);
    return await this.decryptData(encryptedBase64, key);
  }
}
