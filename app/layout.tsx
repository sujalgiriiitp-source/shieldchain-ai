import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "ShieldChain AI", description: "AI-driven energy supply chain resilience for import-dependent economies" };

const nav = [["/", "Dashboard"], ["/scenario", "Scenario"], ["/procurement", "Procurement"], ["/reserve", "Reserve"]];
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur"><div className="mx-auto max-w-7xl px-5 py-4"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-950"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs text-white">S</span>ShieldChain AI</Link><p className="mt-1 text-sm text-slate-600">AI-driven energy supply chain resilience for import-dependent economies</p></div><nav className="flex flex-wrap gap-1" aria-label="Primary navigation">{nav.map(([href, label]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">{label}</Link>)}</nav></div></div></header><main className="mx-auto max-w-7xl px-5 py-7 md:py-9">{children}</main><footer className="mx-auto max-w-7xl border-t border-slate-200 px-5 py-6 text-xs text-slate-500"><div className="flex flex-col justify-between gap-2 sm:flex-row"><span className="font-semibold text-slate-700">ShieldChain AI</span><span>AI-driven energy supply chain resilience</span><span>Decision-support system · Source freshness shown where available</span></div></footer></body></html>;
}
