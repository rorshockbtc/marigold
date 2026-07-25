"use client";

import React, { useState, useEffect } from "react";
import { MarigoldIcon } from "@/components/MarigoldIcon";
import { usePathname } from "next/navigation";

export function GlobalMariButton() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname() || "";

  // Show the button a few seconds after the user arrives, so it doesn't immediately distract them.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const openMari = () => {
    // Dispatch event to open the right panel chat
    window.dispatchEvent(
      new CustomEvent("open-mari-panel", {
        detail: {
          query: "Hi Mari, I am a bit lost. Can you help me figure out what to do next?",
          context: `User is asking for general help from the path: ${pathname}`
        }
      })
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 animate-in slide-in-from-bottom-8 duration-700 fade-in group">
      {/* Friendly Tooltip Bubble */}
      <div className="bg-card-bg border border-border-soft shadow-xl rounded-2xl rounded-br-none p-3 max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <p className="text-sm font-bold text-foreground">
          Need help? <br />
          <span className="text-primary font-normal">Click me and I&apos;ll explain in plain English!</span>
        </p>
      </div>

      <button
        onClick={openMari}
        className="bg-card-bg hover:bg-muted text-primary rounded-full p-3 shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center border border-border-soft"
        aria-label="Ask Mari for Help"
      >
        <MarigoldIcon className="w-8 h-8" />
      </button>
    </div>
  );
}
