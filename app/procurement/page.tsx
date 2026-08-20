"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProcurementTable from "@/components/ProcurementTable";

type Result = { recommendations: Parameters<typeof ProcurementTable>[0]["recommendations"]; executive_summary: string };
function ProcurementPageContent() {
  const params = useSearchParams(); const suppliedGap = Number(params.get("gap")); const gap = Number.isFinite(suppliedGap) && suppliedGap >= 0 ? suppliedGap : 2.39;
  const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState("");
  useEffect(() => { let active = true; fetch("/api/procurement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplyGapMbd: gap }) }).then(async (response) => { if (!response.ok) throw new Error("Procurement service unavailable"); return response.json() as Promise<Result>; }).then((data) => { if (active) setResult(data); }).catch((err) => { if (active) setError(err.message); }); return () => { active = false; }; }, [gap]);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Procurement orchestrator</p><h1 className="mt-1 text-3xl font-bold">Reroute the gap with a resilient basket.</h1><p className="mt-2 text-slate-600">Scenario supply gap: <span className="font-semibold">{gap.toFixed(2)} mbd</span>. Recommendations use Gemini when available and a deterministic capacity-and-cost fallback when it is not.</p></div>{error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}{!result ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">Building ranked recommendations…</div> : <><section className="rounded-xl border border-blue-200 bg-blue-50 p-5"><h2 className="font-semibold text-blue-950">Next six hours</h2><p className="mt-2 leading-7 text-blue-950">{result.executive_summary}</p></section><ProcurementTable recommendations={result.recommendations} /><p className="text-xs text-slate-500">Volumes are indicative available spare capacity, not firm cargo offers. Validate sanctions, grade compatibility, freight, insurance, and port constraints before execution.</p></>}</div>;
}
export default function ProcurementPage() { return <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">Loading procurement orchestrator…</div>}><ProcurementPageContent /></Suspense>; }
