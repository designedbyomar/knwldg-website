import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/booking-rate-limit", () => ({
  checkBookingRateLimit: mocks.checkRateLimit,
}));

vi.mock("@/lib/resend", () => ({
  getResendClient: () => ({ emails: { send: mocks.sendEmail } }),
}));

import { POST } from "@/app/api/booking/route";

const validSubmission = {
  name: "Test Guest",
  email: "guest@example.com",
  eventType: "Wedding",
  eventDate: "2026-08-10",
  company: "",
  formRenderedAt: Date.parse("2026-08-10T15:59:55.000Z"),
};

function jsonRequest(body: unknown): Request {
  return new Request("https://djknwldg.com/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.50" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/booking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T16:00:00.000Z"));
    mocks.checkRateLimit.mockReset();
    mocks.sendEmail.mockReset();
    mocks.checkRateLimit.mockResolvedValue({
      outcome: "allowed",
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "9",
        "X-RateLimit-Reset": "1786381200",
      },
    });
    mocks.sendEmail.mockResolvedValue({ data: { id: "email-id" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "test-resend-key");
    vi.stubEnv("BOOKING_FROM_EMAIL", "KNWLDG Bookings <bookings@djknwldg.com>");
    vi.stubEnv("BOOKING_TO_EMAIL", "hello@djknwldg.com");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("checks the limiter before attempting to parse malformed JSON", async () => {
    const json = vi.fn(async () => {
      expect(mocks.checkRateLimit).toHaveBeenCalledOnce();
      throw new SyntaxError("bad json");
    });
    const request = { headers: new Headers(), json } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.checkRateLimit).toHaveBeenCalledOnce();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("returns 429 with retry headers without parsing or sending", async () => {
    mocks.checkRateLimit.mockResolvedValue({
      outcome: "limited",
      headers: {
        "Retry-After": "3600",
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1786381200",
      },
    });
    const json = vi.fn(() => {
      throw new Error("body should not be parsed");
    });
    const request = { headers: new Headers(), json } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many booking attempts. Please try again later.",
    });
    expect(response.headers.get("Retry-After")).toBe("3600");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(json).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("counts but silently drops a honeypot request", async () => {
    const response = await POST(jsonRequest({ ...validSubmission, company: "Bot Company" }));

    expect(response.status).toBe(200);
    expect(mocks.checkRateLimit).toHaveBeenCalledOnce();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("returns 503 without logging form data or calling Resend when email config is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(jsonRequest(validSubmission));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Booking service is temporarily unavailable. Please try again later.",
    });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(JSON.stringify(error.mock.calls)).not.toContain(validSubmission.email);
    expect(JSON.stringify(error.mock.calls)).not.toContain(validSubmission.name);
  });

  it("sends a valid booking with the configured sender, recipient, and reply-to", async () => {
    const response = await POST(jsonRequest(validSubmission));

    expect(response.status).toBe(200);
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "KNWLDG Bookings <bookings@djknwldg.com>",
        to: "hello@djknwldg.com",
        replyTo: "guest@example.com",
      })
    );
  });
});
