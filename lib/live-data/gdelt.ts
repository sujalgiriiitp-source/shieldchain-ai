import { cachedFetch } from "./cache";
import { normalizeGdeltArticles } from "./normalize";
import type { EventSignal } from "./types";

const GDELT_TTL_MS = 60 * 60 * 1000;
const GDELT_TIMEOUT_MS = 18_000;
const GDELT_RATE_LIMIT_WAIT_MS = 6_000;
// Keep this query focused so GDELT can respond quickly and consistently. Broader
// global keyword collections frequently hit DOC API throttles or long scans.
const query = '("Strait of Hormuz" OR "Red Sea" OR "Bab el-Mandeb" OR "Gulf of Oman" OR "tanker attack" OR "shipping disruption" OR "maritime security")';

async function requestGdelt(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GDELT_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "ShieldChain-AI/1.0 (+https://shieldchain.local; decision-support prototype)",
      },
      cache: "no-store",
    });
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`GDELT timed out after ${GDELT_TIMEOUT_MS / 1000} seconds`);
    throw error;
  } finally { clearTimeout(timeout); }
}

async function fetchGdelt() {
  if (process.env.GDELT_ENABLED?.toLowerCase() === "false") throw new Error("GDELT is disabled by GDELT_ENABLED");
  const params = new URLSearchParams({ query, mode: "artlist", format: "json", maxrecords: "20", timespan: "48h", sort: "datedesc" });
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
  let response = await requestGdelt(url);
  // GDELT's public DOC API asks clients to wait between requests. A single
  // delayed retry keeps manual refresh useful without turning this into polling.
  if (response.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, GDELT_RATE_LIMIT_WAIT_MS));
    response = await requestGdelt(url);
  }
  if (!response.ok) throw new Error(`GDELT responded ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) throw new Error("GDELT did not return JSON");
  return normalizeGdeltArticles(await response.json());
}

export function getGdeltSignals(force = false) {
  return cachedFetch<EventSignal[]>("gdelt:signals", "GDELT", GDELT_TTL_MS, fetchGdelt, force);
}
