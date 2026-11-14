import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  FileText,
  Info,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  FoodItem,
  LanguageCode,
  MealSlot,
  NutrientProfile,
  SavedFoodLabel,
} from '../types/nutrition';

interface FoodScannerViewProps {
  language: LanguageCode;
  aiConfigured: boolean | null;
  foods: FoodItem[];
  onLogMeal: (food: FoodItem, grams: number, slot: MealSlot) => void;
  onInspectFood: (food: FoodItem) => void;
  onSaveLabel: (label: SavedFoodLabel) => void;
  onPlaySfx: (kind: 'click' | 'success' | 'chime') => void;
}

interface VisionAnalysisResult {
  foodName: string;
  cuisine: string;
  foodCategory: string;
  visibleIngredients: string[];
  approximatePortionSize: string;
  estimatedWeightGrams: number;
  cookingMethod: string;
  visualObservations: {
    discoloration: string;
    moldLikeAreas: string;
    burntAppearance: string;
  };
  confidenceLevel: string;
  confidenceScore: number;
  uncertaintyExplanation: string;
  safetyWarning: string;
  estimatedPer100g: {
    calories: number;
    carbohydratesG: number;
    proteinG: number;
    totalFatG: number;
    saturatedFatG: number;
    fibreG: number;
    sugarG: number;
    sodiumMg: number;
  };
  isDemoFallback?: boolean;
}

interface LabelDraft {
  productName: string;
  servingSize: string;
  servingWeightGrams: string;
  ingredients: string;
  allergens: string;
  expiryDate: string;
  manufacturer: string;
  calories: string;
  carbohydratesG: string;
  proteinG: string;
  totalFatG: string;
  saturatedFatG: string;
  transFatG: string;
  fibreG: string;
  totalSugarG: string;
  addedSugarG: string;
  sodiumMg: string;
  legibilityNotes: string;
  illegibleFields: string[];
  isDemoFallback?: boolean;
}

function createSampleCanvasDataUrl(kind: 'meal' | 'label'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (kind === 'meal') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 420);
    // Plate
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(320, 210, 165, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(320, 210, 140, 0, Math.PI * 2);
    ctx.fill();
    // 2 Steamed Idlis
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(265, 195, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(355, 165, 50, 0, Math.PI * 2);
    ctx.fill();
    // Sambar bowl
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(350, 275, 46, 0, Math.PI * 2);
    ctx.fill();
    // Chutney
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(240, 275, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Sample South Indian Breakfast Plate (Demo Image)', 155, 398);
  } else {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 640, 420);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 24, 568, 372);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('NUTRITION FACTS — WHOLEGRAIN OAT CRACKERS', 56, 66);
    ctx.font = '16px monospace';
    ctx.fillText('Serving Size: 30g (6 crackers)', 56, 102);
    ctx.fillText('Calories: 132 kcal | Carbs: 20.5g | Protein: 3.4g', 56, 134);
    ctx.fillText('Total Fat: 4.1g | Sat Fat: 0.8g | Trans Fat: 0g', 56, 166);
    ctx.fillText('Dietary Fibre: 2.9g | Total Sugar: 1.8g | Added Sugar: 1.5g', 56, 198);
    ctx.fillText('Sodium: 145 mg', 56, 230);
    ctx.font = '14px sans-serif';
    ctx.fillText('Ingredients: Whole grain rolled oats (68%), sunflower oil, jaggery, sea salt.', 56, 274);
    ctx.fillText('Allergens: Oats (may contain traces of wheat and sesame).', 56, 304);
    ctx.fillText('Best Before: 18 AUG 2027 | Mfr: Deccan Harvest Foods Pvt. Ltd.', 56, 334);
  }
  return canvas.toDataURL('image/jpeg', 0.9);
}

export const FoodScannerView: React.FC<FoodScannerViewProps> = ({
  language,
  aiConfigured,
  onLogMeal,
  onInspectFood,
  onSaveLabel,
  onPlaySfx,
}) => {
  const [mode, setMode] = useState<'food' | 'label'>('food');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [uploadConsent, setUploadConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [foodResult, setFoodResult] = useState<VisionAnalysisResult | null>(null);
  const [labelDraft, setLabelDraft] = useState<LabelDraft | null>(null);
  const [labelSavedBanner, setLabelSavedBanner] = useState(false);
  const [loggedBanner, setLoggedBanner] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    onPlaySfx('click');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. Please upload a food photograph instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Camera permission denied or camera hardware unavailable.';
      setCameraError(`Unable to open camera (${msg}). You can upload an image or load a sample photo below.`);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImageDataUrl(dataUrl);
    setFoodResult(null);
    setLabelDraft(null);
    setAnalysisError(null);
    stopCamera();
    onPlaySfx('chime');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageDataUrl(reader.result);
        setFoodResult(null);
        setLabelDraft(null);
        setAnalysisError(null);
        setLabelSavedBanner(false);
        setLoggedBanner(false);
        onPlaySfx('chime');
      }
    };
    reader.readAsDataURL(file);
  };

  const loadSample = () => {
    const sampleUrl = createSampleCanvasDataUrl(mode === 'food' ? 'meal' : 'label');
    setImageDataUrl(sampleUrl);
    setFoodResult(null);
    setLabelDraft(null);
    setAnalysisError(null);
    setLabelSavedBanner(false);
    setLoggedBanner(false);
    onPlaySfx('click');
  };

  const runDemoFoodFallback = (): VisionAnalysisResult => ({
    foodName: 'Steamed Idli with Sambar & Coconut Chutney (Demo Sample)',
    cuisine: 'South Indian',
    foodCategory: 'Indian foods',
    visibleIngredients: ['Fermented rice & urad dal cakes (idli)', 'Lentil vegetable sambar', 'Coconut chutney'],
    approximatePortionSize: '2 medium idlis + 1 small bowl sambar (approx. 210g total)',
    estimatedWeightGrams: 210,
    cookingMethod: 'Steamed (idli) & simmered (sambar)',
    visualObservations: {
      discoloration: 'No obvious abnormal discoloration detected in preview.',
      moldLikeAreas: 'No visible surface mold-like patches observed.',
      burntAppearance: 'No charring or burnt surfaces observed (steamed dish).',
    },
    confidenceLevel: 'moderate',
    confidenceScore: 74,
    uncertaintyExplanation:
      'Demo Simulation Mode (live Gemini vision unavailable). Exact fermentation ratio, oil in sambar tempering, and salt level cannot be known visually.',
    safetyWarning:
      'IMPORTANT: Camera analysis NEVER proves food is fresh or safe. Hidden bacteria, toxins, spoilage microbes, or allergens cannot be reliably detected from photographs.',
    estimatedPer100g: {
      calories: 132,
      carbohydratesG: 24.5,
      proteinG: 4.6,
      totalFatG: 1.9,
      saturatedFatG: 0.8,
      fibreG: 2.1,
      sugarG: 1.2,
      sodiumMg: 235,
    },
    isDemoFallback: true,
  });

  const runDemoLabelFallback = (): LabelDraft => ({
    productName: 'Wholegrain Oat Crackers (Demo Sample)',
    servingSize: '30g (6 crackers)',
    servingWeightGrams: '30',
    ingredients: 'Whole grain rolled oats (68%), sunflower oil, jaggery, sea salt.',
    allergens: 'Oats (may contain traces of wheat and sesame)',
    expiryDate: '18 AUG 2027',
    manufacturer: 'Deccan Harvest Foods Pvt. Ltd.',
    calories: '132',
    carbohydratesG: '20.5',
    proteinG: '3.4',
    totalFatG: '4.1',
    saturatedFatG: '0.8',
    transFatG: '0',
    fibreG: '2.9',
    totalSugarG: '1.8',
    addedSugarG: '1.5',
    sodiumMg: '145',
    legibilityNotes:
      'Demo Simulation Mode: Live Gemini OCR unavailable. Please confirm or edit every field below before saving.',
    illegibleFields: [],
    isDemoFallback: true,
  });

  const handleAnalyze = async () => {
    if (!imageDataUrl) return;
    if (!uploadConsent) {
      setAnalysisError('Please check the privacy consent box before uploading your photograph for analysis.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setLabelSavedBanner(false);
    setLoggedBanner(false);
    onPlaySfx('click');

    if (mode === 'food') {
      try {
        const res = await fetch('/api/ai/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            mimeType: 'image/jpeg',
            language,
          }),
        });
        if (!res.ok) {
          throw new Error('Live AI unavailable');
        }
        const data = await res.json();
        setFoodResult(data.analysis);
        onPlaySfx('success');
      } catch {
        setFoodResult(runDemoFoodFallback());
        onPlaySfx('chime');
      } finally {
        setAnalyzing(false);
      }
    } else {
      try {
        const res = await fetch('/api/ai/analyze-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            mimeType: 'image/jpeg',
          }),
        });
        if (!res.ok) {
          throw new Error('Live AI unavailable');
        }
        const data = await res.json();
        const l = data.label ?? {};
        const nf = l.nutritionFacts ?? {};
        const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));
        setLabelDraft({
          productName: str(l.productName),
          servingSize: str(l.servingSize),
          servingWeightGrams: str(l.servingWeightGrams),
          ingredients: str(l.ingredients),
          allergens: str(l.allergens),
          expiryDate: str(l.expiryDate),
          manufacturer: str(l.manufacturer),
          calories: str(nf.calories),
          carbohydratesG: str(nf.carbohydratesG),
          proteinG: str(nf.proteinG),
          totalFatG: str(nf.totalFatG),
          saturatedFatG: str(nf.saturatedFatG),
          transFatG: str(nf.transFatG),
          fibreG: str(nf.fibreG),
          totalSugarG: str(nf.totalSugarG),
          addedSugarG: str(nf.addedSugarG),
          sodiumMg: str(nf.sodiumMg),
          legibilityNotes: str(l.legibilityNotes) || 'Confirm all extracted text carefully before saving.',
          illegibleFields: Array.isArray(l.illegibleFields) ? l.illegibleFields : [],
        });
        onPlaySfx('success');
      } catch {
        setLabelDraft(runDemoLabelFallback());
        onPlaySfx('chime');
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const buildFoodFromVision = (r: VisionAnalysisResult): FoodItem => {
    const per100g: NutrientProfile = {
      calories: r.estimatedPer100g?.calories ?? 0,
      carbohydratesG: r.estimatedPer100g?.carbohydratesG ?? 0,
      proteinG: r.estimatedPer100g?.proteinG ?? 0,
      totalFatG: r.estimatedPer100g?.totalFatG ?? 0,
      saturatedFatG: r.estimatedPer100g?.saturatedFatG ?? 0,
      transFatG: null,
      fibreG: r.estimatedPer100g?.fibreG ?? 0,
      totalSugarG: r.estimatedPer100g?.sugarG ?? 0,
      addedSugarG: null,
      sodiumMg: r.estimatedPer100g?.sodiumMg ?? 0,
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

    return {
      id: `scan-${Date.now()}`,
      name: r.foodName,
      cuisine: r.cuisine || 'Scanned',
      category: 'Indian foods',
      servingSizeLabel: r.approximatePortionSize || '1 estimated portion',
      servingWeightGrams: r.estimatedWeightGrams || 150,
      per100g,
      source: r.isDemoFallback
        ? 'NutriAI Demo Visual Estimate (Not Lab Verified)'
        : 'Gemini Vision Estimate (Visual Approximation Only)',
      dataQuality: 'composite_estimate',
      uncertaintyNote: r.uncertaintyExplanation,
      regionalNames: {},
      isCustom: true,
    };
  };

  const handleConfirmSaveLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelDraft) return;
    const numOrNull = (s: string) => {
      const trimmed = s.trim();
      if (!trimmed) return null;
      const n = Number(trimmed);
      return Number.isFinite(n) ? n : null;
    };

    const saved: SavedFoodLabel = {
      id: `label-${Date.now()}`,
      savedAt: new Date().toISOString(),
      productName: labelDraft.productName.trim() || 'Unnamed Packaged Product',
      servingSize: labelDraft.servingSize.trim() || 'Unreadable',
      servingWeightGrams: numOrNull(labelDraft.servingWeightGrams),
      ingredients: labelDraft.ingredients.trim(),
      allergens: labelDraft.allergens.trim(),
      expiryDate: labelDraft.expiryDate.trim(),
      manufacturer: labelDraft.manufacturer.trim(),
      nutritionFacts: {
        calories: numOrNull(labelDraft.calories),
        carbohydratesG: numOrNull(labelDraft.carbohydratesG),
        proteinG: numOrNull(labelDraft.proteinG),
        totalFatG: numOrNull(labelDraft.totalFatG),
        saturatedFatG: numOrNull(labelDraft.saturatedFatG),
        transFatG: numOrNull(labelDraft.transFatG),
        fibreG: numOrNull(labelDraft.fibreG),
        totalSugarG: numOrNull(labelDraft.totalSugarG),
        addedSugarG: numOrNull(labelDraft.addedSugarG),
        sodiumMg: numOrNull(labelDraft.sodiumMg),
      },
      legibilityNotes: labelDraft.legibilityNotes,
    };

    onSaveLabel(saved);
    setLabelSavedBanner(true);
    onPlaySfx('success');
  };

  return (
    <div className="space-y-6">
      {/* Header + Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Food Camera & Label Reader
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {aiConfigured
              ? 'Live Gemini Vision ready · Photos are analyzed only with your explicit consent.'
              : 'Demo Simulation mode ready · Add GEMINI_API_KEY on the server for live photo vision.'}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-900/80 border border-slate-700/80 p-1 self-start">
          <button
            type="button"
            onClick={() => {
              setMode('food');
              setLabelDraft(null);
              setAnalysisError(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'food'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Food Photo Scanner
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('label');
              setFoodResult(null);
              setAnalysisError(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              mode === 'label'
                ? 'bg-violet-500/20 text-violet-200 border border-violet-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Packaged Label Reader
          </button>
        </div>
      </div>

      {/* Prominent Food Safety Warning */}
      <div className="rounded-xl border border-amber-400/35 bg-amber-950/30 px-5 py-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-amber-100/90 leading-relaxed">
          <strong className="text-amber-200">Safety Notice:</strong> Camera analysis never proves food is fresh or safe. Hidden bacteria, pathogens, toxins, and chemical contamination cannot reliably be detected from photographs.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Capture & Preview Stage */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-white">
              {mode === 'food' ? '01. Capture or Upload Dish' : '01. Capture Packaged Label'}
            </h2>
            {imageDataUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageDataUrl(null);
                  setFoodResult(null);
                  setLabelDraft(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Camera / Image Viewport */}
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt={mode === 'food' ? 'Captured food preview' : 'Captured food label preview'}
                className="w-full h-full object-contain bg-slate-950"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-400">
                  Open your device camera, upload an image, or try a sample photograph.
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
              {cameraError}
            </div>
          )}

          {/* Camera & Upload Controls */}
          <div className="grid grid-cols-2 gap-2.5">
            {!cameraActive ? (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3 py-2.5 text-xs font-medium text-white cursor-pointer"
              >
                <Camera className="w-4 h-4 text-cyan-300" />
                Open Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={capturePhoto}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3 py-2.5 text-xs font-medium text-white cursor-pointer"
            >
              <Upload className="w-4 h-4 text-violet-300" />
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={loadSample}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/50 hover:bg-slate-800/70 px-3 py-2 text-xs text-slate-300 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            Load Sample {mode === 'food' ? 'Meal' : 'Packaged Label'} Photo
          </button>

          {/* Privacy Consent before Upload */}
          <label className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={uploadConsent}
              onChange={(e) => setUploadConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 accent-cyan-400"
            />
            <span className="text-xs text-slate-300 leading-relaxed">
              I understand this photograph will be sent to the NutriAI analysis endpoint only when I click Analyze, and is not permanently stored on external servers.
            </span>
          </label>

          {analysisError && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-950/30 p-3 text-xs text-amber-200">
              {analysisError}
            </div>
          )}

          <button
            type="button"
            disabled={!imageDataUrl || analyzing}
            onClick={() => void handleAnalyze()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-slate-950 hover:brightness-110 transition-all cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Photograph...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {mode === 'food' ? 'Analyze Food Photograph' : 'Extract Legible Label Text'}
              </>
            )}
          </button>
        </div>

        {/* Right: Results Stage */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-5">
          {mode === 'food' ? (
            !foodResult ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-3 p-6">
                <Camera className="w-10 h-10 text-cyan-400/60" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Ready for Food Vision Analysis
                </h3>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  Capture or upload a dish photo to inspect identified food, cuisine, visible ingredients, portion size, cooking method, visual surface cues (discoloration, mold-like areas, charring), and confidence uncertainty.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-cyan-300 font-medium">
                      {foodResult.cuisine} · {foodResult.foodCategory}
                      {foodResult.isDemoFallback ? ' · Demo Simulation' : ' · Live Gemini Vision'}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mt-1">
                      {foodResult.foodName}
                    </h2>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs text-slate-400">Confidence</div>
                    <div className="text-lg font-bold text-cyan-300 capitalize">
                      {foodResult.confidenceLevel} ({foodResult.confidenceScore}%)
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-1.5">
                    <div className="text-xs text-slate-400">Approximate Portion</div>
                    <div className="text-white font-medium">
                      {foodResult.approximatePortionSize} ({foodResult.estimatedWeightGrams}g)
                    </div>
                    <div className="text-xs text-slate-400 pt-2">Cooking Method</div>
                    <div className="text-slate-200">{foodResult.cookingMethod}</div>
                  </div>

                  <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-1.5">
                    <div className="text-xs text-slate-400">Visible Ingredients</div>
                    <ul className="text-slate-200 text-xs space-y-1 list-disc list-inside">
                      {foodResult.visibleIngredients.map((ing) => (
                        <li key={ing}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Visual Surface Observations */}
                <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-300">
                    Visual Surface Inspection (Preliminary Visual Cues Only)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Discoloration</span>
                      <span className="text-slate-200">{foodResult.visualObservations.discoloration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Mold-like Areas</span>
                      <span className="text-slate-200">{foodResult.visualObservations.moldLikeAreas}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Burnt / Charred Look</span>
                      <span className="text-slate-200">{foodResult.visualObservations.burntAppearance}</span>
                    </div>
                  </div>
                </div>

                {/* Uncertainty & Safety Warning */}
                <div className="space-y-2.5 text-xs">
                  <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/25 p-3.5 text-cyan-100 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                    <div>
                      <strong>Uncertainty Explanation:</strong> {foodResult.uncertaintyExplanation}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-400/35 bg-amber-950/30 p-3.5 text-amber-100 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <div>{foodResult.safetyWarning}</div>
                  </div>
                </div>

                {/* Estimated Per 100g Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs tabular-nums">
                  <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
                    <div className="text-slate-400">Calories / 100g</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {foodResult.estimatedPer100g.calories} kcal
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
                    <div className="text-slate-400">Protein / 100g</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">
                      {foodResult.estimatedPer100g.proteinG} g
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
                    <div className="text-slate-400">Carbs / 100g</div>
                    <div className="text-base font-bold text-violet-300 mt-0.5">
                      {foodResult.estimatedPer100g.carbohydratesG} g
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
                    <div className="text-slate-400">Fat / 100g</div>
                    <div className="text-base font-bold text-emerald-300 mt-0.5">
                      {foodResult.estimatedPer100g.totalFatG} g
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const item = buildFoodFromVision(foodResult);
                      onLogMeal(item, item.servingWeightGrams, 'Lunch');
                      setLoggedBanner(true);
                      onPlaySfx('success');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Log Estimated Portion to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => onInspectFood(buildFoodFromVision(foodResult))}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-xs font-medium text-white hover:border-cyan-400/50 cursor-pointer"
                  >
                    Inspect Full Profile
                  </button>
                  {loggedBanner && (
                    <span className="text-xs text-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Logged to today&apos;s dashboard
                    </span>
                  )}
                </div>
              </div>
            )
          ) : !labelDraft ? (
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-3 p-6">
              <FileText className="w-10 h-10 text-violet-400/60" />
              <h3 className="font-display text-lg font-semibold text-white">
                Packaged Food Label Reader
              </h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Photograph a nutrition facts panel, ingredient list, allergen notice, and expiry date. Unreadable text is left blank rather than invented, and you can verify or edit every field before saving.
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmSaveLabel} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Confirm Extracted Label Text
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{labelDraft.legibilityNotes}</p>
                </div>
                {labelDraft.illegibleFields.length > 0 && (
                  <span className="text-xs text-amber-300">
                    Unreadable: {labelDraft.illegibleFields.join(', ')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-slate-400">Product Name</span>
                  <input
                    type="text"
                    value={labelDraft.productName}
                    onChange={(e) => setLabelDraft({ ...labelDraft, productName: e.target.value })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400">Serving Size</span>
                  <input
                    type="text"
                    value={labelDraft.servingSize}
                    onChange={(e) => setLabelDraft({ ...labelDraft, servingSize: e.target.value })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400">Expiry / Best Before Date</span>
                  <input
                    type="text"
                    value={labelDraft.expiryDate}
                    onChange={(e) => setLabelDraft({ ...labelDraft, expiryDate: e.target.value })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400">Manufacturer</span>
                  <input
                    type="text"
                    value={labelDraft.manufacturer}
                    onChange={(e) => setLabelDraft({ ...labelDraft, manufacturer: e.target.value })}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-xs">
                <span className="text-slate-400">Ingredients</span>
                <textarea
                  rows={2}
                  value={labelDraft.ingredients}
                  onChange={(e) => setLabelDraft({ ...labelDraft, ingredients: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <label className="block space-y-1 text-xs">
                <span className="text-slate-400">Allergens</span>
                <input
                  type="text"
                  value={labelDraft.allergens}
                  onChange={(e) => setLabelDraft({ ...labelDraft, allergens: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
                {(
                  [
                    ['calories', 'Calories (kcal)'],
                    ['carbohydratesG', 'Carbs (g)'],
                    ['proteinG', 'Protein (g)'],
                    ['totalFatG', 'Total Fat (g)'],
                    ['saturatedFatG', 'Sat Fat (g)'],
                    ['transFatG', 'Trans Fat (g)'],
                    ['fibreG', 'Fibre (g)'],
                    ['totalSugarG', 'Sugar (g)'],
                    ['addedSugarG', 'Added Sugar (g)'],
                    ['sodiumMg', 'Sodium (mg)'],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="space-y-1">
                    <span className="text-slate-400 font-sans block truncate">{label}</span>
                    <input
                      type="text"
                      value={labelDraft[field]}
                      placeholder="—"
                      onChange={(e) =>
                        setLabelDraft({ ...labelDraft, [field]: e.target.value })
                      }
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-white focus:border-cyan-400 focus:outline-none tabular-nums"
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:brightness-110 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Save Verified Label
                </button>
                {labelSavedBanner && (
                  <span className="text-xs text-emerald-300 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Saved to Favourites & Food Labels
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
