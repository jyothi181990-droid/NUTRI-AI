import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Heart,
  Info,
  Plus,
  Scale,
} from 'lucide-react';
import {
  FoodItem,
  LanguageCode,
  MealSlot,
  NutrientProfile,
} from '../types/nutrition';
import { scaleNutrients } from '../utils/storage';

interface NutritionViewProps {
  foods: FoodItem[];
  selectedFood: FoodItem;
  language: LanguageCode;
  favoriteFoodIds: string[];
  onSelectFood: (food: FoodItem) => void;
  onToggleFavorite: (foodId: string) => void;
  onLogMeal: (food: FoodItem, grams: number, slot: MealSlot) => void;
}

interface NutrientRowSpec {
  key: keyof NutrientProfile;
  label: string;
  unit: string;
  refDaily?: number;
  group: 'Macro & Energy' | 'Minerals' | 'Vitamins';
}

const NUTRIENT_SPECS: NutrientRowSpec[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', refDaily: 2000, group: 'Macro & Energy' },
  { key: 'carbohydratesG', label: 'Carbohydrates', unit: 'g', refDaily: 275, group: 'Macro & Energy' },
  { key: 'proteinG', label: 'Protein', unit: 'g', refDaily: 50, group: 'Macro & Energy' },
  { key: 'totalFatG', label: 'Total Fat', unit: 'g', refDaily: 78, group: 'Macro & Energy' },
  { key: 'saturatedFatG', label: 'Saturated Fat', unit: 'g', refDaily: 20, group: 'Macro & Energy' },
  { key: 'transFatG', label: 'Trans Fat', unit: 'g', group: 'Macro & Energy' },
  { key: 'fibreG', label: 'Dietary Fibre', unit: 'g', refDaily: 28, group: 'Macro & Energy' },
  { key: 'totalSugarG', label: 'Total Sugar', unit: 'g', group: 'Macro & Energy' },
  { key: 'addedSugarG', label: 'Added Sugar', unit: 'g', refDaily: 50, group: 'Macro & Energy' },
  { key: 'sodiumMg', label: 'Sodium', unit: 'mg', refDaily: 2300, group: 'Minerals' },
  { key: 'potassiumMg', label: 'Potassium', unit: 'mg', refDaily: 4700, group: 'Minerals' },
  { key: 'calciumMg', label: 'Calcium', unit: 'mg', refDaily: 1000, group: 'Minerals' },
  { key: 'ironMg', label: 'Iron', unit: 'mg', refDaily: 18, group: 'Minerals' },
  { key: 'magnesiumMg', label: 'Magnesium', unit: 'mg', refDaily: 420, group: 'Minerals' },
  { key: 'zincMg', label: 'Zinc', unit: 'mg', refDaily: 11, group: 'Minerals' },
  { key: 'vitaminAMcg', label: 'Vitamin A', unit: 'mcg', refDaily: 900, group: 'Vitamins' },
  { key: 'vitaminB12Mcg', label: 'Vitamin B12', unit: 'mcg', refDaily: 2.4, group: 'Vitamins' },
  { key: 'vitaminCMg', label: 'Vitamin C', unit: 'mg', refDaily: 90, group: 'Vitamins' },
  { key: 'vitaminDMcg', label: 'Vitamin D', unit: 'mcg', refDaily: 20, group: 'Vitamins' },
  { key: 'folateMcg', label: 'Folate', unit: 'mcg', refDaily: 400, group: 'Vitamins' },
];

export const NutritionView: React.FC<NutritionViewProps> = ({
  foods,
  selectedFood,
  language,
  favoriteFoodIds,
  onSelectFood,
  onToggleFavorite,
  onLogMeal,
}) => {
  const [basis, setBasis] = useState<'serving' | '100g' | 'custom'>('serving');
  const [customGrams, setCustomGrams] = useState<number>(selectedFood.servingWeightGrams);
  const [mealSlot, setMealSlot] = useState<MealSlot>('Lunch');
  const [loggedFeedback, setLoggedFeedback] = useState(false);
  const [compareFoodId, setCompareFoodId] = useState<string>(
    foods.find((f) => f.id !== selectedFood.id)?.id || selectedFood.id
  );

  const activeGrams =
    basis === '100g'
      ? 100
      : basis === 'serving'
        ? selectedFood.servingWeightGrams
        : Math.max(1, customGrams);

  const scaled = useMemo(
    () => scaleNutrients(selectedFood.per100g, activeGrams),
    [selectedFood, activeGrams]
  );

  const compareFood = useMemo(
    () => foods.find((f) => f.id === compareFoodId) || foods[0],
    [foods, compareFoodId]
  );

  const isFav = favoriteFoodIds.includes(selectedFood.id);
  const regional = selectedFood.regionalNames[language];

  return (
    <div className="space-y-6">
      {/* Top Selector & Actions */}
      <div className="glass-panel-elevated rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-cyan-300 font-medium">
              {selectedFood.cuisine} · {selectedFood.category} ·{' '}
              {selectedFood.dataQuality === 'verified'
                ? 'Verified Reference Data'
                : 'Composite Culinary Estimate'}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              {selectedFood.name}
              {regional ? ` · ${regional.script}` : ''}
            </h1>
            <p className="text-xs text-slate-400">
              Source: {selectedFood.source}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Choose food to inspect"
              value={selectedFood.id}
              onChange={(e) => {
                const found = foods.find((f) => f.id === e.target.value);
                if (found) {
                  onSelectFood(found);
                  setCustomGrams(found.servingWeightGrams);
                }
              }}
              className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none max-w-[230px]"
            >
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onToggleFavorite(selectedFood.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                isFav
                  ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400 text-rose-400' : ''}`} />
              {isFav ? 'Saved' : 'Favourite'}
            </button>
          </div>
        </div>

        {/* Portion Basis Controls + Log to Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBasis('serving')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                basis === 'serving'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              1 Serving ({selectedFood.servingSizeLabel} · {selectedFood.servingWeightGrams}g)
            </button>
            <button
              type="button"
              onClick={() => setBasis('100g')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                basis === '100g'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Per 100g
            </button>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="number"
                min={1}
                max={2000}
                value={basis === 'custom' ? customGrams : activeGrams}
                onChange={(e) => {
                  setBasis('custom');
                  setCustomGrams(Number(e.target.value) || 100);
                }}
                aria-label="Custom weight in grams"
                className="w-16 bg-transparent font-mono text-xs text-white focus:outline-none tabular-nums"
              />
              <span className="text-xs text-slate-400">g</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Meal slot"
              value={mealSlot}
              onChange={(e) => setMealSlot(e.target.value as MealSlot)}
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <button
              type="button"
              onClick={() => {
                onLogMeal(selectedFood, activeGrams, mealSlot);
                setLoggedFeedback(true);
                setTimeout(() => setLoggedFeedback(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log {activeGrams}g to {mealSlot}
            </button>
            {loggedFeedback && (
              <span className="text-xs text-emerald-300 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Added
              </span>
            )}
          </div>
        </div>

        {/* Uncertainty Note */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
          <div>
            <strong>Data Quality & Uncertainty:</strong> {selectedFood.uncertaintyNote} Fields marked{' '}
            <span className="font-mono text-slate-400">Not reported</span> are withheld from source data rather than fabricated.
          </div>
        </div>
      </div>

      {/* Complete 20-Nutrient Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(['Macro & Energy', 'Minerals', 'Vitamins'] as const).map((group) => {
          const rows = NUTRIENT_SPECS.filter((n) => n.group === group);
          return (
            <div key={group} className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h2 className="font-display text-base font-semibold text-white">
                  {group}
                </h2>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {activeGrams}g basis
                </span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {rows.map((spec) => {
                  const val = scaled[spec.key];
                  const pct =
                    val !== null && spec.refDaily
                      ? Math.min(100, Math.round((val / spec.refDaily) * 100))
                      : null;
                  return (
                    <div key={spec.key} className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-slate-300">{spec.label}</span>
                        <span className="font-mono font-semibold text-white tabular-nums">
                          {val === null ? (
                            <span className="text-xs font-normal text-slate-500">
                              Not reported
                            </span>
                          ) : (
                            <>
                              {val}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                {spec.unit}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                      {pct !== null && (
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Food Comparison Tool */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-violet-300" />
            <h2 className="font-display text-lg font-semibold text-white">
              Side-by-Side Food Comparison (Per 100g)
            </h2>
          </div>
          <select
            aria-label="Compare against food"
            value={compareFood.id}
            onChange={(e) => setCompareFoodId(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-violet-400 focus:outline-none"
          >
            {foods.map((f) => (
              <option key={f.id} value={f.id}>
                Compare with: {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Nutrient (per 100g)</th>
                <th className="py-2.5 px-4 font-medium text-cyan-300">{selectedFood.name}</th>
                <th className="py-2.5 pl-4 font-medium text-violet-300">{compareFood.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {NUTRIENT_SPECS.slice(0, 14).map((spec) => {
                const a = selectedFood.per100g[spec.key];
                const b = compareFood.per100g[spec.key];
                return (
                  <tr key={spec.key} className="hover:bg-slate-900/40">
                    <td className="py-2 pr-4 font-sans text-slate-300">{spec.label}</td>
                    <td className="py-2 px-4 text-white">
                      {a === null ? 'Not reported' : `${a} ${spec.unit}`}
                    </td>
                    <td className="py-2 pl-4 text-slate-200">
                      {b === null ? 'Not reported' : `${b} ${spec.unit}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
