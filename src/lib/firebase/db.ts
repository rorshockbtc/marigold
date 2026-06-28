import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { db } from "./client";

export interface SearchRecipe {
  id?: string;
  name: string;
  queryTemplate: string;
  description: string;
  author: string;
  successRate: number; // 0-100
}

export interface AnomalyRecord {
  id?: string;
  voterName: string;
  address: string;
  flags: string[];
  status: "pending" | "verified" | "false_positive";
  foundBy: string;
  dateFound: string;
}

// Fallback Mock Data for UI presentation before Firebase is fully hooked up
let mockRecipes: SearchRecipe[] = [
  {
    id: "r1",
    name: "Address Density Check",
    queryTemplate: "Find addresses in [County Name] that have more than [Number] voters registered.",
    description: "Great for finding commercial properties or empty lots with too many registrations.",
    author: "System",
    successRate: 92
  },
  {
    id: "r2",
    name: "NCOA Match",
    queryTemplate: "List all voters in [County Name] flagged for NCOA (National Change of Address) out-of-state.",
    description: "Identifies voters who likely moved out of Mississippi but remain on the active rolls.",
    author: "System",
    successRate: 85
  }
];

let mockAnomalies: AnomalyRecord[] = [
  {
    id: "a1",
    voterName: "DOE, JOHN A",
    address: "123 MAPLE ST, JACKSON, MS",
    flags: ["NCOA_MATCH", "OUT_OF_STATE"],
    status: "pending",
    foundBy: "volunteer@msfe.org",
    dateFound: new Date().toISOString()
  },
  {
    id: "a2",
    voterName: "SMITH, JANE B",
    address: "456 OAK AVE, JACKSON, MS",
    flags: ["HIGH_DENSITY_ADDRESS"],
    status: "verified",
    foundBy: "admin@msfe.org",
    dateFound: new Date(Date.now() - 86400000).toISOString()
  }
];

const IS_FIREBASE_CONNECTED = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export async function getSearchRecipes(): Promise<SearchRecipe[]> {
  if (!IS_FIREBASE_CONNECTED) return mockRecipes;
  
  const q = query(collection(db as any, "search_recipes"), orderBy("successRate", "desc"), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SearchRecipe));
}

export async function getAnomalies(): Promise<AnomalyRecord[]> {
  if (!IS_FIREBASE_CONNECTED) return mockAnomalies;
  
  const q = query(collection(db as any, "anomalies"), orderBy("dateFound", "desc"), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnomalyRecord));
}

export async function saveAnomaly(data: Omit<AnomalyRecord, "id">): Promise<string> {
  if (!IS_FIREBASE_CONNECTED) {
    const id = "m" + Date.now();
    mockAnomalies = [{ id, ...data }, ...mockAnomalies];
    return id;
  }
  
  const docRef = await addDoc(collection(db as any, "anomalies"), data);
  return docRef.id;
}

export async function saveSearchRecipe(data: Omit<SearchRecipe, "id">): Promise<string> {
  if (!IS_FIREBASE_CONNECTED) {
    const id = "r" + Date.now();
    mockRecipes = [{ id, ...data }, ...mockRecipes];
    return id;
  }
  
  const docRef = await addDoc(collection(db as any, "search_recipes"), data);
  return docRef.id;
}

export async function updateAnomalyStatus(id: string, newStatus: "pending" | "verified" | "false_positive"): Promise<void> {
  if (!IS_FIREBASE_CONNECTED) {
    mockAnomalies = mockAnomalies.map(a => a.id === id ? { ...a, status: newStatus } : a);
    return;
  }
  
  const anomalyRef = doc(db as any, "anomalies", id);
  await updateDoc(anomalyRef, { status: newStatus });
}
