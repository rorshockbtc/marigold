import { openActiveDatabase } from '@/lib/db/dbName';
import { normalizeRowWithMapping, interpretColumnMappings } from '@/lib/csv/universalMapper';

export async function executeLocalEngine(tool: string, args: any): Promise<any> {
  if (tool === 'query_dataset') {
    try {
      const db = await openActiveDatabase();
      
      // Check if 'rows' object store exists. It might not if they've never imported local data.
      if (!db.objectStoreNames.contains('rows')) {
        return {
          status: "error",
          message: "No local datasets are currently ingested in Marigold memory. You must rely on external public data URLs, or ask the user to upload their voter file."
        };
      }

      const transaction = db.transaction(['rows'], 'readonly');
      const store = transaction.objectStore('rows');
      
      const countReq = store.count();
      const count = await new Promise<number>((resolve) => {
        countReq.onsuccess = () => resolve(countReq.result || 0);
        countReq.onerror = () => resolve(0);
      });

      if (count === 0) {
        return {
          status: "error",
          message: "Local dataset is empty. Use external data or prompt user to import data."
        };
      }

      const maxRows = 1000;
      if (count > maxRows) {
        return {
          status: "DATASET_TOO_LARGE",
          message: `The active dataset has ${count} rows, which exceeds the browser RAM limit of ${maxRows}. Tell the user: "This dataset is too large to process in browser memory. I need to save it to your Marigold Local folder to process it securely."`
        };
      }

      let processed = 0;
      
      const { metric, group_by } = args;
      const groups: Record<string, number> = {};
      let activeMapping: any = null;

      return new Promise((resolve) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && processed < maxRows) {
            const val = cursor.value;
            const raw = val.data !== undefined && typeof val.data === 'object' && val.data !== null ? val.data : val;
            
            if (!activeMapping) {
              try {
                const savedMap = typeof window !== 'undefined' ? localStorage.getItem("marigold_file_mapping") : null;
                if (savedMap) activeMapping = JSON.parse(savedMap);
              } catch (e) {}
              if (!activeMapping) {
                activeMapping = interpretColumnMappings(Object.keys(raw));
              }
            }
            
            const std: any = normalizeRowWithMapping(raw, activeMapping);
            
            // Very simple grouping heuristic based on string matching
            // If group_by is "Party", we look for "party" in std or raw.
            // If metric is "Count", we just increment.
            
            let groupKey = "Unknown";
            if (group_by) {
              const searchKey = group_by.toLowerCase();
              if (searchKey.includes("party")) groupKey = std.party || raw.party || raw.PARTY || "Unknown";
              else if (searchKey.includes("county")) groupKey = std.county || raw.county || raw.COUNTY || "Unknown";
              else if (searchKey.includes("city")) groupKey = std.city || raw.city || raw.CITY || "Unknown";
              else if (searchKey.includes("status")) groupKey = std.status || raw.status || raw.STATUS || "Unknown";
              else groupKey = "All"; // Fallback
            } else {
              groupKey = "All";
            }

            if (!groups[groupKey]) groups[groupKey] = 0;
            groups[groupKey]++;

            processed++;
            cursor.continue();
          } else {
            // Finished sampling
            const seriesData = Object.keys(groups).map(k => ({ x: k, y: groups[k] }));
            
            resolve({
              status: "success",
              metric,
              group_by,
              sample_size_used: processed,
              total_dataset_size: count,
              aggregated_data: seriesData,
              instruction: "Use this aggregated data to generate an accurate chart and narrative. Never invent data."
            });
          }
        };
        request.onerror = () => {
          resolve({ status: "error", message: "Failed to read local IndexedDB rows." });
        };
      });
    } catch (e: any) {
      return { status: "error", message: e.message };
    }
  }

  return { status: "error", message: `Tool ${tool} not recognized by LocalEngine.` };
}
