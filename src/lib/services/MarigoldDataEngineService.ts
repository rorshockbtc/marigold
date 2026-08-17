import { getActiveDatabaseName, isDemoGroupActive, openActiveDatabase } from "@/lib/db/dbName";
import { normalizeRowWithMapping, interpretColumnMappings } from "@/lib/csv/universalMapper";
import { getDirectoryHandle, writeStructuredFile, readStructuredFile } from "@/lib/fs/LocalFSManager";
import { deriveGroupKey, encryptPayload, decryptPayload } from "@/lib/crypto/LocalKeyManager";
import { fetchBlobsFromRelay, pushBlobToRelay } from "@/lib/relay/clientRelay";
import { getFileHandle } from "@/lib/fs/LocalFSManager";
import * as Comlink from 'comlink';

let duckDBWorker: any = null;

async function getDuckDB() {
  if (!duckDBWorker) {
    const worker = new Worker(new URL('../../workers/duckdb.worker.ts', import.meta.url), { type: 'module' });
    duckDBWorker = Comlink.wrap(worker);
  }
  return duckDBWorker;
}

export interface AuditSweepResults {
  groupId: string;
  timestamp: string;
  totalScanned: number;
  datasetSignature?: string;
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
   * Centralized resolution of the active database name using smart fallback
   */
  public static async getResolvedDatabaseName(groupId?: string): Promise<string> {
    const grp = groupId || (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
    return getActiveDatabaseName(grp);
  }

  /**
   * Fast O(1) fetch of the total row count in the resolved active database
   */
  public static async getTotalRowCount(groupId?: string): Promise<number> {
    try {
      const grp = groupId || (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
      const slug = grp.toLowerCase().replace(/[^a-z0-9]/g, "_");
      
      // HYBRID ROUTER: Try DuckDB (Marigold_Local) first
      const fileHandle = await getFileHandle(slug);
      if (fileHandle) {
        const db = await getDuckDB();
        await db.mountFileHandle(fileHandle.name, fileHandle);
        return await db.getRowCount(fileHandle.name);
      }

      // FALLBACK: Ephemeral/IndexedDB
      const dbName = await this.getResolvedDatabaseName(groupId);
      const idb = await openActiveDatabase(dbName);
      const storeName = this.getValidStoreName(idb);
      const tx = idb.transaction([storeName], "readonly");
      const req = tx.objectStore(storeName).count();
      const count = await new Promise<number>((resolve) => {
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });
      idb.close();
      return count;
    } catch (e) {
      console.warn("Could not get row count:", e);
      return 0;
    }
  }

  /**
   * Centralized query executor. Implements cursor-skipping optimization for empty search terms
   * to guarantee instant loads for the UI.
   */
  public static async queryData(
    searchTerm: string,
    columns: string[],
    limit: number = 100,
    offset: number = 0,
    groupId?: string
  ): Promise<{ rows: any[], totalMatches: number }> {
    const activeGroup = groupId || (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
    const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");

    let activeMapping: any = null;
    try {
      const savedMap = typeof window !== "undefined" ? localStorage.getItem(`marigold_file_mapping_${slug}`) : null;
      if (savedMap) activeMapping = JSON.parse(savedMap);
    } catch (e) {}

    // HYBRID ROUTER: Try DuckDB (Marigold_Local) first
    const fileHandle = await getFileHandle(slug);
    if (fileHandle) {
      const db = await getDuckDB();
      await db.mountFileHandle(fileHandle.name, fileHandle);
      const result = await db.fetchRows(fileHandle.name, limit, offset, searchTerm, columns);
      
      // Normalize rows using active mapping
      if (result.rows.length > 0 && !activeMapping) {
        activeMapping = interpretColumnMappings(Object.keys(result.rows[0]));
      }
      result.rows = result.rows.map((row: any) => normalizeRowWithMapping(row, activeMapping));
      
      return result;
    }

    // FALLBACK: Ephemeral/IndexedDB logic
    const dbName = await this.getResolvedDatabaseName(groupId);
    const db = await openActiveDatabase(dbName);
    const storeName = this.getValidStoreName(db);
    const tx = db.transaction([storeName], "readonly");
    const store = tx.objectStore(storeName);

    // OPTIMIZATION: If there is no search term, use fast cursor skip
    if (!searchTerm) {
      const countReq = store.count();
      const totalMatches = await new Promise<number>((resolve) => {
        countReq.onsuccess = () => resolve(countReq.result || 0);
        countReq.onerror = () => resolve(0);
      });

      const rows: any[] = [];
      if (totalMatches === 0 || offset >= totalMatches) {
        db.close();
        return { rows, totalMatches };
      }

      return new Promise((resolve) => {
        let advanced = false;
        let fetched = 0;
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            if (!advanced && offset > 0) {
              advanced = true;
              cursor.advance(offset);
              return;
            }
            
            const val = cursor.value;
            const rowData = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            
            if (!activeMapping) {
              activeMapping = interpretColumnMappings(Object.keys(rowData));
            }
            
            rows.push(normalizeRowWithMapping(rowData, activeMapping));
            fetched++;
            
            if (fetched < limit) {
              cursor.continue();
            } else {
              db.close();
              resolve({ rows, totalMatches });
            }
          } else {
            db.close();
            resolve({ rows, totalMatches });
          }
        };
      });
    }

    // SLOW PATH: If there is a search term, we must iterate to find matches
    return new Promise((resolve) => {
      const rows: any[] = [];
      let matchCount = 0;
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const val = cursor.value;
          const rowData = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
          
          if (!activeMapping) {
            activeMapping = interpretColumnMappings(Object.keys(rowData));
          }
          
          const matches = columns.some(col =>
            String(rowData[col] || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (matches) {
            matchCount++;
            if (matchCount > offset && rows.length < limit) {
              rows.push(normalizeRowWithMapping(rowData, activeMapping));
            }
          }
          
          cursor.continue();
        } else {
          db.close();
          resolve({ rows, totalMatches: matchCount });
        }
      };
    });
  }

  public static async analyzeData(groupId?: string): Promise<any> {
    const activeGroup = groupId || (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
    const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");

    // HYBRID ROUTER: Try DuckDB (Marigold_Local) first
    const fileHandle = await getFileHandle(slug);
    if (fileHandle) {
      const db = await getDuckDB();
      await db.mountFileHandle(fileHandle.name, fileHandle);
      return await db.analyzeData(fileHandle.name);
    }

    // FALLBACK: Ephemeral/IndexedDB
    const dbName = await this.getResolvedDatabaseName(groupId);
    const db = await openActiveDatabase(dbName);
    const storeName = this.getValidStoreName(db);
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const columnValueCounts: Record<string, Record<string, number>> = {};
    const nullCounts: Record<string, number> = {};
    let columns: string[] = [];
    const sampleData: Array<Record<string, any>> = [];

    return new Promise((resolve, reject) => {
      const countReq = store.count();
      countReq.onsuccess = () => {
        const totalRows = countReq.result || 0;
        if (totalRows === 0) {
          db.close();
          resolve({ totalRows: 0, columns: [], sampleData: [] });
          return;
        }

        let rowsSampled = 0;
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && rowsSampled < 25000) {
            const val = cursor.value;
            const rowData = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            rowsSampled++;
            if (columns.length === 0) {
              columns = Object.keys(rowData);
              columns.forEach(col => { columnValueCounts[col] = {}; nullCounts[col] = 0; });
            }
            if (sampleData.length < 100) sampleData.push(rowData);
            
            columns.forEach(col => {
              const value = rowData[col];
              if (value === null || value === undefined || value === '') {
                nullCounts[col]++;
              } else {
                const strValue = String(value);
                columnValueCounts[col][strValue] = (columnValueCounts[col][strValue] || 0) + 1;
              }
            });
            cursor.continue();
          } else {
            const columnStats = columns.map(col => {
              const valueCounts = columnValueCounts[col] || {};
              const topValues = Object.entries(valueCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([value, count]) => ({ value, count }));
              return {
                name: col,
                type: 'string',
                uniqueValues: Object.keys(valueCounts).length,
                nullCount: nullCounts[col] || 0,
                topValues,
              };
            });

            db.close();
            resolve({
              totalRows,
              columns: columnStats,
              sampleData,
            });
          }
        };
        request.onerror = () => { db.close(); reject(request.error); };
      };
      countReq.onerror = () => { db.close(); reject(countReq.error); };
    });
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

    // Tier 4: Zero-Knowledge Fetch from Firebase Relay
    try {
      if (typeof window !== 'undefined') {
        const blobs = await fetchBlobsFromRelay(slug);
        if (blobs && blobs.length > 0) {
            // Find the latest AUDIT_CACHE_SNAPSHOT
            const latestAudit = blobs.filter((b: any) => b.type === "AUDIT_CACHE_SNAPSHOT").pop();
            if (latestAudit && latestAudit.ciphertext) {
              const groupKey = await deriveGroupKey(slug);
              const rawJson = await decryptPayload(latestAudit.ciphertext, latestAudit.iv, groupKey);
              const parsed: AuditSweepResults = JSON.parse(rawJson);
              this.memoryCache.set(slug, parsed);
              
              // Optimistically cache locally so we don't have to fetch again
              this.savePersistentAuditMap(groupId, parsed, true); 
              return parsed;
            }
          }
        }
    } catch (e) {
      console.warn("Could not pull audit cache from Zero-Knowledge relay:", e);
    }

    return null;
  }

  /**
   * Saves audit topology permanently to Marigold_Local disk handle AND IndexedDB AuditCacheStore
   */
  public static async savePersistentAuditMap(groupId: string, sweepData: AuditSweepResults, skipRelay: boolean = false): Promise<void> {
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

    // Tier 4: Broadcast encrypted snapshot to Firebase Relay
    if (!skipRelay && typeof window !== 'undefined') {
      try {
        const groupKey = await deriveGroupKey(slug);
        const { ciphertextHex, ivHex } = await encryptPayload(JSON.stringify(sweepData), groupKey);
        await pushBlobToRelay(slug, { 
          ciphertext: ciphertextHex, 
          iv: ivHex, 
          type: "AUDIT_CACHE_SNAPSHOT",
          timestamp: Date.now()
        });
      } catch (e) {
        console.warn("Could not push audit cache to Zero-Knowledge relay:", e);
      }
    }
  }

}
