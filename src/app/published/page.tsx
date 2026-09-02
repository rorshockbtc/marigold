"use client";

import React, { useEffect, useState } from 'react';
import { ArticleViewer } from '@/components/ArticleViewer';
import { ArticleState } from '@/lib/types';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export default function PublishedStoryPage() {
  const [article, setArticle] = useState<ArticleState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('marigold_published_story');
      if (stored) {
        setArticle(JSON.parse(stored));
      } else {
        setError("No published story found. Please publish a story from the Data Explorer first.");
      }
    } catch (e) {
      setError("Failed to load published story.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-white border border-border shadow-sm rounded-full flex items-center justify-center text-rose-500 mb-6">
          <MarigoldIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-black text-text-header mb-4">Story Not Found</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <MarigoldIcon className="w-12 h-12 text-primary opacity-50 mb-4" />
          <p className="text-muted-foreground font-serif">Loading published story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <ArticleViewer 
        article={article} 
        onPublishToGroup={() => {}} 
        onSaveLocally={() => {}} 
        isPublicView={true} 
      />
    </div>
  );
}
