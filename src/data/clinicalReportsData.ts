import { WHOReportData, ClinicalBookReference } from '../types/formula';

export const WHO_REPORT_METRICS: WHOReportData = {
  reportTitle: 'World Mental Health Report 2022: Transforming Mental Health for All',
  publishingBody: 'World Health Organization (WHO) & United Nations',
  year: 2022,
  globalPrevalenceRatio: '1 in every 8 individuals worldwide (~970 million people)',
  economicCostAnnualUSD: '$1.0 Trillion in lost productivity globally per annum',
  dalysLostAnnualMillions: 125.3,
  keyActionPillars: [
    'Deepening value and commitment attributed to mental health across society',
    'Reshaping environments that influence mental health (homes, schools, workplaces)',
    'Strengthening community-based care and clinical parity with physical medicine',
    'Integrating universal social safety nets and preventative neuro-resilience programs',
  ],
  institutionalUrl: 'https://www.who.int/publications/i/item/9789240049338',
};

export const WHO_FIVE_DIMENSIONS = [
  {
    id: 'who_cheerful',
    question: 'I have felt cheerful and in good spirits',
    idealScore: 5,
    weight: 0.22,
    neuroSignificance: 'Prefrontal-striatal dopamine signaling & positive affective tone',
  },
  {
    id: 'who_calm',
    question: 'I have felt calm and relaxed',
    idealScore: 5,
    weight: 0.24,
    neuroSignificance: 'GABAergic interneuron tone suppressing central amygdala alarm',
  },
  {
    id: 'who_active',
    question: 'I have felt active and vigorous',
    idealScore: 5,
    weight: 0.18,
    neuroSignificance: 'Locus coeruleus noradrenaline and motor cortex dopaminergic drive',
  },
  {
    id: 'who_rested',
    question: 'I woke up feeling fresh and rested',
    idealScore: 5,
    weight: 0.20,
    neuroSignificance: 'Slow-Wave Sleep glymphatic metabolic clearance & adenosine reset',
  },
  {
    id: 'who_fulfilled',
    question: 'My daily life has been filled with things that interest me',
    idealScore: 5,
    weight: 0.16,
    neuroSignificance: 'Cortical purpose, intrinsic motivation, and anterior cingulate engagement',
  },
];

export const CLINICAL_BOOK_REFERENCES: ClinicalBookReference[] = [
  {
    id: 'sapolsky_zebras',
    title: "Why Zebras Don't Get Ulcers: The Acclaimed Guide to Stress, Stress-Related Diseases, and Coping",
    author: 'Robert M. Sapolsky, Ph.D.',
    institution: 'Stanford University (Departments of Biological Sciences and Neurological Sciences)',
    year: 2004,
    coreBiologicalThesis:
      'Human stress is unique because it is provoked by anticipatory psychological dread rather than acute predatory chases. Chronic glucocorticoid (cortisol) exposure causes excitotoxic damage, retracting dendritic spines in the CA3 hippocampal pyramidal neurons and impairing neurogenesis.',
    mechanismMapped:
      'Glucocorticoid neurotoxicity + NMDA glutamate receptor overstimulation -> CA3 dendritic atrophy & hippocampal volume shrinkage.',
    clinicalEquationImplemented:
      '\\Delta_{\\text{hippocampal\\_atrophy}} = \\int_0^t \\left( \\frac{C_{\\text{cortisol}}(\\tau)^{1.4}}{K_m + C_{\\text{cortisol}}} \\right) d\\tau - \\mathcal{B}_{\\text{BDNF}}',
  },
  {
    id: 'body_keeps_score',
    title: 'The Body Keeps the Score: Brain, Mind, and Body in the Healing of Trauma',
    author: 'Bessel van der Kolk, M.D.',
    institution: 'Boston University School of Medicine & Trauma Center',
    year: 2014,
    coreBiologicalThesis:
      'Traumatic stress fundamentally reorganizes the brain’s autonomic nervous system, causing excessive amygdala hyper-reactivity while dampening medial prefrontal executive modulation (Brodmann Area 10/11) and insular interoception.',
    mechanismMapped:
      'Amygdala firestorm unchecked by prefrontal brake -> Vagal nerve withdrawal, visceral somatic tightness, and dissociation.',
    clinicalEquationImplemented:
      '\\text{AllostaticStrain} = \\frac{\\mathcal{A}_{\\text{amygdala}}}{\\mathcal{P}_{\\text{PFC}} \\cdot \\mathcal{V}_{\\text{vagal\\_tone}}}',
  },
  {
    id: 'walker_sleep',
    title: 'Why We Sleep: Unlocking the Power of Sleep and Dreams',
    author: 'Matthew Walker, Ph.D.',
    institution: 'University of California, Berkeley (Center for Human Sleep Science)',
    year: 2017,
    coreBiologicalThesis:
      'During NREM Slow-Wave Sleep, the brain conducts synaptic downscaling and glymphatic beta-amyloid clearance. A single night of sleep deprivation increases amygdala emotional reactivity by up to 60%, uncoupling prefrontal inhibitory circuits.',
    mechanismMapped:
      'Adenosine sleep debt ($A_{debt}$) accumulation blocks glymphatic clearance and inflames microglial cytokines.',
    clinicalEquationImplemented:
      '\\text{AmygdalaReactivity} = \\mathcal{A}_0 \\times \\left( 1 + 0.6 \\cdot \\frac{A_{\\text{adenosine}}}{100} \\right)',
  },
  {
    id: 'ledoux_synaptic_self',
    title: 'Synaptic Self: How Our Brains Become Who We Are',
    author: 'Joseph LeDoux, Ph.D.',
    institution: 'New York University (Center for Neural Science & Nathan Kline Institute)',
    year: 2002,
    coreBiologicalThesis:
      'Memory and personality reside in the configuration of synaptic connections. Synaptic plasticity is governed by Long-Term Potentiation (LTP) and dendritic remodeling, which can either deteriorate under chronic isolation or heal via enriched environments.',
    mechanismMapped:
      'Hebbian synaptic reinforcement: "Neurons that fire together, wire together." Dendritic spine growth requires BDNF-TrkB activation.',
    clinicalEquationImplemented:
      '\\mathcal{S}_{\\text{integrity}}(t) = \\mathcal{S}_0 + \\eta \\cdot \\text{BDNF} - \\mu \\cdot \\text{Inflammation}',
  },
  {
    id: 'nestler_addiction_resilience',
    title: 'Molecular Neurobiology of Addiction and Resilience',
    author: 'Eric J. Nestler, M.D., Ph.D.',
    institution: 'Icahn School of Medicine at Mount Sinai (Nash Family Department of Neuroscience)',
    year: 2013,
    coreBiologicalThesis:
      'Chronic artificial stimulation leads to stable accumulation of the transcription factor ΔFosB in the nucleus accumbens, creating long-term structural neuroadaptations that alter basal reward sensitivity and drive compulsive habit loops.',
    mechanismMapped:
      'ΔFosB persistence resets the baseline reward threshold, requiring higher stimuli to prevent anhedonia.',
    clinicalEquationImplemented:
      '\\text{Threshold}_{\\text{dopamine}} = D_{\\text{baseline}} \\cdot \\left( 1 + \\kappa \\cdot \\Delta\\text{FosB} \\right)',
  },
  {
    id: 'insel_healing',
    title: 'Healing: Our Path from Mental Illness to Mental Health',
    author: 'Thomas Insel, M.D.',
    institution: 'Former Director of the National Institute of Mental Health (NIMH)',
    year: 2022,
    coreBiologicalThesis:
      'Mental disorders are brain circuit disorders that require three fundamental therapeutic vectors: People (social connection), Place (safe, stable environment), and Purpose (meaningful contribution), superseding simple chemical imbalance models.',
    mechanismMapped:
      'RDoC (Research Domain Criteria) integration: positive valence, negative valence, cognitive control, and social connection.',
    clinicalEquationImplemented:
      '\\Psi_{\\text{resilience}} = \\sqrt[3]{\\text{People} \\cdot \\text{Place} \\cdot \\text{Purpose}}',
  },
];

export const NEURON_CLUSTER_PARAMETERS = {
  totalCorticalNeurons: 16.34, // billion neurons in human cerebral cortex (Azevedo et al. 2009)
  totalSynapticConnections: 125, // trillion synapses in human brain
  baselineDendriticSpineDensity: 1.85, // spines per micron on apical dendrites
  normalBdnfRange: { min: 18.0, max: 32.0, unit: 'ng/mL' },
  excitotoxicThresholdGlutamate: 65, // arbitrary biomarker threshold (0-100)
  microgliaStates: {
    resting: { name: 'Ramified M0 (Surveillance)', cytokineProfile: 'Low basal (Homeostatic)' },
    reactive: { name: 'Primed Reactive', cytokineProfile: 'Moderate IL-6 / TNF-α elevation' },
    neurotoxic: { name: 'Ameboid M1 (Excitotoxic Pruning)', cytokineProfile: 'High TNF-α, IL-1β, ROS' },
    reparative: { name: 'Phagocytic M2 (Neuro-reparative)', cytokineProfile: 'High TGF-β, IL-10, IGF-1' },
  },
};
