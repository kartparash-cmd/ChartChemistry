/**
 * Simple in-memory rate limiter for the free compatibility endpoint.
 *
 * IP-based, 3 checks per day for unauthenticated users.
 * Premium/Annual users bypass the limiter entirely.
 *
 * In production this should be replaced with Redis or a similar store.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

const store = new Map<string, RateLimitEntry>();

const FREE_LIMIT = 3; // max requests per window
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Periodic cleanup every 10 minutes to prevent unbounded growth
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupRunning() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node process to exit even if the timer is running
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in ms
}

/**
 * Check whether the given IP is within the rate limit.
 *
 * Returns an object indicating whether the request is allowed,
 * how many requests remain, and when the window resets.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  ensureCleanupRunning();

  const now = Date.now();
  const entry = store.get(ip);

  // No existing entry or window expired — create fresh
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: FREE_LIMIT - 1, resetAt };
  }

  // Within window
  if (entry.count < FREE_LIMIT) {
    entry.count++;
    return {
      allowed: true,
      remaining: FREE_LIMIT - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  };
}

/**
 * Get the client IP from a Request object.
 *
 * Checks common proxy headers; falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}
