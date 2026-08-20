"use client";

import { ASSUMPTIONS } from "@/lib/economics";

export default function AssumptionsPanel({ overrides }: { overrides?: Partial<typeof ASSUMPTIONS> }) {
  const assumptions = { ...ASSUMPTIONS, ...overrides };
  return <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="font-semibold text-slate-900">Model assumptions</h3>
    <table className="mt-3 w-full text-left text-sm"><tbody>
      <tr className="border-b border-slate-200"><td className="py-2 pr-3 text-slate-600">Price elasticity</td><td className="py-2 font-medium">{assumptions.priceElasticityMultiplier}% / 1% supply lost</td></tr>
      <tr className="border-b border-slate-200"><td className="py-2 pr-3 text-slate-600">Freight premium</td><td className="py-2 font-medium">{assumptions.freightPremiumPerExtraDay}% / extra day</td></tr>
      <tr><td className="py-2 pr-3 text-slate-600">GDP sensitivity</td><td className="py-2 font-medium">{assumptions.gdpSensitivity}% / 10% cost rise</td></tr>
    </tbody></table>
    <p className="mt-3 text-xs leading-5 text-slate-500">Illustrative model using public-data proxies — multipliers are adjustable assumptions, not calibrated forecasts.</p>
  </aside>;
}

