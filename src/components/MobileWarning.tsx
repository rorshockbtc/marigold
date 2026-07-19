"use client";

import React, { useState, useEffect } from 'react';
import { MonitorSmartphone, X, AlertTriangle, Zap } from 'lucide-react';

export default function MobileWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Show warning if viewport is narrower than standard tablet (768px)
      if (window.innerWidth < 768 && !hasDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [hasDismissed]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-[#232733] border border-slate-700 text-white p-4 rounded-xl shadow-2xl flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-amber-400">
            <MonitorSmartphone className="w-5 h-5 shrink-0" />
            <span className="font-bold font-serif">Hardware Notice</span>
          </div>
          <button 
            onClick={() => setHasDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          You are accessing Marigold from a mobile device. To ensure the highest level of security, Marigold operates exclusively in a <strong className="text-white">Zero-Cloud</strong> environment, processing all data locally on your device rather than sending it to a server.
        </p>
        
        <div className="bg-white/10 rounded-lg p-3 text-xs leading-relaxed border border-white/5 flex gap-2">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-slate-200">
            Analyzing multi-million row datasets requires significant hardware memory (RAM). While you can view dashboards here, we highly recommend switching to a <strong>desktop computer</strong> for full data processing capabilities.
          </p>
        </div>
        
        <button 
          onClick={() => setHasDismissed(true)}
          className="w-full mt-2 py-2.5 bg-white text-slate-900 font-bold rounded-lg text-sm shadow hover:bg-slate-100 transition-colors"
        >
          I Understand, Continue Anyway
        </button>
      </div>
    </div>
  );
}
