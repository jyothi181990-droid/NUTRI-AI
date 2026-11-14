export type LanguageCode =
  | 'en'
  | 'te'
  | 'hi'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa';

export type NavSection =
  | 'home'
  | 'scanner'
  | 'nutrition'
  | 'recipes'
  | 'assistant'
  | 'database'
  | 'safety'
  | 'dashboard'
  | 'favourites'
  | 'settings';

export type FoodCategory =
  | 'Indian foods'
  | 'International foods'
  | 'Fruits'
  | 'Vegetables'
  | 'Grains'
  | 'Pulses'
  | 'Dairy'
  | 'Meat'
  | 'Fish'
  | 'Drinks'
  | 'Snacks'
  | 'Packaged products';

export type RecipeCategory =
  | 'South Indian'
  | 'North Indian'
  | 'Telangana'
  | 'Andhra Pradesh'
  | 'Chinese'
  | 'Italian'
  | 'Japanese'
  | 'Korean'
  | 'Mexican'
  | 'Mediterranean'
  | 'Continental'
  | 'Middle Eastern'
  | 'African'
  | 'Other international cuisines';

/**
 * Complete 20-nutrient profile (per 100g).
 * Nullable fields (transFatG, addedSugarG) MUST remain null when unavailable
 * rather than fabricating 0 values.
 */
export interface NutrientProfile {
  calories: number; // kcal
  carbohydratesG: number; // g
  proteinG: number; // g
  totalFatG: number; // g
  saturatedFatG: number; // g
  transFatG: number | null; // g (null when unreported)
  fibreG: number; // g
  totalSugarG: number; // g
  addedSugarG: number | null; // g (null when unreported)
  sodiumMg: number; // mg
  potassiumMg: number; // mg
  calciumMg: number; // mg
  ironMg: number; // mg
  magnesiumMg: number; // mg
  zincMg: number; // mg
  vitaminAMcg: number; // mcg RAE
  vitaminB12Mcg: number; // mcg
  vitaminCMg: number; // mg
  vitaminDMcg: number; // mcg
  folateMcg: number; // mcg DFE
}

export interface RegionalNameEntry {
  script: string;
  transliteration: string;
}

export interface FoodItem {
  id: string;
  name: string;
  cuisine: string;
  category: FoodCategory;
  servingSizeLabel: string;
  servingWeightGrams: number;
  per100g: NutrientProfile;
  source: string;
  dataQuality: 'verified' | 'composite_estimate' | 'user_entry';
  uncertaintyNote: string;
  allergens?: string[];
  regionalNames: Partial<Record<LanguageCode, RegionalNameEntry>>;
  searchAliases?: string[];
  isCustom?: boolean;
}

export interface RecipeIngredient {
  foodId?: string;
  name: string;
  grams: number;
  quantityLabel: string;
}

export interface RecipeItem {
  id: string;
  title: string;
  category: RecipeCategory;
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  allergens: string[];
  substitutions: string[];
  storageGuidance: string;
  attribution: string;
  isCustom?: boolean;
  /** Optional explicit per-serving override if recipe uses composite foods */
  estimatedPerServing?: Partial<NutrientProfile>;
}

export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface MealLogEntry {
  id: string;
  dateISO: string; // YYYY-MM-DD
  timestamp: string;
  mealSlot: MealSlot;
  foodId: string;
  foodName: string;
  grams: number;
  nutrients: NutrientProfile; // scaled to grams
}

export interface SavedFoodLabel {
  id: string;
  savedAt: string;
  productName: string;
  servingSize: string;
  servingWeightGrams: number | null;
  ingredients: string;
  allergens: string;
  expiryDate: string;
  manufacturer: string;
  nutritionFacts: {
    calories: number | null;
    carbohydratesG: number | null;
    proteinG: number | null;
    totalFatG: number | null;
    saturatedFatG: number | null;
    transFatG: number | null;
    fibreG: number | null;
    totalSugarG: number | null;
    addedSugarG: number | null;
    sodiumMg: number | null;
  };
  legibilityNotes: string;
}

export type AmbienceMode = 'silent' | 'forest_birds' | 'gentle_nature';

export interface UserSettings {
  language: LanguageCode;
  reduceAnimations: boolean;
  soundEnabled: boolean; // OFF by default
  ambienceMode: AmbienceMode;
  interactionSfx: boolean;
  soundVolume: number; // 0 to 1
  displayName: string;
  dietaryPreference: 'All Foods' | 'Vegetarian' | 'Vegan' | 'Eggetarian' | 'Pescatarian';
  allergenWatchlist: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mode: 'gemini' | 'demo';
  timestamp: string;
}
