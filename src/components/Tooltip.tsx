"use client";

import React, { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="group relative inline-flex items-center cursor-help">
      <span className="border-b border-dashed border-muted-foreground/50">{children}</span>
      
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64 p-3 bg-secondary text-secondary-foreground text-sm rounded-lg shadow-lg">
        <div className="relative">
          {content}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-secondary"></div>
        </div>
      </div>
    </div>
  );
}
