export const ASSUMPTIONS = {
  priceElasticityMultiplier: 1.8,
  freightPremiumPerExtraDay: 0.4,
  gdpSensitivity: 0.15,
};

export interface ImpactEstimate {
  priceImpactPct: number;
  freightImpactPct: number;
  totalLandedCostImpactPct: number;
  gdpImpactPct: number;
}

export function estimateImpact(supplyGapPct: number, extraTransitDays: number): ImpactEstimate {
  const priceImpactPct = supplyGapPct * ASSUMPTIONS.priceElasticityMultiplier;
  const freightImpactPct = extraTransitDays * ASSUMPTIONS.freightPremiumPerExtraDay;
  const totalLandedCostImpactPct = priceImpactPct + freightImpactPct;
  const gdpImpactPct = (totalLandedCostImpactPct / 10) * ASSUMPTIONS.gdpSensitivity;
  return { priceImpactPct, freightImpactPct, totalLandedCostImpactPct, gdpImpactPct };
}

export function daysUntilSprExhausted(sprDays: number, dailyConsumptionMbd: number, supplyGapMbd: number): number | null {
  if (supplyGapMbd <= 0) return null;
  const sprBarrels = sprDays * dailyConsumptionMbd * 1_000_000;
  return sprBarrels / (supplyGapMbd * 1_000_000);
}

