"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import RiskTicker from "@/components/RiskTicker";
import type { RiskScore } from "@/lib/types";

const RiskMap = dynamic(() => import("@/components/RiskMap"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-xl bg-slate-200" /> });

export default function DashboardPage() {
  const [risks, setRisks] = useState<RiskScore[] | null>(null);
  const onRisks = useCallback((data: RiskScore[]) => setRisks(data), []);
  return <div className="space-y-6"><section className="grid gap-6 rounded-2xl bg-slate-900 p-6 text-white md:grid-cols-[1.5fr_1fr] md:p-8"><div><p className="text-sm font-bold uppercase tracking-widest text-blue-300">OOSC 4.0 · PS 1</p><h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Risk to recommendation for India&apos;s crude supply chain.</h1><p className="mt-4 max-w-2xl text-slate-300">Replay the actual February 2026 Strait of Hormuz closure, quantify potential exposure, and turn the scenario into actionable rerouting options.</p><Link href="/scenario?preset=hormuz_full_closure" className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-blue-50">Replay the Feb 2026 Hormuz closure →</Link></div><div className="rounded-xl border border-slate-700 bg-slate-800 p-5"><p className="text-sm text-slate-300">India&apos;s structural context</p><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="text-2xl font-bold">88%</p><p className="text-xs text-slate-400">crude import dependency</p></div><div><p className="text-2xl font-bold">9.5</p><p className="text-xs text-slate-400">days SPR cover</p></div><div><p className="text-2xl font-bold">~40</p><p className="text-xs text-slate-400">source countries</p></div><div><p className="text-2xl font-bold">5.3</p><p className="text-xs text-slate-400">mbd consumption</p></div></div></div></section><RiskTicker onRisks={onRisks} /><section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-xl font-bold">Shipping corridor risk map</h2><p className="text-sm text-slate-600">Circle size indicates share of global oil transit. Blue markers are Indian refinery hubs.</p></div><div className="hidden text-xs text-slate-500 sm:block">Green: normal · Amber: elevated · Red: disrupted</div></div><RiskMap risks={risks} /></section><p className="text-xs leading-5 text-slate-500">Seeded event intelligence is designed for a reliable hackathon replay. {"Figures are approximate, drawn from public reporting Feb-Aug 2026, for demo purposes only."}</p></div>;
}

