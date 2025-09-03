import { createSelector } from "@reduxjs/toolkit";
import {
  selectUser,
  selectIsAuthenticated,
  selectUserProfile,
  selectEvents,
  selectGroups,
  selectNotifications,
  selectUnreadNotifications,
  selectSubscriptions,
  selectSubscribedGroupCodes,
  selectJoinedGroups,
  selectJoinedGroupCodes,
  selectEnrollments,
  selectEnrolledEvents,
  selectIsAnyLoading,
  selectHasAnyError,
} from "../../../app/store/selectors/index";
import {
  createMockUser,
  createMockEvent,
  createMockGroup,
  createMockNotification,
  createMockEnrollment,
} from "../../utils/test-utils";

describe("Redux Selectors", () => {
  const mockState = {
    user: {
      isAuthenticated: true,
      token: "test-token",
      profile: createMockUser(),
      loading: false,
      error: null,
    },
    events: {
      items: [
        createMockEvent({ id: "1", title: "Event 1" }),
        createMockEvent({ id: "2", title: "Event 2" }),
      ],
      loading: false,
      error: null,
    },
    groups: {
      items: [
        createMockGroup({ code: "group-1", university: "University 1" }),
        createMockGroup({ code: "group-2", university: "University 2" }),
      ],
      loading: false,
      error: null,
    },
    notifications: {
      items: [
        createMockNotification({ id: "1", isRead: false }),
        createMockNotification({ id: "2", isRead: true }),
        createMockNotification({ id: "3", isRead: false }),
      ],
      loading: false,
      error: null,
    },
    subscriptions: {
      items: [
        { id: "1", groupCode: "group-1" },
        { id: "2", groupCode: "group-2" },
      ],
      loading: false,
      error: null,
    },
    joinedGroups: {
      items: [
        { id: "1", groupCode: "group-1" },
        { id: "2", groupCode: "group-2" },
      ],
      loading: false,
      error: null,
    },
    enrollments: {
      items: [
        createMockEnrollment({ id: "1", eventId: "1" }),
        createMockEnrollment({ id: "2", eventId: "2" }),
      ],
      loading: false,
      error: null,
    },
    topicAnswers: {},
  };

  describe("User Selectors", () => {
    it("selectUser should return user state", () => {
      const result = selectUser(mockState);
      expect(result).toEqual(mockState.user);
    });

    it("selectIsAuthenticated should return authentication status", () => {
      const result = selectIsAuthenticated(mockState);
      expect(result).toBe(true);
    });

    it("selectUserProfile should return user profile", () => {
      const result = selectUserProfile(mockState);
      expect(result).toEqual(mockState.user.profile);
    });
  });

  describe("Events Selectors", () => {
    it("selectEvents should return events list", () => {
      const result = selectEvents(mockState);
      expect(result).toEqual(mockState.events.items);
      expect(result).toHaveLength(2);
    });
  });

  describe("Groups Selectors", () => {
    it("selectGroups should return groups list", () => {
      const result = selectGroups(mockState);
      expect(result).toEqual(mockState.groups.items);
      expect(result).toHaveLength(2);
    });
  });

  describe("Notifications Selectors", () => {
    it("selectNotifications should return notifications list", () => {
      const result = selectNotifications(mockState);
      expect(result).toEqual(mockState.notifications.items);
      expect(result).toHaveLength(3);
    });

    it("selectUnreadNotifications should return only unread notifications", () => {
      const result = selectUnreadNotifications(mockState);
      expect(result).toHaveLength(2);
      expect(result.every((notification) => !notification.isRead)).toBe(true);
    });
  });

  describe("Subscriptions Selectors", () => {
    it("selectSubscriptions should return subscriptions list", () => {
      const result = selectSubscriptions(mockState);
      expect(result).toEqual(mockState.subscriptions.items);
      expect(result).toHaveLength(2);
    });

    it("selectSubscribedGroupCodes should return group codes", () => {
      const result = selectSubscribedGroupCodes(mockState);
      expect(result).toEqual(["group-1", "group-2"]);
    });
  });

  describe("Joined Groups Selectors", () => {
    it("selectJoinedGroups should return joined groups list", () => {
      const result = selectJoinedGroups(mockState);
      expect(result).toEqual(mockState.joinedGroups.items);
      expect(result).toHaveLength(2);
    });

    it("selectJoinedGroupCodes should return group codes", () => {
      const result = selectJoinedGroupCodes(mockState);
      expect(result).toEqual(["group-1", "group-2"]);
    });
  });

  describe("Enrollments Selectors", () => {
    it("selectEnrollments should return enrollments list", () => {
      const result = selectEnrollments(mockState);
      expect(result).toEqual(mockState.enrollments.items);
      expect(result).toHaveLength(2);
    });

    it("selectEnrolledEvents should return events that user is enrolled in", () => {
      const result = selectEnrolledEvents(mockState);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });

    it("selectEnrolledEvents should return empty array when no enrollments", () => {
      const stateWithNoEnrollments = {
        ...mockState,
        enrollments: { items: [], loading: false, error: null },
      };

      const result = selectEnrolledEvents(stateWithNoEnrollments);
      expect(result).toHaveLength(0);
    });
  });

  describe("Loading State Selectors", () => {
    it("selectIsAnyLoading should return true when any slice is loading", () => {
      const stateWithLoading = {
        ...mockState,
        events: { ...mockState.events, loading: true },
      };

      const result = selectIsAnyLoading(stateWithLoading);
      expect(result).toBe(true);
    });

    it("selectIsAnyLoading should return false when no slice is loading", () => {
      const result = selectIsAnyLoading(mockState);
      expect(result).toBe(false);
    });
  });

  describe("Error State Selectors", () => {
    it("selectHasAnyError should return true when any slice has error", () => {
      const stateWithError = {
        ...mockState,
        events: { ...mockState.events, error: "Test error" },
      };

      const result = selectHasAnyError(stateWithError);
      expect(result).toBe(true);
    });

    it("selectHasAnyError should return false when no slice has error", () => {
      const result = selectHasAnyError(mockState);
      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty state", () => {
      const emptyState = {
        user: {
          isAuthenticated: false,
          token: null,
          profile: null,
          loading: false,
          error: null,
        },
        events: { items: [], loading: false, error: null },
        groups: { items: [], loading: false, error: null },
        notifications: { items: [], loading: false, error: null },
        subscriptions: { items: [], loading: false, error: null },
        joinedGroups: { items: [], loading: false, error: null },
        enrollments: { items: [], loading: false, error: null },
        topicAnswers: {},
      };

      expect(selectEvents(emptyState)).toEqual([]);
      expect(selectGroups(emptyState)).toEqual([]);
      expect(selectNotifications(emptyState)).toEqual([]);
      expect(selectUnreadNotifications(emptyState)).toEqual([]);
      expect(selectSubscriptions(emptyState)).toEqual([]);
      expect(selectSubscribedGroupCodes(emptyState)).toEqual([]);
      expect(selectJoinedGroups(emptyState)).toEqual([]);
      expect(selectJoinedGroupCodes(emptyState)).toEqual([]);
      expect(selectEnrollments(emptyState)).toEqual([]);
      expect(selectEnrolledEvents(emptyState)).toEqual([]);
      expect(selectIsAnyLoading(emptyState)).toBe(false);
      expect(selectHasAnyError(emptyState)).toBe(false);
    });

    it("should handle null/undefined values gracefully", () => {
      const stateWithNulls = {
        ...mockState,
        user: { ...mockState.user, profile: null },
        events: { ...mockState.events, items: null as any },
      };

      expect(selectUserProfile(stateWithNulls)).toBe(null);
      expect(selectEvents(stateWithNulls)).toBe(null);
    });
  });
});
