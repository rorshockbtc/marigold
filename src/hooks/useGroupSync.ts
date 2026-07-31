"use client";

import { useState, useEffect, useCallback } from "react";

export interface GroupActivityItem {
  id: string;
  groupId: string;
  authorAlias: string;
  action: string;
  details: string;
  timestamp: string;
  recordCountBucket?: string;
}

export interface SharedPlaybook {
  id: string;
  groupId: string;
  title: string;
  description: string;
  ruleType: string;
  threshold: number;
  authorAlias: string;
  createdAt: string;
}

/**
 * Strict Zero-PII & Geographic Identifier Sanitizer
 * Strips PII (Name, Address, DOB, SSN) AND Geographic location identifiers (County, State, Zip, Precinct).
 */
export function scrubGeographicAndPII<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== "object") return data;

  const scrubbed = { ...data };
  const bannedFields = [
    // Standard PII
    "name", "first_name", "last_name", "firstname", "lastname",
    "address", "street", "street_address", "dob", "birth_date",
    "ssn", "social_security", "phone", "email",
    // Geographic Location Identifiers
    "county", "county_name", "state", "state_code", "zip", "zip_code",
    "precinct", "jurisdiction", "jurisdiction_id", "city"
  ];

  for (const key of Object.keys(scrubbed)) {
    const lowerKey = key.toLowerCase();
    if (bannedFields.some((field) => lowerKey.includes(field))) {
      delete (scrubbed as any)[key];
    } else if (typeof (scrubbed as any)[key] === "string") {
      let val = (scrubbed as any)[key];
      // Scrub SSN patterns
      val = val.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]");
      // Scrub Email patterns
      val = val.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[REDACTED_EMAIL]");
      (scrubbed as any)[key] = val;
    }
  }

  return scrubbed;
}

export function useGroupSync() {
  const [groupId, setGroupId] = useState<string>("Independent Audit Workspace");
  const [activities, setActivities] = useState<GroupActivityItem[]>([]);
  const [sharedPlaybooks, setSharedPlaybooks] = useState<SharedPlaybook[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeGroup = localStorage.getItem("marigold_active_group") || "Independent Audit Workspace";
      setGroupId(activeGroup);

      // Seed initial synthetic group activity for demo / sandbox
      const initialActivities: GroupActivityItem[] = [
        {
          id: "act-1",
          groupId: activeGroup,
          authorAlias: "Auditor-ALPHA",
          action: "Ran Playbook Query",
          details: "Executed High-Density Occupancy audit against active roll",
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          recordCountBucket: "1K-5K",
        },
        {
          id: "act-2",
          groupId: activeGroup,
          authorAlias: "Auditor-BRAVO",
          action: "Shared Custom Playbook",
          details: "Published 'NCOA Relocation & Multi-State Collision' recipe to group",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          recordCountBucket: "1K-5K",
        },
      ];

      const initialPlaybooks: SharedPlaybook[] = [
        {
          id: "sp-1",
          groupId: activeGroup,
          title: "NCOA Relocation & Multi-State Collision",
          description: "Flags voter records with recent out-of-state mail forwards.",
          ruleType: "NCOA_FORWARD",
          threshold: 14,
          authorAlias: "Auditor-BRAVO",
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
      ];

      setActivities(initialActivities);
      setSharedPlaybooks(initialPlaybooks);
    }
  }, []);

  const publishActivity = useCallback((action: string, details: string) => {
    setIsSyncing(true);
    const sanitizedDetails = scrubGeographicAndPII({ details }).details;

    const newItem: GroupActivityItem = {
      id: `act-${Date.now()}`,
      groupId,
      authorAlias: "You (Auditor-LOCAL)",
      action,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
      recordCountBucket: "1K-5K",
    };

    setActivities((prev) => [newItem, ...prev]);

    // Broadcast across local browser windows/tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("marigold_group_sync");
        channel.postMessage({ type: "ACTIVITY_ADDED", item: newItem });
        channel.close();
      } catch (e) {
        // Fallback silently if BroadcastChannel fails
      }
    }

    setTimeout(() => setIsSyncing(false), 300);
  }, [groupId]);

  const sharePlaybook = useCallback((playbook: Omit<SharedPlaybook, "id" | "groupId" | "createdAt" | "authorAlias">) => {
    setIsSyncing(true);
    const sanitizedPlaybook = scrubGeographicAndPII(playbook);

    const newPlaybook: SharedPlaybook = {
      ...sanitizedPlaybook,
      id: `sp-${Date.now()}`,
      groupId,
      authorAlias: "You (Auditor-LOCAL)",
      createdAt: new Date().toISOString(),
    };

    setSharedPlaybooks((prev) => [newPlaybook, ...prev]);
    publishActivity("Shared Custom Playbook", `Published '${newPlaybook.title}' recipe to group`);

    setTimeout(() => setIsSyncing(false), 300);
  }, [groupId, publishActivity]);

  return {
    groupId,
    activities,
    sharedPlaybooks,
    isSyncing,
    publishActivity,
    sharePlaybook,
  };
}
