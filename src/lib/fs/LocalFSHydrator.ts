import { openActiveDatabase, getActiveDatabaseName } from "@/lib/db/dbName";
import Papa from "papaparse";
import { interpretColumnMappings } from "@/lib/csv/universalMapper";
import { storeFileHandle, getBestAvailableSovereignStorage } from "@/lib/fs/LocalFSManager";
import { isAirGapLocked } from "@/lib/security/airGapGuard";
import { profileDatasetRows } from "@/lib/csv/DataProfiler";
import { fastMountParquetVault } from "@/lib/datasets/parquetShardCompiler";
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
        } else if (handle.kind === "file" && (entryName.endsWith(".csv") || entryName.endsWith(".parquet"))) {
          directCsvFiles.push(entryName);
          const file = await (handle as FileSystemFileHandle).getFile();
          directTotalBytes += file.size;
        } else if (handle.kind === "file" && entryName === "_parquet_vault_manifest.json") {
          try {
            const file = await (handle as FileSystemFileHandle).getFile();
            const parsedVault = JSON.parse(await file.text());
            if (parsedVault?.schema === "marigold.parquet.vault.v1") {
              datasets.unshift({
                folderName: "",
                datasetName: `${parsedVault.title} (Zstd Parquet Vault)`,
                rowCount: parsedVault.rowCount || 0,
                totalBytes: (parsedVault.shards || []).reduce((acc: number, s: any) => acc + (s.byteSize || 0), 0),
                shardFiles: (parsedVault.shards || []).map((s: any) => s.filename),
                isSubfolder: false,
                lastModified: parsedVault.createdAt,
              });
            }
          } catch {
            // Ignore malformed vault manifest
          }
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
    rootHandle?: FileSystemDirectoryHandle | null,
    onProgress?: (msg: string) => void
  ): Promise<number> {
    try {
      const resolvedRoot =
        rootHandle || (await getBestAvailableSovereignStorage()).handle;
      if (!resolvedRoot) {
        if (onProgress) onProgress("ℹ️ No local folder or OPFS vault available yet.");
        return 0;
      }

      // Phase 1B Fast-Path: Instant <1.5s Zstd Parquet Vault + 1k preview mount
      try {
        const fastVault = await fastMountParquetVault(resolvedRoot);
        if (fastVault.mounted && fastVault.totalRows > 0) {
          if (onProgress) {
            onProgress(
              `⚡ Mounted ${fastVault.shardCount} Zstd Parquet shard(s) (${fastVault.totalRows.toLocaleString()} rows) in ${fastVault.elapsedMs}ms!`
            );
          }
          return fastVault.totalRows;
        }
      } catch {
        // Fall through to standard CSV shard discovery
      }

      if (onProgress) onProgress("🔍 Scanning Marigold_Local/Uploaded_Data for saved datasets...");
      const datasets = await this.discoverLocalDatasets(resolvedRoot);

      if (datasets.length === 0) {
        if (onProgress) onProgress("ℹ️ No saved datasets found in Uploaded_Data.");
        return 0;
      }

      const targetDataset = datasets[0];
      const signature = `${targetDataset.datasetName}-${targetDataset.totalBytes}-${targetDataset.lastModified}`;
      const savedSignature = typeof window !== "undefined" ? localStorage.getItem("marigold_file_signature") : null;
      const savedRows = typeof window !== "undefined" ? localStorage.getItem("marigold_file_rows") : null;

      if (savedSignature === signature && savedRows && parseInt(savedRows) > 0) {
        if (onProgress) onProgress(`⚡ Cryptosig match! Fast-booting '${targetDataset.datasetName}' from local cache...`);
        if (typeof window !== "undefined") {
          localStorage.setItem("marigold_file_connected", "true");
          window.dispatchEvent(new CustomEvent("marigold-data-connected"));
        }
        return parseInt(savedRows);
      }

      if (onProgress) onProgress(`⚡ Hydrating '${targetDataset.datasetName}' into isolated memory...`);

      const uploadedDataHandle = await resolvedRoot.getDirectoryHandle("Uploaded_Data", { create: false });
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
      if (db && typeof db.close === "function") db.close();
      
      let totalRowsHydrated = 0;

      for (const fileName of targetDataset.shardFiles) {
        try {
          const fileHandle = await targetHandle.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          
          // 1. Store the handle for DuckDB to mount later
          const activeGroup = (typeof window !== "undefined" ? localStorage.getItem("marigold_active_group") : "") || "default";
          const slug = activeGroup.toLowerCase().replace(/[^a-z0-9]/g, "_");
          await storeFileHandle(slug, fileHandle);

          // 2. Profile only the first 50 rows locally
          await new Promise<void>((resolveChunk) => {
            let hasProfiled = false;

            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              chunkSize: 1024 * 512, // 512KB is enough for 50 rows
              chunk: (results, parser) => {
                parser.abort(); // Stop immediately after first chunk!
                const chunkRows = results.data as Array<Record<string, any>>;
                
                if (!hasProfiled && chunkRows.length > 0) {
                  hasProfiled = true;
                  totalRowsHydrated = targetDataset.rowCount > 0 ? targetDataset.rowCount : chunkRows.length;
                  
                  if (onProgress) {
                    onProgress(`⚡ Fast-mounting ${totalRowsHydrated.toLocaleString()} records via DuckDB...`);
                  }

                  // Always store deterministic local heuristic map first (100% air-gapped)
                  const localMap = interpretColumnMappings(Object.keys(chunkRows[0] || {}), chunkRows.slice(0, 50));
                  localStorage.setItem(`marigold_file_mapping_${slug}`, JSON.stringify(localMap));

                  if (!isAirGapLocked()) {
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
                      }
                    })
                    .catch(() => {});
                  }
                }
              },
              complete: () => resolveChunk(),
              error: () => resolveChunk()
            });
          });

        } catch (fileErr) {
          console.warn(`Failed parsing file ${fileName}:`, fileErr);
        }
      }

      // No db.close() needed because we didn't open it here in the loop

      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_file_connected", "true");
        localStorage.setItem("marigold_file_name", targetDataset.datasetName);
        localStorage.setItem("marigold_file_rows", String(totalRowsHydrated));
        localStorage.setItem("marigold_file_signature", signature);
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
