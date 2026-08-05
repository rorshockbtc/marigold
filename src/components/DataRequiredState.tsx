"use client";

import React, { useState } from "react";
import { Database, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MarigoldIcon } from "@/components/MarigoldIcon";
import { useCSVParser } from "@/hooks/useCSVParser";

interface DataRequiredStateProps {
  title?: string;
  subtitle?: string;
}

export function DataRequiredState({
  title = "No Data Connected",
  subtitle = "You cannot explore or review data because your local files are not linked to Marigold. Please connect a file to proceed.",
}: DataRequiredStateProps) {
  return (
    <div className="flex flex-col h-full font-sans max-w-4xl mx-auto p-8 bg-background items-center justify-center min-h-[50vh] text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <Database className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-serif text-text-header mb-3">{title}</h1>
        <p className="text-lg text-text-body max-w-lg mx-auto">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <a href="/onboarding" className="bg-primary text-white hover:bg-primary/90 font-bold px-8 py-4 rounded-xl shadow-lg transition-all flex items-center gap-2">
          <span>🚀 Set Up Marigold Local Folder (/onboarding)</span>
        </a>
        <a href="/data-prep" className="bg-surface border border-border-soft text-text-header hover:bg-white font-bold px-8 py-4 rounded-xl shadow-sm transition-all flex items-center gap-2">
          <span>📂 Stream or Upload File (/data-prep)</span>
        </a>
      </div>
    </div>
  );
}
