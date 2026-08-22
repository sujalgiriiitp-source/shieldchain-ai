"use client";

import Link from "next/link";
import type { CorridorRisk } from "@/lib/live-data";
import type { ScenarioResult } from "@/lib/types";

export default function DecisionChain({ risk, scenario }: { risk?: CorridorRisk; scenario?: ScenarioResult | null }) {
  const steps = [
    ["EVENT / SIGNAL", risk ? `${risk.status}: ${risk.label}` : "Live signals monitored", "/"],
    ["CORRIDOR RISK", risk?.score === null ? "Unavailable — no score inferred" : risk ? `${risk.score}/100 · ${risk.confidence}% confidence` : "GDELT-normalized signal", "/"],
    ["INDIA EXPOSURE", scenario ? `${scenario.exposureProxyMbd?.toFixed(2)} mbd modeled basket` : "Seeded import-exposure proxy", "/scenario"],
    ["SUPPLY GAP", scenario ? `${scenario.supplyGapMbd.toFixed(2)} mbd · ${scenario.supplyGapPct.toFixed(1)}%` : "Model a disruption", "/scenario"],
    ["ECONOMIC IMPACT", scenario ? `${scenario.impact.totalLandedCostImpactPct.toFixed(1)}% landed-cost estimate` : "Illustrative multipliers", "/scenario"],
    ["PROCUREMENT OPTIONS", "Indicative rerouting basket", scenario ? `/procurement?gap=${scenario.supplyGapMbd}` : "/procurement"],
    ["SPR RESPONSE", scenario?.daysUntilSprExhausted === null ? "No modeled drawdown" : scenario ? `${scenario.daysUntilSprExhausted?.toFixed(1)} days modeled cover` : "Evaluate SPR response", "/reserve"],
    ["RECOMMENDED ACTION", "Decision-support output", scenario ? `/procurement?gap=${scenario.supplyGapMbd}` : "/procurement"],
  ];
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="decision-chain-title"><div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Decision pipeline</p><h2 id="decision-chain-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Decision Chain</h2><p className="mt-1 text-sm text-slate-600">Observed signal → risk assessment → India exposure → response options.</p></div><ol className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">{steps.map(([title, value, href], index) => <li key={title} className="relative"><Link href={href} className="block min-h-[8.4rem] p-5 transition hover:bg-blue-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-700"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{String(index + 1).padStart(2, "0")}</span><p className="mt-4 text-[11px] font-bold tracking-[0.1em] text-slate-600">{title}</p><p className="mt-1 text-sm font-semibold leading-5 text-slate-900">{value}</p></Link></li>)}</ol></section>;
}
