import { getDirectoryHandle, verifyPermission } from '../fs/LocalFSManager';

/**
 * DecryptionEngine handles the hydration of [ENTITY_HASH_xxx] back into raw text
 * by reading the local PII map from the user's Marigold Local Folder.
 */
export class DecryptionEngine {
  
  /**
   * Translates any [ENTITY_HASH_xxx] in the text back to its real value.
   */
  public static async hydrateText(text: string): Promise<string> {
    if (!text || !text.includes('[ENTITY_HASH_')) return text;
    
    const map = await this.loadPIIMap();
    if (!map) return text;

    let hydratedText = text;
    
    // Replace all instances of [ENTITY_HASH_xxx]
    const regex = /\[ENTITY_HASH_[A-Z0-9_]+\]/g;
    const matches = hydratedText.match(regex);
    
    if (matches) {
      for (const match of matches) {
        // e.g. match = "[ENTITY_HASH_A3F9]"
        // The map stores it without brackets, e.g. "ENTITY_HASH_A3F9": "123 Main St"
        const key = match.replace('[', '').replace(']', '');
        if (map[key]) {
          hydratedText = hydratedText.replace(match, map[key]);
        }
      }
    }
    
    return hydratedText;
  }

  /**
   * Helper to load the PII map from the OPFS / Local File System
   */
  private static async loadPIIMap(): Promise<Record<string, string> | null> {
    if (typeof window === "undefined") return null;
    
    try {
      // 1. Try to load from Marigold Local folder via File System API
      const handle = await getDirectoryHandle('default');
      if (handle) {
        const hasPerm = await verifyPermission(handle, false);
        if (hasPerm) {
          try {
            const fileHandle = await handle.getFileHandle('pii_map.json');
            const file = await fileHandle.getFile();
            const text = await file.text();
            return JSON.parse(text);
          } catch (e) {
            // File might not exist yet
          }
        }
      }
      
      // 2. Fallback to localStorage proxy
      const stored = localStorage.getItem('marigold_pii_map');
      if (stored) return JSON.parse(stored);
      
    } catch (e) {
      console.error("Failed to load PII map", e);
    }
    
    return null;
  }
  
  /**
   * Saves a new PII mapping
   */
  public static async savePIIMapping(key: string, value: string): Promise<void> {
    const map = (await this.loadPIIMap()) || {};
    map[key] = value;
    
    try {
      const handle = await getDirectoryHandle('default');
      if (handle) {
        const hasPerm = await verifyPermission(handle, true);
        if (hasPerm) {
          const fileHandle = await handle.getFileHandle('pii_map.json', { create: true });
          const writable = await (fileHandle as any).createWritable();
          await writable.write(JSON.stringify(map, null, 2));
          await writable.close();
        }
      }
      
      // Always backup to localStorage proxy
      localStorage.setItem('marigold_pii_map', JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save PII mapping", e);
    }
  }
}
