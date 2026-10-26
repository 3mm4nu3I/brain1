import React, { useState } from 'react';
import {
  Zap,
  AlertOctagon,
  ArrowRight,
  Flame,
  ShieldAlert,
  HeartHandshake,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SHOCK_EXPERIMENTS } from '../data/shockScenarios';
import { ShockExperiment } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface ShockCascadesSimulatorProps {
  onApplyShock: (overrides: Record<string, number>) => void;
}

export const ShockCascadesSimulator: React.FC<ShockCascadesSimulatorProps> = ({
  onApplyShock,
}) => {
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>(
    'three_bad_things_threshold'
  );
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeExperiment: ShockExperiment =
    SHOCK_EXPERIMENTS.find((e) => e.id === selectedExperimentId) || SHOCK_EXPERIMENTS[0];

  const handleSelectExperiment = (exp: ShockExperiment) => {
    setSelectedExperimentId(exp.id);
    setActiveStepIndex(0);
    onApplyShock(exp.combinedOverrides);
    neuroAudio.playParadoxChime();
  };

  const handleTriggerIndividualStep = (eventIndex: number) => {
    setActiveStepIndex(eventIndex);
    const ev = activeExperiment.events[eventIndex];
    if (ev) {
      onApplyShock(ev.overrides);
      neuroAudio.playNudgePing(300 + eventIndex * 150);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Allostatic Overload & Life Shock Collision Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical investigation into non-linear shock amplification: Do opposing shocks cancel out? Why do 3 bad events collapse the prefrontal brake?
          </p>
        </div>

        <div className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-800/60 px-3 py-1.5 rounded-lg shrink-0">
          Non-Linear Cascade Model
        </div>
      </div>

      {/* Experiment Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {SHOCK_EXPERIMENTS.map((exp) => {
          const isSelected = exp.id === activeExperiment.id;
          return (
            <button
              key={exp.id}
              onClick={() => handleSelectExperiment(exp)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-rose-500 shadow-md ring-1 ring-rose-500/20'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-100 mb-1 leading-snug">
                  {exp.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {exp.question}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span>{exp.events.length} Shock Stages</span>
                <span className="underline">Simulate →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Experiment Deep-Dive Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">{activeExperiment.title}</h3>
            <p className="text-xs text-cyan-300 font-medium">{activeExperiment.question}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-amber-300 shrink-0">
            {activeExperiment.mathModel}
          </div>
        </div>

        {/* Verdict & Neuro-Biological Mechanism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Scientific Verdict:</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {activeExperiment.verdict}
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Neuro-Biological Mechanism:</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {activeExperiment.mechanism}
            </p>
          </div>
        </div>

        {/* Sequential Step Events Chain */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span>Shock Sequence Breakdown (Click any event to trigger isolated shock):</span>
            <span className="text-[11px] font-mono text-slate-400">Stages 1 to {activeExperiment.events.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeExperiment.events.map((ev, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={ev.id}
                  onClick={() => handleTriggerIndividualStep(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-800 border-cyan-400 shadow-md ring-1 ring-cyan-400/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-200 truncate">{ev.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                        ev.type === 'acute_negative'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : ev.type === 'acute_positive'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        Severity {ev.intensity}/10
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                      {ev.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800 text-[10px] font-mono">
                    <div className="text-rose-400">
                      Hormones: <span className="text-slate-300">{ev.hormonalImpact}</span>
                    </div>
                    <div className="text-cyan-400">
                      Cortex: <span className="text-slate-300">{ev.brainImpact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Execution Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            Applying the combined shock forces the non-linear allostatic cascade into the formula and 3D brain model.
          </span>
          <button
            onClick={() => {
              onApplyShock(activeExperiment.combinedOverrides);
              neuroAudio.playParadoxChime();
            }}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Apply Full Cumulative Shock Cascade</span>
          </button>
        </div>
      </div>
    </div>
  );
};
