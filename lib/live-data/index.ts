import { getEiaCrudePrice } from "./eia";
import { getGdeltSignals } from "./gdelt";
import { getGeminiLiveAnalysis } from "./gemini";
import { buildRisk } from "./risk";
import type { DataStatus, LiveDataResponse, SourceStatus } from "./types";

function freshness(status: DataStatus, timestamp: string | null) {
  if (!timestamp) return "No successful response yet";
  return status === "STALE" ? `Stale since ${timestamp}` : `Updated ${timestamp}`;
}

export async function getLiveData(force = false): Promise<LiveDataResponse> {
  // Each provider has its own cache/failure boundary; use allSettled as a final
  // guard so a future provider regression cannot make /api/live fail as a whole.
  const [gdeltResult, eiaResult] = await Promise.allSettled([getGdeltSignals(force), getEiaCrudePrice(force)]);
  const gdelt = gdeltResult.status === "fulfilled" ? gdeltResult.value : { value: null, source: "GDELT", timestamp: null, expiresAt: null, status: "UNAVAILABLE" as const };
  const eia = eiaResult.status === "fulfilled" ? eiaResult.value : { value: null, source: "EIA", timestamp: null, expiresAt: null, status: "UNAVAILABLE" as const };
  const gdeltStatus = gdelt.status;
  const risks = {
    hormuz: buildRisk("hormuz", gdelt.value, gdeltStatus, gdelt.timestamp),
    redSea: buildRisk("redSea", gdelt.value, gdeltStatus, gdelt.timestamp),
    babElMandeb: buildRisk("babElMandeb", gdelt.value, gdeltStatus, gdelt.timestamp),
    gulfOfOman: buildRisk("gulfOfOman", gdelt.value, gdeltStatus, gdelt.timestamp),
  };
  const corridorRisk = { hormuz: risks.hormuz, redSea: risks.redSea, capeRoute: buildRisk("capeRoute", gdelt.value, gdeltStatus, gdelt.timestamp), suez: buildRisk("suez", gdelt.value, gdeltStatus, gdelt.timestamp) };
  const market = { crudePrice: eia.value ? { ...eia.value, status: eia.status } : { value: null, unit: "USD/barrel" as const, source: "EIA" as const, timestamp: null, status: "UNAVAILABLE" as const, series: "PET.RWTC.D" } };
  const analysis = await getGeminiLiveAnalysis({ market, geopoliticalRisk: risks, events: gdelt.value ?? [] }, force);
  const geminiStatus = analysis.value ? (analysis.status === "LIVE" ? "LIVE" : "FALLBACK") : "FALLBACK";
  const sources: SourceStatus[] = [
    { name: "GDELT", status: gdeltStatus, updatedAt: gdelt.timestamp, freshness: freshness(gdeltStatus, gdelt.timestamp) },
    { name: "EIA", status: eia.status, updatedAt: eia.timestamp, freshness: freshness(eia.status, eia.timestamp) },
    { name: "Gemini", status: geminiStatus, updatedAt: analysis.timestamp, freshness: analysis.value ? freshness(analysis.status, analysis.timestamp) : "Deterministic fallback analysis" },
  ];
  const liveSources = sources.filter((source) => source.status === "LIVE").length;
  const staleSources = sources.filter((source) => source.status === "STALE").length;
  const unavailableSources = sources.filter((source) => source.status === "UNAVAILABLE").length;
  const status: DataStatus = liveSources ? "LIVE" : staleSources ? "STALE" : "UNAVAILABLE";
  return { timestamp: new Date().toISOString(), status, sources, market, geopoliticalRisk: risks, corridorRisk, events: gdelt.value ?? [], gemini: { status: geminiStatus, generatedAt: analysis.timestamp, analysis: analysis.value }, dataQuality: { liveSources, staleSources, unavailableSources } };
}

export * from "./types";
export { getGeminiProcurementAnalysis } from "./gemini";
