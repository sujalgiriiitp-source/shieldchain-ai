"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ReserveChart({ points }: { points: { day: number; sprDaysRemaining: number }[] }) {
  return <div className="h-80 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", offset: -4 }} /><YAxis label={{ value: "SPR cover (days)", angle: -90, position: "insideLeft" }} /><Tooltip formatter={(value) => [`${value ?? 0} days`, "SPR cover"]} /><Line type="monotone" dataKey="sprDaysRemaining" stroke="#1d4ed8" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>;
}
