"use client";

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Folder, Database } from 'lucide-react';
import Link from 'next/link';
import { getDirectoryHandle, storeDirectoryHandle, verifyPermission } from '@/lib/fs/LocalFSManager';
import { LocalFSHydrator } from '@/lib/fs/LocalFSHydrator';

interface DeviceSecurityNoticeProps {
  onSwitchToDemo?: () => void;
}

export function DeviceSecurityNotice({ onSwitchToDemo }: DeviceSecurityNoticeProps) {
  const [isHydrating, setIsHydrating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleAutoHydrate = async () => {
    if (typeof window === "undefined") return;
    const grp = localStorage.getItem("marigold_active_group") || "default";

    setIsHydrating(true);
    setStatusMsg("⚡ Accessing Marigold_Local folder...");

    try {
      let dirHandle = await getDirectoryHandle(grp.toLowerCase());

      // If no stored handle exists or permission is needed, trigger folder picker directly
      if (!dirHandle || !(await verifyPermission(dirHandle, false))) {
        if ('showDirectoryPicker' in window) {
          try {
            dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
            if (dirHandle) {
              await storeDirectoryHandle(grp.toLowerCase(), dirHandle);
              await storeDirectoryHandle("default", dirHandle);
            }
          } catch (pickerErr: any) {
            if (pickerErr.name === 'AbortError') {
              setIsHydrating(false);
              setStatusMsg("");
              return;
            }
          }
        }
      }

      if (!dirHandle) {
        setStatusMsg("Please select your Marigold_Local folder to continue.");
        setIsHydrating(false);
        return;
      }

      setStatusMsg("⚡ Loading your saved voter files into memory...");
      const rows = await LocalFSHydrator.hydrateFromLocalFolder(dirHandle, (msg) => setStatusMsg(msg));
      
      if (rows > 0) {
        setStatusMsg(`✅ Successfully loaded ${rows.toLocaleString()} records! Opening Workspace...`);
        setTimeout(() => {
          window.location.href = "/explore";
        }, 800);
      } else {
        setStatusMsg("No saved datasets found in Uploaded_Data. Opening Data Prep...");
        setTimeout(() => {
          window.location.href = "/data-prep";
        }, 1200);
      }
    } catch (err) {
      console.error("Auto-hydration error:", err);
      setStatusMsg("Could not access folder. Click 'Re-Link Local Folder' to re-select your Marigold_Local directory.");
    } finally {
      setIsHydrating(false);
    }
  };

  return (
    <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm my-6 font-sans">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-lg font-serif font-bold text-emerald-950">
              Welcome Back to Your Local Workspace
            </h3>
            <p className="text-sm text-emerald-900 mt-1 leading-relaxed">
              Your local files are safely stored on your computer inside your <strong>Marigold_Local</strong> folder. Click <strong>Load Saved Files</strong> below to load your voter records into memory in &lt; 2 seconds without re-uploading raw files.
            </p>
          </div>

          {statusMsg && (
            <div className="p-3 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold animate-in fade-in">
              {statusMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Option 1: Load Saved Files */}
            <button
              type="button"
              onClick={handleAutoHydrate}
              disabled={isHydrating}
              className="text-left bg-white border border-emerald-300 hover:border-emerald-500 p-4 rounded-xl shadow-sm transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 mb-1">
                  <RefreshCw className={`w-4 h-4 text-emerald-700 ${isHydrating ? 'animate-spin' : ''}`} />
                  Load Saved Files
                </div>
                <p className="text-xs text-emerald-800">
                  Load saved voter records from your PC in &lt; 2 seconds.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 underline mt-3 block">⚡ Load Saved Files →</span>
            </button>

            {/* Option 2: Link / Upload */}
            <Link href="/onboarding" className="block">
              <div className="bg-white border border-slate-200 hover:border-slate-400 p-4 rounded-xl shadow-xs transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                    <Folder className="w-4 h-4 text-slate-700" />
                    Re-Link Local Folder
                  </div>
                  <p className="text-xs text-slate-600">
                    Confirm Marigold_Local folder location or update directory.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-800 underline mt-3 block">Link Folder →</span>
              </div>
            </Link>

            {/* Option 3: Switch to Roosevelt Demo */}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToDemo) {
                  onSwitchToDemo();
                } else if (typeof window !== "undefined") {
                  localStorage.setItem("marigold_active_group", "State of Roosevelt (Demo)");
                  window.dispatchEvent(new CustomEvent("marigold-group-change", { detail: { group: "State of Roosevelt (Demo)" } }));
                  window.location.reload();
                }
              }}
              className="text-left bg-white border border-slate-200 hover:border-slate-400 p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <Database className="w-4 h-4 text-slate-700" />
                  Use Demo Mode
                </div>
                <p className="text-xs text-slate-600">
                  Switch to the synthetic State of Roosevelt demonstration dataset.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-800 underline mt-3 block">Load Demo →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
