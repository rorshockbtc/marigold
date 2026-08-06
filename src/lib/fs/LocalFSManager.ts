import { openDB } from "idb";

const DB_NAME = "MarigoldFSConfigDB";
const STORE_NAME = "handles";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function storeDirectoryHandle(groupName: string, handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDB();
  const key = groupName.toLowerCase().trim();
  await db.put(STORE_NAME, handle, key);
  await db.put(STORE_NAME, handle, "default");
}

export async function getDirectoryHandle(groupName: string): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await getDB();
    const key = groupName.toLowerCase().trim();
    const handle = await db.get(STORE_NAME, key);
    if (handle) return handle;
    return await db.get(STORE_NAME, "default");
  } catch (e) {
    return null;
  }
}

export async function removeDirectoryHandle(groupName: string): Promise<void> {
  const db = await getDB();
  const key = groupName.toLowerCase().trim();
  await db.delete(STORE_NAME, key);
}

export async function verifyPermission(fileHandle: any, readWrite: boolean): Promise<boolean> {
  const options: any = {};
  if (readWrite) {
    options.mode = "readwrite";
  }
  if ((await fileHandle.queryPermission(options)) === "granted") {
    return true;
  }
  if ((await fileHandle.requestPermission(options)) === "granted") {
    return true;
  }
  return false;
}

export async function getDirectoryHandleWithPermission(groupName: string): Promise<FileSystemDirectoryHandle | null> {
  const handle = await getDirectoryHandle(groupName);
  if (handle) {
    const hasPermission = await verifyPermission(handle, true);
    if (hasPermission) return handle;
  }
  return null;
}

export async function initializeMarigoldDirectoryStructure(rootHandle: FileSystemDirectoryHandle): Promise<void> {
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

export async function initStructuredWorkspace(rootHandle: FileSystemDirectoryHandle): Promise<void> {
  return initializeMarigoldDirectoryStructure(rootHandle);
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

export async function readStructuredFile(
  rootHandle: any,
  subfolderName: string,
  fileName: string
): Promise<string | null> {
  try {
    const subDir = await rootHandle.getDirectoryHandle(subfolderName, { create: false });
    const fileHandle = await subDir.getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (err) {
    return null;
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
