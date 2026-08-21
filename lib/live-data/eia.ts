import { cachedFetch } from "./cache";
import { parsePositiveNumber, safeTimestamp } from "./normalize";
import type { CrudePrice } from "./types";

const EIA_TTL_MS = 5 * 60 * 1000;
const SERIES_ID = "PET.RWTC.D";

async function fetchEiaPrice(): Promise<Omit<CrudePrice, "status">> {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) throw new Error("EIA_API_KEY is not set");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`https://api.eia.gov/v2/seriesid/${SERIES_ID}?api_key=${encodeURIComponent(apiKey)}&length=1`, { signal: controller.signal, headers: { Accept: "application/json" }, next: { revalidate: 0 } });
    if (!response.ok) throw new Error(`EIA responded ${response.status}`);
    const payload = await response.json() as { response?: { data?: unknown[] } };
    const record = payload.response?.data?.[0] as Record<string, unknown> | undefined;
    const value = parsePositiveNumber(record?.value);
    const timestamp = safeTimestamp(record?.period);
    if (!value || !timestamp) throw new Error("Malformed EIA price response");
    return { value, unit: "USD/barrel", source: "EIA", timestamp, series: SERIES_ID };
  } finally { clearTimeout(timeout); }
}

export function getEiaCrudePrice(force = false) {
  return cachedFetch<Omit<CrudePrice, "status">>("eia:wti", "EIA", EIA_TTL_MS, fetchEiaPrice, force);
}

