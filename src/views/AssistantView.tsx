import React, { useRef, useState } from 'react';
import { Send, Sparkles, WifiOff } from 'lucide-react';
import { AIOrb } from '../components/AIOrb';
import { LANGUAGES } from '../data/translations';
import { ChatMessage, FoodItem, LanguageCode } from '../types/nutrition';

interface AssistantViewProps {
  language: LanguageCode;
  aiConfigured: boolean | null;
  foods: FoodItem[];
  reduceAnimations: boolean;
  onChangeLanguage: (lang: LanguageCode) => void;
  onPlaySfx: (kind: 'click' | 'success' | 'chime') => void;
}

const QUICK_PROMPTS = [
  'Compare Steamed Idli vs Pesarattu for breakfast protein & fibre',
  'Explain dietary fibre and glycemic balance in simple language',
  'Suggest a balanced Telangana or South Indian lunch idea',
  'How do I read Added Sugar and Trans Fat on a food label?',
  'Which Indian vegetables are richest in iron, folate, and calcium?',
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  language,
  aiConfigured,
  foods,
  reduceAnimations,
  onChangeLanguage,
  onPlaySfx,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      mode: aiConfigured ? 'gemini' : 'demo',
      timestamp: new Date().toISOString(),
      text: aiConfigured
        ? 'Hello! I am NutriAI powered by Gemini. Ask me about Indian or international dishes, compare two foods, decode food labels, or explore nutrients in your preferred language.'
        : 'Hello! Live Gemini AI is not configured on this server right now, so I am running in Built-in Demo Assistant mode using NutriAI’s local verified food composition database. Ask me to compare foods, explain nutrients, or suggest recipes!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const buildDemoFallbackReply = (query: string): string => {
    const q = query.toLowerCase();

    // Match any two foods in the local DB if user asks to compare
    const matchedFoods = foods.filter(
      (f) =>
        q.includes(f.name.toLowerCase().split(' ')[0]) ||
        f.searchAliases?.some((a) => q.includes(a.toLowerCase())) ||
        Object.values(f.regionalNames).some(
          (rn) =>
            rn &&
            (q.includes(rn.transliteration.toLowerCase()) || q.includes(rn.script))
        )
    );

    if (q.includes('compare') && matchedFoods.length >= 2) {
      const [a, b] = matchedFoods;
      return `[Demo Assistant — Local Database Lookup]
Comparing **${a.name}** vs **${b.name}** (per 100g):
• Energy: ${a.per100g.calories} kcal vs ${b.per100g.calories} kcal
• Protein: ${a.per100g.proteinG}g vs ${b.per100g.proteinG}g
• Carbohydrates: ${a.per100g.carbohydratesG}g vs ${b.per100g.carbohydratesG}g
• Dietary Fibre: ${a.per100g.fibreG}g vs ${b.per100g.fibreG}g
• Sodium: ${a.per100g.sodiumMg}mg vs ${b.per100g.sodiumMg}mg
• Sources: ${a.source} | ${b.source}

Note: This response was generated locally without a live Gemini API connection.`;
    }

    if (matchedFoods.length >= 1) {
      const f = matchedFoods[0];
      return `[Demo Assistant — Local Database Lookup]
Here is the verified/composite profile for **${f.name}** (${f.servingSizeLabel}, ${f.servingWeightGrams}g):
• Per 100g: ${f.per100g.calories} kcal · ${f.per100g.proteinG}g protein · ${f.per100g.carbohydratesG}g carbs · ${f.per100g.totalFatG}g fat · ${f.per100g.fibreG}g fibre
• Key micronutrients (/100g): Iron ${f.per100g.ironMg}mg, Calcium ${f.per100g.calciumMg}mg, Potassium ${f.per100g.potassiumMg}mg, Folate ${f.per100g.folateMcg}mcg.
• Uncertainty note: ${f.uncertaintyNote}

Note: Configure GEMINI_API_KEY on the server for conversational live Gemini responses.`;
    }

    if (q.includes('label') || q.includes('sugar') || q.includes('trans fat')) {
      return `[Demo Assistant — Nutrition Label Guide]
When reading a packaged food label:
1. Check **Serving Size** first—all numbers apply to one serving, not the whole packet.
2. **Added Sugar** is sugar added during processing, separate from natural milk/fruit sugars.
3. **Trans Fat** should ideally be 0g; also scan the ingredient list for "partially hydrogenated vegetable oil".
4. Look at **Sodium (mg)** and **Dietary Fibre (g)** together to evaluate packaged snacks.

Note: This is an offline Demo Assistant response (not a live Gemini connection).`;
    }

    if (q.includes('iron') || q.includes('calcium') || q.includes('folate') || q.includes('fibre')) {
      return `[Demo Assistant — Micronutrient Spotlight]
Nutrient-dense foods in our local database:
• **Iron & Folate**: Fresh Spinach / Palak (2.71mg iron, 194mcg folate/100g), Moringa / Drumstick Leaves (4.0mg iron/100g), Toor Dal & Green Moong. Pair plant iron with Vitamin C (like Guava at 228mg/100g or lemon juice) to support absorption.
• **Calcium**: Ragi Sangati (118mg/100g), Moringa Leaves (185mg/100g), Plain Curd / Dahi (121mg/100g), and Almonds (269mg/100g).

Note: Running in local Demo Assistant mode.`;
    }

    return `[Demo Assistant — Offline/Fallback Mode]
I am running locally without an active Gemini API key, so I cannot perform open-ended generative reasoning right now. However, you can ask me to look up or compare foods in our database (e.g., "Compare Idli vs Pesarattu", "Tell me about Moringa leaves", "Explain food labels"), or inspect all 20 nutrients in the Nutrition and Food Database tabs!`;
  };

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: content,
      mode: aiConfigured ? 'gemini' : 'demo',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    onPlaySfx('click');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          language,
          history: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) {
        throw new Error('Gemini unavailable');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          mode: 'gemini',
          timestamp: new Date().toISOString(),
        },
      ]);
      onPlaySfx('success');
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: buildDemoFallbackReply(content),
          mode: 'demo',
          timestamp: new Date().toISOString(),
        },
      ]);
      onPlaySfx('chime');
    } finally {
      setLoading(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Mode Banner */}
      <div className="glass-panel-elevated rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AIOrb
            size={68}
            active={!loading}
            thinking={loading}
            reduceAnimations={reduceAnimations}
            onClick={() => onPlaySfx('chime')}
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              NutriAI Assistant
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              {aiConfigured ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Connected to Live Gemini AI (Server-side secured)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                  <span>Built-in Demo Assistant (Honest local fallback — Gemini API key not set)</span>
                </>
              )}
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300">
          <span>Response Language:</span>
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void sendMessage(prompt)}
            className="rounded-xl border border-slate-800 bg-slate-900/75 hover:border-cyan-400/50 px-3.5 py-2 text-xs text-slate-200 transition-colors cursor-pointer text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 border border-cyan-400/35 text-white'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="text-[11px] font-medium text-cyan-300 mb-1">
                    {m.mode === 'gemini' ? 'NutriAI · Live Gemini' : 'NutriAI · Demo Assistant'}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-3 text-xs text-cyan-300">
                Thinking through nutrition composition...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
          }}
          className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about nutrients, compare foods, Indian dishes, or food labels..."
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 disabled:opacity-40 px-5 py-3 text-sm font-semibold text-slate-950 hover:brightness-110 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
