import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Camera,
  Database,
  Heart,
  History,
  MessageSquare,
  Search,
  ShieldAlert,
  Utensils,
} from 'lucide-react';
import { AIOrb } from '../components/AIOrb';
import { NutriLogo } from '../components/NutriLogo';
import { UI_TRANSLATIONS } from '../data/translations';
import {
  FoodItem,
  LanguageCode,
  MealLogEntry,
  NavSection,
} from '../types/nutrition';

interface HomeViewProps {
  language: LanguageCode;
  foods: FoodItem[];
  todayLogs: MealLogEntry[];
  searchHistory: string[];
  favoriteFoodIds: string[];
  aiConfigured: boolean | null;
  reduceAnimations: boolean;
  onNavigate: (section: NavSection) => void;
  onSelectFood: (food: FoodItem) => void;
  onRecordSearch: (term: string) => void;
  onOrbClick: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  foods,
  todayLogs,
  searchHistory,
  favoriteFoodIds,
  aiConfigured,
  reduceAnimations,
  onNavigate,
  onSelectFood,
  onRecordSearch,
  onOrbClick,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return foods
      .filter((f) => {
        if (f.name.toLowerCase().includes(q)) return true;
        if (f.cuisine.toLowerCase().includes(q)) return true;
        if (f.searchAliases?.some((a) => a.toLowerCase().includes(q))) return true;
        return Object.values(f.regionalNames).some(
          (rn) =>
            rn &&
            (rn.script.toLowerCase().includes(q) ||
              rn.transliteration.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  }, [foods, query]);

  const todaySummary = useMemo(() => {
    return todayLogs.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.nutrients.calories,
        proteinG: acc.proteinG + entry.nutrients.proteinG,
        carbsG: acc.carbsG + entry.nutrients.carbohydratesG,
        fatG: acc.fatG + entry.nutrients.totalFatG,
        fibreG: acc.fibreG + entry.nutrients.fibreG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0 }
    );
  }, [todayLogs]);

  const handleSearchPick = (food: FoodItem) => {
    onRecordSearch(food.name);
    onSelectFood(food);
    onNavigate('nutrition');
  };

  return (
    <div className="space-y-8">
      {/* Hero Command Deck */}
      <section className="glass-panel-elevated rounded-2xl p-6 md:p-10 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <NutriLogo tagline={t.tagline} />

            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white leading-[1.12] max-w-2xl">
              {t.heroTitle}
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
              {t.heroSubtitle}
            </p>

            {/* Universal Multilingual Search */}
            <div className="relative max-w-2xl">
              <div className="flex items-center rounded-xl border border-cyan-400/30 bg-slate-950/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
                <Search className="w-5 h-5 text-cyan-300 shrink-0 mr-3" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  className="w-full bg-transparent text-sm md:text-base text-white placeholder:text-slate-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-xs text-slate-400 hover:text-white px-2 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search Dropdown Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 rounded-xl glass-panel-elevated shadow-2xl z-20 divide-y divide-slate-800/80 overflow-hidden">
                  {suggestions.map((item) => {
                    const regional = item.regionalNames[language];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSearchPick(item)}
                        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {item.name}
                            {regional ? ` · ${regional.script} (${regional.transliteration})` : ''}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.cuisine} · {item.category} · {item.servingSizeLabel}
                          </div>
                        </div>
                        <div className="font-mono text-xs tabular-nums text-cyan-300 shrink-0">
                          {item.per100g.calories} kcal/100g
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <History className="w-3.5 h-3.5" />
                    Recent:
                  </span>
                  {searchHistory.slice(0, 5).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('scanner')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                {t.scanFoodBtn}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('assistant')}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/15 px-5 py-3 text-sm font-semibold text-violet-100 hover:bg-violet-500/25 transition-all whitespace-nowrap cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                {t.askAiBtn}
              </button>
            </div>
          </div>

          {/* Interactive AI Orb Showcase */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-4">
            <AIOrb
              size={156}
              active
              reduceAnimations={reduceAnimations}
              onClick={onOrbClick}
              ariaLabel="Open NutriAI Assistant"
            />
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">
                NutriAI Core Intelligence
              </div>
              <div className="text-xs text-slate-400">
                {aiConfigured === true
                  ? 'Connected to Gemini Vision & Chat'
                  : aiConfigured === false
                    ? 'Demo Assistant Active · Offline Database Ready'
                    : 'Checking AI Service...'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food Safety Essential Notice */}
      <section className="glass-panel rounded-xl px-5 py-4 flex items-start gap-3.5 border-amber-400/25">
        <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-slate-300 leading-relaxed">
          <span className="font-semibold text-amber-200">Food Safety Reminder: </span>
          {t.safetyBanner}
        </div>
        <button
          type="button"
          onClick={() => onNavigate('safety')}
          className="text-xs font-medium text-amber-300 hover:text-amber-200 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Safety Centre →
        </button>
      </section>

      {/* 4 Core Workspace Modules */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <button
          type="button"
          onClick={() => onNavigate('scanner')}
          className="holo-card rounded-2xl p-5 text-left flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg font-semibold text-white">
              Food Camera & Label Reader
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Capture meals or packaged labels, review visual uncertainty and safety warnings, and confirm label text before saving.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300">
            Open Scanner <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('nutrition')}
          className="holo-card rounded-2xl p-5 text-left flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg font-semibold text-white">
              20-Nutrient Composition
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Inspect verified USDA & NIN IFCT values per serving and per 100g, compare two foods side-by-side, and track data quality.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
            Explore Nutrients <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('recipes')}
          className="holo-card rounded-2xl p-5 text-left flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-300">
              <Utensils className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg font-semibold text-white">
              Global & Indian Recipe Studio
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Browse Telangana, Andhra, South & North Indian, and 10+ world cuisines or build custom recipes with live ingredient math.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300">
            Open Studio <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="holo-card rounded-2xl p-5 text-left flex flex-col justify-between gap-4 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="font-display text-lg font-semibold text-white">
              Today&apos;s Nourishment Log
            </h2>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs tabular-nums">
              <div className="text-slate-300">
                Energy: <span className="text-white font-semibold">{Math.round(todaySummary.calories)} kcal</span>
              </div>
              <div className="text-slate-300">
                Protein: <span className="text-cyan-300 font-semibold">{todaySummary.proteinG.toFixed(1)} g</span>
              </div>
              <div className="text-slate-300">
                Carbs: <span className="text-violet-300 font-semibold">{todaySummary.carbsG.toFixed(1)} g</span>
              </div>
              <div className="text-slate-300">
                Fibre: <span className="text-emerald-300 font-semibold">{todaySummary.fibreG.toFixed(1)} g</span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300">
            {todayLogs.length} meals today · {favoriteFoodIds.length} favourites <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </section>
    </div>
  );
};
