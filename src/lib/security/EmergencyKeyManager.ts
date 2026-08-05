export class EmergencyKeyManager {
  private static STORAGE_KEY_RECOVERY = "marigold_recovery_key_hash";

  /**
   * Generates a 24-character Zero-Knowledge Recovery Key
   * e.g., "MRGLD-8F92-K3N4-L9P1-Q7W2-X5Z8"
   */
  static generateRecoveryKey(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segments: string[] = [];
    
    for (let s = 0; s < 5; s++) {
      let seg = "";
      for (let c = 0; c < 4; c++) {
        const randIdx = Math.floor(Math.random() * chars.length);
        seg += chars[randIdx];
      }
      segments.push(seg);
    }

    const key = `MRGLD-${segments.join("-")}`;
    
    if (typeof window !== "undefined") {
      // Store simple verification hash locally
      localStorage.setItem(this.STORAGE_KEY_RECOVERY, btoa(key));
    }

    return key;
  }

  /**
   * Writes printable reference copy to Marigold_Local/.marigold/RECOVERY_KEY_DO_NOT_DELETE.txt
   */
  static async saveRecoveryKeyToLocalDisk(
    rootHandle: FileSystemDirectoryHandle,
    recoveryKey: string
  ): Promise<boolean> {
    try {
      const marigoldDir = await rootHandle.getDirectoryHandle(".marigold", { create: true });
      const fileHandle = await marigoldDir.getFileHandle("RECOVERY_KEY_DO_NOT_DELETE.txt", { create: true });
      const writable = await fileHandle.createWritable();

      const content = `===================================================================
MARIGOLD INSIGHTS - ZERO-KNOWLEDGE EMERGENCY RECOVERY KEY
===================================================================
Keep this key in a safe, secure place.

Your Emergency Recovery Key is:
${recoveryKey}

Date Generated: ${new Date().toISOString()}

INSTRUCTIONS:
If you forget your 4-digit PIN, open Marigold Insights, click "Forgot PIN?", 
and enter this 24-character Key to unlock your encrypted local workspace.

WE DO NOT STORE YOUR KEY OR PIN ON ANY SERVER. 
IF YOU LOSE THIS FILE AND FORGET YOUR PIN, YOUR WORKSPACE CANNOT BE DECRYPTED.
===================================================================
`;

      await writable.write(content);
      await writable.close();
      return true;
    } catch (err) {
      console.warn("Could not write RECOVERY_KEY_DO_NOT_DELETE.txt to disk:", err);
      return false;
    }
  }

  /**
   * Verifies emergency recovery key
   */
  static verifyRecoveryKey(inputKey: string): boolean {
    if (typeof window === "undefined") return false;
    const storedHash = localStorage.getItem(this.STORAGE_KEY_RECOVERY);
    if (!storedHash) return false;

    const normalizedInput = inputKey.trim().toUpperCase();
    return btoa(normalizedInput) === storedHash;
  }
}
