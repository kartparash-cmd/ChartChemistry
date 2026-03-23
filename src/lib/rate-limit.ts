/**
 * Rate limiter for the free compatibility endpoint.
 *
 * Uses Upstash Redis + @upstash/ratelimit when UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN are configured. Falls back to in-memory
 * rate limiting otherwise.
 *
 * IP-based, 3 checks per day for unauthenticated users.
 * Premium/Annual users bypass the limiter entirely.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* -------------------------------------------------------------------------- */
/*  Shared types & constants                                                  */
/* -------------------------------------------------------------------------- */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in ms
}

const FREE_LIMIT = 3; // max requests per window
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/* -------------------------------------------------------------------------- */
/*  Upstash rate limiter (lazy-initialised)                                   */
/* -------------------------------------------------------------------------- */

let upstashRatelimit: Ratelimit | null = null;
let upstashChecked = false;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashChecked) return upstashRatelimit;
  upstashChecked = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      upstashRatelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(FREE_LIMIT, "24 h"),
        prefix: "ratelimit:compat",
      });
    } catch {
      // If initialisation fails, fall back to in-memory
      upstashRatelimit = null;
    }
  }

  return upstashRatelimit;
}

/* -------------------------------------------------------------------------- */
/*  In-memory fallback                                                        */
/* -------------------------------------------------------------------------- */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

const store = new Map<string, RateLimitEntry>();

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

  if (
    cleanupTimer &&
    typeof cleanupTimer === "object" &&
    "unref" in cleanupTimer
  ) {
    cleanupTimer.unref();
  }
}

function checkRateLimitInMemory(ip: string): RateLimitResult {
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

/* -------------------------------------------------------------------------- */
/*  Exported check function                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Check whether the given IP is within the rate limit.
 *
 * Uses Upstash Redis when configured, otherwise falls back to in-memory.
 * Returns an object indicating whether the request is allowed,
 * how many requests remain, and when the window resets.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const rl = getUpstashRatelimit();

  if (rl) {
    try {
      const result = await rl.limit(ip);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch {
      // If Upstash fails at runtime, fall back to in-memory
      return checkRateLimitInMemory(ip);
    }
  }

  return checkRateLimitInMemory(ip);
}

/* -------------------------------------------------------------------------- */
/*  Remaining-checks helper                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Return how many free compatibility checks are left for the given IP.
 *
 * This is a **read-only, synchronous** peek at the in-memory store.
 * When Upstash is configured the canonical remaining count comes from the
 * `RateLimitResult.remaining` field returned by `checkRateLimit` instead.
 */
export function getRemainingChecks(ip: string): number {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    return FREE_LIMIT;
  }

  return Math.max(0, FREE_LIMIT - entry.count);
}

/* -------------------------------------------------------------------------- */
/*  Generic rate limiter (Redis-backed with in-memory fallback)               */
/* -------------------------------------------------------------------------- */

/**
 * Convert milliseconds to an Upstash duration string.
 */
function msToUpstashWindow(ms: number): `${number} ${"ms" | "s" | "m" | "h" | "d"}` {
  if (ms >= 24 * 60 * 60 * 1000 && ms % (24 * 60 * 60 * 1000) === 0)
    return `${ms / (24 * 60 * 60 * 1000)} d`;
  if (ms >= 60 * 60 * 1000 && ms % (60 * 60 * 1000) === 0)
    return `${ms / (60 * 60 * 1000)} h`;
  if (ms >= 60 * 1000 && ms % (60 * 1000) === 0)
    return `${ms / (60 * 1000)} m`;
  if (ms >= 1000 && ms % 1000 === 0)
    return `${ms / 1000} s`;
  return `${ms} ms`;
}

/**
 * Create a reusable rate limiter for any endpoint.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * are configured. Falls back to in-memory otherwise (or on Redis errors).
 *
 * @param maxRequests  Maximum requests allowed per window
 * @param windowMs     Window duration in milliseconds
 * @param prefix       Prefix for Redis keys (required for Redis-backed limiters)
 *
 * Returns an object with an async `check(key)` method.
 */
export function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  prefix?: string
) {
  // Attempt to initialise Upstash Redis limiter
  let upstash: Ratelimit | null = null;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      upstash = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, msToUpstashWindow(windowMs)),
        prefix: `ratelimit:${prefix ?? "generic"}`,
      });
    } catch {
      upstash = null;
    }
  }

  // In-memory fallback store
  const limiterStore = new Map<string, RateLimitEntry>();

  // Periodic cleanup for in-memory store
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of limiterStore) {
      if (now >= entry.resetAt) {
        limiterStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  if (timer && typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }

  function checkInMemory(key: string): RateLimitResult {
    const now = Date.now();
    const entry = limiterStore.get(key);

    if (!entry || now >= entry.resetAt) {
      const resetAt = now + windowMs;
      limiterStore.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    if (entry.count < maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetAt: entry.resetAt,
      };
    }

    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    async check(key: string): Promise<RateLimitResult> {
      if (upstash) {
        try {
          const result = await upstash.limit(key);
          return {
            allowed: result.success,
            remaining: result.remaining,
            resetAt: result.reset,
          };
        } catch {
          // Fall back to in-memory on Redis errors
          return checkInMemory(key);
        }
      }
      return checkInMemory(key);
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  IP extraction                                                             */
/* -------------------------------------------------------------------------- */

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
