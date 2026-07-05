"use client";

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { MarigoldIcon } from '@/components/MarigoldIcon';

export default function MariRightPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleToggle = () => setIsOpen(prev => !prev);

    window.addEventListener('open-mari-panel', handleOpen);
    window.addEventListener('close-mari-panel', handleClose);
    window.addEventListener('toggle-mari-panel', handleToggle);
    return () => {
      window.removeEventListener('open-mari-panel', handleOpen);
      window.removeEventListener('close-mari-panel', handleClose);
      window.removeEventListener('toggle-mari-panel', handleToggle);
    };
  }, []);

  // Notify window whenever panel toggles so workspace layout can adjust its right margin
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mari-panel-state-change', { detail: { isOpen } }));
  }, [isOpen]);

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
          <MarigoldIcon className="w-5 h-5 flex-shrink-0 drop-shadow-sm" />
          <span className="text-sm tracking-wide">Ask Mari AI</span>
        </button>
      )}

      {/* Right Slide-Over Panel (Attached strictly to right-0 top-0 bottom-0 without scrim!) */}
      {isOpen && (
        <aside 
          className="fixed top-0 right-0 bottom-0 w-full max-w-md md:max-w-[430px] xl:max-w-[460px] bg-[#FAF8F5] border-l border-[#E5E0D8] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="bg-[#F0ECE3] border-b border-[#E5E0D8] px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D96B27]/15 border border-[#D96B27]/30 flex items-center justify-center shadow-inner">
                <MarigoldIcon className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-black text-[#2D3142] text-sm leading-tight">Mari AI Guidance Co-Pilot</h3>
                <p className="text-[10px] text-[#646A7A] font-mono mt-0.5">100% Local Memory • Non-Partisan Guide</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg text-[#646A7A] hover:text-[#2D3142] hover:bg-[#E5E0D8]/60 font-bold text-xs flex items-center gap-1 transition-colors"
              title="Close side panel"
            >
              <span>✕ Close</span>
            </button>
          </div>

          {/* Chat Content Body */}
          <div className="flex-1 overflow-hidden p-0 bg-[#FAF8F5] flex flex-col">
            <ChatInterface isDrawer={true} />
          </div>
        </aside>
      )}
    </>
  );
}
