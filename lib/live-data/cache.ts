import type { CacheEntry, DataStatus } from "./types";

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const failureUntil = new Map<string, number>();
type CacheResult<T> = CacheEntry<T> | { value: null; source: string; timestamp: null; expiresAt: null; status: "UNAVAILABLE" };

export async function cachedFetch<T>(
  key: string,
  source: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  force = false,
): Promise<CacheResult<T>> {
  const existing = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!force && existing && Date.parse(existing.expiresAt) > Date.now()) return { ...existing, status: "LIVE" };
  if (!force && (failureUntil.get(key) ?? 0) > Date.now()) {
    return existing ? { ...existing, status: "STALE" } : { value: null, source, timestamp: null, expiresAt: null, status: "UNAVAILABLE" };
  }
  const pending = !force ? inFlight.get(key) : undefined;
  if (pending) return pending as Promise<CacheResult<T>>;
  const task = (async (): Promise<CacheResult<T>> => {
    try {
      const value = await fetcher();
      const now = new Date();
      const entry: CacheEntry<T> = { value, source, timestamp: now.toISOString(), expiresAt: new Date(now.getTime() + ttlMs).toISOString(), status: "LIVE" };
      memoryCache.set(key, entry);
      failureUntil.delete(key);
      return entry;
    } catch (error) {
      console.warn(`[live-data] ${source} refresh failed`, error instanceof Error ? error.message : "unknown error");
      failureUntil.set(key, Date.now() + 60_000);
      if (existing) return { ...existing, status: "STALE" };
      return { value: null, source, timestamp: null, expiresAt: null, status: "UNAVAILABLE" };
    }
  })();
  inFlight.set(key, task);
  try { return await task; } finally { inFlight.delete(key); }
}

export function sourceStatus(status: DataStatus): DataStatus {
  return status;
}
