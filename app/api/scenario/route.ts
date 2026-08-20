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
    const selected = combined
      ? corridors.filter((corridor) => corridor.id === "hormuz" || corridor.id === "red_sea")
      : corridors.filter((corridor) => corridor.id === input.corridorId);
    if (!selected.length) return NextResponse.json({ error: "Unknown corridor" }, { status: 400 });

    const supplyGapMbd = selected.reduce((sum, corridor) => sum + corridor.baseline_daily_transit_mbd * (reduction / 100), 0);
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
    });
  } catch {
    return NextResponse.json({ error: "Invalid scenario input" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ presets: PRESETS });
}

