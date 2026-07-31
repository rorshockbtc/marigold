const DB_NAME = 'MarigoldFSConfigDB';
const STORE_NAME = 'handles';

function openFSDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function storeDirectoryHandle(workspaceId: string, handle: any): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await openFSDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, workspaceId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getDirectoryHandle(workspaceId: string): Promise<any | null> {
  if (typeof window === "undefined") return null;
  const db = await openFSDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(workspaceId);
    request.onsuccess = () => {
      if (request.result) resolve(request.result);
      else resolve(null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function verifyPermission(fileHandle: any, readWrite: boolean) {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}
