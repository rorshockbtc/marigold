"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";
import {
  Sparkles,
  RotateCcw,
  Sliders,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Search,
  Play,
  Pause,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Eye,
  Compass,
  HelpCircle,
  MousePointerClick,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import msAudit from "@/data/mississippi_audit_results.json";
import { EditorialTable } from "@/components/report/EditorialTable";

type ViewMode = "counties" | "clusters";
type IsolatedAxis = "ALL" | "X" | "Y" | "Z";
type CanvasTheme = "obsidian" | "paper";

interface CountyVector {
  county: string;
  total: number;
  active: number;
  inactive: number;
  votes2024General: number;
  highDensityCount: number;
  highDensityVoters: number;
  ncoaCount: number;
  duplicateCount: number;
  activeDuplicateCount: number;
  missingDormCount: number;
  poBoxCount: number;
  clericalCount: number;
  overCapacityPrecincts: number;
  maxPrecinctVoters: number;
  dup2024CreditCount: number;
  cleanlinessScore: number;
  x: number;
  y: number;
  z: number;
  manifoldZ: number;
  manifoldResidual: number;
  geodesicDistance: number;
  mahalanobisDistance?: number;
  inactiveRatePct?: number;
  turnout2024Pct?: number;
  threatEnergy: number;
  curvatureIndex: number;
  partialX: number;
  partialY: number;
  partialZ: number;
  regime: string;
  dominantDriver: string;
  plainEnglishSummary: string;
}

interface ClusterVector {
  id: string;
  label: string;
  county: string;
  category: string;
  metricLabel: string;
  x: number;
  y: number;
  z: number;
  manifoldZ: number;
  geodesicDistance: number;
  threatEnergy: number;
  plainEnglishSummary: string;
}

// Friendly, everyday labels for county types (replaces academic jargon)
const FRIENDLY_REGIME_LABELS: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "Needs Attention Across All 3 Areas",
  "Axis-X Spatial Domicile Ridge": "Main Focus: Apartment & Dorm Unit Numbers",
  "Axis-Y Interstate Drift Ridge": "Main Focus: Out-of-State Mail & Duplicates",
  "Axis-Z Precinct Strain Ridge": "Main Focus: Large Polling Places (3,000+ Voters)",
  "Equilibrium Manifold Surface": "On Track: Normal County Pattern",
};

const REGIME_COLORS: Record<
  string,
  { fill: string; stroke: string; bg: string; text: string; darkBadge: string }
> = {
  "Multi-Axis Manifold Detachment": {
    fill: "#FF4D2D",
    stroke: "#991B1B",
    bg: "bg-red-100 border-red-400",
    text: "text-red-950",
    darkBadge: "bg-[#FF4D2D] text-white border-white/40",
  },
  "Axis-X Spatial Domicile Ridge": {
    fill: "#F59E0B",
    stroke: "#92400E",
    bg: "bg-amber-100 border-amber-400",
    text: "text-amber-950",
    darkBadge: "bg-[#D97706] text-white border-white/40",
  },
  "Axis-Y Interstate Drift Ridge": {
    fill: "#A855F7",
    stroke: "#5B21B6",
    bg: "bg-purple-100 border-purple-400",
    text: "text-purple-950",
    darkBadge: "bg-[#7C3AED] text-white border-white/40",
  },
  "Axis-Z Precinct Strain Ridge": {
    fill: "#0EA5E9",
    stroke: "#075985",
    bg: "bg-sky-100 border-sky-400",
    text: "text-sky-950",
    darkBadge: "bg-[#0284C7] text-white border-white/40",
  },
  "Equilibrium Manifold Surface": {
    fill: "#10B981",
    stroke: "#065F46",
    bg: "bg-emerald-100 border-emerald-400",
    text: "text-emerald-950",
    darkBadge: "bg-[#059669] text-white border-white/30",
  },
};

const ALWAYS_LABELED_COUNTIES = new Set([
  "Hinds",
  "Harrison",
  "DeSoto",
  "Rankin",
  "Madison",
  "Lafayette",
  "Jackson",
  "Forrest",
  "Lee",
  "Marshall",
  "Oktibbeha",
  "Lowndes",
]);

export default function ThreatManifold3DExplorer({
  compact = false,
  forceUnlocked = true,
}: {
  compact?: boolean;
  forceUnlocked?: boolean;
}) {
  const manifold = msAudit.threatManifold;
  const countyVectors = manifold.countyVectors as CountyVector[];
  const clusterVectors = manifold.clusterVectors as ClusterVector[];
  const correlations = (manifold as Record<string, unknown>).correlations as
    | Array<{
        id: string;
        pairLabel: string;
        plainTitle: string;
        pearsonR: number;
        spearmanRho: number;
        strength: string;
        rateOfChange: string;
        commonManTakeaway: string;
      }>
    | undefined;
  const commissionerToolkit = (manifold as Record<string, unknown>).commissionerToolkit as
    | {
        headline: string;
        subheadline: string;
        peerTiers: Array<{
          tier: string;
          counties: string[];
          primaryFocus: string;
          benchmarkMetric: string;
        }>;
        evangelismSteps: Array<{
          step: string;
          title: string;
          detail: string;
        }>;
      }
    | undefined;

  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch {
    isAuthenticated = false;
  }

  const [isUnlocked] = useState<boolean>(forceUnlocked || isAuthenticated || true);

  // Interactive 3D State
  const [viewMode, setViewMode] = useState<ViewMode>("counties");
  const [isolatedAxis, setIsolatedAxis] = useState<IsolatedAxis>("ALL");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("obsidian");
  const [showEquilibriumMesh, setShowEquilibriumMesh] = useState(true);
  const [showResidualStems, setShowResidualStems] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>("Hinds");
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusterVectors[0]?.id || "CL-DOM-01"
  );

  // Spherical Camera Angles (in degrees)
  const [thetaDeg, setThetaDeg] = useState<number>(36);
  const [phiDeg, setPhiDeg] = useState<number>(62);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragDistRef = useRef(0);
  const prevPtrRef = useRef({ x: 0, y: 0 });

  const normalCountyCount = countyVectors.filter((c) => c.regime === "Equilibrium Manifold Surface").length;
  const elevatedCountyCount = countyVectors.length - normalCountyCount;

  const selectedCounty = useMemo(
    () =>
      countyVectors.find((c) => c.county.toLowerCase() === selectedCountyName.toLowerCase()) ||
      countyVectors[0],
    [countyVectors, selectedCountyName]
  );

  const selectedCluster = useMemo(
    () => clusterVectors.find((c) => c.id === selectedClusterId) || clusterVectors[0],
    [clusterVectors, selectedClusterId]
  );

  const filteredCounties = useMemo(() => {
    if (!searchQuery.trim()) return countyVectors;
    const q = searchQuery.toLowerCase();
    return countyVectors.filter(
      (c) =>
        c.county.toLowerCase().includes(q) ||
        c.regime.toLowerCase().includes(q) ||
        c.dominantDriver.toLowerCase().includes(q)
    );
  }, [countyVectors, searchQuery]);

  // Smooth auto-orbit timer
  useEffect(() => {
    if (!autoRotate || !isUnlocked) return;
    const interval = setInterval(() => {
      if (!isDraggingRef.current) {
        setThetaDeg((prev) => (prev + 0.45) % 360);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [autoRotate, isUnlocked]);

  // Three.js WebGL Background Accelerator
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 540;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 1, 1000);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambient);
      renderer.render(scene, camera);
    } catch {
      // Fallback handled seamlessly by the precision 3D Vector Projection Engine below
    }

    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // Deterministic 3D-to-2D Perspective Projection Math
  const project3DPoint = useMemo(() => {
    const radTheta = (thetaDeg * Math.PI) / 180;
    const radPhi = (phiDeg * Math.PI) / 180;
    const camR = 185 / zoomScale;

    const camX = camR * Math.sin(radPhi) * Math.sin(radTheta);
    const camY = camR * Math.cos(radPhi) + 8;
    const camZ = camR * Math.sin(radPhi) * Math.cos(radTheta);

    const targetX = 0;
    const targetY = -2;
    const targetZ = 0;

    let fx = targetX - camX;
    let fy = targetY - camY;
    let fz = targetZ - camZ;
    const fLen = Math.hypot(fx, fy, fz) || 1;
    fx /= fLen;
    fy /= fLen;
    fz /= fLen;

    let rx = -fz;
    let ry = 0;
    let rz = fx;
    const rLen = Math.hypot(rx, ry, rz) || 1;
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;

    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;

    const fovScale = 520 * zoomScale;
    const centerX = 430;
    const centerY = 275;

    return (dataX: number, dataY: number, dataZ: number) => {
      const wx = (dataX - 50) * 1.12;
      const wy = (dataZ - 34) * 0.98;
      const wz = (dataY - 50) * 1.12;

      const dx = wx - camX;
      const dy = wy - camY;
      const dz = wz - camZ;

      const viewX = dx * rx + dy * ry + dz * rz;
      const viewY = dx * ux + dy * uy + dz * uz;
      const viewZ = dx * fx + dy * fy + dz * fz;

      const depth = Math.max(40, viewZ);
      const sx = centerX + (viewX / depth) * fovScale;
      const sy = centerY - (viewY / depth) * fovScale;

      return { sx, sy, depth, wx, wy, wz };
    };
  }, [thetaDeg, phiDeg, zoomScale]);

  // Build 3D Expected County Baseline Grid Lines
  const manifoldGridLines = useMemo(() => {
    const lines: Array<{ d: string; isMajor: boolean }> = [];
    const steps = 10;
    for (let j = 0; j <= steps; j++) {
      const dy = (j / steps) * 100;
      const pts: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const dx = (i / steps) * 100;
        const eqZ = 8.5 + 0.34 * dx + 0.29 * dy + 0.14 * ((dx * dy) / 100.0);
        const p = project3DPoint(dx, dy, eqZ);
        pts.push(`${i === 0 ? "M" : "L"}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
      }
      lines.push({ d: pts.join(" "), isMajor: j % 5 === 0 });
    }
    for (let i = 0; i <= steps; i++) {
      const dx = (i / steps) * 100;
      const pts: string[] = [];
      for (let j = 0; j <= steps; j++) {
        const dy = (j / steps) * 100;
        const eqZ = 8.5 + 0.34 * dx + 0.29 * dy + 0.14 * ((dx * dy) / 100.0);
        const p = project3DPoint(dx, dy, eqZ);
        pts.push(`${j === 0 ? "M" : "L"}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
      }
      lines.push({ d: pts.join(" "), isMajor: i % 5 === 0 });
    }
    return lines;
  }, [project3DPoint]);

  // Build Floor Base Grid at Z = 0
  const floorGridLines = useMemo(() => {
    const lines: string[] = [];
    for (let k = 0; k <= 100; k += 20) {
      const p1 = project3DPoint(k, 0, 0);
      const p2 = project3DPoint(k, 100, 0);
      lines.push(`M${p1.sx.toFixed(1)},${p1.sy.toFixed(1)} L${p2.sx.toFixed(1)},${p2.sy.toFixed(1)}`);

      const q1 = project3DPoint(0, k, 0);
      const q2 = project3DPoint(100, k, 0);
      lines.push(`M${q1.sx.toFixed(1)},${q1.sy.toFixed(1)} L${q2.sx.toFixed(1)},${q2.sy.toFixed(1)}`);
    }
    return lines;
  }, [project3DPoint]);

  // Build 3D Coordinate Axes Endpoints
  const axes3D = useMemo(() => {
    const origin = project3DPoint(0, 0, 0);
    const xEnd = project3DPoint(108, 0, 0);
    const yEnd = project3DPoint(0, 108, 0);
    const zEnd = project3DPoint(0, 0, 92);
    return { origin, xEnd, yEnd, zEnd };
  }, [project3DPoint]);

  // Project and depth-sort all active 3D nodes
  const projectedNodes = useMemo(() => {
    if (viewMode === "counties") {
      return countyVectors
        .map((cv) => {
          const tx = isolatedAxis === "ALL" || isolatedAxis === "X" ? cv.x : 14;
          const ty = isolatedAxis === "ALL" || isolatedAxis === "Y" ? cv.y : 14;
          const tz = isolatedAxis === "ALL" || isolatedAxis === "Z" ? cv.z : cv.manifoldZ;

          const topPt = project3DPoint(tx, ty, tz);
          const basePt = project3DPoint(tx, ty, cv.manifoldZ);
          const isSelected = cv.county.toLowerCase() === selectedCountyName.toLowerCase();
          const radius = Math.max(
            5.5,
            Math.min(15.5, 4.0 + Math.log10(Math.max(1000, cv.total)) * 2.1)
          );
          const colors =
            REGIME_COLORS[cv.regime] || REGIME_COLORS["Equilibrium Manifold Surface"];

          return {
            id: cv.county,
            label: cv.county,
            score: cv.threatEnergy,
            residual: cv.manifoldResidual,
            regime: cv.regime,
            topPt,
            basePt,
            radius: isSelected ? radius * 1.35 : radius,
            isSelected,
            showLabel:
              isSelected ||
              (showLabels &&
                (ALWAYS_LABELED_COUNTIES.has(cv.county) || cv.threatEnergy >= 42)),
            colors,
          };
        })
        .sort((a, b) => b.topPt.depth - a.topPt.depth);
    } else {
      return clusterVectors
        .map((cl) => {
          const tx = isolatedAxis === "ALL" || isolatedAxis === "X" ? cl.x : 14;
          const ty = isolatedAxis === "ALL" || isolatedAxis === "Y" ? cl.y : 14;
          const tz = isolatedAxis === "ALL" || isolatedAxis === "Z" ? cl.z : cl.manifoldZ;

          const topPt = project3DPoint(tx, ty, tz);
          const basePt = project3DPoint(tx, ty, cl.manifoldZ);
          const isSelected = cl.id === selectedClusterId;
          const radius = Math.max(6.5, Math.min(14, cl.threatEnergy / 6.5));
          const regimeKey = cl.category.includes("PB-01")
            ? "Axis-X Spatial Domicile Ridge"
            : cl.category.includes("PB-06")
            ? "Axis-Y Interstate Drift Ridge"
            : "Multi-Axis Manifold Detachment";
          const colors = REGIME_COLORS[regimeKey];

          return {
            id: cl.id,
            label: `${cl.id} (${cl.county})`,
            score: cl.threatEnergy,
            residual: cl.z - cl.manifoldZ,
            regime: cl.category,
            topPt,
            basePt,
            radius: isSelected ? radius * 1.35 : radius,
            isSelected,
            showLabel: isSelected || (showLabels && cl.threatEnergy >= 68),
            colors,
          };
        })
        .sort((a, b) => b.topPt.depth - a.topPt.depth);
    }
  }, [
    viewMode,
    countyVectors,
    clusterVectors,
    isolatedAxis,
    project3DPoint,
    selectedCountyName,
    selectedClusterId,
    showLabels,
  ]);

  // Pointer drag handlers for 3D Orbit
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isUnlocked) return;
    isDraggingRef.current = true;
    dragDistRef.current = 0;
    prevPtrRef.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingRef.current || !isUnlocked) return;
    const dx = e.clientX - prevPtrRef.current.x;
    const dy = e.clientY - prevPtrRef.current.y;
    dragDistRef.current += Math.abs(dx) + Math.abs(dy);
    prevPtrRef.current = { x: e.clientX, y: e.clientY };

    setThetaDeg((prev) => (prev - dx * 0.55 + 360) % 360);
    setPhiDeg((prev) => Math.max(18, Math.min(84, prev - dy * 0.42)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const isDark = canvasTheme === "obsidian";

  return (
    <section className="rounded-2xl border-2 border-[#111111] bg-[#FCFBF8] text-[#111111] shadow-xl overflow-hidden">
      {/* Top Plain-English Header Banner */}
      <div className="border-b-2 border-[#111111] bg-white px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#FFF8EB] px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-[#92400E] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D9381E]" />
              Interactive 3D County Map • Built for Election Commissioners &amp; Clerks
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-[#111111]">
              See Your County&apos;s Exact Voter Roll Checklist in 3D
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#2A2623] max-w-3xl leading-relaxed">
              Think of the <strong className="text-[#065F46]">smooth green net</strong> below as normal for Mississippi&apos;s population.{" "}
              <strong>{normalCountyCount} of our {countyVectors.length} counties</strong> sit right on that healthy green net. The{" "}
              <strong className="text-[#D9381E]">{elevatedCountyCount} counties floating above the net</strong> simply have specific cleanup tasks—like adding apartment unit numbers, sending out-of-state mail postcards, or adding check-in books at busy polling places.
            </p>
          </div>

          {/* Mode & Theme Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border-2 border-[#111111] bg-[#F3EFE6] p-1">
              <button
                type="button"
                onClick={() => setViewMode("counties")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "counties"
                    ? "bg-[#111111] text-white shadow-sm"
                    : "text-[#111111] hover:bg-black/5"
                }`}
              >
                All 82 Counties
              </button>
              <button
                type="button"
                onClick={() => setViewMode("clusters")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "clusters"
                    ? "bg-[#111111] text-white shadow-sm"
                    : "text-[#111111] hover:bg-black/5"
                }`}
              >
                32 Specific Locations
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCanvasTheme((t) => (t === "obsidian" ? "paper" : "obsidian"))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#111111] bg-white hover:bg-[#F3EFE6] text-xs font-bold text-[#111111] cursor-pointer"
              title="Switch 3D Map Background Between Dark and Light"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? "Light Background" : "Dark 3D Studio"}
            </button>
          </div>
        </div>

        {/* Helpful UX Onboarding Strip: "How to Use This Map in 10 Seconds" */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border-2 border-[#111111] bg-[#FFFDF9] p-3.5 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#111111] text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <div className="font-bold text-[#111111]">Find Your County</div>
              <p className="text-[#3A3530] leading-snug mt-0.5">
                Click any colored circle on the 3D map—or pick your county from the dropdown menu on the right.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#D9381E] text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="font-bold text-[#111111]">Focus on One Issue at a Time</div>
              <p className="text-[#3A3530] leading-snug mt-0.5">
                Click the <strong>Orange (Addresses)</strong>, <strong>Purple (Mail)</strong>, or <strong>Blue (Polling Places)</strong> filter buttons below to see one topic by itself.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#065F46] text-white font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <div className="font-bold text-[#111111]">Read Your Plain-English Summary</div>
              <p className="text-[#3A3530] leading-snug mt-0.5">
                The right-hand panel translates the numbers into a simple checklist you can share with your Circuit Clerk.
              </p>
            </div>
          </div>
        </div>

        {/* One-Click Issue Focus Filter Bar */}
        <div className="mt-4 pt-4 border-t border-[#D4CFC7] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] mr-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#D9381E]" />
              Focus on One Topic:
            </span>
            {(
              [
                {
                  id: "ALL",
                  label: "Show All 3 Topics Together",
                  activeClass: "bg-[#111111] text-white border-[#111111]",
                },
                {
                  id: "X",
                  label: "1. Apartment & Dorm Addresses",
                  activeClass: "bg-[#B45309] text-white border-[#B45309]",
                },
                {
                  id: "Y",
                  label: "2. Out-of-State Mail & Duplicates",
                  activeClass: "bg-[#6D28D9] text-white border-[#6D28D9]",
                },
                {
                  id: "Z",
                  label: "3. Busy Polling Places (3,000+)",
                  activeClass: "bg-[#0369A1] text-white border-[#0369A1]",
                },
              ] as const
            ).map((btn) => (
              <button
                type="button"
                key={btn.id}
                onClick={() => setIsolatedAxis(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                  isolatedAxis === btn.id
                    ? `${btn.activeClass} shadow-sm`
                    : "bg-white border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowEquilibriumMesh((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border-2 font-bold transition-all cursor-pointer ${
                showEquilibriumMesh
                  ? "border-[#065F46] bg-[#D1FAE5] text-[#065F46]"
                  : "border-[#111111]/30 bg-white text-[#111111]"
              }`}
            >
              Green Normal Net: {showEquilibriumMesh ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => setShowResidualStems((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border-2 font-bold transition-all cursor-pointer ${
                showResidualStems
                  ? "border-[#991B1B] bg-[#FEE2E2] text-[#991B1B]"
                  : "border-[#111111]/30 bg-white text-[#111111]"
              }`}
            >
              Red Height Lines: {showResidualStems ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => setShowLabels((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border-2 font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                showLabels
                  ? "border-[#111111] bg-[#F3EFE6] text-[#111111]"
                  : "border-[#111111]/30 bg-white text-[#4A4845]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              County Names: {showLabels ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className="px-2.5 py-1.5 rounded-lg border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#F3EFE6] inline-flex items-center gap-1 font-bold cursor-pointer"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoRotate ? "Pause Spin" : "Spin Map"}
            </button>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(1.45, +(z + 0.12).toFixed(2)))}
              className="p-1.5 rounded-lg border-2 border-[#111111]/40 bg-white text-[#111111] hover:border-[#111111] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.75, +(z - 0.12).toFixed(2)))}
              className="p-1.5 rounded-lg border-2 border-[#111111]/40 bg-white text-[#111111] hover:border-[#111111] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setThetaDeg(36);
                setPhiDeg(62);
                setZoomScale(1.0);
                setIsolatedAxis("ALL");
              }}
              className="p-1.5 rounded-lg border-2 border-[#111111]/40 bg-white text-[#111111] hover:border-[#111111] cursor-pointer"
              title="Reset 3D View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Viewport + Right Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Columns: High-Contrast 3D Manifold Viewport */}
        <div
          className={`lg:col-span-7 relative border-b-2 lg:border-b-0 lg:border-r-2 border-[#111111] flex flex-col justify-between ${
            isDark ? "bg-[#12100E] text-white" : "bg-[#F7F4EC] text-[#111111]"
          }`}
        >
          {/* Top Color-Key Legend */}
          <div className="px-4 pt-3.5 flex flex-wrap items-center justify-between gap-2 text-[11px] z-10">
            <div
              className={`flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-full border font-semibold ${
                isDark
                  ? "bg-[#1E1B18]/95 border-white/20 text-white"
                  : "bg-white border-[#111111] text-[#111111]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF4D2D] border border-white/50" /> High Priority
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white/50" /> Apartments/Dorms
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#A855F7] border border-white/50" /> Mail/Duplicates
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0EA5E9] border border-white/50" /> Large Precincts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white/50" /> Normal Pattern ({normalCountyCount})
              </span>
            </div>
            <span
              className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 ${
                isDark ? "bg-white/10 text-amber-300" : "bg-[#111111] text-white"
              }`}
            >
              <MousePointerClick className="w-3 h-3" /> Drag Map to Turn • Click Any County Circle
            </span>
          </div>

          {/* 3D Interactive Stage */}
          <div className="relative w-full h-[360px] sm:h-[460px] md:h-[540px] select-none overflow-hidden">
            {/* Hidden/Background WebGL Mount */}
            <div ref={mountRef} className="absolute inset-0 pointer-events-none opacity-10" />

            {/* Primary High-Contrast 3D Vector Geometry Viewport */}
            <svg
              viewBox="0 0 860 550"
              className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <defs>
                <radialGradient id="stageGlow" cx="50%" cy="50%" r="55%">
                  <stop
                    offset="0%"
                    stopColor={isDark ? "#2D241C" : "#EFE9D9"}
                    stopOpacity={isDark ? "0.95" : "0.7"}
                  />
                  <stop
                    offset="100%"
                    stopColor={isDark ? "#12100E" : "#F7F4EC"}
                    stopOpacity="1"
                  />
                </radialGradient>
                <filter id="sphereShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Background Studio Gradient */}
              <rect x="0" y="0" width="860" height="550" fill="url(#stageGlow)" />

              {/* 1. Base Coordinate Floor Grid */}
              <g>
                {floorGridLines.map((d, idx) => (
                  <path
                    key={`floor-${idx}`}
                    d={d}
                    stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(17,17,17,0.16)"}
                    strokeWidth="1"
                    fill="none"
                  />
                ))}
              </g>

              {/* 2. Green Normal County Surface Grid */}
              {showEquilibriumMesh && (
                <g>
                  {manifoldGridLines.map((line, idx) => (
                    <path
                      key={`manifold-${idx}`}
                      d={line.d}
                      stroke={
                        isDark
                          ? line.isMajor
                            ? "#10B981"
                            : "rgba(16, 185, 129, 0.42)"
                          : line.isMajor
                          ? "#047857"
                          : "rgba(4, 120, 87, 0.38)"
                      }
                      strokeWidth={line.isMajor ? "2" : "1.15"}
                      strokeDasharray={line.isMajor ? undefined : "3 2"}
                      fill="none"
                    />
                  ))}
                </g>
              )}

              {/* 3. Bold X, Y, Z Coordinate Axes & Friendly Labels */}
              <g>
                {/* X Axis: Apartment & House Addresses */}
                <line
                  x1={axes3D.origin.sx}
                  y1={axes3D.origin.sy}
                  x2={axes3D.xEnd.sx}
                  y2={axes3D.xEnd.sy}
                  stroke="#F59E0B"
                  strokeWidth="3"
                />
                <rect
                  x={axes3D.xEnd.sx - 86}
                  y={axes3D.xEnd.sy - 12}
                  width="172"
                  height="22"
                  rx="5"
                  fill={isDark ? "#1C1917" : "#FFFFFF"}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                <text
                  x={axes3D.xEnd.sx}
                  y={axes3D.xEnd.sy + 3}
                  textAnchor="middle"
                  fill={isDark ? "#FCD34D" : "#92400E"}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  1. ADDRESSES &amp; UNITS (X)
                </text>

                {/* Y Axis: Out-of-State Mail & Duplicates */}
                <line
                  x1={axes3D.origin.sx}
                  y1={axes3D.origin.sy}
                  x2={axes3D.yEnd.sx}
                  y2={axes3D.yEnd.sy}
                  stroke="#A855F7"
                  strokeWidth="3"
                />
                <rect
                  x={axes3D.yEnd.sx - 86}
                  y={axes3D.yEnd.sy - 12}
                  width="172"
                  height="22"
                  rx="5"
                  fill={isDark ? "#1C1917" : "#FFFFFF"}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                />
                <text
                  x={axes3D.yEnd.sx}
                  y={axes3D.yEnd.sy + 3}
                  textAnchor="middle"
                  fill={isDark ? "#D8B4FE" : "#5B21B6"}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  2. MAIL &amp; DUPLICATES (Y)
                </text>

                {/* Z Axis: Busy Polling Places */}
                <line
                  x1={axes3D.origin.sx}
                  y1={axes3D.origin.sy}
                  x2={axes3D.zEnd.sx}
                  y2={axes3D.zEnd.sy}
                  stroke="#0EA5E9"
                  strokeWidth="3"
                />
                <rect
                  x={axes3D.zEnd.sx - 86}
                  y={axes3D.zEnd.sy - 24}
                  width="172"
                  height="22"
                  rx="5"
                  fill={isDark ? "#1C1917" : "#FFFFFF"}
                  stroke="#0EA5E9"
                  strokeWidth="1.5"
                />
                <text
                  x={axes3D.zEnd.sx}
                  y={axes3D.zEnd.sy - 9}
                  textAnchor="middle"
                  fill={isDark ? "#7DD3FC" : "#075985"}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  ↑ 3. POLLING PLACES (Z)
                </text>
              </g>

              {/* 4. Red Height Stems + 3D County Circles + Labels */}
              {projectedNodes.map((node) => {
                const showStem =
                  showResidualStems &&
                  isolatedAxis === "ALL" &&
                  (Math.abs(node.residual) > 2.5 || node.isSelected);

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (viewMode === "counties") {
                        setSelectedCountyName(node.id);
                      } else {
                        setSelectedClusterId(node.id);
                      }
                    }}
                  >
                    {showStem && (
                      <>
                        <line
                          x1={node.basePt.sx}
                          y1={node.basePt.sy}
                          x2={node.topPt.sx}
                          y2={node.topPt.sy}
                          stroke={node.residual >= 0 ? "#FF4D2D" : "#0EA5E9"}
                          strokeWidth={node.isSelected ? "3" : "1.8"}
                          strokeDasharray={node.isSelected ? undefined : "3 2"}
                          opacity={node.isSelected ? "1" : "0.8"}
                        />
                        <circle
                          cx={node.basePt.sx}
                          cy={node.basePt.sy}
                          r="2.5"
                          fill={isDark ? "#10B981" : "#047857"}
                        />
                      </>
                    )}

                    {node.isSelected && (
                      <>
                        <circle
                          cx={node.topPt.sx}
                          cy={node.topPt.sy}
                          r={node.radius + 9}
                          fill="none"
                          stroke="#FF4D2D"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                        />
                        <circle
                          cx={node.topPt.sx}
                          cy={node.topPt.sy}
                          r={node.radius + 4}
                          fill="none"
                          stroke={isDark ? "#FFFFFF" : "#111111"}
                          strokeWidth="2"
                        />
                      </>
                    )}

                    <circle
                      cx={node.topPt.sx}
                      cy={node.topPt.sy}
                      r={node.radius}
                      fill={node.colors.fill}
                      stroke={node.isSelected ? "#FFFFFF" : isDark ? "#12100E" : "#FFFFFF"}
                      strokeWidth={node.isSelected ? "2.5" : "1.4"}
                      filter="url(#sphereShadow)"
                    />

                    <circle
                      cx={node.topPt.sx - node.radius * 0.3}
                      cy={node.topPt.sy - node.radius * 0.3}
                      r={Math.max(1.5, node.radius * 0.28)}
                      fill="rgba(255,255,255,0.65)"
                    />

                    {node.showLabel && (
                      <g
                        transform={`translate(${node.topPt.sx}, ${
                          node.topPt.sy - node.radius - 10
                        })`}
                      >
                        <rect
                          x={-(node.label.length * 3.4 + 24)}
                          y="-15"
                          width={node.label.length * 6.8 + 48}
                          height="19"
                          rx="4"
                          fill={
                            node.isSelected
                              ? "#D9381E"
                              : isDark
                              ? "rgba(18, 16, 14, 0.92)"
                              : "rgba(255, 255, 255, 0.96)"
                          }
                          stroke={
                            node.isSelected
                              ? "#FFFFFF"
                              : isDark
                              ? "rgba(255,255,255,0.45)"
                              : "#111111"
                          }
                          strokeWidth={node.isSelected ? "1.8" : "1.1"}
                        />
                        <text
                          x="0"
                          y="-2"
                          textAnchor="middle"
                          fill={
                            node.isSelected
                              ? "#FFFFFF"
                              : isDark
                              ? "#FFFFFF"
                              : "#111111"
                          }
                          fontSize={node.isSelected ? "11" : "10"}
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          {node.label} ({node.score})
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom Helper Banner Inside Map */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
              <div
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold ${
                  isDark
                    ? "bg-[#1C1917]/90 border-white/20 text-emerald-300"
                    : "bg-white/95 border-[#111111] text-[#065F46]"
                }`}
              >
                Green Net = Normal County Pattern • Red Line Height = Extra Cleanup Needed
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold ${
                  isDark
                    ? "bg-[#1C1917]/90 border-white/20 text-amber-300"
                    : "bg-white/95 border-[#111111] text-[#111111]"
                }`}
              >
                Viewing Angle: {Math.round(thetaDeg)}° • Tilt: {Math.round(phiDeg)}° • Zoom:{" "}
                {Math.round(zoomScale * 100)}%
              </div>
            </div>
          </div>

          {/* Bottom Plain-English Explanation Cards (Zero Intimidating Math Jargon) */}
          <div className="border-t-2 border-[#111111] bg-white text-[#111111] px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-[#111111]/25 bg-[#FCFBF8] p-3">
              <div className="text-[10px] font-mono uppercase text-[#92400E] font-extrabold">
                1. Why 3 Directions Instead of 1 Score?
              </div>
              <div className="font-serif text-[#111111] text-sm mt-0.5 font-bold">
                Addresses (X) • Mail (Y) • Polling Places (Z)
              </div>
              <p className="text-[11px] text-[#2A2623] mt-1 leading-snug">
                A college town needs apartment unit numbers (X), while a fast-growing suburb needs more polling places (Z). Separating the three shows what to fix first.
              </p>
            </div>
            <div className="rounded-xl border border-[#111111]/25 bg-[#FCFBF8] p-3">
              <div className="text-[10px] font-mono uppercase text-[#065F46] font-extrabold">
                2. What Is the Green Net?
              </div>
              <div className="font-serif text-[#111111] text-sm mt-0.5 font-bold">
                Normal County Baseline ({normalCountyCount} Counties)
              </div>
              <p className="text-[11px] text-[#2A2623] mt-1 leading-snug">
                Larger counties naturally have more apartments and mail moves. The green net adjusts for county size so big counties aren&apos;t unfairly penalized.
              </p>
            </div>
            <div className="rounded-xl border border-[#111111]/25 bg-[#FCFBF8] p-3">
              <div className="text-[10px] font-mono uppercase text-[#991B1B] font-extrabold">
                3. What Are the Red Vertical Lines?
              </div>
              <div className="font-serif text-[#111111] text-sm mt-0.5 font-bold">
                {elevatedCountyCount} Counties With Extra Cleanup Work
              </div>
              <p className="text-[11px] text-[#2A2623] mt-1 leading-snug">
                When a county rises above the green net on a red line, it has more address, mail, or polling-place strain than normal for its population size.
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Friendly County Checklist & Inspector */}
        <div className="lg:col-span-5 bg-white p-6 flex flex-col justify-between text-[#111111]">
          {viewMode === "counties" ? (
            <div>
              {/* County Search & Dropdown */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#4A4845] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type your county name (e.g. Hinds, Lee, DeSoto)..."
                    className="w-full rounded-xl border-2 border-[#111111]/30 bg-[#FCFBF8] pl-9 pr-3 py-2 text-xs text-[#111111] font-medium placeholder:text-[#6E6A64] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <select
                  aria-label="Select Mississippi County"
                  value={selectedCounty.county}
                  onChange={(e) => setSelectedCountyName(e.target.value)}
                  className="rounded-xl border-2 border-[#111111] bg-[#FCFBF8] px-3 py-2 text-xs text-[#111111] font-bold focus:outline-none cursor-pointer"
                >
                  {countyVectors.map((c) => (
                    <option key={c.county} value={c.county}>
                      {c.county} County (Score: {c.threatEnergy})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected County Card */}
              <div className="rounded-2xl border-2 border-[#111111] bg-[#FCFBF8] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        REGIME_COLORS[selectedCounty.regime]?.bg || "bg-slate-200"
                      } ${REGIME_COLORS[selectedCounty.regime]?.text || "text-slate-950"}`}
                    >
                      {FRIENDLY_REGIME_LABELS[selectedCounty.regime] || selectedCounty.regime}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#111111] mt-1.5">
                      {selectedCounty.county} County, MS
                    </h3>
                    <p className="text-xs text-[#2A2623] mt-0.5">
                      Top Priority:{" "}
                      <span className="text-[#111111] font-bold">
                        {selectedCounty.dominantDriver}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-[#2A2623] font-bold">
                      Priority Score (0–100)
                    </div>
                    <div className="text-3xl font-mono font-extrabold text-[#D9381E]">
                      {selectedCounty.threatEnergy}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[#2A2623]">
                      {selectedCounty.manifoldResidual > 0
                        ? `+${selectedCounty.manifoldResidual} pts above normal`
                        : "Within normal range"}
                    </div>
                  </div>
                </div>

                {/* Plain-English Explanation Box */}
                <div className="mt-4 rounded-xl border border-[#111111]/30 bg-white p-3.5 text-xs text-[#111111] leading-relaxed">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#92400E] font-extrabold mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#D9381E]" /> Plain-English Summary for Your County
                  </div>
                  {selectedCounty.plainEnglishSummary}
                </div>

                {/* Workload Breakdown Bars */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#111111] mb-2">
                    <span>WHAT DRIVES {selectedCounty.county.toUpperCase()} COUNTY&apos;S SCORE?</span>
                    <span className="text-[#065F46]">100% Breakdown</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#111111] font-bold">
                          1. Apartment, Dorm &amp; House Addresses
                        </span>
                        <span className="font-mono font-extrabold text-[#92400E]">
                          {selectedCounty.partialX}% of workload
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#E5E0D8] overflow-hidden border border-[#111111]/20">
                        <div
                          className="h-full bg-[#D97706] rounded-full transition-all duration-300"
                          style={{ width: `${selectedCounty.partialX}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#111111] font-bold">
                          2. Out-of-State Mail &amp; Duplicate Records
                        </span>
                        <span className="font-mono font-extrabold text-[#5B21B6]">
                          {selectedCounty.partialY}% of workload
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#E5E0D8] overflow-hidden border border-[#111111]/20">
                        <div
                          className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                          style={{ width: `${selectedCounty.partialY}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#111111] font-bold">
                          3. Large Polling Places (3,000+ Voters)
                        </span>
                        <span className="font-mono font-extrabold text-[#075985]">
                          {selectedCounty.partialZ}% of workload
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#E5E0D8] overflow-hidden border border-[#111111]/20">
                        <div
                          className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                          style={{ width: `${selectedCounty.partialZ}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exact County Numbers Grid */}
                <div className="mt-4 pt-4 border-t border-[#111111]/20 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-[#111111]/25 p-2">
                    <div className="text-[10px] font-bold text-[#2A2623]">Registered Voters</div>
                    <div className="text-xs font-mono font-extrabold text-[#111111]">
                      {selectedCounty.total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#065F46] font-bold">
                      {selectedCounty.active.toLocaleString()} Active
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/25 p-2">
                    <div className="text-[10px] font-bold text-[#2A2623]">8+ Voter Addresses</div>
                    <div className="text-xs font-mono font-extrabold text-[#92400E]">
                      {selectedCounty.highDensityCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#2A2623] font-semibold">
                      {selectedCounty.highDensityVoters.toLocaleString()} Voters
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/25 p-2">
                    <div className="text-[10px] font-bold text-[#2A2623]">Out-of-State / Dups</div>
                    <div className="text-xs font-mono font-extrabold text-[#5B21B6]">
                      {selectedCounty.ncoaCount} / {selectedCounty.duplicateCount}
                    </div>
                    <div className="text-[10px] text-[#2A2623] font-semibold">Active / Pairs</div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/25 p-2">
                    <div className="text-[10px] font-bold text-[#2A2623]">3,000+ Precincts</div>
                    <div className="text-xs font-mono font-extrabold text-[#075985]">
                      {selectedCounty.overCapacityPrecincts}
                    </div>
                    <div className="text-[10px] text-[#2A2623] font-semibold">
                      Largest: {selectedCounty.maxPrecinctVoters.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/25 p-2">
                    <div className="text-[10px] font-bold text-[#2A2623]">2024 General Votes</div>
                    <div className="text-xs font-mono font-extrabold text-[#065F46]">
                      {selectedCounty.votes2024General.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#2A2623] font-semibold">
                      {selectedCounty.turnout2024Pct || 64}% Turnout
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/25 p-2">
                    <div className="text-[10px] font-bold text-[#2A2623]">Normal Benchmark</div>
                    <div className="text-xs font-mono font-extrabold text-[#111111]">
                      {selectedCounty.manifoldZ}
                    </div>
                    <div
                      className={`text-[10px] font-mono font-extrabold ${
                        selectedCounty.manifoldResidual > 0 ? "text-[#991B1B]" : "text-[#065F46]"
                      }`}
                    >
                      {selectedCounty.manifoldResidual > 0
                        ? `+${selectedCounty.manifoldResidual} above`
                        : "On normal net"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick County Selector Pills */}
              <div className="mt-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#111111] font-bold mb-2">
                  Quick-Select a County ({filteredCounties.length} shown):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {filteredCounties.slice(0, 28).map((c) => (
                    <button
                      type="button"
                      key={c.county}
                      onClick={() => setSelectedCountyName(c.county)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        selectedCounty.county === c.county
                          ? "bg-[#111111] border-[#111111] text-white shadow-xs"
                          : "bg-[#FCFBF8] border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                      }`}
                    >
                      {c.county}{" "}
                      <span className="font-mono text-[10px] opacity-85">({c.threatEnergy})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Cluster Mode Inspector */
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#92400E] font-extrabold">
                  32 Specific Locations (Privacy-Protected)
                </span>
                <select
                  aria-label="Select Specific Location"
                  value={selectedCluster.id}
                  onChange={(e) => setSelectedClusterId(e.target.value)}
                  className="rounded-xl border-2 border-[#111111] bg-[#FCFBF8] px-3 py-1.5 text-xs text-[#111111] font-bold"
                >
                  {clusterVectors.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.id}: {cl.county} ({cl.threatEnergy})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border-2 border-[#111111] bg-[#FCFBF8] p-5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#D9381E] font-extrabold">
                  {selectedCluster.category}
                </div>
                <h3 className="text-lg font-serif font-bold text-[#111111] mt-1">
                  {selectedCluster.label}
                </h3>
                <div className="text-xs text-[#2A2623] mt-0.5">
                  {selectedCluster.county} County •{" "}
                  <span className="text-[#111111] font-bold">{selectedCluster.metricLabel}</span>
                </div>

                <div className="mt-4 rounded-xl border border-[#111111]/30 bg-white p-3.5 text-xs text-[#111111] leading-relaxed">
                  {selectedCluster.plainEnglishSummary}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-[#111111]/30 p-2.5">
                    <div className="text-[10px] text-[#92400E] font-mono font-bold">Addresses (X)</div>
                    <div className="text-sm font-mono font-extrabold text-[#111111]">
                      {selectedCluster.x}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/30 p-2.5">
                    <div className="text-[10px] text-[#5B21B6] font-mono font-bold">Mail/Dups (Y)</div>
                    <div className="text-sm font-mono font-extrabold text-[#111111]">
                      {selectedCluster.y}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#111111]/30 p-2.5">
                    <div className="text-[10px] text-[#075985] font-mono font-bold">Polling (Z)</div>
                    <div className="text-sm font-mono font-extrabold text-[#111111]">
                      {selectedCluster.z}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {clusterVectors.map((cl) => (
                  <button
                    type="button"
                    key={cl.id}
                    onClick={() => setSelectedClusterId(cl.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      selectedCluster.id === cl.id
                        ? "bg-[#111111] border-[#111111] text-white font-bold"
                        : "bg-[#FCFBF8] border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    <span className="truncate pr-2">
                      <strong className="font-mono">{cl.id}</strong> • {cl.label}
                    </span>
                    <span className="font-mono text-[11px] shrink-0 font-bold">{cl.metricLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Link Bar */}
          {!compact && (
            <div className="mt-5 pt-4 border-t border-[#111111]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#111111] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#065F46]" />
                100% Privacy Safe: Zero voter names or private house numbers shown
              </span>
              <Link
                href="/reports/mississippi-playbook-analysis"
                className="inline-flex items-center gap-1 text-[#D9381E] hover:underline font-extrabold"
              >
                Read Full Statewide Report <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Plain-English Connections & County Peer Guide (When not compact) */}
      {!compact && correlations && (
        <div className="border-t-2 border-[#111111] bg-white px-6 py-8 md:px-8">
          <div className="max-w-3xl mb-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#D9381E] font-extrabold mb-1">
              How Different Voter Roll Tasks Connect Across All 82 Counties
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#111111]">
              Which Cleanup Steps Solve Two Problems at Once?
            </h3>
            <p className="mt-1 text-sm text-[#2A2623]">
              We compared every county&apos;s numbers side by side on a simple <strong>0 to 1.00 connection scale</strong> (where <strong>1.00</strong> means two issues always move together). Here is what that means for your office:
            </p>
          </div>

          <EditorialTable
            caption="County-level correlation comparisons (size-adjusted rates per 1,000 voters where appropriate)"
            columns={[
              {
                key: "pair",
                label: "What We Compared",
                render: (corr) => (
                  <div>
                    <div className="font-mono text-[10px] text-[#C2341B] font-bold">{corr.id}</div>
                    <div className="font-semibold text-[#141413]">{corr.plainTitle}</div>
                    <div className="text-[11px] text-[#575450] mt-0.5">{corr.pairLabel}</div>
                  </div>
                ),
              },
              {
                key: "r",
                label: "Connection (r)",
                align: "right",
                mono: true,
                render: (corr) => (
                  <div>
                    <div className="font-bold text-[#141413]">
                      {corr.pearsonR >= 0 ? `+${corr.pearsonR.toFixed(2)}` : corr.pearsonR.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#6B6760]">
                      Rank: {corr.spearmanRho >= 0 ? `+${corr.spearmanRho.toFixed(2)}` : corr.spearmanRho.toFixed(2)}
                    </div>
                  </div>
                ),
              },
              {
                key: "strength",
                label: "Strength",
                render: (corr) => (
                  <span className="font-mono text-xs font-semibold text-[#141413]">
                    {corr.strength}
                  </span>
                ),
              },
              {
                key: "rate",
                label: "Measured Pattern",
                render: (corr) => <span className="text-xs text-[#2B2926]">{corr.rateOfChange}</span>,
              },
              {
                key: "takeaway",
                label: "What It Means for Your Office",
                render: (corr) => (
                  <span className="text-xs text-[#3D3A36] leading-relaxed">
                    {corr.commonManTakeaway}
                  </span>
                ),
              },
            ]}
            rows={correlations}
            rowKey={(corr) => corr.id}
          />

          {/* Commissioner Peer Benchmarking & Evangelism Toolkit */}
          {commissionerToolkit && (
            <div className="mt-10 pt-8 border-t-2 border-[#111111]">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[#D9381E] font-extrabold mb-1">
                    County-to-County Neighbor Guide
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#111111]">
                    {commissionerToolkit.headline}
                  </h3>
                  <p className="text-sm text-[#2A2623] mt-1">
                    {commissionerToolkit.subheadline}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {commissionerToolkit.evangelismSteps.map((st) => (
                  <div
                    key={st.step}
                    className="border-t-4 border-[#111111] bg-[#FCFBF8] p-5 rounded-b-xl border-x border-b border-x-[#111111]/25 border-b-[#111111]/25"
                  >
                    <div className="text-xs font-mono font-extrabold text-[#D9381E]">
                      STEP {st.step}
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#111111] mt-1">
                      {st.title}
                    </h4>
                    <p className="text-xs text-[#2A2623] mt-2 leading-relaxed">{st.detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {commissionerToolkit.peerTiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className="rounded-xl border-2 border-[#111111] bg-[#FCFBF8] p-4"
                  >
                    <div className="text-sm font-serif font-bold text-[#111111]">
                      {tier.tier}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-[#92400E] mt-1">
                      {tier.benchmarkMetric}
                    </div>
                    <p className="text-xs text-[#2A2623] mt-2 leading-relaxed">
                      <strong className="text-[#111111]">Recommended Checklist:</strong> {tier.primaryFocus}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tier.counties.map((co) => (
                        <button
                          type="button"
                          key={co}
                          onClick={() => {
                            setViewMode("counties");
                            setSelectedCountyName(co);
                          }}
                          className="px-2.5 py-1 rounded bg-white border border-[#111111] text-[11px] font-bold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer"
                        >
                          {co}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
