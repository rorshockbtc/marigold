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

export async function verifyPermission(fileHandle: any, readWrite: boolean): Promise<boolean> {
  if (!fileHandle) return false;
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  try {
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true;
    }
  } catch (err) {
    console.warn("Permission check failed:", err);
  }
  return false;
}

const REQUIRED_SUBDIRECTORIES = [
  "Data_Stories",
  "Groups",
  "Uploaded_Data",
  "Kanban_Boards",
  "Custom_Playbooks",
  ".marigold"
];

const ROOT_README_CONTENT = `# Marigold Local Workspace & Storage Engine
Welcome to your private **Marigold Local** workspace directory!

## Directory Structure
- \`Data_Stories/\`: Contains your saved Data Insights, Substack-style articles, and interactive chart snapshots.
- \`Groups/\`: Team mission snapshots and jurisdiction workspace settings.
- \`Uploaded_Data/\`: Ingested data file manifests and chunked records.
- \`Kanban_Boards/\`: Task cards, investigation notes, and audit workflows.
- \`Custom_Playbooks/\`: User-defined forensic algorithms and threshold filters.
- \`.marigold/\`: Encrypted workspace key signatures (\`workspace_keysig.enc\`).

## 🔒 3-Factor Zero-Knowledge Security & Cloud Drive Safety
If you move or sync this folder to Google Drive, Dropbox, Box, or an external USB drive, your files remain strictly encrypted using **AES-256-GCM**.

To decrypt and view any file in Marigold Insights, the application requires **three factors simultaneously inside browser RAM**:
1. This local directory file structure.
2. An active, authenticated Clerk user session.
3. The user PIN entered into the Marigold UI to derive the Key Encryption Key (KEK) via PBKDF2 (100,000 SHA-256 iterations).

Zero raw data rows or unencrypted PII ever leave your machine or hit external servers.
`;

export async function initStructuredWorkspace(dirHandle: any): Promise<void> {
  if (!dirHandle) return;
  const isPermitted = await verifyPermission(dirHandle, true);
  if (!isPermitted) return;

  // Create required subdirectories
  for (const subDir of REQUIRED_SUBDIRECTORIES) {
    try {
      await dirHandle.getDirectoryHandle(subDir, { create: true });
    } catch (e) {
      console.warn(`Could not create subdirectory ${subDir}:`, e);
    }
  }

  // Create root README.md
  try {
    const readmeFile = await dirHandle.getFileHandle("README.md", { create: true });
    const writable = await readmeFile.createWritable();
    await writable.write(ROOT_README_CONTENT);
    await writable.close();
  } catch (e) {
    console.warn("Could not write README.md to local directory:", e);
  }
}

export async function writeStructuredFile(
  dirHandle: any,
  subfolder: string,
  filename: string,
  content: string | Blob
): Promise<boolean> {
  try {
    if (!dirHandle) return false;
    const isPermitted = await verifyPermission(dirHandle, true);
    if (!isPermitted) return false;

    const subDirHandle = await dirHandle.getDirectoryHandle(subfolder, { create: true });
    const fileHandle = await subDirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error(`Failed to write file ${subfolder}/${filename} directly to disk:`, err);
    return false;
  }
}

export async function listStructuredSubfolderFiles(
  dirHandle: any,
  subfolder: string
): Promise<{ name: string; size: number; lastModified: number }[]> {
  const results: { name: string; size: number; lastModified: number }[] = [];
  try {
    if (!dirHandle) return [];
    const isPermitted = await verifyPermission(dirHandle, false);
    if (!isPermitted) return [];

    const subDirHandle = await dirHandle.getDirectoryHandle(subfolder, { create: false });
    for await (const entry of subDirHandle.values()) {
      if (entry.kind === "file") {
        const file = await entry.getFile();
        results.push({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified
        });
      }
    }
  } catch (err) {
    // Directory might not exist yet
  }
  return results;
}
