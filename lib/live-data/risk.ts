import type { CorridorKey, CorridorRisk, DataStatus, EventSignal } from "./types";

const labels: Record<CorridorKey, string> = { hormuz: "Strait of Hormuz", redSea: "Red Sea", babElMandeb: "Bab el-Mandeb", gulfOfOman: "Gulf of Oman", capeRoute: "Cape of Good Hope", suez: "Suez Canal" };

export function buildRisk(key: CorridorKey, events: EventSignal[] | null, status: DataStatus, timestamp: string | null): CorridorRisk {
  if (!events) return { key, label: labels[key], score: null, status: "UNAVAILABLE", source: "GDELT", timestamp: null, reason: "Live GDELT event signals are unavailable." };
  const matched = events.filter((event) => event.corridorKeys.includes(key));
  const score = Math.min(100, Math.round(matched.length * 7 + matched.reduce((total, event) => total + event.severity * 5, 0)));
  const quality = score >= 65 ? "High" : score >= 35 ? "Elevated" : "Low";
  const suffix = matched.length ? `${matched.length} matching recent event signal${matched.length === 1 ? "" : "s"} retrieved from GDELT.` : "No matching recent event signals retrieved from GDELT.";
  return { key, label: labels[key], score, status, source: "GDELT", timestamp, reason: `${quality} disruption signal. ${suffix}` };
}

