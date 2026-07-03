"use client";

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function MariRightPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-mari-panel', handleOpen);
    return () => window.removeEventListener('open-mari-panel', handleOpen);
  }, []);

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#D96B27] hover:bg-[#C85A1B] text-white font-black px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border-2 border-white"
          title="Open Mari AI Assistant in Side Panel"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm tracking-wide">Ask Mari AI</span>
        </button>
      )}

      {/* Right Slide-Over Backdrop and Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg md:max-w-xl h-full bg-[#FAF8F5] border-l border-[#E5E0D8] shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#F0ECE3] border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D96B27]/20 border border-[#D96B27]/40 text-[#D96B27] flex items-center justify-center font-bold text-xl shadow-inner">
                  🌼
                </div>
                <div>
                  <h3 className="font-black text-[#2D3142] text-base leading-tight">Mari AI Guidance Co-Pilot</h3>
                  <p className="text-[11px] text-[#646A7A] font-mono mt-0.5">100% Local Browser Memory • Non-Partisan Guide</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg text-[#646A7A] hover:text-[#2D3142] hover:bg-[#E5E0D8]/60 font-bold text-lg flex items-center justify-center transition-colors"
                title="Close side panel"
              >
                ✕
              </button>
            </div>

            {/* Chat Content Body */}
            <div className="flex-1 overflow-hidden p-0 bg-[#FAF8F5]">
              <ChatInterface isDrawer={true} />
            </div>
          </div>

          {/* Backdrop click to close */}
          <div className="flex-1 h-full" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
