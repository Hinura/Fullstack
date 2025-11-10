// Super light in-memory limiter (per IP + route). Replace with upstash/redis if needed.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRate(ip: string, key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const bucketKey = `${ip}:${key}`;
  const b = buckets.get(bucketKey);

  if (!b || now > b.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

// Tiny cache for repeated hints on identical question text (TTL 10 min)
interface CacheEntry {
  value: unknown;  
  expires: number;
}

const cache = new Map<string, CacheEntry>();

export function getCache<T = unknown>(k: string): T | null {
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() > v.expires) {
    cache.delete(k);
    return null;
  }
  return v.value as T;
}

export function setCache<T>(k: string, value: T, ttlMs = 10 * 60_000): void {
  cache.set(k, { value, expires: Date.now() + ttlMs });
}