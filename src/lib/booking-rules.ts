export const HOLD_MINUTES = 15;
export type NewStatus = "held" | "waitlisted";
/** A full session puts new bookings on the waiting list. */
export const decideStatus = (taken: number, capacity: number): NewStatus => (taken >= capacity ? "waitlisted" : "held");
export const holdExpiry = (now: Date) => new Date(now.getTime() + HOLD_MINUTES * 60_000);
export const isHoldExpired = (status: string, holdExpiresAt: string | null, now = new Date()) =>
  status === "held" && !!holdExpiresAt && new Date(holdExpiresAt) <= now;
