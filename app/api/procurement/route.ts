import { NextRequest, NextResponse } from "next/server";
import sources from "@/data/sources.json";
import { getGeminiProcurementAnalysis, getLiveData } from "@/lib/live-data";

type Recommendation = {
  source_id: string;
  source_name: string;
  recommended_volume_mbd: number;
  extra_cost_estimate_pct: number;
  transit_days: number;
  rationale: string;
  risk_flag: "low" | "medium" | "high";
  priority: "high" | "medium" | "lower";
  risk_signal: string;
};
type ProcurementResponse = { recommendations: Recommendation[]; executive_summary: string; recommendedActions: string[]; keyRisks: string[]; assumptions: string[]; confidence: number; analysisStatus: "LIVE" | "STALE" | "UNAVAILABLE" };

function riskLevel(score: number | null) {
  if (score === null) return "medium" as const;
  if (score >= 65) return "high" as const;
  if (score >= 30) return "medium" as const;
  return "low" as const;
}

function fallback(gap: number, live: Awaited<ReturnType<typeof getLiveData>>): ProcurementResponse {
  const riskScore = {
    saudi_pipeline: live.geopoliticalRisk.redSea.score,
    uae_pipeline: Math.max(live.geopoliticalRisk.hormuz.score ?? 0, live.geopoliticalRisk.gulfOfOman.score ?? 0),
    russia_urals: live.events.filter((event) => /sanction|tariff/.test(event.title.toLowerCase())).reduce((sum, event) => sum + event.severity * 10, 0) || null,
    us_gulf: 0,
    west_africa: 0,
    venezuela: live.events.filter((event) => /sanction/.test(event.title.toLowerCase())).reduce((sum, event) => sum + event.severity * 10, 0) || null,
  } as Record<string, number | null>;
  let remaining = Math.max(0, gap);
  const recommendations = [...sources]
    .sort((a, b) => (a.cost_premium_pct + (riskScore[a.id] ?? 30) / 10) - (b.cost_premium_pct + (riskScore[b.id] ?? 30) / 10))
    .map((source) => {
      const volume = Math.min(source.spare_capacity_mbd, remaining);
      remaining -= volume;
      const sourceRisk = riskScore[source.id];
      const flag = riskLevel(sourceRisk);
      return {
        source_id: source.id,
        source_name: source.name,
        recommended_volume_mbd: Number(volume.toFixed(2)),
        extra_cost_estimate_pct: source.cost_premium_pct,
        transit_days: source.extra_transit_days_vs_hormuz_baseline,
        rationale: volume > 0 ? `Indicative routing allocation based on spare-capacity and cost assumptions. ${source.notes}` : "Hold as a contingent option after lower-cost indicative capacity is committed.",
        risk_flag: flag,
        priority: flag === "low" ? "high" as const : flag === "high" ? "lower" as const : "medium" as const,
        risk_signal: sourceRisk === null ? "Live corridor signal unavailable; priority uses the illustrative routing model." : `Live signal score ${sourceRisk}/100 informs priority.` ,
      };
    })
    .filter((item) => item.recommended_volume_mbd > 0)
    .slice(0, 5);
  return {
    recommendations,
    executive_summary: "In the next six hours, secure the lowest-cost available bypass capacity first, then diversify remaining exposure across alternative grades and ports. Escalate sanctions, refinery-compatibility, freight, and vessel-availability checks before binding longer-haul cargoes.",
    recommendedActions: ["Validate freight, insurance, refinery compatibility, and sanctions constraints before execution."],
    keyRisks: ["Indicative capacity is not a firm cargo offer."],
    assumptions: ["Illustrative fallback model used because Gemini analysis was unavailable."],
    confidence: 0.35,
    analysisStatus: "UNAVAILABLE",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { supplyGapMbd?: number };
    const gap = Math.max(0, Number(body.supplyGapMbd ?? 0));
    const live = await getLiveData();
    const deterministic = fallback(gap, live);
    const analysis = await getGeminiProcurementAnalysis({ marketData: live.market, geopoliticalRisk: live.geopoliticalRisk, recentEvents: live.events, scenario: { type: "user-supplied supply gap" }, supplyGapMbd: gap, procurementOptions: sources });
    if (!analysis.value) return NextResponse.json(deterministic);
    return NextResponse.json({ ...deterministic, executive_summary: analysis.value.summary, recommendedActions: analysis.value.recommendedActions, keyRisks: analysis.value.keyRisks, assumptions: analysis.value.assumptions, confidence: analysis.value.confidence, analysisStatus: analysis.status });
  } catch {
    return NextResponse.json({ error: "Invalid procurement input" }, { status: 400 });
  }
}
