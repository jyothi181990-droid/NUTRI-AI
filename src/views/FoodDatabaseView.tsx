import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Heart,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { FOOD_CATEGORIES } from '../data/foods';
import {
  FoodCategory,
  FoodItem,
  LanguageCode,
  MealSlot,
} from '../types/nutrition';

interface FoodDatabaseViewProps {
  foods: FoodItem[];
  language: LanguageCode;
  favoriteFoodIds: string[];
  onInspectFood: (food: FoodItem) => void;
  onToggleFavorite: (id: string) => void;
  onLogMeal: (food: FoodItem, grams: number, slot: MealSlot) => void;
  onAddCustomFood: (food: FoodItem) => void;
  onDeleteCustomFood: (id: string) => void;
}

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({
  foods,
  language,
  favoriteFoodIds,
  onInspectFood,
  onToggleFavorite,
  onLogMeal,
  onAddCustomFood,
  onDeleteCustomFood,
}) => {
  const [category, setCategory] = useState<'All' | FoodCategory>('All');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'verified' | 'composite_estimate'>('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  // Custom Food Form
  const [name, setName] = useState('');
  const [customCategory, setCustomCategory] = useState<FoodCategory>('Indian foods');
  const [servingLabel, setServingLabel] = useState('1 serving');
  const [servingGrams, setServingGrams] = useState(100);
  const [calories, setCalories] = useState(150);
  const [carbs, setCarbs] = useState(20);
  const [protein, setProtein] = useState(5);
  const [fat, setFat] = useState(4);
  const [fibre, setFibre] = useState(2);
  const [sodium, setSodium] = useState(120);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foods.filter((f) => {
      if (category !== 'All' && f.category !== category) return false;
      if (qualityFilter !== 'all' && f.dataQuality !== qualityFilter) return false;
      if (!q) return true;
      if (f.name.toLowerCase().includes(q) || f.cuisine.toLowerCase().includes(q)) return true;
      if (f.searchAliases?.some((a) => a.toLowerCase().includes(q))) return true;
      return Object.values(f.regionalNames).some(
        (rn) =>
          rn &&
          (rn.script.toLowerCase().includes(q) ||
            rn.transliteration.toLowerCase().includes(q))
      );
    });
  }, [foods, category, qualityFilter, search]);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const item: FoodItem = {
      id: `custom-food-${Date.now()}`,
      name: name.trim(),
      cuisine: 'Custom Entry',
      category: customCategory,
      servingSizeLabel: servingLabel.trim() || '1 serving',
      servingWeightGrams: Math.max(1, servingGrams),
      per100g: {
        calories,
        carbohydratesG: carbs,
        proteinG: protein,
        totalFatG: fat,
        saturatedFatG: 0,
        transFatG: null,
        fibreG: fibre,
        totalSugarG: 0,
        addedSugarG: null,
        sodiumMg: sodium,
        potassiumMg: 0,
        calciumMg: 0,
        ironMg: 0,
        magnesiumMg: 0,
        zincMg: 0,
        vitaminAMcg: 0,
        vitaminB12Mcg: 0,
        vitaminCMg: 0,
        vitaminDMcg: 0,
        folateMcg: 0,
      },
      source: 'User Entered Food Record',
      dataQuality: 'user_entry',
      uncertaintyNote: 'Entered manually by user; micronutrients not specified default to 0 or unreported.',
      regionalNames: {},
      isCustom: true,
    };
    onAddCustomFood(item);
    setShowAddForm(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Food Composition Database
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Trustworthy USDA FoodData Central & NIN/ICMR Indian Food Composition references, clearly distinguishing verified records from estimates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Add Custom Food'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddFood} className="glass-panel-elevated rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="font-display text-lg font-semibold text-white">
            Add Custom Food (Values per 100g)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="space-y-1">
              <span className="text-slate-400">Food Name</span>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Homemade Millet Upma"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Category</span>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as FoodCategory)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
              >
                {FOOD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Serving Label & Weight (g)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={servingLabel}
                  onChange={(e) => setServingLabel(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                />
                <input
                  type="number"
                  value={servingGrams}
                  onChange={(e) => setServingGrams(Number(e.target.value) || 100)}
                  className="w-20 rounded-xl bg-slate-950 border border-slate-800 px-2.5 py-2 text-white font-mono"
                />
              </div>
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono">
            <label className="space-y-1">
              <span className="text-slate-400 font-sans">Calories</span>
              <input type="number" step="0.1" value={calories} onChange={(e) => setCalories(Number(e.target.value))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-sans">Carbs (g)</span>
              <input type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-sans">Protein (g)</span>
              <input type="number" step="0.1" value={protein} onChange={(e) => setProtein(Number(e.target.value))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-sans">Fat (g)</span>
              <input type="number" step="0.1" value={fat} onChange={(e) => setFat(Number(e.target.value))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-sans">Fibre (g)</span>
              <input type="number" step="0.1" value={fibre} onChange={(e) => setFibre(Number(e.target.value))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400 font-sans">Sodium (mg)</span>
              <input type="number" step="1" value={sodium} onChange={(e) => setSodium(Number(e.target.value))} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white" />
            </label>
          </div>
          <button type="submit" className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer">
            Save Food to Local Database
          </button>
        </form>
      )}

      {/* Search & Category Filters */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search English or Indian regional food names (e.g., Palak, పాలకూర, Aratipandu, Perugu)..."
              className="w-full bg-transparent text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <select
            aria-label="Filter by data quality"
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value as typeof qualityFilter)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
          >
            <option value="all">All Data Sources</option>
            <option value="verified">Verified Reference Only</option>
            <option value="composite_estimate">Composite Estimates Only</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
              category === 'All'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                : 'bg-slate-900/70 text-slate-400 hover:text-white'
            }`}
          >
            All ({foods.length})
          </button>
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                category === cat
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-2">
          <Database className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-300">No foods matched &ldquo;{search}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((food) => {
            const regional = food.regionalNames[language];
            const isFav = favoriteFoodIds.includes(food.id);
            return (
              <div key={food.id} className="holo-card rounded-2xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-cyan-300 font-medium">
                      {food.category} · {food.cuisine}
                    </span>
                    <span
                      className={
                        food.dataQuality === 'verified'
                          ? 'text-emerald-300'
                          : food.dataQuality === 'user_entry'
                            ? 'text-violet-300'
                            : 'text-amber-300'
                      }
                    >
                      {food.dataQuality === 'verified'
                        ? 'Verified'
                        : food.dataQuality === 'user_entry'
                          ? 'Custom'
                          : 'Estimate'}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-white">
                    {food.name}
                  </h3>
                  {regional && (
                    <div className="text-xs text-slate-300">
                      {regional.script} · {regional.transliteration}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 pt-2 font-mono text-xs tabular-nums">
                    <div>
                      <span className="text-slate-400 block font-sans">Kcal</span>
                      <span className="text-white font-semibold">{food.per100g.calories}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Prot</span>
                      <span className="text-cyan-300 font-semibold">{food.per100g.proteinG}g</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Carb</span>
                      <span className="text-violet-300 font-semibold">{food.per100g.carbohydratesG}g</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans">Fibre</span>
                      <span className="text-emerald-300 font-semibold">{food.per100g.fibreG}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onInspectFood(food)}
                    className="text-xs font-medium text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    20 Nutrients →
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLogMeal(food, food.servingWeightGrams, 'Lunch');
                        setJustLoggedId(food.id);
                        setTimeout(() => setJustLoggedId(null), 1500);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-400/35 px-2.5 py-1 text-xs text-emerald-200 hover:bg-emerald-500/30 cursor-pointer"
                    >
                      {justLoggedId === food.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Logged
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Log
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(food.id)}
                      aria-label="Toggle favourite"
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-400/40 cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-rose-400 text-rose-400' : 'text-slate-400'
                        }`}
                      />
                    </button>
                    {food.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomFood(food.id)}
                        aria-label="Delete custom food"
                        className="p-1.5 rounded-lg border border-slate-800 text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
