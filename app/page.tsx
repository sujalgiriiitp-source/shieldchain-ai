"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import RiskTicker from "@/components/RiskTicker";
import CorridorRiskCards from "@/components/CorridorRiskCards";
import DecisionChain from "@/components/DecisionChain";
import baseline from "@/data/india_baseline.json";
import type { LiveDataResponse } from "@/lib/live-data";
import type { RiskScore } from "@/lib/types";

const RiskMap = dynamic(() => import("@/components/RiskMap"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200" /> });

const sourcePurpose: Record<string, string> = {
  GDELT: "Global geopolitical and event signals",
  EIA: "Energy market data",
  Gemini: "AI analysis layer — not a physical-world source",
};

const sourceTone: Record<string, string> = {
  LIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  STALE: "border-amber-200 bg-amber-50 text-amber-800",
  UNAVAILABLE: "border-slate-200 bg-slate-100 text-slate-700",
  ERROR: "border-red-200 bg-red-50 text-red-800",
  ILLUSTRATIVE: "border-blue-200 bg-blue-50 text-blue-800",
  FALLBACK: "border-blue-200 bg-blue-50 text-blue-800",
};

const structuralMetrics = [
  { value: `${baseline.import_dependency_pct}%`, label: "Crude import dependency" },
  { value: baseline.spr_days_of_cover.toFixed(1), label: "Days SPR cover" },
  { value: `~${baseline.source_countries_count}`, label: "Source countries" },
  { value: baseline.daily_consumption_mbd.toFixed(1), label: "MBD consumption" },
];

export default function DashboardPage() {
  const [risks, setRisks] = useState<RiskScore[] | null>(null);
  const [liveData, setLiveData] = useState<LiveDataResponse | null>(null);
  const onRisks = useCallback((data: RiskScore[]) => setRisks(data), []);
  const onLiveData = useCallback((data: LiveDataResponse) => setLiveData(data), []);

  return <div className="space-y-7 md:space-y-9">
    <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-900/10">
      <div className="grid gap-8 px-6 py-7 md:grid-cols-[1.35fr_1fr] md:px-9 md:py-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Energy supply resilience</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">Risk Intelligence for India&apos;s Crude Supply Chain</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">AI-driven decision support for energy supply resilience and disruption response.</p>
          <Link href="/scenario?preset=hormuz_full_closure" className="mt-7 inline-flex items-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Replay disruption <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm" aria-label="India structural context">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">India&apos;s Energy Exposure</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {structuralMetrics.map((metric) => <div key={metric.label} className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5"><p className="text-2xl font-bold tracking-tight text-white">{metric.value}</p><p className="mt-1 text-xs leading-4 text-slate-400">{metric.label}</p></div>)}
          </div>
        </aside>
      </div>
    </section>

    <RiskTicker onRisks={onRisks} onLiveData={onLiveData} />

    {liveData && <>
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.6fr]" aria-label="Market context and source provenance">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Market context</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div><p className="text-3xl font-bold tracking-tight text-slate-950">{liveData.market.crudePrice.value === null ? "UNAVAILABLE" : `$${liveData.market.crudePrice.value.toFixed(2)}`}</p><p className="mt-1 text-sm text-slate-600">WTI crude · Source: EIA</p></div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${sourceTone[liveData.market.crudePrice.status]}`}>{liveData.market.crudePrice.status}</span>
          </div>
          {liveData.market.crudePrice.timestamp && <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Latest data period: {new Date(liveData.market.crudePrice.timestamp).toLocaleDateString()}</p>}
        </article>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="provenance-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Data provenance</p><h2 id="provenance-title" className="mt-1 text-xl font-bold tracking-tight text-slate-950">Source status</h2></div><p className="text-xs text-slate-500">Freshness shown per source</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">{liveData.sources.map((source) => <article key={source.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"><div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-900">{source.name}</p><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${sourceTone[source.status]}`}>{source.status}</span></div><p className="mt-2 min-h-9 text-xs leading-4 text-slate-600">{sourcePurpose[source.name]}</p><p className="mt-3 border-t border-slate-200 pt-2 text-[11px] leading-4 text-slate-500">{source.updatedAt ? `Updated ${new Date(source.updatedAt).toLocaleString()}` : source.freshness}</p></article>)}</div>
        </section>
      </section>

      <CorridorRiskCards risks={Object.values(liveData.corridorRisk)} />
      <DecisionChain risk={liveData.corridorRisk.hormuz} />
    </>}

    <section aria-labelledby="risk-map-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Geospatial monitoring</p><h2 id="risk-map-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Global Energy Corridor Risk Map</h2><p className="mt-1 text-sm text-slate-600">Monitor disruption signals across critical crude shipping corridors and Indian refinery exposure.</p></div><div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">Green: normal · Amber: elevated · Red: disruption signal</div></div>
      <RiskMap risks={risks} />
    </section>

    <p className="border-l-2 border-slate-300 pl-3 text-xs leading-5 text-slate-500">Live event and market responses are shown only when successfully retrieved. India exposure and economic multipliers remain labeled decision-support assumptions, not official forecasts.</p>
  </div>;
}
