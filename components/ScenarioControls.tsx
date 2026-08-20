"use client";

import corridors from "@/data/corridors.json";

export type ScenarioInput = { corridorId: string; capacityReductionPct: number; durationDays: number };
export default function ScenarioControls({ input, onChange, onRun, running }: { input: ScenarioInput; onChange: (input: ScenarioInput) => void; onRun: () => void; running: boolean }) {
  const update = (patch: Partial<ScenarioInput>) => onChange({ ...input, ...patch });
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold">Manual scenario</h2>
    <label className="mt-4 block text-sm font-medium">Affected corridor
      <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" value={input.corridorId} onChange={(event) => update({ corridorId: event.target.value })}>
        {corridors.map((corridor) => <option key={corridor.id} value={corridor.id}>{corridor.name}</option>)}
      </select>
    </label>
    <label className="mt-4 block text-sm font-medium">Capacity reduction: <span className="text-blue-700">{input.capacityReductionPct}%</span>
      <input className="mt-2 w-full accent-blue-700" type="range" min="0" max="100" value={input.capacityReductionPct} onChange={(event) => update({ capacityReductionPct: Number(event.target.value) })} />
    </label>
    <label className="mt-4 block text-sm font-medium">Duration: <span className="text-blue-700">{input.durationDays} days</span>
      <input className="mt-2 w-full accent-blue-700" type="range" min="1" max="60" value={input.durationDays} onChange={(event) => update({ durationDays: Number(event.target.value) })} />
    </label>
    <button onClick={onRun} disabled={running} className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{running ? "Calculating…" : "Model disruption"}</button>
  </div>;
}

