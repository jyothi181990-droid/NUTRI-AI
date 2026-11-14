import React, { useState } from 'react';
import {
  Cloud,
  Download,
  Globe,
  Shield,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LANGUAGES } from '../data/translations';
import { AmbienceMode, LanguageCode, UserSettings } from '../types/nutrition';
import { WorkspaceState } from '../utils/storage';

interface SettingsViewProps {
  settings: UserSettings;
  workspace: WorkspaceState;
  aiConfigured: boolean | null;
  onUpdateSettings: (next: Partial<UserSettings>) => void;
  onClearAllData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  workspace,
  aiConfigured,
  onUpdateSettings,
  onClearAllData,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ settings: { ...settings, soundEnabled: false }, workspace }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Indian language support, sound ambience, visual animations, and privacy controls.
        </p>
      </div>

      {/* Multilingual India */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-cyan-300" />
          <h2 className="font-display text-lg font-semibold text-white">
            Multilingual India
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onUpdateSettings({ language: lang.code as LanguageCode })}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                settings.language === lang.code
                  ? 'border-cyan-400 bg-cyan-500/20 text-white'
                  : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-semibold">{lang.nativeName}</div>
              <div className="text-[11px] text-slate-400">{lang.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Nature & Bird Sound System */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-300" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Nature & Bird Sound Effects
              </h2>
              <p className="text-xs text-slate-400">
                Original procedural Web Audio synthesis. Always OFF by default until you turn it on.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              settings.soundEnabled
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            {settings.soundEnabled ? 'Sound ON' : 'Sound OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className="space-y-1.5 text-xs">
            <span className="text-slate-400 block">Ambience Profile</span>
            <select
              value={settings.ambienceMode}
              onChange={(e) =>
                onUpdateSettings({ ambienceMode: e.target.value as AmbienceMode })
              }
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-white"
            >
              <option value="forest_birds">Morning Forest & Birds Chirping</option>
              <option value="gentle_nature">Gentle Forest Breeze</option>
              <option value="silent">Silent (UI SFX only)</option>
            </select>
          </label>

          <label className="space-y-1.5 text-xs">
            <span className="text-slate-400 flex justify-between">
              <span>Master Volume</span>
              <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({ soundVolume: Number(e.target.value) })
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </label>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.interactionSfx}
            onChange={(e) => onUpdateSettings({ interactionSfx: e.target.checked })}
            className="accent-cyan-400"
          />
          <span>Play subtle futuristic interaction chimes when sound is ON</span>
        </label>
      </section>

      {/* Accessibility & Motion */}
      <section className="glass-panel rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Accessibility & Performance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reduce background starfield, planet rotation, and transition motion for comfort or battery savings.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({ reduceAnimations: !settings.reduceAnimations })
            }
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              settings.reduceAnimations
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            {settings.reduceAnimations ? 'Animations Reduced' : 'Full Space Motion'}
          </button>
        </div>
      </section>

      {/* Optional Local Profile & Dietary Preferences */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Optional Local Preferences
        </h2>
        <p className="text-xs text-slate-400">
          Stored strictly in your browser. NutriAI does not collect or store sensitive medical records.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label className="space-y-1">
            <span className="text-slate-400">Display Name (optional)</span>
            <input
              type="text"
              placeholder="e.g., Ananya"
              value={settings.displayName}
              onChange={(e) => onUpdateSettings({ displayName: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-white"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Dietary Preference</span>
            <select
              value={settings.dietaryPreference}
              onChange={(e) =>
                onUpdateSettings({
                  dietaryPreference: e.target.value as UserSettings['dietaryPreference'],
                })
              }
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-white"
            >
              <option value="All Foods">All Foods</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Pescatarian">Pescatarian</option>
            </select>
          </label>
        </div>
      </section>

      {/* Privacy, Local Storage & External Services */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-300" />
          <h2 className="font-display text-lg font-semibold text-white">
            Privacy, Data & External Service Status
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Gemini AI Service (Backend)
            </div>
            <p className="text-slate-400 leading-relaxed">
              {aiConfigured
                ? 'Configured on the server via environment secrets. No API keys are exposed in browser code.'
                : 'Not configured on server. Built-in Demo Assistant & offline database fallbacks are active.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Cloud className="w-4 h-4 text-emerald-300" />
              Storage Architecture (Local-First)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Active: Browser IndexedDB + localStorage (free, private, offline-ready). Optional Firebase cloud sync requires provisioning a Firebase project.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {exported ? 'Backup Downloaded' : 'Export My Data (JSON)'}
          </button>

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2.5 text-xs font-medium text-rose-200 hover:bg-rose-900/40 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Remove All Saved Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await onClearAllData();
                  setConfirmClear(false);
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Confirm Erase Everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
