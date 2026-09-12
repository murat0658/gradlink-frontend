/**
 * Membership CTA visibility for group detail header.
 * Follow → Request to join → Cancel request (while pending) → Leave when active.
 * Unfollow while pending should also withdraw the join request (handled in UI).
 */
export type MembershipCtaState = {
  showSubscribe: boolean;
  showJoin: boolean;
  showLeave: boolean;
  showPending: boolean;
  subscribeLabel: "Follow" | "Unfollow";
  joinLabel: "Request to join" | "Cancel request";
  pendingLabel: "Cancel request";
};

export function membershipCtas(options: {
  subscribed: boolean;
  joined: boolean;
  pending?: boolean;
}): MembershipCtaState {
  const { subscribed, joined, pending = false } = options;
  if (joined) {
    return {
      showSubscribe: false,
      showJoin: false,
      showLeave: true,
      showPending: false,
      subscribeLabel: "Unfollow",
      joinLabel: "Request to join",
      pendingLabel: "Cancel request",
    };
  }
  if (pending) {
    return {
      showSubscribe: true,
      showJoin: false,
      showLeave: false,
      showPending: true,
      subscribeLabel: subscribed ? "Unfollow" : "Follow",
      joinLabel: "Cancel request",
      pendingLabel: "Cancel request",
    };
  }
  return {
    showSubscribe: true,
    showJoin: subscribed,
    showLeave: false,
    showPending: false,
    subscribeLabel: subscribed ? "Unfollow" : "Follow",
    joinLabel: "Request to join",
    pendingLabel: "Cancel request",
  };
}

/** User-facing copy when a group cannot be shown. */
export function groupAccessMessage(status: number | null | undefined): string {
  if (status === 403) {
    return "This group is private or inactive. Browse public groups or ask an admin for access.";
  }
  if (status === 404) {
    return "Group not found.";
  }
  return "Group not found.";
}

/** Map thrown API / network errors into a single toast-friendly line. */
export function toastErrorText(error: unknown, fallback = "Please try again."): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : error &&
            typeof error === "object" &&
            "message" in error &&
            typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : "";
  const msg = raw.trim();
  if (!msg) return fallback;
  if (
    msg.includes("Network error") ||
    msg.includes("Failed to fetch") ||
    msg.includes("Network request failed")
  ) {
    return "You appear to be offline. Check your connection and try again.";
  }
  return msg;
}
