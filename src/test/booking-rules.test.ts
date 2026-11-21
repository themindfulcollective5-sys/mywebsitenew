import { describe, it, expect } from "vitest";
import { decideStatus, holdExpiry, isHoldExpired, tooManyHolds } from "@/lib/booking-rules";
import { findItem } from "@/lib/catalog";

describe("booking rules", () => {
  it("holds a spot for 15 minutes", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(holdExpiry(now).toISOString()).toBe("2026-01-01T00:15:00.000Z");
  });
  it("releases an unpaid hold after it expires", () => {
    expect(isHoldExpired("held", "2026-01-01T00:15:00Z", new Date("2026-01-01T00:16:00Z"))).toBe(true);
    expect(isHoldExpired("held", "2026-01-01T00:15:00Z", new Date("2026-01-01T00:10:00Z"))).toBe(false);
  });
  it("puts bookings on the waiting list when the session is full", () => {
    expect(decideStatus(10, 10)).toBe("waitlisted");
    expect(decideStatus(9, 10)).toBe("held");
  });
  it("prices come from the server price list", () => {
    expect(findItem("beginner-2x")?.pricePaise).toBe(359900);
    expect(findItem("sound")?.pricePaise).toBe(89900);
  });
  it("blocks a third unpaid hold for the same email or phone", () => {
    expect(tooManyHolds(2, 0)).toBe(true);
    expect(tooManyHolds(0, 2)).toBe(true);
    expect(tooManyHolds(1, 1)).toBe(false);
  });
});
