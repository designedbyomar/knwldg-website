import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBusinessTodayIso } from "@/lib/business-date";
import { bookingSchema } from "@/lib/validations/booking-schema";

const validSubmission = {
  name: "Test Guest",
  email: "guest@example.com",
  eventType: "Wedding",
  eventDate: "2026-08-10",
};

describe("business date policy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("changes dates at New York midnight, not UTC midnight", () => {
    expect(getBusinessTodayIso(new Date("2026-08-10T03:59:59.999Z"))).toBe("2026-08-09");
    expect(getBusinessTodayIso(new Date("2026-08-10T04:00:00.000Z"))).toBe("2026-08-10");
  });

  it.each(["", "not-a-date", "2026-02-30", "08/10/2026"])(
    "rejects malformed or impossible date %j",
    (eventDate) => {
      vi.setSystemTime(new Date("2026-08-10T16:00:00.000Z"));
      expect(bookingSchema.safeParse({ ...validSubmission, eventDate }).success).toBe(false);
    }
  );

  it("rejects yesterday and accepts today and future dates", () => {
    vi.setSystemTime(new Date("2026-08-10T04:00:00.000Z"));

    expect(
      bookingSchema.safeParse({ ...validSubmission, eventDate: "2026-08-09" }).success
    ).toBe(false);
    expect(
      bookingSchema.safeParse({ ...validSubmission, eventDate: "2026-08-10" }).success
    ).toBe(true);
    expect(
      bookingSchema.safeParse({ ...validSubmission, eventDate: "2027-01-15" }).success
    ).toBe(true);
  });
});
