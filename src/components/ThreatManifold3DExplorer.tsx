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
import { useStateBenchmark, StateSwitcherPill } from "@/lib/data/StateBenchmarkContext";
import msAudit from "@/data/mississippi_audit_results.json";

type ViewMode = "counties" | "clusters";
type IsolatedAxis = "ALL" | "X" | "Y" | "Z";
type CanvasTheme = "obsidian" | "paper";
type MarkerShape = "diamond" | "square" | "triangle" | "hexagon" | "circle";

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

// Friendly labels for county types
const FRIENDLY_REGIME_LABELS: Record<string, string> = {
  "Multi-Axis Manifold Detachment": "◆ All 3 Areas Need Review",
  "Axis-X Spatial Domicile Ridge": "■ Focus: Apartments & Dorm Units (X)",
  "Axis-Y Interstate Drift Ridge": "▲ Focus: Out-of-State Mail & Dups (Y)",
  "Axis-Z Precinct Strain Ridge": "⬢ Focus: Large Precincts 3,000+ (Z)",
  "Equilibrium Manifold Surface": "● Normal Baseline Range",
};

/**
 * Deuteranopia-Safe Palette aligned to Marigold & Pipes' "Accént" Design System:
 * - Never relies on red-vs-green alone: each category has a distinct geometric shape,
 *   a distinct SVG gradient/pattern, and an Okabe-Ito / Accént colorblind-safe hue.
 */
const REGIME_STYLES: Record<
  string,
  {
    gradId: string;
    fill: string;
    stroke: string;
    shape: MarkerShape;
    symbol: string;
    shortTag: string;
    bg: string;
    text: string;
  }
> = {
  "Multi-Axis Manifold Detachment": {
    gradId: "grad-multi",
    fill: "#F59E0B", // Marigold Brand Orange-Gold
    stroke: "#78350F",
    shape: "diamond",
    symbol: "◆",
    shortTag: "All 3",
    bg: "bg-[#FEF3C7] border-[#B45309]",
    text: "text-[#78350F]",
  },
  "Axis-X Spatial Domicile Ridge": {
    gradId: "grad-axis-x",
    fill: "#D97706", // Warm Bronze-Amber
    stroke: "#78350F",
    shape: "square",
    symbol: "■",
    shortTag: "X",
    bg: "bg-[#FDE68A]/60 border-[#92400E]",
    text: "text-[#78350F]",
  },
  "Axis-Y Interstate Drift Ridge": {
    gradId: "grad-axis-y",
    fill: "#735496", // Albers / Accént Royal Violet
    stroke: "#3B0764",
    shape: "triangle",
    symbol: "▲",
    shortTag: "Y",
    bg: "bg-[#F3E8FF] border-[#735496]",
    text: "text-[#3B0764]",
  },
  "Axis-Z Precinct Strain Ridge": {
    gradId: "grad-axis-z",
    fill: "#01A9F4", // Accént Sovereign Sky Blue
    stroke: "#0C4A6E",
    shape: "hexagon",
    symbol: "⬢",
    shortTag: "Z",
    bg: "bg-[#E0F2FE] border-[#0284C7]",
    text: "text-[#082F49]",
  },
  "Equilibrium Manifold Surface": {
    gradId: "grad-normal",
    fill: "#8A8279", // Warm Sandstone Slate (neutral so priority shapes pop)
    stroke: "#3A3530",
    shape: "circle",
    symbol: "●",
    shortTag: "OK",
    bg: "bg-[#EFECE6] border-[#6E675F]",
    text: "text-[#2C2825]",
  },
};

// Keep only the top 8 well-spaced focal counties labeled by default so labels never collide!
// Users can toggle "All Priority Labels" or click any marker to inspect its label.
const DEFAULT_SPACED_LABELS = new Set([
  "Hinds",
  "Harrison",
  "Oktibbeha",
  "Jackson",
  "DeSoto",
  "Humphreys",
  "Adams",
  "Marshall",
]);

function polygonPoints(cx: number, cy: number, r: number, shape: MarkerShape): string {
  if (shape === "diamond") {
    const d = r * 1.28;
    return `${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`;
  }
  if (shape === "triangle") {
    const d = r * 1.32;
    return `${cx},${cy - d} ${cx + d * 0.95},${cy + d * 0.78} ${cx - d * 0.95},${cy + d * 0.78}`;
  }
  if (shape === "hexagon") {
    const d = r * 1.18;
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${(cx + d * Math.cos(ang)).toFixed(1)},${(cy + d * Math.sin(ang)).toFixed(1)}`);
    }
    return pts.join(" ");
  }
  return "";
}

export default function ThreatManifold3DExplorer({
  compact = false,
  forceUnlocked = true,
  selectedCounty: externalSelectedCounty,
  onSelectCounty,
  auditDataOverride,
}: {
  compact?: boolean;
  forceUnlocked?: boolean;
  selectedCounty?: string;
  onSelectCounty?: (county: string) => void;
  auditDataOverride?: typeof msAudit;
}) {
  const { activeState, setActiveState, stateConfig, auditData: ctxAuditData } = useStateBenchmark();
  const activeAudit = auditDataOverride || ctxAuditData || msAudit;
  const manifold = activeAudit.threatManifold;
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

  // Interactive 3D State — defaults to Accént Warm Sandstone ("paper") theme!
  const [viewMode, setViewMode] = useState<ViewMode>("counties");
  const [isolatedAxis, setIsolatedAxis] = useState<IsolatedAxis>("ALL");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("paper");
  const [showEquilibriumMesh, setShowEquilibriumMesh] = useState(true);
  const [showResidualStems, setShowResidualStems] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>(
    externalSelectedCounty || "Hinds"
  );

  useEffect(() => {
    if (externalSelectedCounty && externalSelectedCounty.toLowerCase() !== selectedCountyName.toLowerCase()) {
      setSelectedCountyName(externalSelectedCounty);
    }
  }, [externalSelectedCounty, selectedCountyName]);

  const handleSelectCounty = (name: string) => {
    setSelectedCountyName(name);
    onSelectCounty?.(name);
  };
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusterVectors[0]?.id || "CL-DOM-01"
  );

  // Spherical Camera Angles (in degrees)
  const [thetaDeg, setThetaDeg] = useState<number>(36);
  const [phiDeg, setPhiDeg] = useState<number>(62);
  const [zoomScale, setZoomScale] = useState<number>(1.14);

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

  // Native <dialog> Full Screen Modal controller
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
        setThetaDeg((prev) => (prev + 0.4) % 360);
      }
    }, 34);
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
      // Fallback handled by the 3D Vector Projection Engine below
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
    const camR = 178 / zoomScale;

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

    const fovScale = 620 * zoomScale;
    const centerX = 500;
    const centerY = 335;

    return (dataX: number, dataY: number, dataZ: number) => {
      const wx = (dataX - 50) * 1.14;
      const wy = (dataZ - 34) * 1.0;
      const wz = (dataY - 50) * 1.14;

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

  // Build 3D Expected County Baseline Grid Lines (Sovereign Sky Blue net for Deuteranopia safety)
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

  // Project, depth-sort, and run 2D collision-avoidance on labels so labels NEVER overlap!
  const projectedNodes = useMemo(() => {
    const rawNodes =
      viewMode === "counties"
        ? countyVectors.map((cv) => {
            const tx = isolatedAxis === "ALL" || isolatedAxis === "X" ? cv.x : 14;
            const ty = isolatedAxis === "ALL" || isolatedAxis === "Y" ? cv.y : 14;
            const tz = isolatedAxis === "ALL" || isolatedAxis === "Z" ? cv.z : cv.manifoldZ;

            const topPt = project3DPoint(tx, ty, tz);
            const basePt = project3DPoint(tx, ty, cv.manifoldZ);
            const isSelected = cv.county.toLowerCase() === selectedCountyName.toLowerCase();
            const isNormal = cv.regime === "Equilibrium Manifold Surface";
            const radius = isNormal
              ? Math.max(6.2, Math.min(12.0, 4.0 + Math.log10(Math.max(1000, cv.total)) * 1.7))
              : Math.max(8.5, Math.min(16.5, 5.2 + Math.log10(Math.max(1000, cv.total)) * 2.2));
            const style = REGIME_STYLES[cv.regime] || REGIME_STYLES["Equilibrium Manifold Surface"];

            return {
              id: cv.county,
              label: cv.county,
              score: cv.threatEnergy,
              residual: cv.manifoldResidual,
              regime: cv.regime,
              topPt,
              basePt,
              radius: isSelected ? radius * 1.32 : radius,
              isSelected,
              wantsLabel:
                isSelected ||
                (showLabels && (DEFAULT_SPACED_LABELS.has(cv.county) || cv.threatEnergy >= 46)),
              style,
            };
          })
        : clusterVectors.map((cl) => {
            const tx = isolatedAxis === "ALL" || isolatedAxis === "X" ? cl.x : 14;
            const ty = isolatedAxis === "ALL" || isolatedAxis === "Y" ? cl.y : 14;
            const tz = isolatedAxis === "ALL" || isolatedAxis === "Z" ? cl.z : cl.manifoldZ;

            const topPt = project3DPoint(tx, ty, tz);
            const basePt = project3DPoint(tx, ty, cl.manifoldZ);
            const isSelected = cl.id === selectedClusterId;
            const radius = Math.max(8.0, Math.min(16, cl.threatEnergy / 5.6));
            const regimeKey = cl.category.includes("PB-01")
              ? "Axis-X Spatial Domicile Ridge"
              : cl.category.includes("PB-06")
              ? "Axis-Y Interstate Drift Ridge"
              : "Multi-Axis Manifold Detachment";
            const style = REGIME_STYLES[regimeKey];

            return {
              id: cl.id,
              label: `${cl.id} (${cl.county})`,
              score: cl.threatEnergy,
              residual: cl.z - cl.manifoldZ,
              regime: cl.category,
              topPt,
              basePt,
              radius: isSelected ? radius * 1.32 : radius,
              isSelected,
              wantsLabel: isSelected || (showLabels && cl.threatEnergy >= 72),
              style,
            };
          });

    // Greedy 2D bounding-box de-confliction (priority: selected first, then highest score)
    const labelPriority = [...rawNodes]
      .filter((n) => n.wantsLabel)
      .sort((a, b) => (a.isSelected ? -1 : b.isSelected ? 1 : b.score - a.score));

    const placedBoxes: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const approvedLabels = new Set<string>();

    for (const n of labelPriority) {
      const text = `${n.style.symbol} ${n.label} (${n.score})`;
      const w = Math.max(116, text.length * 8.2 + 24);
      const h = 26;
      const cx = Math.max(w / 2 + 12, Math.min(1000 - w / 2 - 12, n.topPt.sx));
      const cy = Math.max(28, Math.min(610, n.topPt.sy - n.radius - 16));
      const box = { x1: cx - w / 2 - 6, y1: cy - h - 4, x2: cx + w / 2 + 6, y2: cy + 4 };

      const collides = placedBoxes.some(
        (b) => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2)
      );
      if (n.isSelected || !collides) {
        approvedLabels.add(n.id);
        placedBoxes.push(box);
      }
    }

    return rawNodes
      .map((n) => ({
        ...n,
        showLabel: approvedLabels.has(n.id),
      }))
      .sort((a, b) => b.topPt.depth - a.topPt.depth);
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

  // Helper to render Deuteranopia-safe geometric shape + gradient fill for each node
  const renderMarkerShape = (
    node: (typeof projectedNodes)[number],
    idSuffix: string
  ) => {
    const { sx, sy } = node.topPt;
    const r = node.radius;
    const fillUrl = `url(#${node.style.gradId}-${idSuffix})`;
    const strokeColor = node.isSelected ? "#111111" : isDark ? "#111827" : "#FFFFFF";
    const strokeW = node.isSelected ? "2.8" : "1.8";
    const filterUrl = `url(#sphereShadow-${idSuffix})`;

    if (node.style.shape === "square") {
      const side = r * 1.75;
      return (
        <rect
          x={sx - side / 2}
          y={sy - side / 2}
          width={side}
          height={side}
          rx={3.5}
          fill={fillUrl}
          stroke={strokeColor}
          strokeWidth={strokeW}
          filter={filterUrl}
        />
      );
    }

    if (
      node.style.shape === "diamond" ||
      node.style.shape === "triangle" ||
      node.style.shape === "hexagon"
    ) {
      return (
        <polygon
          points={polygonPoints(sx, sy, r, node.style.shape)}
          fill={fillUrl}
          stroke={strokeColor}
          strokeWidth={strokeW}
          strokeLinejoin="round"
          filter={filterUrl}
        />
      );
    }

    return (
      <circle
        cx={sx}
        cy={sy}
        r={r}
        fill={fillUrl}
        stroke={strokeColor}
        strokeWidth={strokeW}
        filter={filterUrl}
      />
    );
  };

  // Reusable 3D SVG Canvas Renderer (Accént Warm Sandstone + Colorblind-Safe Gradients & Shapes)
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
        {/* Warm Sandstone ("paper") or Deep Slate ("obsidian") Studio Backdrop */}
        <radialGradient id={`stageGlow-${idSuffix}`} cx="50%" cy="48%" r="60%">
          <stop
            offset="0%"
            stopColor={isDark ? "#1E293B" : "#F8F5EE"}
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor={isDark ? "#0F172A" : "#E8E2D5"}
            stopOpacity="1"
          />
        </radialGradient>

        {/* Deuteranopia-Safe Rich 3D Linear/Radial Gradients for the 5 Categories (Marigold Gold-Amber palette, zero red) */}
        <linearGradient id={`grad-multi-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id={`grad-axis-x-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id={`grad-axis-y-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="55%" stopColor="#735496" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>

        <linearGradient id={`grad-axis-z-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="55%" stopColor="#01A9F4" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        <radialGradient id={`grad-normal-${idSuffix}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={isDark ? "#CBD5E1" : "#B8B0A4"} />
          <stop offset="70%" stopColor={isDark ? "#64748B" : "#8A8279"} />
          <stop offset="100%" stopColor={isDark ? "#334155" : "#5A534A"} />
        </radialGradient>

        <filter id={`sphereShadow-${idSuffix}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#111111" floodOpacity="0.32" />
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
            stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.12)"}
            strokeWidth="1.2"
            fill="none"
          />
        ))}
      </g>

      {/* 2. Sovereign Sky Blue Normal Baseline Net (Deuteranopia-safe instead of red-vs-green) */}
      {showEquilibriumMesh && (
        <g>
          {manifoldGridLines.map((line, idx) => (
            <path
              key={`manifold-${idSuffix}-${idx}`}
              d={line.d}
              stroke={
                isDark
                  ? line.isMajor
                    ? "#38BDF8"
                    : "rgba(56, 189, 248, 0.42)"
                  : line.isMajor
                  ? "#0284C7"
                  : "rgba(2, 132, 199, 0.36)"
              }
              strokeWidth={line.isMajor ? "2.4" : "1.3"}
              strokeDasharray={line.isMajor ? undefined : "5 3"}
              fill="none"
            />
          ))}
        </g>
      )}

      {/* 3. Bold X, Y, Z Coordinate Axes & Shape-Coded Labels */}
      <g>
        {/* X Axis: Apartment & House Addresses (Amber Square ■) */}
        <line
          x1={axes3D.origin.sx}
          y1={axes3D.origin.sy}
          x2={axes3D.xEnd.sx}
          y2={axes3D.xEnd.sy}
          stroke="#D97706"
          strokeWidth="3.5"
        />
        <rect
          x={axes3D.xEnd.sx - 116}
          y={axes3D.xEnd.sy - 15}
          width="232"
          height="28"
          rx="6"
          fill={isDark ? "#1E293B" : "#FFFBEB"}
          stroke="#D97706"
          strokeWidth="2"
        />
        <text
          x={axes3D.xEnd.sx}
          y={axes3D.xEnd.sy + 4}
          textAnchor="middle"
          fill={isDark ? "#FCD34D" : "#78350F"}
          fontSize="13"
          fontWeight="800"
          fontFamily="monospace"
        >
          ■ 1. ADDRESSES &amp; UNITS (X)
        </text>

        {/* Y Axis: Out-of-State Mail & Duplicates (Violet Triangle ▲) */}
        <line
          x1={axes3D.origin.sx}
          y1={axes3D.origin.sy}
          x2={axes3D.yEnd.sx}
          y2={axes3D.yEnd.sy}
          stroke="#735496"
          strokeWidth="3.5"
        />
        <rect
          x={axes3D.yEnd.sx - 116}
          y={axes3D.yEnd.sy - 15}
          width="232"
          height="28"
          rx="6"
          fill={isDark ? "#1E293B" : "#FAF5FF"}
          stroke="#735496"
          strokeWidth="2"
        />
        <text
          x={axes3D.yEnd.sx}
          y={axes3D.yEnd.sy + 4}
          textAnchor="middle"
          fill={isDark ? "#E9D5FF" : "#3B0764"}
          fontSize="13"
          fontWeight="800"
          fontFamily="monospace"
        >
          ▲ 2. MAIL &amp; DUPLICATES (Y)
        </text>

        {/* Z Axis: Busy Polling Places (Sky Blue Hexagon ⬢) */}
        <line
          x1={axes3D.origin.sx}
          y1={axes3D.origin.sy}
          x2={axes3D.zEnd.sx}
          y2={axes3D.zEnd.sy}
          stroke="#0284C7"
          strokeWidth="3.5"
        />
        <rect
          x={axes3D.zEnd.sx - 116}
          y={axes3D.zEnd.sy - 28}
          width="232"
          height="28"
          rx="6"
          fill={isDark ? "#1E293B" : "#F0F9FF"}
          stroke="#0284C7"
          strokeWidth="2"
        />
        <text
          x={axes3D.zEnd.sx}
          y={axes3D.zEnd.sy - 10}
          textAnchor="middle"
          fill={isDark ? "#7DD3FC" : "#0C4A6E"}
          fontSize="13"
          fontWeight="800"
          fontFamily="monospace"
        >
          ⬢ 3. POLLING PLACES (Z)
        </text>
      </g>

      {/* 4. Height Stems + Shape-Coded 3D County Markers + De-Conflicted Labels */}
      {projectedNodes.map((node) => {
        const showStem =
          showResidualStems &&
          isolatedAxis === "ALL" &&
          (Math.abs(node.residual) > 2.5 || node.isSelected);
        const labelText = `${node.style.symbol} ${node.label} (${node.score})`;
        const pillWidth = Math.max(118, labelText.length * 8.2 + 24);
        // Clamp label inside the 1000x640 SVG viewport so it never clips off the top or sides!
        const clampedX = Math.max(
          pillWidth / 2 + 12,
          Math.min(1000 - pillWidth / 2 - 12, node.topPt.sx)
        );
        const clampedY = Math.max(28, Math.min(610, node.topPt.sy - node.radius - 14));

        return (
          <g
            key={`${idSuffix}-${node.id}`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (viewMode === "counties") {
                handleSelectCounty(node.id);
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
                  stroke={node.residual >= 0 ? "#D97706" : "#0284C7"}
                  strokeWidth={node.isSelected ? "3.5" : "2.2"}
                  strokeDasharray={node.isSelected ? undefined : "5 3"}
                  opacity={node.isSelected ? "1" : "0.85"}
                />
                <circle
                  cx={node.basePt.sx}
                  cy={node.basePt.sy}
                  r="3.2"
                  fill={isDark ? "#38BDF8" : "#0284C7"}
                />
              </>
            )}

            {node.isSelected && (
              <>
                <circle
                  cx={node.topPt.sx}
                  cy={node.topPt.sy}
                  r={node.radius + 11}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeDasharray="5 3"
                />
                <circle
                  cx={node.topPt.sx}
                  cy={node.topPt.sy}
                  r={node.radius + 5}
                  fill="none"
                  stroke={isDark ? "#FFFFFF" : "#111111"}
                  strokeWidth="2.2"
                />
              </>
            )}

            {/* Shape-coded + gradient-filled 3D marker */}
            {renderMarkerShape(node, idSuffix)}

            {/* Inner specular highlight for depth */}
            <circle
              cx={node.topPt.sx - node.radius * 0.25}
              cy={node.topPt.sy - node.radius * 0.25}
              r={Math.max(1.6, node.radius * 0.22)}
              fill="rgba(255,255,255,0.65)"
            />

            {node.showLabel && (
              <g transform={`translate(${clampedX}, ${clampedY})`}>
                <rect
                  x={-pillWidth / 2}
                  y="-20"
                  width={pillWidth}
                  height="26"
                  rx="6"
                  fill={
                    node.isSelected
                      ? "#B45309"
                      : isDark
                      ? "rgba(15, 23, 42, 0.94)"
                      : "rgba(255, 255, 255, 0.97)"
                  }
                  stroke={
                    node.isSelected
                      ? "#FFFFFF"
                      : isDark
                      ? "rgba(255,255,255,0.55)"
                      : "#111111"
                  }
                  strokeWidth={node.isSelected ? "2.2" : "1.5"}
                />
                <text
                  x="0"
                  y="-3"
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

  // Clean 2-Row Accént Control Bar (Row 1: Topic Filter, Row 2: View & Camera Controls)
  const renderControlBar = (inModal = false) => (
    <div className="space-y-3">
      {/* Row 1: Topic Filter with Shape + Color Differentiators */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-mono font-bold uppercase tracking-wider text-[#111111] mr-1 inline-flex items-center gap-1.5 whitespace-nowrap">
          <Sliders className="w-4 h-4 text-[#B45309] shrink-0" />
          Filter by Task:
        </span>
        {(
          [
            {
              id: "ALL",
              label: "All 3 Tasks Together",
              activeClass: "bg-[#111111] text-white border-[#111111]",
            },
            {
              id: "X",
              label: "■ 1. Addresses & Units (X)",
              activeClass: "bg-[#B45309] text-white border-[#78350F]",
            },
            {
              id: "Y",
              label: "▲ 2. Mail & Duplicates (Y)",
              activeClass: "bg-[#735496] text-white border-[#3B0764]",
            },
            {
              id: "Z",
              label: "⬢ 3. Precincts 3,000+ (Z)",
              activeClass: "bg-[#0369A1] text-white border-[#082F49]",
            },
          ] as const
        ).map((btn) => (
          <button
            type="button"
            key={btn.id}
            onClick={() => setIsolatedAxis(btn.id)}
            className={`px-3.5 py-2 rounded-lg text-base font-bold border-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isolatedAxis === btn.id
                ? `${btn.activeClass} shadow-xs`
                : "bg-white border-[#111111]/30 text-[#111111] hover:border-[#111111]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Row 2: Layer Toggles + Camera Controls + Prominent Full Screen Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DDD6CA]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEquilibriumMesh((v) => !v)}
            className={`px-3.5 py-2 rounded-lg border-2 text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              showEquilibriumMesh
                ? "border-[#0369A1] bg-[#E0F2FE] text-[#082F49]"
                : "border-[#111111]/30 bg-white text-[#111111]"
            }`}
          >
            Sky-Blue Net: {showEquilibriumMesh ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={() => setShowResidualStems((v) => !v)}
            className={`px-3.5 py-2 rounded-lg border-2 text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              showResidualStems
                ? "border-[#B45309] bg-[#FEF3C7] text-[#78350F]"
                : "border-[#111111]/30 bg-white text-[#111111]"
            }`}
          >
            Amber Stems: {showResidualStems ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={() => setShowLabels((v) => !v)}
            className={`px-3.5 py-2 rounded-lg border-2 text-base font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              showLabels
                ? "border-[#111111] bg-[#E8E2D5] text-[#111111]"
                : "border-[#111111]/30 bg-white text-[#4A4845]"
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            Labels: {showLabels ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="px-3.5 py-2 rounded-lg border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#E8E2D5] inline-flex items-center gap-1.5 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
          >
            {autoRotate ? <Pause className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 shrink-0" />}
            {autoRotate ? "Pause Spin" : "Spin Map"}
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(1.75, +(z + 0.14).toFixed(2)))}
            className="px-3 py-2 rounded-lg border-2 border-[#111111]/40 bg-white text-[#111111] hover:border-[#111111] inline-flex items-center gap-1 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 shrink-0" /> Zoom +
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.8, +(z - 0.14).toFixed(2)))}
            className="px-3 py-2 rounded-lg border-2 border-[#111111]/40 bg-white text-[#111111] hover:border-[#111111] inline-flex items-center gap-1 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 shrink-0" /> Zoom −
          </button>
          <button
            type="button"
            onClick={() => {
              setThetaDeg(36);
              setPhiDeg(62);
              setZoomScale(1.14);
              setIsolatedAxis("ALL");
            }}
            className="px-3 py-2 rounded-lg border-2 border-[#111111]/40 bg-white text-[#111111] hover:border-[#111111] inline-flex items-center gap-1 text-base font-bold cursor-pointer whitespace-nowrap shrink-0"
            title="Reset 3D View"
          >
            <RotateCcw className="w-4 h-4 shrink-0" /> Reset
          </button>
          {!inModal ? (
            <button
              type="button"
              onClick={openFullScreen}
              className="px-4 py-2 rounded-lg border-2 border-[#111111] bg-[#F59E0B] hover:bg-[#D97706] text-[#111111] inline-flex items-center gap-2 text-base font-bold shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <Maximize2 className="w-4 h-4 shrink-0" />
              Full Screen 3D
            </button>
          ) : (
            <button
              type="button"
              onClick={closeFullScreen}
              className="px-4 py-2 rounded-lg border-2 border-[#111111] bg-[#111111] hover:bg-[#2B2926] text-white inline-flex items-center gap-2 text-base font-bold shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <Minimize2 className="w-4 h-4 shrink-0" />
              Exit Full Screen (Esc)
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Reusable County & Cluster Inspector Panel (Hairline Accént dividers, zero nested cards)
  const renderInspectorPanel = (isModal = false) => {
    const selStyle =
      REGIME_STYLES[selectedCounty.regime] || REGIME_STYLES["Equilibrium Manifold Surface"];
    return (
      <div className="bg-[#FAF8F5] p-5 sm:p-6 flex flex-col justify-between text-[#111111] h-full">
        {viewMode === "counties" ? (
          <div>
            {/* County Search & Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-[#DDD6CA]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5A534A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${stateConfig.name} county...`}
                  className="w-full h-11 rounded-lg border-2 border-[#111111]/35 bg-white pl-10 pr-3 text-base text-[#111111] font-medium placeholder:text-[#6E6A64] focus:outline-none focus:border-[#111111]"
                />
              </div>
              <select
                aria-label={`Select ${stateConfig.name} County`}
                value={selectedCounty.county}
                onChange={(e) => handleSelectCounty(e.target.value)}
                className="h-11 rounded-lg border-2 border-[#111111] bg-white px-3.5 text-base text-[#111111] font-bold focus:outline-none cursor-pointer whitespace-nowrap shrink-0"
              >
                {countyVectors.map((c) => {
                  const st =
                    REGIME_STYLES[c.regime] || REGIME_STYLES["Equilibrium Manifold Surface"];
                  return (
                    <option key={c.county} value={c.county}>
                      {st.symbol} {c.county} County (Score: {c.threatEnergy})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected County Header (Accént Hairline Architecture, No Nested Box) */}
            <div className="py-5 border-b border-[#DDD6CA]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-base font-bold ${selStyle.bg} ${selStyle.text}`}
                  >
                    {FRIENDLY_REGIME_LABELS[selectedCounty.regime] || selectedCounty.regime}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111] mt-2">
                    {selectedCounty.county} County, {activeState}
                  </h3>
                  <p className="text-base text-[#2A2623] mt-1">
                    Primary Focus:{" "}
                    <span className="text-[#111111] font-bold">
                      {selectedCounty.dominantDriver}
                    </span>
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-base font-mono uppercase text-[#5A534A] font-bold whitespace-nowrap">
                    Priority Score
                  </div>
                  <div className="text-3xl sm:text-4xl font-serif font-bold tabular-nums text-[#B45309]">
                    {selectedCounty.threatEnergy}
                    <span className="text-lg text-[#5A534A] font-normal"> / 100</span>
                  </div>
                  <div className="text-base font-mono font-semibold text-[#2A2623] whitespace-nowrap">
                    {selectedCounty.manifoldResidual > 0
                      ? `+${selectedCounty.manifoldResidual} pts above baseline`
                      : "On baseline net"}
                  </div>
                </div>
              </div>

              {/* Plain-English Summary */}
              <div className="mt-4 border-l-4 border-[#F59E0B] bg-[#F3EFE9] pl-4 pr-3 py-3 text-base text-[#111111] leading-relaxed">
                <div className="font-mono text-base uppercase tracking-wider text-[#B45309] font-bold mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" /> Plain-English County Summary
                </div>
                {selectedCounty.plainEnglishSummary}
              </div>
            </div>

            {/* Workload Breakdown Bars with Distinct Shapes + Color Gradients */}
            <div className="py-5 border-b border-[#DDD6CA]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-base font-mono font-bold text-[#111111] mb-3">
                <span>{selectedCounty.county.toUpperCase()} TASK BREAKDOWN</span>
                <span className="text-[#5A534A]">100% Share</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between gap-2 text-base mb-1">
                    <span className="text-[#111111] font-bold">
                      ■ 1. Addresses &amp; Unit Numbers (X)
                    </span>
                    <span className="font-mono font-extrabold text-[#92400E] whitespace-nowrap">
                      {selectedCounty.partialX}%
                    </span>
                  </div>
                  <div className="h-3.5 rounded-sm bg-[#E5E0D8] overflow-hidden border border-[#111111]/25">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${selectedCounty.partialX}%`,
                        background: "linear-gradient(90deg, #F59E0B 0%, #B45309 100%)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between gap-2 text-base mb-1">
                    <span className="text-[#111111] font-bold">
                      ▲ 2. Out-of-State Mail &amp; Duplicates (Y)
                    </span>
                    <span className="font-mono font-extrabold text-[#5B21B6] whitespace-nowrap">
                      {selectedCounty.partialY}%
                    </span>
                  </div>
                  <div className="h-3.5 rounded-sm bg-[#E5E0D8] overflow-hidden border border-[#111111]/25">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${selectedCounty.partialY}%`,
                        background: "linear-gradient(90deg, #A855F7 0%, #5B21B6 100%)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between gap-2 text-base mb-1">
                    <span className="text-[#111111] font-bold">
                      ⬢ 3. Large Precincts 3,000+ (Z)
                    </span>
                    <span className="font-mono font-extrabold text-[#0369A1] whitespace-nowrap">
                      {selectedCounty.partialZ}%
                    </span>
                  </div>
                  <div className="h-3.5 rounded-sm bg-[#E5E0D8] overflow-hidden border border-[#111111]/25">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${selectedCounty.partialZ}%`,
                        background: "linear-gradient(90deg, #38BDF8 0%, #0369A1 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exact County Numbers Hairline Grid */}
            <dl className="py-5 border-b border-[#DDD6CA] grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-base font-semibold text-[#5A534A]">Registered Voters</dt>
                <dd className="text-2xl font-serif font-bold tabular-nums text-[#111111] mt-0.5">
                  {selectedCounty.total.toLocaleString()}
                </dd>
                <div className="text-base text-[#0369A1] font-bold">
                  {selectedCounty.active.toLocaleString()} Active
                </div>
              </div>
              <div>
                <dt className="text-base font-semibold text-[#5A534A]">■ 8+ Voter Addresses</dt>
                <dd className="text-2xl font-serif font-bold tabular-nums text-[#92400E] mt-0.5">
                  {selectedCounty.highDensityCount.toLocaleString()}
                </dd>
                <div className="text-base text-[#2A2623] font-medium">
                  {selectedCounty.highDensityVoters.toLocaleString()} Voters
                </div>
              </div>
              <div>
                <dt className="text-base font-semibold text-[#5A534A]">▲ Out-of-State / Dups</dt>
                <dd className="text-2xl font-serif font-bold tabular-nums text-[#5B21B6] mt-0.5">
                  {selectedCounty.ncoaCount} / {selectedCounty.duplicateCount}
                </dd>
                <div className="text-base text-[#2A2623] font-medium">Active Mail / Dup Pairs</div>
              </div>
              <div>
                <dt className="text-base font-semibold text-[#5A534A]">⬢ 3,000+ Precincts</dt>
                <dd className="text-2xl font-serif font-bold tabular-nums text-[#0369A1] mt-0.5">
                  {selectedCounty.overCapacityPrecincts}
                </dd>
                <div className="text-base text-[#2A2623] font-medium">
                  Max: {selectedCounty.maxPrecinctVoters.toLocaleString()}
                </div>
              </div>
            </dl>

            {/* Quick County Selector Pills */}
            <div className="pt-5">
              <div className="text-base font-mono uppercase tracking-wider text-[#111111] font-bold mb-2.5">
                Quick-Select County ({filteredCounties.length} shown):
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {filteredCounties.slice(0, isModal ? 40 : 24).map((c) => {
                  const st =
                    REGIME_STYLES[c.regime] || REGIME_STYLES["Equilibrium Manifold Surface"];
                  return (
                    <button
                      type="button"
                      key={c.county}
                      onClick={() => handleSelectCounty(c.county)}
                      className={`px-3 py-1.5 rounded-lg text-base font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedCounty.county === c.county
                          ? "bg-[#111111] border-[#111111] text-white shadow-xs"
                          : "bg-white border-[#111111]/30 text-[#111111] hover:border-[#111111]"
                      }`}
                    >
                      <span aria-hidden="true">{st.symbol}</span> {c.county}{" "}
                      <span className="font-mono opacity-80">({c.threatEnergy})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Cluster Mode Inspector */
          <div>
            <div className="pb-4 mb-4 border-b border-[#DDD6CA] flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-mono uppercase tracking-wider text-[#B45309] font-extrabold">
                32 Specific Locations (Zero-PII)
              </span>
              <select
                aria-label="Select Specific Location"
                value={selectedCluster.id}
                onChange={(e) => setSelectedClusterId(e.target.value)}
                className="h-11 rounded-lg border-2 border-[#111111] bg-white px-3.5 text-base text-[#111111] font-bold"
              >
                {clusterVectors.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.id}: {cl.county} ({cl.threatEnergy})
                  </option>
                ))}
              </select>
            </div>

            <div className="pb-5 border-b border-[#DDD6CA]">
              <div className="text-base font-mono uppercase tracking-wider text-[#B45309] font-extrabold">
                {selectedCluster.category}
              </div>
              <h3 className="text-xl font-serif font-bold text-[#111111] mt-1">
                {selectedCluster.label}
              </h3>
              <div className="text-base text-[#2A2623] mt-1">
                {selectedCluster.county} County •{" "}
                <span className="text-[#111111] font-bold">{selectedCluster.metricLabel}</span>
              </div>

              <div className="mt-4 border-l-4 border-[#F59E0B] bg-[#F3EFE9] pl-4 pr-3 py-3 text-base text-[#111111] leading-relaxed">
                {selectedCluster.plainEnglishSummary}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white border border-[#DDD6CA] p-3 rounded-lg">
                  <div className="text-base text-[#92400E] font-mono font-bold">■ Addr (X)</div>
                  <div className="text-lg font-mono font-extrabold text-[#111111]">
                    {selectedCluster.x}
                  </div>
                </div>
                <div className="bg-white border border-[#DDD6CA] p-3 rounded-lg">
                  <div className="text-base text-[#5B21B6] font-mono font-bold">▲ Mail (Y)</div>
                  <div className="text-lg font-mono font-extrabold text-[#111111]">
                    {selectedCluster.y}
                  </div>
                </div>
                <div className="bg-white border border-[#DDD6CA] p-3 rounded-lg">
                  <div className="text-base text-[#0369A1] font-mono font-bold">⬢ Poll (Z)</div>
                  <div className="text-lg font-mono font-extrabold text-[#111111]">
                    {selectedCluster.z}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 max-h-56 overflow-y-auto divide-y divide-[#DDD6CA] border-y border-[#DDD6CA] bg-white">
              {clusterVectors.map((cl) => (
                <button
                  type="button"
                  key={cl.id}
                  onClick={() => setSelectedClusterId(cl.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-base flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    selectedCluster.id === cl.id
                      ? "bg-[#111111] text-white font-bold"
                      : "bg-white text-[#111111] hover:bg-[#F3EFE9]"
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
          <div className="mt-5 pt-4 border-t border-[#DDD6CA] flex flex-wrap items-center justify-between gap-3 text-base">
            <span className="text-[#111111] flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-5 h-5 text-[#0369A1] shrink-0" />
              100% Privacy Safe: Zero personal names or house numbers
            </span>
            <Link
              href="/reports/mississippi-playbook-analysis"
              className="inline-flex items-center gap-1.5 text-[#B45309] hover:underline font-extrabold whitespace-nowrap"
            >
              Read Full Statewide Report <ArrowUpRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="border-y-2 border-[#111111] bg-[#FAF8F5] text-[#111111]">
      {/* Top Plain-English Header & Accént Hairline Guide */}
      <div className="border-b-2 border-[#111111] bg-[#FAF8F5] px-5 py-6 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="font-mono text-base font-bold uppercase tracking-[0.12em] text-[#B45309] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              Marigold 3D Manifold Studio • Deuteranopia-Safe Shapes &amp; Gradients
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#111111]">
              What Is a &ldquo;Manifold&rdquo; and How Do I Read This 3D Map?
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#2C2825] leading-relaxed">
              In everyday terms, a <strong>manifold</strong> is simply a{" "}
              <strong>smooth curved surface—like a topographical terrain map or a stretched safety net</strong>. Because large counties naturally have more apartments, more mail forwardings, and larger polling places than small rural counties, a single flat threshold would unfairly penalize larger counties. The{" "}
              <strong className="text-[#0369A1]">sky-blue baseline net</strong> curves upward with county population to show what is <em>normal</em> for a county of any size.
            </p>
          </div>

          {/* Mode & Studio Theme Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <StateSwitcherPill
              activeState={activeState}
              onSelectState={(st) => {
                setActiveState(st);
                handleSelectCounty(st === "NC" ? "Wake" : "Hinds");
              }}
              variant="compact"
            />
            <div className="inline-flex rounded-lg border-2 border-[#111111] bg-[#E8E2D5] p-1">
              <button
                type="button"
                onClick={() => setViewMode("counties")}
                className={`px-4 py-2 rounded-md text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === "counties"
                    ? "bg-[#111111] text-white shadow-xs"
                    : "text-[#111111] hover:bg-black/5"
                }`}
              >
                All {countyVectors.length} Counties
              </button>
              <button
                type="button"
                onClick={() => setViewMode("clusters")}
                className={`px-4 py-2 rounded-md text-base font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === "clusters"
                    ? "bg-[#111111] text-white shadow-xs"
                    : "text-[#111111] hover:bg-black/5"
                }`}
              >
                {clusterVectors.length} Specific Locations
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCanvasTheme((t) => (t === "obsidian" ? "paper" : "obsidian"))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#111111] bg-white hover:bg-[#E8E2D5] text-base font-bold text-[#111111] cursor-pointer whitespace-nowrap shrink-0"
              title="Switch 3D Map Background Between Warm Sandstone and Dark Slate"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
              {isDark ? "Warm Sandstone Studio" : "Dark Slate Studio"}
            </button>
          </div>
        </div>

        {/* Accént Hairline 3-Column Visual Guide (No Nested Boxes, Zero Truncated Headings!) */}
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 border-y-2 border-[#111111] bg-[#F3EFE9] divide-y md:divide-y-0 md:divide-x divide-[#CFC8BC]">
          <li className="p-5">
            <div className="font-mono text-base font-bold uppercase tracking-wider text-[#0369A1]">
              01 · The Sky-Blue Net
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#111111] leading-snug">
              Normal Baseline ({normalCountyCount} of {countyVectors.length} Counties)
            </h3>
            <p className="mt-2 text-base text-[#2C2825] leading-relaxed">
              Counties marked with a <strong>neutral circle (●)</strong> sit on the sky-blue net. Their address, mail, and precinct counts are normal for their population size.
            </p>
          </li>

          <li className="p-5">
            <div className="font-mono text-base font-bold uppercase tracking-wider text-[#B45309]">
              02 · Vertical Height Stems
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#111111] leading-snug">
              Extra Cleanup Work ({elevatedCountyCount} Counties)
            </h3>
            <p className="mt-2 text-base text-[#2C2825] leading-relaxed">
              When a county rises <strong>above the net on a marigold-amber dashed stem</strong>, the height of that line shows how much extra cleanup work remains compared to peers.
            </p>
          </li>

          <li className="p-5">
            <div className="font-mono text-base font-bold uppercase tracking-wider text-[#78350F]">
              03 · Shape + Color Key
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-[#111111] leading-snug">
              Colorblind-Safe Task Shapes
            </h3>
            <p className="mt-2 text-base text-[#2C2825] leading-relaxed">
              Every category has its own geometric shape and gradient: <strong>◆ Diamond</strong> = All 3 areas; <strong>■ Square</strong> = Addresses (X); <strong>▲ Triangle</strong> = Mail/Dups (Y); <strong>⬢ Hexagon</strong> = Precincts (Z).
            </p>
          </li>
        </ol>

        {/* Clean 2-Row Accént Control Bar */}
        <div className="mt-5">{renderControlBar(false)}</div>
      </div>

      {/* Main 3D Viewport + Inspector Split */}
      <div className={`grid grid-cols-1 ${compact ? "" : "xl:grid-cols-12"}`}>
        {/* 3D Manifold Viewport */}
        <div
          className={`${
            compact ? "" : "xl:col-span-8 xl:border-r-2"
          } relative border-b-2 border-[#111111] flex flex-col justify-between ${
            isDark ? "bg-[#0F172A] text-white" : "bg-[#E8E2D5] text-[#111111]"
          }`}
        >
          {/* Dedicated Top Legend Strip (Outside SVG so it never covers 3D nodes!) */}
          <div
            className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-base ${
              isDark
                ? "bg-[#1E293B] border-white/15 text-white"
                : "bg-[#F3EFE9] border-[#CFC8BC] text-[#111111]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-4 font-semibold text-base">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#F59E0B] text-lg leading-none" aria-hidden="true">
                  ◆
                </span>{" "}
                All 3 Areas (6)
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#D97706] text-lg leading-none" aria-hidden="true">
                  ■
                </span>{" "}
                Addresses/Dorms (2)
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#735496] text-lg leading-none" aria-hidden="true">
                  ▲
                </span>{" "}
                Mail/Duplicates (4)
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#01A9F4] text-lg leading-none" aria-hidden="true">
                  ⬢
                </span>{" "}
                3,000+ Precincts (4)
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-[#8A8279] text-lg leading-none" aria-hidden="true">
                  ●
                </span>{" "}
                Normal Range ({normalCountyCount})
              </span>
            </div>
            <span
              className={`font-mono text-base font-bold px-3 py-1 rounded-md inline-flex items-center gap-2 whitespace-nowrap ${
                isDark ? "bg-white/10 text-sky-300" : "bg-[#111111] text-white"
              }`}
            >
              <MousePointerClick className="w-4 h-4 shrink-0" /> Drag to Rotate • Click Any Shape
            </span>
          </div>

          {/* 3D Interactive Stage — Unobstructed 680px Canvas */}
          <div className="relative w-full h-[500px] sm:h-[600px] md:h-[680px] select-none overflow-hidden">
            <div ref={mountRef} className="absolute inset-0 pointer-events-none opacity-10" />
            {render3DCanvasSvg("inline")}
          </div>

          {/* Dedicated Bottom Telemetry Footer Strip (Outside SVG so it never covers bottom county labels!) */}
          <div
            className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-base font-mono font-bold ${
              isDark
                ? "bg-[#1E293B] border-white/15 text-sky-300"
                : "bg-[#F3EFE9] border-[#CFC8BC] text-[#111111]"
            }`}
          >
            <div>
              Sky-Blue Net = Population-Adjusted Baseline • Dashed Stem = Extra Cleanup Workload
            </div>
            <div className="whitespace-nowrap">
              Angle: {Math.round(thetaDeg)}° • Tilt: {Math.round(phiDeg)}° • Zoom:{" "}
              {Math.round(zoomScale * 100)}%
            </div>
          </div>
        </div>

        {/* Right / Bottom Inspector Panel */}
        <div className={compact ? "" : "xl:col-span-4"}>{renderInspectorPanel(false)}</div>
      </div>

      {/* Native Top-Layer Full Screen Modal Dialog */}
      <dialog
        ref={fullscreenDialogRef}
        aria-labelledby={dialogTitleId}
        className="m-0 p-0 w-screen h-screen max-w-none max-h-none bg-[#FAF8F5] text-[#111111] open:flex open:flex-col overflow-hidden"
      >
        {/* Top Full Screen Header Bar */}
        <div className="border-b-2 border-[#111111] bg-[#FAF8F5] px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md border border-[#111111] bg-[#FEF3C7] px-3.5 py-1 text-base font-mono font-bold text-[#78350F] whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-[#B45309] shrink-0" />
              Full Screen 3D Studio
            </span>
            <h2 id={dialogTitleId} className="text-xl sm:text-2xl font-serif font-bold text-[#111111]">
              {stateConfig.name} {countyVectors.length}-County 3D Manifold — {selectedCounty.county} County Selected
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCanvasTheme((t) => (t === "obsidian" ? "paper" : "obsidian"))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#111111] bg-white hover:bg-[#E8E2D5] text-base font-bold text-[#111111] cursor-pointer whitespace-nowrap"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
              {isDark ? "Warm Sandstone Studio" : "Dark Slate Studio"}
            </button>
            <button
              type="button"
              onClick={closeFullScreen}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#111111] bg-[#111111] hover:bg-[#2B2926] text-white text-base font-bold cursor-pointer whitespace-nowrap"
            >
              <X className="w-5 h-5 shrink-0" />
              Close Full Screen (Esc)
            </button>
          </div>
        </div>

        {/* Full Screen Control Bar */}
        <div className="border-b-2 border-[#111111] bg-[#F3EFE9] px-6 py-3 shrink-0">
          {renderControlBar(true)}
        </div>

        {/* Full Screen 12-Column Split Stage */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-auto lg:overflow-hidden">
          <div
            className={`lg:col-span-8 relative flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-[#111111] min-h-[540px] ${
              isDark ? "bg-[#0F172A] text-white" : "bg-[#E8E2D5] text-[#111111]"
            }`}
          >
            <div className="w-full h-full flex-1 relative overflow-hidden">
              {isFullScreen && render3DCanvasSvg("fullscreen")}
            </div>
            <div
              className={`px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-base font-mono font-bold ${
                isDark
                  ? "bg-[#1E293B] border-white/15 text-sky-300"
                  : "bg-[#F3EFE9] border-[#CFC8BC] text-[#111111]"
              }`}
            >
              <div>
                ◆ All 3 Areas • ■ Addresses (X) • ▲ Mail/Dups (Y) • ⬢ Precincts (Z) • ● Normal Baseline
              </div>
              <div className="whitespace-nowrap">
                Angle: {Math.round(thetaDeg)}° • Tilt: {Math.round(phiDeg)}° • Zoom:{" "}
                {Math.round(zoomScale * 100)}%
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 overflow-y-auto">{renderInspectorPanel(true)}</div>
        </div>
      </dialog>

      {/* Plain-English Connections & County Peer Guide (When not compact) */}
      {!compact && correlations && (
        <div className="border-t-2 border-[#111111] bg-[#FAF8F5] px-6 py-8 md:px-8">
          <div className="max-w-3xl mb-6">
            <div className="text-base font-mono uppercase tracking-widest text-[#B45309] font-extrabold mb-1">
              How Different Voter Roll Tasks Connect Across All {countyVectors.length} {stateConfig.name} Counties
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111]">
              Which Cleanup Steps Solve Two Problems at Once?
            </h3>
            <p className="mt-2 text-base text-[#2A2623]">
              We compared every county&apos;s numbers side by side on a simple{" "}
              <strong>−1.00 to +1.00 connection scale</strong> (where <strong>+1.00</strong> means two issues always move together). Here is what that means for your office:
            </p>
          </div>

          <ol className="divide-y divide-[#DDD6CA] border-y-2 border-[#111111]">
            {correlations.map((corr) => (
              <li
                key={corr.id}
                className="py-5 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3 md:gap-6 items-start"
              >
                <div>
                  <div className="font-serif text-[26px] font-bold tabular-nums leading-none text-[#B45309]">
                    {corr.pearsonR >= 0 ? `+${corr.pearsonR.toFixed(2)}` : corr.pearsonR.toFixed(2)}
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-[#5A534A]">
                    {corr.strength}
                  </div>
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#111111]">
                    {corr.plainTitle}{" "}
                    <span className="font-sans text-sm font-normal text-[#5A534A]">
                      ({corr.pairLabel})
                    </span>
                  </h4>
                  <p className="mt-1.5 text-base leading-relaxed text-[#2C2825]">
                    {corr.rateOfChange} {corr.commonManTakeaway}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Commissioner Peer Benchmarking & Evangelism Toolkit */}
          {commissionerToolkit && (
            <div className="mt-10 pt-8 border-t-2 border-[#111111]">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-base font-mono uppercase tracking-widest text-[#B45309] font-extrabold mb-1">
                    County-to-County Neighbor Guide
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#111111]">
                    {commissionerToolkit.headline}
                  </h3>
                  <p className="text-base text-[#2A2623] mt-1">{commissionerToolkit.subheadline}</p>
                </div>
              </div>

              <ol className="grid grid-cols-1 md:grid-cols-3 border-y-2 border-[#111111] bg-[#F3EFE9] divide-y md:divide-y-0 md:divide-x divide-[#CFC8BC] mb-8">
                {commissionerToolkit.evangelismSteps.map((st) => (
                  <li key={st.step} className="p-5">
                    <div className="text-base font-mono font-extrabold text-[#B45309]">
                      STEP {st.step}
                    </div>
                    <h4 className="text-xl font-serif font-bold text-[#111111] mt-1">{st.title}</h4>
                    <p className="text-base text-[#2A2623] mt-2 leading-relaxed">{st.detail}</p>
                  </li>
                ))}
              </ol>

              <div className="grid grid-cols-1 md:grid-cols-3 border-y-2 border-[#111111] bg-white divide-y md:divide-y-0 md:divide-x divide-[#DDD6CA]">
                {commissionerToolkit.peerTiers.map((tier) => (
                  <div key={tier.tier} className="p-5">
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
                            handleSelectCounty(co);
                          }}
                          className="px-3 py-1.5 rounded-md bg-[#FAF8F5] border border-[#111111] text-base font-bold text-[#111111] hover:bg-[#111111] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
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
