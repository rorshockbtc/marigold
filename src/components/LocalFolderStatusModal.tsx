"use client";

import React, { useState, useEffect } from "react";
import { Folder, Download, Upload, CheckCircle2, Shield, X, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getDirectoryHandle, listStructuredSubfolderFiles } from "@/lib/fs/LocalFSManager";
import { exportWorkspaceZip, importWorkspaceZip } from "@/lib/fs/ZipWorkspaceManager";

interface LocalFolderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocalFolderStatusModal({ isOpen, onClose }: LocalFolderStatusModalProps) {
  const [folderName, setFolderName] = useState<string | null>(null);
  const [subfolderCounts, setSubfolderCounts] = useState<{ [key: string]: number }>({});
  const [isExporting, setIsExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const loadFolderStats = async () => {
    if (typeof window === "undefined") return;
    const grp = localStorage.getItem("marigold_active_group") || "default";
    const dirHandle = await getDirectoryHandle(grp.toLowerCase());

    if (dirHandle) {
      setFolderName(dirHandle.name);
      const stories = await listStructuredSubfolderFiles(dirHandle, "Data_Stories");
      const groups = await listStructuredSubfolderFiles(dirHandle, "Groups");
      const data = await listStructuredSubfolderFiles(dirHandle, "Uploaded_Data");
      const kanban = await listStructuredSubfolderFiles(dirHandle, "Kanban_Boards");
      const playbooks = await listStructuredSubfolderFiles(dirHandle, "Custom_Playbooks");

      setSubfolderCounts({
        Data_Stories: stories.length,
        Groups: groups.length,
        Uploaded_Data: data.length,
        Kanban_Boards: kanban.length,
        Custom_Playbooks: playbooks.length
      });
    } else {
      setFolderName(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFolderStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportZip = async () => {
    setIsExporting(true);
    setStatusMsg("Building structured .ZIP package...");
    try {
      const kanbanRaw = localStorage.getItem("marigold_kanban_cards");
      const zipBlob = await exportWorkspaceZip({
        kanbanTasks: kanbanRaw ? [{ filename: "kanban-tasks.json", content: kanbanRaw }] : [],
        keysig: localStorage.getItem("marigold_keysig") || undefined
      });

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const filename = `Marigold_Local_Workspace_${dateStr}.zip`;

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatusMsg(`Exported ${filename} cleanly!`);
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e) {
      console.error(e);
      setStatusMsg("ZIP export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setStatusMsg(`Unpacking ${file.name}...`);
      try {
        const payload = await importWorkspaceZip(file);
        if (payload.kanbanTasks && payload.kanbanTasks.length > 0) {
          localStorage.setItem("marigold_kanban_cards", payload.kanbanTasks[0].content);
        }
        setStatusMsg("Restored workspace from ZIP successfully!");
        loadFolderStats();
        setTimeout(() => setStatusMsg(""), 3000);
      } catch (err) {
        console.error(err);
        setStatusMsg("Failed to unpack ZIP file.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Folder className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-serif text-slate-900">Marigold Local Folder Manager</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Status Badge */}
        <div className="bg-surface p-5 rounded-2xl border border-border-soft space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-text-body font-bold">
              Active Hard Drive Connection
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${folderName ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {folderName ? `Linked: ${folderName}` : "No Local Folder Linked"}
            </span>
          </div>

          <p className="text-xs text-text-body leading-relaxed">
            {folderName 
              ? "Your browser is linked directly to your hard drive folder. Files are saved into standard subdirectories with zero duplicate prompt popups."
              : "No hard drive folder is currently linked. You can link a local folder or download a structured .ZIP backup package."}
          </p>
        </div>

        {/* Subfolder Breakdown */}
        {folderName && (
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Structured Subdirectory Status
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">📁 Data_Stories/</span>
                <span className="font-bold text-slate-900">{subfolderCounts.Data_Stories || 0} files</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">📁 Groups/</span>
                <span className="font-bold text-slate-900">{subfolderCounts.Groups || 0} files</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">📁 Uploaded_Data/</span>
                <span className="font-bold text-slate-900">{subfolderCounts.Uploaded_Data || 0} files</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-600">📁 Kanban_Boards/</span>
                <span className="font-bold text-slate-900">{subfolderCounts.Kanban_Boards || 0} files</span>
              </div>
            </div>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold animate-in fade-in">
            {statusMsg}
          </div>
        )}

        {/* Action Handles */}
        <div className="border-t border-slate-200 pt-5 flex flex-wrap gap-3">
          <Button
            onClick={handleExportZip}
            disabled={isExporting}
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2 text-xs py-3"
          >
            <Download className="w-4 h-4" />
            <span>Export Structured ZIP Backup</span>
          </Button>

          <label className="flex-1">
            <input type="file" accept=".zip" className="hidden" onChange={handleImportZip} />
            <span className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Restore From ZIP</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
