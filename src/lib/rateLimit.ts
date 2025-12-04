type Counter = { count: number; windowStart: number; backoffLevel: number };

const store: Map<string, Counter> = new Map();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  backoffBaseMs = 1000
) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now, backoffLevel: 0 });
    return { allowed: true, retryAfterMs: 0 };
  }

  entry.count += 1;
  if (entry.count <= limit) {
    return { allowed: true, retryAfterMs: 0 };
  }

  entry.backoffLevel += 1;
  const retryAfterMs = backoffBaseMs * Math.min(60, entry.backoffLevel ** 2);
  return { allowed: false, retryAfterMs };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}
