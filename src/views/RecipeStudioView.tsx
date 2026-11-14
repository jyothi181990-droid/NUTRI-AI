import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  ChefHat,
  Clock,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { RECIPE_CATEGORIES } from '../data/recipes';
import {
  FoodItem,
  NutrientProfile,
  RecipeCategory,
  RecipeIngredient,
  RecipeItem,
} from '../types/nutrition';
import { scaleNutrients, sumNutrients } from '../utils/storage';

interface RecipeStudioViewProps {
  recipes: RecipeItem[];
  foods: FoodItem[];
  savedRecipeIds: string[];
  onToggleSaveRecipe: (id: string) => void;
  onCreateRecipe: (recipe: RecipeItem) => void;
  onDeleteCustomRecipe: (id: string) => void;
  onPlaySfx: (kind: 'click' | 'success' | 'chime') => void;
}

export const RecipeStudioView: React.FC<RecipeStudioViewProps> = ({
  recipes,
  foods,
  savedRecipeIds,
  onToggleSaveRecipe,
  onCreateRecipe,
  onDeleteCustomRecipe,
  onPlaySfx,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | RecipeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecipeId, setActiveRecipeId] = useState<string>(recipes[0]?.id || '');
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [showBuilder, setShowBuilder] = useState(false);

  // Custom Recipe Builder state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RecipeCategory>('South Indian');
  const [newPrepMin, setNewPrepMin] = useState(15);
  const [newCookMin, setNewCookMin] = useState(20);
  const [newServings, setNewServings] = useState(2);
  const [newInstructions, setNewInstructions] = useState(
    'Prepare and rinse fresh ingredients.\nCook evenly until aromatic and tender.\nServe warm.'
  );
  const [newAllergens, setNewAllergens] = useState('');
  const [newSubstitutions, setNewSubstitutions] = useState('');
  const [newStorage, setNewStorage] = useState('Refrigerate leftovers within 2 hours at ≤ 4°C and consume within 2 days.');
  const [builderIngredients, setBuilderIngredients] = useState<RecipeIngredient[]>([
    { foodId: foods[0]?.id, name: foods[0]?.name || 'Ingredient', grams: 150, quantityLabel: '150g' },
  ]);
  const [pickedFoodId, setPickedFoodId] = useState(foods[0]?.id || '');
  const [pickedGrams, setPickedGrams] = useState(100);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recipes.filter((r) => {
      if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [recipes, selectedCategory, searchQuery]);

  const activeRecipe = useMemo(
    () =>
      filteredRecipes.find((r) => r.id === activeRecipeId) ||
      filteredRecipes[0] ||
      recipes[0],
    [filteredRecipes, activeRecipeId, recipes]
  );

  const calculateRecipePerServing = (recipe: RecipeItem): NutrientProfile => {
    if (recipe.estimatedPerServing) {
      return {
        calories: recipe.estimatedPerServing.calories ?? 0,
        carbohydratesG: recipe.estimatedPerServing.carbohydratesG ?? 0,
        proteinG: recipe.estimatedPerServing.proteinG ?? 0,
        totalFatG: recipe.estimatedPerServing.totalFatG ?? 0,
        saturatedFatG: recipe.estimatedPerServing.saturatedFatG ?? 0,
        transFatG: recipe.estimatedPerServing.transFatG ?? null,
        fibreG: recipe.estimatedPerServing.fibreG ?? 0,
        totalSugarG: recipe.estimatedPerServing.totalSugarG ?? 0,
        addedSugarG: recipe.estimatedPerServing.addedSugarG ?? null,
        sodiumMg: recipe.estimatedPerServing.sodiumMg ?? 0,
        potassiumMg: recipe.estimatedPerServing.potassiumMg ?? 0,
        calciumMg: recipe.estimatedPerServing.calciumMg ?? 0,
        ironMg: recipe.estimatedPerServing.ironMg ?? 0,
        magnesiumMg: recipe.estimatedPerServing.magnesiumMg ?? 0,
        zincMg: recipe.estimatedPerServing.zincMg ?? 0,
        vitaminAMcg: recipe.estimatedPerServing.vitaminAMcg ?? 0,
        vitaminB12Mcg: recipe.estimatedPerServing.vitaminB12Mcg ?? 0,
        vitaminCMg: recipe.estimatedPerServing.vitaminCMg ?? 0,
        vitaminDMcg: recipe.estimatedPerServing.vitaminDMcg ?? 0,
        folateMcg: recipe.estimatedPerServing.folateMcg ?? 0,
      };
    }

    const parts: NutrientProfile[] = [];
    for (const ing of recipe.ingredients) {
      const matched = ing.foodId ? foods.find((f) => f.id === ing.foodId) : undefined;
      if (matched) {
        parts.push(scaleNutrients(matched.per100g, ing.grams));
      }
    }
    const total = sumNutrients(parts);
    const divisor = Math.max(1, recipe.servings);
    return {
      calories: Math.round(total.calories / divisor),
      carbohydratesG: Math.round((total.carbohydratesG / divisor) * 10) / 10,
      proteinG: Math.round((total.proteinG / divisor) * 10) / 10,
      totalFatG: Math.round((total.totalFatG / divisor) * 10) / 10,
      saturatedFatG: Math.round((total.saturatedFatG / divisor) * 10) / 10,
      transFatG: total.transFatG !== null ? Math.round((total.transFatG / divisor) * 10) / 10 : null,
      fibreG: Math.round((total.fibreG / divisor) * 10) / 10,
      totalSugarG: Math.round((total.totalSugarG / divisor) * 10) / 10,
      addedSugarG: total.addedSugarG !== null ? Math.round((total.addedSugarG / divisor) * 10) / 10 : null,
      sodiumMg: Math.round(total.sodiumMg / divisor),
      potassiumMg: Math.round(total.potassiumMg / divisor),
      calciumMg: Math.round(total.calciumMg / divisor),
      ironMg: Math.round((total.ironMg / divisor) * 10) / 10,
      magnesiumMg: Math.round(total.magnesiumMg / divisor),
      zincMg: Math.round((total.zincMg / divisor) * 10) / 10,
      vitaminAMcg: Math.round(total.vitaminAMcg / divisor),
      vitaminB12Mcg: Math.round((total.vitaminB12Mcg / divisor) * 100) / 100,
      vitaminCMg: Math.round((total.vitaminCMg / divisor) * 10) / 10,
      vitaminDMcg: Math.round((total.vitaminDMcg / divisor) * 10) / 10,
      folateMcg: Math.round(total.folateMcg / divisor),
    };
  };

  const activeNutrition = useMemo(
    () => (activeRecipe ? calculateRecipePerServing(activeRecipe) : null),
    [activeRecipe, foods]
  );

  // Live builder preview nutrition
  const builderNutritionPreview = useMemo(() => {
    const parts = builderIngredients
      .map((ing) => {
        const f = foods.find((item) => item.id === ing.foodId);
        return f ? scaleNutrients(f.per100g, ing.grams) : null;
      })
      .filter((x): x is NutrientProfile => Boolean(x));
    const total = sumNutrients(parts);
    const s = Math.max(1, newServings);
    return {
      calories: Math.round(total.calories / s),
      proteinG: Math.round((total.proteinG / s) * 10) / 10,
      carbsG: Math.round((total.carbohydratesG / s) * 10) / 10,
      fatG: Math.round((total.totalFatG / s) * 10) / 10,
      fibreG: Math.round((total.fibreG / s) * 10) / 10,
    };
  }, [builderIngredients, foods, newServings]);

  const handleAddBuilderIngredient = () => {
    const food = foods.find((f) => f.id === pickedFoodId);
    if (!food) return;
    setBuilderIngredients((prev) => [
      ...prev,
      {
        foodId: food.id,
        name: food.name,
        grams: Math.max(1, pickedGrams),
        quantityLabel: `${Math.max(1, pickedGrams)}g`,
      },
    ]);
    onPlaySfx('click');
  };

  const handleSaveCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || builderIngredients.length === 0) return;

    const custom: RecipeItem = {
      id: `custom-recipe-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      prepTimeMin: Math.max(0, newPrepMin),
      cookTimeMin: Math.max(0, newCookMin),
      servings: Math.max(1, newServings),
      ingredients: builderIngredients,
      instructions: newInstructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      allergens: newAllergens
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      substitutions: newSubstitutions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      storageGuidance: newStorage.trim(),
      attribution: 'User Custom Recipe · Live Ingredient Nutrition Calculation',
      isCustom: true,
    };

    onCreateRecipe(custom);
    setActiveRecipeId(custom.id);
    setShowBuilder(false);
    setNewTitle('');
    onPlaySfx('success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Global & Indian Recipe Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated regional & international dishes with ingredient-calculated nutrition. Build custom recipes anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBuilder((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:brightness-110 whitespace-nowrap self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showBuilder ? 'Back to Recipes' : 'Create Custom Recipe'}
        </button>
      </div>

      {/* Custom Recipe Builder */}
      {showBuilder ? (
        <form onSubmit={handleSaveCustomRecipe} className="glass-panel-elevated rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-display text-xl font-bold text-white">
              Custom Recipe Nutrition Calculator
            </h2>
            <div className="font-mono text-xs tabular-nums text-cyan-300">
              Per Serving: {builderNutritionPreview.calories} kcal · {builderNutritionPreview.proteinG}g P · {builderNutritionPreview.carbsG}g C · {builderNutritionPreview.fatG}g F
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <label className="md:col-span-2 space-y-1">
              <span className="text-slate-400">Recipe Title</span>
              <input
                required
                type="text"
                placeholder="e.g., High-Protein Moong & Spinach Khichdi"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Cuisine Category</span>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RecipeCategory)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              >
                {RECIPE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Servings</span>
              <input
                type="number"
                min={1}
                max={20}
                value={newServings}
                onChange={(e) => setNewServings(Number(e.target.value) || 1)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-white font-mono tabular-nums"
              />
            </label>
          </div>

          {/* Ingredient Picker */}
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              Add Database Ingredients (calculates nutrition automatically)
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={pickedFoodId}
                onChange={(e) => setPickedFoodId(e.target.value)}
                className="flex-1 min-w-[200px] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              >
                {foods.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.per100g.calories} kcal/100g)
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={5000}
                value={pickedGrams}
                onChange={(e) => setPickedGrams(Number(e.target.value) || 100)}
                className="w-24 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-mono tabular-nums"
              />
              <span className="text-xs text-slate-400">grams</span>
              <button
                type="button"
                onClick={handleAddBuilderIngredient}
                className="rounded-xl bg-cyan-500/20 border border-cyan-400/40 px-4 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-500/30 cursor-pointer"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              {builderIngredients.map((ing, idx) => (
                <div key={`${ing.name}-${idx}`} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-slate-200">{ing.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-300 tabular-nums">{ing.grams}g</span>
                    <button
                      type="button"
                      onClick={() =>
                        setBuilderIngredients((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-rose-300 hover:text-rose-200 cursor-pointer"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="space-y-1">
              <span className="text-slate-400">Prep Time (minutes)</span>
              <input
                type="number"
                min={0}
                value={newPrepMin}
                onChange={(e) => setNewPrepMin(Number(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Cooking Time (minutes)</span>
              <input
                type="number"
                min={0}
                value={newCookMin}
                onChange={(e) => setNewCookMin(Number(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Cooking Instructions (one step per line)</span>
              <textarea
                rows={4}
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
              />
            </label>
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-slate-400">Allergens (comma-separated)</span>
                <input
                  type="text"
                  placeholder="e.g., Dairy, Peanuts"
                  value={newAllergens}
                  onChange={(e) => setNewAllergens(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-400">Possible Substitutions (one per line)</span>
                <input
                  type="text"
                  placeholder="e.g., Swap paneer with tofu"
                  value={newSubstitutions}
                  onChange={(e) => setNewSubstitutions(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-400">Storage Guidance</span>
                <input
                  type="text"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
          >
            Save Custom Recipe
          </button>
        </form>
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search regional Indian & international recipes or ingredients..."
                  className="w-full bg-transparent text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  selectedCategory === 'All'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white'
                }`}
              >
                All Cuisines ({recipes.length})
              </button>
              {RECIPE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                      : 'bg-slate-900/70 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recipe List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredRecipes.length === 0 ? (
                <div className="glass-panel rounded-2xl p-6 text-center text-sm text-slate-400">
                  No matching recipes in this curated collection. Try another cuisine or create your own custom recipe!
                </div>
              ) : (
                filteredRecipes.map((r) => {
                  const isActive = activeRecipe?.id === r.id;
                  const isSaved = savedRecipeIds.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setActiveRecipeId(r.id);
                        setPortionMultiplier(1);
                        onPlaySfx('click');
                      }}
                      className={`w-full text-left rounded-2xl p-4 transition-all cursor-pointer border ${
                        isActive
                          ? 'glass-panel-elevated border-cyan-400/50'
                          : 'holo-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs text-cyan-300 font-medium">
                          {r.category} {r.isCustom ? '· Custom Recipe' : ''}
                        </div>
                        {isSaved && <Bookmark className="w-3.5 h-3.5 fill-violet-400 text-violet-400 shrink-0" />}
                      </div>
                      <h3 className="font-display text-base font-semibold text-white mt-1">
                        {r.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
                        <span>Prep {r.prepTimeMin}m</span>
                        <span>·</span>
                        <span>Cook {r.cookTimeMin}m</span>
                        <span>·</span>
                        <span>{r.servings} servings</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Active Recipe Detail */}
            {activeRecipe && (
              <div className="lg:col-span-7 glass-panel-elevated rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs text-violet-300 font-medium">
                      {activeRecipe.category} · {activeRecipe.attribution}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mt-1">
                      {activeRecipe.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSaveRecipe(activeRecipe.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium cursor-pointer ${
                        savedRecipeIds.includes(activeRecipe.id)
                          ? 'border-violet-400/50 bg-violet-500/20 text-violet-200'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {savedRecipeIds.includes(activeRecipe.id) ? 'Saved' : 'Save Recipe'}
                    </button>
                    {activeRecipe.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomRecipe(activeRecipe.id)}
                        className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-2 text-rose-300 hover:bg-rose-900/40 cursor-pointer"
                        aria-label="Delete custom recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Timings & Servings Scaler */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
                  <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-300" /> Prep: {activeRecipe.prepTimeMin}m
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-emerald-300" /> Cook: {activeRecipe.cookTimeMin}m
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-violet-300" /> Servings:{' '}
                      {activeRecipe.servings * portionMultiplier}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                    {[1, 2, 4].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => setPortionMultiplier(mult)}
                        className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                          portionMultiplier === mult
                            ? 'bg-cyan-500/20 text-cyan-200'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mult}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Nutrition Per Serving */}
                {activeNutrition && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs tabular-nums">
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                      <div className="text-slate-400 font-sans">Energy / srv</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {activeNutrition.calories} kcal
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                      <div className="text-slate-400 font-sans">Protein</div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5">
                        {activeNutrition.proteinG} g
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                      <div className="text-slate-400 font-sans">Carbs</div>
                      <div className="text-base font-bold text-violet-300 mt-0.5">
                        {activeNutrition.carbohydratesG} g
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                      <div className="text-slate-400 font-sans">Fat</div>
                      <div className="text-base font-bold text-amber-300 mt-0.5">
                        {activeNutrition.totalFatG} g
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                      <div className="text-slate-400 font-sans">Fibre</div>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">
                        {activeNutrition.fibreG} g
                      </div>
                    </div>
                  </div>
                )}

                {/* Ingredients & Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <h3 className="font-display text-sm font-semibold text-white">
                      Ingredients ({portionMultiplier}x batch)
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeRecipe.ingredients.map((ing, i) => (
                        <li
                          key={`${ing.name}-${i}`}
                          className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-1.5"
                        >
                          <span>{ing.name}</span>
                          <span className="font-mono text-cyan-300 shrink-0 tabular-nums">
                            {ing.grams * portionMultiplier}g
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-sm font-semibold text-white">
                      Cooking Instructions
                    </h3>
                    <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                      {activeRecipe.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Allergens, Substitutions & Storage */}
                <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2.5 text-xs">
                  <div>
                    <span className="font-semibold text-amber-200">Allergens: </span>
                    <span className="text-slate-300">
                      {activeRecipe.allergens.length > 0
                        ? activeRecipe.allergens.join(', ')
                        : 'No major allergens listed — verify condiment brands.'}
                    </span>
                  </div>
                  {activeRecipe.substitutions.length > 0 && (
                    <div>
                      <span className="font-semibold text-cyan-200">Possible Substitutions: </span>
                      <span className="text-slate-300">
                        {activeRecipe.substitutions.join(' · ')}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-emerald-200">Storage Guidance: </span>
                    <span className="text-slate-300">{activeRecipe.storageGuidance}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
