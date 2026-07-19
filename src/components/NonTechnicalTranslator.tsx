"use client";

import React, { useState } from "react";
import { Sparkles, FileText, ArrowRight } from "lucide-react";

interface NonTechnicalTranslatorProps {
  title: string;
  technicalContent: React.ReactNode;
  eli5Content: React.ReactNode;
  mariContextPrompt?: string;
}

export function NonTechnicalTranslator({ 
  title, 
  technicalContent, 
  eli5Content,
  mariContextPrompt 
}: NonTechnicalTranslatorProps) {
  const [isTranslated, setIsTranslated] = useState(false);

  const handleToggle = () => {
    const newState = !isTranslated;
    setIsTranslated(newState);

    if (newState) {
      // Open Mari Side Panel
      window.dispatchEvent(new CustomEvent('open-mari-panel'));
      
      // Auto-fill query context if provided
      const promptToSend = mariContextPrompt || `I just read the non-technical translation for "${title}". Can you explain it a bit more?`;
      
      // Small delay to ensure Mari panel is mounted/open before setting query
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mari-set-query', {
          detail: { query: promptToSend }
        }));
      }, 100);
    }
  };

  return (
    <div className="relative group rounded-2xl border transition-colors duration-300 overflow-hidden mt-8 mb-12 shadow-sm 
      ${isTranslated ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}">
      
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b 
        ${isTranslated ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
        
        <h3 className="text-xl font-bold font-serif text-slate-900 m-0 leading-none">
          {title}
        </h3>

        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95
            ${isTranslated 
              ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100' 
              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'}`}
        >
          {isTranslated ? (
            <>
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Show Technical Version</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Translate for Non-Technical</span>
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="prose prose-slate prose-emerald max-w-none">
          {isTranslated ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-700" />
                Plain English Explanation
              </div>
              {eli5Content}
              
              <div className="mt-8 pt-6 border-t border-amber-200 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
                <div className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">Still confusing?</span> Mari AI has been alerted and is ready to help explain it further.
                </div>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-mari-panel'))}
                  className="text-amber-700 hover:text-amber-900 font-bold text-sm flex items-center gap-1"
                >
                  Talk to Mari <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {technicalContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
