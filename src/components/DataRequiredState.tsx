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
  const { parseFile, state } = useCSVParser();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleRunDemo = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/demo-dataset');
      const blob = await res.blob();
      const file = new File([blob], 'Roosevelt_Demo_Data.csv', { type: 'text/csv' });
      await parseFile(file);
      
      localStorage.setItem("marigold_active_group", "State of Roosevelt (Demo)");
      localStorage.setItem("marigold_file_connected", "true");
      localStorage.setItem("marigold_file_name", "Roosevelt_Demo_Data.csv");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to load demo data.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-4xl mx-auto p-8 bg-background">
      <div className="mb-12 mt-8">
        <h1 className="text-4xl font-serif text-text-header mb-3">{title}</h1>
        <p className="text-lg text-text-body">{subtitle}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a href="/onboarding" className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all group hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-header mb-1 group-hover:text-primary">Link Dataset</h3>
            <p className="text-xs text-text-body">Upload your file to the encrypted local engine.</p>
          </div>
        </a>
        <Button 
          disabled={isDownloading || state.isProcessing}
          onClick={handleRunDemo} 
          className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all group hover:-translate-y-1 text-left h-auto relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
            {(isDownloading || state.isProcessing) ? <Loader2 className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6" />}
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-text-header mb-1 group-hover:text-primary">
              {(isDownloading || state.isProcessing) ? "Initializing Engine..." : "Run Demo File"}
            </h3>
            <p className="text-xs text-text-body">
              {state.isProcessing ? `Encrypting and indexing records (${state.progress}%)... Please wait.` : "Use the built-in demo data to test the platform."}
            </p>
          </div>
          {state.isProcessing && (
            <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${state.progress}%` }} />
          )}
        </Button>
        <Button onClick={() => {
          window.dispatchEvent(new Event('open-mari-panel'));
        }} className="bg-white border-2 border-border hover:border-primary p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all group hover:-translate-y-1 text-left h-auto">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 text-text-body group-hover:text-primary group-hover:bg-albers-green-soft">
            <MarigoldIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-header mb-1 group-hover:text-primary">Ask Mari for Help</h3>
            <p className="text-xs text-text-body">Get guidance on data formats and onboarding.</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
