import React, { useState, useMemo } from 'react';
import {
  Coffee,
  DollarSign,
  Activity,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ADDICTION_PROFILES, MEDICAL_CITATIONS } from '../data/addictionData';
import { AddictionProfile } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface AddictionWithdrawalLabProps {
  onApplyOverrides: (overrides: Record<string, number>) => void;
  hoursSinceLastDose: number;
  onHoursChange: (hours: number) => void;
  dailySpendUSD: number;
  onSpendChange: (spend: number) => void;
}

export const AddictionWithdrawalLab: React.FC<AddictionWithdrawalLabProps> = ({
  onApplyOverrides,
  hoursSinceLastDose,
  onHoursChange,
  dailySpendUSD,
  onSpendChange,
}) => {
  const [selectedAddictionId, setSelectedAddictionId] = useState<string>('caffeine_starbucks');
  const [activeCycleState, setActiveCycleState] = useState<'peak' | 'withdrawal'>('withdrawal');

  const activeProfile: AddictionProfile =
    ADDICTION_PROFILES.find((p) => p.id === selectedAddictionId) || ADDICTION_PROFILES[0];

  // Financial calculations
  const monthlyCost = Math.round(dailySpendUSD * 30 * 10) / 10;
  const yearlyCost = Math.round(dailySpendUSD * 365);

  // Opponent-process curve data points for SVG rendering
  const curvePoints = useMemo(() => {
    const points: Array<{ hour: number; aVal: number; bVal: number; netVal: number }> = [];
    const tauPeak = activeProfile.acuteEuphoriaDurationHours;
    const tauHalf = activeProfile.toleranceHalfLifeHours;

    for (let h = 0; h <= 36; h += 0.5) {
      // a-process: rapid sharp surge, quick decay
      const aVal = 85 * Math.exp(-h / tauPeak);
      // b-process: slow onset, deeper and longer-lasting allostatic drag
      const bVal = 65 * (1 - Math.exp(-h / 2.0)) * Math.exp(-h / (tauHalf * 2.5));
      const netVal = Math.round((aVal - bVal) * 10) / 10;
      points.push({ hour: h, aVal, bVal, netVal });
    }
    return points;
  }, [activeProfile]);

  const handleSelectProfile = (p: AddictionProfile) => {
    setSelectedAddictionId(p.id);
    onSpendChange(p.dailyCostUSD);
    neuroAudio.playNudgePing(420);
  };

  const handleTriggerCycleState = (state: 'peak' | 'withdrawal') => {
    setActiveCycleState(state);
    if (state === 'peak') {
      onHoursChange(1.0);
      onApplyOverrides(activeProfile.overridesAtPeak);
    } else {
      onHoursChange(16.0);
      onApplyOverrides(activeProfile.overridesAtWithdrawal);
    }
    neuroAudio.playParadoxChime();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Addiction, Withdrawal & The Financial-Morale Paradox
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Opponent-process allostatic models (Koob & Volkow), caffeine withdrawal (Griffiths 2004), and the Starbucks $220/month morale trade-off
          </p>
        </div>

        <div className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg shrink-0">
          Medical Opponent-Process Model
        </div>
      </div>

      {/* Addiction Profile Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {ADDICTION_PROFILES.map((p) => {
          const isSelected = p.id === activeProfile.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectProfile(p)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono text-amber-400 font-semibold">${p.dailyCostUSD}/day</span>
                <span className="text-[10px] text-slate-500 font-mono">T½: {p.toleranceHalfLifeHours}h</span>
              </div>
              <div className="text-xs font-bold text-slate-100 truncate">{p.name.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.substanceOrBehavior}</div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-950 border border-slate-800 rounded-xl p-5">
        {/* Left: The Starbucks vs Wallet & Morale Trade-Off Calculator */}
        <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-xs sm:text-sm">
              The Daily Starbucks vs. Wallet Morale Paradox
            </h3>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            People buy daily $7 lattes or $15 delivery not out of economic ignorance, but to purchase immediate subjective <strong className="text-amber-300">workday morale</strong>. Yet this financial leakage drains $2,600+/year, fueling long-term background savings panic.
          </p>

          {/* Daily Spend Scrubber */}
          <div className="space-y-1.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Daily Habit Expenditure:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">${dailySpendUSD.toFixed(2)} / day</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={0.5}
              value={dailySpendUSD}
              onChange={(e) => onSpendChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$0 (Home brewed)</span>
              <span>$7.45 (Starbucks)</span>
              <span>$25.00 (Vape + Latte)</span>
            </div>
          </div>

          {/* Financial Breakdown Metric Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Monthly Leakage</div>
              <div className="text-base font-mono font-bold text-rose-400 mt-0.5">
                ${monthlyCost.toFixed(2)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">-${yearlyCost}/yr savings lost</div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Purchased Morale</div>
              <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                +{activeProfile.moraleCompensationScore} pts
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Short-term work coping</div>
            </div>
          </div>

          {/* Scrubber for Hours Since Last Dose */}
          <div className="space-y-1.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hours Since Last Dose:</span>
              </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">{hoursSinceLastDose} hours</span>
            </div>
            <input
              type="range"
              min={0}
              max={36}
              step={1}
              value={hoursSinceLastDose}
              onChange={(e) => onHoursChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0h (Fresh Sip)</span>
              <span>14h (Morning Headache)</span>
              <span>36h (Peak Trough)</span>
            </div>
          </div>

          {/* Quick State Toggle Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleTriggerCycleState('peak')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeCycleState === 'peak'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulate Fresh Dose (Peak)
            </button>
            <button
              onClick={() => handleTriggerCycleState('withdrawal')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeCycleState === 'withdrawal'
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulate Withdrawal (Trough)
            </button>
          </div>
        </div>

        {/* Right: Opponent-Process Curve & Neurobiology */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>The Koob Opponent-Process Curve: $a$-Process vs. $b$-Process</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Dynamic curve illustrating acute hedonic spike followed by allostatic rebound deficit
              </p>
            </div>
          </div>

          {/* Interactive SVG Opponent-Process Curve */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800/80 mb-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Green: Acute Hit a(τ)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Red: Withdrawal b(τ)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Cyan: Net Affect A(τ)</span>
              </span>
            </div>

            <svg viewBox="0 0 400 160" className="w-full h-36 overflow-visible">
              {/* Baseline Zero Axis */}
              <line x1="20" y1="80" x2="380" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <text x="25" y="75" fill="#64748B" fontSize="9" fontFamily="monospace">Baseline Equilibrium (H = 50)</text>

              {/* Red Shaded Withdrawal Deficit Zone */}
              <path
                d={`M 20 80 ${curvePoints
                  .map((p) => {
                    const x = 20 + (p.hour / 36) * 360;
                    const y = Math.max(80, 80 - p.netVal * 0.7);
                    return `L ${x} ${y}`;
                  })
                  .join(' ')} L 380 80 Z`}
                fill="rgba(244, 63, 94, 0.15)"
              />

              {/* Net Affect Curve (Cyan) */}
              <path
                d={`M 20 ${80 - curvePoints[0].netVal * 0.7} ${curvePoints
                  .map((p) => {
                    const x = 20 + (p.hour / 36) * 360;
                    const y = 80 - p.netVal * 0.7;
                    return `L ${x} ${y}`;
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
              />

              {/* Current Hour Indicator Needle */}
              {(() => {
                const needleX = 20 + (Math.min(36, hoursSinceLastDose) / 36) * 360;
                return (
                  <g>
                    <line x1={needleX} y1="10" x2={needleX} y2="150" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2" />
                    <circle cx={needleX} cy="80" r="3.5" fill="#F59E0B" />
                    <text x={needleX + 4} y="25" fill="#F59E0B" fontSize="9" fontFamily="monospace" fontWeight="bold">
                      Now: {hoursSinceLastDose}h
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Withdrawal Symptoms Checklist */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Documented Withdrawal Symptoms ({activeProfile.name}):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {activeProfile.withdrawalSymptoms.map((symp, idx) => (
                <div key={idx} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
                  <span className="text-rose-400 font-mono">•</span>
                  <span className="leading-tight">{symp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peer-Reviewed Medical Citations */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Peer-Reviewed Medical Citations:</span>
            </span>

            {activeProfile.citations.map((cite, idx) => (
              <div key={idx} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[10px] space-y-1 font-mono">
                <div className="font-bold text-slate-200">
                  {cite.authors} ({cite.year}). <em>{cite.title}</em>. {cite.journal}.
                </div>
                <div className="text-slate-400 leading-relaxed font-sans text-[11px]">
                  {cite.keyFinding}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
