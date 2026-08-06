export function getActiveDatabaseName(overrideGroup?: string | null): string {
  if (typeof window === "undefined") return "VoterDataDB";
  const activeGroup = (overrideGroup || localStorage.getItem("marigold_active_group") || "").trim();
  const grpLower = activeGroup.toLowerCase();
  const isDemoGroup = activeGroup === "State of Roosevelt (Demo)" ||
                      activeGroup === "ACME Civic Data Sandbox (Demo Environment)" ||
                      grpLower.includes("demo") ||
                      grpLower.includes("roosevelt") ||
                      grpLower.includes("acme") ||
                      grpLower.includes("sandbox") ||
                      grpLower.includes("synthetic");
  if (isDemoGroup) return "DemoVoterDataDB";
  if (!activeGroup || activeGroup === "default" || activeGroup === "Independent Audit Workspace") return "VoterDataDB";
  const safeSlug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `MarigoldDB_${safeSlug}`;
}

export function isDemoGroupActive(overrideGroup?: string | null): boolean {
  if (typeof window === "undefined") return false;
  const activeGroup = (overrideGroup || localStorage.getItem("marigold_active_group") || "").trim();
  const grpLower = activeGroup.toLowerCase();
  return activeGroup === "State of Roosevelt (Demo)" ||
         activeGroup === "ACME Civic Data Sandbox (Demo Environment)" ||
         grpLower.includes("demo") ||
         grpLower.includes("roosevelt") ||
         grpLower.includes("acme") ||
         grpLower.includes("sandbox") ||
         grpLower.includes("synthetic");
}

export function openActiveDatabase(customDbName?: string): Promise<IDBDatabase> {
  const dbName = customDbName || getActiveDatabaseName();
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onblocked = () => {
      console.warn(`IndexedDB connection to ${dbName} blocked by open handles. Attempting fallback...`);
    };

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
      };

      if (!db.objectStoreNames.contains('rows')) {
        const currentVersion = db.version;
        db.close();
        const upgradeReq = indexedDB.open(dbName, currentVersion + 1);
        upgradeReq.onblocked = () => {
          console.warn(`IndexedDB upgrade for ${dbName} blocked`);
        };
        upgradeReq.onupgradeneeded = (event) => {
          const upDb = (event.target as IDBOpenDBRequest).result;
          if (!upDb.objectStoreNames.contains('rows')) {
            upDb.createObjectStore('rows', { autoIncrement: true });
          }
        };
        upgradeReq.onsuccess = () => {
          const upgradedDb = upgradeReq.result;
          upgradedDb.onversionchange = () => upgradedDb.close();
          resolve(upgradedDb);
        };
        upgradeReq.onerror = () => reject(upgradeReq.error);
        return;
      }

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('rows')) {
        db.createObjectStore('rows', { autoIncrement: true });
      }
    };
  });
}

export async function purgeActiveDatabase(customDbName?: string): Promise<void> {
  if (typeof window === "undefined") return;
  const dbName = customDbName || getActiveDatabaseName();

  try {
    const db = await openActiveDatabase(dbName);
    db.close();
  } catch (e) {}

  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => {
      console.warn(`IndexedDB purge for ${dbName} blocked by open connection, proceeding...`);
      resolve();
    };
  });
}

export async function autoLoadSyntheticDemoDataset(onProgress?: (msg: string) => void): Promise<number> {
  if (onProgress) onProgress("⚡ Fetching synthetic Roosevelt dataset (~200 KB)...");
  const res = await fetch('/api/demo-dataset');
  const csvText = await res.text();
  if (onProgress) onProgress("⏳ Parsing ~1,800 training records into isolated RAM...");
  
  return new Promise((resolve, reject) => {
    const Papa = require('papaparse');
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        const rows = results.data;
        const dbName = "DemoVoterDataDB";
        const db = await openActiveDatabase(dbName);
        const tx = db.transaction(['rows'], 'readwrite');
        const store = tx.objectStore('rows');
        store.clear();

        for (let i = 0; i < rows.length; i++) {
          store.add(rows[i]);
        }

        tx.oncomplete = () => {
          db.close();
          resolve(rows.length);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      }
    });
  });
}
