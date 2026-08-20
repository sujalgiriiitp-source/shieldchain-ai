import { NextResponse } from "next/server";
import corridors from "@/data/corridors.json";
import news from "@/data/news_seed.json";
import { askGeminiJson } from "@/lib/gemini";
import type { RiskScore } from "@/lib/types";

const FALLBACKS: Record<string, Omit<RiskScore, "corridor">> = {
  hormuz: { risk_score: 90, trend: "rising", rationale: "The 15 August ADNOC-affiliated tanker attack confirms that routine transits remain unsafe.", confidence: "high" },
  red_sea: { risk_score: 55, trend: "rising", rationale: "The 15 August Houthi attack and port closure are actively disrupting the route.", confidence: "medium" },
  cape_route: { risk_score: 10, trend: "stable", rationale: "The Cape remains an available, though longer, alternative route.", confidence: "medium" },
  suez: { risk_score: 30, trend: "stable", rationale: "Suez volumes remain exposed to uncertainty on the Red Sea approach.", confidence: "medium" },
};

let cached: { value: RiskScore[]; expiresAt: number } | null = null;

export async function GET() {
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.value);

  const results = await Promise.all(corridors.map(async (corridor) => {
    const headlines = (news as Record<string, { date: string; headline: string }[]>)[corridor.id] ?? [];
    const joined = headlines.length
      ? headlines.map((item) => `${item.date}: ${item.headline}`).join("\n")
      : "No recent headlines on file; assume baseline conditions";
    const prompt = `You are a geopolitical risk analyst for an energy supply chain system.
Given these recent headlines about the "${corridor.name}" shipping corridor:
${joined}

Return ONLY valid JSON, no markdown, no preamble:
{
  "corridor": "${corridor.name}",
  "risk_score": <integer 0-100>,
  "trend": "rising" | "stable" | "falling",
  "rationale": "<one sentence, cite the specific event driving the score>",
  "confidence": "low" | "medium" | "high"
}
Score 0-20 = normal operations. 21-50 = elevated tension, some rerouting.
51-80 = active disruption, most traffic diverted. 81-100 = effectively closed.`;
    try {
      const scored = await askGeminiJson<RiskScore>(prompt);
      return { ...scored, corridor: corridor.name, risk_score: Math.max(0, Math.min(100, Math.round(scored.risk_score))) };
    } catch {
      return { corridor: corridor.name, ...FALLBACKS[corridor.id] };
    }
  }));

  cached = { value: results, expiresAt: Date.now() + 5 * 60 * 1000 };
  return NextResponse.json(results);
}

