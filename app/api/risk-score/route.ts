import { NextResponse } from "next/server";
import { getLiveData } from "@/lib/live-data";
import type { RiskScore } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const live = await getLiveData();
  const result = Object.values(live.corridorRisk).map((risk): RiskScore => ({
    corridor: risk.label,
    risk_score: risk.score ?? 0,
    trend: "stable",
    rationale: risk.reason,
    confidence: risk.status === "LIVE" ? "medium" : "low",
  }));
  return NextResponse.json(result);
}
