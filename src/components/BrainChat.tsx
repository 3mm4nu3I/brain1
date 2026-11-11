import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Search,
  MapPin,
  Bot,
  User as UserIcon,
  Loader2,
  ExternalLink,
  Minimize2,
  Maximize2,
  Trash2,
  Cpu,
  Brain,
  ShieldCheck,
  Activity,
  Heart,
  HelpCircle,
  TrendingUp,
  Download,
  Share2,
} from 'lucide-react';
import { HappinessBreakdown, BrainVariable } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  webSources?: Array<{ title: string; uri: string }>;
  mapSources?: Array<{ title: string; uri: string }>;
  modelUsed?: string;
  persona?: string;
}

interface BrainChatProps {
  breakdown: HappinessBreakdown;
  variables?: BrainVariable[];
  isFloating?: boolean;
  isOpenFloating?: boolean;
  onToggleFloating?: () => void;
}

export const BrainChat: React.FC<BrainChatProps> = ({
  breakdown,
  variables = [],
  isFloating = false,
  isOpenFloating = false,
  onToggleFloating,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('search');
  const [persona, setPersona] = useState<'neuroscientist' | 'mathematician' | 'habit_counselor'>('neuroscientist');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      role: 'model',
      text: `🧠 **Welcome to BrainChat.** I am your AI Neuro-Mathematical & Clinical Happiness Oracle.\n\nYour live simulator state is running at **${breakdown.normalizedHappiness} H** with **${breakdown.allostaticLoad}% allostatic strain** (${breakdown.stateArchetype.title}). Synaptic integrity is **${breakdown.synapticIntegrity}%**, and WHO-5 Well-Being stands at **${breakdown.whoWellBeingIndex} / 100**.\n\nYou can ask me to mathematically audit any portion of the equation, explain WHO citations, analyze caffeine withdrawal kinetics, or search live literature and local resources!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: 'neuroscientist',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Request browser location if maps grounding is selected
  useEffect(() => {
    if (groundingMode === 'maps' && !userLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation access not granted, using general location:', err.message);
        }
      );
    }
  }, [groundingMode, userLocation]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    neuroAudio.playNudgePing(520);

    try {
      const contentsPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      let personaInstruction = '';
      if (persona === 'mathematician') {
        personaInstruction = 'Adopt the perspective of an elite neuro-mathematics theorist. Emphasize partial derivatives ∂H/∂v, non-linear power-laws, exponent limits, and mathematical proofs for equation terms.';
      } else if (persona === 'habit_counselor') {
        personaInstruction = 'Adopt the perspective of an expert clinical substance and habit counselor. Focus on Koob-Volkow opponent process kinetics, caffeine half-life (Juliano 2004), Starbucks financial leakage, and dopamine receptor recovery.';
      } else {
        personaInstruction = 'Adopt the perspective of a Senior Neuroscientist grounded in the WHO World Mental Health Report 2022, McEwen allostasis, and Sapolsky glucocorticoid literature. Balance compassionate clinical communication with rigorous citations.';
      }

      const systemInstruction = `You are BrainChat: The AI Neuro-Mathematical Oracle & Clinical Happiness System.
Current User Telemetry:
- Happiness Level: ${breakdown.normalizedHappiness} / 100 H
- Allostatic Strain: ${breakdown.allostaticLoad}%
- Archetype State: ${breakdown.stateArchetype.title}
- Synaptic Integrity: ${breakdown.synapticIntegrity}%
- BDNF Plasticity: ${breakdown.bdnfLevel} ng/mL
- Microglial Neuroinflammation: ${breakdown.microglialInflammation}%
- WHO-5 Well-Being: ${breakdown.whoWellBeingIndex} / 100.

Active Persona: ${personaInstruction}

Formatting rules:
- Provide clear, empirical, peer-reviewed answers.
- Reference verified citations (e.g. Schultz 1998 for dopamine, McEwen 1998 for allostasis, Koob 2001 for opponent-process, WHO 2022).
- When asked about formula terms, explain the exact mathematical notation and biological mechanism.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contentsPayload,
          systemInstruction,
          groundingMode,
          userLocation,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const modelMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'model',
        text: data.text || 'No response returned from the neural engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        webSources: data.webSources,
        mapSources: data.mapSources,
        modelUsed: data.model,
        persona,
      };

      setMessages((prev) => [...prev, modelMsg]);
      neuroAudio.playParadoxChime();
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: `⚠️ **BrainChat Consultation Note:** ${err.message || 'Unable to connect to neural inference server.'} Ensure network availability or retry in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        text: 'BrainChat conversation thread reset. Ask any question about your neural state, formula proofs, or clinical research.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona,
      },
    ]);
  };

  const promptSuggestions = [
    'Explain the mathematical proof of the Opponent-Process term b(τ)',
    'Why does cortisol have a 1.4 non-linear exponent under Sapolsky?',
    'Search 2024 WHO reports on youth mental health resilience',
    'How do coffee withdrawal hours shift the allostatic set-point?',
    'What daily interventions maximize BDNF neurogenesis without medication?',
    'Find nearby mental health centers or parks for stress reduction',
  ];

  // Render floating launcher if in floating mode and closed
  if (isFloating && !isOpenFloating) {
    return (
      <button
        onClick={onToggleFloating}
        className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2.5 border-2 border-slate-950/80 group"
        title="Open BrainChat AI Oracle"
      >
        <div className="relative">
          <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-950 animate-ping" />
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-xs font-bold tracking-tight">BrainChat</span>
          <span className="text-[9px] font-mono opacity-80">AI Oracle · Live</span>
        </div>
      </button>
    );
  }

  // Floating Drawer Mode
  if (isFloating && isOpenFloating) {
    return (
      <div className="fixed bottom-5 right-5 z-50 w-full sm:w-[480px] h-[650px] max-h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Floating Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>BrainChat Neural Console</span>
                <span className="text-[10px] font-mono text-cyan-400 font-normal">v4.2</span>
              </h3>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>State: {breakdown.normalizedHappiness} H</span>
                <span>·</span>
                <span className="text-emerald-400">Live Telemetry Linked</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleFloating}
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Minimize BrainChat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mini Controls */}
        <div className="bg-slate-950/60 px-3 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 text-[10px] focus:outline-hidden focus:border-cyan-500 cursor-pointer"
            >
              <option value="neuroscientist">Clinical Neuroscientist</option>
              <option value="mathematician">Formula Mathematician</option>
              <option value="habit_counselor">Caffeine & Habit Counselor</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setGroundingMode(groundingMode === 'search' ? 'none' : 'search')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                groundingMode === 'search'
                  ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Ground with Google Search data"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>

            <button
              onClick={() => setGroundingMode(groundingMode === 'maps' ? 'none' : 'maps')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                groundingMode === 'maps'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Ground with Google Maps locations"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-950/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-medium'
                    : 'bg-slate-900/95 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.webSources && m.webSources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                    <span className="font-mono text-cyan-400 block font-semibold">Web Sources Grounded:</span>
                    {m.webSources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center text-cyan-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="animate-pulse">Auditing neural formula & citations...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask BrainChat about formulas, citations, or your brain state..."
              rows={2}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 resize-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full-Width Studio Section Mode
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-600/50 text-cyan-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>BrainChat: Neuro-Mathematical Oracle & Clinical AI Consultant</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Live Synaptic Link
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Real-time interactive intelligence grounded directly in your 36+ live brain variables, formula partial derivatives, WHO clinical benchmarks, and peer-reviewed citations. Backed by Google Search and Google Maps grounding tools.
          </p>
        </div>

        {/* Model, Persona & Grounding Control Strip */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="neuroscientist">Clinical Neuroscientist (WHO/McEwen)</option>
              <option value="mathematician">Formula Mathematician (Derivatives)</option>
              <option value="habit_counselor">Caffeine & Habit Counselor (Koob/Juliano)</option>
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
            </select>
          </div>

          {/* Grounding Mode Buttons */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setGroundingMode(groundingMode === 'search' ? 'none' : 'search')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 font-medium ${
                groundingMode === 'search'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Google Search Grounding"
            >
              <Search className="w-3 h-3" />
              <span>Search Grounding</span>
            </button>
            <button
              onClick={() => setGroundingMode(groundingMode === 'maps' ? 'none' : 'maps')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 font-medium ${
                groundingMode === 'maps'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Google Maps Geographic Grounding"
            >
              <MapPin className="w-3 h-3" />
              <span>Maps</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Telemetry & Quick Action Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Telemetry Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                LIVE BRAIN STATE TELEMETRY
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Happiness Score</span>
                <span className="text-lg font-bold font-mono text-cyan-300">{breakdown.normalizedHappiness} H</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Allostatic Strain</span>
                <span className="text-lg font-bold font-mono text-amber-400">{breakdown.allostaticLoad}%</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">WHO-5 Index</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{breakdown.whoWellBeingIndex}/100</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">BDNF Neurogenesis</span>
                <span className="text-lg font-bold font-mono text-teal-300">{breakdown.bdnfLevel} ng/mL</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-slate-200">Current Archetype:</strong> {breakdown.stateArchetype.title}
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Synaptic Integrity: {breakdown.synapticIntegrity}% · Microglial Load: {breakdown.microglialInflammation}%
              </div>
            </div>
          </div>

          {/* Quick Query Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
              Suggested Clinical & Proof Queries
            </span>
            <div className="space-y-1.5">
              {promptSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chat Console */}
        <div className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col h-[580px] overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cyan-600 text-slate-950 font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                  {/* Web Sources Grounding Badges */}
                  {m.webSources && m.webSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono text-cyan-400 block font-semibold">
                        Grounded Web Sources & Literature:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.webSources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-cyan-300 hover:text-white flex items-center gap-1.5 max-w-[280px] truncate"
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{s.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maps Sources Grounding Badges */}
                  {m.mapSources && m.mapSources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                        Local Geographic Resources Found:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.mapSources.map((loc, idx) => (
                          <a
                            key={idx}
                            href={loc.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-emerald-300 hover:text-white flex items-center gap-1.5 max-w-[280px] truncate"
                          >
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                            <span className="truncate">{loc.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-[9px] text-slate-500 font-mono flex items-center justify-between">
                    <span>{m.timestamp}</span>
                    {m.modelUsed && <span>Model: {m.modelUsed}</span>}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-cyan-400 text-xs p-3 bg-slate-900/60 rounded-xl border border-slate-800 max-w-sm">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="animate-pulse">Consulting neural theorems, WHO guidelines & PubMed...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Console Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Press <strong className="text-slate-400">Enter</strong> to send, <strong className="text-slate-400">Shift+Enter</strong> for new line</span>
              <button
                onClick={clearChat}
                className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask BrainChat anything about the happiness theorem, citations, caffeine withdrawal, or your current brain state..."
                rows={2}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 resize-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="px-5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Consult</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
