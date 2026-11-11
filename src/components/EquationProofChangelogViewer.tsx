import React, { useState } from 'react';
import {
  BookOpen,
  History,
  FileCheck2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  Layers,
  Activity,
  Award,
  Calendar,
  Tag,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  EQUATION_PORTIONS,
  MASTER_EQUATION_CHANGELOG,
  CITATION_SOURCES_DATABASE,
  EquationPortion,
  EquationChangelogEntry,
  CitationSource,
} from '../data/equationPortionsAndChangelog';
import { HappinessBreakdown, BrainVariable } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface EquationProofChangelogViewerProps {
  breakdown: HappinessBreakdown;
  variables: BrainVariable[];
  onSelectVariable?: (variableId: string) => void;
}

export const EquationProofChangelogViewer: React.FC<EquationProofChangelogViewerProps> = ({
  breakdown,
  variables,
  onSelectVariable,
}) => {
  const [activeTab, setActiveTab] = useState<'portions' | 'changelog' | 'all_sources'>('portions');
  const [selectedPortionId, setSelectedPortionId] = useState<string>('neuro_substrate');
  const [changelogFilter, setChangelogFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  const selectedPortion = EQUATION_PORTIONS.find((p) => p.id === selectedPortionId) || EQUATION_PORTIONS[0];

  const handleCopyCitation = (citation: CitationSource) => {
    const text = `${citation.authors} (${citation.year}). ${citation.title}. ${citation.publication}. ${
      citation.doi ? `doi: ${citation.doi}` : citation.url
    }`;
    navigator.clipboard.writeText(text);
    setCopiedCitationId(citation.id);
    neuroAudio.playNudgePing(640);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const filteredChangelog = MASTER_EQUATION_CHANGELOG.filter((entry) => {
    if (changelogFilter !== 'ALL' && entry.changeType !== changelogFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.version.toLowerCase().includes(q) ||
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.termAffected.toLowerCase().includes(q) ||
      entry.empiricalRationale.toLowerCase().includes(q)
    );
  });

  const allCitationsList = Object.values(CITATION_SOURCES_DATABASE).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.authors.toLowerCase().includes(q) ||
      c.publication.toLowerCase().includes(q) ||
      c.keyFindingSummary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-600/50 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Equation Proofs, Peer-Reviewed Citations & Formal Changelog</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Verified v4.2.1
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Every mathematical term is explicitly derived from peer-reviewed neurophysiology, WHO psychiatric guidelines, and clinical behavioral literature. No arbitrary guesswork—each coefficient has an auditable rationale, DOI link, and historical changelog.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('portions')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'portions'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Equation Portions (8)</span>
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'changelog'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Changelog ({MASTER_EQUATION_CHANGELOG.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all_sources')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all_sources'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Citation Bibliography ({allCitationsList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EQUATION PORTIONS EXPLORER */}
      {activeTab === 'portions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Portion Selector List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between pb-1">
              <span>Equation Terms & Sub-Functions</span>
              <span className="text-[10px] text-slate-500">Click to inspect</span>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {EQUATION_PORTIONS.map((portion) => {
                const isSelected = portion.id === selectedPortionId;
                return (
                  <button
                    key={portion.id}
                    onClick={() => {
                      setSelectedPortionId(portion.id);
                      neuroAudio.playNudgePing(480);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {portion.symbol}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400 capitalize">
                        {portion.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-100 mt-1">
                      {portion.name}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 mt-1.5 truncate bg-slate-950 px-2 py-1 rounded-md border border-slate-900">
                      {portion.latexExpression}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      <span>{portion.citations.length} Verified Papers</span>
                      <span>·</span>
                      <span>{portion.changelog.length} Changelog Revisions</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep-Dive Portions Card */}
          <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-5">
            {/* Term Title & Formula Header */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-700/50">
                  {selectedPortion.symbol}
                </span>
                <span className="text-xs text-slate-400">
                  Formula Role: <strong className="text-slate-200">{selectedPortion.formulaRole}</strong>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-2">
                {selectedPortion.name}
              </h3>

              {/* Formula Display Box */}
              <div className="mt-3 p-3.5 bg-slate-900 rounded-xl border border-slate-800/80 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto shadow-inner">
                {selectedPortion.latexExpression}
              </div>

              <div className="text-[11px] text-slate-400 font-mono mt-1.5">
                Parameters / Weights: <span className="text-slate-300">{selectedPortion.defaultWeightOrExponent}</span>
              </div>
            </div>

            {/* Mechanics & Clinical Significance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  MATHEMATICAL BEHAVIOR
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {selectedPortion.mathematicalBehavior}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  NEUROBIOLOGICAL MECHANISM
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {selectedPortion.neurobiologicalMechanism}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400 font-mono text-[11px] block uppercase mb-1">
                Clinical Significance:
              </strong>
              {selectedPortion.clinicalSignificance}
            </div>

            {/* Citations & Evidence Sources */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Peer-Reviewed Backing Sources ({selectedPortion.citations.length})</span>
                </h4>
                <span className="text-[10px] text-slate-400">Click to copy citation or visit DOI</span>
              </div>

              <div className="space-y-2.5">
                {selectedPortion.citations.map((cite) => {
                  const isCopied = copiedCitationId === cite.id;
                  return (
                    <div
                      key={cite.id}
                      className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 font-medium">
                              {cite.evidenceLevel}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {cite.year}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-100 mt-1">
                            {cite.title}
                          </h5>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            <strong>{cite.authors}</strong> · <em>{cite.publication}</em>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopyCitation(cite)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy APA Citation"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Open DOI or Official Source"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-900">
                        <strong className="text-slate-400">Key Finding:</strong> {cite.keyFindingSummary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITABLE CHANGELOG TIMELINE */}
      {activeTab === 'changelog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search changelog versions, terms, rationale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {(['ALL', 'CLINICAL_GROUNDING', 'MATHEMATICAL_REFINEMENT', 'ADDITION'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChangelogFilter(type)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] whitespace-nowrap border ${
                    changelogFilter === type
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5">
            {filteredChangelog.map((entry) => {
              const primaryCite = CITATION_SOURCES_DATABASE[entry.primaryCitationId];
              return (
                <div key={`${entry.version}-${entry.title}`} className="relative group">
                  {/* Timeline Node */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-amber-400 group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-700/60">
                          {entry.version}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                          {entry.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{entry.date}</span>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 uppercase font-mono text-[9px] text-slate-300">
                          {entry.changeType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      {entry.description}
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="font-mono text-cyan-400 font-semibold">Empirical Rationale: </span>
                      {entry.empiricalRationale}
                    </div>

                    {primaryCite && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                        <span>
                          Source: <strong className="text-slate-300">{primaryCite.title}</strong> ({primaryCite.year})
                        </span>
                        <a
                          href={primaryCite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <span>View Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FULL CITATION BIBLIOGRAPHY */}
      {activeTab === 'all_sources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 pb-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search authors, journal, WHO publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Showing {allCitationsList.length} peer-reviewed references
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {allCitationsList.map((cite) => {
              const isCopied = copiedCitationId === cite.id;
              return (
                <div
                  key={cite.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 font-medium">
                        {cite.evidenceLevel}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {cite.year}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 mt-2">
                      {cite.title}
                    </h4>

                    <div className="text-xs text-slate-400 mt-1">
                      <strong>{cite.authors}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 italic mt-0.5">
                      {cite.publication}
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                      {cite.keyFindingSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleCopyCitation(cite)}
                      className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied APA' : 'Copy APA Citation'}</span>
                    </button>

                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                    >
                      <span>{cite.doi ? `doi:${cite.doi}` : 'Official Publication'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
