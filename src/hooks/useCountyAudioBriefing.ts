"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CountyAudioBriefingInput {
  county: string;
  stateName: string;
  authorityLabel: string;
  total: number;
  active?: number;
  inactive?: number;
  priorityScore: number;
  cleanlinessScore: number;
  statusLabel: string;
  highDensityCount: number;
  highDensityVoters: number;
  ncoaCount: number;
  duplicateCount: number;
  overCapacityPrecincts: number;
  splitPrecincts?: number;
  inactiveVotedRecent?: number;
}

/**
 * Builds a ~90-second (~200 word) non-partisan spoken executive briefing
 * adhering strictly to Marigold's Zero-PII and explicit-noun standards.
 */
export function buildCountySpokenScript(input: CountyAudioBriefingInput): string {
  const fmt = (n: number) => Math.round(n).toLocaleString();
  const activePart =
    typeof input.active === "number" && typeof input.inactive === "number"
      ? `, including ${fmt(input.active)} active voters and ${fmt(input.inactive)} inactive voters`
      : "";

  const splitText =
    typeof input.splitPrecincts === "number" && input.splitPrecincts > 0
      ? ` Second, audit GIS street-range ballot styles across ${fmt(input.splitPrecincts)} split legislative precincts.`
      : "";

  const voterProtText =
    typeof input.inactiveVotedRecent === "number" && input.inactiveVotedRecent > 0
      ? `First, for voter protection, verify why ${fmt(input.inactiveVotedRecent)} voters with recent 2024 to 2026 ballots are marked inactive so eligible voters do not face pollbook delays.`
      : `First, confirm voter status synchronization for active pollbooks ahead of election day.`;

  return [
    `Marigold 90-second county briefing for ${input.county} County, ${input.stateName}.`,
    `${input.county} County has ${fmt(input.total)} total registered voters${activePart}.`,
    `Its overall roll cleanliness score is ${input.cleanlinessScore} out of 100, with a priority review score of ${input.priorityScore.toFixed(1)} out of 100, status: ${input.statusLabel}.`,
    `Here are the focused non-partisan priorities for your ${input.authorityLabel}.`,
    `${voterProtText}${splitText}`,
    `Next, for list maintenance and precinct operations, review ${fmt(input.highDensityCount)} high-density addresses covering ${fmt(input.highDensityVoters)} voters, process federal NVRA confirmation notices for ${fmt(input.ncoaCount)} active out-of-state mailings, reconcile ${fmt(input.duplicateCount)} same-ZIP duplicate name pairs, and evaluate ${fmt(input.overCapacityPrecincts)} polling precincts exceeding 3,000 voters.`,
    `Zero voter names, dates of birth, or street house numbers appear in this briefing. All analysis ran privately in your browser.`,
  ].join(" ");
}

/**
 * 100% Air-Gap-safe offline Web Speech Audio Briefing hook (no text leaves the browser).
 */
export function useCountyAudioBriefing() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveKey(null);
    setElapsedSeconds(0);
  }, []);

  const play = useCallback(
    (input: CountyAudioBriefingInput, key?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const targetKey = key || input.county;
      if (isPlaying && activeKey === targetKey) {
        stop();
        return;
      }

      stop();
      const script = buildCountySpokenScript(input);
      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 0.96;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = ["Ava", "Samantha", "Alex", "Google US English", "Daniel", "Karen"];
      const picked =
        voices.find((v) => preferred.includes(v.name)) ||
        voices.find((v) => v.lang.startsWith("en") && !v.name.toLowerCase().includes("compact"));
      if (picked) utterance.voice = picked;

      utterance.onend = () => stop();
      utterance.onerror = () => stop();

      setActiveKey(targetKey);
      setIsPlaying(true);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      window.speechSynthesis.speak(utterance);
    },
    [activeKey, isPlaying, stop]
  );

  return {
    play,
    stop,
    isPlaying,
    activeKey,
    elapsedSeconds,
    isSupported,
  };
}
