"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { DataStory } from "@/hooks/useDataConcierge";
import { BarChart3, ShieldCheck, Share2, Save, Check, ExternalLink, Sparkles, AlertCircle } from "lucide-react";

interface DataStoryCanvasProps {
  story: DataStory;
  onPublishToGroup: (story: DataStory) => void;
  onSaveLocally: (story: DataStory) => void;
}

export function DataStoryCanvas({ story, onPublishToGroup, onSaveLocally }: DataStoryCanvasProps) {
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = () => {
    onPublishToGroup(story);
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 3000);
  };

  const maxValueA = Math.max(...story.dataPoints.map((d) => d.valueA), 1);
  const maxValueB = Math.max(...story.dataPoints.map((d) => d.valueB), 1);

  return (
    <div className="bg-white border border-border-soft rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" /> Data Story Canvas
            </span>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              Source: <Link href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-text-header flex items-center gap-0.5">{story.sourceName} <ExternalLink className="w-3 h-3 inline" /></Link>
            </span>
          </div>
          <h2 className="text-2xl font-serif text-text-header font-bold">{story.title}</h2>
          <p className="text-xs text-text-body leading-relaxed max-w-3xl">{story.summary}</p>
        </div>

        <div className="flex flex-col items-end justify-center bg-surface border border-border-soft p-4 rounded-xl shrink-0 font-mono text-center">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Statistical Correlation</span>
          <span className="text-2xl font-bold text-emerald-600 mt-0.5">
            {story.correlationScore > 0 ? `+${story.correlationScore}` : story.correlationScore}
          </span>
          <span className="text-[10px] text-text-body">High Significance</span>
        </div>
      </div>

      {/* Interactive Bar/Scatter Visualizer */}
      {story.dataPoints.length > 0 && (
        <div className="bg-surface p-5 rounded-xl border border-border-soft space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-header uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Cross-Variable Comparison Matrix
            </h4>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary block" /> Variable A</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 block" /> Variable B</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {story.dataPoints.map((pt, idx) => {
              const pctA = Math.round((pt.valueA / maxValueA) * 100);
              const pctB = Math.round((pt.valueB / maxValueB) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-text-header">
                    <span>{pt.label}</span>
                    <span className="font-mono text-muted-foreground text-[10px]">
                      Val A: {pt.valueA} | Val B: {pt.valueB}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-border-soft rounded-lg h-3 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-primary to-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${pctA}%` }} />
                    </div>
                    <div className="bg-white border border-border-soft rounded-lg h-3 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-out" style={{ width: `${pctB}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      {story.insights && story.insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-header uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Key Analytic Takeaways
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {story.insights.map((insight, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface border border-border-soft text-xs text-text-body flex items-start gap-2">
                <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-soft">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero-PII & Scrubbed Geographic Encryption Enforced</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => onSaveLocally(story)}
            variant={story.isSavedLocally ? "secondary" : "outline"}
            className="flex items-center gap-2"
          >
            {story.isSavedLocally ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            {story.isSavedLocally ? "Saved to Marigold Local" : "Save Story to Local Folder"}
          </Button>

          <Button
            onClick={handlePublish}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {isPublished ? "Published to Group!" : "Publish Story to Group"}
          </Button>
        </div>
      </div>
    </div>
  );
}
