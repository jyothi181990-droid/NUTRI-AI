import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Camera,
  Database,
  Globe,
  Heart,
  Home,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NutriLogo } from './components/NutriLogo';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SpaceBackground } from './components/SpaceBackground';
import { FOODS_DATABASE } from './data/foods';
import { RECIPES_DATABASE } from './data/recipes';
import { LANGUAGES, UI_TRANSLATIONS } from './data/translations';
import {
  AmbienceMode,
  FoodItem,
  LanguageCode,
  MealLogEntry,
  MealSlot,
  NavSection,
  RecipeItem,
  SavedFoodLabel,
  UserSettings,
} from './types/nutrition';
import { soundEngine } from './utils/soundEngine';
import {
  clearAllLocalData,
  DEFAULT_SETTINGS,
  EMPTY_WORKSPACE,
  loadSettings,
  loadWorkspaceState,
  saveSettings,
  saveWorkspaceState,
  scaleNutrients,
  WorkspaceState,
} from './utils/storage';
import { AssistantView } from './views/AssistantView';
import { DashboardView } from './views/DashboardView';
import { FavouritesView } from './views/FavouritesView';
import { FoodDatabaseView } from './views/FoodDatabaseView';
import { FoodSafetyView } from './views/FoodSafetyView';
import { FoodScannerView } from './views/FoodScannerView';
import { HomeView } from './views/HomeView';
import { NutritionView } from './views/NutritionView';
import { RecipeStudioView } from './views/RecipeStudioView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeNav, setActiveNav] = useState<NavSection>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundPopoverOpen, setSoundPopoverOpen] = useState(false);
  const [booting, setBooting] = useState(true);

  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [workspace, setWorkspace] = useState<WorkspaceState>(EMPTY_WORKSPACE);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem>(FOODS_DATABASE[0]);

  // Initial load of IndexedDB workspace + server health check
  useEffect(() => {
    let active = true;
    void loadWorkspaceState().then((loaded) => {
      if (active) {
        setWorkspace(loaded);
        setWorkspaceLoaded(true);
      }
    });

    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (active) setAiConfigured(Boolean(data?.aiConfigured));
      })
      .catch(() => {
        if (active) setAiConfigured(false);
      });

    const timer = window.setTimeout(() => {
      if (active) setBooting(false);
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  // Persist workspace to IndexedDB / localStorage whenever updated
  useEffect(() => {
    if (workspaceLoaded) {
      void saveWorkspaceState(workspace);
    }
  }, [workspace, workspaceLoaded]);

  // Sync audio engine & settings
  useEffect(() => {
    saveSettings(settings);
    soundEngine.configure({
      enabled: settings.soundEnabled,
      mode: settings.ambienceMode,
      volume: settings.soundVolume,
      sfxEnabled: settings.interactionSfx,
    });
  }, [settings]);

  const updateSettings = (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const playSfx = (kind: 'click' | 'success' | 'chime') => {
    soundEngine.playInteraction(kind);
  };

  const allFoods = useMemo(
    () => [...workspace.customFoods, ...FOODS_DATABASE],
    [workspace.customFoods]
  );

  const allRecipes = useMemo(
    () => [...workspace.customRecipes, ...RECIPES_DATABASE],
    [workspace.customRecipes]
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLogs = useMemo(
    () => workspace.mealLogs.filter((l) => l.dateISO === todayISO),
    [workspace.mealLogs, todayISO]
  );

  const t = UI_TRANSLATIONS[settings.language];

  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.nav.home, icon: <Home className="w-4 h-4" /> },
    { id: 'scanner', label: t.nav.scanner, icon: <Camera className="w-4 h-4" /> },
    { id: 'nutrition', label: t.nav.nutrition, icon: <Activity className="w-4 h-4" /> },
    { id: 'recipes', label: t.nav.recipes, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'assistant', label: t.nav.assistant, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'database', label: t.nav.database, icon: <Database className="w-4 h-4" /> },
    { id: 'safety', label: t.nav.safety, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'dashboard', label: t.nav.dashboard, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'favourites', label: t.nav.favourites, icon: <Heart className="w-4 h-4" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavigate = (section: NavSection) => {
    setActiveNav(section);
    setMobileMenuOpen(false);
    playSfx('click');
    window.scrollTo({ top: 0, behavior: settings.reduceAnimations ? 'auto' : 'smooth' });
  };

  const handleLogMeal = (food: FoodItem, grams: number, slot: MealSlot) => {
    const entry: MealLogEntry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      dateISO: todayISO,
      timestamp: new Date().toISOString(),
      mealSlot: slot,
      foodId: food.id,
      foodName: food.name,
      grams,
      nutrients: scaleNutrients(food.per100g, grams),
    };
    setWorkspace((prev) => ({
      ...prev,
      mealLogs: [entry, ...prev.mealLogs],
    }));
    playSfx('success');
  };

  const handleToggleFavoriteFood = (foodId: string) => {
    setWorkspace((prev) => {
      const exists = prev.favoriteFoodIds.includes(foodId);
      return {
        ...prev,
        favoriteFoodIds: exists
          ? prev.favoriteFoodIds.filter((id) => id !== foodId)
          : [foodId, ...prev.favoriteFoodIds],
      };
    });
    playSfx('click');
  };

  const handleToggleSaveRecipe = (recipeId: string) => {
    setWorkspace((prev) => {
      const exists = prev.savedRecipeIds.includes(recipeId);
      return {
        ...prev,
        savedRecipeIds: exists
          ? prev.savedRecipeIds.filter((id) => id !== recipeId)
          : [recipeId, ...prev.savedRecipeIds],
      };
    });
    playSfx('click');
  };

  const handleRecordSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setWorkspace((prev) => ({
      ...prev,
      searchHistory: [clean, ...prev.searchHistory.filter((x) => x !== clean)].slice(0, 8),
    }));
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row relative ${
        settings.reduceAnimations ? 'reduce-motion' : ''
      }`}
    >
      {/* Animated Outer-Space Canvas */}
      <SpaceBackground reduceAnimations={settings.reduceAnimations} />

      {/* Brief Cosmic Loading Overlay */}
      <AnimatePresence>
        {booting && !settings.reduceAnimations && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 bg-[#040712] flex flex-col items-center justify-center gap-4"
          >
            <NutriLogo />
            <div className="w-44 h-1 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Fixed Left Sidebar Rail */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen glass-panel border-r border-slate-800/80 p-5 justify-between z-30">
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-left w-full cursor-pointer"
          >
            <NutriLogo tagline={t.tagline} />
          </button>

          <nav aria-label="Primary Navigation" className="space-y-1">
            {navItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-cyan-200 border border-cyan-400/35'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={active ? 'text-cyan-300' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <PWAInstallButton />
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Local-first nutrition data · USDA FDC &amp; NIN IFCT references
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact Single-Row Top Bar (<= 64px height, <= 15% mobile height) */}
        <header className="sticky top-0 z-30 h-14 md:h-16 glass-panel border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <NutriLogo compact />
            </div>
            <div className="hidden lg:block font-display text-sm font-semibold text-slate-200 truncate">
              {navItems.find((n) => n.id === activeNav)?.label}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Language Selector */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-300" />
              <select
                aria-label="Select application language"
                value={settings.language}
                onChange={(e) =>
                  updateSettings({ language: e.target.value as LanguageCode })
                }
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-950">
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sound System Control (OFF by default) */}
            <div className="relative">
              <div className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    updateSettings({ soundEnabled: !settings.soundEnabled })
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    settings.soundEnabled
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="hidden sm:inline">
                    {settings.soundEnabled ? t.soundOn : t.soundOff}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSoundPopoverOpen((v) => !v)}
                  aria-label="Open sound mixer"
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-white border-l border-slate-800 cursor-pointer"
                >
                  ▾
                </button>
              </div>

              {soundPopoverOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl glass-panel-elevated p-4 shadow-2xl space-y-3 z-40 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Nature Soundscape</span>
                    <button
                      type="button"
                      onClick={() => setSoundPopoverOpen(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    aria-label="Select ambience mode"
                    value={settings.ambienceMode}
                    onChange={(e) =>
                      updateSettings({ ambienceMode: e.target.value as AmbienceMode })
                    }
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-2 text-white"
                  >
                    <option value="forest_birds">Morning Forest &amp; Birds</option>
                    <option value="gentle_nature">Gentle Forest Breeze</option>
                    <option value="silent">Silent (SFX only)</option>
                  </select>

                  <label className="block space-y-1">
                    <span className="text-slate-400 flex justify-between">
                      <span>Volume</span>
                      <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.soundVolume}
                      onChange={(e) =>
                        updateSettings({ soundVolume: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('scanner')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 whitespace-nowrap cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>
        </header>

        {/* Mobile Full-Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden flex"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.2 }}
                className="w-72 max-w-[85vw] h-full glass-panel-elevated p-5 flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <NutriLogo tagline={t.tagline} />
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close navigation menu"
                      className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const active = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium cursor-pointer ${
                            active
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/35'
                              : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <PWAInstallButton />
                  <select
                    aria-label="Mobile language switcher"
                    value={settings.language}
                    onChange={(e) =>
                      updateSettings({ language: e.target.value as LanguageCode })
                    }
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Page Viewport */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={settings.reduceAnimations ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={settings.reduceAnimations ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: settings.reduceAnimations ? 0 : 0.18 }}
            >
              {activeNav === 'home' && (
                <HomeView
                  language={settings.language}
                  foods={allFoods}
                  todayLogs={todayLogs}
                  searchHistory={workspace.searchHistory}
                  favoriteFoodIds={workspace.favoriteFoodIds}
                  aiConfigured={aiConfigured}
                  reduceAnimations={settings.reduceAnimations}
                  onNavigate={handleNavigate}
                  onSelectFood={(f) => setSelectedFood(f)}
                  onRecordSearch={handleRecordSearch}
                  onOrbClick={() => handleNavigate('assistant')}
                />
              )}

              {activeNav === 'scanner' && (
                <FoodScannerView
                  language={settings.language}
                  aiConfigured={aiConfigured}
                  foods={allFoods}
                  onLogMeal={handleLogMeal}
                  onInspectFood={(f) => {
                    setSelectedFood(f);
                    handleNavigate('nutrition');
                  }}
                  onSaveLabel={(lbl: SavedFoodLabel) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      savedLabels: [lbl, ...prev.savedLabels],
                    }));
                  }}
                  onPlaySfx={playSfx}
                />
              )}

              {activeNav === 'nutrition' && (
                <NutritionView
                  foods={allFoods}
                  selectedFood={selectedFood}
                  language={settings.language}
                  favoriteFoodIds={workspace.favoriteFoodIds}
                  onSelectFood={(f) => setSelectedFood(f)}
                  onToggleFavorite={handleToggleFavoriteFood}
                  onLogMeal={handleLogMeal}
                />
              )}

              {activeNav === 'recipes' && (
                <RecipeStudioView
                  recipes={allRecipes}
                  foods={allFoods}
                  savedRecipeIds={workspace.savedRecipeIds}
                  onToggleSaveRecipe={handleToggleSaveRecipe}
                  onCreateRecipe={(r: RecipeItem) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      customRecipes: [r, ...prev.customRecipes],
                      savedRecipeIds: [r.id, ...prev.savedRecipeIds],
                    }));
                  }}
                  onDeleteCustomRecipe={(id: string) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      customRecipes: prev.customRecipes.filter((r) => r.id !== id),
                      savedRecipeIds: prev.savedRecipeIds.filter((rid) => rid !== id),
                    }));
                  }}
                  onPlaySfx={playSfx}
                />
              )}

              {activeNav === 'assistant' && (
                <AssistantView
                  language={settings.language}
                  aiConfigured={aiConfigured}
                  foods={allFoods}
                  reduceAnimations={settings.reduceAnimations}
                  onChangeLanguage={(lang) => updateSettings({ language: lang })}
                  onPlaySfx={playSfx}
                />
              )}

              {activeNav === 'database' && (
                <FoodDatabaseView
                  foods={allFoods}
                  language={settings.language}
                  favoriteFoodIds={workspace.favoriteFoodIds}
                  onInspectFood={(f) => {
                    setSelectedFood(f);
                    handleNavigate('nutrition');
                  }}
                  onToggleFavorite={handleToggleFavoriteFood}
                  onLogMeal={handleLogMeal}
                  onAddCustomFood={(f) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      customFoods: [f, ...prev.customFoods],
                    }));
                    playSfx('success');
                  }}
                  onDeleteCustomFood={(id) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      customFoods: prev.customFoods.filter((f) => f.id !== id),
                      favoriteFoodIds: prev.favoriteFoodIds.filter((fid) => fid !== id),
                    }));
                  }}
                />
              )}

              {activeNav === 'safety' && <FoodSafetyView />}

              {activeNav === 'dashboard' && (
                <DashboardView
                  mealLogs={workspace.mealLogs}
                  foods={allFoods}
                  recipes={allRecipes}
                  favoriteFoodIds={workspace.favoriteFoodIds}
                  savedRecipeIds={workspace.savedRecipeIds}
                  onLogMeal={handleLogMeal}
                  onRemoveLog={(id) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      mealLogs: prev.mealLogs.filter((m) => m.id !== id),
                    }));
                  }}
                  onNavigate={handleNavigate}
                  onInspectFood={(f) => {
                    setSelectedFood(f);
                    handleNavigate('nutrition');
                  }}
                />
              )}

              {activeNav === 'favourites' && (
                <FavouritesView
                  foods={allFoods}
                  recipes={allRecipes}
                  favoriteFoodIds={workspace.favoriteFoodIds}
                  savedRecipeIds={workspace.savedRecipeIds}
                  savedLabels={workspace.savedLabels}
                  onInspectFood={(f) => {
                    setSelectedFood(f);
                    handleNavigate('nutrition');
                  }}
                  onToggleFavoriteFood={handleToggleFavoriteFood}
                  onToggleSaveRecipe={handleToggleSaveRecipe}
                  onRemoveLabel={(id) => {
                    setWorkspace((prev) => ({
                      ...prev,
                      savedLabels: prev.savedLabels.filter((l) => l.id !== id),
                    }));
                  }}
                  onLogMeal={handleLogMeal}
                  onNavigate={handleNavigate}
                />
              )}

              {activeNav === 'settings' && (
                <SettingsView
                  settings={settings}
                  workspace={workspace}
                  aiConfigured={aiConfigured}
                  onUpdateSettings={updateSettings}
                  onClearAllData={async () => {
                    await clearAllLocalData();
                    setSettings(DEFAULT_SETTINGS);
                    setWorkspace({
                      mealLogs: [],
                      favoriteFoodIds: [],
                      savedRecipeIds: [],
                      customFoods: [],
                      customRecipes: [],
                      savedLabels: [],
                      searchHistory: [],
                    });
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Quiet Footer */}
        <footer className="px-4 md:px-8 py-5 border-t border-slate-800/70 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1280px] w-full mx-auto">
          <div>
            NutriAI · Eat Smart • Live Healthy · Educational Food Intelligence
          </div>
          <div>
            Visual estimates cannot verify food safety. Consult qualified health professionals for medical guidance.
          </div>
        </footer>
      </div>

      <OfflineIndicator />
    </div>
  );
}
