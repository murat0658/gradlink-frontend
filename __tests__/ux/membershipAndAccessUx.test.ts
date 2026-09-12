import {
  membershipCtas,
  groupAccessMessage,
  toastErrorText,
} from "../../app/utils/membershipUx";

describe("Membership CTA UX", () => {
  it("visitor: Subscribe only", () => {
    expect(membershipCtas({ subscribed: false, joined: false })).toEqual({
      showSubscribe: true,
      showJoin: false,
      showLeave: false,
      subscribeLabel: "Subscribe",
    });
  });

  it("subscribed non-member: Subscribe→Unsubscribe + Join", () => {
    expect(membershipCtas({ subscribed: true, joined: false })).toEqual({
      showSubscribe: true,
      showJoin: true,
      showLeave: false,
      subscribeLabel: "Unsubscribe",
    });
  });

  it("member: Leave only (no Subscribe/Join)", () => {
    expect(membershipCtas({ subscribed: true, joined: true })).toEqual({
      showSubscribe: false,
      showJoin: false,
      showLeave: true,
      subscribeLabel: "Unsubscribe",
    });
  });

  it("joined wins even if subscription flag is false", () => {
    expect(membershipCtas({ subscribed: false, joined: true }).showLeave).toBe(
      true
    );
  });
});

describe("Group access UX copy", () => {
  it("403 → private/inactive messaging", () => {
    expect(groupAccessMessage(403)).toMatch(/private or inactive/i);
  });

  it("404 → not found", () => {
    expect(groupAccessMessage(404)).toBe("Group not found.");
  });

  it("unknown → not found fallback", () => {
    expect(groupAccessMessage(null)).toBe("Group not found.");
  });
});

describe("Offline / toast error copy", () => {
  it("maps network failures to offline-friendly toast", () => {
    expect(toastErrorText(new Error("Network error: Unable to connect"))).toMatch(
      /offline/i
    );
    expect(toastErrorText(new Error("Failed to fetch"))).toMatch(/offline/i);
  });

  it("passes through API business errors", () => {
    expect(toastErrorText(new Error("Event is full"))).toBe("Event is full");
  });

  it("maps RTK serialized errors the same way", () => {
    expect(
      toastErrorText({ message: "Network error: Unable to connect to http://x" })
    ).toMatch(/offline/i);
    expect(toastErrorText({ message: "Event is full" })).toBe("Event is full");
  });

  it("uses fallback for empty errors", () => {
    expect(toastErrorText(null)).toBe("Please try again.");
  });
});
