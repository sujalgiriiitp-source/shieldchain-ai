import type { CorridorKey, EventSignal } from "./types";

const DATE_PATTERN = /^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?Z?$/;

export function safeTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();
  const match = value.match(DATE_PATTERN);
  if (!match) return null;
  const [, year, month, day, hour = "00", minute = "00", second = "00"] = match;
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function corridorKeys(title: string): CorridorKey[] {
  const text = title.toLowerCase();
  const keys = new Set<CorridorKey>();
  if (/hormuz|iranian strait/.test(text)) keys.add("hormuz");
  if (/red sea/.test(text)) keys.add("redSea");
  if (/bab.?el.?mandeb|mandeb/.test(text)) keys.add("babElMandeb");
  if (/gulf of oman|fujairah/.test(text)) keys.add("gulfOfOman");
  if (/suez/.test(text)) keys.add("suez");
  if (/cape of good hope/.test(text)) keys.add("capeRoute");
  return Array.from(keys);
}

function severity(title: string) {
  const text = title.toLowerCase();
  if (/attack|strik|missile|seiz|sink|blockad|close[ds]?|explosion/.test(text)) return 3;
  if (/disrupt|suspend|halt|sanction|security|threat|tanker/.test(text)) return 2;
  return 1;
}

export function normalizeGdeltArticles(payload: unknown): EventSignal[] {
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { articles?: unknown }).articles)) throw new Error("Malformed GDELT response");
  const events: EventSignal[] = [];
  const seen = new Set<string>();
  for (const article of (payload as { articles: unknown[] }).articles) {
    if (!article || typeof article !== "object") continue;
    const item = article as Record<string, unknown>;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const url = typeof item.url === "string" ? item.url.trim() : "";
    const publishedAt = safeTimestamp(item.seendate);
    if (!title || !url || !publishedAt || seen.has(url)) continue;
    seen.add(url);
    events.push({ id: url, title: title.slice(0, 280), url, publishedAt, domain: typeof item.domain === "string" ? item.domain : null, corridorKeys: corridorKeys(title), severity: severity(title) });
  }
  return events;
}

export function parsePositiveNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
