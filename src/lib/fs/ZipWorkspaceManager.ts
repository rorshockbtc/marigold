import JSZip from 'jszip';

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

export interface WorkspaceFilesPayload {
  dataStories?: { filename: string; content: string }[];
  groups?: { filename: string; content: string }[];
  uploadedData?: { filename: string; content: string }[];
  kanbanTasks?: { filename: string; content: string }[];
  customPlaybooks?: { filename: string; content: string }[];
  keysig?: string;
}

/**
 * Generate a structured .zip file containing the standard Marigold Local folder tree
 */
export async function exportWorkspaceZip(payload: WorkspaceFilesPayload): Promise<Blob> {
  const zip = new JSZip();

  // Root README
  zip.file("README.md", ROOT_README_CONTENT);

  // Subfolders
  const dataStoriesFolder = zip.folder("Data_Stories");
  const groupsFolder = zip.folder("Groups");
  const uploadedDataFolder = zip.folder("Uploaded_Data");
  const kanbanFolder = zip.folder("Kanban_Boards");
  const playbooksFolder = zip.folder("Custom_Playbooks");
  const marigoldDotFolder = zip.folder(".marigold");

  if (payload.keysig && marigoldDotFolder) {
    marigoldDotFolder.file("workspace_keysig.enc", payload.keysig);
  }

  if (payload.dataStories && dataStoriesFolder) {
    for (const item of payload.dataStories) {
      dataStoriesFolder.file(item.filename, item.content);
    }
  }

  if (payload.groups && groupsFolder) {
    for (const item of payload.groups) {
      groupsFolder.file(item.filename, item.content);
    }
  }

  if (payload.uploadedData && uploadedDataFolder) {
    for (const item of payload.uploadedData) {
      uploadedDataFolder.file(item.filename, item.content);
    }
  }

  if (payload.kanbanTasks && kanbanFolder) {
    for (const item of payload.kanbanTasks) {
      kanbanFolder.file(item.filename, item.content);
    }
  }

  if (payload.customPlaybooks && playbooksFolder) {
    for (const item of payload.customPlaybooks) {
      playbooksFolder.file(item.filename, item.content);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Unpack a structured Marigold Local .zip backup file
 */
export async function importWorkspaceZip(zipFile: File): Promise<WorkspaceFilesPayload> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  const payload: WorkspaceFilesPayload = {
    dataStories: [],
    groups: [],
    uploadedData: [],
    kanbanTasks: [],
    customPlaybooks: [],
  };

  for (const relativePath of Object.keys(loadedZip.files)) {
    const zipEntry = loadedZip.files[relativePath];
    if (zipEntry.dir) continue;

    const content = await zipEntry.async("string");

    if (relativePath.includes(".marigold/workspace_keysig.enc")) {
      payload.keysig = content;
    } else if (relativePath.includes("Data_Stories/")) {
      const filename = relativePath.split("Data_Stories/").pop() || "story.json";
      payload.dataStories?.push({ filename, content });
    } else if (relativePath.includes("Groups/")) {
      const filename = relativePath.split("Groups/").pop() || "group.json";
      payload.groups?.push({ filename, content });
    } else if (relativePath.includes("Uploaded_Data/")) {
      const filename = relativePath.split("Uploaded_Data/").pop() || "data.json";
      payload.uploadedData?.push({ filename, content });
    } else if (relativePath.includes("Kanban_Boards/")) {
      const filename = relativePath.split("Kanban_Boards/").pop() || "tasks.json";
      payload.kanbanTasks?.push({ filename, content });
    } else if (relativePath.includes("Custom_Playbooks/")) {
      const filename = relativePath.split("Custom_Playbooks/").pop() || "playbook.json";
      payload.customPlaybooks?.push({ filename, content });
    }
  }

  return payload;
}
