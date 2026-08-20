import { NextRequest, NextResponse } from "next/server";
import baseline from "@/data/india_baseline.json";
import { daysUntilSprExhausted } from "@/lib/economics";

export async function GET(request: NextRequest) {
  const rawGap = Number(request.nextUrl.searchParams.get("gapMbd") ?? 0);
  const gapMbd = Number.isFinite(rawGap) ? Math.max(0, rawGap) : 0;
  const exhausted = daysUntilSprExhausted(baseline.spr_days_of_cover, baseline.daily_consumption_mbd, gapMbd);
  const dailyDrawdownDays = gapMbd > 0 ? gapMbd / baseline.daily_consumption_mbd : 0;
  const points = Array.from({ length: 21 }, (_, day) => ({
    day,
    sprDaysRemaining: Number(Math.max(0, baseline.spr_days_of_cover - (day * dailyDrawdownDays)).toFixed(2)),
  }));
  return NextResponse.json({ gapMbd, daysUntilSprExhausted: exhausted === null ? null : Number(exhausted.toFixed(2)), points });
}
