"use client";

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Folder, CheckCircle2, ArrowRight } from 'lucide-react';
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

      setStatusMsg("⚡ Streaming saved voter files into memory...");
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
      setStatusMsg("Could not access folder. Click 'Re-Link Local Folder' below.");
    } finally {
      setIsHydrating(false);
    }
  };

  return (
    <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm my-6 font-sans space-y-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800 shrink-0">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-xl font-serif font-black text-emerald-950">
            Welcome Back to Your Local Workspace
          </h3>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Your local files are safely stored in your <strong>Marigold_Local</strong> folder. Follow these 2 simple steps to open your data engine:
          </p>
        </div>
      </div>

      {/* Step-by-Step Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Step 1: Local Folder Connected</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Marigold is connected to your local hard drive folder (<code>Marigold_Local</code>).
          </p>
          <div className="pt-2">
            <Link href="/onboarding" className="text-xs font-bold text-slate-500 hover:text-slate-800 underline flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" /> Re-Link Different Folder →
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
              <RefreshCw className={`w-4 h-4 text-emerald-700 ${isHydrating ? 'animate-spin' : ''}`} />
              <span>Step 2: Load Saved Voter Roll</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Load your saved datasets into browser memory in high-speed streaming chunks.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoHydrate}
            disabled={isHydrating}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black py-3 px-5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isHydrating ? 'animate-spin' : ''}`} />
            <span>{isHydrating ? "Loading Dataset..." : "⚡ Load Saved Files & Open Workspace →"}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-white border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2 shadow-xs">
          <RefreshCw className={`w-4 h-4 text-emerald-700 ${isHydrating ? 'animate-spin' : ''}`} />
          <span>{statusMsg}</span>
        </div>
      )}
    </div>
  );
}
