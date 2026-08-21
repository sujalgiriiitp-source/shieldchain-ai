"use client";

import Link from "next/link";
import type { CorridorRisk } from "@/lib/live-data";
import type { ScenarioResult } from "@/lib/types";

export default function DecisionChain({ risk, scenario }: { risk?: CorridorRisk; scenario?: ScenarioResult | null }) {
  const steps = [
    ["Event / signal", risk ? `${risk.status}: ${risk.label}` : "Live signals monitored", "/"],
    ["Corridor risk", risk?.score === null ? "Unavailable — no score inferred" : risk ? `${risk.score}/100 · ${risk.confidence}% confidence` : "GDELT-normalized signal", "/"],
    ["India exposure", scenario ? `${scenario.exposureProxyMbd?.toFixed(2)} mbd modeled basket` : "Seeded import-exposure proxy", "/scenario"],
    ["Supply gap", scenario ? `${scenario.supplyGapMbd.toFixed(2)} mbd · ${scenario.supplyGapPct.toFixed(1)}%` : "Model a disruption", "/scenario"],
    ["Economic impact", scenario ? `${scenario.impact.totalLandedCostImpactPct.toFixed(1)}% landed-cost estimate` : "Illustrative multipliers", "/scenario"],
    ["Procurement options", "Indicative rerouting basket", scenario ? `/procurement?gap=${scenario.supplyGapMbd}` : "/procurement"],
    ["SPR response", scenario?.daysUntilSprExhausted === null ? "No modeled drawdown" : scenario ? `${scenario.daysUntilSprExhausted?.toFixed(1)} days modeled cover` : "Evaluate SPR response", "/reserve"],
    ["Recommended action", "Decision-support output", scenario ? `/procurement?gap=${scenario.supplyGapMbd}` : "/procurement"],
  ];
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Decision Chain</h2><p className="mt-1 text-sm text-slate-600">From observed signals to a transparent decision-support recommendation.</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, value, href], index) => <Link key={title} href={href} className="rounded-lg bg-slate-50 p-3 transition hover:bg-blue-50"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{index < steps.length - 1 ? `${index + 1}. ${title}` : title}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></Link>)}</div></section>;
}

