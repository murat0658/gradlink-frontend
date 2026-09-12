/**
 * Membership CTA visibility for group detail header.
 * Join is only offered after Subscribe; Leave replaces both when joined.
 */
export type MembershipCtaState = {
  showSubscribe: boolean;
  showJoin: boolean;
  showLeave: boolean;
  subscribeLabel: "Subscribe" | "Unsubscribe";
};

export function membershipCtas(options: {
  subscribed: boolean;
  joined: boolean;
}): MembershipCtaState {
  const { subscribed, joined } = options;
  if (joined) {
    return {
      showSubscribe: false,
      showJoin: false,
      showLeave: true,
      subscribeLabel: "Unsubscribe",
    };
  }
  return {
    showSubscribe: true,
    showJoin: subscribed,
    showLeave: false,
    subscribeLabel: subscribed ? "Unsubscribe" : "Subscribe",
  };
}

/** User-facing copy when a group cannot be shown. */
export function groupAccessMessage(status: number | null | undefined): string {
  if (status === 403) {
    return "This group is private or inactive. You need membership to view it.";
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
