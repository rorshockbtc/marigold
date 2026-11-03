"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";
import {
  Compass,
  Layers,
  Activity,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Eye,
  Sliders,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Search,
  Play,
  Pause,
  Lock,
  Unlock,
  TrendingUp,
  Share2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import msAudit from "@/data/mississippi_audit_results.json";

type ViewMode = "counties" | "clusters";
type IsolatedAxis = "ALL" | "X" | "Y" | "Z";

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

const REGIME_HEX: Record<string, number> = {
  "Multi-Axis Manifold Detachment": 0xd9381e, // Accént Vermilion / Terracotta
  "Axis-X Spatial Domicile Ridge": 0xd97706, // Warm Marigold Amber
  "Axis-Y Interstate Drift Ridge": 0x7c3aed, // Royal Violet
  "Axis-Z Precinct Strain Ridge": 0x0284c7, // Civic Cerulean
  "Equilibrium Manifold Surface": 0x15803d, // Archival Forest Emerald
};

const REGIME_COLORS: Record<string, { fill: string; bg: string; text: string }> = {
  "Multi-Axis Manifold Detachment": {
    fill: "#D9381E",
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
  },
  "Axis-X Spatial Domicile Ridge": {
    fill: "#D97706",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
  },
  "Axis-Y Interstate Drift Ridge": {
    fill: "#7C3AED",
    bg: "bg-purple-50 border-purple-200",
    text: "text-purple-800",
  },
  "Axis-Z Precinct Strain Ridge": {
    fill: "#0284C7",
    bg: "bg-sky-50 border-sky-200",
    text: "text-sky-800",
  },
  "Equilibrium Manifold Surface": {
    fill: "#15803D",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-800",
  },
};

export default function ThreatManifold3DExplorer({
  compact = false,
  forceUnlocked = false,
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

  const [commissionerPreviewUnlocked, setCommissionerPreviewUnlocked] = useState(forceUnlocked);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("marigold_manifold_unlocked") === "true") {
        setCommissionerPreviewUnlocked(true);
      }
    }
  }, []);

  const isUnlocked = isAuthenticated || commissionerPreviewUnlocked || forceUnlocked;

  const handleUnlockPreview = () => {
    setCommissionerPreviewUnlocked(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("marigold_manifold_unlocked", "true");
    }
  };

  // Interactive 3D State
  const [viewMode, setViewMode] = useState<ViewMode>("counties");
  const [isolatedAxis, setIsolatedAxis] = useState<IsolatedAxis>("ALL");
  const [showEquilibriumMesh, setShowEquilibriumMesh] = useState(true);
  const [showResidualStems, setShowResidualStems] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>("Hinds");
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    clusterVectors[0]?.id || "CL-DOM-01"
  );

  // Camera spherical coordinates
  const [thetaDeg, setThetaDeg] = useState<number>(38);
  const [phiDeg, setPhiDeg] = useState<number>(64);
  const [cameraRadius, setCameraRadius] = useState<number>(175);

  // Refs for Three.js WebGL scene
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    viewMode,
    isolatedAxis,
    showEquilibriumMesh,
    showResidualStems,
    autoRotate,
    selectedCountyName,
    selectedClusterId,
    thetaDeg,
    phiDeg,
    cameraRadius,
    isUnlocked,
  });

  useEffect(() => {
    stateRef.current = {
      viewMode,
      isolatedAxis,
      showEquilibriumMesh,
      showResidualStems,
      autoRotate,
      selectedCountyName,
      selectedClusterId,
      thetaDeg,
      phiDeg,
      cameraRadius,
      isUnlocked,
    };
  }, [
    viewMode,
    isolatedAxis,
    showEquilibriumMesh,
    showResidualStems,
    autoRotate,
    selectedCountyName,
    selectedClusterId,
    thetaDeg,
    phiDeg,
    cameraRadius,
    isUnlocked,
  ]);

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

  // Coordinate helper: map [0..100] data coordinates into Three.js world space [-55..55]
  // Note: In Three.js, Y is vertical (our Z axis: Polling Strain & Velocity),
  // X is horizontal right (our X axis: Address Crowding),
  // Z is horizontal depth (our Y axis: Mail & Identity Drift)
  const toWorldPos = (dataX: number, dataY: number, dataZ: number): THREE.Vector3 => {
    const wx = (dataX - 50) * 1.1;
    const wy = (dataZ - 35) * 0.95; // Vertical height = Z
    const wz = (dataY - 50) * 1.1; // Depth = Y
    return new THREE.Vector3(wx, wy, wz);
  };

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 860;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfbf8); // Warm archival paper canvas
    scene.fog = new THREE.FogExp2(0xfcfbf8, 0.0022);

    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 1000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear existing canvas if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Studio & Archival Lighting
    const ambientLight = new THREE.AmbientLight(0xfffaf0, 1.45);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.35);
    mainLight.position.set(80, 140, 90);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const warmRimLight = new THREE.PointLight(0xd97706, 0.9, 260);
    warmRimLight.position.set(-70, 60, -60);
    scene.add(warmRimLight);

    // 1. Base Archival Coordinate Floor & Axes Box
    const axesGroup = new THREE.Group();
    scene.add(axesGroup);

    const floorGrid = new THREE.GridHelper(110, 10, 0xd6d3cd, 0xe7e5e0);
    floorGrid.position.y = -33.25; // Corresponds to dataZ = 0
    axesGroup.add(floorGrid);

    // Three.js Axis Line Helper (X = Amber, Y = Purple, Z = Sky Blue)
    const createAxisLine = (start: THREE.Vector3, end: THREE.Vector3, hex: number) => {
      const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color: hex, linewidth: 2 });
      return new THREE.Line(geom, mat);
    };
    axesGroup.add(
      createAxisLine(new THREE.Vector3(-55, -33.25, -55), new THREE.Vector3(58, -33.25, -55), 0xd97706)
    );
    axesGroup.add(
      createAxisLine(new THREE.Vector3(-55, -33.25, -55), new THREE.Vector3(-55, -33.25, 58), 0x7c3aed)
    );
    axesGroup.add(
      createAxisLine(new THREE.Vector3(-55, -33.25, -55), new THREE.Vector3(-55, 65, -55), 0x0284c7)
    );

    // 2. Parametric Equilibrium Manifold Surface Mesh Z_eq(X, Y) = 8.5 + 0.34*X + 0.29*Y + 0.14*(X*Y)/100
    const segs = 28;
    const manifoldGeom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const dx = (i / segs) * 100;
      for (let j = 0; j <= segs; j++) {
        const dy = (j / segs) * 100;
        const eqZ = 8.5 + 0.34 * dx + 0.29 * dy + 0.14 * ((dx * dy) / 100.0);
        const wp = toWorldPos(dx, dy, eqZ);
        positions.push(wp.x, wp.y, wp.z);

        // Subtle gradient from archival sage to warm gold along elevation
        const t = Math.min(1, Math.max(0, eqZ / 80));
        const col = new THREE.Color().setHSL(0.38 - t * 0.28, 0.55, 0.48);
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < segs; j++) {
        const a = i * (segs + 1) + j;
        const b = (i + 1) * (segs + 1) + j;
        const c = (i + 1) * (segs + 1) + (j + 1);
        const d = i * (segs + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    manifoldGeom.setIndex(indices);
    manifoldGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    manifoldGeom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    manifoldGeom.computeVertexNormals();

    const manifoldSurfaceMat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.26,
      shininess: 40,
    });
    const manifoldMesh = new THREE.Mesh(manifoldGeom, manifoldSurfaceMat);
    scene.add(manifoldMesh);

    const manifoldWireMat = new THREE.MeshBasicMaterial({
      color: 0x0f766e,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
    });
    const manifoldWire = new THREE.Mesh(manifoldGeom, manifoldWireMat);
    scene.add(manifoldWire);

    // 3. Build County & Cluster Node Meshes + Residual Stems
    const nodesGroup = new THREE.Group();
    const stemsGroup = new THREE.Group();
    scene.add(stemsGroup);
    scene.add(nodesGroup);

    // Selection Halo Ring
    const haloGeom = new THREE.RingGeometry(2.6, 3.6, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd9381e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const selectionHalo = new THREE.Mesh(haloGeom, haloMat);
    scene.add(selectionHalo);

    interface NodeEntry {
      id: string;
      type: ViewMode;
      mesh: THREE.Mesh;
      stem: THREE.Line;
      rawX: number;
      rawY: number;
      rawZ: number;
      manifoldZ: number;
      baseScale: number;
    }

    const nodeEntries: NodeEntry[] = [];
    const sphereGeom = new THREE.SphereGeometry(1, 24, 24);

    // Populate County Nodes
    countyVectors.forEach((cv) => {
      const hex = REGIME_HEX[cv.regime] || 0x15803d;
      const mat = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.25,
        metalness: 0.15,
        emissive: hex,
        emissiveIntensity: cv.threatEnergy >= 52 ? 0.22 : 0.08,
      });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      const baseScale = Math.max(1.15, Math.min(3.2, 0.95 + Math.log10(Math.max(1000, cv.total)) * 0.42));
      mesh.scale.setScalar(baseScale);

      const pos = toWorldPos(cv.x, cv.y, cv.z);
      mesh.position.copy(pos);
      mesh.userData = { id: cv.county, type: "counties" };
      nodesGroup.add(mesh);

      const basePos = toWorldPos(cv.x, cv.y, cv.manifoldZ);
      const stemGeom = new THREE.BufferGeometry().setFromPoints([basePos, pos]);
      const stemMat = new THREE.LineBasicMaterial({
        color: cv.manifoldResidual >= 0 ? 0xd9381e : 0x0284c7,
        transparent: true,
        opacity: Math.abs(cv.manifoldResidual) > 4 ? 0.65 : 0.2,
      });
      const stem = new THREE.Line(stemGeom, stemMat);
      stemsGroup.add(stem);

      nodeEntries.push({
        id: cv.county,
        type: "counties",
        mesh,
        stem,
        rawX: cv.x,
        rawY: cv.y,
        rawZ: cv.z,
        manifoldZ: cv.manifoldZ,
        baseScale,
      });
    });

    // Populate Cluster Nodes
    clusterVectors.forEach((cl) => {
      const hex = cl.category.includes("PB-01")
        ? 0xd97706
        : cl.category.includes("PB-06")
        ? 0x7c3aed
        : 0xd9381e;
      const mat = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.2,
        metalness: 0.2,
        emissive: hex,
        emissiveIntensity: 0.25,
      });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      const baseScale = Math.max(1.4, Math.min(3.0, cl.threatEnergy / 30));
      mesh.scale.setScalar(baseScale);

      const pos = toWorldPos(cl.x, cl.y, cl.z);
      mesh.position.copy(pos);
      mesh.userData = { id: cl.id, type: "clusters" };
      nodesGroup.add(mesh);

      const basePos = toWorldPos(cl.x, cl.y, cl.manifoldZ);
      const stemGeom = new THREE.BufferGeometry().setFromPoints([basePos, pos]);
      const stemMat = new THREE.LineBasicMaterial({
        color: hex,
        transparent: true,
        opacity: 0.65,
      });
      const stem = new THREE.Line(stemGeom, stemMat);
      stemsGroup.add(stem);

      nodeEntries.push({
        id: cl.id,
        type: "clusters",
        mesh,
        stem,
        rawX: cl.x,
        rawY: cl.y,
        rawZ: cl.z,
        manifoldZ: cl.manifoldZ,
        baseScale,
      });
    });

    // Raycaster & Pointer Interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDragging = false;
    let dragDistance = 0;
    let prevPointer = { x: 0, y: 0 };

    const domElem = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (!stateRef.current.isUnlocked) return;
      isDragging = true;
      dragDistance = 0;
      prevPointer = { x: e.clientX, y: e.clientY };
      setAutoRotate(false);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !stateRef.current.isUnlocked) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      prevPointer = { x: e.clientX, y: e.clientY };

      setThetaDeg((prev) => (prev - dx * 0.45 + 360) % 360);
      setPhiDeg((prev) => Math.max(18, Math.min(85, prev - dy * 0.35)));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!stateRef.current.isUnlocked) return;
      if (isDragging && dragDistance < 6) {
        // Click selection via Raycaster
        const rect = domElem.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const activeMeshes = nodeEntries
          .filter((n) => n.type === stateRef.current.viewMode)
          .map((n) => n.mesh);
        const hits = raycaster.intersectObjects(activeMeshes, false);
        if (hits.length > 0) {
          const hitObj = hits[0].object;
          if (stateRef.current.viewMode === "counties") {
            setSelectedCountyName(hitObj.userData.id);
          } else {
            setSelectedClusterId(hitObj.userData.id);
          }
        }
      }
      isDragging = false;
    };

    domElem.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 860;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let frameId = 0;
    let clockTime = 0;
    const basePositionsAttr = manifoldGeom.getAttribute("position") as THREE.BufferAttribute;
    const origManifoldY = new Float32Array(basePositionsAttr.count);
    for (let i = 0; i < basePositionsAttr.count; i++) {
      origManifoldY[i] = basePositionsAttr.getY(i);
    }

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      clockTime += 0.018;

      const st = stateRef.current;

      // Auto-rotate camera gently
      if (st.autoRotate) {
        st.thetaDeg = (st.thetaDeg + 0.14) % 360;
      }

      // Compute Camera Position from Spherical Angles
      const radTheta = (st.thetaDeg * Math.PI) / 180;
      const radPhi = (st.phiDeg * Math.PI) / 180;
      const r = st.cameraRadius;

      camera.position.x = r * Math.sin(radPhi) * Math.sin(radTheta);
      camera.position.y = r * Math.cos(radPhi) + 6;
      camera.position.z = r * Math.sin(radPhi) * Math.cos(radTheta);
      camera.lookAt(0, -4, 0);

      // Toggle Equilibrium Mesh
      manifoldMesh.visible = st.showEquilibriumMesh;
      manifoldWire.visible = st.showEquilibriumMesh;

      // Subtle living breathing wave on Equilibrium Manifold surface
      if (st.showEquilibriumMesh) {
        for (let i = 0; i < basePositionsAttr.count; i++) {
          const vx = basePositionsAttr.getX(i);
          const vz = basePositionsAttr.getZ(i);
          const wave = Math.sin(vx * 0.06 + clockTime) * Math.cos(vz * 0.06 + clockTime) * 0.65;
          basePositionsAttr.setY(i, origManifoldY[i] + wave);
        }
        basePositionsAttr.needsUpdate = true;
      }

      // Smoothly interpolate (lerp) every node's 3D position for Variable Isolation (ALL, X, Y, Z)
      let selectedTargetPos: THREE.Vector3 | null = null;

      for (const entry of nodeEntries) {
        const isCurrentMode = entry.type === st.viewMode;
        entry.mesh.visible = isCurrentMode;

        const tx = st.isolatedAxis === "ALL" || st.isolatedAxis === "X" ? entry.rawX : 14;
        const ty = st.isolatedAxis === "ALL" || st.isolatedAxis === "Y" ? entry.rawY : 14;
        const tz = st.isolatedAxis === "ALL" || st.isolatedAxis === "Z" ? entry.rawZ : entry.manifoldZ;

        const targetWorld = toWorldPos(tx, ty, tz);
        entry.mesh.position.lerp(targetWorld, 0.1);

        // Update Stem
        const showStem = isCurrentMode && st.showResidualStems && st.isolatedAxis === "ALL";
        entry.stem.visible = showStem;
        if (showStem) {
          const baseWorld = toWorldPos(tx, ty, entry.manifoldZ);
          const stemPositions = entry.stem.geometry.getAttribute("position") as THREE.BufferAttribute;
          stemPositions.setXYZ(0, baseWorld.x, baseWorld.y, baseWorld.z);
          stemPositions.setXYZ(1, entry.mesh.position.x, entry.mesh.position.y, entry.mesh.position.z);
          stemPositions.needsUpdate = true;
        }

        const isSelected =
          (st.viewMode === "counties" &&
            entry.id.toLowerCase() === st.selectedCountyName.toLowerCase()) ||
          (st.viewMode === "clusters" && entry.id === st.selectedClusterId);

        if (isSelected && isCurrentMode) {
          const pulse = 1.28 + Math.sin(clockTime * 3.2) * 0.12;
          entry.mesh.scale.setScalar(entry.baseScale * pulse);
          selectedTargetPos = entry.mesh.position.clone();
        } else {
          entry.mesh.scale.setScalar(entry.baseScale);
        }
      }

      if (selectedTargetPos) {
        selectionHalo.visible = true;
        selectionHalo.position.copy(selectedTargetPos);
        selectionHalo.lookAt(camera.position);
      } else {
        selectionHalo.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [countyVectors, clusterVectors]);

  return (
    <section className="rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] text-slate-900 shadow-lg overflow-hidden">
      {/* Top Editorial Header Banner */}
      <div className="border-b border-[#E5E0D8] bg-white px-6 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/20 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Three.js 3D Geometry • Variable Isolation & County Peer Benchmarking
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-slate-900">
              {manifold.nonExpertHeadline}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 max-w-3xl leading-relaxed">
              {manifold.nonExpertAnalogy}
            </p>
          </div>

          {/* Mode & Isolation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                onClick={() => setViewMode("counties")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "counties"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                82 Counties (Macro)
              </button>
              <button
                onClick={() => setViewMode("clusters")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "clusters"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                32 Anomaly Clusters (Micro)
              </button>
            </div>
          </div>
        </div>

        {/* Variable Isolation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-700" />
              Isolate Single Variable:
            </span>
            {(
              [
                { id: "ALL", label: "Full 3D Space (X, Y, Z)", color: "bg-slate-900 text-white" },
                {
                  id: "X",
                  label: "Isolate X: Address Crowding",
                  color: "bg-amber-700 text-white",
                },
                {
                  id: "Y",
                  label: "Isolate Y: Mail & Duplicate Drift",
                  color: "bg-purple-700 text-white",
                },
                {
                  id: "Z",
                  label: "Isolate Z: Polling Place Strain",
                  color: "bg-sky-700 text-white",
                },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => setIsolatedAxis(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isolatedAxis === btn.id
                    ? `${btn.color} border-transparent shadow-sm`
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowEquilibriumMesh((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                showEquilibriumMesh
                  ? "border-emerald-700/30 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              Baseline Sheet: {showEquilibriumMesh ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setShowResidualStems((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                showResidualStems
                  ? "border-red-700/30 bg-red-50 text-red-800"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              Detachment Stems: {showResidualStems ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 font-medium"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {autoRotate ? "Pause Orbit" : "Orbit 3D"}
            </button>
            <button
              onClick={() => {
                setThetaDeg(38);
                setPhiDeg(64);
                setCameraRadius(175);
                setIsolatedAxis("ALL");
              }}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
              title="Reset 3D View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D WebGL Canvas + Right Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Columns: Three.js Hardware-Accelerated 3D WebGL Viewport */}
        <div className="lg:col-span-7 relative border-b lg:border-b-0 lg:border-r border-[#E5E0D8] bg-[#FCFBF8] flex flex-col justify-between">
          {/* Top Overlay Legend */}
          <div className="px-5 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 z-10">
            <div className="flex flex-wrap items-center gap-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-[#E5E0D8] shadow-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9381E]" /> Multi-Variable Peak
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> X: Address Crowding
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Y: Mail/Duplicate Drift
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> Z: Polling Strain
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" /> Healthy Baseline (66 Counties)
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Three.js WebGL • Drag to Orbit • Click Sphere to Inspect
            </span>
          </div>

          {/* Three.js Canvas Mount Container */}
          <div className="relative w-full h-[460px] md:h-[520px]">
            <div
              ref={mountRef}
              className={`w-full h-full cursor-grab active:cursor-grabbing transition-all duration-500 ${
                !isUnlocked ? "blur-[3px] opacity-80 pointer-events-none select-none" : ""
              }`}
            />

            {/* Authentication Gate Overlay when not unlocked */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-[#FCFBF8]/65 backdrop-blur-[2px]">
                <div className="max-w-md w-full rounded-2xl border border-[#D8D0C5] bg-white p-6 md:p-7 shadow-2xl text-center">
                  <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold mb-1">
                    Election Commissioner 3D Interactive Mode
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    Unlock Live Three.js 3D Manifold Controls
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    Rotate all 82 Mississippi counties in 3D space, isolate single variables (Address Crowding, Mail Drift, or Polling Place Strain), and compare your county against state peers with 100% Zero-PII protection.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={handleUnlockPreview}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                      Unlock Commissioner 3D Preview
                    </button>
                    <Link
                      href="/sign-in"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2.5 text-xs transition-all"
                    >
                      Sign In with Workspace Account
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Plain-English Geometry & Rate-of-Change Strip */}
          <div className="border-t border-[#E5E0D8] bg-white px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200/80 bg-[#FCFBF8] p-2.5">
              <div className="text-[10px] font-mono uppercase text-amber-800 font-bold">
                1. 3D Position Vector
              </div>
              <div className="font-mono text-slate-900 text-[11px] mt-0.5 font-semibold">
                {manifold.equations.stateVector}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Plots each county by Address Crowding (X), Mail/Duplicate Drift (Y), and Polling Place Strain (Z).
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-[#FCFBF8] p-2.5">
              <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold">
                2. Expected Baseline Sheet
              </div>
              <div className="font-mono text-slate-900 text-[11px] mt-0.5 font-semibold">
                {manifold.equations.equilibriumManifold}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Smooth green grid showing how a typical Mississippi county scales as population grows.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-[#FCFBF8] p-2.5">
              <div className="text-[10px] font-mono uppercase text-red-800 font-bold">
                3. Calculus Rate of Change
              </div>
              <div className="font-mono text-slate-900 text-[11px] mt-0.5 font-semibold">
                dZ/dX = +0.34 • dZ/dY = +0.29
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Holds two axes steady to measure exactly which issue pushes a county above the normal sheet.
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Plain-English County / Cluster Inspector */}
        <div className="lg:col-span-5 bg-white p-6 flex flex-col justify-between">
          {viewMode === "counties" ? (
            <div>
              {/* County Search Selector */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find any of the 82 Mississippi counties..."
                    className="w-full rounded-xl border border-slate-200 bg-[#FCFBF8] pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <select
                  value={selectedCounty.county}
                  onChange={(e) => setSelectedCountyName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-[#FCFBF8] px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                >
                  {countyVectors.map((c) => (
                    <option key={c.county} value={c.county}>
                      {c.county} ({c.threatEnergy})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected County Card */}
              <div className="rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        REGIME_COLORS[selectedCounty.regime]?.bg || "bg-slate-100"
                      } ${REGIME_COLORS[selectedCounty.regime]?.text || "text-slate-800"}`}
                    >
                      {selectedCounty.regime}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1.5">
                      {selectedCounty.county} County, MS
                    </h3>
                    <p className="text-xs text-slate-600">
                      Primary Driver:{" "}
                      <span className="text-slate-900 font-semibold">
                        {selectedCounty.dominantDriver}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      Combined Signal
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#D9381E]">
                      {selectedCounty.threatEnergy}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Surface Gap: {selectedCounty.geodesicDistance}
                      {selectedCounty.mahalanobisDistance
                        ? ` • D_M: ${selectedCounty.mahalanobisDistance}σ`
                        : ""}
                    </div>
                  </div>
                </div>

                {/* Plain-English Explanation Box */}
                <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-white p-3.5 text-xs text-slate-700 leading-relaxed">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Plain-English Takeaway for Election Commissioners
                  </div>
                  {selectedCounty.plainEnglishSummary}
                </div>

                {/* Calculus Partial Derivative Breakdown (Share of Signal) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-2">
                    <span>VARIABLE ISOLATION (SHARE OF COUNTY WORKLOAD)</span>
                    <span className="text-slate-800 font-semibold">100% Decomposed</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-900 font-semibold">
                          Axis X: Physical Address Crowding (X = {selectedCounty.x})
                        </span>
                        <span className="font-mono font-bold text-amber-800">
                          {selectedCounty.partialX}% of signal
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all duration-300"
                          style={{ width: `${selectedCounty.partialX}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-purple-900 font-semibold">
                          Axis Y: Out-of-State Mail & Duplicates (Y = {selectedCounty.y})
                        </span>
                        <span className="font-mono font-bold text-purple-800">
                          {selectedCounty.partialY}% of signal
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${selectedCounty.partialY}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-sky-900 font-semibold">
                          Axis Z: Polling Place Overload & Velocity (Z = {selectedCounty.z})
                        </span>
                        <span className="font-mono font-bold text-sky-800">
                          {selectedCounty.partialZ}% of signal
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all duration-300"
                          style={{ width: `${selectedCounty.partialZ}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exact County Metrics Grid */}
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                    <div className="text-[10px] text-slate-500">Total Roll</div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      {selectedCounty.total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      {selectedCounty.active.toLocaleString()} Active
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                    <div className="text-[10px] text-slate-500">High-Density Addrs</div>
                    <div className="text-xs font-mono font-bold text-amber-800">
                      {selectedCounty.highDensityCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {selectedCounty.highDensityVoters.toLocaleString()} Voters
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                    <div className="text-[10px] text-slate-500">Out-of-State / Dups</div>
                    <div className="text-xs font-mono font-bold text-purple-800">
                      {selectedCounty.ncoaCount} / {selectedCounty.duplicateCount}
                    </div>
                    <div className="text-[10px] text-slate-500">Active Reloc / Clusters</div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                    <div className="text-[10px] text-slate-500">Mega-Precincts</div>
                    <div className="text-xs font-mono font-bold text-sky-800">
                      {selectedCounty.overCapacityPrecincts}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Max: {selectedCounty.maxPrecinctVoters.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                    <div className="text-[10px] text-slate-500">2024 General Votes</div>
                    <div className="text-xs font-mono font-bold text-emerald-800">
                      {selectedCounty.votes2024General.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {selectedCounty.turnout2024Pct || 64}% Turnout
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2">
                    <div className="text-[10px] text-slate-500">Baseline Z_eq</div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      {selectedCounty.manifoldZ}
                    </div>
                    <div
                      className={`text-[10px] font-mono font-bold ${
                        selectedCounty.manifoldResidual > 0 ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {selectedCounty.manifoldResidual > 0 ? "+" : ""}
                      {selectedCounty.manifoldResidual} gap
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Top Detached Counties Pill Bar */}
              <div className="mt-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Click any county to jump in 3D space ({filteredCounties.length} shown):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {filteredCounties.slice(0, 24).map((c) => (
                    <button
                      key={c.county}
                      onClick={() => setSelectedCountyName(c.county)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        selectedCounty.county === c.county
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-[#FCFBF8] border-slate-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {c.county}{" "}
                      <span className="font-mono text-[10px] opacity-75">({c.threatEnergy})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Cluster Mode Inspector */
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold">
                  32 Zero-PII Forensic Anomaly Clusters
                </span>
                <select
                  value={selectedCluster.id}
                  onChange={(e) => setSelectedClusterId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-[#FCFBF8] px-3 py-1.5 text-xs text-slate-900 font-semibold"
                >
                  {clusterVectors.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.id}: {cl.county} ({cl.threatEnergy})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-[#E5E0D8] bg-[#FCFBF8] p-5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                  {selectedCluster.category}
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-1">
                  {selectedCluster.label}
                </h3>
                <div className="text-xs text-slate-600 mt-0.5">
                  {selectedCluster.county} County •{" "}
                  <span className="text-slate-900 font-semibold">{selectedCluster.metricLabel}</span>
                </div>

                <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-white p-3.5 text-xs text-slate-700 leading-relaxed">
                  {selectedCluster.plainEnglishSummary}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <div className="text-[10px] text-amber-800 font-mono">X (Domicile)</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {selectedCluster.x}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <div className="text-[10px] text-purple-800 font-mono">Y (Identity)</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {selectedCluster.y}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-2.5">
                    <div className="text-[10px] text-sky-800 font-mono">Z (Strain)</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {selectedCluster.z}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {clusterVectors.map((cl) => (
                  <button
                    key={cl.id}
                    onClick={() => setSelectedClusterId(cl.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      selectedCluster.id === cl.id
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-[#FCFBF8] border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="truncate pr-2">
                      <strong className="font-mono">{cl.id}</strong> • {cl.label}
                    </span>
                    <span className="font-mono text-[11px] shrink-0">{cl.metricLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Link Bar */}
          {!compact && (
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Zero-PII Verified: All personal names & house numbers masked
              </span>
              <Link
                href="/reports/mississippi-playbook-analysis"
                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 font-bold"
              >
                Read Full Accént Editorial Report <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mathematical Correlation Matrix & Commissioner Evangelism Section (When not compact) */}
      {!compact && correlations && (
        <div className="border-t border-[#E5E0D8] bg-white px-6 py-8 md:px-8">
          <div className="max-w-3xl mb-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold mb-1">
              Statewide Mathematical Correlations Across All 82 Counties
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">
              How Different Voter Roll Issues Connect—Explained in Plain English
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              We measured exact Pearson (<em>r</em>) and Spearman rank (<em>ρ</em>) correlations across all 82 Mississippi counties so Election Commissioners can see which list-maintenance steps solve multiple problems at once.
            </p>
          </div>

          <div className="overflow-x-auto border-t border-b border-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Compared Variables</th>
                  <th className="py-3 px-4">Pearson r</th>
                  <th className="py-3 px-4">Spearman ρ</th>
                  <th className="py-3 px-4">Rate of Change (Calculus Slope)</th>
                  <th className="py-3 pl-4">Plain-English Meaning for Commissioners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {correlations.map((corr) => (
                  <tr key={corr.id} className="align-top hover:bg-amber-50/30">
                    <td className="py-3.5 pr-4 font-semibold text-slate-900 min-w-[210px]">
                      <div className="font-mono text-[10px] text-amber-800">{corr.id}</div>
                      {corr.plainTitle}
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {corr.pairLabel}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                      r = +{corr.pearsonR.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      ρ = +{corr.spearmanRho.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 min-w-[220px]">
                      {corr.rateOfChange}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-600 leading-relaxed min-w-[280px]">
                      {corr.commonManTakeaway}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commissioner Peer Benchmarking & Evangelism Toolkit */}
          {commissionerToolkit && (
            <div className="mt-10 pt-8 border-t border-[#E5E0D8]">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[#D9381E] font-bold mb-1">
                    County-to-County Evangelism & Peer Comparison
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    {commissionerToolkit.headline}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {commissionerToolkit.subheadline}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {commissionerToolkit.evangelismSteps.map((st) => (
                  <div
                    key={st.step}
                    className="border-t-2 border-slate-900 pt-4 bg-[#FCFBF8] p-4 rounded-b-xl border-x border-b border-x-[#E5E0D8] border-b-[#E5E0D8]"
                  >
                    <div className="text-xs font-mono font-bold text-[#D9381E]">
                      STEP {st.step}
                    </div>
                    <h4 className="text-base font-serif font-bold text-slate-900 mt-1">
                      {st.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{st.detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {commissionerToolkit.peerTiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className="rounded-xl border border-[#E5E0D8] bg-[#FCFBF8] p-4"
                  >
                    <div className="text-xs font-serif font-bold text-slate-900">
                      {tier.tier}
                    </div>
                    <div className="text-[11px] font-mono text-amber-800 mt-1">
                      {tier.benchmarkMetric}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      <strong>Action Recipe:</strong> {tier.primaryFocus}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tier.counties.map((co) => (
                        <button
                          key={co}
                          onClick={() => {
                            setViewMode("counties");
                            setSelectedCountyName(co);
                          }}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-700 hover:border-slate-400"
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
