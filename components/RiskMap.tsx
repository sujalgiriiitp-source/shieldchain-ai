"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import corridors from "@/data/corridors.json";
import baseline from "@/data/india_baseline.json";
import type { RiskScore } from "@/lib/types";

function markerColor(score?: number | null) {
  if (score === undefined || score === null) return "#94a3b8";
  if (score < 20) return "#16a34a";
  if (score <= 60) return "#d97706";
  return "#dc2626";
}

export default function RiskMap({ risks }: { risks: RiskScore[] | null }) {
  const byName = new Map((risks ?? []).map((risk) => [risk.corridor, risk]));
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm" aria-label="Global energy corridor risk map">
      <MapContainer center={[20, 55]} zoom={3} scrollWheelZoom className="h-full w-full" aria-label="Energy corridor risk map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {corridors.map((corridor) => {
          const risk = byName.get(corridor.name);
          return <CircleMarker key={corridor.id} center={[corridor.lat, corridor.lng]} radius={Math.max(8, corridor.world_oil_share_pct * 1.15)} pathOptions={{ color: markerColor(risk?.risk_score), fillColor: markerColor(risk?.risk_score), fillOpacity: 0.72, weight: 2 }}>
            <Popup><strong>{corridor.name}</strong><br />{risk?.risk_score === null ? "Risk score unavailable" : risk ? `Risk score: ${risk.risk_score}/100` : "Loading risk score…"}<br /><span>{corridor.status_note}</span></Popup>
          </CircleMarker>;
        })}
        {baseline.refineries.map((refinery) => (
          <CircleMarker key={refinery.name} center={[refinery.lat, refinery.lng]} radius={6} pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 0.9, weight: 2 }}>
            <Popup><strong>{refinery.name}</strong><br />{refinery.operator}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
