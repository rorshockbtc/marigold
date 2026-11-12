"use client";

import React from "react";
import { Volume2, Square } from "lucide-react";
import {
  CountyAudioBriefingInput,
  useCountyAudioBriefing,
} from "@/hooks/useCountyAudioBriefing";

export function CountyAudioBriefingButton({
  briefingInput,
  variant = "outline",
}: {
  briefingInput: CountyAudioBriefingInput;
  variant?: "outline" | "dark";
}) {
  const { play, stop, isPlaying, activeKey, elapsedSeconds, isSupported } =
    useCountyAudioBriefing();
  const key = briefingInput.county;
  const activeHere = isPlaying && activeKey === key;

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${String(rem).padStart(2, "0")}`;
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={() => (activeHere ? stop() : play(briefingInput, key))}
      className={
        variant === "dark"
          ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] px-4 text-sm font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
          : "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#1C1917]/25 bg-[#FAF8F5] hover:bg-[#FEF3C7]/60 text-[#1C1917] px-4 text-sm font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
      }
      title="Plays a 90-second non-partisan audio briefing locally using browser speech synthesis (100% offline, Zero-PII)"
    >
      {activeHere ? (
        <>
          <Square className="h-3.5 w-3.5 fill-current text-[#B45309]" />
          <span>Stop Briefing ({formatSecs(elapsedSeconds)})</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 text-[#B45309]" />
          <span>90s Audio Briefing</span>
        </>
      )}
    </button>
  );
}
