import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = "gemini-4-hydrogen";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // Health & service availability endpoint (never exposes secrets)
  app.get("/api/health", (_req, res) => {
    const aiConfigured = Boolean(getGeminiClient());
    res.json({
      status: "ok",
      aiConfigured,
      model: MODEL_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. AI Nutrition Assistant Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_UNCONFIGURED",
        message: "Live Gemini AI is not configured on the server. Using local demo assistant.",
      });
    }

    try {
      const { message, history = [], language = "en", contextSummary = "" } = req.body ?? {};
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "INVALID_REQUEST", message: "Message is required." });
      }

      const systemInstruction = `You are NutriAI, a scientific, empathetic, and clear food & nutrition intelligence assistant.
Rules you MUST follow:
1. Respond primarily in the user's selected language code: "${language}" (e.g., en=English, te=Telugu, hi=Hindi, ta=Tamil, kn=Kannada, ml=Malayalam, mr=Marathi, bn=Bengali, gu=Gujarati, pa=Punjabi). If using an Indian language, include familiar food terms clearly.
2. Provide accurate, evidence-based nutrition guidance referencing USDA FoodData Central and NIN/ICMR Indian Food Composition concepts where relevant. Never fabricate exact lab numbers if uncertain—state ranges and uncertainty honestly.
3. NEVER prescribe restrictive calorie limits, weight-loss diets, or fasting regimens to children or adolescents. Always prioritize balanced nourishment and recommend consulting a qualified pediatrician or registered dietitian for medical or pediatric dietary needs.
4. Explain nutrients in simple, practical everyday language. Support Indian regional dishes (South Indian, Telangana, Andhra, North Indian, etc.) as well as international cuisines.
5. For food safety questions, clearly state that visual appearance alone cannot guarantee food safety because hidden bacteria and toxins are invisible.
${contextSummary ? `\nLocal context from user's workspace:\n${contextSummary}` : ""}`;

      const formattedHistory = Array.isArray(history)
        ? history.slice(-10).map((item: { role?: string; text?: string }) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: String(item.text || "") }],
          }))
        : [];

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          ...formattedHistory,
          { role: "user", parts: [{ text: message }] },
        ],
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim() || "I could not generate a response right now. Please try rephrasing your nutrition question.";
      return res.json({
        mode: "gemini",
        model: MODEL_NAME,
        reply,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown AI service error";
      console.error("Gemini chat error:", msg);
      return res.status(502).json({
        error: "AI_SERVICE_ERROR",
        message: "The AI service encountered an error. You can continue using the local demo assistant.",
        details: msg,
      });
    }
  });

  // 2. Food Photo Vision Analyzer endpoint
  app.post("/api/ai/analyze-food", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_UNCONFIGURED",
        message: "Live Gemini vision is not configured on the server.",
      });
    }

    try {
      const { imageBase64, mimeType = "image/jpeg", language = "en" } = req.body ?? {};
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({ error: "INVALID_REQUEST", message: "Image data is required." });
      }

      const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

      const prompt = `Analyze this food photograph carefully. Respond in language "${language}" for descriptive fields while keeping structured keys in English.
CRITICAL SAFETY & HONESTY RULES:
- Identify the food name, cuisine, food category, visible ingredients, approximate portion size (with gram estimate), and cooking method when recognizable.
- Inspect carefully for visible discoloration, visible mold-like areas, or possible burnt/charred appearance. Report honestly if none are visible, or describe exactly what is visible without exaggerating.
- NEVER claim the food is proven fresh or safe to eat. Always state clearly that visual inspection cannot detect hidden bacteria, pathogens, toxins, or chemical contamination.
- Provide an honest confidence level ("high", "moderate", or "low"), numeric confidenceScore (0-100), and explain any uncertainty (occlusion, mixed sauces, lighting, unknown oil/salt quantities).
- Provide approximate nutrition estimates per 100g and for the estimated visible serving, clearly noting these are visual estimates. Use null (not 0) for transFatG or addedSugarG if unknown from visual inspection.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: { type: Type.STRING },
              cuisine: { type: Type.STRING },
              foodCategory: { type: Type.STRING },
              visibleIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              approximatePortionSize: { type: Type.STRING },
              estimatedWeightGrams: { type: Type.NUMBER },
              cookingMethod: { type: Type.STRING },
              visualObservations: {
                type: Type.OBJECT,
                properties: {
                  discoloration: { type: Type.STRING },
                  moldLikeAreas: { type: Type.STRING },
                  burntAppearance: { type: Type.STRING },
                },
              },
              confidenceLevel: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              uncertaintyExplanation: { type: Type.STRING },
              safetyWarning: { type: Type.STRING },
              estimatedPer100g: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  carbohydratesG: { type: Type.NUMBER },
                  proteinG: { type: Type.NUMBER },
                  totalFatG: { type: Type.NUMBER },
                  saturatedFatG: { type: Type.NUMBER },
                  fibreG: { type: Type.NUMBER },
                  sugarG: { type: Type.NUMBER },
                  sodiumMg: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json({
        mode: "gemini",
        model: MODEL_NAME,
        analysis: parsed,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Vision analysis failed";
      console.error("Gemini food vision error:", msg);
      return res.status(502).json({
        error: "AI_VISION_ERROR",
        message: "Food vision analysis failed. Please try a clearer image or use manual database lookup.",
        details: msg,
      });
    }
  });

  // 3. Packaged Food Label Reader endpoint
  app.post("/api/ai/analyze-label", async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_UNCONFIGURED",
        message: "Live Gemini label reader is not configured on the server.",
      });
    }

    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body ?? {};
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({ error: "INVALID_REQUEST", message: "Image data is required." });
      }

      const cleanBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

      const prompt = `Extract information from this packaged food label photograph.
STRICT INTEGRITY RULE:
- Extract ONLY text and numbers that are clearly legible in the image.
- If any field (product name, ingredients, nutrition facts, serving size, allergens, expiry date, manufacturer) is blurry, cut off, or unreadable, return "" (empty string) or null for that field and list it in illegibleFields.
- NEVER invent, guess, or hallucinate unreadable values.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              servingSize: { type: Type.STRING },
              servingWeightGrams: { type: Type.NUMBER, nullable: true },
              ingredients: { type: Type.STRING },
              allergens: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              manufacturer: { type: Type.STRING },
              nutritionFacts: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER, nullable: true },
                  carbohydratesG: { type: Type.NUMBER, nullable: true },
                  proteinG: { type: Type.NUMBER, nullable: true },
                  totalFatG: { type: Type.NUMBER, nullable: true },
                  saturatedFatG: { type: Type.NUMBER, nullable: true },
                  transFatG: { type: Type.NUMBER, nullable: true },
                  fibreG: { type: Type.NUMBER, nullable: true },
                  totalSugarG: { type: Type.NUMBER, nullable: true },
                  addedSugarG: { type: Type.NUMBER, nullable: true },
                  sodiumMg: { type: Type.NUMBER, nullable: true },
                },
              },
              legibilityNotes: { type: Type.STRING },
              illegibleFields: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json({
        mode: "gemini",
        model: MODEL_NAME,
        label: parsed,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Label extraction failed";
      console.error("Gemini label reader error:", msg);
      return res.status(502).json({
        error: "AI_LABEL_ERROR",
        message: "Could not read label from image. You can manually enter or edit the label fields below.",
        details: msg,
      });
    }
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      const indexHtml = path.join(distDir, "index.html");
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send("Application build not found. Run npm run build first.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NutriAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start NutriAI server:", err);
  process.exit(1);
});
