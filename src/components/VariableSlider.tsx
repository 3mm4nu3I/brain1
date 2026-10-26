import React from 'react';
import { Minus, Plus, RotateCcw, AlertTriangle, Sparkles, Bug } from 'lucide-react';
import { BrainVariable } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface VariableSliderProps {
  variable: BrainVariable;
  onChange: (id: string, value: number) => void;
  onReset: (id: string) => void;
  marginalImpact: number;
  isSelected?: boolean;
  onFocus?: () => void;
}

export const VariableSlider: React.FC<VariableSliderProps> = ({
  variable,
  onChange,
  onReset,
  marginalImpact,
  isSelected,
  onFocus,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(variable.id, val);
    if (variable.id === 'bubble_wrap_rupture') {
      neuroAudio.playBubblePop();
    } else {
      neuroAudio.playNudgePing(300 + (val / 100) * 350);
    }
  };

  const handleStep = (delta: number) => {
    const nextVal = Math.max(variable.min, Math.min(variable.max, variable.value + delta));
    onChange(variable.id, nextVal);
    if (variable.id === 'bubble_wrap_rupture') {
      neuroAudio.playBubblePop();
    } else {
      neuroAudio.playNudgePing(300 + (nextVal / 100) * 350);
    }
  };

  // Determine category badge accent
  let categoryColor = 'text-cyan-400';
  let categoryIcon = null;

  if (variable.isIllogical) {
    categoryColor = 'text-violet-400';
    categoryIcon = <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />;
  } else if (variable.isFaulty) {
    categoryColor = 'text-rose-400';
    categoryIcon = <Bug className="w-3 h-3 text-rose-400 shrink-0" />;
  } else if (variable.category === 'whimsical') {
    categoryColor = 'text-amber-400';
    categoryIcon = <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />;
  }

  const isPositiveImpact = marginalImpact >= 0;

  return (
    <div
      onClick={onFocus}
      className={`p-4 rounded-xl border transition-all text-slate-100 ${
        isSelected
          ? 'bg-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700/80'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm bg-slate-800 text-cyan-300 border border-slate-700">
              {variable.symbol}
            </span>
            <h3 className="text-sm font-semibold text-slate-100 truncate">
              {variable.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {categoryIcon}
            <span className={categoryColor}>
              {variable.isIllogical
                ? 'Illogical Paradox'
                : variable.isFaulty
                ? 'Firmware Bug'
                : variable.category.charAt(0).toUpperCase() + variable.category.slice(1)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">{variable.brainRegion.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Marginal impact indicator */}
        <div className="text-right shrink-0">
          <div
            className={`font-mono text-xs font-semibold ${
              isPositiveImpact ? 'text-emerald-400' : 'text-rose-400'
            }`}
            title="Marginal change in happiness per unit increase (∂H/∂v)"
          >
            ∂H/∂v {isPositiveImpact ? `+${marginalImpact}` : marginalImpact}
          </div>
          <div className="font-mono text-xs text-slate-400 mt-0.5 tabular-nums">
            <span className="text-slate-100 font-bold text-sm">{variable.value}</span>
            <span className="text-[10px] ml-1 text-slate-400">{variable.unit}</span>
          </div>
        </div>
      </div>

      {/* Description & anomaly note */}
      <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
        {variable.description}
      </p>

      {variable.anomalyNote && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-md p-2 mb-3 text-[11px] text-slate-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="italic leading-snug">{variable.anomalyNote}</span>
        </div>
      )}

      {/* Interactive Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStep(-variable.step);
          }}
          disabled={variable.value <= variable.min}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-700 cursor-pointer"
          aria-label="Decrease value"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={variable.min}
            max={variable.max}
            step={variable.step}
            value={variable.value}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStep(variable.step);
          }}
          disabled={variable.value >= variable.max}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-700 cursor-pointer"
          aria-label="Increase value"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {variable.value !== variable.defaultValue && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset(variable.id);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
            title="Reset to biological baseline"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
