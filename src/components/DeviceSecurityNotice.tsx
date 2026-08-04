"use client";

import React from 'react';
import { ShieldAlert, RefreshCw, Sparkles, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface DeviceSecurityNoticeProps {
  onSwitchToDemo?: () => void;
}

export function DeviceSecurityNotice({ onSwitchToDemo }: DeviceSecurityNoticeProps) {
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm my-6 font-sans">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-800 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-950">
              Different Device Detected — Marigold Local Missing
            </h3>
            <p className="text-sm text-amber-900 mt-1 leading-relaxed">
              Marigold Local is machine-scoped for maximum privacy. Because your local encryption keys and dataset files reside on your primary computer, encrypted team intel and PC-local rolls cannot be accessed on this device without your local files.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Option 1: Re-link data */}
            <Link href="/data-prep" className="block">
              <div className="bg-white border border-amber-200 hover:border-amber-400 p-4 rounded-xl shadow-xs transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                    <RefreshCw className="w-4 h-4 text-amber-700" />
                    Re-Link Local Data
                  </div>
                  <p className="text-xs text-amber-800">
                    Connect or upload your local voter roll file on this machine.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-900 underline mt-3 block">Link Files →</span>
              </div>
            </Link>

            {/* Option 2: Switch to Roosevelt Demo */}
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
              className="text-left bg-white border border-amber-200 hover:border-amber-400 p-4 rounded-xl shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                  <Database className="w-4 h-4 text-amber-700" />
                  Use Demo Mode
                </div>
                <p className="text-xs text-amber-800">
                  Switch to the synthetic State of Roosevelt dataset for demonstrations.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-900 underline mt-3 block">Load Demo →</span>
            </button>

            {/* Option 3: General Mari Chat */}
            <Link href="/insights" className="block">
              <div className="bg-white border border-amber-200 hover:border-amber-400 p-4 rounded-xl shadow-xs transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Ask Mari
                  </div>
                  <p className="text-xs text-amber-800">
                    Chat about general civic topics or web research without local PC files.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-900 underline mt-3 block">Open Chat →</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
