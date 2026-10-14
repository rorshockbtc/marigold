"use client";

import React, { useState } from "react";
import { Database, Activity, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { autoLoadSyntheticDemoDataset } from "@/lib/db/dbName";

interface DataRequiredStateProps {
  title?: string;
  subtitle?: string;
}

export function DataRequiredState({
  title = "No Data Connected",
  subtitle = "You cannot explore or review data because your local files are not linked to Marigold. Connect a local file or launch the synthetic benchmark below.",
}: DataRequiredStateProps) {
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);

  const handleLoadSyntheticDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const count = await autoLoadSyntheticDemoDataset((msg) => setProgressMsg(msg));
      if (typeof window !== "undefined") {
        localStorage.setItem("marigold_active_group", "State of Roosevelt (Demo)");
        localStorage.setItem("marigold_file_connected", "true");
        localStorage.setItem("marigold_file_name", "DEMO_roosevelt_statewide_voter_roll.csv");
        localStorage.setItem("marigold_file_rows", count.toString());
        window.dispatchEvent(new CustomEvent("marigold-data-connected"));
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to load synthetic demo:", err);
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans max-w-4xl mx-auto p-8 bg-background items-center justify-center min-h-[50vh] text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-border-soft">
          <Database className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-serif text-text-header mb-3">{title}</h1>
        <p className="text-lg text-text-body max-w-lg mx-auto">{subtitle}</p>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center items-center">
        <Link href="/onboarding" className="bg-primary text-white hover:bg-primary/90 font-bold px-6 py-4 rounded-xl shadow-lg transition-all flex items-center gap-2">
          <span>Set Up Marigold Local Folder (/onboarding)</span>
        </Link>
        <Link href="/data-prep" className="bg-surface border border-border-soft text-text-header hover:bg-white font-bold px-6 py-4 rounded-xl shadow-sm transition-all flex items-center gap-2">
          <span>Stream or Upload File (/data-prep)</span>
        </Link>
        <Button
          onClick={handleLoadSyntheticDemo}
          disabled={isLoadingDemo}
          variant="secondary"
          className="font-bold px-6 py-4 rounded-xl shadow-sm transition-all flex items-center gap-2 h-auto"
        >
          {isLoadingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
          <span>{isLoadingDemo ? (progressMsg || "Loading Benchmark...") : "Load Roosevelt State Demo (1,800 Rows)"}</span>
        </Button>
      </div>
    </div>
  );
}

