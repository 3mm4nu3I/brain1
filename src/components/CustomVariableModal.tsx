import React, { useState } from 'react';
import { X, Sparkles, Bug, Plus } from 'lucide-react';
import { BrainVariable, BrainRegion, VariableCategory } from '../types/formula';

interface CustomVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVariable: (newVar: BrainVariable) => void;
}

export const CustomVariableModal: React.FC<CustomVariableModalProps> = ({
  isOpen,
  onClose,
  onAddVariable,
}) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [category, setCategory] = useState<VariableCategory>('illogical');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('bliss_pts');
  const [anomalyNote, setAnomalyNote] = useState('');
  const [weight, setWeight] = useState(1.2);
  const [brainRegion, setBrainRegion] = useState<BrainRegion>('nucleus_accumbens');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `custom_${Date.now()}`;
    const cleanSymbol = symbol.trim() || `ξ_${name.slice(0, 3).toLowerCase()}`;

    const newVar: BrainVariable = {
      id,
      name: name.trim(),
      symbol: cleanSymbol,
      latexSymbol: `\\xi_{\\text{${cleanSymbol.replace(/[^a-zA-Z]/g, '')}}}`,
      category,
      description: description.trim() || 'A bespoke idiosyncratic human factor.',
      unit: unit.trim() || 'units',
      value: 75,
      defaultValue: 75,
      min: 0,
      max: 100,
      step: 1,
      weight: Number(weight),
      exponent: 1.1,
      isIllogical: category === 'illogical',
      isFaulty: category === 'faulty',
      anomalyNote: anomalyNote.trim() || 'Custom subjective neurological perturbation.',
      brainRegion,
      custom: true,
    };

    onAddVariable(newVar);
    onClose();
    setName('');
    setSymbol('');
    setDescription('');
    setAnomalyNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Synthesize Bespoke Variable
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Variable Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Printer Works on First Try, 9 PM Cereal Dinner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Mathematical Symbol</label>
              <input
                type="text"
                placeholder="e.g. Ω_print, ψ_cereal"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Measurement Unit</label>
              <input
                type="text"
                placeholder="e.g. crunch_dB, pages_clean"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nature / Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VariableCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="illogical">Illogical Delight (Irrational bliss)</option>
                <option value="faulty">Firmware Bug (Cognitive drag)</option>
                <option value="whimsical">Cosmic Whimsy</option>
                <option value="psychological">Psychological Vector</option>
                <option value="neurochemical">Neurochemical Substrate</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Brain Target Region</label>
              <select
                value={brainRegion}
                onChange={(e) => setBrainRegion(e.target.value as BrainRegion)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="nucleus_accumbens">Nucleus Accumbens (Reward)</option>
                <option value="prefrontal_cortex">Prefrontal Cortex (Control)</option>
                <option value="amygdala">Amygdala (Alarm)</option>
                <option value="insula">Insula (Sensory & Body)</option>
                <option value="default_mode_network">Default Mode (Daydreams)</option>
                <option value="hypothalamus">Hypothalamus (Instincts)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Why does this phenomenon alter human consciousness?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Illogical / Faulty Observation</label>
            <input
              type="text"
              placeholder="e.g. Defies physical law; yields 300% disproportionate serotonin."
              value={anomalyNote}
              onChange={(e) => setAnomalyNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Integrate Into Formula</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
