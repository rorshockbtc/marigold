import { openDB } from "idb";

const DB_NAME = "MarigoldFSConfigDB";
const DB_VERSION = 2;
const STORE_NAME = "handles";
const VIRTUAL_FILES_STORE = "virtual_files";

export type SovereignStorageTier = "native-fs" | "opfs" | "indexeddb";

export interface StorageTierInfo {
  tier: SovereignStorageTier;
  label: string;
  persisted: boolean;
  rootName: string;
}

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(VIRTUAL_FILES_STORE)) {
        db.createObjectStore(VIRTUAL_FILES_STORE);
      }
    },
  });
}

/**
 * Requests durable storage from the browser (`navigator.storage.persist()`) so Safari / Firefox / Chrome
 * do not evict OPFS or IndexedDB voter roll shards under disk pressure.
 */
export async function ensureDurableSovereignStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage) return false;
  try {
    if (typeof navigator.storage.persisted === "function") {
      const already = await navigator.storage.persisted();
      if (already) return true;
    }
    if (typeof navigator.storage.persist === "function") {
      return await navigator.storage.persist();
    }
  } catch {
    // Ignore permission errors in restricted contexts
  }
  return false;
}

/**
 * Tier 2: Origin Private File System (OPFS) via `navigator.storage.getDirectory()`.
 * Works silently with zero permission popups across Chrome, Edge, Safari 17+, Firefox, and iOS/iPadOS!
 */
export async function getOPFSRootDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (
    typeof navigator === "undefined" ||
    !navigator.storage ||
    typeof navigator.storage.getDirectory !== "function"
  ) {
    return null;
  }
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    const marigoldRoot = await opfsRoot.getDirectoryHandle("Marigold_Local", { create: true });
    return marigoldRoot;
  } catch {
    return null;
  }
}

/**
 * Resolves the highest-speed available local sovereign directory handle:
 * - Tier 1: Native OS Folder (`FileSystemDirectoryHandle` linked by user)
 * - Tier 2: Origin Private File System (`OPFS` — zero prompt, Safari/Firefox/Chrome/mobile compatible)
 * - Tier 3: Persistent IndexedDB Virtual File System (`MarigoldFSConfigDB.virtual_files`)
 */
export async function getBestAvailableSovereignStorage(groupName = "default"): Promise<{
  tier: SovereignStorageTier;
  handle: FileSystemDirectoryHandle | null;
  persisted: boolean;
}> {
  const persisted = await ensureDurableSovereignStorage();

  // Tier 1: Linked Native OS Folder (if permission is already granted without forcing a prompt)
  const nativeHandle = await getDirectoryHandle(groupName);
  if (nativeHandle) {
    try {
      if (
        typeof (nativeHandle as any).queryPermission === "function" &&
        (await (nativeHandle as any).queryPermission({ mode: "readwrite" })) === "granted"
      ) {
        return { tier: "native-fs", handle: nativeHandle, persisted };
      }
    } catch {
      // Fall through to OPFS
    }
  }

  // Tier 2: Origin Private File System (OPFS)
  const opfsHandle = await getOPFSRootDirectory();
  if (opfsHandle) {
    return { tier: "opfs", handle: opfsHandle, persisted };
  }

  // Tier 3: IndexedDB Virtual FS
  return { tier: "indexeddb", handle: null, persisted };
}

export async function getActiveStorageTierInfo(groupName = "default"): Promise<StorageTierInfo> {
  const resolved = await getBestAvailableSovereignStorage(groupName);
  if (resolved.tier === "native-fs" && resolved.handle) {
    return {
      tier: "native-fs",
      label: "Tier 1 · Native OS Folder",
      persisted: resolved.persisted,
      rootName: resolved.handle.name || "Marigold_Local",
    };
  }
  if (resolved.tier === "opfs") {
    return {
      tier: "opfs",
      label: "Tier 2 · OPFS Sovereign Vault",
      persisted: resolved.persisted,
      rootName: "OPFS://Marigold_Local",
    };
  }
  return {
    tier: "indexeddb",
    label: "Tier 3 · IndexedDB Local Vault",
    persisted: resolved.persisted,
    rootName: "IDB://Marigold_Local",
  };
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
    return (await db.get(STORE_NAME, "default")) || null;
  } catch {
    return null;
  }
}

/**
 * Returns the Native OS DirectoryHandle if linked & permitted, or seamlessly falls back to OPFS!
 */
export async function getDirectoryOrOPFSHandle(groupName: string): Promise<FileSystemDirectoryHandle | null> {
  const native = await getDirectoryHandle(groupName);
  if (native) {
    try {
      if (typeof (native as any).queryPermission === "function") {
        const state = await (native as any).queryPermission({ mode: "readwrite" });
        if (state === "granted") return native;
      } else {
        return native;
      }
    } catch {
      // Fall back to OPFS
    }
  }
  return getOPFSRootDirectory();
}

export async function removeDirectoryHandle(groupName: string): Promise<void> {
  const db = await getDB();
  const key = groupName.toLowerCase().trim();
  await db.delete(STORE_NAME, key);
}

export async function storeFileHandle(key: string, handle: FileSystemFileHandle): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, handle, `file_${key}`);
}

export async function getFileHandle(key: string): Promise<FileSystemFileHandle | null> {
  try {
    const db = await getDB();
    const handle = await db.get(STORE_NAME, `file_${key}`);
    return handle || null;
  } catch {
    return null;
  }
}

export async function verifyPermission(fileHandle: any, readWrite: boolean): Promise<boolean> {
  if (!fileHandle) return false;
  // OPFS handles do not define `queryPermission` because origin-private handles are always granted!
  if (typeof fileHandle.queryPermission !== "function") {
    return true;
  }
  const options: any = {};
  if (readWrite) {
    options.mode = "readwrite";
  }
  if ((await fileHandle.queryPermission(options)) === "granted") {
    return true;
  }
  if (typeof fileHandle.requestPermission === "function" && (await fileHandle.requestPermission(options)) === "granted") {
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
  // Seamless Tier-2 OPFS fallback for Safari, Firefox, iPadOS, iOS, and unlinked sessions
  return getOPFSRootDirectory();
}

export async function initializeMarigoldDirectoryStructure(rootHandle: FileSystemDirectoryHandle): Promise<void> {
  if (!rootHandle) return;
  const subfolders = ["Data_Stories", "Groups", "Uploaded_Data", "Kanban_Boards", "Custom_Playbooks", ".marigold"];
  for (const sub of subfolders) {
    await rootHandle.getDirectoryHandle(sub, { create: true });
  }

  try {
    const fileHandle = await rootHandle.getFileHandle("README.md", { create: true });
    if (typeof (fileHandle as any).createWritable === "function") {
      const writable = await fileHandle.createWritable();
      const content = `# Marigold Local Workspace Directory

This folder is your local, private Marigold workspace.
All voter rolls, data stories, playbooks, and Kanban tasks are stored directly on your computer.

SUBDIRECTORIES:
- Data_Stories/: Anonymized query findings and audit reports
- Groups/: Group collaboration settings
- Uploaded_Data/: Local dataset files & shards (marigold.dataset.manifest.v1)
- Kanban_Boards/: Offline task tracking
- Custom_Playbooks/: User-defined audit playbooks
- .marigold/: Encryption keys and Data Map signatures

WARNING: Do not rename or delete this folder.
`;
      await writable.write(content);
      await writable.close();
    }
  } catch (e) {
    console.warn("Could not write root README.md:", e);
  }
}

export async function initStructuredWorkspace(rootHandle: FileSystemDirectoryHandle): Promise<void> {
  return initializeMarigoldDirectoryStructure(rootHandle);
}

/**
 * Writes a file into `subfolderName/fileName` across Triple-Tier Sovereign Storage:
 * Uses `rootHandle` if supplied, otherwise resolves Tier 1 (Native FS) -> Tier 2 (OPFS) -> Tier 3 (IndexedDB).
 */
export async function writeStructuredFile(
  rootHandle: any,
  subfolderName: string,
  fileName: string,
  content: string | Blob | Uint8Array
): Promise<boolean> {
  const targetRoot = rootHandle || (await getBestAvailableSovereignStorage()).handle;

  if (targetRoot) {
    try {
      const parts = subfolderName.split("/").filter(Boolean);
      let subDir = targetRoot;
      for (const part of parts) {
        subDir = await subDir.getDirectoryHandle(part, { create: true });
      }
      const fileHandle = await subDir.getFileHandle(fileName, { create: true });
      if (typeof fileHandle.createWritable === "function") {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      }
    } catch (err) {
      console.warn(`Could not write ${fileName} to ${subfolderName} via FS/OPFS, falling back to Tier-3 IDB:`, err);
    }
  }

  // Tier 3 Fallback: IndexedDB Virtual File System
  try {
    const db = await getDB();
    const vKey = `${subfolderName}/${fileName}`.replace(/\/+/g, "/");
    const serialized =
      content instanceof Blob
        ? await content.text()
        : content instanceof Uint8Array
        ? new TextDecoder().decode(content)
        : content;
    await db.put(VIRTUAL_FILES_STORE, serialized, vKey);
    return true;
  } catch (err) {
    console.warn(`Tier-3 IDB write failed for ${subfolderName}/${fileName}:`, err);
    return false;
  }
}

export async function readStructuredFile(
  rootHandle: any,
  subfolderName: string,
  fileName: string
): Promise<string | null> {
  const targetRoot = rootHandle || (await getBestAvailableSovereignStorage()).handle;

  if (targetRoot) {
    try {
      const parts = subfolderName.split("/").filter(Boolean);
      let subDir = targetRoot;
      for (const part of parts) {
        subDir = await subDir.getDirectoryHandle(part, { create: false });
      }
      const fileHandle = await subDir.getFileHandle(fileName, { create: false });
      const file = await fileHandle.getFile();
      return await file.text();
    } catch {
      // Check Tier-3 IndexedDB fallback
    }
  }

  try {
    const db = await getDB();
    const vKey = `${subfolderName}/${fileName}`.replace(/\/+/g, "/");
    const val = await db.get(VIRTUAL_FILES_STORE, vKey);
    return typeof val === "string" ? val : null;
  } catch {
    return null;
  }
}

export async function listStructuredSubfolderFiles(rootHandle: any, subfolderName: string): Promise<string[]> {
  const files = new Set<string>();
  const targetRoot = rootHandle || (await getBestAvailableSovereignStorage()).handle;

  if (targetRoot) {
    try {
      const parts = subfolderName.split("/").filter(Boolean);
      let subDir = targetRoot;
      for (const part of parts) {
        subDir = await subDir.getDirectoryHandle(part, { create: false });
      }
      for await (const [name, handle] of (subDir as any).entries()) {
        if (handle.kind === "file") {
          files.add(name);
        }
      }
    } catch {
      // Directory might not exist yet
    }
  }

  try {
    const db = await getDB();
    const prefix = `${subfolderName}/`.replace(/\/+/g, "/");
    const allKeys = await db.getAllKeys(VIRTUAL_FILES_STORE);
    for (const k of allKeys) {
      const ks = String(k);
      if (ks.startsWith(prefix)) {
        const rest = ks.slice(prefix.length);
        if (rest && !rest.includes("/")) {
          files.add(rest);
        }
      }
    }
  } catch {
    // Ignore IDB errors
  }

  return Array.from(files);
}
