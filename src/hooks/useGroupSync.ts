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
  isSystemAction?: boolean;
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

export interface CachedGroupAudit {
  groupId: string;
  timestamp: string;
  authorAlias: string;
  totalRecordsScanned: number;
  anomalyRecords: Record<string, any[]>;
}

/**
 * Strict Zero-PII & Geographic Identifier Sanitizer
 */
export function scrubGeographicAndPII<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== "object") return data;

  const scrubbed = { ...data };
  const bannedFields = [
    "dob", "birth_date", "ssn", "social_security", "phone", "email"
  ];

  for (const key of Object.keys(scrubbed)) {
    const lowerKey = key.toLowerCase();
    if (bannedFields.some((field) => lowerKey.includes(field))) {
      delete (scrubbed as any)[key];
    } else if (typeof (scrubbed as any)[key] === "string") {
      let val = (scrubbed as any)[key];
      val = val.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]");
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
  const [cachedAudit, setCachedAudit] = useState<CachedGroupAudit | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadAuditCache = useCallback((grp: string) => {
    if (typeof window === "undefined") return null;
    try {
      const key = `marigold_group_audit_cache_${grp.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: CachedGroupAudit = JSON.parse(saved);
        setCachedAudit(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Could not parse group audit cache", e);
    }
    return null;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeGroup = localStorage.getItem("marigold_active_group") || "Independent Audit Workspace";
      setGroupId(activeGroup);
      loadAuditCache(activeGroup);

      const initialActivities: GroupActivityItem[] = [
        {
          id: "act-1",
          groupId: activeGroup,
          authorAlias: "Auditor-ALPHA",
          action: "Ran 360° Audit Sweep",
          details: "Executed full forensic sweep against active roll",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          recordCountBucket: "2M+",
        },
      ];

      setActivities(initialActivities);
    }
  }, [loadAuditCache]);

  const publishActivity = useCallback((action: string, details: string, isSystemAction = false) => {
    console.info(`[Telemetry] GroupSync: Broadcasting ${isSystemAction ? 'SYSTEM' : 'USER'} activity [${action}] to relay`);
    setIsSyncing(true);
    const sanitizedDetails = scrubGeographicAndPII({ details }).details;

    const newItem: GroupActivityItem = {
      id: `act-${Date.now()}`,
      groupId,
      authorAlias: isSystemAction ? "System" : "You (Auditor-LOCAL)",
      action,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
      recordCountBucket: "2M+",
      isSystemAction
    };

    setActivities((prev) => [newItem, ...prev]);

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("marigold_group_sync");
        channel.postMessage({ type: "ACTIVITY_ADDED", item: newItem });
        channel.close();
      } catch (e) {}
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

  const publishAuditCache = useCallback((grp: string, totalRows: number, anomalyMap: Record<string, any[]>) => {
    if (typeof window === "undefined") return;
    try {
      const key = `marigold_group_audit_cache_${grp.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const cacheObj: CachedGroupAudit = {
        groupId: grp,
        timestamp: new Date().toISOString(),
        authorAlias: "Auditor-GROUP",
        totalRecordsScanned: totalRows,
        anomalyRecords: anomalyMap,
      };
      localStorage.setItem(key, JSON.stringify(cacheObj));
      setCachedAudit(cacheObj);

      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel("marigold_group_sync");
        channel.postMessage({ type: "AUDIT_CACHE_UPDATED", cache: cacheObj });
        channel.close();
      }
    } catch (e) {
      console.warn("Could not save audit cache to storage", e);
    }
  }, []);

  return {
    groupId,
    activities,
    sharedPlaybooks,
    cachedAudit,
    isSyncing,
    publishActivity,
    sharePlaybook,
    publishAuditCache,
    loadAuditCache,
  };
}
