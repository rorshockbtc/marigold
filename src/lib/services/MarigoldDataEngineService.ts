import { getActiveDatabaseName, isDemoGroupActive, openActiveDatabase } from "@/lib/db/dbName";
import { normalizeRowWithMapping, interpretColumnMappings } from "@/lib/csv/universalMapper";
import { getDirectoryHandle, writeStructuredFile, readStructuredFile } from "@/lib/fs/LocalFSManager";

export interface AuditSweepResults {
  groupId: string;
  timestamp: string;
  totalScanned: number;
  anomalyRecords: Record<string, Array<Record<string, any>>>;
  severityCounts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    INFO: number;
  };
}

export class MarigoldDataEngineService {
  private static memoryCache: Map<string, AuditSweepResults> = new Map();

  /**
   * Resolves valid IndexedDB store name dynamically ('rows', 'records', 'VoterRolls')
   */
  public static getValidStoreName(db: IDBDatabase): string {
    if (db.objectStoreNames.contains("rows")) return "rows";
    if (db.objectStoreNames.contains("records")) return "records";
    if (db.objectStoreNames.contains("VoterRolls")) return "VoterRolls";
    if (db.objectStoreNames.length > 0) return db.objectStoreNames[0];
    return "rows";
  }

  /**
   * Reads persistent audit topology from Marigold_Local disk handle FIRST, falling back to IndexedDB
   */
  public static async getPersistentAuditMap(groupId: string): Promise<AuditSweepResults | null> {
    const slug = groupId.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Tier 1: Check Memory Singleton Cache (0ms)
    if (this.memoryCache.has(slug)) {
      return this.memoryCache.get(slug)!;
    }

    // Tier 2: Check Marigold_Local Disk Handle
    try {
      const rootHandle = await getDirectoryHandle(slug);
      if (rootHandle) {
        const diskContent = await readStructuredFile(rootHandle, "Data_Stories", `AUDIT_MAP_${slug}.json`);
        if (diskContent) {
          const parsed: AuditSweepResults = JSON.parse(diskContent);
          this.memoryCache.set(slug, parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read audit map from Marigold_Local disk handle:", e);
    }

    // Tier 3: Check IndexedDB AuditCacheStore (< 5ms)
    try {
      const dbName = getActiveDatabaseName(groupId);
      const db = await openActiveDatabase(dbName);
      if (db.objectStoreNames.contains("AuditCacheStore")) {
        const tx = db.transaction(["AuditCacheStore"], "readonly");
        const store = tx.objectStore("AuditCacheStore");
        const req = store.get(slug);
        const result = await new Promise<AuditSweepResults | null>((resolve) => {
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
        db.close();
        if (result) {
          this.memoryCache.set(slug, result);
          return result;
        }
      } else {
        db.close();
      }
    } catch (e) {
      console.warn("Could not read audit map from IndexedDB AuditCacheStore:", e);
    }

    return null;
  }

  /**
   * Saves audit topology permanently to Marigold_Local disk handle AND IndexedDB AuditCacheStore
   */
  public static async savePersistentAuditMap(groupId: string, sweepData: AuditSweepResults): Promise<void> {
    const slug = groupId.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // Tier 1: Update Memory Singleton Cache
    this.memoryCache.set(slug, sweepData);

    // Tier 2: Save to IndexedDB AuditCacheStore (No 5MB limit!)
    try {
      const dbName = getActiveDatabaseName(groupId);
      const db = await openActiveDatabase(dbName);
      if (!db.objectStoreNames.contains("AuditCacheStore")) {
        const currentVersion = db.version;
        db.close();
        const upgradeReq = indexedDB.open(dbName, currentVersion + 1);
        upgradeReq.onupgradeneeded = (evt) => {
          const upDb = (evt.target as IDBOpenDBRequest).result;
          if (!upDb.objectStoreNames.contains("AuditCacheStore")) {
            upDb.createObjectStore("AuditCacheStore");
          }
        };
        const upDb = await new Promise<IDBDatabase>((resolve) => {
          upgradeReq.onsuccess = () => resolve(upgradeReq.result);
        });
        const tx = upDb.transaction(["AuditCacheStore"], "readwrite");
        tx.objectStore("AuditCacheStore").put(sweepData, slug);
        tx.oncomplete = () => upDb.close();
      } else {
        const tx = db.transaction(["AuditCacheStore"], "readwrite");
        tx.objectStore("AuditCacheStore").put(sweepData, slug);
        tx.oncomplete = () => db.close();
      }
    } catch (e) {
      console.warn("Could not write audit map to IndexedDB AuditCacheStore:", e);
    }

    // Tier 3: Save to Marigold_Local/Data_Stories/AUDIT_MAP_[slug].json on disk
    try {
      const rootHandle = await getDirectoryHandle(slug);
      if (rootHandle) {
        await writeStructuredFile(
          rootHandle,
          "Data_Stories",
          `AUDIT_MAP_${slug}.json`,
          JSON.stringify(sweepData, null, 2)
        );
      }
    } catch (e) {
      console.warn("Could not write audit map to Marigold_Local disk handle:", e);
    }
  }

}
