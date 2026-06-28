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
    voterName: "WILLIAMS, ROBERT L",
    address: "1400 J R LYNCH ST, JACKSON, MS (HINDS)",
    flags: ["HIGH_DENSITY_OCCUPANCY_18"],
    status: "pending",
    foundBy: "volunteer@msfe.org",
    dateFound: new Date().toISOString()
  },
  {
    id: "a2",
    voterName: "DAVIS, MARGARET E",
    address: "7422 GOODMAN RD, OLIVE BRANCH, MS (DESOTO)",
    flags: ["COMMERCIAL_PO_BOX_DISGUISE"],
    status: "pending",
    foundBy: "audit-bot@msfe.org",
    dateFound: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "a3",
    voterName: "JOHNSON, MICHAEL T",
    address: "2201 BEACH BLVD, BILOXI, MS (HARRISON)",
    flags: ["NCOA_INTERSTATE_RELOCATION"],
    status: "pending",
    foundBy: "volunteer@msfe.org",
    dateFound: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "a4",
    voterName: "SMITH, CLARA M",
    address: "112 MAIN ST, CANTON, MS (MADISON)",
    flags: ["INTRA_COUNTY_DUPLICATE"],
    status: "pending",
    foundBy: "admin@msfe.org",
    dateFound: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: "a5",
    voterName: "BROWN, JAMES K",
    address: "501 GOVERNMENT ST, BRANDON, MS (RANKIN)",
    flags: ["MISSING_UNIT_DORM_NUMBER"],
    status: "pending",
    foundBy: "volunteer@msfe.org",
    dateFound: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: "a6",
    voterName: "TAYLOR, SUSAN V",
    address: "456 OAK AVE, JACKSON, MS (HINDS)",
    flags: ["HIGH_DENSITY_OCCUPANCY_14"],
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
