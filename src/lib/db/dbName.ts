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
  return isDemoGroup ? "DemoVoterDataDB" : "VoterDataDB";
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
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('rows')) {
        db.createObjectStore('rows', { autoIncrement: true });
      }
    };
  });
}

export async function autoLoadSyntheticDemoDataset(onProgress?: (msg: string) => void): Promise<number> {
  if (onProgress) onProgress("⚡ Fetching synthetic Roosevelt dataset (~200 KB)...");
  const res = await fetch('/api/demo-dataset');
  const csvText = await res.text();
  if (onProgress) onProgress("⏳ Parsing ~1,800 training records into isolated RAM...");
  
  return new Promise((resolve, reject) => {
    import("papaparse").then(({ default: Papa }) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (onProgress) onProgress("🔒 Storing into secure air-gapped DemoVoterDataDB...");
          try {
            const dbName = getActiveDatabaseName();
            const db = await openActiveDatabase(dbName);
            const transaction = db.transaction(['rows'], 'readwrite');
            const store = transaction.objectStore('rows');
            store.clear();
            
            const rows = results.data as Array<Record<string, any>>;
            for (let i = 0; i < rows.length; i++) {
              store.add(rows[i]);
            }
            
            transaction.oncomplete = () => {
              db.close();
              if (typeof window !== "undefined") {
                localStorage.setItem("marigold_file_connected", "true");
                localStorage.setItem("marigold_file_name", "DEMO_roosevelt_statewide_voter_roll.csv");
                localStorage.setItem("marigold_file_rows", String(rows.length));
                localStorage.setItem("marigold_demo_loaded", "true");
              }
              if (onProgress) onProgress("✅ Auto-Load Complete!");
              resolve(rows.length);
            };
            transaction.onerror = () => reject(transaction.error);
          } catch (err) {
            reject(err);
          }
        },
        error: (err: any) => reject(err)
      });
    });
  });
}
