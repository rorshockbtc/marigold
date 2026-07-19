import * as Comlink from 'comlink';
import Papa from 'papaparse';
import { interpretColumnMappings } from '@/lib/csv/universalMapper';

export class DataProcessorWorker {
  
  async ingestCSVFile(
    file: File, 
    dbName: string, 
    onProgress: (progress: number, rowsParsed: number, message: string) => void
  ) {
    if (!file) throw new Error("No file provided");

    let rowsParsed = 0;
    const totalBytes = file.size;
    let columns: string[] = [];
    let hasError = false;

    // 1. Initialize IndexedDB
    const db = await this.openDatabase(dbName);
    await this.clearDatabase(db);
    onProgress(0, 0, "Initializing IndexedDB Air-Gap...");

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        chunkSize: 1024 * 1024 * 5, // 5MB chunks
        transformHeader: (h: string) => h.replace(/^\uFEFF/, '').trim(),
        chunk: async (results: Papa.ParseResult<Record<string, unknown>>, parser: Papa.Parser) => {
          if (hasError) return;
          parser.pause(); // Backpressure

          try {
            const chunkData = results.data;
            if (columns.length === 0 && chunkData.length > 0) {
              columns = Object.keys(chunkData[0] as object);
            }

            const startIndex = rowsParsed;
            // Write 10,000-row arrays for max DB throughput
            await this.storeChunkBatched(db, chunkData, startIndex, 10000);
            
            rowsParsed += chunkData.length;
            const bytesProcessed = results.meta.cursor || 0;
            const percentComplete = Math.min(99, Math.round((bytesProcessed / totalBytes) * 100));

            onProgress(percentComplete, rowsParsed, `Streaming chunk...`);
            parser.resume();
          } catch (err: any) {
            hasError = true;
            reject(new Error(err.message || "Failed to store chunk"));
            parser.abort();
          }
        },
        complete: () => {
          if (!hasError) {
            onProgress(100, rowsParsed, "Ingestion Complete");
            const mapping = interpretColumnMappings(columns);
            resolve({
              totalRows: rowsParsed,
              columns,
              columnMapping: mapping
            });
          }
        },
        error: (error) => {
          hasError = true;
          reject(new Error(error.message));
        }
      });
    });
  }

  async calculateZScores(values: number[]) {
    if (values.length === 0) return { mean: 0, stdDev: 0 };
    let sum = 0;
    for (let i = 0; i < values.length; i++) sum += values[i];
    const mean = sum / values.length;
    
    let varianceSum = 0;
    for (let i = 0; i < values.length; i++) {
      varianceSum += Math.pow(values[i] - mean, 2);
    }
    const variance = varianceSum / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  // IndexedDB Helpers
  private openDatabase(dbName: string): Promise<IDBDatabase> {
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

  private async storeChunkBatched(db: IDBDatabase, data: unknown[], startIndex: number, batchSize: number): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await this.storeBatch(db, batch, startIndex + i);
    }
  }

  private storeBatch(db: IDBDatabase, data: unknown[], startIndex: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['rows'], 'readwrite');
      const store = transaction.objectStore('rows');
      data.forEach((row, idx) => {
        store.put({ index: startIndex + idx, data: row });
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private clearDatabase(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['rows'], 'readwrite');
      const store = transaction.objectStore('rows');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

Comlink.expose(DataProcessorWorker);
