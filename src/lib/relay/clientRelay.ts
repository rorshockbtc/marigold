import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth as fbAuth } from "@/lib/firebase/client";

export async function pushBlobToRelay(groupId: string, blob: any) {
  if (db) {
    if (fbAuth && !fbAuth.currentUser) {
      await signInAnonymously(fbAuth);
    }
    await addDoc(collection(db as any, "relay_blobs"), {
      groupId,
      ...blob,
      timestamp: Date.now()
    });
    return;
  }

  // Fallback to API route for local disk testing
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    console.error("CRITICAL: Firebase is not configured. Falling back to ephemeral API relay which will drop data on Vercel!");
  }
  await fetch("/api/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, blob })
  });
}

export async function fetchBlobsFromRelay(groupId: string) {
  if (db) {
    if (fbAuth && !fbAuth.currentUser) {
      await signInAnonymously(fbAuth);
    }
    const q = query(
      collection(db as any, "relay_blobs"),
      where("groupId", "==", groupId),
      orderBy("timestamp", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  // Fallback to API route for local disk testing
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    console.error("CRITICAL: Firebase is not configured. Falling back to ephemeral API relay which will drop data on Vercel!");
  }
  const res = await fetch(`/api/relay?groupId=${encodeURIComponent(groupId)}`);
  if (res.ok) {
    const data = await res.json();
    return data.blobs || [];
  }
  return [];
}
