import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Check,
  LogIn,
  LogOut,
  Save,
  FolderOpen,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  saveUserFormula,
  loadUserSavedFormulas,
  deleteUserSavedFormula,
  StoredFormula,
} from '../lib/firebase';
import { BrainVariable, HappinessBreakdown } from '../types/formula';
import { neuroAudio } from '../utils/audio';

interface FirebaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  breakdown: HappinessBreakdown;
  variables: BrainVariable[];
  onLoadSavedFormula: (variablesSnapshot: string, title: string) => void;
}

export const FirebaseSyncModal: React.FC<FirebaseSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  breakdown,
  variables,
  onLoadSavedFormula,
}) => {
  const [savedFormulas, setSavedFormulas] = useState<StoredFormula[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved formulas whenever user signs in or modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchSavedFormulas();
    }
  }, [isOpen, currentUser]);

  const fetchSavedFormulas = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await loadUserSavedFormulas(currentUser.uid);
      setSavedFormulas(list);
    } catch (e: any) {
      setErrorMessage('Could not load saved calibrations: ' + (e.message || String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      neuroAudio.playParadoxChime();
    } catch (e: any) {
      setErrorMessage('Sign in cancelled or failed: ' + (e.message || String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setSavedFormulas([]);
    } catch (e: any) {
      setErrorMessage('Sign out failed: ' + e.message);
    }
  };

  const handleSaveCurrentState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const title = saveTitle.trim() || `Calibration ${new Date().toLocaleDateString()}`;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const snapshot = JSON.stringify(variables.map((v) => ({ id: v.id, value: v.value })));
      await saveUserFormula(
        currentUser.uid,
        title,
        breakdown.normalizedHappiness,
        breakdown.allostaticLoad,
        breakdown.stateArchetype.title,
        snapshot
      );
      setSaveTitle('');
      setStatusMessage('Formula calibrated & saved to Cloud Firestore!');
      neuroAudio.playParadoxChime();
      await fetchSavedFormulas();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage('Failed to save formula: ' + (e.message || String(e)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this saved formula calibration?')) return;
    setIsLoading(true);
    try {
      await deleteUserSavedFormula(id);
      await fetchSavedFormulas();
      neuroAudio.playNudgePing(350);
    } catch (e: any) {
      setErrorMessage('Could not delete formula: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = (formula: StoredFormula) => {
    onLoadSavedFormula(formula.variablesSnapshot, formula.title);
    setStatusMessage(`Loaded "${formula.title}" into live brain simulator!`);
    neuroAudio.playParadoxChime();
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Firebase Cloud Persistence & Profile Sync
            </h3>
            <p className="text-xs text-slate-400">
              Sign in with Google to store bespoke brain formulas, neural calibrations, and history.
            </p>
          </div>
        </div>

        {/* User Auth Status Banner */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-9 h-9 rounded-full ring-2 ring-cyan-500/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="font-semibold text-slate-200">
                  {currentUser.displayName || 'Anonymous Explorer'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                  {currentUser.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <Cloud className="w-4 h-4 text-slate-500" />
              <span>Not signed in. Your formula is currently local only.</span>
            </div>
          )}

          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        {/* Status / Error Alerts */}
        {statusMessage && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/70 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-2.5 bg-rose-950/60 border border-rose-500/70 text-rose-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Save Current Formula Section */}
        {currentUser && (
          <form onSubmit={handleSaveCurrentState} className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-200 block">
              Save Current Brain State (H = {breakdown.normalizedHappiness}, Strain = {breakdown.allostaticLoad}%)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name this calibration (e.g., 'Late Night Focus', 'Post-Coffee Zenith')..."
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Cloud</span>
              </button>
            </div>
          </form>
        )}

        {/* Saved Calibrations List */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Saved Calibrations ({savedFormulas.length})</span>
            </span>
            {currentUser && (
              <button
                onClick={fetchSavedFormulas}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                Refresh
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {savedFormulas.length > 0 ? (
              savedFormulas.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="font-semibold text-slate-200 truncate">{item.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      H: <span className="text-cyan-400 font-bold">{item.normalizedHappiness}</span> · Strain: {item.allostaticLoad}% · {item.archetypeTitle || 'Custom'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleLoad(item)}
                      className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 rounded-md text-xs font-medium transition-colors cursor-pointer"
                      title="Load this state"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete saved formula"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center text-slate-500 text-xs">
                {currentUser
                  ? 'No saved formula calibrations yet. Save your current state above!'
                  : 'Sign in with Google to access your cloud-saved calibrations.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
