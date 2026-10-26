import React from 'react';
import { Sparkles, AlertOctagon, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { BrainVariable, HappinessBreakdown } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface ParadoxLaboratoryProps {
  variables: BrainVariable[];
  breakdown: HappinessBreakdown;
  onApplyScenario: (overrides: Record<string, number>) => void;
}

interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  equation: string;
  actionLabel: string;
  overrides: Record<string, number>;
}

export const ParadoxLaboratory: React.FC<ParadoxLaboratoryProps> = ({
  breakdown,
  onApplyScenario,
}) => {
  const experiments: Experiment[] = [
    {
      id: 'sock_vs_dread',
      title: 'The Warm Sock vs. Existential Dread Experiment',
      hypothesis: 'A fresh pair of dryer socks cancels up to 40% of deep philosophical despair.',
      equation: '\\lim_{C_{\\text{cort}} \\to 100} \\mathcal{H} + \\zeta_{\\text{sock}}^{1.2} > \\text{Equilibrium}',
      actionLabel: 'Inject Fluffy Dryer Socks (100) with High Cortisol',
      overrides: {
        warm_socks_dryer: 100,
        cortisol_burden: 85,
        recursive_overthinking: 80,
      },
    },
    {
      id: 'hangry_phase_shift',
      title: 'The Hypoglycemic Phase Transition',
      hypothesis: 'Misanthropy is rarely ethical nihilism; it is almost always lack of bread.',
      equation: '\\kappa_{\\text{hangry}} = 95 \\implies \\text{Universal Hatred} \\xrightarrow{+\\varpi_{\\text{pizza}}} \\text{Peace}',
      actionLabel: 'Simulate Hangry Crash then Feed Midnight Pizza',
      overrides: {
        hangry_vortex: 95,
        cold_pizza_3am: 95,
        gaba_calm: 40,
      },
    },
    {
      id: 'canceled_plans_extravaganza',
      title: 'The Introvert Superposition Paradox',
      hypothesis: 'Homo sapiens evolved as a hyper-social pack animal, yet feels peak euphoria when humans leave them alone.',
      equation: '\\frac{\\partial \\mathcal{H}}{\\partial (\\text{People})} < 0 \\quad \\text{when} \\quad \\lambda_{\\text{canc}} = 100',
      actionLabel: 'Trigger 100% Canceled Plans + Solitude',
      overrides: {
        canceled_plans_relief: 100,
        cat_on_lap_paralysis: 95,
        rain_on_roof: 90,
        social_comparison_feed: 0,
      },
    },
    {
      id: 'ram_tab_collapse',
      title: 'The 94-Tab Cognitive Memory Leak',
      hypothesis: 'Prefrontal cortex cache thrashes when holding 90+ tabs under the false belief "I will read them tonight".',
      equation: '\\tau_{\\text{tabs}}^{1.15} \\times \\beta_{\\text{think}}^{1.3} \\gg \\text{Prefrontal RAM}',
      actionLabel: 'Trigger 98 Open Tabs + Midnight Overthinking',
      overrides: {
        tabs_open_burden: 98,
        recursive_overthinking: 94,
        gaba_calm: 12,
        adenosine_sleep_debt: 88,
      },
    },
  ];

  const handleRunExperiment = (overrides: Record<string, number>) => {
    onApplyScenario(overrides);
    neuroAudio.playParadoxChime();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Paradox Laboratory & Illogical Stress Tests</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Probe the mathematical boundary conditions where human logic collapses into absurdity
          </p>
        </div>

        {breakdown.activeParadoxes.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
            <Zap className="w-3.5 h-3.5" />
            <span>{breakdown.activeParadoxes.length} Active Quantum Paradoxes</span>
          </div>
        )}
      </div>

      {/* Currently Detected Paradoxes */}
      {breakdown.activeParadoxes.length > 0 ? (
        <div className="my-4 space-y-2">
          {breakdown.activeParadoxes.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-violet-800/60 bg-violet-950/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="font-semibold text-violet-200">{p.title}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-900/60 text-violet-300">
                    {p.intensity}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1">{p.description}</p>
              </div>
              <div className="text-violet-300 font-mono text-[11px] shrink-0 border-t sm:border-t-0 sm:border-l border-violet-800/50 pt-1.5 sm:pt-0 sm:pl-3">
                {p.effect}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-4 p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
          <span>No critical edge-case singularities active right now. Circuits within normal bounds.</span>
          <span className="font-mono text-[10px] text-slate-400">STATUS: NOMINAL</span>
        </div>
      )}

      {/* Interactive Paradox Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                <span>{exp.title}</span>
              </div>
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                {exp.hypothesis}
              </p>
              <div className="bg-slate-900/90 rounded px-2 py-1 font-mono text-[11px] text-cyan-400 mb-3 border border-slate-800">
                {exp.equation}
              </div>
            </div>

            <button
              onClick={() => handleRunExperiment(exp.overrides)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
            >
              <span>{exp.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
