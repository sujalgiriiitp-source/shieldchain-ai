"use client";

import { ASSUMPTIONS } from "@/lib/economics";

export default function AssumptionsPanel({ overrides }: { overrides?: Partial<typeof ASSUMPTIONS> }) {
  const assumptions = { ...ASSUMPTIONS, ...overrides };
  return <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="font-semibold text-slate-900">Model assumptions</h3>
    <table className="mt-3 w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="pb-2">Assumption</th><th className="pb-2">Value / basis</th><th className="pb-2">Type</th></tr></thead><tbody>
      <tr className="border-t border-slate-200"><td className="py-2 pr-2 text-slate-600">India import exposure</td><td className="py-2">45% pre-crisis Hormuz share</td><td className="py-2">PUBLIC-DATA INPUT</td></tr>
      <tr className="border-t border-slate-200"><td className="py-2 pr-2 text-slate-600">Price elasticity</td><td className="py-2">{assumptions.priceElasticityMultiplier}% / 1% supply lost</td><td className="py-2">ILLUSTRATIVE</td></tr>
      <tr className="border-t border-slate-200"><td className="py-2 pr-2 text-slate-600">Freight premium</td><td className="py-2">{assumptions.freightPremiumPerExtraDay}% / extra day</td><td className="py-2">ILLUSTRATIVE</td></tr>
      <tr className="border-t border-slate-200"><td className="py-2 pr-2 text-slate-600">GDP sensitivity</td><td className="py-2">{assumptions.gdpSensitivity}% / 10% cost rise</td><td className="py-2">ILLUSTRATIVE</td></tr>
      <tr className="border-t border-slate-200"><td className="py-2 pr-2 text-slate-600">SPR coverage</td><td className="py-2">9.5 days seeded baseline</td><td className="py-2">PUBLIC-DATA INPUT</td></tr>
      <tr className="border-t border-slate-200"><td className="py-2 pr-2 text-slate-600">Routing capacity</td><td className="py-2">Spare capacity by source</td><td className="py-2">ILLUSTRATIVE</td></tr>
    </tbody></table>
    <p className="mt-3 text-xs leading-5 text-slate-500">Illustrative model using public-data proxies — multipliers are adjustable assumptions, not calibrated forecasts.</p>
  </aside>;
}
