/**
 * ZeroPII.ts
 * 
 * Handles the tokenization and hashing of Personally Identifiable Information (PII)
 * completely locally within the browser. 
 * 
 * Ensures that any data sent to Gemini or extracted from the local database
 * is strictly anonymized. The browser acts as the "decoder ring" using this class.
 */

export class ZeroPIIPipeline {
  // Maps a generated hash token back to the real PII string
  private hashToReal = new Map<string, string>();
  // Maps a real PII string to its hash token to ensure deterministic hashing
  private realToHash = new Map<string, string>();

  private prefix = "MARI_KEY_";

  /**
   * Hashes a sensitive string into a safe token, and stores it in the local dictionary.
   */
  public encodeValue(realValue: string): string {
    if (!realValue) return realValue;
    
    const normalized = String(realValue).trim();
    if (this.realToHash.has(normalized)) {
      return this.realToHash.get(normalized)!;
    }

    // Generate a simple alphanumeric hash/token
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const token = `{{${this.prefix}${randomHex}}}`;

    this.hashToReal.set(token, normalized);
    this.realToHash.set(normalized, token);

    return token;
  }

  /**
   * Scans a generated narrative string or data label and replaces all 
   * hashed tokens with their original real values.
   */
  public decodeString(text: string): string {
    if (!text) return text;

    let decodedText = text;
    // Look for all tokens matching {{MARI_KEY_XXXXXXXX}}
    const regex = new RegExp(`\\{\\{${this.prefix}[A-Z0-9]+\\}\\}`, 'g');
    
    decodedText = decodedText.replace(regex, (match) => {
      if (this.hashToReal.has(match)) {
        return this.hashToReal.get(match)!;
      }
      return match; // If not found, leave the token as is (should not happen)
    });

    return decodedText;
  }

  /**
   * Serializes the decoder ring for saving into IndexedDB or a .mari file.
   */
  public exportDictionary(): string {
    return JSON.stringify(Array.from(this.hashToReal.entries()));
  }

  /**
   * Restores a saved decoder ring from IndexedDB or a .mari file.
   */
  public importDictionary(jsonStr: string): void {
    try {
      const entries = JSON.parse(jsonStr) as [string, string][];
      this.hashToReal = new Map(entries);
      this.realToHash = new Map();
      
      // Rebuild the reverse map
      entries.forEach(([token, real]) => {
        this.realToHash.set(real, token);
      });
    } catch (e) {
      console.error("Failed to import ZeroPII dictionary", e);
    }
  }

  /**
   * Clears the active memory (useful when resetting the workspace).
   */
  public clear(): void {
    this.hashToReal.clear();
    this.realToHash.clear();
  }
}

// Export a singleton instance for global app usage (the hot cache)
export const globalPIIPipeline = new ZeroPIIPipeline();
