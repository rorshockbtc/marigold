import { openActiveDatabase, getActiveDatabaseName } from "@/lib/db/dbName";
import Papa from "papaparse";
import { profileDatasetRows } from "@/lib/csv/DataProfiler";

export interface DiscoveredDataset {
  folderName: string;
  datasetName: string;
  rowCount: number;
  totalBytes: number;
  shardFiles: string[];
  isSubfolder: boolean;
  lastModified?: string;
}

export class LocalFSHydrator {
  /**
   * Scans Marigold_Local/Uploaded_Data/ for pre-chunked dataset shards or direct CSV files
   */
  static async discoverLocalDatasets(rootHandle: FileSystemDirectoryHandle): Promise<DiscoveredDataset[]> {
    const datasets: DiscoveredDataset[] = [];
    try {
      const uploadedDataHandle = await rootHandle.getDirectoryHandle("Uploaded_Data", { create: false });
      const directCsvFiles: string[] = [];
      let directTotalBytes = 0;

      // Iterate through entries in Uploaded_Data
      // @ts-expect-error FileSystemDirectoryHandle async iterator
      for await (const [entryName, handle] of uploadedDataHandle.entries()) {
        if (handle.kind === "directory" && entryName && entryName.trim() !== "") {
          const subDir = handle as FileSystemDirectoryHandle;
          let manifestData: any = null;
          const csvFiles: string[] = [];
          let totalBytes = 0;

          try {
            // Search for manifest.json or shard CSV files inside subfolder
            // @ts-expect-error FileSystemDirectoryHandle async iterator
            for await (const [fileName, fileHandle] of subDir.entries()) {
              if (fileHandle.kind === "file") {
                if (fileName === "manifest.json") {
                  try {
                    const file = await (fileHandle as FileSystemFileHandle).getFile();
                    const text = await file.text();
                    manifestData = JSON.parse(text);
                  } catch (e) {
                    console.warn("Could not parse manifest.json", e);
                  }
                } else if (fileName.endsWith(".csv")) {
                  csvFiles.push(fileName);
                  const file = await (fileHandle as FileSystemFileHandle).getFile();
                  totalBytes += file.size;
                }
              }
            }

            if (manifestData || csvFiles.length > 0) {
              datasets.push({
                folderName: entryName,
                datasetName: manifestData?.datasetName || entryName.replace(/_/g, " "),
                rowCount: manifestData?.rowCount || 0,
                totalBytes: manifestData?.totalBytes || totalBytes,
                shardFiles: csvFiles,
                isSubfolder: true,
                lastModified: manifestData?.createdDate || new Date().toISOString()
              });
            }
          } catch (subErr) {
            console.warn(`Could not read subfolder ${entryName}:`, subErr);
          }
        } else if (handle.kind === "file" && entryName.endsWith(".csv")) {
          directCsvFiles.push(entryName);
          const file = await (handle as FileSystemFileHandle).getFile();
          directTotalBytes += file.size;
        }
      }

      if (directCsvFiles.length > 0) {
        datasets.push({
          folderName: "",
          datasetName: "Uploaded Local Dataset",
          rowCount: 0,
          totalBytes: directTotalBytes,
          shardFiles: directCsvFiles,
          isSubfolder: false,
          lastModified: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("No Uploaded_Data directory found or access prompt needed:", err);
    }
    return datasets;
  }

  /**
   * Auto-hydrates IndexedDB from discovered local CSV shards in high-speed streaming chunks
   */
  static async hydrateFromLocalFolder(
    rootHandle: FileSystemDirectoryHandle,
    onProgress?: (msg: string) => void
  ): Promise<number> {
    try {
      if (onProgress) onProgress("🔍 Scanning Marigold_Local/Uploaded_Data for saved datasets...");
      const datasets = await this.discoverLocalDatasets(rootHandle);

      if (datasets.length === 0) {
        if (onProgress) onProgress("ℹ️ No saved datasets found in Uploaded_Data.");
        return 0;
      }

      const targetDataset = datasets[0];
      if (onProgress) onProgress(`⚡ Hydrating '${targetDataset.datasetName}' into isolated memory...`);

      const uploadedDataHandle = await rootHandle.getDirectoryHandle("Uploaded_Data", { create: false });
      let targetHandle: FileSystemDirectoryHandle = uploadedDataHandle;

      if (targetDataset.isSubfolder && targetDataset.folderName && targetDataset.folderName.trim() !== "") {
        try {
          targetHandle = await uploadedDataHandle.getDirectoryHandle(targetDataset.folderName, { create: false });
        } catch (dirErr) {
          console.warn(`Could not open subfolder ${targetDataset.folderName}, falling back:`, dirErr);
          targetHandle = uploadedDataHandle;
        }
      }

      const dbName = getActiveDatabaseName();
      const db = await openActiveDatabase(dbName);
      
      // Clear old rows
      await new Promise<void>((res, rej) => {
        const tx = db.transaction(['rows'], 'readwrite');
        tx.objectStore('rows').clear();
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });

      let totalRowsHydrated = 0;

      for (const fileName of targetDataset.shardFiles) {
        try {
          const fileHandle = await targetHandle.getFileHandle(fileName);
          const file = await fileHandle.getFile();

          // Use streaming chunks to prevent main UI thread lockup
          await new Promise<void>((resolveChunk) => {
            let pendingTransaction: IDBTransaction | null = null;
            let currentStore: IDBObjectStore | null = null;
            let hasProfiled = false;

            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              chunkSize: 1024 * 1024 * 5, // 5MB streaming chunks
              chunk: (results, parser) => {
                parser.pause();
                const chunkRows = results.data as Array<Record<string, any>>;
                
                try {
                  if (!hasProfiled && chunkRows.length > 0) {
                    hasProfiled = true;
                    // Do this asynchronously without blocking the local parse, saving to localStorage when done
                    const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
                    const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");
                    
                    const profile = profileDatasetRows(chunkRows.slice(0, 50));
                    fetch('/api/ai-mapper', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ profile }) 
                    })
                    .then(r => r.json())
                    .then(data => {
                      if (data.mapping && !data.error) {
                        localStorage.setItem(`marigold_file_mapping_${slug}`, JSON.stringify(data.mapping));
                        console.log("Successfully stored intelligent AI mapping.");
                      }
                    })
                    .catch(e => console.warn("AI mapper failed, falling back to static map", e));
                  }

                  pendingTransaction = db.transaction(['rows'], 'readwrite');
                  currentStore = pendingTransaction.objectStore('rows');
                  
                  for (let i = 0; i < chunkRows.length; i++) {
                    currentStore.add(chunkRows[i]);
                  }

                  totalRowsHydrated += chunkRows.length;
                  if (onProgress) {
                    onProgress(`⚡ Loaded ${totalRowsHydrated.toLocaleString()} records into memory...`);
                  }

                  pendingTransaction.oncomplete = () => {
                    parser.resume();
                  };
                  pendingTransaction.onerror = () => {
                    console.warn("Chunk batch write warning, resuming...");
                    parser.resume();
                  };
                } catch (e) {
                  console.warn("Chunk error:", e);
                  parser.resume();
                }
              },
              complete: () => {
                resolveChunk();
              },
              error: () => {
                resolveChunk();
              }
            });
          });

        } catch (fileErr) {
          console.warn(`Failed parsing file ${fileName}:`, fileErr);
        }
      }

      db.close();

      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_file_connected", "true");
        localStorage.setItem("marigold_file_name", targetDataset.datasetName);
        localStorage.setItem("marigold_file_rows", String(totalRowsHydrated));
        window.dispatchEvent(new CustomEvent("marigold-data-connected"));
      }

      if (onProgress) onProgress(`✅ Loaded ${totalRowsHydrated.toLocaleString()} records! Opening Workspace...`);
      return totalRowsHydrated;

    } catch (globalErr) {
      console.warn("Hydration failed gracefully:", globalErr);
      return 0;
    }
  }
}
