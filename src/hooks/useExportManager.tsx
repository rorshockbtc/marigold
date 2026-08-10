"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export type ExportContextType = "FULL_AUDIT" | "PLAYBOOK_DRILLDOWN" | "SEARCH_RESULTS";

export interface ExportRequest {
  contextType: ExportContextType;
  title: string;
  description: string;
  data: any[];
  insights: string;
}

interface ExportManagerContextValue {
  requestExport: (request: ExportRequest) => void;
}

const ExportManagerContext = createContext<ExportManagerContextValue | null>(null);

export function useExportManager() {
  const context = useContext(ExportManagerContext);
  if (!context) {
    throw new Error("useExportManager must be used within an ExportManagerProvider");
  }
  return context;
}

export function ExportManagerProvider({ children }: { children: ReactNode }) {
  const [activeRequest, setActiveRequest] = useState<ExportRequest | null>(null);

  const requestExport = useCallback((request: ExportRequest) => {
    setActiveRequest(request);
  }, []);

  const handleCancel = () => {
    setActiveRequest(null);
  };

  const handleContinue = () => {
    if (!activeRequest) return;
    
    // 1. Generate and download CSV
    downloadCSV(activeRequest.data, activeRequest.title);

    // 2. Generate PDF Summary
    // We open a hidden or dedicated print view that automatically calls window.print()
    const printData = {
      title: activeRequest.title,
      description: activeRequest.description,
      insights: activeRequest.insights,
      recordCount: activeRequest.data.length,
      date: new Date().toLocaleDateString(),
    };
    
    localStorage.setItem("marigold_print_data", JSON.stringify(printData));
    window.open("/print/summary", "_blank");

    setActiveRequest(null);
  };

  const downloadCSV = (data: any[], title: string) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${String(row[h] !== undefined ? row[h] : '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    link.download = `marigold_export_${cleanTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ExportManagerContext.Provider value={{ requestExport }}>
      {children}
      
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A352F]/20 backdrop-blur-sm p-4">
          <div className="bg-[#FDFBF7] rounded-[12px] shadow-2xl max-w-lg w-full overflow-hidden border border-[#E8E2D5]">
            <div className="p-8">
              <h2 className="text-2xl font-serif text-[#4A352F] mb-4">Confirm Export</h2>
              <p className="text-[#7C665F] mb-6 text-[15px] leading-relaxed">
                You are about to download the results for <strong>{activeRequest.title}</strong>, which includes <strong>{activeRequest.data.length}</strong> records.
              </p>
              <div className="bg-[#E8E2D5]/30 p-4 rounded-[8px] mb-8">
                <h3 className="text-sm font-semibold text-[#4A352F] mb-2 uppercase tracking-wider">What you will receive:</h3>
                <ul className="list-disc list-inside text-[#7C665F] text-sm space-y-2 ml-2">
                  <li>A structured, clean CSV file containing the data records.</li>
                  <li>A formatted PDF Executive Summary containing plain-English insights and context.</li>
                </ul>
              </div>

              {activeRequest.contextType !== "FULL_AUDIT" && (
                <p className="text-sm text-[#7C665F] mb-6 italic">
                  Looking for the complete dataset? You can download the Full 360 Audit from the main dashboard.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleContinue}>
                  Download Package
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ExportManagerContext.Provider>
  );
}
