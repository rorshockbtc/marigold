import React from 'react';

export interface Citation {
  title: string;
  url: string;
  snippet: string;
}

export const CitationCard: React.FC<{ citation: Citation, index: number }> = ({ citation, index }) => {
  return (
    <a 
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#1A1A1A] border border-gray-700 p-4 rounded-lg hover:border-primary hover:shadow-[0_0_15px_rgba(226,125,96,0.2)] transition-all cursor-pointer mb-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-gray-800 text-gray-400 font-mono text-sm w-6 h-6 flex items-center justify-center rounded-full">
          {index + 1}
        </div>
        <div>
          <h4 className="text-white font-medium text-sm mb-1">{citation.title}</h4>
          <p className="text-gray-400 text-xs italic mb-2 line-clamp-2">"{citation.snippet}"</p>
          <div className="text-primary text-xs opacity-80 break-all hover:underline">
            {new URL(citation.url).hostname}
          </div>
        </div>
      </div>
    </a>
  );
};
