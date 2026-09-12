import {
  canEnrollInEvent,
  isEventAtCapacity,
  isPrioritySeatsOnly,
} from "../../app/utils/status";

/**
 * Mirrors the enroll button label logic in group Events tab /
 * event detail so UX copy stays consistent with seat rules.
 */
function enrollCtaLabel(
  event: {
    capacity?: number | null;
    enrolledCount?: number | null;
    canEnroll?: boolean;
    reservedPremiumSeats?: number;
    prioritySeatsOnly?: boolean;
  },
  options: { premium?: boolean; enrolled?: boolean } = {}
): "Enrolled" | "Full" | "Enroll" | "Premium seats" {
  const enrolled = Boolean(options.enrolled);
  const trulyFull = isEventAtCapacity(event);
  const canEnroll = canEnrollInEvent(event, options);
  if (enrolled) return "Enrolled";
  if (trulyFull) return "Full";
  if (canEnroll) return "Enroll";
  return "Premium seats";
}

describe("Enroll CTA UX scenarios", () => {
  it("open seats → Enroll for free and premium", () => {
    const event = { capacity: 20, enrolledCount: 5 };
    expect(enrollCtaLabel(event, { premium: false })).toBe("Enroll");
    expect(enrollCtaLabel(event, { premium: true })).toBe("Enroll");
    expect(isPrioritySeatsOnly(event)).toBe(false);
  });

  it("already enrolled → Enrolled even when full", () => {
    const event = { capacity: 10, enrolledCount: 10 };
    expect(enrollCtaLabel(event, { enrolled: true, premium: false })).toBe("Enrolled");
    expect(canEnrollInEvent(event, { enrolled: true })).toBe(false);
  });

  it("at capacity → Full for non-enrolled users", () => {
    const event = { capacity: 10, enrolledCount: 10 };
    expect(enrollCtaLabel(event, { premium: false })).toBe("Full");
    expect(enrollCtaLabel(event, { premium: true })).toBe("Full");
    expect(isEventAtCapacity(event)).toBe(true);
  });

  it("reserved premium seats only → Premium seats for free, Enroll for premium", () => {
    const event = { capacity: 10, enrolledCount: 9 };
    expect(isPrioritySeatsOnly(event)).toBe(true);
    expect(enrollCtaLabel(event, { premium: false })).toBe("Premium seats");
    expect(enrollCtaLabel(event, { premium: true })).toBe("Enroll");
  });

  it("server canEnroll=false overrides local seat math for CTA", () => {
    const event = { capacity: 50, enrolledCount: 1, canEnroll: false };
    expect(enrollCtaLabel(event, { premium: true })).toBe("Premium seats");
  });

  it("server canEnroll=true allows Enroll even if counts look full", () => {
    const event = { capacity: 10, enrolledCount: 10, canEnroll: true };
    // Full takes precedence in CTA when capacity filled
    expect(enrollCtaLabel(event, { premium: true })).toBe("Full");
  });

  it("unlimited capacity (0) never shows Full", () => {
    const event = { capacity: 0, enrolledCount: 100 };
    expect(isEventAtCapacity(event)).toBe(false);
    expect(enrollCtaLabel(event, { premium: false })).toBe("Enroll");
  });
});
