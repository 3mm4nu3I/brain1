export type VariableCategory =
  | 'neurochemical'
  | 'psychological'
  | 'illogical'
  | 'faulty'
  | 'whimsical'
  | 'geopolitical'
  | 'existential'
  | 'addiction'
  | 'custom';

export type BrainRegion =
  | 'prefrontal_cortex'       // 1. Executive, Ikigai, Flow (Cyan)
  | 'motor_cortex'            // 2. Motor Drive & Action (Violet)
  | 'somatosensory_cortex'    // 3. Tactile Comfort & Socks (Amber)
  | 'parietal_lobe'           // 4. Spatial Sense & 94 Tabs (Teal)
  | 'occipital_lobe'          // 5. Visual Photons & Sunset (Indigo)
  | 'temporal_lobe'           // 6. Sound, Loops & Rain (Coral)
  | 'nucleus_accumbens'       // 7. Dopamine Reward & Pizza (Emerald)
  | 'amygdala'                // 8. Fear, Hangry & Cortisol (Crimson)
  | 'insula_hypothalamus'     // 9. Oxytocin, Cat, Cuddle (Hot Pink)
  | 'cerebellum_brainstem';   // 10. Endorphin & Autonomic Calm (Lime)

export interface NeuralPathway {
  id: string;
  source: BrainRegion;
  target: BrainRegion;
  name: string;
  neurotransmitter: string;
  interactionDescription: string;
  baseColor: string;
}

export interface BrainVariable {
  id: string;
  name: string;
  symbol: string;
  latexSymbol: string;
  category: VariableCategory;
  description: string;
  unit: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  weight: number;
  exponent: number;
  isIllogical: boolean;
  isFaulty: boolean;
  anomalyNote: string;
  brainRegion: BrainRegion;
  custom?: boolean;
}

export interface HappinessBreakdown {
  rawScore: number;
  normalizedHappiness: number; // 0 - 100+
  neuroSubstrate: number;
  psychologicalMultiplier: number;
  illogicalSurge: number;
  faultyDrag: number;
  whimsicalBonus: number;
  allostaticLoad: number; // 0 - 100 (Cumulative stress strain)
  withdrawalPenalty: number; // 0 - 50 pts (Opponent-process withdrawal)
  financialDrainPenalty: number; // 0 - 30 pts (Compound cost vs disposable income anxiety)
  whoWellBeingIndex: number; // 0 - 100 (WHO-5 Psychiatric Well-Being standard)
  synapticIntegrity: number; // 0 - 100% (Neuron cluster density & dendritic spine health)
  neuronDegradationRate: number; // % annual atrophy driven by excitotoxicity & inflammation
  neuroplasticHealingRate: number; // % repair driven by BDNF, sleep, and social buffering
  bdnfLevel: number; // ng/mL (Brain-Derived Neurotrophic Factor, normal 18-32 ng/mL)
  microglialInflammation: number; // 0 - 100 (Neuroinflammation / cytokine burden)
  neuronClustersActive: number; // billions of functioning cortical synaptic units (~16.3B max)
  activeParadoxes: Array<{
    title: string;
    description: string;
    intensity: 'mild' | 'moderate' | 'singularity';
    effect: string;
  }>;
  regionActivation: Record<BrainRegion, number>; // 0 - 100
  dominantJoyFactor: BrainVariable;
  dominantBugFactor: BrainVariable;
  stateArchetype: {
    title: string;
    subtitle: string;
    color: string;
    advice: string;
  };
}

export interface WHOReportData {
  reportTitle: string;
  publishingBody: string;
  year: number;
  globalPrevalenceRatio: string;
  economicCostAnnualUSD: string;
  dalysLostAnnualMillions: number;
  keyActionPillars: string[];
  institutionalUrl: string;
}

export interface ClinicalBookReference {
  id: string;
  title: string;
  author: string;
  institution: string;
  year: number;
  coreBiologicalThesis: string;
  mechanismMapped: string;
  clinicalEquationImplemented: string;
}

export interface NeuronClusterStatus {
  totalCorticalNeuronsBillions: number;
  activeClusterDensityPct: number;
  dendriticSpinesPerMicron: number;
  excitotoxicGlutamateBurden: number;
  bdnfRegenerationIndex: number;
  microgliaState: 'resting_ramified' | 'primed_reactive' | 'neurotoxic_m1' | 'reparative_m2';
}

export interface FormulaPreset {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  overrides: Record<string, number>;
}

export interface OSINTCountryProfile {
  id: string;
  country: string;
  region: string;
  flag: string;
  happinessPerCapita: number; // 0 - 10 score
  gdpPerCapitaUSD: number;
  youthHappinessIndex: number; // 0 - 100
  socialTrustScore: number; // 0 - 100%
  safetyIndex: number; // 0 - 100
  keyYouthCrises: string[];
  politicalSpectrumDrivers: {
    economicPerspective: string;
    institutionalPerspective: string;
    culturalPerspective: string;
  };
  hormonalSignature: {
    cortisolBurden: number; // 0 - 100
    oxytocinBonding: number; // 0 - 100
    dopamineDrive: number; // 0 - 100
    serotoninSecurity: number; // 0 - 100
  };
  dominantRegionsActivated: BrainRegion[];
  overrides: Record<string, number>;
}

export interface LifeShockEvent {
  id: string;
  title: string;
  type: 'acute_negative' | 'acute_positive' | 'existential_crisis' | 'absurd_drag';
  intensity: number; // 1 - 10
  description: string;
  hormonalImpact: string;
  brainImpact: string;
  overrides: Record<string, number>;
}

export interface ShockExperiment {
  id: string;
  title: string;
  question: string;
  verdict: string;
  mechanism: string;
  mathModel: string;
  events: LifeShockEvent[];
  combinedOverrides: Record<string, number>;
}

export interface MedicalCitation {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doiOrRef: string;
  keyFinding: string;
}

export interface AddictionProfile {
  id: string;
  name: string;
  substanceOrBehavior: string;
  dailyCostUSD: number;
  monthlyFinancialDrainUSD: number;
  toleranceHalfLifeHours: number;
  acuteEuphoriaDurationHours: number;
  withdrawalSeverityIndex: number; // 0 - 100
  primaryReceptorTarget: string;
  moraleCompensationScore: number; // 0 - 100: how much subjective morale it temporarily buys to survive the workday
  financialAnxietyMultiplier: number; // 0 - 100: how much guilt/panic the expenditure creates later
  mechanismSummary: string;
  withdrawalSymptoms: string[];
  citations: MedicalCitation[];
  overridesAtPeak: Record<string, number>;
  overridesAtWithdrawal: Record<string, number>;
}
