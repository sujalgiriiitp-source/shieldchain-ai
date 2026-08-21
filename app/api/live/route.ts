import { NextRequest, NextResponse } from "next/server";
import { getLiveData } from "@/lib/live-data";
import type { LiveDataResponse } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get("refresh") === "1";
  try {
    const data = await getLiveData(force);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[live-data] unexpected /api/live failure", error);
    const unavailable: LiveDataResponse = {
      timestamp: new Date().toISOString(), status: "UNAVAILABLE",
      sources: ["GDELT", "EIA", "Gemini"].map((name) => ({ name: name as "GDELT" | "EIA" | "Gemini", status: name === "Gemini" ? "FALLBACK" as const : "UNAVAILABLE" as const, updatedAt: null, freshness: name === "Gemini" ? "Deterministic fallback analysis" : "No successful response yet" })),
      market: { crudePrice: { value: null, unit: "USD/barrel", source: "EIA", timestamp: null, status: "UNAVAILABLE", series: "PET.RWTC.D" } },
      geopoliticalRisk: {
        hormuz: { key: "hormuz", label: "Strait of Hormuz", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
        redSea: { key: "redSea", label: "Red Sea", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
        babElMandeb: { key: "babElMandeb", label: "Bab el-Mandeb", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
        gulfOfOman: { key: "gulfOfOman", label: "Gulf of Oman", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
      },
      corridorRisk: {
        hormuz: { key: "hormuz", label: "Strait of Hormuz", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
        redSea: { key: "redSea", label: "Red Sea", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
        capeRoute: { key: "capeRoute", label: "Cape of Good Hope", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
        suez: { key: "suez", label: "Suez Canal", score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live signals are unavailable.", confidence: 20 },
      },
      events: [], gemini: { status: "FALLBACK", generatedAt: null, analysis: null }, dataQuality: { liveSources: 0, staleSources: 0, unavailableSources: 2 },
    };
    return NextResponse.json(unavailable, { headers: { "Cache-Control": "no-store" } });
  }
}
