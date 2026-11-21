export const HOLD_MINUTES = 15;
export type NewStatus = "held" | "waitlisted";
/** A full session puts new bookings on the waiting list. */
export const decideStatus = (taken: number, capacity: number): NewStatus => (taken >= capacity ? "waitlisted" : "held");
export const holdExpiry = (now: Date) => new Date(now.getTime() + HOLD_MINUTES * 60_000);
export const isHoldExpired = (status: string, holdExpiresAt: string | null, now = new Date()) =>
  status === "held" && !!holdExpiresAt && new Date(holdExpiresAt) <= now;
export const MAX_ACTIVE_HOLDS = 2;
/** Stops one email or phone from holding many unpaid spots at once. */
export const tooManyHolds = (byEmail: number, byPhone: number) => byEmail >= MAX_ACTIVE_HOLDS || byPhone >= MAX_ACTIVE_HOLDS;
