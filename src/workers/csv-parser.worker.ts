import Papa from 'papaparse';

export interface ParseProgress {
  type: 'progress';
  rowsParsed: number;
  bytesProcessed: number;
  totalBytes: number;
  percentComplete: number;
}

export interface ParseComplete {
  type: 'complete';
  totalRows: number;
  columns: string[];
}

export interface ParseError {
  type: 'error';
  message: string;
}

export type WorkerMessage = ParseProgress | ParseComplete | ParseError;

self.onmessage = async (e: MessageEvent) => {
  const { file, chunkSize = 1024 * 1024 * 5 } = e.data; // 5MB chunks

  if (!file) {
    self.postMessage({ type: 'error', message: 'No file provided' } as ParseError);
    return;
  }

  try {
    let rowsParsed = 0;
    const totalBytes = file.size;
    let columns: string[] = [];
    let hasError = false;
    let db: IDBDatabase;

    self.postMessage({
      type: 'progress',
      rowsParsed: 0,
      bytesProcessed: 0,
      totalBytes,
      percentComplete: 0,
    } as ParseProgress);

    db = await openDatabase();
    await clearDatabase(db);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunkSize: chunkSize,
      chunk: async (results: Papa.ParseResult<Record<string, unknown>>, parser: Papa.Parser) => {
        if (hasError) return;

        // Backpressure: pause parser while writing to IndexedDB
        parser.pause();

        try {
          const chunkData = results.data;

          if (columns.length === 0 && chunkData.length > 0) {
            columns = Object.keys(chunkData[0] as object);
          }

          const startIndex = rowsParsed;
          await storeChunkBatched(db, chunkData, startIndex);

          rowsParsed += chunkData.length;

          const bytesProcessed = results.meta.cursor || 0;
          const percentComplete = Math.min(99, Math.round((bytesProcessed / totalBytes) * 100));

          self.postMessage({
            type: 'progress',
            rowsParsed,
            bytesProcessed,
            totalBytes,
            percentComplete,
          } as ParseProgress);

          parser.resume();
        } catch (err: any) {
          hasError = true;
          self.postMessage({
            type: 'error',
            message: err.message || 'Failed to store chunk in local database',
          } as ParseError);
          parser.abort();
        }
      },
      complete: () => {
        if (!hasError) {
          self.postMessage({
            type: 'complete',
            totalRows: rowsParsed,
            columns,
          } as ParseComplete);
        }
      },
      error: (error) => {
        hasError = true;
        self.postMessage({
          type: 'error',
          message: error.message,
        } as ParseError);
      },
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown processing error',
    } as ParseError);
  }
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VoterDataDB', 1);
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

// Write in batches of 5,000 rows per IDB transaction
async function storeChunkBatched(db: IDBDatabase, data: unknown[], startIndex: number): Promise<void> {
  const BATCH_SIZE = 5000;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await storeBatch(db, batch, startIndex + i);
  }
}

function storeBatch(db: IDBDatabase, data: unknown[], startIndex: number): Promise<void> {
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

async function clearDatabase(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['rows'], 'readwrite');
    const store = transaction.objectStore('rows');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
