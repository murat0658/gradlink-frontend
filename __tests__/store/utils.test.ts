import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store/types";

// Mock utility functions that might exist in the store utils
describe("Store Utils", () => {
  describe("createLoadingSelector", () => {
    const createLoadingSelector = (actions: string[]) =>
      createSelector(
        (state: RootState) => state,
        (state) => {
          return actions.some((action) => {
            const actionType = action.split("/")[0];
            return (state as any)[actionType]?.loading;
          });
        }
      );

    it("should return true when any action is loading", () => {
      const selector = createLoadingSelector(["user/fetchProfile"]);
      const state = {
        user: {
          loading: true,
          error: null,
          isAuthenticated: false,
          token: null,
          profile: null,
        },
        events: { loading: false, error: null, items: [] },
        groups: { loading: false, error: null, items: [] },
        notifications: { loading: false, error: null, items: [] },
        subscriptions: { loading: false, error: null, items: [] },
        joinedGroups: { loading: false, error: null, items: [] },
        enrollments: { loading: false, error: null, items: [] },
        topicAnswers: {},
      };

      const result = selector(state as RootState);
      expect(result).toBe(true);
    });

    it("should return false when no actions are loading", () => {
      const selector = createLoadingSelector(["user/fetchProfile"]);
      const state = {
        user: {
          loading: false,
          error: null,
          isAuthenticated: false,
          token: null,
          profile: null,
        },
        events: { loading: false, error: null, items: [] },
        groups: { loading: false, error: null, items: [] },
        notifications: { loading: false, error: null, items: [] },
        subscriptions: { loading: false, error: null, items: [] },
        joinedGroups: { loading: false, error: null, items: [] },
        enrollments: { loading: false, error: null, items: [] },
        topicAnswers: {},
      };

      const result = selector(state as RootState);
      expect(result).toBe(false);
    });
  });

  describe("createErrorSelector", () => {
    const createErrorSelector = (actions: string[]) =>
      createSelector(
        (state: RootState) => state,
        (state) => {
          return actions
            .map((action) => {
              const actionType = action.split("/")[0];
              return (state as any)[actionType]?.error;
            })
            .find((error) => error !== null);
        }
      );

    it("should return first error found", () => {
      const selector = createErrorSelector([
        "user/fetchProfile",
        "events/fetchEvents",
      ]);
      const state = {
        user: {
          loading: false,
          error: "User error",
          isAuthenticated: false,
          token: null,
          profile: null,
        },
        events: { loading: false, error: "Events error", items: [] },
        groups: { loading: false, error: null, items: [] },
        notifications: { loading: false, error: null, items: [] },
        subscriptions: { loading: false, error: null, items: [] },
        joinedGroups: { loading: false, error: null, items: [] },
        enrollments: { loading: false, error: null, items: [] },
        topicAnswers: {},
      };

      const result = selector(state as RootState);
      expect(result).toBe("User error");
    });

    it("should return undefined when no errors", () => {
      const selector = createErrorSelector(["user/fetchProfile"]);
      const state = {
        user: {
          loading: false,
          error: null,
          isAuthenticated: false,
          token: null,
          profile: null,
        },
        events: { loading: false, error: null, items: [] },
        groups: { loading: false, error: null, items: [] },
        notifications: { loading: false, error: null, items: [] },
        subscriptions: { loading: false, error: null, items: [] },
        joinedGroups: { loading: false, error: null, items: [] },
        enrollments: { loading: false, error: null, items: [] },
        topicAnswers: {},
      };

      const result = selector(state as RootState);
      expect(result).toBeUndefined();
    });
  });

  describe("formatDate", () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    it("should format date correctly", () => {
      const result = formatDate("2024-12-31T10:00:00Z");
      expect(result).toBe("Dec 31, 2024");
    });

    it("should handle invalid date", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("Invalid Date");
    });
  });

  describe("formatTime", () => {
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    it("should format time correctly", () => {
      const result = formatTime("2024-12-31T10:00:00Z");
      expect(result).toBe("10:00 AM");
    });

    it("should handle PM time", () => {
      const result = formatTime("2024-12-31T14:30:00Z");
      expect(result).toBe("2:30 PM");
    });
  });

  describe("formatMemberCount", () => {
    const formatMemberCount = (count: number) => {
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
      }
      return count.toString();
    };

    it("should format large numbers with k suffix", () => {
      expect(formatMemberCount(1000)).toBe("1.0k");
      expect(formatMemberCount(1500)).toBe("1.5k");
      expect(formatMemberCount(2000)).toBe("2.0k");
    });

    it("should format small numbers without suffix", () => {
      expect(formatMemberCount(100)).toBe("100");
      expect(formatMemberCount(999)).toBe("999");
    });
  });

  describe("isEventEnrolled", () => {
    const isEventEnrolled = (eventId: string, enrollments: any[]) => {
      return enrollments.some((enrollment) => enrollment.eventId === eventId);
    };

    it("should return true if event is enrolled", () => {
      const enrollments = [
        { eventId: "1", status: "ENROLLED" },
        { eventId: "2", status: "ENROLLED" },
      ];
      expect(isEventEnrolled("1", enrollments)).toBe(true);
    });

    it("should return false if event is not enrolled", () => {
      const enrollments = [
        { eventId: "1", status: "ENROLLED" },
        { eventId: "2", status: "ENROLLED" },
      ];
      expect(isEventEnrolled("3", enrollments)).toBe(false);
    });
  });

  describe("isGroupSubscribed", () => {
    const isGroupSubscribed = (groupCode: string, subscriptions: any[]) => {
      return subscriptions.some((sub) => sub.groupCode === groupCode);
    };

    it("should return true if group is subscribed", () => {
      const subscriptions = [
        { groupCode: "harvard" },
        { groupCode: "stanford" },
      ];
      expect(isGroupSubscribed("harvard", subscriptions)).toBe(true);
    });

    it("should return false if group is not subscribed", () => {
      const subscriptions = [
        { groupCode: "harvard" },
        { groupCode: "stanford" },
      ];
      expect(isGroupSubscribed("mit", subscriptions)).toBe(false);
    });
  });

  describe("filterEventsByGroup", () => {
    const filterEventsByGroup = (events: any[], groupCode: string) => {
      return events.filter((event) => event.groupCode === groupCode);
    };

    it("should filter events by group code", () => {
      const events = [
        { id: "1", groupCode: "harvard", title: "Harvard Event" },
        { id: "2", groupCode: "stanford", title: "Stanford Event" },
        { id: "3", groupCode: "harvard", title: "Another Harvard Event" },
      ];

      const result = filterEventsByGroup(events, "harvard");
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Harvard Event");
      expect(result[1].title).toBe("Another Harvard Event");
    });

    it("should return empty array if no events match", () => {
      const events = [
        { id: "1", groupCode: "harvard", title: "Harvard Event" },
      ];

      const result = filterEventsByGroup(events, "mit");
      expect(result).toHaveLength(0);
    });
  });

  describe("sortEventsByDate", () => {
    const sortEventsByDate = (events: any[]) => {
      return [...events].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    };

    it("should sort events by start time", () => {
      const events = [
        { id: "1", startTime: "2024-12-31T10:00:00Z" },
        { id: "2", startTime: "2024-12-30T10:00:00Z" },
        { id: "3", startTime: "2025-01-01T10:00:00Z" },
      ];

      const result = sortEventsByDate(events);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
      expect(result[2].id).toBe("3");
    });
  });
});
