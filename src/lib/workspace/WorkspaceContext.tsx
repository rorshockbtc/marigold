"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDataQuery } from "@/hooks/useDataQuery";

interface WorkspaceContextType {
  isDataLoaded: boolean;
  activeGroup: string;
  totalRows: number;
  jurisdiction: string;
  stateCode: string;
  selectedRecord: Record<string, any> | null;
  setSelectedRecord: (record: Record<string, any> | null) => void;
  isSideSheetOpen: boolean;
  setIsSideSheetOpen: (open: boolean) => void;
  openRecordSideSheet: (record: Record<string, any>) => void;
  closeSideSheet: () => void;
  refreshWorkspaceState: () => Promise<void>;
  switchGroup: (targetGroup: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [jurisdiction, setJurisdiction] = useState("Loading...");
  const [stateCode, setStateCode] = useState("..");
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any> | null>(null);
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const { query } = useDataQuery();

  const openRecordSideSheet = (record: Record<string, any>) => {
    setSelectedRecord(record);
    setIsSideSheetOpen(true);
  };

  const closeSideSheet = () => {
    setIsSideSheetOpen(false);
  };

  const refreshWorkspaceState = async () => {
    if (typeof window === "undefined") return;
    
    const group = localStorage.getItem("marigold_active_group") || "Independent Audit Workspace";
    setActiveGroup(group);
    
    const isConnected = localStorage.getItem("marigold_file_connected") === "true";
    setIsDataLoaded(isConnected);

    if (isConnected) {
      try {
        const res = await query("", [], 1);
        setTotalRows(res.totalMatches);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const st = row.state || "MS";
          const cnty = row.county || "Statewide";
          setStateCode(st);
          setJurisdiction(`${cnty}, ${st}`);
        } else {
          setJurisdiction("Empty Database");
        }
      } catch (err) {
        console.error("Failed to query workspace stats", err);
      }
    } else {
      setTotalRows(0);
      setJurisdiction("Disconnected");
    }
  };

  const switchGroup = (targetGroup: string) => {
    if (typeof window === "undefined") return;
    setActiveGroup(targetGroup);
    localStorage.setItem("marigold_active_group", targetGroup);
    
    // Clear out stale column mapping when switching
    localStorage.removeItem("marigold_file_mapping");
    
    const isDemo = targetGroup === "State of Roosevelt (Demo)" ||
                   targetGroup === "ACME Civic Data Sandbox (Demo Environment)";
    
    if (isDemo) {
      localStorage.setItem("marigold_user_role", "Verified Tester");
      const currentFileName = localStorage.getItem("marigold_file_name") || "";
      if (!currentFileName.toUpperCase().includes("DEMO")) {
        localStorage.setItem("marigold_file_connected", "false");
        localStorage.setItem("marigold_file_rows", "0");
        localStorage.setItem("marigold_file_name", "Synthetic DEMO_ dataset required");
      }
    } else if (targetGroup === "Mississippi Fair Elections") {
      localStorage.setItem("marigold_user_role", "Group Admin");
      const currentFileName = localStorage.getItem("marigold_file_name") || "";
      if (currentFileName === "Synthetic DEMO_ dataset required" || currentFileName.toUpperCase().includes("DEMO")) {
        // Only inject Mississippi if it's currently demo data. Otherwise let the real file persist.
        localStorage.setItem("marigold_file_connected", "true");
        localStorage.setItem("marigold_file_rows", "2002923");
        localStorage.setItem("marigold_file_name", "ms_voter_roll_2024.csv");
      }
    } else {
      // General group transition (not MS or Demo explicitly). Let's clear connection if it was Demo.
      const currentFileName = localStorage.getItem("marigold_file_name") || "";
      if (currentFileName.toUpperCase().includes("DEMO") || currentFileName === "Synthetic DEMO_ dataset required") {
         localStorage.setItem("marigold_file_connected", "false");
         localStorage.setItem("marigold_file_rows", "0");
         localStorage.setItem("marigold_file_name", "");
      }
    }

    refreshWorkspaceState();
    window.dispatchEvent(new CustomEvent('marigold-group-change', { detail: { group: targetGroup } }));
    window.location.reload(); // Force full app reload to ensure IndexedDB disconnects cleanly
  };

  useEffect(() => {
    refreshWorkspaceState();
    
    // Listen for connection events to auto-refresh
    window.addEventListener("marigold-data-connected", refreshWorkspaceState);
    return () => {
      window.removeEventListener("marigold-data-connected", refreshWorkspaceState);
    };
  }, [query]);

  return (
    <WorkspaceContext.Provider value={{
      isDataLoaded,
      activeGroup,
      totalRows,
      jurisdiction,
      stateCode,
      selectedRecord,
      setSelectedRecord,
      isSideSheetOpen,
      setIsSideSheetOpen,
      openRecordSideSheet,
      closeSideSheet,
      refreshWorkspaceState,
      switchGroup
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
