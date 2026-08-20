"use client";

import { useEffect, useState } from "react";
import type { RiskScore } from "@/lib/types";

const arrow = { rising: "↑", stable: "→", falling: "↓" };
const tone = (score: number) => score > 60 ? "bg-red-100 text-red-800" : score >= 20 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";

export default function RiskTicker({ onRisks }: { onRisks?: (risks: RiskScore[]) => void }) {
  const [risks, setRisks] = useState<RiskScore[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/risk-score");
        if (!response.ok) throw new Error("risk fetch failed");
        const data = await response.json() as RiskScore[];
        setRisks(data); onRisks?.(data); setError(false);
      } catch { setError(true); }
    };
    load();
    const id = window.setInterval(load, 30_000);
    return () => window.clearInterval(id);
  }, [onRisks]);
  return <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm" aria-label="Current corridor risk ticker">
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-500">Live corridor risk</span>
      {risks.map((risk) => <span key={risk.corridor} className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(risk.risk_score)}`}>{risk.corridor}: {risk.risk_score} {arrow[risk.trend]}</span>)}
      {!risks.length && <span className="text-sm text-slate-500">{error ? "Risk feed unavailable; retrying shortly." : "Loading seeded risk intelligence…"}</span>}
    </div>
  </section>;
}

