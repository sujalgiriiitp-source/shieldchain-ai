export type DataStatus = "LIVE" | "STALE" | "UNAVAILABLE" | "ERROR" | "ILLUSTRATIVE";
export type AnalysisStatus = "LIVE" | "FALLBACK" | "UNAVAILABLE";
export type CorridorKey = "hormuz" | "redSea" | "babElMandeb" | "gulfOfOman" | "capeRoute" | "suez";

export interface SourceStatus {
  name: "GDELT" | "EIA" | "Gemini";
  status: DataStatus | AnalysisStatus;
  updatedAt: string | null;
  freshness: string;
}

export interface CacheEntry<T> {
  value: T;
  source: string;
  timestamp: string;
  expiresAt: string;
  status: DataStatus;
}

export interface EventSignal {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  domain: string | null;
  corridorKeys: CorridorKey[];
  severity: number;
}

export interface CorridorRisk {
  key: CorridorKey;
  label: string;
  score: number | null;
  status: DataStatus;
  source: "GDELT";
  timestamp: string | null;
  reason: string;
  confidence: number;
}

export interface CrudePrice {
  value: number | null;
  unit: "USD/barrel";
  source: "EIA";
  timestamp: string | null;
  status: DataStatus;
  series: string;
}

export interface GeminiAnalysis {
  summary: string;
  recommendedActions: string[];
  keyRisks: string[];
  assumptions: string[];
  confidence: number;
}

export interface LiveDataResponse {
  timestamp: string;
  status: DataStatus;
  sources: SourceStatus[];
  market: { crudePrice: CrudePrice };
  geopoliticalRisk: Record<"hormuz" | "redSea" | "babElMandeb" | "gulfOfOman", CorridorRisk>;
  corridorRisk: Record<"hormuz" | "redSea" | "capeRoute" | "suez", CorridorRisk>;
  events: EventSignal[];
  gemini: { status: AnalysisStatus; generatedAt: string | null; analysis: GeminiAnalysis | null };
  dataQuality: { liveSources: number; staleSources: number; unavailableSources: number };
}
