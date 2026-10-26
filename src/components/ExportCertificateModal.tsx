import React, { useState } from 'react';
import { X, Copy, Check, Download, Award, Sparkles, Brain, ShieldAlert, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrainVariable, HappinessBreakdown } from '../types/formula';
import { TEN_BRAIN_SECTIONS } from '../data/brainSections';

interface ExportCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: HappinessBreakdown;
  variables: BrainVariable[];
  personalityPresetName: string;
}

export const ExportCertificateModal: React.FC<ExportCertificateModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  variables,
  personalityPresetName,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeReportMode, setActiveReportMode] = useState<'clinical' | 'ascii'>('clinical');

  if (!isOpen) return null;

  const triggerCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#10B981', '#A855F7', '#F59E0B'],
    });
  };

  const reportText = `========================================================================================
THE GRAND UNIFIED HAPPINESS THEOREM & 10-LOBE CRANIAL REPORT
Calibrated Profile: ${personalityPresetName}
Timestamp: ${new Date().toISOString()}
========================================================================================

1. CRANIAL EQUILIBRIUM QUOTIENT
   ----------------------------
   Overall Brain Happiness (H_brain): ${breakdown.normalizedHappiness} / 100
   Allostatic Stress Strain:          ${breakdown.allostaticLoad}% [${
    breakdown.allostaticLoad > 75 ? 'SUPERCRITICAL TIPPING POINT' : 'NORMAL BUFFER'
  }]
   Clinical State Archetype:          ${breakdown.stateArchetype.title}
   Prognosis / Diagnostic Summary:    ${breakdown.stateArchetype.subtitle}

2. THE 10-LOBE FUNCTIONAL TOMOGRAPHY
   ---------------------------------
${TEN_BRAIN_SECTIONS.map((sec) => {
  const act = breakdown.regionActivation[sec.id] || 50;
  return `   • [${sec.number.toString().padStart(2, '0')}] ${sec.name.padEnd(28)}: ${act.toString().padStart(3, ' ')}% | Color: ${sec.color}
     Role: ${sec.role}`;
}).join('\n')}

3. COMPONENT DECOMPOSITION
   -----------------------
   • Neurochemical Substrate (Wetware): ${breakdown.neuroSubstrate} pts
   • Psychological Vector Multiplier:   ×${breakdown.psychologicalMultiplier}
   • Illogical Surge (Irrational Bliss):+${breakdown.illogicalSurge} pts
   • Whimsical Realities Bonus:         +${breakdown.whimsicalBonus} pts
   • Faulty Firmware Drag (Bugs):       -${breakdown.faultyDrag} pts

4. KEY ARCHETYPAL FACTORS
   ----------------------
   • Supreme Joy Driver:
     ${breakdown.dominantJoyFactor.name} (${breakdown.dominantJoyFactor.symbol} = ${breakdown.dominantJoyFactor.value} ${breakdown.dominantJoyFactor.unit})
     Note: "${breakdown.dominantJoyFactor.anomalyNote}"
   
   • Primary Firmware Bug:
     ${breakdown.dominantBugFactor.name} (${breakdown.dominantBugFactor.symbol} = ${breakdown.dominantBugFactor.value} ${breakdown.dominantBugFactor.unit})
     Note: "${breakdown.dominantBugFactor.anomalyNote}"

5. ACTIVE COGNITIVE PARADOXES
   --------------------------
${
  breakdown.activeParadoxes.length > 0
    ? breakdown.activeParadoxes
        .map((p) => `   [${p.intensity.toUpperCase()}] ${p.title} -> ${p.effect}`)
        .join('\n')
    : '   No critical singularities active. Human circuits operating within expected irrational parameters.'
}

6. CANONICAL MATHEMATICAL EQUATION
   -------------------------------
   H_brain(τ) = Φ_flow · [(N_neuro) / (F_bugs + Allostatic_Strain)] + Σ Ω_illogic + W_cosmic - Ψ_faulty
========================================================================================`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    triggerCelebrate();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cranial-10-lobe-theorem-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerCelebrate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">
              Personalized 10-Lobe Brain Analysis & Theorem Treatise
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 pt-3">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveReportMode('clinical')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeReportMode === 'clinical'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visual 10-Lobe Report
            </button>
            <button
              onClick={() => setActiveReportMode('ascii')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeReportMode === 'ascii'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Plaintext .TXT
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 my-3 pr-1 space-y-4">
          {activeReportMode === 'clinical' ? (
            <>
              {/* Certificate Header Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                  10-Lobe Neurological Equilibrium Scan
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">
                  {breakdown.stateArchetype.title}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  {breakdown.stateArchetype.subtitle}
                </p>

                <div className="flex items-center justify-center gap-4">
                  <div className="inline-flex items-baseline gap-2 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl">
                    <span className="text-3xl font-bold font-mono text-cyan-300">
                      {breakdown.normalizedHappiness}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100 H_INDEX</span>
                  </div>

                  <div className="inline-flex items-baseline gap-2 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl">
                    <span className={`text-3xl font-bold font-mono ${
                      breakdown.allostaticLoad > 75 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {breakdown.allostaticLoad}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ALLOSTATIC STRAIN</span>
                  </div>
                </div>
              </div>

              {/* 10 Lobe Breakdown Grid */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>The 10 Colored Lobes Functional Status:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {TEN_BRAIN_SECTIONS.map((sec) => {
                    const act = breakdown.regionActivation[sec.id] || 50;
                    return (
                      <div key={sec.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.hexCode }} />
                          <span className="text-[10px] text-slate-400 truncate">#{sec.number} {sec.name.split(' ')[0]}</span>
                        </div>
                        <div className="text-sm font-mono font-bold" style={{ color: sec.hexCode }}>
                          {act}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Driver Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-emerald-400 font-semibold mb-1">Supreme Joy Factor</div>
                  <div className="text-sm font-bold text-slate-100">{breakdown.dominantJoyFactor.name}</div>
                  <p className="text-[11px] text-slate-400 mt-1">{breakdown.dominantJoyFactor.anomalyNote}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-rose-400 font-semibold mb-1">Primary Firmware Drag</div>
                  <div className="text-sm font-bold text-slate-100">{breakdown.dominantBugFactor.name}</div>
                  <p className="text-[11px] text-slate-400 mt-1">{breakdown.dominantBugFactor.anomalyNote}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed select-text">
              {reportText}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={triggerCelebrate}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Celebrate Theorem</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
