"use client";

import React from 'react';
import { ArrowRight, Sparkles, FolderDown } from 'lucide-react';

interface Prompt {
  id: string;
  text: string;
  action: 'query' | 'save' | 'kanban';
}

interface GuidedCuriosityPromptsProps {
  prompts: Prompt[];
  onPromptClick: (prompt: Prompt) => void;
}

export function GuidedCuriosityPrompts({ prompts, onPromptClick }: GuidedCuriosityPromptsProps) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-border-soft">
      <h4 className="text-sm font-bold text-text-header uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Explore Further
      </h4>
      <div className="flex flex-col gap-3">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onPromptClick(prompt)}
            className="flex items-center justify-between p-4 bg-surface hover:bg-[#EAE5DC] border border-border-soft hover:border-primary rounded-xl transition-all text-left group"
          >
            <span className="text-sm font-medium text-text-body group-hover:text-text-header">
              {prompt.text}
            </span>
            {prompt.action === 'save' ? (
              <FolderDown className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
            ) : (
              <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
