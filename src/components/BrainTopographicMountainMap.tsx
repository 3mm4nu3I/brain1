import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Mountain,
  Compass,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  RotateCcw,
  Maximize2,
  Info,
  Shield,
  Eye,
  Award,
} from 'lucide-react';
import { BrainRegion } from '../types/formula';
import { TEN_BRAIN_SECTIONS, NEURAL_PATHWAYS, BrainSectionInfo } from '../data/brainSections';
import { neuroAudio } from '../utils/audio';

interface BrainTopographicMountainMapProps {
  regionActivation: Record<BrainRegion, number>;
  onSelectRegion?: (region: BrainRegion) => void;
  selectedRegion?: BrainRegion | null;
}

// Coordinate centroids for all 10 regions on the 800x520 anatomical canvas
const REGION_CENTROIDS: Record<BrainRegion, { x: number; y: number; radius: number; baseAltitude: number }> = {
  prefrontal_cortex: { x: 230, y: 220, radius: 78, baseAltitude: 85 },
  motor_cortex: { x: 350, y: 155, radius: 65, baseAltitude: 70 },
  somatosensory_cortex: { x: 435, y: 160, radius: 62, baseAltitude: 68 },
  parietal_lobe: { x: 520, y: 195, radius: 70, baseAltitude: 72 },
  occipital_lobe: { x: 630, y: 275, radius: 68, baseAltitude: 65 },
  temporal_lobe: { x: 380, y: 310, radius: 75, baseAltitude: 60 },
  nucleus_accumbens: { x: 330, y: 250, radius: 46, baseAltitude: 80 },
  amygdala: { x: 355, y: 285, radius: 42, baseAltitude: 78 },
  insula_hypothalamus: { x: 420, y: 255, radius: 48, baseAltitude: 62 },
  cerebellum_brainstem: { x: 550, y: 395, radius: 75, baseAltitude: 55 },
};

// Helper: blend two hex colors
function blendHexColors(color1: string, color2: string, weight = 0.5): string {
  const parse = (hex: string) => {
    const clean = hex.replace('#', '');
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  };
  const c1 = parse(color1);
  const c2 = parse(color2);
  const r = Math.round(c1.r * (1 - weight) + c2.r * weight);
  const g = Math.round(c1.g * (1 - weight) + c2.g * weight);
  const b = Math.round(c1.b * (1 - weight) + c2.b * weight);
  return `rgb(${r}, ${g}, ${b})`;
}

export const BrainTopographicMountainMap: React.FC<BrainTopographicMountainMapProps> = ({
  regionActivation,
  onSelectRegion,
  selectedRegion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<BrainRegion | null>(null);
  const [elevationScale, setElevationScale] = useState<number>(1.25);
  const [contourRings, setContourRings] = useState<number>(12);
  const [isHannibalMode, setIsHannibalMode] = useState<boolean>(false);
  const [showColorMixingPasses, setShowColorMixingPasses] = useState<boolean>(true);
  const [pulsePhase, setPulsePhase] = useState<number>(0);

  // Active inspected region (hovered or selected or prefrontal)
  const activeRegionId = hoveredRegion || selectedRegion || 'prefrontal_cortex';
  const activeSectionInfo = TEN_BRAIN_SECTIONS.find((s) => s.id === activeRegionId) || TEN_BRAIN_SECTIONS[0];

  // Connected pathways for the active region with mixed colors
  const activeInteractions = useMemo(() => {
    return NEURAL_PATHWAYS.filter(
      (p) => p.source === activeRegionId || p.target === activeRegionId
    ).map((p) => {
      const sourceSec = TEN_BRAIN_SECTIONS.find((s) => s.id === p.source);
      const targetSec = TEN_BRAIN_SECTIONS.find((s) => s.id === p.target);
      const mixedColor = blendHexColors(
        sourceSec?.hexCode || '#06B6D4',
        targetSec?.hexCode || '#10B981',
        0.5
      );
      return {
        ...p,
        sourceSec,
        targetSec,
        mixedColor,
      };
    });
  }, [activeRegionId]);

  // Animation ticker for contour pulse wave
  useEffect(() => {
    let animationId: number;
    const tick = () => {
      setPulsePhase((prev) => (prev + 0.03) % (Math.PI * 2));
      animationId = requestAnimationFrame(tick);
    };
    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Main Canvas Rendering for Topographic Mountain Terrain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 820);
    const height = (canvas.height = 540);

    ctx.clearRect(0, 0, width, height);

    // 1. Background Atmosphere (Dark Obsidian or Hannibal Memory Palace Velvet)
    ctx.fillStyle = isHannibalMode ? '#0A0507' : '#030712';
    ctx.fillRect(0, 0, width, height);

    // Subtle topographical background grid
    ctx.strokeStyle = isHannibalMode ? 'rgba(120, 20, 40, 0.08)' : 'rgba(30, 41, 59, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // 2. Anatomical Brain Silhouette Outline (NOT WIREFRAME: Solid Sculptural Bedrock)
    ctx.save();
    ctx.beginPath();
    // Anatomical lateral outline curve
    ctx.moveTo(150, 260); // Frontal inferior pole
    ctx.bezierCurveTo(120, 200, 180, 110, 290, 95); // Frontal lobe crest
    ctx.bezierCurveTo(380, 80, 470, 85, 560, 120); // Superior parietal crest
    ctx.bezierCurveTo(650, 150, 715, 220, 710, 290); // Occipital curve
    ctx.bezierCurveTo(705, 335, 660, 365, 620, 375); // Cerebellar notch
    ctx.bezierCurveTo(635, 430, 580, 465, 520, 460); // Cerebellar bulge
    ctx.bezierCurveTo(490, 455, 475, 485, 460, 495); // Brainstem descending
    ctx.bezierCurveTo(445, 500, 420, 480, 425, 440); // Brainstem ventral
    ctx.bezierCurveTo(390, 420, 310, 400, 280, 360); // Temporal inferior lobe
    ctx.bezierCurveTo(240, 340, 210, 360, 180, 330); // Sylvian fissure notch
    ctx.bezierCurveTo(145, 310, 135, 280, 150, 260); // Closing frontal pole
    ctx.closePath();

    // Fill brain bedrock with gradient
    const bedrockGrad = ctx.createRadialGradient(400, 260, 50, 400, 260, 360);
    if (isHannibalMode) {
      bedrockGrad.addColorStop(0, '#1E0B12');
      bedrockGrad.addColorStop(0.7, '#120508');
      bedrockGrad.addColorStop(1, '#080204');
    } else {
      bedrockGrad.addColorStop(0, '#0F172A');
      bedrockGrad.addColorStop(0.7, '#090D1A');
      bedrockGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = bedrockGrad;
    ctx.fill();

    // Outer Anatomical Border Outline
    ctx.strokeStyle = isHannibalMode ? 'rgba(225, 29, 72, 0.45)' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Subtle Cortical Sulcal Creases (Organic Anatomical Landmarks)
    ctx.strokeStyle = isHannibalMode ? 'rgba(159, 18, 57, 0.25)' : 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1.8;

    // Central Sulcus
    ctx.beginPath();
    ctx.moveTo(395, 95);
    ctx.bezierCurveTo(385, 170, 410, 230, 380, 280);
    ctx.stroke();

    // Sylvian Fissure
    ctx.beginPath();
    ctx.moveTo(210, 315);
    ctx.bezierCurveTo(320, 305, 440, 300, 540, 260);
    ctx.stroke();

    // Parieto-occipital Sulcus
    ctx.beginPath();
    ctx.moveTo(580, 130);
    ctx.bezierCurveTo(595, 200, 620, 250, 650, 280);
    ctx.stroke();

    ctx.restore();

    // 3. Topographic Mountain Ridges / Saddles with DYNAMIC COLOR MIXING
    if (showColorMixingPasses) {
      NEURAL_PATHWAYS.forEach((path) => {
        const srcCoord = REGION_CENTROIDS[path.source];
        const tgtCoord = REGION_CENTROIDS[path.target];
        if (!srcCoord || !tgtCoord) return;

        const srcSec = TEN_BRAIN_SECTIONS.find((s) => s.id === path.source);
        const tgtSec = TEN_BRAIN_SECTIONS.find((s) => s.id === path.target);
        if (!srcSec || !tgtSec) return;

        const isHighlighted = path.source === activeRegionId || path.target === activeRegionId;
        const activation = (regionActivation[path.source] + regionActivation[path.target]) / 2;

        // Middle saddle midpoint
        const midX = (srcCoord.x + tgtCoord.x) / 2;
        const midY = (srcCoord.y + tgtCoord.y) / 2;

        // Draw mountain saddle elevation pass
        const saddleGrad = ctx.createLinearGradient(srcCoord.x, srcCoord.y, tgtCoord.x, tgtCoord.y);
        const col1 = isHannibalMode ? '#9F1239' : srcSec.hexCode;
        const col2 = isHannibalMode ? '#E11D48' : tgtSec.hexCode;
        const mixedCol = isHannibalMode ? '#BE123C' : blendHexColors(srcSec.hexCode, tgtSec.hexCode, 0.5);

        saddleGrad.addColorStop(0, col1);
        saddleGrad.addColorStop(0.5, mixedCol);
        saddleGrad.addColorStop(1, col2);

        // Saddle ridge ribbon
        ctx.beginPath();
        ctx.moveTo(srcCoord.x, srcCoord.y);
        ctx.quadraticCurveTo(midX + Math.sin(pulsePhase) * 6, midY - Math.cos(pulsePhase) * 6, tgtCoord.x, tgtCoord.y);
        ctx.strokeStyle = saddleGrad;
        ctx.lineWidth = isHighlighted ? 6.5 : 3.0;
        ctx.globalAlpha = isHighlighted ? 0.85 : 0.45 * (activation / 70);
        ctx.stroke();

        // Color-mixed pulse packets flowing through the mountain pass
        if (isHighlighted) {
          const packetT = (pulsePhase / (Math.PI * 2) + (path.name.length % 5) * 0.2) % 1;
          const px = srcCoord.x + (tgtCoord.x - srcCoord.x) * packetT;
          const py = srcCoord.y + (tgtCoord.y - srcCoord.y) * packetT;

          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = mixedCol;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1.0;
      });
    }

    // 4. Topographical Mountain Massifs & Elevation Contours for each Region
    TEN_BRAIN_SECTIONS.forEach((sec) => {
      const coord = REGION_CENTROIDS[sec.id];
      if (!coord) return;

      const activation = regionActivation[sec.id] || 50;
      const isSelected = selectedRegion === sec.id;
      const isHovered = hoveredRegion === sec.id;
      const isFocal = isSelected || isHovered;

      // Calculate peak mountain altitude
      const mountainAltitude = (coord.baseAltitude * 0.6 + activation * 0.9) * elevationScale;
      const rings = contourRings;

      const baseColor = isHannibalMode ? '#BE123C' : sec.hexCode;

      // Draw elevation contours from base to summit
      for (let r = rings; r >= 1; r--) {
        const ringProgress = r / rings; // 1.0 = base, ~0.1 = summit
        const radius = coord.radius * ringProgress * (0.8 + (activation / 100) * 0.4);
        const yOffset = (1 - ringProgress) * (mountainAltitude * 0.45); // Elevation visual lift

        ctx.beginPath();
        // Slightly organic non-circular mountain ridge
        const points = 16;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const jitter = Math.sin(angle * 3 + r + sec.number) * (4 * ringProgress);
          const px = coord.x + Math.cos(angle) * (radius + jitter);
          const py = coord.y - yOffset + Math.sin(angle) * (radius * 0.75 + jitter);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Shaded elevation fill
        const alpha = (1.05 - ringProgress * 0.8) * (isFocal ? 0.75 : 0.48);
        if (r === 1) {
          // Summit peak (brightest glow)
          ctx.fillStyle = isHannibalMode ? '#FFE4E6' : '#FFFFFF';
        } else {
          ctx.fillStyle = baseColor;
        }
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Contour Isobar Stroke
        ctx.strokeStyle = r === 1 ? '#FFFFFF' : baseColor;
        ctx.lineWidth = r === 1 || r % 4 === 0 ? 1.8 : 0.8;
        ctx.globalAlpha = isFocal ? 0.95 : 0.6;
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;

      // Summit Elevation Pin & Label
      const summitY = coord.y - mountainAltitude * 0.45;

      ctx.beginPath();
      ctx.arc(coord.x, summitY, isFocal ? 5.5 : 4.0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isFocal ? 14 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mountain Badge Text
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = isFocal ? '#FFFFFF' : '#CBD5E1';
      ctx.textAlign = 'center';
      ctx.fillText(
        `#${sec.number} ${Math.round(activation)}%`,
        coord.x,
        summitY - 8
      );
    });

    // 5. Hannibal Mind Palace Architectural Flourishes (if active)
    if (isHannibalMode) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 1;
      // Memory Palace crosshairs & classical ratios
      ctx.strokeRect(60, 40, width - 120, height - 80);
      ctx.font = 'italic 11px serif';
      ctx.fillStyle = '#FDA4AF';
      ctx.textAlign = 'left';
      ctx.fillText('PALAZZO CAPPONI // FORENSIC NEURO-ACUITY MAP', 75, 60);
      ctx.textAlign = 'right';
      ctx.fillText('RATIO DISCRIMINATOR: ACTIVE', width - 75, 60);
    }
  }, [
    regionActivation,
    selectedRegion,
    hoveredRegion,
    elevationScale,
    contourRings,
    isHannibalMode,
    showColorMixingPasses,
    pulsePhase,
    activeRegionId,
  ]);

  // Handle canvas mouse clicks & hover
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let found: BrainRegion | null = null;
    TEN_BRAIN_SECTIONS.forEach((sec) => {
      const coord = REGION_CENTROIDS[sec.id];
      if (!coord) return;
      const dist = Math.hypot(mouseX - coord.x, mouseY - coord.y);
      if (dist < coord.radius * 0.95) {
        found = sec.id;
      }
    });

    setHoveredRegion(found);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    TEN_BRAIN_SECTIONS.forEach((sec) => {
      const coord = REGION_CENTROIDS[sec.id];
      if (!coord) return;
      const dist = Math.hypot(mouseX - coord.x, mouseY - coord.y);
      if (dist < coord.radius) {
        if (onSelectRegion) onSelectRegion(sec.id);
        neuroAudio.playNudgePing(440 + sec.number * 40);
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header with Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Topographic Cortical Mountain Map (Gradients & Color-Mixing Interactions)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Solid anatomical brain outline with elevation mountain massifs. Heights represent regional fMRI intensity; mountain passes feature active mathematical color mixing along neural pathways.
          </p>
        </div>

        {/* View Controls & Hannibal Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsHannibalMode(!isHannibalMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
              isHannibalMode
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Hannibal Lecter Mind Palace Forensic Acuity Mode"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>{isHannibalMode ? 'Hannibal Mind Palace' : 'Clinical Topography'}</span>
          </button>

          <button
            onClick={() => setShowColorMixingPasses(!showColorMixingPasses)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              showColorMixingPasses
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Color-Mixing Passes: {showColorMixingPasses ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Topographic Mountain Canvas Viewport */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          onMouseLeave={() => setHoveredRegion(null)}
          className="w-full block bg-slate-950 cursor-pointer"
          style={{ maxHeight: '540px' }}
        />

        {/* Floating Topographic HUD Legend in Top-Right */}
        <div className="absolute top-3 right-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 p-3 rounded-xl shadow-lg max-w-xs text-xs space-y-2 pointer-events-none sm:pointer-events-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-semibold text-slate-200">
              #{activeSectionInfo.number} {activeSectionInfo.name}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeSectionInfo.hexCode }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">PEAK ALTITUDE:</span>
              <span className="text-cyan-300 font-bold">
                {Math.round(regionActivation[activeSectionInfo.id] || 50)}% fMRI
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">MASS:</span>
              <span className="text-slate-300">
                {activeSectionInfo.color}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug">
            {activeSectionInfo.role}
          </p>

          {/* Color Mixing Formula Indicator */}
          {activeInteractions.length > 0 && (
            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block">
                Active Color-Mixed Passes ({activeInteractions.length}):
              </span>
              <div className="space-y-1">
                {activeInteractions.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 truncate max-w-[130px]">{item.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.sourceSec?.hexCode }}
                      />
                      <span>+</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.targetSec?.hexCode }}
                      />
                      <span>=</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full ring-1 ring-white/40"
                        style={{ backgroundColor: item.mixedColor }}
                        title="Blended gradient color"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrubbers for Elevation and Contour Isobars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl text-xs">
        {/* 1. Elevation Altitude Multiplier */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400 font-semibold">
            <span>Elevation Relief:</span>
            <span className="font-mono text-cyan-300">{elevationScale.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={2.4}
            step={0.1}
            value={elevationScale}
            onChange={(e) => setElevationScale(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.6× (Flat Hills)</span>
            <span>1.25× (Standard)</span>
            <span>2.4× (Alpine Alpine)</span>
          </div>
        </div>

        {/* 2. Contour Isobar Density */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400 font-semibold">
            <span>Contour Isobar Rings:</span>
            <span className="font-mono text-cyan-300">{contourRings} rings</span>
          </div>
          <input
            type="range"
            min={6}
            max={20}
            step={1}
            value={contourRings}
            onChange={(e) => setContourRings(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>6 (Minimalist)</span>
            <span>12 (Balanced)</span>
            <span>20 (Fine Gradient)</span>
          </div>
        </div>

        {/* 3. Hannibal Mode Acuity Notice */}
        <div className="col-span-1 sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {isHannibalMode
                ? 'Hannibal Mind Palace mode: Classical chiaroscuro elevation, heightened sensory acuity, and forensic blood-rose gradients.'
                : 'WHO Clinical Topography: Full 10-lobe spectrum with mathematical linear color-interpolation across all active tracts.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
