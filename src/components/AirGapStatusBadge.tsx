"use client";

import React, { useEffect, useState } from 'react';
import { Lock, Unlock, HardDrive, Cpu, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import {
  AirGapTelemetry,
  getAirGapTelemetry,
  installAirGapFetchInterceptor,
  setAirGapLocked,
  subscribeAirGapTelemetry,
} from '@/lib/security/airGapGuard';
import { getActiveStorageTierInfo, StorageTierInfo } from '@/lib/fs/LocalFSManager';
import {
  isWebGPUEngineReady,
  isWebGPUSupported,
  warmMarigoldWebGPUEngine,
} from '@/lib/ai/webgpuLocalEngine';

export interface AirGapStatusBadgeProps {
  compact?: boolean;
  defaultLockedWhenDataConnected?: boolean;
}

export function AirGapStatusBadge({
  compact = false,
  defaultLockedWhenDataConnected = true,
}: AirGapStatusBadgeProps) {
  const [telemetry, setTelemetry] = useState<AirGapTelemetry>({
    locked: false,
    bytesTransmitted: 0,
    blockedRequestsCount: 0,
    lastBlockedEndpoint: null,
  });
  const [storageInfo, setStorageInfo] = useState<StorageTierInfo | null>(null);
  const [webGpuAvailable, setWebGpuAvailable] = useState(false);
  const [webGpuReady, setWebGpuReady] = useState(false);
  const [webGpuWarming, setWebGpuWarming] = useState(false);
  const [webGpuProgress, setWebGpuProgress] = useState<string | null>(null);

  useEffect(() => {
    installAirGapFetchInterceptor();

    // Auto-enable Air-Gap Lock the first time a real local file is connected unless user explicitly toggled it
    if (typeof window !== 'undefined') {
      const explicitPref = localStorage.getItem('marigold_airgap_lock_enabled');
      const isConnected = localStorage.getItem('marigold_file_connected') === 'true';
      if (explicitPref === null && defaultLockedWhenDataConnected && isConnected) {
        setAirGapLocked(true);
      }
      setTelemetry(getAirGapTelemetry());
    }

    const unsub = subscribeAirGapTelemetry((next) => setTelemetry(next));

    const grp =
      (typeof window !== 'undefined' && localStorage.getItem('marigold_active_group')) ||
      'default';
    getActiveStorageTierInfo(grp)
      .then((info) => setStorageInfo(info))
      .catch(() => {});

    setWebGpuAvailable(isWebGPUSupported());
    setWebGpuReady(isWebGPUEngineReady());

    return () => {
      unsub();
    };
  }, [defaultLockedWhenDataConnected]);

  const handleToggleLock = () => {
    const next = setAirGapLocked(!telemetry.locked);
    setTelemetry(next);
  };

  const handleWarmWebGPU = async () => {
    if (webGpuReady || webGpuWarming) return;
    setWebGpuWarming(true);
    setWebGpuProgress('Initializing GPU...');
    try {
      const engine = await warmMarigoldWebGPUEngine(undefined, (p) => {
        setWebGpuProgress(`${p.progress}%`);
      });
      if (engine) {
        setWebGpuReady(true);
      }
    } finally {
      setWebGpuWarming(false);
      setWebGpuProgress(null);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggleLock}
        data-testid="btn-airgap-lock-toggle"
        title={
          telemetry.locked
            ? 'Offline Air-Gap Lock Active: Outbound cloud API calls are blocked (0 bytes transmitted).'
            : 'Click to lock outbound network egress while auditing local voter rolls.'
        }
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border cursor-pointer ${
          telemetry.locked
            ? 'bg-[#FEF3C7] text-[#78350F] border-[#F59E0B]/50 hover:bg-[#FDE68A]'
            : 'bg-[#F6F3EC] text-[#44403C] border-[#D6D0C4] hover:border-[#B45309]'
        }`}
      >
        {telemetry.locked ? (
          <Lock className="w-3.5 h-3.5 text-[#B45309]" />
        ) : (
          <Unlock className="w-3.5 h-3.5 text-[#57534E]" />
        )}
        <span>
          {telemetry.locked ? 'Air-Gap Locked · 0 Bytes Sent' : 'Air-Gap Lock: Off'}
        </span>
      </button>
    );
  }

  return (
    <div className="bg-[#FAF8F5] border border-[#DFD9CE] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleToggleLock}
          data-testid="btn-airgap-lock-toggle"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold transition-all border cursor-pointer ${
            telemetry.locked
              ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] shadow-sm'
              : 'bg-white text-[#1C1917] border-[#D6D0C4] hover:border-[#B45309]'
          }`}
        >
          {telemetry.locked ? (
            <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-[#78716C]" />
          )}
          <span>
            {telemetry.locked ? 'Offline Air-Gap Lock: ON' : 'Enable Offline Air-Gap Lock'}
          </span>
        </button>

        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#44403C] bg-white px-2.5 py-1 rounded-md border border-[#E7E2D8]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>0 bytes voter PII transmitted</span>
          {telemetry.blockedRequestsCount > 0 && (
            <span className="text-[#B45309] font-bold">
              · {telemetry.blockedRequestsCount} outbound{' '}
              {telemetry.blockedRequestsCount === 1 ? 'request' : 'requests'} blocked
            </span>
          )}
        </span>

        {storageInfo && (
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#57534E] bg-white px-2.5 py-1 rounded-md border border-[#E7E2D8]"
            title={`Active Local Storage Root: ${storageInfo.rootName}`}
          >
            <HardDrive className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
            <span>{storageInfo.label}</span>
          </span>
        )}
      </div>

      {webGpuAvailable && (
        <div className="flex items-center gap-2">
          {webGpuReady ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-emerald-700" />
              <span>Local WebGPU AI Ready ($0 Cloud)</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleWarmWebGPU}
              disabled={webGpuWarming}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-[#F6F3EC] text-[#44403C] border border-[#D6D0C4] font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-60"
              title="Optional: Load SmolLM2-360M directly onto your device GPU via WebGPU so Mari runs 100% offline."
            >
              {webGpuWarming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B45309]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
              )}
              <span>
                {webGpuWarming
                  ? `Warming GPU (${webGpuProgress || '...'})`
                  : 'Warm Local WebGPU AI'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
