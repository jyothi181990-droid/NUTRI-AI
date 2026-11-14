import React from 'react';
import { Bookmark, FileText, Heart, Plus, Trash2 } from 'lucide-react';
import {
  FoodItem,
  MealSlot,
  NavSection,
  RecipeItem,
  SavedFoodLabel,
} from '../types/nutrition';

interface FavouritesViewProps {
  foods: FoodItem[];
  recipes: RecipeItem[];
  favoriteFoodIds: string[];
  savedRecipeIds: string[];
  savedLabels: SavedFoodLabel[];
  onInspectFood: (food: FoodItem) => void;
  onToggleFavoriteFood: (id: string) => void;
  onToggleSaveRecipe: (id: string) => void;
  onRemoveLabel: (id: string) => void;
  onLogMeal: (food: FoodItem, grams: number, slot: MealSlot) => void;
  onNavigate: (section: NavSection) => void;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({
  foods,
  recipes,
  favoriteFoodIds,
  savedRecipeIds,
  savedLabels,
  onInspectFood,
  onToggleFavoriteFood,
  onToggleSaveRecipe,
  onRemoveLabel,
  onLogMeal,
  onNavigate,
}) => {
  const favFoods = foods.filter((f) => favoriteFoodIds.includes(f.id));
  const savedRecipes = recipes.filter((r) => savedRecipeIds.includes(r.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
          Favourites & Saved Library
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Your bookmarked foods, saved regional & custom recipes, and verified packaged food labels.
        </p>
      </div>

      {/* Favourite Foods */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="font-display text-lg font-semibold text-white">
              Favourite Foods ({favFoods.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('database')}
            className="text-xs text-cyan-300 hover:underline cursor-pointer"
          >
            Browse Database →
          </button>
        </div>

        {favFoods.length === 0 ? (
          <p className="text-sm text-slate-400">
            No favourite foods yet. Tap the heart icon on any food in the Database or Nutrition inspector.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favFoods.map((f) => (
              <div key={f.id} className="holo-card rounded-xl p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs text-cyan-300">{f.category}</div>
                  <div className="font-display text-base font-semibold text-white mt-0.5">
                    {f.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
                    {f.per100g.calories} kcal/100g · {f.per100g.proteinG}g protein
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onInspectFood(f)}
                    className="text-xs text-cyan-300 hover:underline cursor-pointer"
                  >
                    Inspect
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onLogMeal(f, f.servingWeightGrams, 'Snack')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-400/35 px-2.5 py-1 text-xs text-emerald-200 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Log
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteFood(f.id)}
                      className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                      aria-label="Remove favourite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Recipes */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-violet-300" />
            <h2 className="font-display text-lg font-semibold text-white">
              Saved Recipes ({savedRecipes.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="text-xs text-violet-300 hover:underline cursor-pointer"
          >
            Open Recipe Studio →
          </button>
        </div>

        {savedRecipes.length === 0 ? (
          <p className="text-sm text-slate-400">No saved recipes yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRecipes.map((r) => (
              <div key={r.id} className="holo-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-violet-300">{r.category}</div>
                  <button
                    type="button"
                    onClick={() => onNavigate('recipes')}
                    className="font-display text-base font-semibold text-white hover:text-cyan-200 text-left truncate block cursor-pointer"
                  >
                    {r.title}
                  </button>
                  <div className="text-xs text-slate-400 mt-1">
                    {r.servings} servings · {r.prepTimeMin + r.cookTimeMin} min total
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSaveRecipe(r.id)}
                  aria-label="Remove saved recipe"
                  className="p-2 rounded-lg text-rose-300 hover:bg-rose-950/40 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Scanned Labels */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-300" />
            <h2 className="font-display text-lg font-semibold text-white">
              Verified Packaged Labels ({savedLabels.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('scanner')}
            className="text-xs text-emerald-300 hover:underline cursor-pointer"
          >
            Scan Label →
          </button>
        </div>

        {savedLabels.length === 0 ? (
          <p className="text-sm text-slate-400">
            No scanned packaged food labels saved yet. Use the Packaged Label Reader in Food Scanner to confirm and save product labels.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedLabels.map((lbl) => (
              <div key={lbl.id} className="holo-card rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-base font-semibold text-white">
                      {lbl.productName}
                    </div>
                    <div className="text-slate-400">
                      Serving: {lbl.servingSize} · Expiry: {lbl.expiryDate || 'Not listed'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveLabel(lbl.id)}
                    aria-label="Delete saved label"
                    className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {lbl.allergens && (
                  <div className="text-amber-200">Allergens: {lbl.allergens}</div>
                )}
                <div className="font-mono text-slate-300 tabular-nums">
                  {lbl.nutritionFacts.calories ?? '—'} kcal · {lbl.nutritionFacts.proteinG ?? '—'}g P ·{' '}
                  {lbl.nutritionFacts.carbohydratesG ?? '—'}g C · {lbl.nutritionFacts.sodiumMg ?? '—'}mg Na
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
