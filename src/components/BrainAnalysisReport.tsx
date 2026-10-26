import React, { useState } from 'react';
import {
  FileText,
  Activity,
  ShieldAlert,
  Sparkles,
  Download,
  Copy,
  Check,
  Award,
  AlertTriangle,
  Brain,
  Layers,
  Scale,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrainVariable, HappinessBreakdown, BrainRegion } from '../types/formula';
import { TEN_BRAIN_SECTIONS } from '../data/brainSections';
import { OSINT_COUNTRY_PROFILES } from '../data/osintHappinessData';

interface BrainAnalysisReportProps {
  breakdown: HappinessBreakdown;
  variables: BrainVariable[];
  activeOSINTProfileId?: string;
  onSelectRegion?: (region: BrainRegion) => void;
}

export const BrainAnalysisReport: React.FC<BrainAnalysisReportProps> = ({
  breakdown,
  variables,
  activeOSINTProfileId = 'nordic_model',
  onSelectRegion,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'lobes' | 'hormones' | 'prescriptions' | 'raw'>(
    'summary'
  );
  const [copied, setCopied] = useState(false);

  const activeOSINT =
    OSINT_COUNTRY_PROFILES.find((p) => p.id === activeOSINTProfileId) || OSINT_COUNTRY_PROFILES[0];

  const triggerCelebrate = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#10B981', '#A855F7', '#F59E0B'],
    });
  };

  // Generate ASCII / Plaintext Medical-Philosophical Report
  const fullReportText = `========================================================================================
CLINICAL & PHILOSOPHICAL CRANIAL REPORT: 10-LOBE EQUILIBRIUM AUDIT
Subject: Human Brain (H_brain Simulator v3.0)
Timestamp: ${new Date().toISOString()}
Geopolitical Baseline: ${activeOSINT.country} (${activeOSINT.region})
========================================================================================

1. EXECUTIVE DIAGNOSTIC SUMMARY
   ----------------------------
   Overall Brain Happiness Index: ${breakdown.normalizedHappiness} / 100
   Allostatic Stress Load:        ${breakdown.allostaticLoad}% [${
    breakdown.allostaticLoad > 75
      ? 'SUPERCRITICAL OVERLOAD - TIPPING POINT ACTIVE'
      : breakdown.allostaticLoad > 45
      ? 'ELEVATED ALLOSTASIS'
      : 'NOMINAL HOMEOSTASIS'
  }]
   Clinical State Archetype:      ${breakdown.stateArchetype.title}
   Neurological Prognosis:        ${breakdown.stateArchetype.subtitle}

2. THE 10-LOBE FUNCTIONAL CONNECTOME TOMOGRAPHY
   --------------------------------------------
${TEN_BRAIN_SECTIONS.map((sec) => {
  const act = breakdown.regionActivation[sec.id] || 50;
  const status = act > 80 ? 'HYPERACTIVE' : act < 30 ? 'DORMANT' : 'NOMINAL';
  return `   [#${sec.number}] ${sec.name.padEnd(28)} | ${act}% [${status.padEnd(11)}] | Color: ${sec.color}
       Role: ${sec.role}
       Interactions: ${sec.interactionSummary}`;
}).join('\n\n')}

3. NEUROCHEMICAL & HORMONAL CASCADE BALANCE
   ----------------------------------------
   • Neurochemical Substrate (Wetware Base):  ${breakdown.neuroSubstrate} pts
   • Psychological Vector Multiplier:         ×${breakdown.psychologicalMultiplier}
   • Illogical Surge (Irrational Bliss):     +${breakdown.illogicalSurge} pts
   • Faulty Firmware Drag (Bugs & Hoards):    -${breakdown.faultyDrag} pts
   • Cosmic Whimsy Realities:                 +${breakdown.whimsicalBonus} pts

   Hormonal Concentrations:
   - Cortisol Threat Strain: ${breakdown.allostaticLoad}%
   - Dopamine Anticipation:  ${variables.find((v) => v.id === 'dopamine_delta')?.value || 50}%
   - Serotonin Status/Gut:   ${variables.find((v) => v.id === 'serotonin_flux')?.value || 50}%
   - Oxytocin Social Shield: ${variables.find((v) => v.id === 'oxytocin_cuddle')?.value || 50}%
   - GABA Inhibitory Calm:   ${variables.find((v) => v.id === 'gaba_calm')?.value || 50}%

4. ACTIVE COGNITIVE & ILLOGICAL PARADOXES
   --------------------------------------
${
  breakdown.activeParadoxes.length > 0
    ? breakdown.activeParadoxes
        .map((p) => `   * [${p.intensity.toUpperCase()}] ${p.title}
     ${p.description} -> Effect: ${p.effect}`)
        .join('\n')
    : '   * No acute phase transitions detected. Circuits operating within standard human irrationality.'
}

5. PRIMARY COPING GENERATORS & FIRMWARE GLITCHES
   ----------------------------------------------
   • Supreme Joy Driver:
     ${breakdown.dominantJoyFactor.name} (${breakdown.dominantJoyFactor.symbol} = ${breakdown.dominantJoyFactor.value} ${breakdown.dominantJoyFactor.unit})
     Observation: "${breakdown.dominantJoyFactor.anomalyNote}"

   • Primary Firmware Drag:
     ${breakdown.dominantBugFactor.name} (${breakdown.dominantBugFactor.symbol} = ${breakdown.dominantBugFactor.value} ${breakdown.dominantBugFactor.unit})
     Observation: "${breakdown.dominantBugFactor.anomalyNote}"

6. ACTIONABLE CLINICAL PRESCRIPTIONS & ABSURD INTERVENTIONS
   --------------------------------------------------------
   1. If Hangry Vortex > 70: Consume 25g of complex carbohydrates immediately to silence Amygdala emergency.
   2. If Browser Tabs > 60: Close 35 tabs without reading them. The prefrontal cache requires release.
   3. If Allostatic Strain > 75: Avoid making life decisions for 24 hours. Sleep debt refinancing required.
   4. If Existential Dread > 60: Acquire heated wool socks from clothes dryer; apply directly to extremities.
   5. If Solitude Deficit High: Cancel one upcoming social commitment without giving a detailed excuse.

========================================================================================
END OF REPORT · VERIFIED BY THE GRAND UNIFIED HAPPINESS ENGINE
========================================================================================`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    triggerCelebrate();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([fullReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cranial-10-lobe-analysis-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerCelebrate();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              10-Lobe Comprehensive Brain Analysis & Clinical Diagnostic Report
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete cranial tomography combining all 10 lobes, allostatic load strain, OSINT geopolitical drivers, and coping audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-800/80">
        {(
          [
            { id: 'summary', label: 'Executive Summary', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'lobes', label: '10-Lobe Tomography', icon: <Brain className="w-3.5 h-3.5" /> },
            { id: 'hormones', label: 'Allostatic & Hormonal Load', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'prescriptions', label: 'Actionable Prescriptions', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
            { id: 'raw', label: 'Raw Clinical Text', icon: <FileText className="w-3.5 h-3.5" /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {/* Diagnostic Key Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Cranial Happiness Index
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-cyan-300 tabular-nums">
                    {breakdown.normalizedHappiness}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100</span>
                </div>
              </div>
              <div
                className="text-xs font-semibold mt-2 pt-2 border-t border-slate-800/80 truncate"
                style={{ color: breakdown.stateArchetype.color }}
              >
                {breakdown.stateArchetype.title}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Allostatic Stress Strain</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl sm:text-4xl font-mono font-bold tabular-nums ${
                    breakdown.allostaticLoad > 75 ? 'text-rose-400' : breakdown.allostaticLoad > 45 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {breakdown.allostaticLoad}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">WEAR & TEAR</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                {breakdown.allostaticLoad > 75 ? '⚠️ Supercritical: Amygdala brake depleted' : '✓ Normal physiological resilience buffer'}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Geopolitical Macro Anchor
                </div>
                <div className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
                  <span>{activeOSINT.flag}</span>
                  <span className="truncate">{activeOSINT.country.split(' ')[0]}</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                Score: <strong className="text-slate-200">{activeOSINT.happinessPerCapita}/10</strong> · Youth: {activeOSINT.youthHappinessIndex}/100
              </div>
            </div>
          </div>

          {/* Core Insights Callout */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Neurological Synthesis & Diagnostic Summary:</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {breakdown.stateArchetype.subtitle}. Your prefrontal cortex is currently negotiating between{' '}
              <strong className="text-cyan-300">{breakdown.dominantJoyFactor.name}</strong> and the drag imposed by{' '}
              <strong className="text-rose-300">{breakdown.dominantBugFactor.name}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: 10-LOBE TOMOGRAPHY */}
      {activeTab === 'lobes' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Full anatomical audit of all 10 lobes with live metabolic activation percentages and synaptic roles:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {TEN_BRAIN_SECTIONS.map((sec) => {
              const act = breakdown.regionActivation[sec.id] || 50;
              const isHyper = act > 80;
              const isDormant = act < 30;

              return (
                <div
                  key={sec.id}
                  className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: sec.hexCode }} />
                      <span className="font-bold text-slate-100">
                        {sec.number}. {sec.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isHyper ? 'bg-rose-950 text-rose-300' : isDormant ? 'bg-slate-800 text-slate-400' : 'bg-cyan-950 text-cyan-300'
                      }`}>
                        {isHyper ? 'HYPER' : isDormant ? 'DORMANT' : 'OPTIMAL'}
                      </span>
                      <span className="font-mono font-bold text-sm" style={{ color: sec.hexCode }}>
                        {act}%
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {sec.role}
                  </p>

                  <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    Interactions: <span className="text-slate-300">{sec.interactionSummary}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ALLOSTATIC & HORMONAL LOAD */}
      {activeTab === 'hormones' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Allostatic Load: The Non-Linear Shock Index</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When stressors compound, the prefrontal GABAergic inhibitory brakes wear out. Currently, your allostatic strain sits at{' '}
              <strong className="text-rose-400 font-mono">{breakdown.allostaticLoad}%</strong>.
            </p>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.allostaticLoad > 75
                    ? 'bg-rose-500 animate-pulse'
                    : breakdown.allostaticLoad > 45
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${breakdown.allostaticLoad}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Wetware Core</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
                {breakdown.neuroSubstrate} pts
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Positive hormonal baseline</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Cognitive Multiplier</span>
              <div className="text-xl font-mono font-bold text-slate-200 mt-0.5">
                ×{breakdown.psychologicalMultiplier}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Flow state and Ikigai purpose</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Illogical Surge</span>
              <div className="text-xl font-mono font-bold text-violet-400 mt-0.5">
                +{breakdown.illogicalSurge} pts
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Warm socks, cold pizza & cats</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px]">Firmware Drag</span>
              <div className="text-xl font-mono font-bold text-rose-400 mt-0.5">
                -{breakdown.faultyDrag} pts
              </div>
              <p className="text-[10px] text-slate-500 mt-1">94 tabs & Slack overthinking</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIONABLE PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-3 text-xs">
          <div className="text-xs text-slate-400">
            Tailored neurological and illogical interventions based on your current cranial state:
          </div>

          <div className="space-y-2.5">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400 shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">Hypoglycemic Amygdala Fire Extinguisher</h4>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Consume 20–25 grams of carbohydrates immediately. Over 70% of existential despair is simply glucose depletion triggering false alarm cascades in the temporal limbic core.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800 text-violet-400 shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">Prefrontal Cache Flush (The 30-Tab Eviction)</h4>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Close at least 30 open browser tabs without reading them. Accept that your mortal life is too short to read every speculative thinkpiece. Free up parietal spatial bandwidth.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400 shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">Thermal Homeostatic Reboot (Dryer Socks & Pillow Flip)</h4>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Utilize low-cost somatosensory comfort hacks: fresh wool socks straight from the clothes dryer or turning to the cold side of the pillow reset cranial thermoregulation instantly.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-950/60 border border-pink-800 text-pink-400 shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">Oxytocin Shield Activation</h4>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Seek physical contact with a quadruped mammal (dog tail wag, cat on lap) or send a no-pressure gratitude text to an old friend. This actively dampens Amygdala threat sensitivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RAW CLINICAL TEXT */}
      {activeTab === 'raw' && (
        <div className="space-y-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre overflow-x-auto leading-relaxed max-h-[420px] select-text">
            {fullReportText}
          </div>
        </div>
      )}
    </div>
  );
};
