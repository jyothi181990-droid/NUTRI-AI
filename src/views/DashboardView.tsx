import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  FoodItem,
  MealLogEntry,
  MealSlot,
  NavSection,
  RecipeItem,
} from '../types/nutrition';

interface DashboardViewProps {
  mealLogs: MealLogEntry[];
  foods: FoodItem[];
  recipes: RecipeItem[];
  favoriteFoodIds: string[];
  savedRecipeIds: string[];
  onLogMeal: (food: FoodItem, grams: number, slot: MealSlot) => void;
  onRemoveLog: (id: string) => void;
  onNavigate: (section: NavSection) => void;
  onInspectFood: (food: FoodItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  mealLogs,
  foods,
  recipes,
  favoriteFoodIds,
  savedRecipeIds,
  onLogMeal,
  onRemoveLog,
  onNavigate,
  onInspectFood,
}) => {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [quickFoodId, setQuickFoodId] = useState(foods[0]?.id || '');
  const [quickGrams, setQuickGrams] = useState(foods[0]?.servingWeightGrams || 100);
  const [quickSlot, setQuickSlot] = useState<MealSlot>('Breakfast');
  const [chartMetric, setChartMetric] = useState<'calories' | 'proteinG' | 'fibreG'>('calories');

  const dayLogs = useMemo(
    () => mealLogs.filter((l) => l.dateISO === selectedDate),
    [mealLogs, selectedDate]
  );

  const totals = useMemo(() => {
    return dayLogs.reduce(
      (acc, l) => ({
        calories: acc.calories + l.nutrients.calories,
        proteinG: acc.proteinG + l.nutrients.proteinG,
        carbsG: acc.carbsG + l.nutrients.carbohydratesG,
        fatG: acc.fatG + l.nutrients.totalFatG,
        fibreG: acc.fibreG + l.nutrients.fibreG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fibreG: 0 }
    );
  }, [dayLogs]);

  // Last 7 days chart data
  const weeklyData = useMemo(() => {
    const days: { dateISO: string; label: string; calories: number; proteinG: number; fibreG: number }[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const logsForDay = mealLogs.filter((m) => m.dateISO === iso);
      days.push({
        dateISO: iso,
        label,
        calories: Math.round(logsForDay.reduce((s, m) => s + m.nutrients.calories, 0)),
        proteinG: Math.round(logsForDay.reduce((s, m) => s + m.nutrients.proteinG, 0) * 10) / 10,
        fibreG: Math.round(logsForDay.reduce((s, m) => s + m.nutrients.fibreG, 0) * 10) / 10,
      });
    }
    return days;
  }, [mealLogs]);

  const maxChartVal = Math.max(
    1,
    ...weeklyData.map((d) => d[chartMetric])
  );

  const favFoods = foods.filter((f) => favoriteFoodIds.includes(f.id));
  const savedRecipes = recipes.filter((r) => savedRecipeIds.includes(r.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            My Nutrition Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daily food log, macronutrient & fibre balance, meal history, and 7-day trends stored locally on your device.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white self-start">
          <Calendar className="w-4 h-4 text-cyan-300" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent focus:outline-none font-mono"
          />
        </label>
      </div>

      {/* Child Safety & Balanced Nourishment Policy */}
      <div className="rounded-xl border border-cyan-400/25 bg-cyan-950/20 px-4 py-3 flex items-start gap-2.5 text-xs text-cyan-100">
        <Info className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
        <span>
          <strong>Nourishment Guidance:</strong> NutriAI tracks food composition for educational awareness. We never prescribe restrictive calorie limits or weight-loss diets for children or adolescents—growing bodies require adequate nourishment and pediatric guidance.
        </span>
      </div>

      {/* 5 Core Nutrient Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono tabular-nums">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-sans">Calories</div>
          <div className="text-2xl font-bold text-white mt-1">
            {Math.round(totals.calories)} <span className="text-xs font-normal text-slate-400">kcal</span>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-sans">Protein</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">
            {totals.proteinG.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-sans">Carbohydrates</div>
          <div className="text-2xl font-bold text-violet-300 mt-1">
            {totals.carbsG.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-sans">Total Fat</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {totals.fatG.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400 font-sans">Dietary Fibre</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            {totals.fibreG.toFixed(1)} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
        </div>
      </div>

      {/* Quick Log Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = foods.find((item) => item.id === quickFoodId);
          if (f) onLogMeal(f, Math.max(1, quickGrams), quickSlot);
        }}
        className="glass-panel rounded-2xl p-4 flex flex-wrap items-center gap-3"
      >
        <span className="text-xs font-semibold text-white">Quick Log Meal:</span>
        <select
          aria-label="Choose food to log"
          value={quickFoodId}
          onChange={(e) => {
            setQuickFoodId(e.target.value);
            const found = foods.find((f) => f.id === e.target.value);
            if (found) setQuickGrams(found.servingWeightGrams);
          }}
          className="flex-1 min-w-[200px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
        >
          {foods.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.servingSizeLabel})
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={3000}
          value={quickGrams}
          onChange={(e) => setQuickGrams(Number(e.target.value) || 100)}
          aria-label="Weight in grams"
          className="w-24 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono tabular-nums"
        />
        <span className="text-xs text-slate-400">g</span>
        <select
          aria-label="Meal slot"
          value={quickSlot}
          onChange={(e) => setQuickSlot(e.target.value as MealSlot)}
          className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
        >
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack">Snack</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Food Log & History */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              Meal History ({selectedDate})
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {dayLogs.length} entries
            </span>
          </div>

          {dayLogs.length === 0 ? (
            <div className="py-10 text-center space-y-2 text-sm text-slate-400">
              <p>No meals logged for {selectedDate} yet.</p>
              <p className="text-xs text-slate-500">
                Use the Quick Log bar above, scan a dish, or log from the Food Database.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {dayLogs.map((entry) => (
                <div key={entry.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-cyan-300 font-medium">
                      {entry.mealSlot} · {entry.grams}g
                    </div>
                    <div className="text-sm font-medium text-white truncate">
                      {entry.foodName}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right font-mono text-xs tabular-nums">
                      <div className="text-white font-semibold">{Math.round(entry.nutrients.calories)} kcal</div>
                      <div className="text-slate-400">
                        {entry.nutrients.proteinG.toFixed(1)}g P · {entry.nutrients.fibreG.toFixed(1)}g Fib
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveLog(entry.id)}
                      aria-label="Remove meal entry"
                      className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-Day Weekly Nutrition Chart */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-300" />
              <h2 className="font-display text-lg font-semibold text-white">
                7-Day Trend
              </h2>
            </div>
            <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
              {(
                [
                  ['calories', 'Calories'],
                  ['proteinG', 'Protein'],
                  ['fibreG', 'Fibre'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChartMetric(key)}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    chartMetric === key ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4">
            {weeklyData.map((d) => {
              const val = d[chartMetric];
              const pct = Math.max(4, Math.round((val / maxChartVal) * 100));
              return (
                <button
                  key={d.dateISO}
                  type="button"
                  onClick={() => setSelectedDate(d.dateISO)}
                  className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                    {val}
                  </span>
                  <div className="w-full h-28 flex items-end justify-center bg-slate-900/50 rounded-lg p-1">
                    <div
                      className={`w-full rounded transition-all ${
                        d.dateISO === selectedDate
                          ? 'bg-gradient-to-t from-cyan-500 to-emerald-400'
                          : 'bg-cyan-500/35 group-hover:bg-cyan-400/60'
                      }`}
                      style={{ height: `${val === 0 ? 4 : pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saved Recipes & Favourite Foods Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-white">
              Favourite Foods ({favFoods.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('favourites')}
              className="text-xs text-cyan-300 hover:underline cursor-pointer"
            >
              Manage →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {favFoods.slice(0, 6).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onInspectFood(f)}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400/40 px-3 py-1.5 text-xs text-slate-200 cursor-pointer"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-white">
              Saved Recipes ({savedRecipes.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('recipes')}
              className="text-xs text-violet-300 hover:underline cursor-pointer"
            >
              Open Studio →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedRecipes.slice(0, 6).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onNavigate('recipes')}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-400/40 px-3 py-1.5 text-xs text-slate-200 cursor-pointer"
              >
                {r.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
