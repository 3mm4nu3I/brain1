import { BrainVariable, BrainRegion, HappinessBreakdown } from '../types/formula';

export function calculateHappiness(
  variables: BrainVariable[],
  hoursSinceLastDose = 14,
  monthlySubstanceSpend = 223.50 // e.g. Starbucks $7.45/day default
): HappinessBreakdown {
  const getVal = (id: string, fallback = 50): number => {
    const v = variables.find((item) => item.id === id);
    return v !== undefined ? v.value : fallback;
  };

  // --- 1. Wetware Substrate ---
  const dop = getVal('dopamine_delta', 50);
  const ser = getVal('serotonin_flux', 50);
  const oxy = getVal('oxytocin_cuddle', 50);
  const end = getVal('endorphin_pulse', 50);
  const gab = Math.max(1, getVal('gaba_calm', 50));
  const cor = getVal('cortisol_burden', 40);
  const ade = getVal('adenosine_sleep_debt', 30);
  const think = getVal('recursive_overthinking', 40);
  const hangry = getVal('hangry_vortex', 20);

  // --- Clinical Neurobiology & WHO Vectors ---
  const bdnf = getVal('bdnf_healing', 68);
  const inflam = getVal('neuroinflammation_index', 24);
  const excit = getVal('excitotoxic_calcium_degradation', 26);
  const whoQol = getVal('who_environmental_qol', 72);

  // Microglial Neuroinflammation & Cytokine Cascade
  const microglialInflammation = Math.round(
    Math.min(100, inflam * 0.65 + (cor / 100) * 22 + (ade / 100) * 15)
  );

  // BDNF level in clinical ng/mL (Normal adult range: 18 - 32 ng/mL)
  const bdnfLevel = Math.round(
    Math.max(10, Math.min(38, 14 + (bdnf / 100) * 18 - (cor / 100) * 5 + (gab / 100) * 3)) * 10
  ) / 10;

  // Synaptic Integrity (Neuron cluster connectivity & dendritic spine density, 0-100%)
  const synapticIntegrity = Math.round(
    Math.max(
      15,
      Math.min(
        100,
        (bdnf / 100) * 85 +
          (gab / 100) * 20 -
          (microglialInflammation / 100) * 28 -
          (excit / 100) * 22
      )
    )
  );

  // Active Cortical Neuron Clusters (Billions of functional units out of 16.34B total)
  const neuronClustersActive = Math.round((16.34 * (synapticIntegrity / 100)) * 100) / 100;

  // Neuron Degradation Rate (% annual synaptic attrition)
  const neuronDegradationRate =
    Math.round(
      Math.max(
        0.2,
        (excit * 0.035 + microglialInflammation * 0.03 + Math.pow(cor / 100, 1.3) * 2.8) * 10
      )
    ) / 10;

  // Neuroplastic Healing Rate (% annual dendritic remodeling & LTP repair)
  const neuroplasticHealingRate =
    Math.round(
      Math.max(
        0.5,
        ((bdnf / 100) * 3.8 + (gab / 100) * 1.5 + (oxy / 100) * 1.2 + (whoQol / 100) * 1.0) * 10
      )
    ) / 10;

  // WHO-5 Psychiatric Well-Being Index (0 - 100 standard clinical scale)
  // Dimensions: Cheerful, Calm, Active, Rested, Fulfilled
  const whoCheerful = (dop * 0.6 + ser * 0.4) / 100;
  const whoCalm = (gab * 0.7 + Math.max(0, 100 - cor) * 0.3) / 100;
  const whoActive = Math.max(0, 100 - ade) / 100;
  const whoRested = Math.max(0, 100 - ade * 0.8 - cor * 0.2) / 100;
  const whoFulfilled = whoQol / 100;

  const whoWellBeingIndex = Math.round(
    Math.min(
      100,
      Math.max(
        0,
        (whoCheerful * 0.22 + whoCalm * 0.24 + whoActive * 0.18 + whoRested * 0.2 + whoFulfilled * 0.16) * 100
      )
    )
  );

  // --- 2. Opponent-Process Addiction & Withdrawal Modeling (Koob & Volkow Model) ---
  // If hoursSinceLastDose is between 8 and 24, withdrawal penalty peaks
  const withdrawalTroughFactor =
    hoursSinceLastDose > 2
      ? Math.sin(Math.min(Math.PI, (hoursSinceLastDose - 2) / 18 * Math.PI))
      : 0;

  // The Adenosine & Dopamine Downregulation Penalty
  const receptorDownregulation = Math.pow(ade / 100, 1.25) * 12 + Math.max(0, 50 - dop) * 0.25;
  const withdrawalPenalty = Math.round(
    Math.min(45, withdrawalTroughFactor * 22 + receptorDownregulation)
  );

  // Financial Drain vs Disposable Income Anxiety (The Starbucks $220/mo Dilemma)
  // Monthly spend creates compounding subconscious guilt & budget friction
  const financialDrainPenalty = Math.round(
    Math.min(
      28,
      (monthlySubstanceSpend / 300) * 12 * (1 + Math.pow(cor / 100, 1.2) * 0.6)
    )
  );

  // Allostatic Load (Cumulative physiological wear and tear / Bruce McEwen model)
  const allostaticLoad = Math.round(
    Math.min(
      100,
      Math.pow(cor / 100, 1.3) * 36 +
        Math.pow(ade / 100, 1.2) * 22 +
        Math.pow(think / 100, 1.25) * 18 +
        Math.pow(hangry / 100, 1.3) * 10 +
        withdrawalPenalty * 0.35 +
        financialDrainPenalty * 0.3
    )
  );

  // Positive Wetware Core
  const positiveNeuro =
    Math.pow(dop / 100, 1.1) * 28 +
    Math.pow(ser / 100, 1.0) * 26 +
    Math.pow(oxy / 100, 1.05) * 25 +
    Math.pow(end / 100, 1.0) * 21;

  // GABA dampening & non-linear stress compounding divisor
  const gabaMod = Math.pow(gab / 50, 0.45);
  const stressDivisor =
    1 +
    Math.pow(cor / 100, 1.4) * 0.75 +
    Math.pow(ade / 100, 1.2) * 0.45 +
    (allostaticLoad > 75 ? Math.pow((allostaticLoad - 75) / 25, 2) * 0.6 : 0);

  const neuroSubstrate = (positiveNeuro * gabaMod) / stressDivisor;

  // --- 3. Psychological Vector ---
  const flow = getVal('flow_state', 50);
  const purpose = getVal('ikigai_purpose', 50);
  const agency = getVal('autonomy_agency', 50);
  const grat = getVal('gratitude_depth', 50);
  const nost = getVal('nostalgia_distortion', 50);

  const rawPsych = (flow * 0.32 + purpose * 0.28 + agency * 0.22 + grat * 0.12 + nost * 0.06) / 100;
  const psychologicalMultiplier = 0.55 + 0.9 * rawPsych;

  // --- 4. Illogical Paradox Surge ---
  const sock = getVal('warm_socks_dryer', 0);
  const canc = getVal('canceled_plans_relief', 0);
  const pizza = getVal('cold_pizza_3am', 0);
  const pop = getVal('bubble_wrap_rupture', 0);
  const cat = getVal('cat_on_lap_paralysis', 0);
  const shower = getVal('shower_argument_victory', 0);
  const pillow = getVal('pillow_flip_cold_side', 0);
  const loop = getVal('one_song_looped_72h', 0);
  const cash = getVal('forgotten_pocket_money', 0);
  const bomb = getVal('microwave_001_stop', 0);

  let illogicalSurge =
    Math.pow(sock / 100, 1.2) * 6.5 +
    Math.pow(canc / 100, 1.25) * 7.5 +
    Math.pow(pizza / 100, 1.15) * 5.2 +
    Math.pow(pop / 100, 1.05) * 3.8 +
    Math.pow(cat / 100, 1.2) * 6.8 +
    Math.pow(shower / 100, 1.1) * 3.5 +
    Math.pow(pillow / 100, 1.15) * 4.6 +
    Math.pow(loop / 100, 1.05) * 3.4 +
    Math.pow(cash / 100, 1.2) * 5.8 +
    Math.pow(bomb / 100, 1.05) * 3.2;

  if (sock > 75 && cat > 75) illogicalSurge += 5.5;
  if (canc > 80 && pizza > 70) illogicalSurge += 6.0;
  if (pillow > 80 && bomb > 75) illogicalSurge += 3.5;

  // --- 5. Faulty Firmware Drag ---
  const tabs = getVal('tabs_open_burden', 40);
  const comp = getVal('social_comparison_feed', 30);
  const imp = getVal('impostor_terror', 30);
  const scrub = getVal('procrastination_cleaning', 40);
  const sunk = getVal('sunk_cost_stubbornness', 30);

  const scrubRelief = (scrub / 100) * 3.2;

  const faultyDrag = Math.max(
    0,
    Math.pow(think / 100, 1.3) * 12.5 +
      Math.pow(tabs / 100, 1.15) * 8.2 +
      Math.pow(comp / 100, 1.25) * 10.5 +
      Math.pow(imp / 100, 1.1) * 8.0 +
      Math.pow(hangry / 100, 1.4) * 16.5 +
      Math.pow(sunk / 100, 1.1) * 5.5 -
      scrubRelief
  );

  // --- 6. Whimsical Realities Bonus ---
  const rain = getVal('rain_on_roof', 50);
  const sun = getVal('sunlight_on_face', 50);
  const tail = getVal('dog_tail_wag', 50);
  const coffee = getVal('coffee_temperature_sweetspot', 50);
  const schrod = getVal('schrodinger_text', 50);

  const schrodingerDelta = schrod > 60 ? -((schrod - 60) / 40) * 4.2 : ((60 - schrod) / 60) * 2.0;

  const whimsicalBonus =
    Math.pow(rain / 100, 1.15) * 6.5 +
    Math.pow(sun / 100, 1.1) * 6.0 +
    Math.pow(tail / 100, 1.25) * 8.5 +
    Math.pow(coffee / 100, 1.1) * 4.5 +
    schrodingerDelta;

  // Custom variables evaluation
  let customBonus = 0;
  let customDrag = 0;
  variables
    .filter((v) => v.category === 'custom')
    .forEach((v) => {
      const normalized = v.value / 100;
      if (v.weight >= 0) {
        customBonus += Math.pow(normalized, v.exponent) * v.weight * 5;
      } else {
        customDrag += Math.pow(normalized, v.exponent) * Math.abs(v.weight) * 5;
      }
    });

  // Master Equation:
  // H = (Neuro * Psych) + Illogic + Whimsy - Faulty - WithdrawalPenalty - FinancialPenalty
  const rawScore =
    neuroSubstrate * psychologicalMultiplier +
    illogicalSurge +
    whimsicalBonus +
    customBonus -
    faultyDrag -
    withdrawalPenalty -
    financialDrainPenalty -
    customDrag;

  const normalizedHappiness = Math.round(Math.max(0, Math.min(150, rawScore)) * 10) / 10;

  // --- Active Paradoxes Detection ---
  const activeParadoxes: HappinessBreakdown['activeParadoxes'] = [];

  if (monthlySubstanceSpend > 180 && ade > 60) {
    activeParadoxes.push({
      title: 'The Starbucks Morale vs. Wallet Paradox',
      description: `Spending $${monthlySubstanceSpend}/month on daily caffeine buys momentary morning sanity while compounding savings anxiety.`,
      intensity: 'moderate',
      effect: `-${financialDrainPenalty} pts Financial Drag // +${Math.round(coffee * 0.05)} Morale Offset.`,
    });
  }

  if (withdrawalPenalty > 20) {
    activeParadoxes.push({
      title: 'Opponent-Process Withdrawal Trough (Koob Allostasis)',
      description: 'Receptor downregulation unmasked by drug clearance; baseline hedonic setpoint depressed.',
      intensity: 'singularity',
      effect: `-${withdrawalPenalty} pts Receptor Anhedonia & Vascular Fatigue.`,
    });
  }

  if (allostaticLoad > 80) {
    activeParadoxes.push({
      title: 'Supercritical Allostatic Overload ("3 Bad Things")',
      description: 'HPA axis flooded with glucocorticoids; GABA brakes depleted; acute tipping point reached.',
      intensity: 'singularity',
      effect: '-32.5 Catastrophic Prefrontal Inactivation.',
    });
  }

  if (hangry > 70 && pizza > 70) {
    activeParadoxes.push({
      title: 'Quantum Glucose-Pizza Entanglement',
      description: 'Hypoglycemic fury in direct collision with midnight dough thermodynamics.',
      intensity: 'moderate',
      effect: '+12.4 Instability // Instant culinary salvation.',
    });
  }

  if (canc > 85 && sock > 80 && cat > 80) {
    activeParadoxes.push({
      title: 'Hermit-Blanket Transcendence Singularity',
      description: 'Guilt-free isolation, thermal toe homeostasis, and feline moral paralysis.',
      intensity: 'singularity',
      effect: '+24.8 Illogical Surge // Social obligation vectors zeroed.',
    });
  }

  if (tabs > 85 && think > 85 && gab < 30) {
    activeParadoxes.push({
      title: 'Prefrontal RAM Buffer Overflow',
      description: '90+ browser tabs running concurrent existential dread subroutines.',
      intensity: 'singularity',
      effect: '-28.2 Cognitive Drag // Prefrontal cache fragmentation.',
    });
  }

  // --- 10 Brain Regions Activation (0 - 100%) ---
  const regionActivation: Record<BrainRegion, number> = {
    // 1. Prefrontal Cortex (Cyan)
    prefrontal_cortex: Math.round(
      Math.min(100, Math.max(5, flow * 0.3 + purpose * 0.25 + agency * 0.2 + think * 0.15 + imp * 0.1))
    ),
    // 2. Motor & Premotor Cortex (Violet)
    motor_cortex: Math.round(
      Math.min(100, Math.max(5, scrub * 0.55 + pop * 0.45))
    ),
    // 3. Somatosensory Cortex (Amber)
    somatosensory_cortex: Math.round(
      Math.min(100, Math.max(5, sock * 0.45 + pillow * 0.35 + coffee * 0.2))
    ),
    // 4. Parietal Lobe (Teal)
    parietal_lobe: Math.round(
      Math.min(100, Math.max(5, tabs * 0.6 + grat * 0.4))
    ),
    // 5. Occipital Lobe (Indigo)
    occipital_lobe: Math.round(
      Math.min(100, Math.max(5, sun * 0.4 + comp * 0.35 + nost * 0.25))
    ),
    // 6. Temporal Lobe (Coral)
    temporal_lobe: Math.round(
      Math.min(100, Math.max(5, loop * 0.35 + rain * 0.3 + shower * 0.2 + bomb * 0.15))
    ),
    // 7. Nucleus Accumbens (Emerald) - Downregulated during withdrawal!
    nucleus_accumbens: Math.round(
      Math.min(100, Math.max(5, (dop * 0.35 + canc * 0.25 + pizza * 0.2 + cash * 0.2) - (withdrawalPenalty * 0.4)))
    ),
    // 8. Amygdala (Crimson) - Hyperactive during withdrawal (CRF surge)!
    amygdala: Math.round(
      Math.min(100, Math.max(5, cor * 0.4 + hangry * 0.4 + schrod * 0.1 + (withdrawalPenalty * 0.3)))
    ),
    // 9. Insula & Hypothalamus (Hot Pink) - High headache / craving interoception!
    insula_hypothalamus: Math.round(
      Math.min(100, Math.max(5, oxy * 0.3 + cat * 0.25 + tail * 0.2 + ade * 0.25 + (withdrawalPenalty * 0.2)))
    ),
    // 10. Cerebellum & Brainstem (Lime)
    cerebellum_brainstem: Math.round(
      Math.min(100, Math.max(5, gab * 0.4 + end * 0.35 + ser * 0.25))
    ),
  };

  // Find dominant joy & bug factors
  let dominantJoyFactor = variables[0];
  let maxJoyImpact = -Infinity;

  let dominantBugFactor = variables[5];
  let maxBugImpact = -Infinity;

  variables.forEach((v) => {
    const rawImpact = (v.value / 100) * Math.abs(v.weight);
    if (v.weight > 0 && rawImpact > maxJoyImpact) {
      maxJoyImpact = rawImpact;
      dominantJoyFactor = v;
    }
    if ((v.weight < 0 || v.isFaulty) && rawImpact > maxBugImpact) {
      maxBugImpact = rawImpact;
      dominantBugFactor = v;
    }
  });

  // Determine State Archetype
  let stateArchetype = {
    title: 'Balanced Homeostasis',
    subtitle: 'Calibrated baseline neurochemistry across all 10 lobes',
    color: '#06B6D4',
    advice: 'Your neural circuits are running within standard terrestrial tolerances.',
  };

  if (withdrawalPenalty > 24) {
    stateArchetype = {
      title: 'Opponent-Process Withdrawal Trough',
      subtitle: `Acute receptor deficit & vascular exhaustion (Clearance: ~${hoursSinceLastDose}h)`,
      color: '#F43F5E',
      advice: 'Receptor upregulation in progress. Hydrate, take magnesium, and expect 24–48h of rebound fatigue.',
    };
  } else if (allostaticLoad > 85) {
    stateArchetype = {
      title: 'Allostatic Collapse (The 3 Shocks Threshold)',
      subtitle: 'Acute glucocorticoid saturation; Prefrontal inhibitory brakes offline',
      color: '#EF4444',
      advice: 'Stop processing intellectual tasks immediately. Sleep, warmth, and safe human presence required.',
    };
  } else if (normalizedHappiness > 110) {
    stateArchetype = {
      title: 'Transcendental Nirvana',
      subtitle: 'The illogical stars have aligned into pure bliss across all 10 regions',
      color: '#10B981',
      advice: 'Do not move a muscle. Do not open email. Preserve this quantum state.',
    };
  } else if (hangry > 75) {
    stateArchetype = {
      title: 'Hypoglycemic Amygdala Meltdown',
      subtitle: 'Your philosophy is not broken, your blood sugar is at 52 mg/dL',
      color: '#EF4444',
      advice: 'Cease contemplation. Consume 20 grams of complex carbohydrates immediately.',
    };
  } else if (think > 75 && tabs > 75) {
    stateArchetype = {
      title: 'Fronto-Parietal RAM Overflow',
      subtitle: 'Cognitive thrashing on speculative future scenarios and 94 tabs',
      color: '#F59E0B',
      advice: 'Close at least 30 tabs and drink one glass of water. None of them are urgent.',
    };
  } else if (canc > 80 && sock > 75) {
    stateArchetype = {
      title: 'The Cozy Hermit Sanctuary',
      subtitle: 'Somatosensory comfort defying all societal extroversion mandates',
      color: '#8B5CF6',
      advice: 'Enjoy your hot tea and warm socks. Society will manage without you until dawn.',
    };
  } else if (flow > 80) {
    stateArchetype = {
      title: 'Hyper-Focused Mihaly Flow',
      subtitle: 'Prefrontal resonance: 4 hours felt like 12 seconds',
      color: '#3B82F6',
      advice: 'The executive cortex is in resonance. Keep building without checking the time.',
    };
  } else if (normalizedHappiness < 35) {
    stateArchetype = {
      title: 'Synaptic Winter Deflation',
      subtitle: 'Cortisol and sleep debt exerting severe gravitational drag',
      color: '#64748B',
      advice: 'Step outside into photons, pet the nearest available four-legged mammal, and rest.',
    };
  }

  return {
    rawScore,
    normalizedHappiness,
    neuroSubstrate: Math.round(neuroSubstrate * 10) / 10,
    psychologicalMultiplier: Math.round(psychologicalMultiplier * 100) / 100,
    illogicalSurge: Math.round(illogicalSurge * 10) / 10,
    faultyDrag: Math.round(faultyDrag * 10) / 10,
    whimsicalBonus: Math.round(whimsicalBonus * 10) / 10,
    allostaticLoad,
    withdrawalPenalty,
    financialDrainPenalty,
    whoWellBeingIndex,
    synapticIntegrity,
    neuronDegradationRate,
    neuroplasticHealingRate,
    bdnfLevel,
    microglialInflammation,
    neuronClustersActive,
    activeParadoxes,
    regionActivation,
    dominantJoyFactor,
    dominantBugFactor,
    stateArchetype,
  };
}

export function calculatePartialDerivative(variables: BrainVariable[], targetId: string): number {
  const base = calculateHappiness(variables).normalizedHappiness;
  const tweaked = variables.map((v) => (v.id === targetId ? { ...v, value: Math.min(100, v.value + 5) } : v));
  const newScore = calculateHappiness(tweaked).normalizedHappiness;
  return Math.round(((newScore - base) / 5) * 100) / 100;
}
