"use client";

import React, { useState, useMemo, useEffect, useRef, useId } from "react";
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
  Maximize2,
  Minimize2,
  X,
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

// Concise, non-wrapping status labels for badges
const FRIENDLY_REGIME_LABELS: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "Needs Attention in All 3 Areas",
  "Axis-X Spatial Domicile Ridge": "Focus: Apartments & Dorm Units",
  "Axis-Y Interstate Drift Ridge": "Focus: Out-of-State Mail & Dups",
  "Axis-Z Precinct Strain Ridge": "Focus: Large Precincts (3,000+)",
  "Equilibrium Manifold Surface": "On Track: Normal County Range",
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
  const dialogTitleId = useId();

  // Interactive 3D State
  const [viewMode, setViewMode] = useState<ViewMode>("counties");
  const [isolatedAxis, setIsolatedAxis] = useState<IsolatedAxis>("ALL");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("obsidian");
  const [showEquilibriumMesh, setShowEquilibriumMesh] = useState(true);
  const [showResidualStems, setShowResidualStems] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>("Hinds");
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusterVectors[0]?.id || "CL-DOM-01"
  );

  // Spherical Camera Angles (in degrees) — larger initial zoomScale (1.18) so the 3D model fills the stage
  const [thetaDeg, setThetaDeg] = useState<number>(36);
  const [phiDeg, setPhiDeg] = useState<number>(62);
  const [zoomScale, setZoomScale] = useState<number>(1.18);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const fullscreenDialogRef = useRef<HTMLDialogElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragDistRef = useRef(0);
  const prevPtrRef = useRef({ x: 0, y: 0 });

  const normalCountyCount = countyVectors.filter(
    (c) => c.regime === "Equilibrium Manifold Surface"
  ).length;
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

  // Native <dialog> Full Screen Modal controller (modern-web-guidance: dialog)
  const openFullScreen = () => {
    const dlg = fullscreenDialogRef.current;
    if (dlg && !dlg.open) {
      dlg.showModal();
      setIsFullScreen(true);
    }
  };

  const closeFullScreen = () => {
    const dlg = fullscreenDialogRef.current;
    if (dlg && dlg.open) {
      dlg.close();
    }
    setIsFullScreen(false);
  };

  useEffect(() => {
    const dlg = fullscreenDialogRef.current;
    if (!dlg) return;
    const handleClose = () => {
      dlg.returnValue = "";
      setIsFullScreen(false);
    };
    dlg.addEventListener("close", handleClose);
    return () => dlg.removeEventListener("close", handleClose);
  }, []);

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
      const width = container.clientWidth || 1000;
      const height = container.clientHeight || 680;
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

  // Deterministic 3D-to-2D Perspective Projection Math (wider 1000x640 stage with larger fovScale)
  const project3DPoint = useMemo(() => {
    const radTheta = (thetaDeg * Math.PI) / 180;
    const radPhi = (phiDeg * Math.PI) / 180;
    const camR = 175 / zoomScale;

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

    const fovScale = 640 * zoomScale;
    const centerX = 500;
    const centerY = 330;

    return (dataX: number, dataY: number, dataZ: number) => {
      const wx = (dataX - 50) * 1.15;
      const wy = (dataZ - 34) * 1.02;
      const wz = (dataY - 50) * 1.15;

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

  // Project and depth-sort all active 3D nodes (larger sphere radii and readable 13-15px labels)
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
            7.0,
            Math.min(18.5, 4.8 + Math.log10(Math.max(1000, cv.total)) * 2.5)
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
                (ALWAYS_LABELED_COUNTIES.has(cv.county) || cv.threatEnergy >= 43)),
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
          const radius = Math.max(8.0, Math.min(17, cl.threatEnergy / 5.5));
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

  // Reusable 3D SVG Canvas Renderer (used in both Main Stage and Full Screen Dialog)
  const render3DCanvasSvg = (idSuffix: string) => (
    <svg
      viewBox="0 0 1000 640"
      className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <defs>
        <radialGradient id={`stageGlow-${idSuffix}`} cx="50%" cy="50%" r="58%">
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
        <filter id={`sphereShadow-${idSuffix}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Background Studio Gradient */}
      <rect x="0" y="0" width="1000" height="640" fill={`url(#stageGlow-${idSuffix})`} />

      {/* 1. Base Coordinate Floor Grid */}
      <g>
        {floorGridLines.map((d, idx) => (
          <path
            key={`floor-${idSuffix}-${idx}`}
            d={d}
            stroke={isDark ? "rgba(255,255,255,0.13)" : "rgba(17,17,17,0.16)"}
            strokeWidth="1.2"
            fill="none"
          />
        ))}
      </g>

      {/* 2. Green Normal County Surface Grid */}
      {showEquilibriumMesh && (
        <g>
          {manifoldGridLines.map((line, idx) => (
            <path
              key={`manifold-${idSuffix}-${idx}`}
              d={line.d}
              stroke={
                isDark
                  ? line.isMajor
                    ? "#10B981"
                    : "rgba(16, 185, 129, 0.45)"
                  : line.isMajor
                  ? "#047857"
                  : "rgba(4, 120, 87, 0.4)"
              }
              strokeWidth={line.isMajor ? "2.4" : "1.3"}
              strokeDasharray={line.isMajor ? undefined : "4 3"}
              fill="none"
            />
          ))}
        </g>
      )}

      {/* 3. Bold X, Y, Z Coordinate Axes & Readable 13px Non-Wrapping Labels */}
      <g>
        {/* X Axis: Apartment & House Addresses */}
        <line
          x1={axes3D.origin.sx}
          y1={axes3D.origin.sy}
          x2={axes3D.xEnd.sx}
          y2={axes3D.xEnd.sy}
          stroke="#F59E0B"
          strokeWidth="3.5"
        />
        <rect
          x={axes3D.xEnd.sx - 108}
          y={axes3D.xEnd.sy - 15}
          width="216"
          height="28"
          rx="6"
          fill={isDark ? "#1C1917" : "#FFFFFF"}
          stroke="#F59E0B"
          strokeWidth="2"
        />
        <text
          x={axes3D.xEnd.sx}
          y={axes3D.xEnd.sy + 4}
          textAnchor="middle"
          fill={isDark ? "#FCD34D" : "#92400E"}
          fontSize="13"
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
          strokeWidth="3.5"
        />
        <rect
          x={axes3D.yEnd.sx - 108}
          y={axes3D.yEnd.sy - 15}
          width="216"
          height="28"
          rx="6"
          fill={isDark ? "#1C1917" : "#FFFFFF"}
          stroke="#A855F7"
          strokeWidth="2"
        />
        <text
          x={axes3D.yEnd.sx}
          y={axes3D.yEnd.sy + 4}
          textAnchor="middle"
          fill={isDark ? "#D8B4FE" : "#5B21B6"}
          fontSize="13"
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
          strokeWidth="3.5"
        />
        <rect
          x={axes3D.zEnd.sx - 108}
          y={axes3D.zEnd.sy - 28}
          width="216"
          height="28"
          rx="6"
          fill={isDark ? "#1C1917" : "#FFFFFF"}
          stroke="#0EA5E9"
          strokeWidth="2"
        />
        <text
          x={axes3D.zEnd.sx}
          y={axes3D.zEnd.sy - 10}
          textAnchor="middle"
          fill={isDark ? "#7DD3FC" : "#075985"}
          fontSize="13"
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
        const labelText = `${node.label} (${node.score})`;
        const pillWidth = Math.max(110, labelText.length * 8.4 + 28);

        return (
          <g
            key={`${idSuffix}-${node.id}`}
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
                  strokeWidth={node.isSelected ? "3.5" : "2.1"}
                  strokeDasharray={node.isSelected ? undefined : "4 3"}
                  opacity={node.isSelected ? "1" : "0.85"}
                />
                <circle
                  cx={node.basePt.sx}
                  cy={node.basePt.sy}
                  r="3.2"
                  fill={isDark ? "#10B981" : "#047857"}
                />
              </>
            )}

            {node.isSelected && (
              <>
                <circle
                  cx={node.topPt.sx}
                  cy={node.topPt.sy}
                  r={node.radius + 10}
                  fill="none"
                  stroke="#FF4D2D"
                  strokeWidth="2.8"
                  strokeDasharray="5 3"
                />
                <circle
                  cx={node.topPt.sx}
                  cy={node.topPt.sy}
                  r={node.radius + 4.5}
                  fill="none"
                  stroke={isDark ? "#FFFFFF" : "#111111"}
                  strokeWidth="2.2"
                />
              </>
            )}

            <circle
              cx={node.topPt.sx}
              cy={node.topPt.sy}
              r={node.radius}
              fill={node.colors.fill}
              stroke={node.isSelected ? "#FFFFFF" : isDark ? "#12100E" : "#FFFFFF"}
              strokeWidth={node.isSelected ? "2.8" : "1.6"}
              filter={`url(#sphereShadow-${idSuffix})`}
            />

            <circle
              cx={node.topPt.sx - node.radius * 0.3}
              cy={node.topPt.sy - node.radius * 0.3}
              r={Math.max(1.8, node.radius * 0.28)}
              fill="rgba(255,255,255,0.68)"
            />

            {node.showLabel && (
              <g
                transform={`translate(${node.topPt.sx}, ${
                  node.topPt.sy - node.radius - 13
                })`}
              >
                <rect
                  x={-pillWidth / 2}
                  y="-19"
                  width={pillWidth}
                  height="25"
                  rx="5"
                  fill={
                    node.isSelected
                      ? "#C2341B"
                      : isDark
                      ? "rgba(18, 16, 14, 0.94)"
                      : "rgba(255, 255, 255, 0.97)"
                  }
                  stroke={
                    node.isSelected
                      ? "#FFFFFF"
                      : isDark
                      ? "rgba(255,255,255,0.5)"
                      : "#111111"
                  }
                  strokeWidth={node.isSelected ? "2" : "1.3"}
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
                  fontSize={node.isSelected ? "14" : "13"}
                  fontWeight="800"
                  fontFamily="sans-serif"
                >
                  {labelText}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );

  // Reusable Control Toolbar (non-wrapping buttons, >=16px text-base font)
  const renderControlBar = (inModal = false) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Topic Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-mono font-bold uppercase tracking-wider text-[#111111] mr-1 inline-flex items-center gap-1.5 whitespace-nowrap">
          <Sliders className="w-4 h-4 text-[#C2341B] shrink-0" />
          Topic Filter:
        </span>
        {(
          [
            {
              id: "ALL",
              label: "All 3 Topics",
              activeClass: "bg-[#111111] text-white border-[#111111]",
            },
            {
              id: "X",
              label: "1. Addresses & Units",
              activeClass: "bg-[#B45309] text-white border-[#B45309]",
            },
            {
              id: "Y",
              label: "2. Mail & Duplicates",
              activeClass: "bg-[#6D28D9] text-white border-[#6D28D9]",
            },
            {
              id: "Z",
              label: "3. Precincts (3,000+)",
              activeClass: "bg-[#0369A1] text-white border-[#0369A1]",
            },
          ] as const
        ).map((btn) => (
          <button
            type="button"
            key={btn.id}
            onClick={() => setIsolatedAxis(btn.id)}
            className={`px-3.5 py-2 rounded-xl text-base font-bold border-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isolatedAxis === btn.id
                ? `${btn.activeClass} shadow-sm`
                : "bg-white border-[#111111]/35 text-[#111111] hover:border-[#111111]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Layer & Camera Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEquilibriumMesh((v) => !v)}
          className={`px-3.5 py-2 rounded-xl border-2 text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            showEquilibriumMesh
              ? "border-[#065F46] bg-[#D1FAE5] text-[#065F46]"
              : "border-[#111111]/35 bg-white text-[#111111]"
          }`}
        >
          Green Net: {showEquilibriumMesh ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={() => setShowResidualStems((v) => !v)}
          className={`px-3.5 py-2 rounded-xl border-2 text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            showResidualStems
              ? "border-[#991B1B] bg-[#FEE2E2] text-[#991B1B]"
              : "border-[#111111]/35 bg-white text-[#111111]"
          }`}
        >
          Red Lines: {showResidualStems ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={() => setShowLabels((v) => !v)}
          className={`px-3.5 py-2 rounded-xl border-2 text-base font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            showLabels
              ? "border-[#111111] bg-[#F3EFE6] text-[#111111]"
              : "border-[#111111]/35 bg-white text-[#4A4845]"
          }`}
        >
          <Eye className="w-4 h-4 shrink-0" />
          Names: {showLabels ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="px-3.5 py-2 rounded-xl border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#F3EFE6] inline-flex items-center gap-1.5 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
        >
          {autoRotate ? <Pause className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 shrink-0" />}
          {autoRotate ? "Pause Spin" : "Spin Map"}
        </button>
        <button
          type="button"
          onClick={() => setZoomScale((z) => Math.min(1.75, +(z + 0.14).toFixed(2)))}
          className="px-3 py-2 rounded-xl border-2 border-[#111111]/45 bg-white text-[#111111] hover:border-[#111111] inline-flex items-center gap-1 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 shrink-0" /> Zoom +
        </button>
        <button
          type="button"
          onClick={() => setZoomScale((z) => Math.max(0.8, +(z - 0.14).toFixed(2)))}
          className="px-3 py-2 rounded-xl border-2 border-[#111111]/45 bg-white text-[#111111] hover:border-[#111111] inline-flex items-center gap-1 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 shrink-0" /> Zoom −
        </button>
        <button
          type="button"
          onClick={() => {
            setThetaDeg(36);
            setPhiDeg(62);
            setZoomScale(1.18);
            setIsolatedAxis("ALL");
          }}
          className="px-3 py-2 rounded-xl border-2 border-[#111111]/45 bg-white text-[#111111] hover:border-[#111111] inline-flex items-center gap-1 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
          title="Reset 3D View"
        >
          <RotateCcw className="w-4 h-4 shrink-0" /> Reset
        </button>
        {!inModal ? (
          <button
            type="button"
            onClick={openFullScreen}
            className="px-4 py-2 rounded-xl border-2 border-[#111111] bg-[#C2341B] hover:bg-[#A52A15] text-white inline-flex items-center gap-2 text-base font-bold shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            Full Screen 3D
          </button>
        ) : (
          <button
            type="button"
            onClick={closeFullScreen}
            className="px-4 py-2 rounded-xl border-2 border-[#111111] bg-[#111111] hover:bg-[#2B2926] text-white inline-flex items-center gap-2 text-base font-bold shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <Minimize2 className="w-4 h-4 shrink-0" />
            Exit Full Screen (Esc)
          </button>
        )}
      </div>
    </div>
  );

  // Reusable County & Cluster Inspector Panel (16px minimum font, non-wrapping badges)
  const renderInspectorPanel = (isModal = false) => (
    <div className="bg-white p-5 sm:p-6 flex flex-col justify-between text-[#111111] h-full">
      {viewMode === "counties" ? (
        <div>
          {/* County Search & Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#4A4845] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search county (e.g. Hinds, Lee, DeSoto)..."
                className="w-full h-11 rounded-xl border-2 border-[#111111]/35 bg-[#FCFBF8] pl-10 pr-3 text-base text-[#111111] font-medium placeholder:text-[#6E6A64] focus:outline-none focus:border-[#111111]"
              />
            </div>
            <select
              aria-label="Select Mississippi County"
              value={selectedCounty.county}
              onChange={(e) => setSelectedCountyName(e.target.value)}
              className="h-11 rounded-xl border-2 border-[#111111] bg-[#FCFBF8] px-3.5 text-base text-[#111111] font-bold focus:outline-none cursor-pointer whitespace-nowrap shrink-0"
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base font-bold whitespace-nowrap ${
                    REGIME_COLORS[selectedCounty.regime]?.bg || "bg-slate-200"
                  } ${REGIME_COLORS[selectedCounty.regime]?.text || "text-slate-950"}`}
                >
                  {FRIENDLY_REGIME_LABELS[selectedCounty.regime] || selectedCounty.regime}
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111] mt-2">
                  {selectedCounty.county} County, MS
                </h3>
                <p className="text-base text-[#2A2623] mt-1">
                  Top Priority:{" "}
                  <span className="text-[#111111] font-bold">{selectedCounty.dominantDriver}</span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-base font-mono uppercase text-[#2A2623] font-bold whitespace-nowrap">
                  Priority Score (0–100)
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#C2341B]">
                  {selectedCounty.threatEnergy}
                </div>
                <div className="text-base font-mono font-semibold text-[#2A2623] whitespace-nowrap">
                  {selectedCounty.manifoldResidual > 0
                    ? `+${selectedCounty.manifoldResidual} pts above normal`
                    : "Within normal range"}
                </div>
              </div>
            </div>

            {/* Plain-English Explanation Box */}
            <div className="mt-4 rounded-xl border border-[#111111]/30 bg-white p-4 text-base text-[#111111] leading-relaxed">
              <div className="text-base font-mono uppercase tracking-wider text-[#92400E] font-extrabold mb-1.5 flex items-center gap-2 whitespace-nowrap">
                <Info className="w-4 h-4 text-[#C2341B] shrink-0" /> Plain-English County Summary
              </div>
              {selectedCounty.plainEnglishSummary}
            </div>

            {/* Workload Breakdown Bars */}
            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-base font-mono font-bold text-[#111111] mb-3">
                <span className="whitespace-nowrap">
                  {selectedCounty.county.toUpperCase()} WORKLOAD MIX
                </span>
                <span className="text-[#065F46] whitespace-nowrap">100% Breakdown</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between gap-2 text-base mb-1">
                    <span className="text-[#111111] font-bold whitespace-nowrap">
                      1. Addresses &amp; Unit Numbers
                    </span>
                    <span className="font-mono font-extrabold text-[#92400E] whitespace-nowrap">
                      {selectedCounty.partialX}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#E5E0D8] overflow-hidden border border-[#111111]/20">
                    <div
                      className="h-full bg-[#D97706] rounded-full transition-all duration-300"
                      style={{ width: `${selectedCounty.partialX}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between gap-2 text-base mb-1">
                    <span className="text-[#111111] font-bold whitespace-nowrap">
                      2. Out-of-State Mail &amp; Duplicates
                    </span>
                    <span className="font-mono font-extrabold text-[#5B21B6] whitespace-nowrap">
                      {selectedCounty.partialY}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#E5E0D8] overflow-hidden border border-[#111111]/20">
                    <div
                      className="h-full bg-[#7C3AED] rounded-full transition-all duration-300"
                      style={{ width: `${selectedCounty.partialY}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between gap-2 text-base mb-1">
                    <span className="text-[#111111] font-bold whitespace-nowrap">
                      3. Large Precincts (3,000+)
                    </span>
                    <span className="font-mono font-extrabold text-[#075985] whitespace-nowrap">
                      {selectedCounty.partialZ}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#E5E0D8] overflow-hidden border border-[#111111]/20">
                    <div
                      className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                      style={{ width: `${selectedCounty.partialZ}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exact County Numbers Grid (2 columns so labels never wrap awkwardly) */}
            <div className="mt-5 pt-4 border-t border-[#111111]/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white border border-[#111111]/25 p-3">
                <div className="text-base font-bold text-[#2A2623] whitespace-nowrap">
                  Registered Voters
                </div>
                <div className="text-lg font-mono font-extrabold text-[#111111] mt-0.5">
                  {selectedCounty.total.toLocaleString()}
                </div>
                <div className="text-base text-[#065F46] font-bold whitespace-nowrap">
                  {selectedCounty.active.toLocaleString()} Active
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#111111]/25 p-3">
                <div className="text-base font-bold text-[#2A2623] whitespace-nowrap">
                  8+ Voter Addresses
                </div>
                <div className="text-lg font-mono font-extrabold text-[#92400E] mt-0.5">
                  {selectedCounty.highDensityCount.toLocaleString()}
                </div>
                <div className="text-base text-[#2A2623] font-semibold whitespace-nowrap">
                  {selectedCounty.highDensityVoters.toLocaleString()} Voters
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#111111]/25 p-3">
                <div className="text-base font-bold text-[#2A2623] whitespace-nowrap">
                  Out-of-State / Dups
                </div>
                <div className="text-lg font-mono font-extrabold text-[#5B21B6] mt-0.5">
                  {selectedCounty.ncoaCount} / {selectedCounty.duplicateCount}
                </div>
                <div className="text-base text-[#2A2623] font-semibold whitespace-nowrap">
                  Active Mail / Dup Pairs
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#111111]/25 p-3">
                <div className="text-base font-bold text-[#2A2623] whitespace-nowrap">
                  3,000+ Precincts
                </div>
                <div className="text-lg font-mono font-extrabold text-[#075985] mt-0.5">
                  {selectedCounty.overCapacityPrecincts}
                </div>
                <div className="text-base text-[#2A2623] font-semibold whitespace-nowrap">
                  Largest: {selectedCounty.maxPrecinctVoters.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick County Selector Pills */}
          <div className="mt-5">
            <div className="text-base font-mono uppercase tracking-wider text-[#111111] font-bold mb-2.5 whitespace-nowrap">
              Quick-Select a County ({filteredCounties.length} shown):
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredCounties.slice(0, isModal ? 40 : 24).map((c) => (
                <button
                  type="button"
                  key={c.county}
                  onClick={() => setSelectedCountyName(c.county)}
                  className={`px-3 py-1.5 rounded-xl text-base font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCounty.county === c.county
                      ? "bg-[#111111] border-[#111111] text-white shadow-xs"
                      : "bg-[#FCFBF8] border-[#111111]/35 text-[#111111] hover:border-[#111111]"
                  }`}
                >
                  {c.county} <span className="font-mono opacity-85">({c.threatEnergy})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Cluster Mode Inspector */
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-mono uppercase tracking-wider text-[#92400E] font-extrabold whitespace-nowrap">
              32 Specific Locations (Zero-PII)
            </span>
            <select
              aria-label="Select Specific Location"
              value={selectedCluster.id}
              onChange={(e) => setSelectedClusterId(e.target.value)}
              className="h-11 rounded-xl border-2 border-[#111111] bg-[#FCFBF8] px-3.5 text-base text-[#111111] font-bold whitespace-nowrap"
            >
              {clusterVectors.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.id}: {cl.county} ({cl.threatEnergy})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border-2 border-[#111111] bg-[#FCFBF8] p-5">
            <div className="text-base font-mono uppercase tracking-wider text-[#C2341B] font-extrabold">
              {selectedCluster.category}
            </div>
            <h3 className="text-xl font-serif font-bold text-[#111111] mt-1">
              {selectedCluster.label}
            </h3>
            <div className="text-base text-[#2A2623] mt-1">
              {selectedCluster.county} County •{" "}
              <span className="text-[#111111] font-bold">{selectedCluster.metricLabel}</span>
            </div>

            <div className="mt-4 rounded-xl border border-[#111111]/30 bg-white p-4 text-base text-[#111111] leading-relaxed">
              {selectedCluster.plainEnglishSummary}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-white border border-[#111111]/30 p-3">
                <div className="text-base text-[#92400E] font-mono font-bold whitespace-nowrap">
                  Addresses (X)
                </div>
                <div className="text-lg font-mono font-extrabold text-[#111111]">
                  {selectedCluster.x}
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#111111]/30 p-3">
                <div className="text-base text-[#5B21B6] font-mono font-bold whitespace-nowrap">
                  Mail/Dups (Y)
                </div>
                <div className="text-lg font-mono font-extrabold text-[#111111]">
                  {selectedCluster.y}
                </div>
              </div>
              <div className="rounded-xl bg-white border border-[#111111]/30 p-3">
                <div className="text-base text-[#075985] font-mono font-bold whitespace-nowrap">
                  Polling (Z)
                </div>
                <div className="text-lg font-mono font-extrabold text-[#111111]">
                  {selectedCluster.z}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 max-h-56 overflow-y-auto space-y-2 pr-1">
            {clusterVectors.map((cl) => (
              <button
                type="button"
                key={cl.id}
                onClick={() => setSelectedClusterId(cl.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-base flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  selectedCluster.id === cl.id
                    ? "bg-[#111111] border-[#111111] text-white font-bold"
                    : "bg-[#FCFBF8] border-[#111111]/35 text-[#111111] hover:border-[#111111]"
                }`}
              >
                <span className="truncate">
                  <strong className="font-mono">{cl.id}</strong> • {cl.label}
                </span>
                <span className="font-mono text-base shrink-0 font-bold whitespace-nowrap">
                  {cl.metricLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Link Bar */}
      {!compact && (
        <div className="mt-5 pt-4 border-t border-[#111111]/20 flex flex-wrap items-center justify-between gap-3 text-base">
          <span className="text-[#111111] flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-[#065F46] shrink-0" />
            100% Privacy Safe: Zero personal names or house numbers
          </span>
          <Link
            href="/reports/mississippi-playbook-analysis"
            className="inline-flex items-center gap-1.5 text-[#C2341B] hover:underline font-extrabold whitespace-nowrap"
          >
            Read Full Statewide Report <ArrowUpRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border-2 border-[#111111] bg-[#FCFBF8] text-[#111111] shadow-xl overflow-hidden">
      {/* Top Plain-English Header Banner */}
      <div className="border-b-2 border-[#111111] bg-white px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#FFF8EB] px-3.5 py-1.5 text-base font-mono font-bold uppercase tracking-wider text-[#92400E] mb-3 whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-[#C2341B] shrink-0" />
              Interactive 3D County Map • Built for Election Officials
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#111111]">
              See Your County&apos;s Exact Voter Roll Checklist in 3D
            </h2>
            <p className="mt-2.5 text-base sm:text-lg text-[#2A2623] max-w-3xl leading-relaxed">
              Think of the <strong className="text-[#065F46]">smooth green net</strong> below as normal for Mississippi&apos;s population.{" "}
              <strong>
                {normalCountyCount} of our {countyVectors.length} counties
              </strong>{" "}
              sit right on that healthy green net. The{" "}
              <strong className="text-[#C2341B]">
                {elevatedCountyCount} counties floating above the net
              </strong>{" "}
              simply have specific cleanup tasks—like adding apartment unit numbers, sending out-of-state mail postcards, or adding check-in books at busy polling places.
            </p>
          </div>

          {/* Mode, Theme & Full Screen Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl border-2 border-[#111111] bg-[#F3EFE6] p-1">
              <button
                type="button"
                onClick={() => setViewMode("counties")}
                className={`px-4 py-2 rounded-lg text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
                className={`px-4 py-2 rounded-lg text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#111111] bg-white hover:bg-[#F3EFE6] text-base font-bold text-[#111111] cursor-pointer whitespace-nowrap shrink-0"
              title="Switch 3D Map Background Between Dark and Light"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
              {isDark ? "Light Background" : "Dark 3D Studio"}
            </button>
          </div>
        </div>

        {/* Plain-English Primer: "What Is a 3D Manifold & How Do I Read It?" */}
        <div className="mt-5 rounded-xl border-2 border-[#111111] bg-[#FFFDF9] p-5 text-base">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#D4CFC7]">
            <div>
              <div className="font-mono text-base font-bold uppercase tracking-wider text-[#C2341B]">
                Plain-English Visual Guide
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-0.5">
                What Is a &ldquo;Manifold&rdquo; and How Do I Read This 3D Map?
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#065F46]/30 text-base font-bold text-[#065F46] whitespace-nowrap">
              No Math Background Needed
            </span>
          </div>

          <p className="text-base text-[#2A2623] leading-relaxed mb-4">
            In everyday terms, a <strong>manifold</strong> is just a <strong>smooth curved surface—like a topographical terrain map or a stretched green safety net</strong>. Because big counties naturally have more apartments, more mail forwardings, and larger polling places than small rural counties, a single flat score would unfairly penalize larger counties. The <strong>green net</strong> curves upward with county population to show what is <em>normal</em> for a county of any size.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#111111]/25 bg-white p-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-full bg-[#065F46] text-white font-mono text-base font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div className="font-serif text-lg font-bold text-[#111111] whitespace-nowrap">
                  The Green Net = Normal
                </div>
              </div>
              <p className="text-base text-[#3A3530] leading-relaxed">
                <strong>{normalCountyCount} of 82 counties</strong> sit right on the smooth green net. Their address, mail, and precinct numbers match what we expect for their population.
              </p>
            </div>

            <div className="rounded-xl border border-[#111111]/25 bg-white p-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-full bg-[#C2341B] text-white font-mono text-base font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div className="font-serif text-lg font-bold text-[#111111] whitespace-nowrap">
                  Red Vertical Lines = Extra Work
                </div>
              </div>
              <p className="text-base text-[#3A3530] leading-relaxed">
                When a circle floats <strong>above the green net on a red vertical stem</strong> ({elevatedCountyCount} counties), the height of that red line shows how much extra cleanup work that county has.
              </p>
            </div>

            <div className="rounded-xl border border-[#111111]/25 bg-white p-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-7 h-7 rounded-full bg-[#111111] text-white font-mono text-base font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div className="font-serif text-lg font-bold text-[#111111] whitespace-nowrap">
                  Circle Color = Which Task
                </div>
              </div>
              <p className="text-base text-[#3A3530] leading-relaxed">
                <strong>Orange (X)</strong> = apartment/dorm units; <strong>Purple (Y)</strong> = out-of-state mail &amp; duplicates; <strong>Blue (Z)</strong> = 3,000+ precincts; <strong>Red</strong> = all three at once.
              </p>
            </div>
          </div>
        </div>

        {/* One-Click Issue Focus Filter Bar */}
        <div className="mt-5 pt-4 border-t border-[#D4CFC7]">{renderControlBar(false)}</div>
      </div>

      {/* Main 3D Viewport + Inspector Split (Full-width in compact report mode so 3D map is much larger!) */}
      <div className={`grid grid-cols-1 ${compact ? "" : "xl:grid-cols-12"}`}>
        {/* High-Contrast 3D Manifold Viewport */}
        <div
          className={`${
            compact ? "" : "xl:col-span-8 xl:border-r-2"
          } relative border-b-2 border-[#111111] flex flex-col justify-between ${
            isDark ? "bg-[#12100E] text-white" : "bg-[#F7F4EC] text-[#111111]"
          }`}
        >
          {/* Top Color-Key Legend */}
          <div className="px-5 pt-4 flex flex-wrap items-center justify-between gap-3 text-base z-10">
            <div
              className={`flex flex-wrap items-center gap-3.5 px-4 py-2 rounded-2xl border font-semibold text-base ${
                isDark
                  ? "bg-[#1E1B18]/95 border-white/20 text-white"
                  : "bg-white border-[#111111] text-[#111111]"
              }`}
            >
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FF4D2D] border border-white/50 shrink-0" />{" "}
                High Priority
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B] border border-white/50 shrink-0" />{" "}
                Apartments/Dorms
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="w-3.5 h-3.5 rounded-full bg-[#A855F7] border border-white/50 shrink-0" />{" "}
                Mail/Duplicates
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="w-3.5 h-3.5 rounded-full bg-[#0EA5E9] border border-white/50 shrink-0" />{" "}
                Large Precincts
              </span>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white/50 shrink-0" />{" "}
                Normal Range ({normalCountyCount})
              </span>
            </div>
            <span
              className={`font-mono text-base font-bold px-3.5 py-1.5 rounded-xl inline-flex items-center gap-2 whitespace-nowrap ${
                isDark ? "bg-white/10 text-amber-300" : "bg-[#111111] text-white"
              }`}
            >
              <MousePointerClick className="w-4 h-4 shrink-0" /> Drag to Turn • Click Any County
            </span>
          </div>

          {/* 3D Interactive Stage — Significantly Taller & Larger */}
          <div className="relative w-full h-[500px] sm:h-[600px] md:h-[680px] select-none overflow-hidden">
            <div ref={mountRef} className="absolute inset-0 pointer-events-none opacity-10" />
            {render3DCanvasSvg("inline")}

            {/* Bottom Helper Banner Inside Map */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
              <div
                className={`px-3.5 py-2 rounded-xl border text-base font-mono font-bold whitespace-nowrap ${
                  isDark
                    ? "bg-[#1C1917]/90 border-white/20 text-emerald-300"
                    : "bg-white/95 border-[#111111] text-[#065F46]"
                }`}
              >
                Green Net = Normal County Pattern • Red Line = Extra Cleanup
              </div>
              <div
                className={`px-3.5 py-2 rounded-xl border text-base font-mono font-bold whitespace-nowrap ${
                  isDark
                    ? "bg-[#1C1917]/90 border-white/20 text-amber-300"
                    : "bg-white/95 border-[#111111] text-[#111111]"
                }`}
              >
                Angle: {Math.round(thetaDeg)}° • Tilt: {Math.round(phiDeg)}° • Zoom:{" "}
                {Math.round(zoomScale * 100)}%
              </div>
            </div>
          </div>

          {/* Bottom Plain-English Explanation Cards */}
          <div className="border-t-2 border-[#111111] bg-white text-[#111111] px-5 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div className="rounded-xl border border-[#111111]/25 bg-[#FCFBF8] p-4">
              <div className="text-base font-mono uppercase text-[#92400E] font-extrabold whitespace-nowrap">
                1. Why 3 Directions?
              </div>
              <div className="font-serif text-[#111111] text-lg mt-1 font-bold">
                Addresses (X) • Mail (Y) • Polling Places (Z)
              </div>
              <p className="text-base text-[#2A2623] mt-1.5 leading-relaxed">
                A college town needs apartment unit numbers (X), while a fast-growing suburb needs more polling places (Z). Separating the three shows what to fix first.
              </p>
            </div>
            <div className="rounded-xl border border-[#111111]/25 bg-[#FCFBF8] p-4">
              <div className="text-base font-mono uppercase text-[#065F46] font-extrabold whitespace-nowrap">
                2. What Is the Green Net?
              </div>
              <div className="font-serif text-[#111111] text-lg mt-1 font-bold">
                Normal County Baseline ({normalCountyCount} Counties)
              </div>
              <p className="text-base text-[#2A2623] mt-1.5 leading-relaxed">
                Larger counties naturally have more apartments and mail moves. The green net adjusts for county size so big counties aren&apos;t unfairly penalized.
              </p>
            </div>
            <div className="rounded-xl border border-[#111111]/25 bg-[#FCFBF8] p-4">
              <div className="text-base font-mono uppercase text-[#991B1B] font-extrabold whitespace-nowrap">
                3. What Are the Red Lines?
              </div>
              <div className="font-serif text-[#111111] text-lg mt-1 font-bold">
                {elevatedCountyCount} Counties With Extra Cleanup Work
              </div>
              <p className="text-base text-[#2A2623] mt-1.5 leading-relaxed">
                When a county rises above the green net on a red line, it has more address, mail, or polling-place strain than normal for its population size.
              </p>
            </div>
          </div>
        </div>

        {/* Right / Bottom Inspector Panel */}
        <div className={compact ? "" : "xl:col-span-4"}>{renderInspectorPanel(false)}</div>
      </div>

      {/* Native Top-Layer Full Screen Modal Dialog (modern-web-guidance: dialog & prevent-page-scroll-under-modal-dialog) */}
      <dialog
        ref={fullscreenDialogRef}
        aria-labelledby={dialogTitleId}
        className="m-0 p-0 w-screen h-screen max-w-none max-h-none bg-[#FCFBF8] text-[#111111] open:flex open:flex-col overflow-hidden"
      >
        {/* Top Full Screen Header Bar */}
        <div className="border-b-2 border-[#111111] bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#FFF8EB] px-3.5 py-1 text-base font-mono font-bold text-[#92400E] whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-[#C2341B] shrink-0" />
              Full Screen 3D Studio
            </span>
            <h2 id={dialogTitleId} className="text-xl sm:text-2xl font-serif font-bold text-[#111111]">
              Mississippi 82-County 3D Voter Roll Map — {selectedCounty.county} County Selected
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCanvasTheme((t) => (t === "obsidian" ? "paper" : "obsidian"))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#111111] bg-white hover:bg-[#F3EFE6] text-base font-bold text-[#111111] cursor-pointer whitespace-nowrap"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
              {isDark ? "Light Background" : "Dark 3D Studio"}
            </button>
            <button
              type="button"
              onClick={closeFullScreen}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#111111] bg-[#111111] hover:bg-[#2B2926] text-white text-base font-bold cursor-pointer whitespace-nowrap"
            >
              <X className="w-5 h-5 shrink-0" />
              Close Full Screen (Esc)
            </button>
          </div>
        </div>

        {/* Full Screen Control Bar */}
        <div className="border-b-2 border-[#111111] bg-[#FCFBF8] px-6 py-3 shrink-0">
          {renderControlBar(true)}
        </div>

        {/* Full Screen 12-Column Split Stage */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-auto lg:overflow-hidden">
          <div
            className={`lg:col-span-8 relative flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-[#111111] min-h-[540px] ${
              isDark ? "bg-[#12100E] text-white" : "bg-[#F7F4EC] text-[#111111]"
            }`}
          >
            <div className="w-full h-full flex-1 relative overflow-hidden">
              {isFullScreen && render3DCanvasSvg("fullscreen")}
              <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
                <div
                  className={`px-4 py-2 rounded-xl border text-base font-mono font-bold whitespace-nowrap ${
                    isDark
                      ? "bg-[#1C1917]/90 border-white/20 text-emerald-300"
                      : "bg-white/95 border-[#111111] text-[#065F46]"
                  }`}
                >
                  Drag Anywhere to Rotate • Click Any Circle to Inspect County
                </div>
                <div
                  className={`px-4 py-2 rounded-xl border text-base font-mono font-bold whitespace-nowrap ${
                    isDark
                      ? "bg-[#1C1917]/90 border-white/20 text-amber-300"
                      : "bg-white/95 border-[#111111] text-[#111111]"
                  }`}
                >
                  Angle: {Math.round(thetaDeg)}° • Tilt: {Math.round(phiDeg)}° • Zoom:{" "}
                  {Math.round(zoomScale * 100)}%
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 overflow-y-auto">{renderInspectorPanel(true)}</div>
        </div>
      </dialog>

      {/* Plain-English Connections & County Peer Guide (When not compact) */}
      {!compact && correlations && (
        <div className="border-t-2 border-[#111111] bg-white px-6 py-8 md:px-8">
          <div className="max-w-3xl mb-6">
            <div className="text-base font-mono uppercase tracking-widest text-[#C2341B] font-extrabold mb-1">
              How Different Voter Roll Tasks Connect Across All 82 Counties
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111]">
              Which Cleanup Steps Solve Two Problems at Once?
            </h3>
            <p className="mt-2 text-base text-[#2A2623]">
              We compared every county&apos;s numbers side by side on a simple{" "}
              <strong>−1.00 to +1.00 connection scale</strong> (where <strong>+1.00</strong> means two issues always move together). Here is what that means for your office:
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
                    <div className="font-mono text-base text-[#C2341B] font-bold">{corr.id}</div>
                    <div className="font-semibold text-base text-[#141413]">{corr.plainTitle}</div>
                    <div className="text-base text-[#575450] mt-0.5">{corr.pairLabel}</div>
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
                    <div className="font-bold text-base text-[#141413]">
                      {corr.pearsonR >= 0 ? `+${corr.pearsonR.toFixed(2)}` : corr.pearsonR.toFixed(2)}
                    </div>
                    <div className="text-base text-[#6B6760]">
                      Rank:{" "}
                      {corr.spearmanRho >= 0
                        ? `+${corr.spearmanRho.toFixed(2)}`
                        : corr.spearmanRho.toFixed(2)}
                    </div>
                  </div>
                ),
              },
              {
                key: "strength",
                label: "Strength",
                render: (corr) => (
                  <span className="font-mono text-base font-semibold text-[#141413] whitespace-nowrap">
                    {corr.strength}
                  </span>
                ),
              },
              {
                key: "rate",
                label: "Measured Pattern",
                render: (corr) => <span className="text-base text-[#2B2926]">{corr.rateOfChange}</span>,
              },
              {
                key: "takeaway",
                label: "What It Means for Your Office",
                render: (corr) => (
                  <span className="text-base text-[#3D3A36] leading-relaxed">
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
                  <div className="text-base font-mono uppercase tracking-widest text-[#C2341B] font-extrabold mb-1">
                    County-to-County Neighbor Guide
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111]">
                    {commissionerToolkit.headline}
                  </h3>
                  <p className="text-base text-[#2A2623] mt-1">{commissionerToolkit.subheadline}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {commissionerToolkit.evangelismSteps.map((st) => (
                  <div
                    key={st.step}
                    className="border-t-4 border-[#111111] bg-[#FCFBF8] p-5 rounded-b-xl border-x border-b border-x-[#111111]/25 border-b-[#111111]/25"
                  >
                    <div className="text-base font-mono font-extrabold text-[#C2341B]">
                      STEP {st.step}
                    </div>
                    <h4 className="text-xl font-serif font-bold text-[#111111] mt-1">{st.title}</h4>
                    <p className="text-base text-[#2A2623] mt-2 leading-relaxed">{st.detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {commissionerToolkit.peerTiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className="rounded-xl border-2 border-[#111111] bg-[#FCFBF8] p-5"
                  >
                    <div className="text-lg font-serif font-bold text-[#111111]">{tier.tier}</div>
                    <div className="text-base font-mono font-bold text-[#92400E] mt-1">
                      {tier.benchmarkMetric}
                    </div>
                    <p className="text-base text-[#2A2623] mt-2 leading-relaxed">
                      <strong className="text-[#111111]">Recommended Checklist:</strong>{" "}
                      {tier.primaryFocus}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tier.counties.map((co) => (
                        <button
                          type="button"
                          key={co}
                          onClick={() => {
                            setViewMode("counties");
                            setSelectedCountyName(co);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#111111] text-base font-bold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
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
