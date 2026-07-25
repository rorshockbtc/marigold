"use client";

import { useState, useCallback } from 'react';

/**
 * useLocalFileSystem.ts
 * 
 * Provides a hook to interact with the modern HTML5 File System Access API.
 * This allows Marigold to silently read/write .mari and CSV files to the user's
 * local 'Marigold Local/Data Stories' directory once they grant permission, 
 * removing the need for annoying download prompts.
 */
export function useLocalFileSystem() {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  /**
   * Prompts the user to select their 'Marigold Local/Data Stories' folder.
   * Grants persistent read/write access for the session.
   */
  const requestDirectoryAccess = useCallback(async () => {
    try {
      // Show directory picker
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });
      setDirectoryHandle(dirHandle);
      console.log(`Directory selected: ${dirHandle.name}`);
      return dirHandle;
    } catch (err) {
      console.error("User aborted directory picker or it is unsupported:", err);
      return null;
    }
  }, []);

  /**
   * Silently saves a JSON string to a file in the connected directory.
   */
  const saveFileSilently = useCallback(async (fileName: string, content: string) => {
    if (!directoryHandle) {
      throw new Error("No directory connected. Call requestDirectoryAccess first.");
    }
    try {
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await (fileHandle as any).createWritable();
      await writable.write(content);
      await writable.close();
      console.log(`Saved ${fileName} silently.`);
    } catch (err) {
      console.error(`Failed to save ${fileName}:`, err);
      throw err;
    }
  }, [directoryHandle]);

  /**
   * Reads a file from the connected directory.
   */
  const readFileSilently = useCallback(async (fileName: string): Promise<string | null> => {
    if (!directoryHandle) {
      throw new Error("No directory connected. Call requestDirectoryAccess first.");
    }
    try {
      const fileHandle = await directoryHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (err) {
      console.error(`Failed to read ${fileName}:`, err);
      return null;
    }
  }, [directoryHandle]);

  return {
    directoryHandle,
    requestDirectoryAccess,
    saveFileSilently,
    readFileSilently,
    isConnected: !!directoryHandle,
  };
}
