"use client";

import type { CorridorRisk } from "@/lib/live-data";

const statusTone = { LIVE: "bg-emerald-100 text-emerald-800", STALE: "bg-amber-100 text-amber-800", UNAVAILABLE: "bg-slate-200 text-slate-700", ERROR: "bg-red-100 text-red-800", ILLUSTRATIVE: "bg-blue-100 text-blue-800" };
function level(score: number | null) {
  if (score === null) return "UNAVAILABLE";
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export default function CorridorRiskCards({ risks }: { risks: CorridorRisk[] }) {
  return <section><div className="mb-3"><h2 className="text-xl font-bold">Corridor risk confidence</h2><p className="text-sm text-slate-600">Scores are normalized from retrieved GDELT signals; unavailable signals are never treated as zero risk.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{risks.map((risk) => <article key={risk.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-slate-900">{risk.label}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[risk.status]}`}>{risk.status}</span></div><p className="mt-4 text-2xl font-bold text-slate-900">{level(risk.score)}</p><p className="mt-1 text-sm text-slate-600">Score: <strong>{risk.score === null ? "—" : `${risk.score}/100`}</strong></p><p className="text-sm text-slate-600">Confidence: <strong>{risk.confidence}%</strong></p><p className="mt-3 text-xs leading-5 text-slate-500">{risk.reason}</p></article>)}</div></section>;
}

