import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";

export interface DatasetMap {
  signature: string;
  mapping: Record<string, string>;
  createdAt: any;
  createdBy: string;
  groupName: string;
}

const IS_FIREBASE_CONNECTED = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

/**
 * Checks if a column mapping already exists for the given dataset signature.
 */
export async function getMapBySignature(signature: string): Promise<Record<string, string> | null> {
  if (!IS_FIREBASE_CONNECTED) return null;
  if (!signature) return null;

  try {
    const docRef = doc(db as any, "dataset_maps", signature);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return (snapshot.data() as DatasetMap).mapping;
    }
    return null;
  } catch (err) {
    console.error("Error fetching map by signature from Firebase:", err);
    return null;
  }
}

/**
 * Saves a completed column mapping to Firebase so other users in the group (or globally)
 * can instantly apply it when they upload the same dataset.
 */
export async function saveMap(signature: string, mapping: Record<string, string>, userEmail: string = "anonymous", groupName: string = "default"): Promise<void> {
  if (!IS_FIREBASE_CONNECTED) return;
  if (!signature || !mapping) return;

  try {
    const docRef = doc(db as any, "dataset_maps", signature);
    const data: DatasetMap = {
      signature,
      mapping,
      createdAt: serverTimestamp(),
      createdBy: userEmail,
      groupName
    };
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.error("Error saving map to Firebase:", err);
  }
}
