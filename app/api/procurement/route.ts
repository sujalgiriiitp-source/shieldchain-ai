import { NextRequest, NextResponse } from "next/server";
import sources from "@/data/sources.json";
import { askGeminiJson } from "@/lib/gemini";

type Recommendation = {
  source_id: string;
  source_name: string;
  recommended_volume_mbd: number;
  extra_cost_estimate_pct: number;
  transit_days: number;
  rationale: string;
  risk_flag: "low" | "medium" | "high";
};
type ProcurementResponse = { recommendations: Recommendation[]; executive_summary: string };

function fallback(gap: number): ProcurementResponse {
  let remaining = Math.max(0, gap);
  const recommendations = [...sources]
    .sort((a, b) => a.cost_premium_pct - b.cost_premium_pct)
    .map((source) => {
      const volume = Math.min(source.spare_capacity_mbd, remaining);
      remaining -= volume;
      return {
        source_id: source.id,
        source_name: source.name,
        recommended_volume_mbd: Number(volume.toFixed(2)),
        extra_cost_estimate_pct: source.cost_premium_pct,
        transit_days: source.extra_transit_days_vs_hormuz_baseline,
        rationale: volume > 0 ? `Allocate available spare capacity; ${source.notes}` : "Hold as a contingent option after lower-cost spare capacity is committed.",
        risk_flag: source.id === "russia_urals" || source.id === "venezuela" ? "high" as const : source.extra_transit_days_vs_hormuz_baseline > 12 ? "medium" as const : "low" as const,
      };
    })
    .filter((item) => item.recommended_volume_mbd > 0)
    .slice(0, 5);
  return {
    recommendations,
    executive_summary: "In the next six hours, secure the lowest-cost available bypass capacity first, then diversify remaining exposure across alternative grades and ports. Escalate sanctions, refinery-compatibility, freight, and vessel-availability checks before binding longer-haul cargoes.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { supplyGapMbd?: number };
    const gap = Math.max(0, Number(body.supplyGapMbd ?? 0));
    const prompt = `You are a procurement strategy advisor for an energy company facing a supply gap of ${gap} million barrels/day due to a shipping corridor disruption.
Here are the available alternative crude sources, with capacity, spare capacity, extra transit days versus the Hormuz baseline, and cost premium:
${JSON.stringify(sources)}

Rank the top 3-5 sources to cover this gap. Return ONLY valid JSON, no markdown, no preamble:
{
  "recommendations": [
    { "source_id": "...", "source_name": "...", "recommended_volume_mbd": <number>, "extra_cost_estimate_pct": <number>, "transit_days": <number>, "rationale": "<one sentence>", "risk_flag": "low" | "medium" | "high" }
  ],
  "executive_summary": "<one paragraph: what to do in the next 6 hours, written for a procurement team, plain language>"
}`;
    try {
      const answer = await askGeminiJson<ProcurementResponse>(prompt);
      if (!Array.isArray(answer.recommendations) || !answer.executive_summary) throw new Error("Invalid Gemini response");
      return NextResponse.json(answer);
    } catch {
      return NextResponse.json(fallback(gap));
    }
  } catch {
    return NextResponse.json({ error: "Invalid procurement input" }, { status: 400 });
  }
}

