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
const cache = new Map<string, { value: any; expires: number }>();

export function getCache(k: string) {
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() > v.expires) { cache.delete(k); return null; }
  return v.value;
}
export function setCache(k: string, value: any, ttlMs = 10*60_000) {
  cache.set(k, { value, expires: Date.now() + ttlMs });
}