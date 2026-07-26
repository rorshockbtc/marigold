"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDataQuery } from "@/hooks/useDataQuery";

interface WorkspaceContextType {
  isDataLoaded: boolean;
  activeGroup: string;
  totalRows: number;
  jurisdiction: string;
  stateCode: string;
  refreshWorkspaceState: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeGroup, setActiveGroup] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [jurisdiction, setJurisdiction] = useState("Loading...");
  const [stateCode, setStateCode] = useState("..");
  const { query } = useDataQuery();

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
      refreshWorkspaceState
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
