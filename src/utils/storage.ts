import {
  FoodItem,
  MealLogEntry,
  NutrientProfile,
  RecipeItem,
  SavedFoodLabel,
  UserSettings,
} from '../types/nutrition';

const DB_NAME = 'nutriai_local_db';
const DB_VERSION = 1;
const STORE_KEY = 'workspace_state';
const LS_SETTINGS_KEY = 'nutriai_settings_v1';
const LS_FALLBACK_KEY = 'nutriai_workspace_backup_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  reduceAnimations: false,
  soundEnabled: false, // Strictly OFF by default
  ambienceMode: 'forest_birds',
  interactionSfx: true,
  soundVolume: 0.45,
  displayName: '',
  dietaryPreference: 'All Foods',
  allergenWatchlist: [],
};

export interface WorkspaceState {
  mealLogs: MealLogEntry[];
  favoriteFoodIds: string[];
  savedRecipeIds: string[];
  customFoods: FoodItem[];
  customRecipes: RecipeItem[];
  savedLabels: SavedFoodLabel[];
  searchHistory: string[];
}

export const EMPTY_WORKSPACE: WorkspaceState = {
  mealLogs: [],
  favoriteFoodIds: ['idli-steamed', 'dal-tadka', 'apple-fresh'],
  savedRecipeIds: ['telangana-sarva-pindi', 'south-indian-pesarattu'],
  customFoods: [],
  customRecipes: [],
  savedLabels: [],
  searchHistory: ['Idli', 'Hyderabadi Biryani', 'Spinach', 'Ragi'],
};

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      // Keep audio strictly off on fresh page load to never autoplay before user interaction
      soundEnabled: false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    // Persist user preferences (soundEnabled is stored as false so browser never autoplays on reload)
    localStorage.setItem(
      LS_SETTINGS_KEY,
      JSON.stringify({ ...settings, soundEnabled: false })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export async function loadWorkspaceState(): Promise<WorkspaceState> {
  const db = await openIDB();
  if (db) {
    try {
      const data = await new Promise<WorkspaceState | null>((resolve) => {
        const tx = db.transaction('kv', 'readonly');
        const store = tx.objectStore('kv');
        const req = store.get(STORE_KEY);
        req.onsuccess = () => resolve((req.result as WorkspaceState) ?? null);
        req.onerror = () => resolve(null);
      });
      if (data) {
        return { ...EMPTY_WORKSPACE, ...data };
      }
    } catch {
      // Fall back to localStorage
    }
  }

  try {
    const raw = localStorage.getItem(LS_FALLBACK_KEY);
    if (raw) {
      return { ...EMPTY_WORKSPACE, ...(JSON.parse(raw) as Partial<WorkspaceState>) };
    }
  } catch {
    // Ignore parse error
  }
  return EMPTY_WORKSPACE;
}

export async function saveWorkspaceState(state: WorkspaceState): Promise<void> {
  try {
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }

  const db = await openIDB();
  if (db) {
    try {
      await new Promise<void>((resolve) => {
        const tx = db.transaction('kv', 'readwrite');
        const store = tx.objectStore('kv');
        store.put(state, STORE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // Ignore IDB write errors
    }
  }
}

export async function clearAllLocalData(): Promise<void> {
  try {
    localStorage.removeItem(LS_SETTINGS_KEY);
    localStorage.removeItem(LS_FALLBACK_KEY);
  } catch {
    // ignore
  }
  const db = await openIDB();
  if (db) {
    try {
      await new Promise<void>((resolve) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').delete(STORE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }
}

export function scaleNutrients(per100g: NutrientProfile, grams: number): NutrientProfile {
  const factor = Math.max(0, grams) / 100;
  const round = (val: number, decimals = 1) =>
    Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);

  return {
    calories: round(per100g.calories * factor, 0),
    carbohydratesG: round(per100g.carbohydratesG * factor, 1),
    proteinG: round(per100g.proteinG * factor, 1),
    totalFatG: round(per100g.totalFatG * factor, 1),
    saturatedFatG: round(per100g.saturatedFatG * factor, 1),
    transFatG: per100g.transFatG !== null ? round(per100g.transFatG * factor, 2) : null,
    fibreG: round(per100g.fibreG * factor, 1),
    totalSugarG: round(per100g.totalSugarG * factor, 1),
    addedSugarG: per100g.addedSugarG !== null ? round(per100g.addedSugarG * factor, 1) : null,
    sodiumMg: round(per100g.sodiumMg * factor, 0),
    potassiumMg: round(per100g.potassiumMg * factor, 0),
    calciumMg: round(per100g.calciumMg * factor, 1),
    ironMg: round(per100g.ironMg * factor, 2),
    magnesiumMg: round(per100g.magnesiumMg * factor, 1),
    zincMg: round(per100g.zincMg * factor, 2),
    vitaminAMcg: round(per100g.vitaminAMcg * factor, 1),
    vitaminB12Mcg: round(per100g.vitaminB12Mcg * factor, 2),
    vitaminCMg: round(per100g.vitaminCMg * factor, 1),
    vitaminDMcg: round(per100g.vitaminDMcg * factor, 2),
    folateMcg: round(per100g.folateMcg * factor, 1),
  };
}

export function sumNutrients(items: NutrientProfile[]): NutrientProfile {
  const zero: NutrientProfile = {
    calories: 0,
    carbohydratesG: 0,
    proteinG: 0,
    totalFatG: 0,
    saturatedFatG: 0,
    transFatG: null,
    fibreG: 0,
    totalSugarG: 0,
    addedSugarG: null,
    sodiumMg: 0,
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
  };

  for (const item of items) {
    zero.calories += item.calories;
    zero.carbohydratesG += item.carbohydratesG;
    zero.proteinG += item.proteinG;
    zero.totalFatG += item.totalFatG;
    zero.saturatedFatG += item.saturatedFatG;
    if (item.transFatG !== null) {
      zero.transFatG = (zero.transFatG ?? 0) + item.transFatG;
    }
    zero.fibreG += item.fibreG;
    zero.totalSugarG += item.totalSugarG;
    if (item.addedSugarG !== null) {
      zero.addedSugarG = (zero.addedSugarG ?? 0) + item.addedSugarG;
    }
    zero.sodiumMg += item.sodiumMg;
    zero.potassiumMg += item.potassiumMg;
    zero.calciumMg += item.calciumMg;
    zero.ironMg += item.ironMg;
    zero.magnesiumMg += item.magnesiumMg;
    zero.zincMg += item.zincMg;
    zero.vitaminAMcg += item.vitaminAMcg;
    zero.vitaminB12Mcg += item.vitaminB12Mcg;
    zero.vitaminCMg += item.vitaminCMg;
    zero.vitaminDMcg += item.vitaminDMcg;
    zero.folateMcg += item.folateMcg;
  }

  return zero;
}
