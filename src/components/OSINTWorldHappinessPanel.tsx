import React, { useState } from 'react';
import { Globe, ArrowRight, Shield, Heart, Zap, AlertTriangle, Scale, Activity } from 'lucide-react';
import { OSINT_COUNTRY_PROFILES } from '../data/osintHappinessData';
import { OSINTCountryProfile, BrainRegion } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface OSINTWorldHappinessPanelProps {
  activeProfileId: string;
  onApplyProfile: (profile: OSINTCountryProfile) => void;
  onSelectRegion?: (region: BrainRegion) => void;
}

export const OSINTWorldHappinessPanel: React.FC<OSINTWorldHappinessPanelProps> = ({
  activeProfileId,
  onApplyProfile,
  onSelectRegion,
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>(activeProfileId || 'nordic_model');

  const selectedProfile =
    OSINT_COUNTRY_PROFILES.find((p) => p.id === selectedCountryId) || OSINT_COUNTRY_PROFILES[0];

  const handleSelect = (profile: OSINTCountryProfile) => {
    setSelectedCountryId(profile.id);
    onApplyProfile(profile);
    neuroAudio.playParadoxChime();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              OSINT Happiness Per Capita & Geopolitical Reality Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical country statistics, youth crises across political perspectives, and how societal pressures cascade into brain hormones
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-3 py-1.5 rounded-lg shrink-0">
          OSINT Empirical Grounding
        </div>
      </div>

      {/* Country Selectors Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 my-4">
        {OSINT_COUNTRY_PROFILES.map((p) => {
          const isSelected = p.id === selectedProfile.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{p.flag}</span>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {p.happinessPerCapita} <span className="text-[10px] text-slate-500">/ 10</span>
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {p.country.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {p.region}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Deep-Dive on Selected Geopolitical Profile */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-5 my-3 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Macro OSINT Stats */}
        <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-5">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{selectedProfile.flag}</span>
            <div>
              <h3 className="text-base font-bold text-slate-100">{selectedProfile.country}</h3>
              <div className="text-xs text-slate-400">{selectedProfile.region}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Happiness Score</div>
              <div className="text-base font-mono font-bold text-cyan-400 mt-0.5">
                {selectedProfile.happinessPerCapita} / 10
              </div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">GDP Per Capita</div>
              <div className="text-base font-mono font-bold text-slate-200 mt-0.5">
                ${selectedProfile.gdpPerCapitaUSD.toLocaleString()}
              </div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Youth Happiness</div>
              <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                {selectedProfile.youthHappinessIndex} / 100
              </div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px]">Social Trust</div>
              <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                {selectedProfile.socialTrustScore}%
              </div>
            </div>
          </div>

          {/* Biological / Hormonal Cascade Readout */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hormonal & Bodily Cascade Signature:</span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-rose-400">Cortisol Burden:</span>
                <span className="text-slate-200">{selectedProfile.hormonalSignature.cortisolBurden}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${selectedProfile.hormonalSignature.cortisolBurden}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-pink-400">Oxytocin Bonding:</span>
                <span className="text-slate-200">{selectedProfile.hormonalSignature.oxytocinBonding}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${selectedProfile.hormonalSignature.oxytocinBonding}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-emerald-400">Dopamine Drive:</span>
                <span className="text-slate-200">{selectedProfile.hormonalSignature.dopamineDrive}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedProfile.hormonalSignature.dopamineDrive}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Political Perspectives & Youth Crises Analysis */}
        <div className="lg:col-span-8 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Empirical Youth Crises Documented:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedProfile.keyYouthCrises.map((crisis, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-mono text-[11px] mt-0.5">•</span>
                  <span className="leading-relaxed">{crisis}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Multi-Perspective Political Analysis */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <Scale className="w-3.5 h-3.5 text-violet-400" />
              <span>Multi-Spectrum Political & Economic Analysis:</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-0.5">Economic & Labor Analysis:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedProfile.politicalSpectrumDrivers.economicPerspective}
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="font-semibold text-violet-300 block mb-0.5">Institutional & Democratic Trust:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedProfile.politicalSpectrumDrivers.institutionalPerspective}
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="font-semibold text-amber-300 block mb-0.5">Cultural & Communal Solidarity:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedProfile.politicalSpectrumDrivers.culturalPerspective}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Injecting this profile synchronizes the 10-section 3D Brain model and formula sliders.
            </span>
            <button
              onClick={() => handleSelect(selectedProfile)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Load Profile into 3D Brain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
