interface RateEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const store = new Map<string, RateEntry>();

// Cleanup stale entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt && (!entry.blockedUntil || now > entry.blockedUntil)) {
      store.delete(key);
    }
  }
}, 60_000);

/**
 * Rate-limits a key. Returns true if the request is allowed, false if blocked.
 * @param key      Unique key (e.g. `login:1.2.3.4`)
 * @param max      Max allowed requests per window
 * @param windowMs Time window in ms
 * @param blockMs  How long to block after max is hit (default: same as window)
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
  blockMs?: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (entry?.blockedUntil && now < entry.blockedUntil) return false;

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  if (entry.count > max) {
    entry.blockedUntil = now + (blockMs ?? windowMs);
    return false;
  }
  return true;
}

/** Returns the IP address from a Next.js request */
export function getIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
