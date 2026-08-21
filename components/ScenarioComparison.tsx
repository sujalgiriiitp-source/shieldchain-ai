"use client";

import { useEffect, useState } from "react";
import type { ScenarioResult } from "@/lib/types";

type Row = { name: string; request: Record<string, unknown>; result: ScenarioResult | null };
const configs = [
  { name: "Baseline", request: { corridorId: "hormuz", capacityReductionPct: 0, durationDays: 1 } },
  { name: "Partial disruption", request: { corridorId: "hormuz", capacityReductionPct: 40, durationDays: 14 } },
  { name: "Hormuz full closure", request: { presetId: "hormuz_full_closure" } },
  { name: "Hormuz + Red Sea", request: { presetId: "hormuz_and_red_sea" } },
  { name: "Partial reopening", request: { presetId: "partial_reopening" } },
];

export default function ScenarioComparison() {
  const [rows, setRows] = useState<Row[]>(configs.map((config) => ({ ...config, result: null })));
  useEffect(() => { let active = true; Promise.all(configs.map(async (config) => { const response = await fetch("/api/scenario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config.request) }); return { ...config, result: response.ok ? await response.json() as ScenarioResult : null }; })).then((data) => { if (active) setRows(data); }).catch(() => undefined); return () => { active = false; }; }, []);
  const metric = (value: number | null | undefined, suffix: string, digits = 1) => value === null || value === undefined ? "—" : `${value.toFixed(digits)}${suffix}`;
  return <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><div className="p-5"><h2 className="text-xl font-bold">Scenario comparison</h2><p className="mt-1 text-sm text-slate-600">Each row is calculated through the same scenario engine; values are model outputs, not hardcoded forecasts.</p></div><table className="w-full min-w-[950px] text-left text-sm"><thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-3">Scenario</th><th className="p-3">Supply gap</th><th className="p-3">Gap %</th><th className="p-3">Price</th><th className="p-3">Freight</th><th className="p-3">Landed cost</th><th className="p-3">GDP</th><th className="p-3">SPR cover</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="border-b border-slate-100"><td className="p-3 font-semibold">{row.name}</td><td className="p-3">{metric(row.result?.supplyGapMbd, " mbd", 2)}</td><td className="p-3">{metric(row.result?.supplyGapPct, "%")}</td><td className="p-3">{metric(row.result?.impact.priceImpactPct, "%")}</td><td className="p-3">{metric(row.result?.impact.freightImpactPct, "%")}</td><td className="p-3">{metric(row.result?.impact.totalLandedCostImpactPct, "%")}</td><td className="p-3">{metric(row.result?.impact.gdpImpactPct, "%", 2)}</td><td className="p-3">{row.result?.daysUntilSprExhausted === null ? "No drawdown" : metric(row.result?.daysUntilSprExhausted, " days")}</td></tr>)}</tbody></table></section>;
}

