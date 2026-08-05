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
    store.put(handle, workspaceId);
    const defaultReq = store.put(handle, "default");
    defaultReq.onsuccess = () => resolve();
    defaultReq.onerror = () => reject(defaultReq.error);
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
      if (request.result) {
        resolve(request.result);
      } else {
        // Fallback: check "default" key if specific workspaceId key is missing
        const defaultReq = store.get("default");
        defaultReq.onsuccess = () => resolve(defaultReq.result || null);
        defaultReq.onerror = () => resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function verifyPermission(fileHandle: any, readWrite: boolean = false): Promise<boolean> {
  if (!fileHandle) return false;
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  try {
    const queryRes = await fileHandle.queryPermission(options);
    if (queryRes === 'granted') {
      return true;
    }
    const reqRes = await fileHandle.requestPermission(options);
    if (reqRes === 'granted') {
      return true;
    }
  } catch (err) {
    console.warn("Permission check failed:", err);
  }
  return false;
}

export async function getDirectoryHandleWithPermission(workspaceId: string, readWrite: boolean = false): Promise<any | null> {
  const handle = await getDirectoryHandle(workspaceId);
  if (!handle) return null;

  const hasPerm = await verifyPermission(handle, readWrite);
  if (hasPerm) return handle;
  return handle; // Return handle even if permission prompt requires click gesture
}

export async function initStructuredWorkspace(rootHandle: any): Promise<void> {
  if (!rootHandle) return;
  const subfolders = ["Data_Stories", "Groups", "Uploaded_Data", "Kanban_Boards", "Custom_Playbooks", ".marigold"];
  for (const sub of subfolders) {
    await rootHandle.getDirectoryHandle(sub, { create: true });
  }

  try {
    const fileHandle = await rootHandle.getFileHandle("README.md", { create: true });
    const writable = await fileHandle.createWritable();
    const content = `# Marigold Local Workspace Directory

This folder is your local, private Marigold workspace.
All voter rolls, data stories, playbooks, and Kanban tasks are stored directly on your computer.

SUBDIRECTORIES:
- Data_Stories/: Anonymized query findings and audit reports
- Groups/: Group collaboration settings
- Uploaded_Data/: Local dataset files & shards
- Kanban_Boards/: Offline task tracking
- Custom_Playbooks/: User-defined audit playbooks
- .marigold/: Encryption keys and Data Map signatures

WARNING: Do not rename or delete this folder.
`;
    await writable.write(content);
    await writable.close();
  } catch (e) {
    console.warn("Could not write root README.md:", e);
  }
}

export async function writeStructuredFile(
  rootHandle: any,
  subfolderName: string,
  fileName: string,
  content: string
): Promise<boolean> {
  try {
    const subDir = await rootHandle.getDirectoryHandle(subfolderName, { create: true });
    const fileHandle = await subDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.warn(`Could not write ${fileName} to ${subfolderName}:`, err);
    return false;
  }
}

export async function listStructuredSubfolderFiles(rootHandle: any, subfolderName: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const subDir = await rootHandle.getDirectoryHandle(subfolderName, { create: false });
    for await (const [name, handle] of (subDir as any).entries()) {
      if (handle.kind === "file") {
        files.push(name);
      }
    }
  } catch (e) {
    // Directory might not exist yet
  }
  return files;
}
