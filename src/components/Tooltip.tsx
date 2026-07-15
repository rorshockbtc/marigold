"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  readMoreUrl?: string;
  readMoreSlug?: string;
}

export function Tooltip({ children, content, readMoreUrl, readMoreSlug }: TooltipProps) {
  const targetUrl = readMoreUrl || (readMoreSlug ? `/learning-center#${readMoreSlug}` : null);

  return (
    <div className="group relative inline-flex items-center cursor-help">
      <span className="border-b border-dashed border-muted-foreground/50">{children}</span>
      
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-3 bg-secondary text-secondary-foreground text-sm rounded-lg shadow-lg">
        <div className="relative space-y-2">
          <div>{content}</div>
          {targetUrl && (
            <div className="pt-2 border-t border-border/40 flex justify-end">
              <Link
                href={targetUrl}
                className="text-primary hover:underline font-bold text-xs flex items-center gap-1"
              >
                <span>📖 Read More in Learning Center →</span>
              </Link>
            </div>
          )}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-secondary"></div>
        </div>
      </div>
    </div>
  );
}
