import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Upstash modules so they never try to connect to a real Redis instance
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn(),
}));
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(),
}));

// We need to reimport after mocks are set up.
// Use dynamic imports so the mocked modules are in place first.
let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit;
let createRateLimiter: typeof import("@/lib/rate-limit").createRateLimiter;
let getClientIp: typeof import("@/lib/rate-limit").getClientIp;
let getRemainingChecks: typeof import("@/lib/rate-limit").getRemainingChecks;

beforeEach(async () => {
  // Reset the module between tests so the in-memory store is fresh
  vi.resetModules();
  const mod = await import("@/lib/rate-limit");
  checkRateLimit = mod.checkRateLimit;
  createRateLimiter = mod.createRateLimiter;
  getClientIp = mod.getClientIp;
  getRemainingChecks = mod.getRemainingChecks;
});

describe("checkRateLimit (in-memory fallback)", () => {
  it("allows the first request and returns remaining = 2", async () => {
    const result = await checkRateLimit("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });

  it("allows up to 3 requests (FREE_LIMIT)", async () => {
    const ip = "10.0.0.1";

    const r1 = await checkRateLimit(ip);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = await checkRateLimit(ip);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await checkRateLimit(ip);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks the 4th request (allowed = false, remaining = 0)", async () => {
    const ip = "10.0.0.2";

    await checkRateLimit(ip);
    await checkRateLimit(ip);
    await checkRateLimit(ip);

    const r4 = await checkRateLimit(ip);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("tracks different IPs independently", async () => {
    await checkRateLimit("ip-a");
    await checkRateLimit("ip-a");
    await checkRateLimit("ip-a");

    // ip-a is now exhausted
    const blocked = await checkRateLimit("ip-a");
    expect(blocked.allowed).toBe(false);

    // ip-b should still be fresh
    const fresh = await checkRateLimit("ip-b");
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(2);
  });
});

describe("getRemainingChecks", () => {
  it("returns 3 for an IP with no prior requests", () => {
    const remaining = getRemainingChecks("never-seen-ip");
    expect(remaining).toBe(3);
  });

  it("decreases as requests are made", async () => {
    const ip = "counter-ip";
    await checkRateLimit(ip);
    expect(getRemainingChecks(ip)).toBe(2);

    await checkRateLimit(ip);
    expect(getRemainingChecks(ip)).toBe(1);

    await checkRateLimit(ip);
    expect(getRemainingChecks(ip)).toBe(0);
  });
});

describe("createRateLimiter", () => {
  it("creates a limiter with custom limits", () => {
    const limiter = createRateLimiter(5, 60_000, "test");

    const r1 = limiter.check("key1");
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(4);
  });

  it("respects the custom maxRequests", () => {
    const limiter = createRateLimiter(2, 60_000);

    limiter.check("k");
    limiter.check("k");

    const r3 = limiter.check("k");
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("isolates different keys", () => {
    const limiter = createRateLimiter(1, 60_000);

    const a = limiter.check("a");
    expect(a.allowed).toBe(true);

    const a2 = limiter.check("a");
    expect(a2.allowed).toBe(false);

    const b = limiter.check("b");
    expect(b.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18, 150.172.238.178" },
    });
    expect(getClientIp(req)).toBe("203.0.113.50");
  });

  it("extracts IP from x-real-ip header when x-forwarded-for is absent", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.22" },
    });
    expect(getClientIp(req)).toBe("198.51.100.22");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const req = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.50",
        "x-real-ip": "198.51.100.22",
      },
    });
    expect(getClientIp(req)).toBe("203.0.113.50");
  });

  it('returns "unknown" when no proxy headers are present', () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("unknown");
  });

  it("trims whitespace from header values", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "  10.0.0.1 , 10.0.0.2" },
    });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });
});
