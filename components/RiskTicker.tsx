"use client";

import { useCallback, useEffect, useState } from "react";
import type { LiveDataResponse } from "@/lib/live-data";
import type { RiskScore } from "@/lib/types";

const arrow = { rising: "↑", stable: "→", falling: "↓" };
const tone = (score: number) => score > 60 ? "bg-red-100 text-red-800" : score >= 20 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";
const statusTone = { LIVE: "bg-emerald-100 text-emerald-800", STALE: "bg-amber-100 text-amber-800", UNAVAILABLE: "bg-slate-200 text-slate-700", ILLUSTRATIVE: "bg-blue-100 text-blue-800" };

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
        const mapped = Object.values(data.corridorRisk).map((risk): RiskScore => ({ corridor: risk.label, risk_score: risk.score ?? 0, trend: "stable", rationale: risk.reason, confidence: risk.status === "LIVE" ? "medium" : "low" }));
        setLive(data); setRisks(mapped); onRisks?.(mapped); onLiveData?.(data); setError(false);
      } catch { setError(true); }
      finally { setFetching(false); }
  }, [onLiveData, onRisks]);
  useEffect(() => {
    load();
    const id = window.setInterval(() => load(), 5 * 60_000);
    return () => window.clearInterval(id);
  }, [load]);
  return <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm" aria-label="Current corridor risk ticker">
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-500">Live data</span>
      {live && <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[live.status]}`}>● {live.status}</span>}
      <span className="text-xs text-slate-500">Auto-refresh: ON · every 5 min</span>
      <button onClick={() => load(true)} disabled={fetching} className="ml-auto rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{fetching ? "Fetching live signals…" : "Refresh live data"}</button>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
      <span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-500">Corridor risk</span>
      {risks.map((risk) => <span key={risk.corridor} className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(risk.risk_score)}`}>{risk.corridor}: {risk.risk_score} {arrow[risk.trend]}</span>)}
      {!risks.length && <span className="text-sm text-slate-500">{error ? "Live data is unavailable; retry manually." : "Fetching live signals…"}</span>}
    </div>
    {live && <p className="mt-3 text-xs text-slate-500">Last updated: {new Date(live.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Data freshness: {live.dataQuality.liveSources} live, {live.dataQuality.staleSources} stale, {live.dataQuality.unavailableSources} unavailable sources.</p>}
  </section>;
}
