import { NextRequest, NextResponse } from "next/server";
import corridors from "@/data/corridors.json";
import sources from "@/data/sources.json";
import baseline from "@/data/india_baseline.json";
import { ASSUMPTIONS, daysUntilSprExhausted, estimateImpact } from "@/lib/economics";

const PRESETS = {
  hormuz_full_closure: { corridorId: "hormuz", capacityReductionPct: 100, durationDays: 30 },
  hormuz_and_red_sea: { corridorId: "combined", capacityReductionPct: 80, durationDays: 30 },
  partial_reopening: { corridorId: "hormuz", capacityReductionPct: 60, durationDays: 14 },
} as const;

const HORMUZ = corridors.find((corridor) => corridor.id === "hormuz")!;
const INDIA_IMPORTS_MBD = baseline.daily_consumption_mbd * (baseline.import_dependency_pct / 100);
const HORMUZ_EXPOSURE_MBD = INDIA_IMPORTS_MBD * (baseline.hormuz_share_pre_crisis_pct / 100);

/**
 * This is an India-level exposure model, intentionally not a global-flow model.
 * Hormuz uses the seeded Indian pre-crisis share directly. Other through-routes
 * are scaled from that Indian exposure by their seeded world-oil-share ratio;
 * Red Sea and Suez are allocated from the non-Hormuz import basket, while Cape
 * is an alternative route and therefore has no direct baseline import exposure.
 */
function indiaExposureProxy(corridorId: string) {
  if (corridorId === "hormuz") return HORMUZ_EXPOSURE_MBD;
  if (corridorId === "cape_route") return 0;
  const corridor = corridors.find((item) => item.id === corridorId);
  if (!corridor) return 0;
  const scaledExposure = HORMUZ_EXPOSURE_MBD * (corridor.world_oil_share_pct / HORMUZ.world_oil_share_pct);
  return Math.min(scaledExposure, Math.max(0, INDIA_IMPORTS_MBD - HORMUZ_EXPOSURE_MBD));
}

function round(value: number, places = 2) {
  return Number(value.toFixed(places));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { corridorId?: string; capacityReductionPct?: number; durationDays?: number; presetId?: keyof typeof PRESETS };
    const input = body.presetId && PRESETS[body.presetId] ? PRESETS[body.presetId] : body;
    const reduction = Math.max(0, Math.min(100, Number(input.capacityReductionPct ?? 0)));
    const durationDays = Math.max(1, Math.min(365, Number(input.durationDays ?? 30)));
    const combined = input.corridorId === "combined";
    if (!combined && !input.corridorId) return NextResponse.json({ error: "Unknown corridor" }, { status: 400 });
    const selectedIds: string[] = combined ? ["hormuz", "red_sea"] : [input.corridorId];
    if (selectedIds.some((id) => !corridors.some((corridor) => corridor.id === id))) return NextResponse.json({ error: "Unknown corridor" }, { status: 400 });

    const corridorContributions = selectedIds.map((corridorId) => {
      const exposureMbd = indiaExposureProxy(corridorId);
      return { corridorId, exposureMbd, gapMbd: exposureMbd * (reduction / 100) };
    });
    // Combined scenarios explicitly allocate Red Sea exposure from the non-Hormuz
    // import basket and still cap all modeled loss at India's total imports.
    const unconstrainedGapMbd = corridorContributions.reduce((sum, item) => sum + item.gapMbd, 0);
    const supplyGapMbd = Math.min(INDIA_IMPORTS_MBD, unconstrainedGapMbd);
    const supplyGapPct = (supplyGapMbd / baseline.daily_consumption_mbd) * 100;
    const bypassCapacity = sources.reduce((sum, source) => sum + source.spare_capacity_mbd, 0);
    const extraTransitDays = bypassCapacity >= supplyGapMbd ? 0 : sources.reduce((sum, source) => sum + source.extra_transit_days_vs_hormuz_baseline, 0) / sources.length;
    const impact = estimateImpact(supplyGapPct, extraTransitDays);
    const days = daysUntilSprExhausted(baseline.spr_days_of_cover, baseline.daily_consumption_mbd, supplyGapMbd);

    return NextResponse.json({
      corridorId: input.corridorId,
      durationDays,
      capacityReductionPct: reduction,
      supplyGapMbd: round(supplyGapMbd),
      supplyGapPct: round(supplyGapPct),
      extraTransitDays: round(extraTransitDays),
      impact: Object.fromEntries(Object.entries(impact).map(([key, value]) => [key, round(value)])),
      daysUntilSprExhausted: days === null ? null : round(days),
      assumptions: ASSUMPTIONS,
      combined,
      indiaImportsMbd: round(INDIA_IMPORTS_MBD),
      exposureProxyMbd: round(corridorContributions.reduce((sum, item) => sum + item.exposureMbd, 0)),
      exposureModel: combined
        ? "Hormuz exposure uses India’s seeded 45% pre-crisis import share. Red Sea exposure is a separate, non-Hormuz import-basket proxy scaled by the seeded global oil-share ratio; combined loss is capped at India’s imported-crude requirement."
        : input.corridorId === "hormuz"
          ? "Hormuz exposure equals India’s seeded pre-crisis Hormuz share (45%) of imported crude, not total global Hormuz transit."
          : input.corridorId === "cape_route"
            ? "Cape of Good Hope is modeled as an alternative route, so it has no direct baseline Indian import loss."
            : "India exposure is a proxy: the corridor’s seeded global oil-share ratio scales the seeded India Hormuz exposure and is capped within India’s non-Hormuz import basket.",
      corridorContributions: corridorContributions.map((item) => ({ corridorId: item.corridorId, exposureMbd: round(item.exposureMbd), gapMbd: round(item.gapMbd) })),
    });
  } catch {
    return NextResponse.json({ error: "Invalid scenario input" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ presets: PRESETS });
}
