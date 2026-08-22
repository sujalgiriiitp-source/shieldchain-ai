"use client";

import { useCallback, useEffect, useState } from "react";
import type { LiveDataResponse } from "@/lib/live-data";
import type { RiskScore } from "@/lib/types";

const arrow = { rising: "↑", stable: "→", falling: "↓" };
const tone = (score: number | null) => score === null ? "border-slate-200 bg-slate-100 text-slate-700" : score > 60 ? "border-red-200 bg-red-50 text-red-800" : score >= 20 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800";
const statusTone: Record<string, string> = { LIVE: "border-emerald-200 bg-emerald-50 text-emerald-800", STALE: "border-amber-200 bg-amber-50 text-amber-800", UNAVAILABLE: "border-slate-200 bg-slate-100 text-slate-700", ERROR: "border-red-200 bg-red-50 text-red-800", ILLUSTRATIVE: "border-blue-200 bg-blue-50 text-blue-800", FALLBACK: "border-blue-200 bg-blue-50 text-blue-800" };

export default function RiskTicker({ onRisks, onLiveData }: { onRisks?: (risks: RiskScore[]) => void; onLiveData?: (data: LiveDataResponse) => void }) {
  const [risks, setRisks] = useState<RiskScore[]>([]);
  const [error, setError] = useState(false);
  const [live, setLive] = useState<LiveDataResponse | null>(null);
  const [fetching, setFetching] = useState(false);
  const load = useCallback(async (force = false) => {
      setFetching(true);
      try {
        const response = await fetch(`/api/live${force ? "?refresh=1" : ""}`);
        if (!response.ok) throw new Error("risk fetch failed");
        const data = await response.json() as LiveDataResponse;
        const mapped = Object.values(data.corridorRisk).map((risk): RiskScore => ({ corridor: risk.label, risk_score: risk.score, trend: "stable", rationale: risk.reason, confidence: risk.status === "LIVE" ? "medium" : "low" }));
        setLive(data); setRisks(mapped); onRisks?.(mapped); onLiveData?.(data); setError(false);
      } catch { setError(true); }
      finally { setFetching(false); }
  }, [onLiveData, onRisks]);
  useEffect(() => {
    load();
    const id = window.setInterval(() => load(), 5 * 60_000);
    return () => window.clearInterval(id);
  }, [load]);
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Current corridor risk ticker">
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
      <span className="mr-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">Live intelligence</span>
      {live && <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone[live.status]}`}>● {live.status}</span>}
      <span className="text-xs text-slate-500">Auto-refresh active · every 5 min</span>
      <button onClick={() => load(true)} disabled={fetching} className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">{fetching ? "Fetching live signals…" : "Refresh live data"}</button>
    </div>
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      <span className="mr-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Corridor risk</span>
      {risks.map((risk) => <span key={risk.corridor} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tone(risk.risk_score)}`}><span className="font-bold">{risk.corridor}</span>: {risk.risk_score === null ? "UNAVAILABLE" : `${risk.risk_score} ${arrow[risk.trend]}`}</span>)}
      {!risks.length && <span className="text-sm text-slate-500">{error ? "Live data is unavailable; retry manually." : "Fetching live signals…"}</span>}
    </div>
    {live && <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">Last updated: {new Date(live.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Data freshness: {live.dataQuality.liveSources} live, {live.dataQuality.staleSources} stale, {live.dataQuality.unavailableSources} unavailable sources.</p>}
  </section>;
}
