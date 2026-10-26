import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Palette,
  Play,
  Pause,
  Shuffle,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  Flame,
  Activity,
  Zap,
  Layers,
  Heart,
  ShieldAlert,
} from 'lucide-react';
import { HappinessBreakdown, BrainVariable } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface GenerativeMoodArtStudioProps {
  breakdown: HappinessBreakdown;
  variables: BrainVariable[];
  hoursSinceLastDose: number;
  dailySpendUSD: number;
}

type ArtAlgorithm =
  | 'synaptic_dream'
  | 'pre_shutdown_resonance'
  | 'golden_ratio_mandala'
  | 'allostatic_storm'
  | 'serotonin_ocean';

type ColorPaletteId =
  | 'neuro_spectrum'
  | 'dopamine_solar'
  | 'shutdown_crimson'
  | 'deep_serotonin'
  | 'acid_paradox';

export const GenerativeMoodArtStudio: React.FC<GenerativeMoodArtStudioProps> = ({
  breakdown,
  variables,
  hoursSinceLastDose,
  dailySpendUSD,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Studio configuration state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [algorithm, setAlgorithm] = useState<ArtAlgorithm>('synaptic_dream');
  const [paletteId, setPaletteId] = useState<ColorPaletteId>('neuro_spectrum');
  const [flowSpeed, setFlowSpeed] = useState<number>(1.0);
  const [particleDensity, setParticleDensity] = useState<number>(450);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Extract key neuro variables
  const dop = variables.find((v) => v.id === 'dopamine_delta')?.value ?? 50;
  const ser = variables.find((v) => v.id === 'serotonin_flux')?.value ?? 50;
  const oxy = variables.find((v) => v.id === 'oxytocin_cuddle')?.value ?? 50;
  const cor = variables.find((v) => v.id === 'cortisol_burden')?.value ?? 40;
  const ade = variables.find((v) => v.id === 'adenosine_sleep_debt')?.value ?? 30;
  const gab = variables.find((v) => v.id === 'gaba_calm')?.value ?? 50;
  const think = variables.find((v) => v.id === 'recursive_overthinking')?.value ?? 40;

  // Key Ratios derived directly from the neurochemistry & formula
  const ratios = useMemo(() => {
    const rewardSum = dop * 1.1 + ser * 1.0 + oxy * 0.9;
    const stressSum = Math.max(1, cor * 1.2 + ade * 0.9 + breakdown.withdrawalPenalty * 1.5);
    const rewardStressRatio = Math.round((rewardSum / stressSum) * 100) / 100;

    const oxytocinCortisolRatio = Math.round((oxy / Math.max(1, cor)) * 100) / 100;
    const tranquilityEntropyRatio = Math.round((gab / Math.max(1, think)) * 100) / 100;
    const allostaticSafetyMargin = Math.max(0, 100 - breakdown.allostaticLoad);

    // Is the brain in pre-shutdown / agonal high-strain state?
    const isPreShutdown = breakdown.allostaticLoad > 75 || breakdown.normalizedHappiness < 22;

    return {
      rewardStressRatio,
      oxytocinCortisolRatio,
      tranquilityEntropyRatio,
      allostaticSafetyMargin,
      isPreShutdown,
    };
  }, [dop, ser, oxy, cor, ade, gab, think, breakdown]);

  // Color palettes generator
  const getPaletteColors = (id: ColorPaletteId): string[] => {
    switch (id) {
      case 'dopamine_solar':
        return ['#F59E0B', '#FBBF24', '#FDE68A', '#D97706', '#FFFBEB'];
      case 'shutdown_crimson':
        return ['#F43F5E', '#E11D48', '#BE123C', '#FDA4AF', '#FFFFFF'];
      case 'deep_serotonin':
        return ['#06B6D4', '#0284C7', '#38BDF8', '#6366F1', '#A5F3FC'];
      case 'acid_paradox':
        return ['#A855F7', '#84CC16', '#EC4899', '#06B6D4', '#FACC15'];
      case 'neuro_spectrum':
      default:
        return ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#F43F5E', '#EC4899'];
    }
  };

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = Math.round(width * 0.58));

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = Math.max(380, Math.round(width * 0.58));
    };

    window.addEventListener('resize', handleResize);

    // Particle cache based on seed
    const colors = getPaletteColors(paletteId);
    const particleCount = particleDensity;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      theta: number;
      speed: number;
      phase: number;
    }> = [];

    let seed = randomSeed;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < particleCount; i++) {
      const angle = pseudoRandom() * Math.PI * 2;
      const radius = pseudoRandom() * (Math.min(width, height) * 0.45);
      particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (pseudoRandom() - 0.5) * 1.5,
        vy: (pseudoRandom() - 0.5) * 1.5,
        size: pseudoRandom() * 2.8 + 1,
        color: colors[Math.floor(pseudoRandom() * colors.length)],
        alpha: pseudoRandom() * 0.6 + 0.3,
        theta: angle,
        speed: (pseudoRandom() * 0.8 + 0.4) * (dop / 50),
        phase: pseudoRandom() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      if (!ctx) return;

      time += 0.015 * flowSpeed;

      // Background clearing with slight trail persistence for glowing fluidity
      ctx.fillStyle = ratios.isPreShutdown
        ? 'rgba(10, 10, 15, 0.22)' // Starker, high-contrast trails in near-shutdown
        : 'rgba(2, 6, 23, 0.16)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 1. Draw Algorithm-Specific Visual Structures
      switch (algorithm) {
        case 'synaptic_dream': {
          // Flow field with bioluminescent axon branches
          ctx.lineWidth = 1.2;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const noise = Math.sin(p.x * 0.005 + time) * Math.cos(p.y * 0.005 + time * 0.8);
            const angle = noise * Math.PI * 3 + (oxy / 100) * 0.5;

            p.vx = Math.cos(angle) * p.speed * 1.6;
            p.vy = Math.sin(angle) * p.speed * 1.6;

            p.x += p.vx;
            p.y += p.vy;

            // Wrap edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Draw photon trail
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (breakdown.normalizedHappiness / 60), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * (gab / 60);
            ctx.fill();

            // Connect nearby synaptic points with axon line filaments
            if (i % 6 === 0) {
              const neighbor = particles[(i + 1) % particles.length];
              const dist = Math.hypot(p.x - neighbor.x, p.y - neighbor.y);
              if (dist < 45) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(neighbor.x, neighbor.y);
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = (1 - dist / 45) * 0.35 * (ser / 60);
                ctx.stroke();
              }
            }
          }
          break;
        }

        case 'pre_shutdown_resonance': {
          // Stark, agonal high-tension geometric pulse waves & lightning arcs
          const pulse = (Math.sin(time * 3.5) + 1) * 0.5;
          const strainIntensity = breakdown.allostaticLoad / 100;

          // Central vital core ring
          ctx.beginPath();
          ctx.arc(cx, cy, 50 + pulse * 40 * strainIntensity, 0, Math.PI * 2);
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 3 + pulse * 4;
          ctx.globalAlpha = 0.8;
          ctx.stroke();

          // High-voltage synaptic lightning fracture lines
          const rays = 18;
          for (let r = 0; r < rays; r++) {
            const baseAngle = (r / rays) * Math.PI * 2 + time * 0.4;
            ctx.beginPath();
            ctx.moveTo(cx, cy);

            let currX = cx;
            let currY = cy;
            const segments = 8;
            for (let s = 1; s <= segments; s++) {
              const segRadius = (s / segments) * (Math.min(width, height) * 0.45);
              const jitter = (Math.sin(time * 6 + r * 3 + s) * 22 * (cor / 50));
              currX = cx + Math.cos(baseAngle) * segRadius + Math.cos(baseAngle + Math.PI / 2) * jitter;
              currY = cy + Math.sin(baseAngle) * segRadius + Math.sin(baseAngle + Math.PI / 2) * jitter;
              ctx.lineTo(currX, currY);
            }

            ctx.strokeStyle = r % 2 === 0 ? '#FDA4AF' : '#06B6D4';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.65;
            ctx.stroke();
          }

          // Agonal particle burst
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.theta += 0.02 * (cor / 40);
            const dist = 60 + ((i * 1.5 + time * 80) % (Math.min(width, height) * 0.45));
            p.x = cx + Math.cos(p.theta) * dist;
            p.y = cy + Math.sin(p.theta) * dist;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + pulse), 0, Math.PI * 2);
            ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : '#F43F5E';
            ctx.globalAlpha = 0.8;
            ctx.fill();
          }
          break;
        }

        case 'golden_ratio_mandala': {
          // Sacred Lissajous curves & phyllotaxis golden spiral blooms
          const phi = 1.61803398875;
          const petals = Math.min(600, particleCount);
          const goldenAngle = Math.PI * (3 - Math.sqrt(5));

          ctx.lineWidth = 1.5;
          for (let i = 1; i <= petals; i++) {
            const theta = i * goldenAngle + time * (ser / 80) * 0.3;
            const r = Math.sqrt(i) * 11 * (breakdown.normalizedHappiness / 65);
            const x = cx + Math.cos(theta) * r;
            const y = cy + Math.sin(theta) * r;

            const colorIndex = i % colors.length;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.sin(i * 0.2 + time) * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = colors[colorIndex];
            ctx.globalAlpha = 0.75;
            ctx.fill();

            // Intersecting harmonic spiral ribbons
            if (i % 7 === 0) {
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.quadraticCurveTo(
                cx + Math.cos(theta * 0.5) * r * 0.6,
                cy + Math.sin(theta * 0.5) * r * 0.6,
                x,
                y
              );
              ctx.strokeStyle = colors[colorIndex];
              ctx.globalAlpha = 0.18 * (gab / 50);
              ctx.stroke();
            }
          }
          break;
        }

        case 'allostatic_storm': {
          // Turbulent storm vortex driven by overthinking, hangry & cortisol
          const stormIntensity = (cor + think + ade) / 150;
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = p.x - cx;
            const dy = p.y - cy;
            const dist = Math.max(10, Math.hypot(dx, dy));

            // Vortex orbital angular velocity
            const orbitalV = (140 / dist) * stormIntensity * 0.4;
            const radialV = (Math.sin(dist * 0.05 - time * 2) * 2 - 0.4) * stormIntensity;

            p.x += -Math.sin(Math.atan2(dy, dx)) * orbitalV + Math.cos(Math.atan2(dy, dx)) * radialV;
            p.y += Math.cos(Math.atan2(dy, dx)) * orbitalV + Math.sin(Math.atan2(dy, dx)) * radialV;

            if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
              p.x = cx + (pseudoRandom() - 0.5) * 80;
              p.y = cy + (pseudoRandom() - 0.5) * 80;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.3, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.7;
            ctx.fill();
          }
          break;
        }

        case 'serotonin_ocean': {
          // Undulating fluid wave caustics & deep serene bioluminescent drift
          const waveCount = 5;
          for (let w = 0; w < waveCount; w++) {
            ctx.beginPath();
            ctx.moveTo(0, height);

            const amp = 25 + w * 12 + Math.sin(time + w) * 10;
            const freq = 0.006 + w * 0.002;
            const yOffset = height * 0.45 + w * 35;

            for (let x = 0; x <= width; x += 15) {
              const y = yOffset + Math.sin(x * freq + time * (1 + w * 0.3) + pNoise(w)) * amp;
              ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fillStyle = colors[w % colors.length];
            ctx.globalAlpha = 0.12 + (ser / 100) * 0.08;
            ctx.fill();
          }

          // Gentle plankton floating upwards
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y -= p.speed * 0.4;
            p.x += Math.sin(time + p.phase) * 0.6;
            if (p.y < 0) p.y = height;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.fill();
          }
          break;
        }
      }

      ctx.globalAlpha = 1.0;

      // Subtle Watermark & Live Formula Ratios Overlay in lower canvas
      ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
      ctx.fillRect(16, height - 42, 340, 28);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, height - 42, 340, 28);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(
        `H = ${breakdown.normalizedHappiness} · Rew/Stress: ${ratios.rewardStressRatio}:1 · Allostatic: ${breakdown.allostaticLoad}%`,
        26,
        height - 24
      );

      if (isPlaying) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    function pNoise(n: number) {
      return Math.sin(n * 9.21) * 3.14;
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    algorithm,
    paletteId,
    flowSpeed,
    particleDensity,
    randomSeed,
    isPlaying,
    breakdown,
    dop,
    ser,
    oxy,
    cor,
    ade,
    gab,
    think,
    ratios,
  ]);

  // Export high-resolution Artwork with metadata card
  const handleExportArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offscreen export canvas at 1920x1080 for pristine print quality
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const eCtx = exportCanvas.getContext('2d');
    if (!eCtx) return;

    // Draw existing canvas scaled up
    eCtx.drawImage(canvas, 0, 0, 1920, 1080);

    // Render Museum Neuro-Art Metadata Plaque at bottom
    eCtx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    eCtx.fillRect(40, 960, 820, 80);
    eCtx.strokeStyle = '#06B6D4';
    eCtx.lineWidth = 2;
    eCtx.strokeRect(40, 960, 820, 80);

    eCtx.fillStyle = '#FFFFFF';
    eCtx.font = 'bold 20px sans-serif';
    eCtx.fillText(
      `"Cranial State: ${breakdown.stateArchetype.title}" — Generative Mood Synthesis`,
      60,
      995
    );

    eCtx.fillStyle = '#06B6D4';
    eCtx.font = '14px monospace';
    eCtx.fillText(
      `H = ${breakdown.normalizedHappiness} / 100 · Rew/Stress = ${ratios.rewardStressRatio}:1 · Oxy/Cort = ${ratios.oxytocinCortisolRatio} · Allostatic Load = ${breakdown.allostaticLoad}%`,
      60,
      1022
    );

    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `NeuroArt_Happiness_${breakdown.normalizedHappiness}_${Date.now()}.png`;
    a.click();

    setExportNotice('High-resolution artwork downloaded successfully (1920×1080 PNG)!');
    neuroAudio.playParadoxChime();
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleShuffleSeed = () => {
    setRandomSeed(Math.floor(Math.random() * 999999));
    neuroAudio.playNudgePing(580);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header with Section Title & Ratio Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Generative Mood Art Studio & Pre-Shutdown Vitality
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Procedural algorithmic artwork driven in real time by your calculated brain happiness (H), neurochemical ratios, and pre-shutdown allostatic strain thresholds.
          </p>
        </div>

        {/* Live Ratio Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Rew/Stress:</span>
            <span className="text-amber-300 font-bold">{ratios.rewardStressRatio} : 1</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Oxy/Cort:</span>
            <span className="text-rose-300 font-bold">{ratios.oxytocinCortisolRatio}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            ratios.isPreShutdown
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Vitality: {ratios.allostaticSafetyMargin}%</span>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-inner">
        {/* Pre-Shutdown Terminal State Banner if Allostatic Load > 75 */}
        {ratios.isPreShutdown && (
          <div className="absolute top-3 left-3 right-3 z-20 bg-rose-950/85 border border-rose-600/70 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs text-rose-200 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400 animate-spin" />
              <span>
                <strong>PRE-SHUTDOWN AGONAL MODE ACTIVE:</strong> Allostatic strain ({breakdown.allostaticLoad}%) has crossed the autonomic reserve threshold. Canvas rendering stark high-tension survival fractures.
              </span>
            </div>
            <button
              onClick={() => setAlgorithm('pre_shutdown_resonance')}
              className="text-[11px] underline font-mono hover:text-white cursor-pointer ml-3 shrink-0"
            >
              Lock Agonal Preset
            </button>
          </div>
        )}

        {/* The HTML5 Rendering Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full block bg-slate-950 cursor-crosshair transition-all"
        />

        {/* In-Canvas Floating Toolbar */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-lg">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShuffleSeed}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Mutate Quantum Seed"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportArtwork}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title="Export High-Res PNG Artwork"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Export Confirmation Alert */}
      {exportNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Controls Stage: Algorithms & Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl text-xs">
        {/* 1. Algorithm Selection */}
        <div className="space-y-1.5">
          <label className="text-slate-400 font-semibold block flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generative Algorithm</span>
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as ArtAlgorithm)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
          >
            <option value="synaptic_dream">Synaptic Neural Dreamscape (Fluid Flow)</option>
            <option value="pre_shutdown_resonance">Pre-Shutdown Agonal Resonance (High Strain)</option>
            <option value="golden_ratio_mandala">Harmonic Golden Ratio Mandala (Lissajous)</option>
            <option value="allostatic_storm">Allostatic Storm & Particle Vortex</option>
            <option value="serotonin_ocean">Deep Serotonin Ocean Waves (Bioluminescence)</option>
          </select>
        </div>

        {/* 2. Color Palette */}
        <div className="space-y-1.5">
          <label className="text-slate-400 font-semibold block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Harmonic Palette</span>
          </label>
          <select
            value={paletteId}
            onChange={(e) => setPaletteId(e.target.value as ColorPaletteId)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
          >
            <option value="neuro_spectrum">10-Lobe Neuro Spectrum (Multi-Color)</option>
            <option value="dopamine_solar">Dopamine Solar Amber</option>
            <option value="shutdown_crimson">Pre-Shutdown Crimson & White</option>
            <option value="deep_serotonin">Deep Serotonin Cyan & Indigo</option>
            <option value="acid_paradox">Acid Paradox (Neon Lime & Violet)</option>
          </select>
        </div>

        {/* 3. Flow Speed */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400 font-semibold">
            <span>Neural Flow Speed:</span>
            <span className="font-mono text-cyan-300">{flowSpeed.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={flowSpeed}
            onChange={(e) => setFlowSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.2× (Deep Zen)</span>
            <span>1.0× (Normal)</span>
            <span>3.0× (Mania)</span>
          </div>
        </div>

        {/* 4. Particle / Synapse Density */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400 font-semibold">
            <span>Synaptic Density:</span>
            <span className="font-mono text-cyan-300">{particleDensity} pts</span>
          </div>
          <input
            type="range"
            min={150}
            max={900}
            step={50}
            value={particleDensity}
            onChange={(e) => setParticleDensity(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>150 (Minimalist)</span>
            <span>450 (Balanced)</span>
            <span>900 (Ultra Lush)</span>
          </div>
        </div>
      </div>

      {/* Explanatory Scientific Legend of How the Art Works */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2 leading-relaxed">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Biophysical Art Translation Formula:</span>
        </div>
        <p>
          Every visual vector is locked directly to your cranial state: <strong>Dopamine</strong> drives particle velocity and photon brightness; <strong>Serotonin</strong> binds nearby synaptic points into smooth harmonious ribbons; <strong>Oxytocin</strong> rounds jagged tangents into golden phyllotaxis curves; while <strong>Cortisol & Adenosine</strong> trigger chaotic turbulence and fracture lightning. In <em>Pre-Shutdown mode</em> (Allostatic strain &gt; 75%), the system transitions from organic flow to stark, high-contrast survival geometry depicting the brain's baseline vital rhythms before somatic collapse.
        </p>
      </div>
    </div>
  );
};
