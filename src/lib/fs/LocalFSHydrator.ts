import { openActiveDatabase, getActiveDatabaseName } from "@/lib/db/dbName";
import Papa from "papaparse";

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
        if (handle.kind === "directory") {
          const subDir = handle as FileSystemDirectoryHandle;
          let manifestData: any = null;
          const csvFiles: string[] = [];
          let totalBytes = 0;

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
   * Auto-hydrates IndexedDB from discovered local CSV shards in < 2 seconds
   */
  static async hydrateFromLocalFolder(
    rootHandle: FileSystemDirectoryHandle,
    onProgress?: (msg: string) => void
  ): Promise<number> {
    if (onProgress) onProgress("🔍 Scanning Marigold_Local/Uploaded_Data for pre-chunked datasets...");
    const datasets = await this.discoverLocalDatasets(rootHandle);

    if (datasets.length === 0) {
      if (onProgress) onProgress("ℹ️ No pre-chunked datasets found in Uploaded_Data.");
      return 0;
    }

    const targetDataset = datasets[0];
    if (onProgress) onProgress(`⚡ Hydrating '${targetDataset.datasetName}' into isolated RAM...`);

    const uploadedDataHandle = await rootHandle.getDirectoryHandle("Uploaded_Data", { create: false });
    const targetHandle = targetDataset.isSubfolder 
      ? await uploadedDataHandle.getDirectoryHandle(targetDataset.folderName, { create: false })
      : uploadedDataHandle;

    const dbName = getActiveDatabaseName();
    const db = await openActiveDatabase(dbName);
    const transaction = db.transaction(['rows'], 'readwrite');
    const store = transaction.objectStore('rows');
    store.clear();

    let totalRowsHydrated = 0;

    for (const fileName of targetDataset.shardFiles) {
      const fileHandle = await targetHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();

      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });

      const rows = parseResult.data as Array<Record<string, any>>;
      for (let i = 0; i < rows.length; i++) {
        store.add(rows[i]);
      }
      totalRowsHydrated += rows.length;
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        if (typeof window !== "undefined") {
          localStorage.setItem("marigold_file_connected", "true");
          localStorage.setItem("marigold_file_name", targetDataset.datasetName);
          localStorage.setItem("marigold_file_rows", String(totalRowsHydrated));
        }
        if (onProgress) onProgress(`✅ Rapid Auto-Hydration Complete! (${totalRowsHydrated.toLocaleString()} rows ready)`);
        resolve(totalRowsHydrated);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
