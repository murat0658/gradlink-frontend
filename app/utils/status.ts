export type StatusUser = {
  verified?: boolean;
  isVerified?: boolean;
  premium?: boolean;
  isPremium?: boolean;
};

export function isVerifiedUser(user?: StatusUser | null): boolean {
  if (!user) return false;
  return Boolean(user.verified ?? user.isVerified);
}

export function isPremiumUser(user?: StatusUser | null): boolean {
  if (!user) return false;
  return Boolean(user.premium ?? user.isPremium);
}

export type EventSeatInfo = {
  capacity?: number | null;
  enrolledCount?: number | null;
  canEnroll?: boolean;
  reservedPremiumSeats?: number;
  prioritySeatsOnly?: boolean;
};

export function isEventAtCapacity(event: EventSeatInfo): boolean {
  const capacity = event.capacity ?? 0;
  if (capacity <= 0) return false;
  return (event.enrolledCount ?? 0) >= capacity;
}

export function reservedSeatsFor(event: EventSeatInfo): number {
  if (typeof event.reservedPremiumSeats === "number") {
    return event.reservedPremiumSeats;
  }
  const capacity = event.capacity ?? 0;
  if (capacity <= 1) return 0;
  return Math.max(1, Math.floor(capacity / 10));
}

export function isPrioritySeatsOnly(event: EventSeatInfo): boolean {
  if (typeof event.prioritySeatsOnly === "boolean") {
    return event.prioritySeatsOnly;
  }
  if (isEventAtCapacity(event)) return false;
  const capacity = event.capacity ?? 0;
  if (capacity <= 0) return false;
  const remaining = capacity - (event.enrolledCount ?? 0);
  return remaining <= reservedSeatsFor(event);
}

export function canEnrollInEvent(
  event: EventSeatInfo,
  options: { premium?: boolean; enrolled?: boolean } = {}
): boolean {
  if (options.enrolled) return false;
  if (typeof event.canEnroll === "boolean") return event.canEnroll;
  if (isEventAtCapacity(event)) return false;
  if (isPrioritySeatsOnly(event)) return Boolean(options.premium);
  return true;
}

export function unwrapPageContent<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { content?: unknown }).content)) {
    return (payload as { content: T[] }).content;
  }
  return [];
}
