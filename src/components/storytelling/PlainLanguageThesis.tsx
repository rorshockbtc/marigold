"use client";

import React from 'react';
import { BookOpen, FileText } from 'lucide-react';

interface PlainLanguageThesisProps {
  headline: string;
  plainText: string;
  verboseText: string;
  isVerbose: boolean;
  onToggleVerbose: (verbose: boolean) => void;
}

export function PlainLanguageThesis({
  headline,
  plainText,
  verboseText,
  isVerbose,
  onToggleVerbose,
}: PlainLanguageThesisProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-4">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-header max-w-3xl leading-tight">
          {headline}
        </h2>
        
        {/* Tone Toggles */}
        <div className="flex bg-surface border border-border rounded-lg p-1 shrink-0">
          <button
            onClick={() => onToggleVerbose(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              !isVerbose ? 'bg-white shadow-sm text-text-header' : 'text-text-body hover:text-text-header'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Plain English
          </button>
          <button
            onClick={() => onToggleVerbose(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              isVerbose ? 'bg-white shadow-sm text-text-header' : 'text-text-body hover:text-text-header'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Verbose
          </button>
        </div>
      </div>

      <div className="prose prose-stone max-w-none text-text-body leading-relaxed">
        {!isVerbose ? (
          <p className="text-lg">{plainText}</p>
        ) : (
          <div className="bg-surface p-4 rounded-xl border border-border-soft text-sm font-mono text-text-header">
            {verboseText}
          </div>
        )}
      </div>
    </div>
  );
}
