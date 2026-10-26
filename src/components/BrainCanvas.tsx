import React, { useEffect, useRef, useState } from 'react';
import { BrainRegion } from '../types/formula';
import { TEN_BRAIN_SECTIONS, BrainSectionInfo } from '../data/brainSections';

interface BrainCanvasProps {
  regionActivation: Record<BrainRegion, number>;
  onSelectRegion?: (region: BrainRegion) => void;
  selectedRegion?: BrainRegion | null;
}

export const BrainCanvas: React.FC<BrainCanvasProps> = ({
  regionActivation,
  onSelectRegion,
  selectedRegion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSection, setHoveredSection] = useState<BrainSectionInfo | null>(null);

  // 2D Sagittal coordinate placement for each of the 10 sections
  const SECTION_2D_COORDS: Record<BrainRegion, { xPct: number; yPct: number }> = {
    prefrontal_cortex: { xPct: 0.22, yPct: 0.38 },
    motor_cortex: { xPct: 0.44, yPct: 0.26 },
    somatosensory_cortex: { xPct: 0.56, yPct: 0.27 },
    parietal_lobe: { xPct: 0.68, yPct: 0.32 },
    occipital_lobe: { xPct: 0.82, yPct: 0.48 },
    temporal_lobe: { xPct: 0.48, yPct: 0.54 },
    nucleus_accumbens: { xPct: 0.38, yPct: 0.48 },
    amygdala: { xPct: 0.44, yPct: 0.65 },
    insula_hypothalamus: { xPct: 0.54, yPct: 0.60 },
    cerebellum_brainstem: { xPct: 0.74, yPct: 0.75 },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    // Synaptic particles
    const particles: Array<{
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      size: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      const from = Math.floor(Math.random() * TEN_BRAIN_SECTIONS.length);
      let to = Math.floor(Math.random() * TEN_BRAIN_SECTIONS.length);
      if (to === from) to = (from + 1) % TEN_BRAIN_SECTIONS.length;
      particles.push({
        fromIdx: from,
        toIdx: to,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.008,
        size: 1.5 + Math.random() * 2,
      });
    }

    const render = () => {
      t += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Subtle technical grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Anatomical Real Brain Sagittal Contour Outline
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Sagittal perimeter
      const cx = width * 0.52;
      const cy = height * 0.48;
      const rX = width * 0.38;
      const rY = height * 0.34;
      ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Cerebellum posterior bulge
      ctx.beginPath();
      ctx.ellipse(width * 0.72, height * 0.72, width * 0.14, height * 0.16, 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Node coordinates
      const coords = TEN_BRAIN_SECTIONS.map((sec) => {
        const p = SECTION_2D_COORDS[sec.id];
        return {
          x: p.xPct * width,
          y: p.yPct * height,
          act: regionActivation[sec.id] || 50,
          color: sec.hexCode,
        };
      });

      // Neural interconnecting synapses
      for (let i = 0; i < coords.length; i++) {
        for (let j = i + 1; j < coords.length; j++) {
          const n1 = coords[i];
          const n2 = coords[j];
          const avgAct = (n1.act + n2.act) / 2;

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          const mx = (n1.x + n2.x) / 2 + Math.sin(t + i) * 6;
          const my = (n1.y + n2.y) / 2 + Math.cos(t + j) * 6;
          ctx.quadraticCurveTo(mx, my, n2.x, n2.y);

          ctx.strokeStyle = `rgba(56, 189, 248, ${0.06 + (avgAct / 100) * 0.22})`;
          ctx.lineWidth = 1 + (avgAct / 100) * 1.5;
          ctx.stroke();
        }
      }

      // Moving synaptic particles
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.fromIdx = Math.floor(Math.random() * TEN_BRAIN_SECTIONS.length);
          p.toIdx = (p.fromIdx + 1 + Math.floor(Math.random() * (TEN_BRAIN_SECTIONS.length - 1))) % TEN_BRAIN_SECTIONS.length;
        }

        const start = coords[p.fromIdx];
        const end = coords[p.toIdx];
        const px = start.x + (end.x - start.x) * p.progress;
        const py = start.y + (end.y - start.y) * p.progress;

        ctx.fillStyle = TEN_BRAIN_SECTIONS[p.fromIdx].hexCode;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw the 10 Section Nodes
      TEN_BRAIN_SECTIONS.forEach((sec, idx) => {
        const { x, y, act } = coords[idx];
        const isHovered = hoveredSection?.id === sec.id;
        const isSelected = selectedRegion === sec.id;

        const pulse = Math.sin(t * 2 + idx) * 3;
        const radius = 9 + (act / 100) * 10 + (isHovered || isSelected ? 4 : 0);

        // Glowing outer halo
        const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius + 14 + pulse);
        gradient.addColorStop(0, sec.hexCode);
        gradient.addColorStop(0.6, `${sec.hexCode}33`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius + 14 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core Node Circle
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = sec.hexCode;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center dot
        ctx.fillStyle = sec.hexCode;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node Label
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.fillText(`${sec.number}. ${sec.name.split(' ')[0]}`, x, y - radius - 8);

        // Percentage readout
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = sec.hexCode;
        ctx.fillText(`${act}%`, x, y + radius + 12);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [regionActivation, hoveredSection, selectedRegion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    let found: BrainSectionInfo | null = null;
    TEN_BRAIN_SECTIONS.forEach((sec) => {
      const p = SECTION_2D_COORDS[sec.id];
      const nx = p.xPct * canvas.width;
      const ny = p.yPct * canvas.height;
      const dist = Math.hypot(mouseX - nx, mouseY - ny);
      if (dist < 30) {
        found = sec;
      }
    });
    setHoveredSection(found);
  };

  const handleClick = () => {
    if (hoveredSection && onSelectRegion) {
      onSelectRegion(hoveredSection.id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">2D Sagittal Real Brain Cross-Section</span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          10 Colored Anatomical Lobes · Interactive Nodes
        </div>
      </div>

      <div className="relative w-full aspect-16/10 sm:aspect-2/1 flex items-center justify-center my-2">
        <canvas
          ref={canvasRef}
          width={700}
          height={380}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredSection(null)}
          onClick={handleClick}
          className="w-full h-full object-contain cursor-crosshair rounded-lg bg-slate-950/70"
        />

        {/* Floating Node Inspection HUD */}
        {hoveredSection && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-900/95 border border-slate-700/80 p-3 rounded-lg shadow-xl backdrop-blur-xs text-xs pointer-events-none transition-all">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-semibold text-slate-100">{hoveredSection.number}. {hoveredSection.name}</span>
              <span className="font-mono font-bold" style={{ color: hoveredSection.hexCode }}>
                {regionActivation[hoveredSection.id] || 50}% ACTIVE
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mb-1.5">
              {hoveredSection.role}
            </p>
            <div className="text-slate-400 text-[10px] font-mono">
              Interactions: <span className="text-slate-200">{hoveredSection.interactionSummary}</span>
            </div>
          </div>
        )}
      </div>

      {/* 10 Sections Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-2 border-t border-slate-800 text-xs">
        {TEN_BRAIN_SECTIONS.map((sec) => {
          const act = regionActivation[sec.id] || 50;
          const isSelected = selectedRegion === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectRegion && onSelectRegion(sec.id)}
              className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'border-white bg-slate-800'
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 truncate font-medium">{sec.name.split(' ')[0]}</span>
                <span className="font-mono font-bold" style={{ color: sec.hexCode }}>
                  {act}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
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
  );
};
