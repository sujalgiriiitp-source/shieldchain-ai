export type Trend = "rising" | "stable" | "falling";
export type RiskFlag = "low" | "medium" | "high";

export interface RiskScore {
  corridor: string;
  risk_score: number;
  trend: Trend;
  rationale: string;
  confidence: "low" | "medium" | "high";
}

export interface ScenarioResult {
  corridorId: string;
  durationDays: number;
  capacityReductionPct: number;
  supplyGapMbd: number;
  supplyGapPct: number;
  extraTransitDays: number;
  impact: { priceImpactPct: number; freightImpactPct: number; totalLandedCostImpactPct: number; gdpImpactPct: number };
  daysUntilSprExhausted: number | null;
  assumptions: Record<string, number>;
  combined?: boolean;
  indiaImportsMbd?: number;
  exposureProxyMbd?: number;
  exposureModel?: string;
  corridorContributions?: { corridorId: string; exposureMbd: number; gapMbd: number }[];
}
