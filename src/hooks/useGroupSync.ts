"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { deriveGroupKey, encryptPayload, decryptPayload } from "@/lib/crypto/LocalKeyManager";
import { fetchBlobsFromRelay, pushBlobToRelay } from "@/lib/relay/clientRelay";

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

export function scrubGeographicAndPII<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== "object") return data;

  const scrubbed = { ...data };
  const bannedFields = ["dob", "birth_date", "ssn", "social_security", "phone", "email"];

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
  
  const fetchedIdsRef = useRef<Set<string>>(new Set());

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
    } catch (e) {}
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
      initialActivities.forEach(a => fetchedIdsRef.current.add(a.id));
    }
  }, [loadAuditCache]);

  // Polling for remote activities
  useEffect(() => {
    if (typeof window === "undefined") return;
    let interval: NodeJS.Timeout;

    const pollRelay = async () => {
      try {
        const activeGroup = localStorage.getItem("marigold_active_group") || "default";
        const key = await deriveGroupKey(activeGroup);
        const blobs = await fetchBlobsFromRelay(activeGroup);
        
        if (blobs && blobs.length > 0) {
          const activityBlobs = blobs.filter((b: any) => b.type === "ACTIVITY_SYNC");
          
          let newRemoteActivities: GroupActivityItem[] = [];
          
          for (const blob of activityBlobs) {
            if (blob.ciphertext && blob.iv) {
              try {
                const decryptedRaw = await decryptPayload(blob.ciphertext, blob.iv, key);
                const remoteActivity: GroupActivityItem = JSON.parse(decryptedRaw);
                if (!fetchedIdsRef.current.has(remoteActivity.id)) {
                  newRemoteActivities.push(remoteActivity);
                  fetchedIdsRef.current.add(remoteActivity.id);
                }
              } catch(e) {}
            }
          }
          
          if (newRemoteActivities.length > 0) {
            setActivities(prev => {
              const merged = [...newRemoteActivities, ...prev];
              merged.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              return merged;
            });
            setIsSyncing(true);
            setTimeout(() => setIsSyncing(false), 1000);
          }

          // Also sync roster updates globally
          const rosterBlobs = blobs.filter((b: any) => b.type === "ROSTER_SYNC");
          if (rosterBlobs.length > 0) {
            const latest = rosterBlobs[rosterBlobs.length - 1];
            if (latest.ciphertext && latest.iv) {
              try {
                const decryptedRaw = await decryptPayload(latest.ciphertext, latest.iv, key);
                const rosterData = JSON.parse(decryptedRaw);
                const rosterKey = (activeGroup === "State of Roosevelt (Demo)") ? "marigold_demo_roster" : "marigold_group_roster";
                localStorage.setItem(rosterKey, JSON.stringify(rosterData));
                
                // Dispatch event so panels can re-render immediately if they depend on roster
                window.dispatchEvent(new Event("marigold_roster_updated"));
              } catch (e) {}
            }
          }
        }
      } catch (err) {}
    };

    interval = setInterval(pollRelay, 5000);
    pollRelay();
    return () => clearInterval(interval);
  }, []);

  const publishActivity = useCallback((action: string, details: string, isSystemAction = false) => {
    setIsSyncing(true);
    const sanitizedDetails = scrubGeographicAndPII({ details }).details;
    const authorName = localStorage.getItem("marigold_user_identity") || "Investigator";

    const newItem: GroupActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
      groupId,
      authorAlias: isSystemAction ? "System" : authorName,
      action,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
      recordCountBucket: "2M+",
      isSystemAction
    };

    fetchedIdsRef.current.add(newItem.id);
    setActivities((prev) => [newItem, ...prev]);

    // Push to Relay
    if (typeof window !== "undefined") {
      (async () => {
        try {
          const key = await deriveGroupKey(groupId);
          const { ciphertextHex, ivHex } = await encryptPayload(JSON.stringify(newItem), key);
          await pushBlobToRelay(groupId, {
            id: newItem.id,
            ciphertext: ciphertextHex,
            iv: ivHex,
            type: "ACTIVITY_SYNC"
          });
        } catch(e) {}
      })();
    }

    setTimeout(() => setIsSyncing(false), 300);
  }, [groupId]);

  const sharePlaybook = useCallback((playbook: Omit<SharedPlaybook, "id" | "groupId" | "createdAt" | "authorAlias">) => {
    setIsSyncing(true);
    const sanitizedPlaybook = scrubGeographicAndPII(playbook);
    const authorName = localStorage.getItem("marigold_user_identity") || "Investigator";

    const newPlaybook: SharedPlaybook = {
      ...sanitizedPlaybook,
      id: `sp-${Date.now()}`,
      groupId,
      authorAlias: authorName,
      createdAt: new Date().toISOString(),
    };

    setSharedPlaybooks((prev) => [newPlaybook, ...prev]);
    publishActivity("Shared Custom Playbook", `Published '${newPlaybook.title}' recipe to group`);

    setTimeout(() => setIsSyncing(false), 300);
  }, [groupId, publishActivity]);

  const publishAuditCache = useCallback((grp: string, totalRows: number, anomalyMap: Record<string, any[]>) => {
    if (typeof window === "undefined") return;
    try {
      const authorName = localStorage.getItem("marigold_user_identity") || "Investigator";
      const key = `marigold_group_audit_cache_${grp.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const cacheObj: CachedGroupAudit = {
        groupId: grp,
        timestamp: new Date().toISOString(),
        authorAlias: authorName,
        totalRecordsScanned: totalRows,
        anomalyRecords: anomalyMap,
      };
      localStorage.setItem(key, JSON.stringify(cacheObj));
      setCachedAudit(cacheObj);
    } catch (e) {}
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
