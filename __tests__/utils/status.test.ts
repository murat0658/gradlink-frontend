import { isPremiumUser, isVerifiedUser, unwrapPageContent, canEnrollInEvent, isPrioritySeatsOnly } from "../../app/utils/status";

describe("status helpers", () => {
  it("reads verified from either field name", () => {
    expect(isVerifiedUser({ verified: true })).toBe(true);
    expect(isVerifiedUser({ isVerified: true })).toBe(true);
    expect(isVerifiedUser({ verified: false })).toBe(false);
  });

  it("reads premium from either field name", () => {
    expect(isPremiumUser({ premium: true })).toBe(true);
    expect(isPremiumUser({ isPremium: true })).toBe(true);
    expect(isPremiumUser({})).toBe(false);
  });

  it("unwraps Spring Page content", () => {
    expect(unwrapPageContent({ content: [{ id: "1" }] })).toEqual([{ id: "1" }]);
    expect(unwrapPageContent([{ id: "2" }])).toEqual([{ id: "2" }]);
    expect(unwrapPageContent(null)).toEqual([]);
  });

  it("blocks free users from reserved premium seats", () => {
    const event = { capacity: 10, enrolledCount: 9 };
    expect(canEnrollInEvent(event, { premium: false })).toBe(false);
    expect(canEnrollInEvent(event, { premium: true })).toBe(true);
    expect(isPrioritySeatsOnly(event)).toBe(true);
  });

  it("trusts server canEnroll when present", () => {
    expect(canEnrollInEvent({ canEnroll: true, capacity: 10, enrolledCount: 10 })).toBe(true);
    expect(canEnrollInEvent({ canEnroll: false, capacity: 10, enrolledCount: 8 })).toBe(false);
  });
});
