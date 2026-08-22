"use client";

import type { CorridorRisk } from "@/lib/live-data";

const statusTone: Record<string, string> = { LIVE: "border-emerald-200 bg-emerald-50 text-emerald-800", STALE: "border-amber-200 bg-amber-50 text-amber-800", UNAVAILABLE: "border-slate-200 bg-slate-100 text-slate-700", ERROR: "border-red-200 bg-red-50 text-red-800", ILLUSTRATIVE: "border-blue-200 bg-blue-50 text-blue-800" };
const levelTone = (riskLevel: string) => riskLevel === "CRITICAL" ? "text-red-700" : riskLevel === "HIGH" ? "text-orange-700" : riskLevel === "MEDIUM" ? "text-amber-700" : riskLevel === "LOW" ? "text-emerald-700" : "text-slate-500";
function level(score: number | null) {
  if (score === null) return "UNAVAILABLE";
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export default function CorridorRiskCards({ risks }: { risks: CorridorRisk[] }) {
  return <section aria-labelledby="corridor-risk-title"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Risk assessment</p><h2 id="corridor-risk-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Corridor risk confidence</h2><p className="mt-1 text-sm text-slate-600">Scores are normalized from retrieved GDELT signals; unavailable signals are never treated as zero risk.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{risks.map((risk) => { const riskLevel = level(risk.score); return <article key={risk.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><h3 className="max-w-[11rem] text-sm font-bold uppercase tracking-[0.1em] text-slate-700">{risk.label}</h3><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusTone[risk.status]}`}>{risk.status}</span></div><div className="mt-6 border-b border-slate-100 pb-4"><p className={`text-3xl font-extrabold tracking-tight ${levelTone(riskLevel)}`}>{riskLevel}</p><p className="mt-1 text-sm text-slate-500">Current risk level</p></div><div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Score</p><p className="mt-1 text-xl font-bold text-slate-950">{risk.score === null ? "—" : `${risk.score} / 100`}</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</p><p className="mt-1 text-xl font-bold text-slate-950">{risk.confidence}%</p></div></div><p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{risk.reason}</p></article>; })}</div></section>;
}
