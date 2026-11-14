import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { FOOD_SAFETY_GUIDES } from '../data/safety';

export const FoodSafetyView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(FOOD_SAFETY_GUIDES[0].id);
  const active = FOOD_SAFETY_GUIDES.find((g) => g.id === selectedId) || FOOD_SAFETY_GUIDES[0];

  return (
    <div className="space-y-6">
      <div className="glass-panel-elevated rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-300">
          <ShieldCheck className="w-6 h-6" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Food Safety Centre
          </h1>
        </div>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Evidence-based kitchen hygiene, refrigeration science, expiry label literacy, allergen protection, and why visual appearance alone can never establish food safety.
        </p>
      </div>

      {/* Topic Selector + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2.5">
          {FOOD_SAFETY_GUIDES.map((guide, idx) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => setSelectedId(guide.id)}
              className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                guide.id === active.id
                  ? 'glass-panel-elevated border-cyan-400/50 text-white'
                  : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              <div className="text-xs font-mono text-cyan-300">0{idx + 1}</div>
              <div className="font-display text-sm font-semibold mt-0.5">{guide.title}</div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 glass-panel-elevated rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="font-display text-2xl font-bold text-white">{active.title}</h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">{active.summary}</p>

          <ul className="space-y-3 text-sm text-slate-200 leading-relaxed">
            {active.keyPoints.map((pt, i) => (
              <li
                key={i}
                className="rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3"
              >
                {pt}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-amber-400/35 bg-amber-950/30 p-4 flex items-start gap-3 text-sm text-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>{active.criticalRule}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
