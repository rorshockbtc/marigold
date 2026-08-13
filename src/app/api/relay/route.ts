import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth as fbAuth } from "@/lib/firebase/client";
import { auth } from "@clerk/nextjs/server";

const IS_FIREBASE_CONNECTED = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Fallback Persistent Disk Store
const DATA_DIR = process.env.RELAY_STORAGE_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), ".data");

function getStoragePath(groupId: string): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const safeGroupId = groupId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DATA_DIR, `relay_${safeGroupId}.json`);
}

function readDiskBlobs(groupId: string): any[] {
  try {
    const filePath = getStoragePath(groupId);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

function saveDiskBlobs(groupId: string, blobs: any[]): void {
  const filePath = getStoragePath(groupId);
  fs.writeFileSync(filePath, JSON.stringify(blobs, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, blob } = await req.json();
    
    if (!groupId || !blob) {
      return NextResponse.json({ error: "Missing groupId or blob" }, { status: 400 });
    }

    // Zero-Knowledge Validation: Payload must contain ciphertext
    if (typeof blob !== "object" || (!blob.ciphertext && !blob.encryptedPayload) || !blob.id) {
      return NextResponse.json({ error: "Zero-Knowledge Violation: Payload must be fully encrypted before transmission." }, { status: 422 });
    }

    const newEntry = {
      groupId,
      userId,
      ...blob,
      timestamp: Date.now()
    };

    if (IS_FIREBASE_CONNECTED) {
      try {
        if (fbAuth && !fbAuth.currentUser) {
          await signInAnonymously(fbAuth);
        }
        await addDoc(collection(db as any, "relay_blobs"), newEntry);
      } catch (err) {
        console.warn("Firebase relay write failed, writing to fallback disk store", err);
        const blobs = readDiskBlobs(groupId);
        blobs.push(newEntry);
        saveDiskBlobs(groupId, blobs);
      }
    } else {
      const blobs = readDiskBlobs(groupId);
      blobs.push(newEntry);
      saveDiskBlobs(groupId, blobs);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }

  if (IS_FIREBASE_CONNECTED) {
    try {
      if (fbAuth && !fbAuth.currentUser) {
        await signInAnonymously(fbAuth);
      }
      const q = query(
        collection(db as any, "relay_blobs"),
        where("groupId", "==", groupId),
        orderBy("timestamp", "asc")
      );
      const snapshot = await getDocs(q);
      const blobs = snapshot.docs.map(doc => doc.data());
      return NextResponse.json({ blobs });
    } catch (err) {
      console.warn("Firebase query failed, using disk store fallback", err);
      const blobs = readDiskBlobs(groupId);
      return NextResponse.json({ blobs });
    }
  }

  const blobs = readDiskBlobs(groupId);
  return NextResponse.json({ blobs });
  } catch (err) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
