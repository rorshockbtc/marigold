import { useState, useCallback } from 'react';
import { getDirectoryHandle, verifyPermission } from '@/lib/fs/LocalFSManager';
import { ChatSession } from '@/lib/types';

export function useDataStoryFS() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDataStory = useCallback(async (session: ChatSession) => {
    setIsSaving(true);
    setError(null);
    try {
      const activeGroup = (localStorage.getItem("marigold_active_group") || "default").toLowerCase();
      const rootDirHandle = await getDirectoryHandle(activeGroup);
      
      if (!rootDirHandle) {
        throw new Error("No Marigold Local folder linked. Please link a folder first.");
      }

      const hasPerm = await verifyPermission(rootDirHandle, true);
      if (!hasPerm) {
        throw new Error("Permission denied to write to Marigold Local folder.");
      }

      // Find the most recent dataset subfolder (same logic as useCSVHydrate)
      let latestSubDir: any = null;
      let latestName = "";
      
      for await (const entry of (rootDirHandle as any).values()) {
        if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
          if (entry.name > latestName) {
            latestName = entry.name;
            latestSubDir = entry;
          }
        }
      }

      if (!latestSubDir) {
        // If no subfolder, create a generic one or use root
        latestSubDir = rootDirHandle;
      }

      // Create or get Data_Stories directory
      const storiesDirHandle = await latestSubDir.getDirectoryHandle('Data_Stories', { create: true });
      
      // Sanitize title for filename
      const safeTitle = (session.title || "Untitled").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `story_${safeTitle}_${session.id}.json`;

      const fileHandle = await storiesDirHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(session, null, 2));
      await writable.close();

      setIsSaving(false);
      return filename;
    } catch (err: any) {
      console.error("Failed to save Data Story:", err);
      setError(err.message || "Failed to save to local disk.");
      setIsSaving(false);
      throw err;
    }
  }, []);

  return { saveDataStory, isSaving, error };
}
