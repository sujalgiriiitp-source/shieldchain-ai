import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "ShieldChain AI", description: "AI-driven energy supply chain resilience for import-dependent economies" };

const nav = [["/", "Dashboard"], ["/scenario", "Scenario"], ["/procurement", "Procurement"], ["/reserve", "Reserve"]];
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><Link href="/" className="text-xl font-bold tracking-tight text-slate-900">ShieldChain AI</Link><p className="mt-0.5 text-sm text-slate-600">AI-driven energy supply chain resilience for import-dependent economies</p></div><nav className="flex flex-wrap gap-1" aria-label="Primary navigation">{nav.map(([href, label]) => <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700">{label}</Link>)}</nav></div></div></header><main className="mx-auto max-w-7xl px-5 py-7">{children}</main><footer className="mx-auto max-w-7xl px-5 pb-8 text-xs text-slate-500">HackShield · OOSC 4.0 Hackathon, IIIT Allahabad · Illustrative decision-support demo, not trading or policy advice.</footer></body></html>;
}

