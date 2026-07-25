"use client";

import React, { useState } from 'react';
import { PlainLanguageThesis } from './PlainLanguageThesis';
import { ContextualVisuals } from './ContextualVisuals';
import { GuidedCuriosityPrompts } from './GuidedCuriosityPrompts';
import { useLocalFileSystem } from '@/lib/data/useLocalFileSystem';

export interface DataStoryPayload {
  id: string;
  headline: string;
  plainText: string;
  verboseText: string;
  chartData: {
    type: 'bar' | 'scatter' | 'map';
    data: any[];
    keys?: string[];
    indexBy?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
  prompts: {
    id: string;
    text: string;
    action: 'query' | 'save' | 'kanban';
  }[];
}

export function DataStoryBriefing({ story }: { story: DataStoryPayload }) {
  const [isVerbose, setIsVerbose] = useState(false);
  const { requestDirectoryAccess, saveFileSilently, isConnected } = useLocalFileSystem();

  const handlePromptClick = async (prompt: any) => {
    if (prompt.action === 'save') {
      try {
        if (!isConnected) {
          await requestDirectoryAccess();
        }
        const jsonContent = JSON.stringify(story, null, 2);
        await saveFileSilently(`story_${story.id}.mari`, jsonContent);
        alert('Story saved to your Personal Civic Library successfully!');
      } catch (err) {
        console.error('Failed to save story', err);
        alert('Failed to save the story to local disk.');
      }
    } else {
      console.log(`Executing prompt action: ${prompt.action}`, prompt.text);
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-border rounded-3xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. The Thesis */}
      <PlainLanguageThesis 
        headline={story.headline}
        plainText={story.plainText}
        verboseText={story.verboseText}
        isVerbose={isVerbose}
        onToggleVerbose={setIsVerbose}
      />

      {/* 2. The Evidence */}
      <ContextualVisuals 
        chartType={story.chartData.type}
        data={story.chartData.data}
        keys={story.chartData.keys}
        indexBy={story.chartData.indexBy}
        xAxisLabel={story.chartData.xAxisLabel}
        yAxisLabel={story.chartData.yAxisLabel}
      />

      {/* 3. Next Steps */}
      <GuidedCuriosityPrompts 
        prompts={story.prompts}
        onPromptClick={handlePromptClick}
      />
      
    </div>
  );
}
