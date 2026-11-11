import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { Copy, Check, Eye } from 'lucide-react';
import { BrainVariable } from '../types/formula';

interface MathFormulaProps {
  variables: BrainVariable[];
  onSelectVariable?: (variableId: string) => void;
  selectedVariableId?: string | null;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  variables,
  onSelectVariable,
  selectedVariableId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'canonical' | 'expanded'>('canonical');

  // Build the LaTeX equation string incorporating Opponent-Process Withdrawal and Financial Leakage
  const canonicalLatex = `\\mathcal{H}_{\\text{brain}}(\\tau) = \\Phi_{\\text{flow}} \\cdot \\left[ \\frac{\\mathcal{N}_{\\text{neuro}}}{\\mathcal{F}_{\\text{bugs}} + \\mathcal{S}_{\\text{allostatic}}} \\right] + \\sum_{i} \\Omega_{\\text{illogic}, i}^{\\kappa_i} + \\mathcal{W}_{\\text{cosmic}} - \\underbrace{\\left[ b(\\tau) + \\frac{\\Phi_{\\text{wallet}}}{\\mathcal{Y}_{\\text{income}}} \\right]}_{\\text{Withdrawal \\& Habit Drag}} + \\sum \\Xi_{\\text{custom}}`;

  const expandedLatex = `\\mathcal{H}_{\\text{brain}} = \\left( \\frac{\\Delta R_{\\text{dop}}^{1.1} + S_{\\text{flux}} + O_{\\text{bond}}^{1.05} + E_{\\text{endo}}}{1 + C_{\\text{cort}}^{1.4} + A_{\\text{debt}}^{1.2} + \\left(\\frac{\\text{Allostatic}}{100}\\right)^2} \\cdot \\sqrt{\\frac{G_{\\text{calm}}}{50}} \\right) \\times \\left[ 0.55 + 0.9 \\left( 0.35\\Phi_{\\text{flow}} + 0.3M_{\\text{purpose}} + 0.2K_{\\text{agency}} \\right) \\right] + \\sum \\Omega_{\\text{illogic}} - \\left( \\frac{\\beta_{\\text{think}}^{1.3} + \\tau_{\\text{tabs}}^{1.15} + \\gamma_{\\text{compare}}^{1.25} + \\kappa_{\\text{hangry}}^{1.4}}{1 + \\frac{\\varpi_{\\text{pizza}}}{200}} \\right) - \\underbrace{\\left[ \\gamma_{\\text{dep}} \\cdot \\left(1 - e^{-\\tau / \\tau_0}\\right) + \\frac{\\text{DailySpend} \\times 30}{\\text{Income}} \\right]}_{\\text{Starbucks / Nicotine Withdrawal \\& Financial Leakage}}`;

  const activeLatex = viewMode === 'canonical' ? canonicalLatex : expandedLatex;

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(activeLatex, containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        // Fallback rendered text
      }
    }
  }, [activeLatex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedVar = variables.find((v) => v.id === selectedVariableId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden transition-all shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <span>The Grand Unified Happiness Theorem</span>
            <span className="text-xs font-mono text-cyan-400">∂H/∂t</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-linear synthesis of neurobiology, cognitive vectors, irrational human quirks, and quantum whims
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('canonical')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'canonical'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Canonical Form
            </button>
            <button
              onClick={() => setViewMode('expanded')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'expanded'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expanded Equation
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Copy LaTeX source"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'LaTeX'}</span>
          </button>
        </div>
      </div>

      {/* Rendered Equation */}
      <div className="py-6 px-3 overflow-x-auto text-cyan-300 flex items-center justify-center min-h-[90px] border-b border-slate-800/60">
        <div ref={containerRef} className="text-sm md:text-base lg:text-lg select-text" />
      </div>

      {/* Interactive Term Inspector */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Interactive Term Probing:</span>
          {selectedVar ? (
            <span className="text-cyan-300 font-mono">
              {selectedVar.symbol} = {selectedVar.name} ({selectedVar.value} {selectedVar.unit})
            </span>
          ) : (
            <span className="text-slate-500 italic">Select any slider below or click a key factor</span>
          )}
        </div>

        {/* Quick legend */}
        <div className="flex items-center gap-3 text-slate-400 text-xs font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Wetware</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
            <span>Illogical Surge</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            <span>Firmware Bug</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Whimsy</span>
          </span>
        </div>
      </div>
    </div>
  );
};
