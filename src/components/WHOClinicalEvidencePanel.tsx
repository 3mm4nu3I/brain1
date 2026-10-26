import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  Activity,
  HeartPulse,
  Brain,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Flame,
} from 'lucide-react';
import {
  WHO_REPORT_METRICS,
  WHO_FIVE_DIMENSIONS,
  CLINICAL_BOOK_REFERENCES,
  NEURON_CLUSTER_PARAMETERS,
} from '../data/clinicalReportsData';
import { HappinessBreakdown, BrainVariable } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface WHOClinicalEvidencePanelProps {
  breakdown: HappinessBreakdown;
  variables: BrainVariable[];
  onApplyClinicalOverride?: (overrides: Record<string, number>) => void;
}

export const WHOClinicalEvidencePanel: React.FC<WHOClinicalEvidencePanelProps> = ({
  breakdown,
  variables,
  onApplyClinicalOverride,
}) => {
  const [activeTab, setActiveTab] = useState<'who_metrics' | 'neuron_clusters' | 'literature_books'>('who_metrics');
  const [expandedBookId, setExpandedBookId] = useState<string | null>('sapolsky_zebras');

  // Interactive Clinical Intervention Presets
  const handleApplyIntervention = (type: 'bdnf_boost' | 'anti_inflammatory' | 'who_resilience') => {
    if (!onApplyClinicalOverride) return;

    if (type === 'bdnf_boost') {
      onApplyClinicalOverride({
        bdnf_healing: 94,
        adenosine_sleep_debt: 12,
        cortisol_burden: 20,
        flow_state: 85,
        excitotoxic_calcium_degradation: 15,
      });
    } else if (type === 'anti_inflammatory') {
      onApplyClinicalOverride({
        neuroinflammation_index: 10,
        gaba_calm: 85,
        hangry_vortex: 10,
        cortisol_burden: 18,
        warm_socks_dryer: 90,
      });
    } else {
      onApplyClinicalOverride({
        who_environmental_qol: 95,
        autonomy_agency: 88,
        ikigai_purpose: 90,
        social_comparison_feed: 8,
        gratitude_depth: 85,
      });
    }
    neuroAudio.playParadoxChime();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              WHO Mental Health Reports, Neuron Clusters & Literature Evidence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Eliminating guesswork with empirical psychiatric standards: WHO-5 Well-Being Index, Global Burden of Disease (GBD), neuron cluster degradation vs. BDNF neurogenesis, and authoritative neuroscience literature.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('who_metrics')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'who_metrics'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WHO-5 & GBD
            </button>
            <button
              onClick={() => setActiveTab('neuron_clusters')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'neuron_clusters'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Neuron Clusters & BDNF
            </button>
            <button
              onClick={() => setActiveTab('literature_books')}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'literature_books'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Literature Books (6)
            </button>
          </div>
        </div>
      </div>

      {/* Live Clinical Status KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. WHO-5 Index Score */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono">
            WHO-5 Well-Being
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold font-mono ${
              breakdown.whoWellBeingIndex > 50
                ? 'text-emerald-400'
                : breakdown.whoWellBeingIndex > 28
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}>
              {breakdown.whoWellBeingIndex}
            </span>
            <span className="text-[11px] text-slate-500">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {breakdown.whoWellBeingIndex > 50
              ? 'Adequate Well-Being'
              : breakdown.whoWellBeingIndex > 28
              ? 'Low Mood (Screening Indicated)'
              : 'Severe Depressive Burden'}
          </div>
        </div>

        {/* 2. Synaptic Cluster Integrity */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono">
            Synaptic Integrity
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {breakdown.synapticIntegrity}%
            </span>
            <span className="text-[11px] text-slate-500">
              ({breakdown.neuronClustersActive}B cells)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Dendritic Spine Density: ~{(1.85 * (breakdown.synapticIntegrity / 100)).toFixed(2)} / μm
          </div>
        </div>

        {/* 3. BDNF Level (ng/mL) */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono">
            BDNF Neurogenesis
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-lime-400">
              {breakdown.bdnfLevel}
            </span>
            <span className="text-[11px] text-slate-500">ng/mL</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Healing Rate: +{breakdown.neuroplasticHealingRate}% / yr
          </div>
        </div>

        {/* 4. Neuroinflammation & Degradation Rate */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono">
            Neuroinflammation
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold font-mono ${
              breakdown.microglialInflammation > 50 ? 'text-rose-400' : 'text-slate-200'
            }`}>
              {breakdown.microglialInflammation}%
            </span>
            <span className="text-[11px] text-slate-500">Cytokines</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Excitotoxic Loss: -{breakdown.neuronDegradationRate}% / yr
          </div>
        </div>
      </div>

      {/* TAB 1: WHO REPORT & GBD METRICS */}
      {activeTab === 'who_metrics' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  OFFICIAL INSTITUTIONAL DOSSIER
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                  {WHO_REPORT_METRICS.reportTitle}
                </h3>
                <div className="text-xs text-slate-400">
                  {WHO_REPORT_METRICS.publishingBody} ({WHO_REPORT_METRICS.year})
                </div>
              </div>

              <a
                href={WHO_REPORT_METRICS.institutionalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-colors border border-slate-800 shrink-0"
              >
                <span>WHO Document</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* WHO Headline Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px]">Global Population Prevalence:</span>
                <div className="text-sm font-bold text-slate-100 mt-1 font-mono">
                  {WHO_REPORT_METRICS.globalPrevalenceRatio}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Depression and anxiety are the single largest contributors to global YLDs (Years Lived with Disability).
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px]">Annual Economic Cost:</span>
                <div className="text-sm font-bold text-rose-400 mt-1 font-mono">
                  {WHO_REPORT_METRICS.economicCostAnnualUSD}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Primarily through workplace absenteeism, presenteeism, and lost economic agency.
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-[10px]">DALYs Lost Globally:</span>
                <div className="text-sm font-bold text-amber-400 mt-1 font-mono">
                  {WHO_REPORT_METRICS.dalysLostAnnualMillions} Million DALYs / yr
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Disability-Adjusted Life Years measure premature mortality combined with years lived in suboptimal cognitive health.
                </p>
              </div>
            </div>

            {/* WHO-5 Well-Being Dimensions Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-200 block">
                The 5 Validated WHO-5 Neuro-Psychological Dimensions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WHO_FIVE_DIMENSIONS.map((dim) => (
                  <div key={dim.id} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/70 text-xs space-y-1">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>"{dim.question}"</span>
                      <span className="text-emerald-400 font-mono text-[11px]">{dim.weight * 100}% wt</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {dim.neuroSignificance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEURON CLUSTERS & BDNF DEGRADATION VS HEALING */}
      {activeTab === 'neuron_clusters' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span>Neuron Cluster Degeneration vs. Neuroplastic Healing Dynamics</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cellular neurobiology: 16.34 Billion cortical pyramidal neurons across 180 Brodmann areas
                </p>
              </div>
            </div>

            {/* Biological Mechanisms Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Degradation Forces */}
              <div className="p-4 bg-rose-950/20 border border-rose-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-rose-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Forces of Synaptic Degradation:</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-rose-300">Excitotoxic Calcium Influx:</strong> Excess glutamate triggers NMDA over-activation, causing free radical generation and apical dendritic retraction.
                  </li>
                  <li>
                    <strong className="text-rose-300">Microglial M1 Neuroinflammation:</strong> Elevated TNF-α and IL-1β induce pathological synaptic pruning, severing learned positive reward pathways.
                  </li>
                  <li>
                    <strong className="text-rose-300">Glucocorticoid CA3 Atrophy:</strong> Chronic elevated cortisol downsizes hippocampal volume by up to 12% in protracted stress models.
                  </li>
                </ul>
              </div>

              {/* Healing Forces */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Forces of Neuroplastic Healing:</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-emerald-300">BDNF-TrkB Signaling:</strong> Brain-Derived Neurotrophic Factor accelerates adult subgranular dentate gyrus neurogenesis (~700 cells/day).
                  </li>
                  <li>
                    <strong className="text-emerald-300">Slow-Wave Sleep Glymphatic Flush:</strong> Matthew Walker model: interstitial space expands 60%, rinsing neurotoxic metabolic waste.
                  </li>
                  <li>
                    <strong className="text-emerald-300">Hebbian Synaptic Potentiation:</strong> Social bonding (Oxytocin) and goal completion (Dopamine) reinforce dendritic spine thickness.
                  </li>
                </ul>
              </div>
            </div>

            {/* Instant Clinical Intervention Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Simulate Evidence-Based Clinical Interventions:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleApplyIntervention('bdnf_boost')}
                  className="px-3.5 py-2 bg-lime-950/60 hover:bg-lime-900/60 text-lime-300 border border-lime-700/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>6-Week Aerobic & Restorative Sleep Intervention (+35% BDNF)</span>
                </button>

                <button
                  onClick={() => handleApplyIntervention('anti_inflammatory')}
                  className="px-3.5 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Anti-Inflammatory & Glymphatic Reset (-60% Cytokines)</span>
                </button>

                <button
                  onClick={() => handleApplyIntervention('who_resilience')}
                  className="px-3.5 py-2 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>WHO Social Safety & Purpose Buffer (QoL = 95)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHORITATIVE LITERATURE BOOKS LIBRARY */}
      {activeTab === 'literature_books' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Click on any authoritative neuroscience monograph to examine its empirical thesis and mathematical representation within our formula:
          </div>

          <div className="space-y-2.5">
            {CLINICAL_BOOK_REFERENCES.map((book) => {
              const isExpanded = expandedBookId === book.id;
              return (
                <div
                  key={book.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
                          {book.title}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 ml-6">
                        <strong>{book.author}</strong> ({book.year}) · <em>{book.institution}</em>
                      </div>
                    </div>

                    <div className="text-slate-400 shrink-0 ml-3">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-3 text-xs bg-slate-950/80">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                          CORE BIOLOGICAL THESIS:
                        </span>
                        <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                          {book.coreBiologicalThesis}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-mono text-cyan-400 block font-semibold">
                            ANATOMICAL MECHANISM MAPPED:
                          </span>
                          <span className="text-slate-300 text-[11px] mt-1 block">
                            {book.mechanismMapped}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-mono text-amber-400 block font-semibold">
                            EQUATION TERM FORMALIZED:
                          </span>
                          <code className="text-amber-200 text-[11px] mt-1 block font-mono overflow-x-auto">
                            {book.clinicalEquationImplemented}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
