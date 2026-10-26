import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Compass,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Info,
  Flame,
} from 'lucide-react';
import { BrainRegion, PathwayIntensityInfo } from '../types/formula';
import { TEN_BRAIN_SECTIONS, NEURAL_PATHWAYS, BrainSectionInfo } from '../data/brainSections';
import { neuroAudio } from '../utils/audio';

interface Brain3DViewerProps {
  regionActivation: Record<BrainRegion, number>;
  pathwayIntensities?: Record<string, PathwayIntensityInfo>;
  onSelectRegion?: (region: BrainRegion) => void;
  selectedRegion?: BrainRegion | null;
}

export const Brain3DViewer: React.FC<Brain3DViewerProps> = ({
  regionActivation,
  pathwayIntensities = {},
  onSelectRegion,
  selectedRegion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSection, setHoveredSection] = useState<BrainSectionInfo | null>(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewAngle, setViewAngle] = useState<'perspective' | 'sagittal' | 'axial' | 'coronal' | 'ventral'>('perspective');
  const [showPathways, setShowPathways] = useState(true);
  const [pathwayFilter, setPathwayFilter] = useState<'all' | 'high_intensity' | 'reward' | 'stress'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSignalSource, setActiveSignalSource] = useState<BrainRegion | null>(null);

  // References for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const brainGroupRef = useRef<THREE.Group | null>(null);
  const sectionMeshesRef = useRef<Map<BrainRegion, THREE.Mesh[]>>(new Map());
  const centroidMeshesRef = useRef<Map<BrainRegion, THREE.Mesh[]>>(new Map());
  const pathwayLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const synapticPacketsRef = useRef<Array<{
    pathwayId: string;
    curve: THREE.Curve<THREE.Vector3>;
    mesh: THREE.Mesh;
    progress: number;
    baseSpeed: number;
  }>>([]);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.25, y: 0.6 });
  const cameraTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(4.8, 2.8, 7.2));

  // Active section for telemetry card
  const activeInspectedSection = useMemo(() => {
    if (hoveredSection) return hoveredSection;
    if (selectedRegion) {
      return TEN_BRAIN_SECTIONS.find((s) => s.id === selectedRegion) || TEN_BRAIN_SECTIONS[0];
    }
    return TEN_BRAIN_SECTIONS[0];
  }, [hoveredSection, selectedRegion]);

  // Connected pathways
  const connectedPathways = useMemo(() => {
    if (!activeInspectedSection) return NEURAL_PATHWAYS.slice(0, 4);
    return NEURAL_PATHWAYS.filter(
      (p) => p.source === activeInspectedSection.id || p.target === activeInspectedSection.id
    );
  }, [activeInspectedSection]);

  // Sorted pathways by intensity
  const sortedPathwaysByIntensity = useMemo(() => {
    return [...NEURAL_PATHWAYS].sort((a, b) => {
      const intA = pathwayIntensities[a.id]?.intensity || 50;
      const intB = pathwayIntensities[b.id]?.intensity || 50;
      return intB - intA;
    });
  }, [pathwayIntensities]);

  // Filtered pathways
  const filteredPathways = useMemo(() => {
    return sortedPathwaysByIntensity.filter((p) => {
      const int = pathwayIntensities[p.id]?.intensity || 50;
      if (pathwayFilter === 'high_intensity') return int >= 60;
      if (pathwayFilter === 'reward') return p.type === 'reward';
      if (pathwayFilter === 'stress') return p.type === 'stress';
      return true;
    });
  }, [sortedPathwaysByIntensity, pathwayFilter, pathwayIntensities]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.045);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.8, 2.8, 7.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Multi-Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    rimLight1.position.set(-7, -4, -6);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    rimLight2.position.set(6, -5, -6);
    scene.add(rimLight2);

    // 5. Master Brain Group Container
    const brainGroup = new THREE.Group();
    brainGroupRef.current = brainGroup;
    scene.add(brainGroup);

    // 6. Generate Realistic Anatomical Human Brain with 10 Colored Lobes
    const sectionMeshMap = new Map<BrainRegion, THREE.Mesh[]>();
    const centroidMeshMap = new Map<BrainRegion, THREE.Mesh[]>();

    TEN_BRAIN_SECTIONS.forEach((section) => {
      const meshes: THREE.Mesh[] = [];
      const centroidMeshes: THREE.Mesh[] = [];
      const color = new THREE.Color(section.hexCode);
      const isBilateral = section.id !== 'prefrontal_cortex' && section.id !== 'cerebellum_brainstem' && section.id !== 'insula_hypothalamus';
      const hemispheres = isBilateral ? [1, -1] : [0];

      hemispheres.forEach((hemiSign) => {
        const [rX, rY, rZ] = section.lobeGeometry.baseRadius;
        const [offX, offY, offZ] = section.lobeGeometry.offset;
        const geo = new THREE.SphereGeometry(1.0, 36, 28);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
          let x = pos.getX(i);
          let y = pos.getY(i);
          let z = pos.getZ(i);

          const u = Math.atan2(z, x);
          const v = Math.asin(Math.max(-1, Math.min(1, y)));
          const freq = section.lobeGeometry.gyriFrequency;

          const sulcusWave =
            Math.sin(u * freq + v * 3) * 0.12 +
            Math.cos(v * freq - u * 2) * 0.08 +
            Math.sin(u * 14) * 0.04;

          const scaleX = rX * (1 + sulcusWave);
          const scaleY = rY * (1 + sulcusWave);
          const scaleZ = rZ * (1 + sulcusWave);

          let finalX = x * scaleX + (hemiSign !== 0 ? offX * hemiSign : offX);
          let finalY = y * scaleY + offY;
          let finalZ = z * scaleZ + offZ;

          if (hemiSign !== 0) {
            finalX += hemiSign * 0.35;
          }

          if (section.id === 'cerebellum_brainstem') {
            finalY += Math.sin(finalZ * 20) * 0.03;
          }

          pos.setXYZ(i, finalX, finalY, finalZ);
        }

        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.35,
          metalness: 0.25,
          emissive: color,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.88,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { sectionId: section.id, section };
        brainGroup.add(mesh);
        meshes.push(mesh);

        // Core Centroid Glowing Nucleus Sphere
        const coreGeo = new THREE.SphereGeometry(0.24, 20, 20);
        const coreMat = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 1.2,
          roughness: 0.1,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        const [cx, cy, cz] = section.center3D;
        coreMesh.position.set(hemiSign !== 0 ? cx * hemiSign : cx, cy, cz);
        brainGroup.add(coreMesh);
        centroidMeshes.push(coreMesh);

        // Outer pulsing shockwave aura ring
        const ringGeo = new THREE.RingGeometry(0.32, 0.45, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(hemiSign !== 0 ? cx * hemiSign : cx, cy, cz);
        brainGroup.add(ringMesh);
        centroidMeshes.push(ringMesh);
      });

      sectionMeshMap.set(section.id, meshes);
      centroidMeshMap.set(section.id, centroidMeshes);
    });

    sectionMeshesRef.current = sectionMeshMap;
    centroidMeshesRef.current = centroidMeshMap;

    // 7. Realistic Brain Outline Silhouette
    const silhouetteGeo = new THREE.SphereGeometry(2.65, 48, 36);
    const silPos = silhouetteGeo.attributes.position;
    for (let i = 0; i < silPos.count; i++) {
      let vx = silPos.getX(i) * 0.96;
      let vy = silPos.getY(i) * 0.86;
      let vz = silPos.getZ(i) * 1.15;
      if (vy < -0.6) vy -= 0.4;
      if (vz < -1.4 && vy < -0.2) vz -= 0.2;
      silPos.setXYZ(i, vx, vy, vz);
    }
    silhouetteGeo.computeVertexNormals();

    const silhouetteMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const silhouetteMesh = new THREE.Mesh(silhouetteGeo, silhouetteMat);
    brainGroup.add(silhouetteMesh);

    // 8. Connectome Axon Pathways & Animated Synaptic Light Packets
    const pathwayLineMap = new Map<string, THREE.Line>();
    const packetList: Array<{
      pathwayId: string;
      curve: THREE.Curve<THREE.Vector3>;
      mesh: THREE.Mesh;
      progress: number;
      baseSpeed: number;
    }> = [];

    const tractsGroup = new THREE.Group();
    brainGroup.add(tractsGroup);

    NEURAL_PATHWAYS.forEach((pathway) => {
      const srcSec = TEN_BRAIN_SECTIONS.find((s) => s.id === pathway.source);
      const tgtSec = TEN_BRAIN_SECTIONS.find((s) => s.id === pathway.target);
      if (!srcSec || !tgtSec) return;

      const pA = new THREE.Vector3(...srcSec.center3D);
      const pB = new THREE.Vector3(...tgtSec.center3D);

      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      mid.y += (Math.random() - 0.5) * 0.8 + 0.3;
      mid.x += (Math.random() - 0.5) * 0.8;

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const points = curve.getPoints(36);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(pathway.baseColor),
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(curveGeo, curveMat);
      line.userData = { pathwayId: pathway.id };
      tractsGroup.add(line);
      pathwayLineMap.set(pathway.id, line);

      // Create 3 synaptic action-potential packets per pathway
      for (let k = 0; k < 3; k++) {
        const packetGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const packetMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(pathway.baseColor),
          blending: THREE.AdditiveBlending,
        });
        const packetMesh = new THREE.Mesh(packetGeo, packetMat);
        tractsGroup.add(packetMesh);

        packetList.push({
          pathwayId: pathway.id,
          curve,
          mesh: packetMesh,
          progress: k * 0.33,
          baseSpeed: 0.007 + Math.random() * 0.004,
        });
      }
    });

    pathwayLinesRef.current = pathwayLineMap;
    synapticPacketsRef.current = packetList;

    // 9. Continuous Animation Loop with Live Intensity Feedback
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (cameraRef.current) {
        cameraRef.current.position.lerp(cameraTargetPosRef.current, 0.05);
      }

      if (brainGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          targetRotationRef.current.y += 0.004;
        }
        brainGroupRef.current.rotation.x += (targetRotationRef.current.x - brainGroupRef.current.rotation.x) * 0.08;
        brainGroupRef.current.rotation.y += (targetRotationRef.current.y - brainGroupRef.current.rotation.y) * 0.08;
      }

      // Update Section Meshes pulse based on live regional activation
      sectionMeshesRef.current.forEach((meshes, secId) => {
        const act = regionActivation[secId] || 50;
        const pulse = Math.sin(elapsed * 3 + act * 0.05) * 0.08;
        const isSelected = selectedRegion === secId;
        const isHovered = hoveredSection?.id === secId;

        meshes.forEach((mesh) => {
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            const baseEmissive = isSelected || isHovered ? 0.95 : 0.32 + (act / 100) * 0.65;
            mesh.material.emissiveIntensity = baseEmissive + pulse;
            mesh.material.opacity = isSelected || isHovered ? 0.98 : 0.82;
          }
        });
      });

      // Update Node Centroids & Concentric Shockwave Auras based on Synaptic Traffic
      centroidMeshesRef.current.forEach((meshes, secId) => {
        const act = regionActivation[secId] || 50;
        const freq = 1.5 + (act / 100) * 4.0; // Faster pulse under intense activation
        const pulseScale = 1.0 + (act / 100) * 0.4 + Math.sin(elapsed * freq) * 0.15;

        meshes.forEach((mesh, idx) => {
          if (idx === 0) {
            // Core sphere
            mesh.scale.set(pulseScale, pulseScale, pulseScale);
          } else {
            // Shockwave ring expanding and resetting
            const ringPhase = (elapsed * (freq * 0.5)) % 1;
            const ringScale = 1.0 + ringPhase * 1.5;
            mesh.scale.set(ringScale, ringScale, ringScale);
            if (mesh.material instanceof THREE.MeshBasicMaterial) {
              mesh.material.opacity = Math.max(0, (1 - ringPhase) * 0.45);
            }
          }
        });
      });

      // Update Axon Fiber Lines & Synaptic Light Packets scaled by live Synaptic Intensity
      pathwayLinesRef.current.forEach((line, pwId) => {
        const intInfo = pathwayIntensities[pwId] || { intensity: 50, glowFactor: 1.0 };
        const isSelectedPw = selectedPathwayId === pwId;
        if (line.material instanceof THREE.LineBasicMaterial) {
          // Line opacity scales from 0.2 (quiet) to 0.95 (blazing)
          const targetOpacity = isSelectedPw ? 1.0 : 0.2 + (intInfo.intensity / 100) * 0.75;
          line.material.opacity = targetOpacity;
        }
      });

      synapticPacketsRef.current.forEach((pkt) => {
        const intInfo = pathwayIntensities[pkt.pathwayId] || { intensity: 50, pulseFrequency: 2.0, glowFactor: 1.0 };
        const isSelectedPw = selectedPathwayId === pkt.pathwayId;

        // Packet speed directly scales with pathway intensity
        const speedMultiplier = (0.5 + (intInfo.intensity / 100) * 2.2) * (isSelectedPw ? 1.8 : 1.0);
        pkt.progress += pkt.baseSpeed * speedMultiplier;
        if (pkt.progress >= 1) pkt.progress = 0;

        const pos = pkt.curve.getPoint(pkt.progress);
        pkt.mesh.position.copy(pos);

        // Packet particle scale and pulse
        const packetScale = (0.8 + (intInfo.intensity / 100) * 1.2) * (1 + Math.sin(elapsed * intInfo.pulseFrequency * 3) * 0.25);
        pkt.mesh.scale.set(packetScale, packetScale, packetScale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Mouse Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (cameraRef.current && sceneRef.current) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

        const allSectionMeshes: THREE.Object3D[] = [];
        sectionMeshesRef.current.forEach((meshes) => {
          meshes.forEach((m) => allSectionMeshes.push(m));
        });

        const intersects = raycaster.intersectObjects(allSectionMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const found = hit.userData.section as BrainSectionInfo | undefined;
          if (found) {
            setHoveredSection(found);
          }
        } else if (!isDraggingRef.current) {
          setHoveredSection(null);
        }
      }

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.007;
        targetRotationRef.current.x = Math.max(
          -Math.PI / 2.3,
          Math.min(Math.PI / 2.3, targetRotationRef.current.x + deltaY * 0.007)
        );

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.005;
      const currentLen = cameraTargetPosRef.current.length();
      const newLen = Math.max(3.8, Math.min(13.5, currentLen + zoomDelta));
      cameraTargetPosRef.current.normalize().multiplyScalar(newLen);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      silhouetteGeo.dispose();
      silhouetteMat.dispose();
    };
  }, []);

  // Update Pathway Visibility based on toggle and filter
  useEffect(() => {
    pathwayLinesRef.current.forEach((line, pwId) => {
      const isVisible = showPathways && (
        pathwayFilter === 'all' ||
        (pathwayFilter === 'high_intensity' && (pathwayIntensities[pwId]?.intensity || 0) >= 60) ||
        (pathwayFilter === 'reward' && NEURAL_PATHWAYS.find((p) => p.id === pwId)?.type === 'reward') ||
        (pathwayFilter === 'stress' && NEURAL_PATHWAYS.find((p) => p.id === pwId)?.type === 'stress')
      );
      line.visible = isVisible;
    });

    synapticPacketsRef.current.forEach((pkt) => {
      const isVisible = showPathways && (
        pathwayFilter === 'all' ||
        (pathwayFilter === 'high_intensity' && (pathwayIntensities[pkt.pathwayId]?.intensity || 0) >= 60) ||
        (pathwayFilter === 'reward' && NEURAL_PATHWAYS.find((p) => p.id === pkt.pathwayId)?.type === 'reward') ||
        (pathwayFilter === 'stress' && NEURAL_PATHWAYS.find((p) => p.id === pkt.pathwayId)?.type === 'stress')
      );
      pkt.mesh.visible = isVisible;
    });
  }, [showPathways, pathwayFilter, pathwayIntensities]);

  const setCameraView = (angle: 'perspective' | 'sagittal' | 'axial' | 'coronal' | 'ventral') => {
    setViewAngle(angle);
    setAutoRotate(false);
    if (!cameraTargetPosRef.current) return;

    switch (angle) {
      case 'perspective':
        cameraTargetPosRef.current.set(4.8, 2.8, 7.2);
        targetRotationRef.current = { x: 0.25, y: 0.6 };
        break;
      case 'sagittal':
        cameraTargetPosRef.current.set(8.5, 0.0, 0.0);
        targetRotationRef.current = { x: 0.0, y: Math.PI / 2 };
        break;
      case 'axial':
        cameraTargetPosRef.current.set(0.0, 8.8, 0.0);
        targetRotationRef.current = { x: -Math.PI / 2, y: 0.0 };
        break;
      case 'coronal':
        cameraTargetPosRef.current.set(0.0, 0.0, 8.8);
        targetRotationRef.current = { x: 0.0, y: 0.0 };
        break;
      case 'ventral':
        cameraTargetPosRef.current.set(0.0, -8.8, 0.0);
        targetRotationRef.current = { x: Math.PI / 2, y: 0.0 };
        break;
    }
  };

  const handleSelectSection = (sec: BrainSectionInfo) => {
    if (onSelectRegion) {
      onSelectRegion(sec.id);
    }
    setHoveredSection(sec);
    setSelectedPathwayId(null);
    setAutoRotate(false);
    neuroAudio.playNudgePing(450 + sec.number * 40);

    const [cx, cy, cz] = sec.center3D;
    targetRotationRef.current = {
      x: -cy * 0.22,
      y: Math.atan2(cx, cz || 1),
    };
  };

  const handleSelectPathway = (pathwayId: string) => {
    setSelectedPathwayId(pathwayId === selectedPathwayId ? null : pathwayId);
    const pw = NEURAL_PATHWAYS.find((p) => p.id === pathwayId);
    if (pw) {
      const srcSec = TEN_BRAIN_SECTIONS.find((s) => s.id === pw.source);
      if (srcSec && onSelectRegion) {
        onSelectRegion(srcSec.id);
      }
      neuroAudio.playParadoxChime();
    }
  };

  const handleTriggerSignal = () => {
    if (!activeInspectedSection) return;
    setActiveSignalSource(activeInspectedSection.id);
    neuroAudio.playParadoxChime();

    synapticPacketsRef.current.forEach((pkt) => {
      pkt.baseSpeed *= 3.5;
    });

    setTimeout(() => {
      synapticPacketsRef.current.forEach((pkt) => {
        pkt.baseSpeed /= 3.5;
      });
      setActiveSignalSource(null);
    }, 2000);
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : 'p-4 sm:p-6'
      }`}
    >
      {/* 3D Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Real 3D Human Brain Map: 10 Colored Sections & Live Synaptic Intensity</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Axon lines, light particle velocity, and node shockwaves animate live based on current variable values
          </p>
        </div>

        {/* View Controls & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Anatomical Perspective Presets */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            {(
              [
                { id: 'perspective', label: '3D Orbit' },
                { id: 'sagittal', label: 'Sagittal' },
                { id: 'coronal', label: 'Coronal' },
                { id: 'axial', label: 'Axial' },
                { id: 'ventral', label: 'Ventral' },
              ] as const
            ).map((ang) => (
              <button
                key={ang.id}
                onClick={() => setCameraView(ang.id)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  viewAngle === ang.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ang.label}
              </button>
            ))}
          </div>

          {/* Pathway Intensity Filter */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setPathwayFilter('all')}
              className={`px-2 py-1 font-medium rounded-md transition-colors ${
                pathwayFilter === 'all' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPathwayFilter('high_intensity')}
              className={`px-2 py-1 font-medium rounded-md transition-colors flex items-center gap-1 ${
                pathwayFilter === 'high_intensity' ? 'bg-slate-800 text-amber-300 font-semibold' : 'text-slate-400'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Surges</span>
            </button>
          </div>

          {/* Trigger Neural Impulse */}
          <button
            onClick={handleTriggerSignal}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Fire an action-potential synaptic pulse across pathways"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fire Impulse</span>
          </button>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={autoRotate ? 'Pause 3D rotation' : 'Resume auto-rotation'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset position button */}
          <button
            onClick={() => setCameraView('perspective')}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            title="Reset 3D camera orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit full screen' : 'Expand 3D map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 3D Stage & Interactive Overlays */}
      <div
        className={`relative w-full rounded-xl overflow-hidden my-3 border border-slate-800/80 bg-slate-950 cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'flex-1' : 'h-[460px] sm:h-[540px]'
        }`}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* Floating 3D Navigation Guide HUD (Top-Left) */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 text-[11px] text-slate-300 pointer-events-none max-w-xs shadow-xl">
          <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>LIVE CONNECTOME INTENSITY</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            • Drag: Rotate brain 360° · Scroll: Zoom<br />
            • Line glow & particle speed = Live synaptic traffic<br />
            • Shockwave rings = Node receiving heavy action potentials
          </p>
        </div>

        {/* Live Synaptic Intensity Ribbon (Top-Right) */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-3 text-xs max-w-xs hidden sm:block shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Top Active Synaptic Tracts</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">LIVE GAUGES</span>
          </div>
          <div className="space-y-1.5">
            {sortedPathwaysByIntensity.slice(0, 3).map((pw) => {
              const intInfo = pathwayIntensities[pw.id] || { intensity: 50, statusText: 'Normal' };
              const isSelected = selectedPathwayId === pw.id;
              return (
                <button
                  key={pw.id}
                  onClick={() => handleSelectPathway(pw.id)}
                  className={`w-full text-left p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected ? 'bg-slate-800 border-white' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="truncate text-slate-300 max-w-[150px]">{pw.name}</span>
                    <span className="font-bold tabular-nums" style={{ color: pw.baseColor }}>
                      {intInfo.intensity}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${intInfo.intensity}%`, backgroundColor: pw.baseColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Section & Neural Interaction Telemetry Panel (Bottom-Left) */}
        {activeInspectedSection && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-4 rounded-xl shadow-2xl text-xs transition-all pointer-events-none">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: activeInspectedSection.hexCode }}
                  />
                  <span className="font-bold text-slate-100 text-sm">
                    {activeInspectedSection.number}. {activeInspectedSection.name}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 italic mt-0.5">
                  {activeInspectedSection.latinName} · {activeInspectedSection.color}
                </div>
              </div>

              <div
                className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-slate-950 border border-slate-800 shrink-0 tabular-nums shadow-xs"
                style={{ color: activeInspectedSection.hexCode }}
              >
                {regionActivation[activeInspectedSection.id] || 50}% ACTIVE
              </div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed mb-2.5">
              {activeInspectedSection.role}
            </p>

            {/* Neural Dialogue / Live Synaptic Traffic */}
            <div className="bg-slate-950/85 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>Synaptic Intensity With Connected Sections:</span>
                </span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                {activeInspectedSection.interactionSummary}
              </p>

              {/* Active Connectome Synapses with live intensity bars */}
              {connectedPathways.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  {connectedPathways.map((pathway) => {
                    const intInfo = pathwayIntensities[pathway.id] || { intensity: 50, statusText: 'Normal' };
                    return (
                      <div key={pathway.id} className="text-[10px] font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="truncate max-w-[200px]">
                            {pathway.source.replace('_', ' ')} → {pathway.target.replace('_', ' ')}
                          </span>
                          <span className="font-bold tabular-nums" style={{ color: pathway.baseColor }}>
                            {intInfo.intensity}% ({intInfo.statusText})
                          </span>
                        </div>
                        <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${intInfo.intensity}%`, backgroundColor: pathway.baseColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pulse Announcement if Signal Triggered */}
        {activeSignalSource && (
          <div className="absolute top-3 right-3 bg-cyan-950/90 border border-cyan-500/80 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold shadow-lg animate-bounce">
            ⚡ Action Potential Firing Across Connectome
          </div>
        )}
      </div>

      {/* The 10 Colored Sections Palette & Interactive Dock */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>The 10 Anatomical Sections Palette (Click to Orbit & Focus)</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Node shockwave frequency reflects live incoming synaptic intensity
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {TEN_BRAIN_SECTIONS.map((sec) => {
            const act = regionActivation[sec.id] || 50;
            const isSelected = selectedRegion === sec.id;
            const isHovered = hoveredSection?.id === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => handleSelectSection(sec)}
                onMouseEnter={() => setHoveredSection(sec)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected || isHovered
                    ? 'border-white bg-slate-800 shadow-md scale-102 ring-1 ring-white/30'
                    : 'border-slate-800/90 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: sec.hexCode }}
                  />
                  <span className="font-mono text-[10px] text-slate-400">#{sec.number}</span>
                </div>

                <div className="text-[11px] font-semibold text-slate-200 truncate leading-tight">
                  {sec.name.split(' ')[0]}
                </div>

                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="text-[9px] text-slate-400 truncate">{sec.color.split(' ')[0]}</span>
                  <span className="font-mono font-bold" style={{ color: sec.hexCode }}>
                    {act}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${act}%`, backgroundColor: sec.hexCode }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
