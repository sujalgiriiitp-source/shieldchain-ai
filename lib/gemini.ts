import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;
let resolvedModel: { name: string; expiresAt: number } | null = null;
const MODEL_CACHE_TTL_MS = 60 * 60 * 1000;

function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Gemini request timed out")), timeoutMs);
  });
  try { return await Promise.race([promise, timeout]); } finally { if (timeoutId) clearTimeout(timeoutId); }
}

/**
 * Resolve against the models available to this exact API key instead of pinning
 * an obsolete identifier. GEMINI_MODEL can explicitly select an allowed model.
 */
async function getSupportedModel() {
  if (resolvedModel && resolvedModel.expiresAt > Date.now()) return resolvedModel.name;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", { signal: controller.signal, headers: { Accept: "application/json", "x-goog-api-key": apiKey }, cache: "no-store" });
    if (!response.ok) throw new Error(`Gemini model discovery responded ${response.status}`);
    const payload = await response.json() as { models?: { name?: unknown; supportedGenerationMethods?: unknown }[] };
    const models = (payload.models ?? []).flatMap((model) => {
      const name = typeof model.name === "string" ? model.name.replace(/^models\//, "") : null;
      const methods = Array.isArray(model.supportedGenerationMethods) ? model.supportedGenerationMethods : [];
      return name && methods.includes("generateContent") ? [name] : [];
    });
    const requested = process.env.GEMINI_MODEL?.trim();
    const usable = models.filter((name) => /^gemini-/i.test(name) && !/(image|live|tts|embedding|aqa)/i.test(name));
    const model = requested && usable.includes(requested) ? requested : usable.sort((a, b) => {
      const score = (name: string) => (/flash/i.test(name) ? 20 : 0) + (/preview/i.test(name) ? -2 : 0) + (/3\./.test(name) ? 5 : 0);
      return score(b) - score(a) || a.localeCompare(b);
    })[0];
    if (!model) throw new Error("No generateContent Gemini model is available to this API key");
    resolvedModel = { name: model, expiresAt: Date.now() + MODEL_CACHE_TTL_MS };
    return model;
  } finally { clearTimeout(timeoutId); }
}

export async function askGeminiJson<T>(prompt: string): Promise<T> {
  const ai = getClient();
  const model = await getSupportedModel();
  const response = await withTimeout(ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" },
  }), 15_000);
  const text = response.text ?? "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as T;
}
