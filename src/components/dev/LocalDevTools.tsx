"use client";

import React, { useState } from "react";
import { Bug, Database, User, Users } from "lucide-react";

export default function LocalDevTools() {
  const [isOpen, setIsOpen] = useState(false);

  // If we are not in development, don't render this at all.
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#4A352F] text-[#FDFBF7] px-4 py-2 rounded-full shadow-lg hover:bg-[#7C665F] transition-colors"
        >
          <Bug className="w-4 h-4" />
          <span className="text-sm font-medium">Testing Rails</span>
        </button>
      ) : (
        <div className="bg-[#FDFBF7] border border-border-soft rounded-[12px] shadow-2xl p-4 w-72 text-[#4A352F]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-soft">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Bug className="w-4 h-4 text-primary" />
              DevTools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#7C665F] hover:text-[#4A352F]"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-[#7C665F]">
                Mock User State
              </h4>
              <div className="space-y-2">
                <button 
                  onClick={() => alert("Simulating New User workflow (clearing storage)...")}
                  className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-surface rounded-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  Simulate New User
                </button>
                <button 
                  onClick={() => alert("Simulating Returning Group Admin...")}
                  className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-surface rounded-md transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Simulate Group Admin
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-[#7C665F]">
                Data Injection
              </h4>
              <div className="space-y-2">
                <button 
                  onClick={() => alert("Injecting 500 fake anomalies into IndexedDB...")}
                  className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-surface rounded-md transition-colors text-primary"
                >
                  <Database className="w-4 h-4" />
                  Inject 500 Mock Anomalies
                </button>
                <button 
                  onClick={() => alert("Nuking all local state...")}
                  className="w-full flex items-center gap-2 text-left text-sm p-2 hover:bg-[#F9E6E9] text-[#D36C95] rounded-md transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Nuke Local State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
