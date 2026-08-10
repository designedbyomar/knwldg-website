import { beforeEach, describe, expect, it, vi } from "vitest";

const fakeUpstash = vi.hoisted(() => ({
  configs: [] as Array<Record<string, unknown>>,
  counters: new Map<string, number>(),
  identifiers: [] as string[],
  mode: "normal" as "normal" | "timeout",
  slidingWindowArgs: [] as Array<[number, string]>,
}));

vi.mock("@upstash/redis", () => ({
  Redis: class FakeRedis {
    constructor(public config: Record<string, unknown>) {}
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class FakeRatelimit {
    static slidingWindow(limit: number, window: string) {
      fakeUpstash.slidingWindowArgs.push([limit, window]);
      return { limit, window };
    }

    constructor(config: Record<string, unknown>) {
      fakeUpstash.configs.push(config);
    }

    async limit(identifier: string) {
      fakeUpstash.identifiers.push(identifier);
      if (fakeUpstash.mode === "timeout") {
        return {
          success: true,
          limit: 0,
          remaining: 0,
          reset: 0,
          pending: Promise.resolve(),
          reason: "timeout",
        };
      }

      const count = (fakeUpstash.counters.get(identifier) ?? 0) + 1;
      fakeUpstash.counters.set(identifier, count);
      return {
        success: count <= 10,
        limit: 10,
        remaining: Math.max(0, 10 - count),
        reset: Date.now() + 60 * 60 * 1_000,
        pending: Promise.resolve(),
      };
    }
  },
}));

function requestFrom(address: string): Request {
  return new Request("https://djknwldg.com/api/booking", {
    method: "POST",
    headers: { "x-forwarded-for": `${address}, 10.0.0.1` },
  });
}

async function loadRateLimiter() {
  return import("@/lib/booking-rate-limit");
}

describe("booking rate limiter", () => {
  beforeEach(() => {
    vi.resetModules();
    fakeUpstash.configs.length = 0;
    fakeUpstash.counters.clear();
    fakeUpstash.identifiers.length = 0;
    fakeUpstash.mode = "normal";
    fakeUpstash.slidingWindowArgs.length = 0;
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");
    vi.stubEnv("RATE_LIMIT_SALT", "test-only-hmac-salt");
  });

  it("allows requests 1-10, limits request 11, and leaves another IP unaffected", async () => {
    const { checkBookingRateLimit } = await loadRateLimiter();

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      await expect(checkBookingRateLimit(requestFrom("203.0.113.10"))).resolves.toMatchObject({
        outcome: "allowed",
      });
    }

    const limited = await checkBookingRateLimit(requestFrom("203.0.113.10"));
    expect(limited.outcome).toBe("limited");
    expect(limited.headers).toMatchObject({
      "Retry-After": expect.any(String),
      "X-RateLimit-Limit": "10",
      "X-RateLimit-Remaining": "0",
    });

    await expect(checkBookingRateLimit(requestFrom("203.0.113.11"))).resolves.toMatchObject({
      outcome: "allowed",
    });
    expect(fakeUpstash.identifiers).not.toContain("203.0.113.10");
    expect(fakeUpstash.identifiers[0]).toMatch(/^[a-f0-9]{64}$/);
  });

  it("uses the locked window, a preview-specific prefix, and no analytics", async () => {
    const { checkBookingRateLimit } = await loadRateLimiter();
    await checkBookingRateLimit(requestFrom("203.0.113.20"));

    expect(fakeUpstash.slidingWindowArgs).toEqual([[10, "1 h"]]);
    expect(fakeUpstash.configs[0]).toMatchObject({
      prefix: "knwldg:booking:preview",
      analytics: false,
      timeout: 1_000,
    });
  });

  it("accepts the Vercel Marketplace Redis variable names", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "https://marketplace.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "marketplace-token");
    const { checkBookingRateLimit } = await loadRateLimiter();

    await expect(checkBookingRateLimit(requestFrom("203.0.113.25"))).resolves.toMatchObject({
      outcome: "allowed",
    });
  });

  it("fails closed when production credentials are missing", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("RATE_LIMIT_SALT", "");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { checkBookingRateLimit } = await loadRateLimiter();

    await expect(checkBookingRateLimit(requestFrom("203.0.113.30"))).resolves.toEqual({
      outcome: "unavailable",
      headers: {},
    });
  });

  it("allows a transient timeout and logs no identifier", async () => {
    fakeUpstash.mode = "timeout";
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { checkBookingRateLimit } = await loadRateLimiter();

    await expect(checkBookingRateLimit(requestFrom("203.0.113.40"))).resolves.toEqual({
      outcome: "allowed",
      headers: {},
    });
    expect(warning).toHaveBeenCalledWith("[booking] rate limiter timed out; request allowed");
    expect(JSON.stringify(warning.mock.calls)).not.toContain("203.0.113.40");
    expect(JSON.stringify(warning.mock.calls)).not.toContain(fakeUpstash.identifiers[0]);
  });
});
