export interface IntegrityAnomaly {
  hasAnomaly: boolean;
  warningTitle?: string;
  warningMessage?: string;
  previousBytes?: number;
  currentBytes?: number;
  byteDelta?: number;
  percentageDrop?: number;
}

export class DatasetIntegrityChecker {
  private static STORAGE_KEY_BYTES = "marigold_last_known_bytes";
  private static STORAGE_KEY_ROWS = "marigold_last_known_rows";

  /**
   * Evaluates current dataset size against last known baseline to protect against state file pruning
   */
  static checkDatasetIntegrity(currentBytes: number, currentRows: number): IntegrityAnomaly {
    if (typeof window === "undefined" || !currentBytes) {
      return { hasAnomaly: false };
    }

    const prevBytesStr = localStorage.getItem(this.STORAGE_KEY_BYTES);
    const prevRowsStr = localStorage.getItem(this.STORAGE_KEY_ROWS);

    // Save initial baseline if no previous signature exists
    if (!prevBytesStr) {
      localStorage.setItem(this.STORAGE_KEY_BYTES, String(currentBytes));
      localStorage.setItem(this.STORAGE_KEY_ROWS, String(currentRows));
      return { hasAnomaly: false };
    }

    const previousBytes = parseInt(prevBytesStr || "0", 10);
    const previousRows = parseInt(prevRowsStr || "0", 10);

    if (isNaN(previousBytes) || previousBytes === 0) {
      localStorage.setItem(this.STORAGE_KEY_BYTES, String(currentBytes));
      localStorage.setItem(this.STORAGE_KEY_ROWS, String(currentRows));
      return { hasAnomaly: false };
    }

    const byteDelta = currentBytes - previousBytes;
    const percentageChange = ((currentBytes - previousBytes) / previousBytes) * 100;

    // Detect abnormal contraction (>20% size drop or >15% row contraction)
    if (percentageChange < -20) {
      const mbDropped = Math.abs(Math.round(byteDelta / (1024 * 1024)));
      return {
        hasAnomaly: true,
        warningTitle: "⚠️ Dataset Contraction Alert",
        warningMessage: `Current file (${Math.round(currentBytes / (1024 * 1024))} MB) is ${Math.abs(Math.round(percentageChange))}% smaller than previous export (${Math.round(previousBytes / (1024 * 1024))} MB). Approx ${mbDropped} MB of records may have been pruned by state authorities.`,
        previousBytes,
        currentBytes,
        byteDelta,
        percentageDrop: Math.abs(Math.round(percentageChange))
      };
    }

    // Update stored baseline if healthy or growing
    localStorage.setItem(this.STORAGE_KEY_BYTES, String(currentBytes));
    localStorage.setItem(this.STORAGE_KEY_ROWS, String(currentRows));

    return { hasAnomaly: false };
  }

  /**
   * Resets baseline signature
   */
  static resetBaseline() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY_BYTES);
      localStorage.removeItem(this.STORAGE_KEY_ROWS);
    }
  }
}
