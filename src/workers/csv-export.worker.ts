const DB_NAME = 'VoterDataDB';
const DB_VERSION = 1;
const STORE_NAME = 'rows';

interface ExportConfig {
  rowsPerFile: number;
  columns: string[];
  filePrefix?: string;
  dbName?: string;
}

interface ExportProgress {
  type: 'progress';
  rowsProcessed: number;
  totalRows: number;
  currentFile: number;
  percentComplete: number;
}

interface ExportFileReady {
  type: 'file_ready';
  fileNumber: number;
  blob: Blob;
  filename: string;
  rowCount: number;
}

interface ExportComplete {
  type: 'complete';
  totalFiles: number;
  totalRows: number;
}

interface ExportError {
  type: 'error';
  message: string;
}

export type ExportWorkerMessage = ExportProgress | ExportFileReady | ExportComplete | ExportError;

function openDatabase(dbName = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);
    request.onerror = () => reject(new Error('Failed to open database'));
    request.onsuccess = () => resolve(request.result);
  });
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportData(config: ExportConfig) {
  const { rowsPerFile, columns, filePrefix = 'dataset' } = config;
  const prefix = filePrefix.endsWith('-') ? filePrefix.slice(0, -1) : filePrefix;

  try {
    const db = await openDatabase(config.dbName);
    const totalRows = await countRows(db);

    if (totalRows === 0) {
      self.postMessage({ type: 'error', message: 'No local data found to export' } as ExportError);
      db.close();
      return;
    }

    const headerRow = columns.map(escapeCSVValue).join(',') + '\n';
    let currentFileRows: string[] = [headerRow];
    let currentFileRowCount = 0;
    let totalProcessed = 0;
    let filesEmitted = 0;

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        const value = cursor.value;
        const isNewFormat =
          value.data !== undefined &&
          typeof value.data === 'object' &&
          value.data !== null &&
          typeof value.index === 'number';
        const rowData = isNewFormat ? value.data : value;

        const csvRow = columns.map(col => escapeCSVValue(rowData[col])).join(',') + '\n';
        currentFileRows.push(csvRow);
        currentFileRowCount++;
        totalProcessed++;

        if (currentFileRowCount >= rowsPerFile) {
          filesEmitted++;
          const blob = new Blob(currentFileRows, { type: 'text/csv;charset=utf-8' });
          const filename = `${prefix}-part-${String(filesEmitted).padStart(2, '0')}.csv`;
          self.postMessage({ type: 'file_ready', fileNumber: filesEmitted, blob, filename, rowCount: currentFileRowCount } as ExportFileReady);
          currentFileRows = [headerRow];
          currentFileRowCount = 0;
        }

        if (totalProcessed % 10000 === 0 || totalProcessed === totalRows) {
          self.postMessage({
            type: 'progress',
            rowsProcessed: totalProcessed,
            totalRows,
            currentFile: filesEmitted + 1,
            percentComplete: Math.round((totalProcessed / totalRows) * 100),
          } as ExportProgress);
        }

        cursor.continue();
      } else {
        if (currentFileRowCount > 0) {
          filesEmitted++;
          const blob = new Blob(currentFileRows, { type: 'text/csv;charset=utf-8' });
          const filename = `${prefix}-part-${String(filesEmitted).padStart(2, '0')}.csv`;
          self.postMessage({ type: 'file_ready', fileNumber: filesEmitted, blob, filename, rowCount: currentFileRowCount } as ExportFileReady);
        }
        self.postMessage({ type: 'complete', totalFiles: filesEmitted, totalRows: totalProcessed } as ExportComplete);
        db.close();
      }
    };

    cursorRequest.onerror = () => {
      self.postMessage({ type: 'error', message: 'Failed to read data from local database' } as ExportError);
      db.close();
    };
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' } as ExportError);
  }
}

function countRows(db: IDBDatabase): Promise<number> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();
    countRequest.onsuccess = () => resolve(countRequest.result);
    countRequest.onerror = () => reject(new Error('Failed to count rows'));
  });
}

self.onmessage = (e: MessageEvent<{ action: string; config?: ExportConfig }>) => {
  const { action, config } = e.data;
  if (action === 'start' && config) {
    exportData(config);
  }
};
