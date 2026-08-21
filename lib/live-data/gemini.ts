import { cachedFetch } from "./cache";
import { askGeminiJson } from "@/lib/gemini";
import type { GeminiAnalysis, LiveDataResponse } from "./types";

const GEMINI_TTL_MS = 5 * 60 * 1000;

function validAnalysis(value: unknown): value is GeminiAnalysis {
  if (!value || typeof value !== "object") return false;
  const analysis = value as Record<string, unknown>;
  return typeof analysis.summary === "string" && Array.isArray(analysis.recommendedActions) && Array.isArray(analysis.keyRisks) && Array.isArray(analysis.assumptions) && typeof analysis.confidence === "number" && Number.isFinite(analysis.confidence) && analysis.confidence >= 0 && analysis.confidence <= 1;
}

export function getGeminiLiveAnalysis(context: Pick<LiveDataResponse, "market" | "geopoliticalRisk" | "events">, force = false) {
  return cachedFetch<GeminiAnalysis>("gemini:live-overview", "Gemini", GEMINI_TTL_MS, async () => {
    const evidence = { marketData: context.market, geopoliticalRisk: context.geopoliticalRisk, recentEvents: context.events.slice(0, 12) };
    const prompt = `You are an energy supply-chain decision-support analyst. Analyze ONLY the structured evidence below. Never invent prices, incidents, vessel counts, supply volumes, sources, or certainty. Explicitly distinguish observed signals from assumptions. Return strict JSON only with this exact shape:\n{"summary":"","recommendedActions":[""],"keyRisks":[""],"assumptions":[""],"confidence":0}\nEvidence:\n${JSON.stringify(evidence)}`;
    const analysis = await askGeminiJson<GeminiAnalysis>(prompt);
    if (!validAnalysis(analysis)) throw new Error("Malformed Gemini analysis");
    return { ...analysis, recommendedActions: analysis.recommendedActions.filter((item): item is string => typeof item === "string").slice(0, 5), keyRisks: analysis.keyRisks.filter((item): item is string => typeof item === "string").slice(0, 5), assumptions: analysis.assumptions.filter((item): item is string => typeof item === "string").slice(0, 5) };
  }, force);
}

export function getGeminiProcurementAnalysis(input: { marketData: LiveDataResponse["market"]; geopoliticalRisk: LiveDataResponse["geopoliticalRisk"]; recentEvents: LiveDataResponse["events"]; scenario: Record<string, unknown>; supplyGapMbd: number; procurementOptions: unknown[] }) {
  const cacheKey = `gemini:procurement:${Math.round(input.supplyGapMbd * 100)}`;
  return cachedFetch<GeminiAnalysis>(cacheKey, "Gemini", GEMINI_TTL_MS, async () => {
    const evidence = { ...input, recentEvents: input.recentEvents.slice(0, 12) };
    const prompt = `You are an energy supply-chain decision-support analyst. Use ONLY the structured evidence below. Do not invent prices, cargo availability, incidents, supply volumes, sources, or certainty. Treat procurement options as indicative scenario options, not offers. Clearly distinguish observed signals from assumptions. Return strict JSON only with this exact shape:\n{"summary":"","recommendedActions":[""],"keyRisks":[""],"assumptions":[""],"confidence":0}\nEvidence:\n${JSON.stringify(evidence)}`;
    const analysis = await askGeminiJson<GeminiAnalysis>(prompt);
    if (!validAnalysis(analysis)) throw new Error("Malformed Gemini procurement analysis");
    return { ...analysis, recommendedActions: analysis.recommendedActions.filter((item): item is string => typeof item === "string").slice(0, 5), keyRisks: analysis.keyRisks.filter((item): item is string => typeof item === "string").slice(0, 5), assumptions: analysis.assumptions.filter((item): item is string => typeof item === "string").slice(0, 5) };
  });
}
