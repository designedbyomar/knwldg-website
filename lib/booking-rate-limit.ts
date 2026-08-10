import "server-only";

import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const BOOKING_RATE_LIMIT = 10;
const BOOKING_RATE_WINDOW = "1 h";
const REDIS_TIMEOUT_MS = 1_000;

type RateLimitHeaders = Record<string, string>;

export type BookingRateLimitDecision =
  | { outcome: "allowed"; headers: RateLimitHeaders }
  | { outcome: "limited"; headers: RateLimitHeaders }
  | { outcome: "unavailable"; headers: RateLimitHeaders };

let bookingLimiter: Ratelimit | null = null;

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function getTrustedClientAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedAddress = forwardedFor?.split(",", 1)[0]?.trim();

  return firstForwardedAddress || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function getLimiter(): Ratelimit | null {
  if (bookingLimiter) return bookingLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  const environment = process.env.VERCEL_ENV || "local";

  bookingLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(BOOKING_RATE_LIMIT, BOOKING_RATE_WINDOW),
    prefix: `knwldg:booking:${environment}`,
    analytics: false,
    timeout: REDIS_TIMEOUT_MS,
  });

  return bookingLimiter;
}

function createRateLimitHeaders(limit: number, remaining: number, reset: number): RateLimitHeaders {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(reset / 1_000)),
  };
}

export async function checkBookingRateLimit(
  request: Request
): Promise<BookingRateLimitDecision> {
  const salt = process.env.RATE_LIMIT_SALT;
  const limiter = getLimiter();

  if (!salt || !limiter) {
    if (isProductionRuntime()) {
      console.error("[booking] rate limiter configuration is unavailable");
      return { outcome: "unavailable", headers: {} };
    }

    return { outcome: "allowed", headers: {} };
  }

  const identifier = createHmac("sha256", salt)
    .update(getTrustedClientAddress(request))
    .digest("hex");

  try {
    const result = await limiter.limit(identifier);

    if (result.reason === "timeout") {
      console.warn("[booking] rate limiter timed out; request allowed");
      return { outcome: "allowed", headers: {} };
    }

    const headers = createRateLimitHeaders(result.limit, result.remaining, result.reset);
    if (result.success) return { outcome: "allowed", headers };

    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000));
    return {
      outcome: "limited",
      headers: { ...headers, "Retry-After": String(retryAfterSeconds) },
    };
  } catch {
    console.error("[booking] rate limiter request failed");
    return isProductionRuntime()
      ? { outcome: "unavailable", headers: {} }
      : { outcome: "allowed", headers: {} };
  }
}
