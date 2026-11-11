import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  Sliders,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Search,
  Filter,
  Check,
  Zap,
  Award,
  Layers,
  Box,
  Globe,
  Flame,
  ShieldAlert,
  FileText,
  Palette,
  Coffee,
  Mountain,
  HeartPulse,
  Cloud,
  FileCheck2,
  MessageSquare,
} from 'lucide-react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, testConnection } from './lib/firebase';
import { INITIAL_VARIABLES, PRESET_SCENARIOS } from './data/variables';
import { BrainVariable, BrainRegion, VariableCategory, OSINTCountryProfile } from './types/formula';
import { calculateHappiness, calculatePartialDerivative } from './utils/calculator';
import { neuroAudio } from './utils/audio';
import { MathFormula } from './components/MathFormula';
import { BrainTopographicMountainMap } from './components/BrainTopographicMountainMap';
import { Brain3DViewer } from './components/Brain3DViewer';
import { BrainCanvas } from './components/BrainCanvas';
import { VariableSlider } from './components/VariableSlider';
import { ParadoxLaboratory } from './components/ParadoxLaboratory';
import { OSINTWorldHappinessPanel } from './components/OSINTWorldHappinessPanel';
import { ShockCascadesSimulator } from './components/ShockCascadesSimulator';
import { BrainAnalysisReport } from './components/BrainAnalysisReport';
import { WHOClinicalEvidencePanel } from './components/WHOClinicalEvidencePanel';
import { GenerativeMoodArtStudio } from './components/GenerativeMoodArtStudio';
import { AddictionWithdrawalLab } from './components/AddictionWithdrawalLab';
import { CustomVariableModal } from './components/CustomVariableModal';
import { ExportCertificateModal } from './components/ExportCertificateModal';
import { FirebaseSyncModal } from './components/FirebaseSyncModal';
import { BrainChat } from './components/BrainChat';
import { EquationProofChangelogViewer } from './components/EquationProofChangelogViewer';
import { TEN_BRAIN_SECTIONS } from './data/brainSections';

export default function App() {
  const [variables, setVariables] = useState<BrainVariable[]>(INITIAL_VARIABLES);
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<BrainRegion | null>(null);
  const [brainViewMode, setBrainViewMode] = useState<'mountain' | '3d' | '2d'>('mountain');
  const [activeCategory, setActiveCategory] = useState<VariableCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'impact' | 'value'>('default');
  const [isMuted, setIsMuted] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string>('ideal_equilibrium');
  const [activeOSINTProfileId, setActiveOSINTProfileId] = useState<string>('nordic_model');
  const [hoursSinceLastDose, setHoursSinceLastDose] = useState<number>(14);
  const [dailySpendUSD, setDailySpendUSD] = useState<number>(7.45);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Initialize Firebase connection test & auth listener on mount
  React.useEffect(() => {
    testConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Load saved formula from Firestore
  const handleLoadSavedFormula = (variablesSnapshot: string, title: string) => {
    try {
      const parsed: Array<{ id: string; value: number }> = JSON.parse(variablesSnapshot);
      const valueMap = new Map(parsed.map((p) => [p.id, p.value]));
      setVariables((prev) =>
        prev.map((v) => (valueMap.has(v.id) ? { ...v, value: valueMap.get(v.id)! } : v))
      );
      setActivePresetId('custom_loaded');
    } catch (e) {
      console.error('Failed to parse formula snapshot:', e);
    }
  };

  // Live Formula Calculation incorporating withdrawal hours and habit spending
  const breakdown = useMemo(
    () => calculateHappiness(variables, hoursSinceLastDose, dailySpendUSD * 30),
    [variables, hoursSinceLastDose, dailySpendUSD]
  );

  // Marginal Impact (∂H/∂v) mapping for all variables
  const marginalImpacts = useMemo(() => {
    const map: Record<string, number> = {};
    variables.forEach((v) => {
      map[v.id] = calculatePartialDerivative(variables, v.id);
    });
    return map;
  }, [variables]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const nextMuted = neuroAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Variable value change
  const handleVariableChange = (id: string, value: number) => {
    setVariables((prev) =>
      prev.map((v) => (v.id === id ? { ...v, value } : v))
    );
    setSelectedVarId(id);
    neuroAudio.updateDroneByHappiness(breakdown.normalizedHappiness);
  };

  // Reset single variable
  const handleResetVariable = (id: string) => {
    setVariables((prev) =>
      prev.map((v) => (v.id === id ? { ...v, value: v.defaultValue } : v))
    );
  };

  // Reset all variables
  const handleResetAll = () => {
    setVariables(INITIAL_VARIABLES);
    setActivePresetId('ideal_equilibrium');
    neuroAudio.playParadoxChime();
  };

  // Apply a scenario preset
  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setVariables((prev) =>
      prev.map((v) => {
        if (preset.overrides[v.id] !== undefined) {
          return { ...v, value: preset.overrides[v.id] };
        }
        return v;
      })
    );
    neuroAudio.playParadoxChime();
  };

  // Apply partial overrides (from Paradox Lab or Shock Simulator)
  const handleApplyOverrides = (overrides: Record<string, number>) => {
    setVariables((prev) =>
      prev.map((v) => {
        if (overrides[v.id] !== undefined) {
          return { ...v, value: overrides[v.id] };
        }
        return v;
      })
    );
  };

  // Apply OSINT Country Profile
  const handleApplyOSINTProfile = (profile: OSINTCountryProfile) => {
    setActiveOSINTProfileId(profile.id);
    handleApplyOverrides(profile.overrides);
  };

  // Add custom variable
  const handleAddCustomVariable = (newVar: BrainVariable) => {
    setVariables((prev) => [newVar, ...prev]);
    setSelectedVarId(newVar.id);
    neuroAudio.playParadoxChime();
  };

  // Filtered & sorted variables
  const filteredVariables = useMemo(() => {
    return variables
      .filter((v) => {
        const matchesCat = activeCategory === 'all' || v.category === activeCategory;
        const matchesSearch =
          searchQuery.trim() === '' ||
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.symbol.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = !selectedRegion || v.brainRegion === selectedRegion;
        return matchesCat && matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'impact') {
          return Math.abs(marginalImpacts[b.id] || 0) - Math.abs(marginalImpacts[a.id] || 0);
        }
        if (sortBy === 'value') {
          return b.value - a.value;
        }
        return 0;
      });
  }, [variables, activeCategory, searchQuery, selectedRegion, sortBy, marginalImpacts]);

  const activePreset = PRESET_SCENARIOS.find((p) => p.id === activePresetId);
  const activeRegionInfo = TEN_BRAIN_SECTIONS.find((s) => s.id === selectedRegion);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. TOP BAR CONTRACT: Brand, Nav links, Primary Actions */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand title, single element */}
          <a
            href="#"
            className="text-base sm:text-lg font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            The Grand Formula
          </a>

          {/* Zone 2: nav links */}
          <nav className="hidden md:flex items-center gap-3 text-xs font-medium text-slate-400">
            <a href="#brain-map" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-cyan-400 font-semibold">
              <Mountain className="w-3.5 h-3.5" />
              <span>Mountain Brain</span>
            </a>
            <a href="#who-clinical" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-emerald-400">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>WHO & Neurons</span>
            </a>
            <a href="#analysis" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-cyan-300">
              <FileText className="w-3.5 h-3.5" />
              <span>Report</span>
            </a>
            <a href="#mood-art" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-pink-300">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span>Mood Art</span>
            </a>
            <a href="#addiction" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-amber-300">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>Withdrawal & Coffee</span>
            </a>
            <a href="#formula" className="hover:text-slate-200 transition-colors">
              Formula
            </a>
            <a href="#equation-proofs" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-emerald-300">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proofs & Citations</span>
            </a>
            <a href="#brainchat" className="hover:text-slate-200 transition-colors flex items-center gap-1 text-cyan-300 font-semibold relative">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>BrainChat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute -top-0.5 -right-2" />
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#brainchat"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open BrainChat Neural Oracle"
            >
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">BrainChat</span>
            </a>

            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className={`p-2 sm:px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentUser
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/80'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign in with Google / Cloud Sync'}
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {currentUser ? (currentUser.displayName?.split(' ')[0] || 'Cloud Synced') : 'Cloud Sync'}
              </span>
            </button>

            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                !isMuted
                  ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isMuted ? 'Enable neuro-acoustic synthesis' : 'Mute synthesis'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio Live'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Export Treatise</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* HERO SECTION: Cranial Happiness Quotient & Telemetry */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                <span>NEURO-MATHEMATICAL COGNITIVE SYNTHESIS</span>
                <span aria-hidden="true">·</span>
                <span>10-LOBE TOMOGRAPHY & CLINICAL AUDIT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 max-w-2xl text-balance">
                The Exact Happiness Formula of the Human Brain
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Synthesizing real-world OSINT per-capita metrics, a 10-lobe 3D anatomical brain model, non-linear allostatic cascades, and an exhaustive clinical diagnostic report.
              </p>
            </div>

            {/* Cranial Index & Allostatic Load Scoreboards */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Happiness Scoreboard */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 sm:p-5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Calculated Brain Happiness
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-cyan-300 tabular-nums">
                    {breakdown.normalizedHappiness}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ 100 H</span>
                </div>
                <div
                  className="text-xs font-medium mt-1 truncate max-w-[200px]"
                  style={{ color: breakdown.stateArchetype.color }}
                >
                  {breakdown.stateArchetype.title}
                </div>
              </div>

              {/* Allostatic Load Index (Stress Strain) */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 sm:p-5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Allostatic Load</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl sm:text-5xl font-mono font-bold tabular-nums ${
                    breakdown.allostaticLoad > 75
                      ? 'text-rose-400 animate-pulse'
                      : breakdown.allostaticLoad > 45
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {breakdown.allostaticLoad}
                  </span>
                  <span className="text-xs font-mono text-slate-400">% STRAIN</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {breakdown.allostaticLoad > 75
                    ? 'Supercritical (Tipping Point)'
                    : breakdown.allostaticLoad > 45
                    ? 'Elevated Adaptation'
                    : 'Physiological Buffer Healthy'}
                </div>
              </div>
            </div>
          </div>

          {/* Decomposition Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Wetware Substrate</div>
              <div className="text-lg font-mono font-bold text-cyan-400 mt-1 tabular-nums">
                {breakdown.neuroSubstrate}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Dopamine · Serotonin · GABA</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Psychological Vector</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1 tabular-nums">
                ×{breakdown.psychologicalMultiplier}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Flow · Agency · Ikigai</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Illogical Surge</div>
              <div className="text-lg font-mono font-bold text-violet-400 mt-1 tabular-nums">
                +{breakdown.illogicalSurge}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Warm Socks · Canceled Plans</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px]">Faulty Firmware Drag</div>
              <div className="text-lg font-mono font-bold text-rose-400 mt-1 tabular-nums">
                -{breakdown.faultyDrag}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">94 Tabs · Hangry · Overthinking</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 col-span-2 sm:col-span-1">
              <div className="text-slate-400 text-[11px]">Cosmic Whimsy</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1 tabular-nums">
                +{breakdown.whimsicalBonus}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Rain on Roof · Dog Tail</div>
            </div>
          </div>

          {/* Curated Presets Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Calibrated Presets:</span>
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer ${
                  activePresetId === preset.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-semibold'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                {preset.title}
              </button>
            ))}
            <button
              onClick={handleResetAll}
              className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1.5 px-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset all variables to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        </section>

        {/* SECTION 1: TOPOGRAPHIC MOUNTAIN & 3D REAL BRAIN MAP */}
        <section id="brain-map" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-semibold text-slate-100">
                Topographic Cortical Mountain Map & Color-Mixing Interaction Network
              </h2>
            </div>

            {/* View Mode Switcher: Topographic Mountain vs 3D Spatial Hologram vs 2D Sagittal */}
            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs shrink-0">
              <button
                onClick={() => setBrainViewMode('mountain')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  brainViewMode === 'mountain'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Mountain Relief (Color Mixing)</span>
              </button>
              <button
                onClick={() => setBrainViewMode('3d')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  brainViewMode === '3d'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Hologram</span>
              </button>
              <button
                onClick={() => setBrainViewMode('2d')}
                className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  brainViewMode === '2d'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D Sagittal</span>
              </button>
            </div>
          </div>

          {brainViewMode === 'mountain' ? (
            <BrainTopographicMountainMap
              regionActivation={breakdown.regionActivation}
              onSelectRegion={setSelectedRegion}
              selectedRegion={selectedRegion}
            />
          ) : brainViewMode === '3d' ? (
            <Brain3DViewer
              regionActivation={breakdown.regionActivation}
              onSelectRegion={setSelectedRegion}
              selectedRegion={selectedRegion}
            />
          ) : (
            <BrainCanvas
              regionActivation={breakdown.regionActivation}
              onSelectRegion={setSelectedRegion}
              selectedRegion={selectedRegion}
            />
          )}
        </section>

        {/* SECTION 2: 10-LOBE COMPREHENSIVE BRAIN ANALYSIS & CLINICAL REPORT */}
        <section id="analysis">
          <BrainAnalysisReport
            breakdown={breakdown}
            variables={variables}
            activeOSINTProfileId={activeOSINTProfileId}
            onSelectRegion={setSelectedRegion}
          />
        </section>

        {/* SECTION 3: WHO MENTAL HEALTH REPORTS, NEURON CLUSTERS & LITERATURE EVIDENCE */}
        <section id="who-clinical">
          <WHOClinicalEvidencePanel
            breakdown={breakdown}
            variables={variables}
            onApplyClinicalOverride={handleApplyOverrides}
          />
        </section>

        {/* SECTION 3: GENERATIVE MOOD ART STUDIO (ART FROM MOOD & PRE-SHUTDOWN RATIOS) */}
        <section id="mood-art">
          <GenerativeMoodArtStudio
            breakdown={breakdown}
            variables={variables}
            hoursSinceLastDose={hoursSinceLastDose}
            dailySpendUSD={dailySpendUSD}
          />
        </section>

        {/* SECTION 4: ADDICTION, WITHDRAWAL & FINANCIAL-MORALE PARADOX (STARBUCKS & MEDICINE) */}
        <section id="addiction">
          <AddictionWithdrawalLab
            onApplyOverrides={handleApplyOverrides}
            hoursSinceLastDose={hoursSinceLastDose}
            onHoursChange={setHoursSinceLastDose}
            dailySpendUSD={dailySpendUSD}
            onSpendChange={setDailySpendUSD}
          />
        </section>

        {/* SECTION 5: OSINT HAPPINESS PER CAPITA & GEOPOLITICAL REALITY MATRIX */}
        <section id="osint">
          <OSINTWorldHappinessPanel
            activeProfileId={activeOSINTProfileId}
            onApplyProfile={handleApplyOSINTProfile}
            onSelectRegion={setSelectedRegion}
          />
        </section>

        {/* SECTION 4: ALLOSTATIC OVERLOAD & SHOCK CASCADES SIMULATOR */}
        <section id="shocks">
          <ShockCascadesSimulator
            onApplyShock={handleApplyOverrides}
          />
        </section>

        {/* SECTION: THE FORMULA RENDERER */}
        <section id="formula">
          <MathFormula
            variables={variables}
            onSelectVariable={setSelectedVarId}
            selectedVariableId={selectedVarId}
          />
        </section>

        {/* SECTION: EQUATION PROOFS, PEER-REVIEWED CITATIONS & CHANGELOG */}
        <section id="equation-proofs">
          <EquationProofChangelogViewer
            breakdown={breakdown}
            variables={variables}
            onSelectVariable={setSelectedVarId}
          />
        </section>

        {/* SECTION: BRAINCHAT AI NEURAL ORACLE STUDIO */}
        <section id="brainchat">
          <BrainChat
            breakdown={breakdown}
            variables={variables}
            isFloating={false}
          />
        </section>

        {/* SECTION: PARADOX LABORATORY */}
        <section id="paradoxes">
          <ParadoxLaboratory
            variables={variables}
            breakdown={breakdown}
            onApplyScenario={handleApplyOverrides}
          />
        </section>

        {/* SECTION 7: VARIABLES MATRIX */}
        <section id="variables" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>The Variable Matrix</span>
                <span className="text-xs font-mono text-slate-400">({filteredVariables.length} Shown)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust any variable to see live partial derivatives ∂H/∂v and observe how all 10 brain sections and hormonal cascades respond
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search variables (e.g. sock, pizza, tabs)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 w-52 sm:w-64"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'impact' | 'value')}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="default">Sort: Default</option>
                <option value="impact">Sort: Max Impact (∂H/∂v)</option>
                <option value="value">Sort: Value High to Low</option>
              </select>

              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bespoke Variable</span>
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(
              [
                { id: 'all', label: 'All Variables' },
                { id: 'illogical', label: 'Illogical Paradoxes' },
                { id: 'faulty', label: 'Faulty Firmware Bugs' },
                { id: 'neurochemical', label: 'Wetware Substrates' },
                { id: 'psychological', label: 'Psychological Vectors' },
                { id: 'whimsical', label: 'Cosmic Whims' },
                { id: 'custom', label: 'Custom Variables' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
                  activeCategory === cat.id
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 font-semibold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Region Filter Banner (if selected on canvas) */}
          {selectedRegion && activeRegionInfo && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: activeRegionInfo.hexCode }}
                />
                <span>
                  Filtered by Section #{activeRegionInfo.number}: <strong className="font-semibold text-white">{activeRegionInfo.name}</strong>
                  <span className="text-slate-400 ml-1.5">({activeRegionInfo.color})</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="underline hover:text-white cursor-pointer ml-2 text-cyan-400"
              >
                Show All Sections
              </button>
            </div>
          )}

          {/* Variable Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredVariables.map((variable) => (
              <VariableSlider
                key={variable.id}
                variable={variable}
                onChange={handleVariableChange}
                onReset={handleResetVariable}
                marginalImpact={marginalImpacts[variable.id] || 0}
                isSelected={selectedVarId === variable.id}
                onFocus={() => setSelectedVarId(variable.id)}
              />
            ))}
          </div>

          {filteredVariables.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              No variables match your query. Try clearing search filters or add a new custom variable.
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 mt-12 py-6 px-4 lg:px-8 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span>The Grand Unified Formula of Brain Happiness</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>OSINT Grounding, 10-Section 3D Connectome & Full Clinical Analysis Report</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Equilibrium Index: {breakdown.normalizedHappiness} / 100 · Allostatic Strain: {breakdown.allostaticLoad}%
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <CustomVariableModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddVariable={handleAddCustomVariable}
      />

      <ExportCertificateModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        breakdown={breakdown}
        variables={variables}
        personalityPresetName={activePreset ? activePreset.title : 'Custom Calibration'}
      />

      <FirebaseSyncModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        currentUser={currentUser}
        breakdown={breakdown}
        variables={variables}
        onLoadSavedFormula={handleLoadSavedFormula}
      />

      {/* FLOATING BRAINCHAT AI ORACLE */}
      <BrainChat
        breakdown={breakdown}
        variables={variables}
        isFloating={true}
        isOpenFloating={isFloatingChatOpen}
        onToggleFloating={() => setIsFloatingChatOpen((prev) => !prev)}
      />
    </div>
  );
}
