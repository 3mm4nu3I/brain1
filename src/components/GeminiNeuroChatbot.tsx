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
} from 'lucide-react';
import { HappinessBreakdown } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  webSources?: Array<{ title: string; uri: string }>;
  mapSources?: Array<{ title: string; uri: string }>;
  modelUsed?: string;
}

interface GeminiNeuroChatbotProps {
  breakdown: HappinessBreakdown;
}

export const GeminiNeuroChatbot: React.FC<GeminiNeuroChatbotProps> = ({ breakdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('search');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your Neuro-Mathematical Oracle & Clinical Happiness Consultant. Your brain is currently operating at **${breakdown.normalizedHappiness} H** with **${breakdown.allostaticLoad}% allostatic strain** (${breakdown.stateArchetype.title}). You can ask me about neurochemical pathways, WHO evidence, or search for live research and nearby mental health resources!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
      // Build conversation history for multi-turn chat
      const contentsPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const systemInstruction = `You are the Grand Neuro-Mathematical Oracle and Clinical Brain Happiness Consultant. The user's live brain simulator state is:
- Happiness Index: ${breakdown.normalizedHappiness} / 100 H
- Allostatic Strain: ${breakdown.allostaticLoad}%
- Archetype: ${breakdown.stateArchetype.title}
- Synaptic Integrity: ${breakdown.synapticIntegrity}%
- BDNF Level: ${breakdown.bdnfLevel} ng/mL
- Microglial Inflammation: ${breakdown.microglialInflammation}%
- WHO-5 Well-Being Index: ${breakdown.whoWellBeingIndex} / 100.
Ground your answers with empirical neuroscience, WHO clinical criteria, and peer-reviewed literature. When using search or maps, provide concise, clear findings with context.`;

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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const modelMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'model',
        text: data.text || 'No response received from the oracle.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        webSources: data.webSources,
        mapSources: data.mapSources,
        modelUsed: data.model,
      };

      setMessages((prev) => [...prev, modelMsg]);
      neuroAudio.playParadoxChime();
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: `⚠️ **Consultation Error:** ${err.message || 'Could not communicate with the neural oracle.'}`,
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
        text: 'Conversation reset. Ask me anything about your brain formulas or mental health science.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const promptSuggestions = [
    'How do cortisol and adenosine cause allostatic collapse under Sapolsky?',
    'Search 2024 WHO reports on youth mental health resilience.',
    'Find nearby parks or nature areas to reduce neuroinflammation.',
    'Explain the Starbucks caffeine withdrawal curve vs. workday morale.',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2.5 border-2 border-slate-950/80"
          title="Open Gemini Neuro-Oracle Chatbot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-950 animate-ping" />
          </div>
          <span className="text-xs tracking-tight">Gemini Neuro-Consultant</span>
        </button>
      )}

      {/* Main Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full sm:w-[460px] h-[620px] max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Gemini Neuro-Oracle</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-normal">v3.5</span>
                </h3>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Brain State: {breakdown.normalizedHappiness} H</span>
                  <span>·</span>
                  <span className="text-emerald-400">Live</span>
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
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model & Grounding Tool Controls Bar */}
          <div className="bg-slate-950/60 px-3 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
            {/* Model Selector */}
            <div className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 text-[10px] focus:outline-hidden focus:border-cyan-500 cursor-pointer"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep)</option>
              </select>
            </div>

            {/* Grounding Selector */}
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
                title="Ground with Google Maps geographic places"
              >
                <MapPin className="w-3 h-3" />
                <span>Maps</span>
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-slate-950 rounded-br-xs font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-[11px] sm:text-xs">
                    {msg.text}
                  </div>

                  {/* Web Sources Citations from Google Search Grounding */}
                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Search className="w-3 h-3 text-cyan-400" />
                        <span>Google Search Sources:</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.webSources.slice(0, 3).map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded text-[10px] border border-slate-700/80 truncate max-w-[200px]"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Map Sources Citations from Google Maps Grounding */}
                  {msg.mapSources && msg.mapSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Google Maps Locations:</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.mapSources.slice(0, 3).map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded text-[10px] border border-emerald-800/80 truncate max-w-[200px]"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] font-mono ${
                      msg.role === 'user' ? 'text-cyan-950/70 text-right' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp} {msg.modelUsed && `· ${msg.modelUsed}`}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-700 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Consulting Gemini & grounding knowledge...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto text-[10px]">
              {promptSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <div className="flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5 focus-within:border-cyan-500">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask the Oracle (${groundingMode !== 'none' ? `${groundingMode} grounded` : 'standard'})...`}
                rows={2}
                className="flex-1 bg-transparent border-0 text-slate-100 placeholder:text-slate-600 text-xs resize-none p-1.5 focus:outline-hidden"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
              <span>Shift+Enter for newline</span>
              <span>Grounding: {groundingMode}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
