import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockUser,
  createMockEvent,
  createMockGroup,
} from "../utils/test-utils";
import { store } from "../../app/store";
import {
  setAuthenticated,
  setToken,
  addEvent,
  addGroup,
  addNotification,
  enroll,
  subscribe,
} from "../../app/store/slices";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock the API service
jest.mock("../../app/services/ApiService", () => ({
  apiService: {
    login: jest.fn(),
    getEvents: jest.fn(),
    getGroups: jest.fn(),
    enrollInEvent: jest.fn(),
    subscribeToGroup: jest.fn(),
  },
}));

// Import components
import IndexScreen from "../../app/(tabs)/index";
import GroupsScreen from "../../app/(tabs)/groups/index";
import ProfileScreen from "../../app/(tabs)/profile";

describe("Redux Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication State Management", () => {
    it("should update authentication state on login", () => {
      const initialState = {
        user: {
          isAuthenticated: false,
          token: null,
          profile: null,
          loading: false,
          error: null,
        },
      };

      const { getByText, getByPlaceholderText } = renderWithProviders(
        <IndexScreen />,
        {
          preloadedState: initialState,
        }
      );

      // Simulate login action
      store.dispatch(setToken("test-token"));
      store.dispatch(setAuthenticated(true));

      // Verify state changes
      const state = store.getState();
      expect(state.user.isAuthenticated).toBe(true);
      expect(state.user.token).toBe("test-token");
      expect(state.user.profile).toBeTruthy();
    });

    it("should clear authentication state on logout", () => {
      const initialState = {
        user: {
          isAuthenticated: true,
          token: "test-token",
          profile: createMockUser(),
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      // Simulate logout action
      store.dispatch(setToken(null));
      store.dispatch(setAuthenticated(false));

      // Verify state changes
      const state = store.getState();
      expect(state.user.isAuthenticated).toBe(false);
      expect(state.user.token).toBe(null);
      expect(state.user.profile).toBe(null);
    });
  });

  describe("Events State Management", () => {
    it("should add events to state", () => {
      const initialState = {
        events: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      const mockEvent = createMockEvent();
      store.dispatch(addEvent(mockEvent));

      const state = store.getState();
      expect(state.events.items).toHaveLength(1);
      expect(state.events.items[0]).toEqual(mockEvent);
    });

    it("should handle multiple events", () => {
      const initialState = {
        events: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      const mockEvent1 = createMockEvent({ id: "1", title: "Event 1" });
      const mockEvent2 = createMockEvent({ id: "2", title: "Event 2" });

      store.dispatch(addEvent(mockEvent1));
      store.dispatch(addEvent(mockEvent2));

      const state = store.getState();
      expect(state.events.items).toHaveLength(2);
      expect(state.events.items[0].title).toBe("Event 1");
      expect(state.events.items[1].title).toBe("Event 2");
    });
  });

  describe("Groups State Management", () => {
    it("should add groups to state", () => {
      const initialState = {
        groups: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<GroupsScreen />, {
        preloadedState: initialState,
      });

      const mockGroup = createMockGroup();
      store.dispatch(addGroup(mockGroup));

      const state = store.getState();
      expect(state.groups.items).toHaveLength(1);
      expect(state.groups.items[0]).toEqual(mockGroup);
    });

    it("should handle group subscriptions", () => {
      const initialState = {
        subscriptions: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<GroupsScreen />, {
        preloadedState: initialState,
      });

      const mockSubscription = { id: "1", groupCode: "harvard" };
      store.dispatch(subscribe(mockSubscription));

      const state = store.getState();
      expect(state.subscriptions.items).toHaveLength(1);
      expect(state.subscriptions.items[0]).toEqual(mockSubscription);
    });
  });

  describe("Notifications State Management", () => {
    it("should add notifications to state", () => {
      const initialState = {
        notifications: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      const mockNotification = {
        id: "1",
        type: "event" as const,
        title: "Test Notification",
        message: "Test message",
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      store.dispatch(addNotification(mockNotification));

      const state = store.getState();
      expect(state.notifications.items).toHaveLength(1);
      expect(state.notifications.items[0]).toEqual(mockNotification);
    });
  });

  describe("Enrollments State Management", () => {
    it("should add enrollments to state", () => {
      const initialState = {
        enrollments: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      const mockEnrollment = {
        id: "1",
        eventId: "event-1",
        eventTitle: "Test Event",
        userId: "user-1",
        enrolledAt: new Date().toISOString(),
        status: "ENROLLED" as const,
      };

      store.dispatch(enroll(mockEnrollment));

      const state = store.getState();
      expect(state.enrollments.items).toHaveLength(1);
      expect(state.enrollments.items[0]).toEqual(mockEnrollment);
    });
  });

  describe("State Selectors Integration", () => {
    it("should select user profile correctly", () => {
      const mockUser = createMockUser();
      const initialState = {
        user: {
          isAuthenticated: true,
          token: "test-token",
          profile: mockUser,
          loading: false,
          error: null,
        },
      };

      const { getByText } = renderWithProviders(<ProfileScreen />, {
        preloadedState: initialState,
      });

      expect(getByText(mockUser.name)).toBeTruthy();
      expect(getByText(mockUser.email)).toBeTruthy();
    });

    it("should select events correctly", () => {
      const mockEvents = [
        createMockEvent({ id: "1", title: "Event 1" }),
        createMockEvent({ id: "2", title: "Event 2" }),
      ];

      const initialState = {
        events: {
          items: mockEvents,
          loading: false,
          error: null,
        },
      };

      const { getByText } = renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      expect(getByText("Event 1")).toBeTruthy();
      expect(getByText("Event 2")).toBeTruthy();
    });

    it("should select groups correctly", () => {
      const mockGroups = [
        createMockGroup({ code: "harvard", university: "Harvard University" }),
        createMockGroup({
          code: "stanford",
          university: "Stanford University",
        }),
      ];

      const initialState = {
        groups: {
          items: mockGroups,
          loading: false,
          error: null,
        },
      };

      const { getByText } = renderWithProviders(<GroupsScreen />, {
        preloadedState: initialState,
      });

      expect(getByText("Harvard University")).toBeTruthy();
      expect(getByText("Stanford University")).toBeTruthy();
    });
  });

  describe("Loading States Integration", () => {
    it("should handle loading states across components", () => {
      const initialState = {
        events: {
          items: [],
          loading: true,
          error: null,
        },
        groups: {
          items: [],
          loading: true,
          error: null,
        },
      };

      const { getByText } = renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      // Should show loading state
      expect(getByText("Loading...")).toBeTruthy();
    });

    it("should handle error states across components", () => {
      const initialState = {
        events: {
          items: [],
          loading: false,
          error: "Failed to load events",
        },
      };

      const { getByText } = renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      // Should show error state
      expect(getByText("Failed to load events")).toBeTruthy();
      expect(getByText("Retry")).toBeTruthy();
    });
  });

  describe("State Persistence", () => {
    it("should maintain state across component re-renders", () => {
      const mockUser = createMockUser();
      const initialState = {
        user: {
          isAuthenticated: true,
          token: "test-token",
          profile: mockUser,
          loading: false,
          error: null,
        },
      };

      // Render component
      const { getByText, rerender } = renderWithProviders(<ProfileScreen />, {
        preloadedState: initialState,
      });

      expect(getByText(mockUser.name)).toBeTruthy();

      // Re-render component
      rerender(<ProfileScreen />);

      // State should be maintained
      expect(getByText(mockUser.name)).toBeTruthy();
    });

    it("should handle state updates from multiple sources", () => {
      const initialState = {
        events: {
          items: [],
          loading: false,
          error: null,
        },
        notifications: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      // Add event
      const mockEvent = createMockEvent();
      store.dispatch(addEvent(mockEvent));

      // Add notification
      const mockNotification = {
        id: "1",
        type: "event" as const,
        title: "New Event",
        message: "A new event has been added",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      store.dispatch(addNotification(mockNotification));

      const state = store.getState();
      expect(state.events.items).toHaveLength(1);
      expect(state.notifications.items).toHaveLength(1);
    });
  });

  describe("Complex State Interactions", () => {
    it("should handle user enrollment affecting multiple slices", () => {
      const initialState = {
        events: {
          items: [createMockEvent({ id: "1", title: "Test Event" })],
          loading: false,
          error: null,
        },
        enrollments: {
          items: [],
          loading: false,
          error: null,
        },
        notifications: {
          items: [],
          loading: false,
          error: null,
        },
      };

      renderWithProviders(<IndexScreen />, {
        preloadedState: initialState,
      });

      // Simulate enrollment
      const mockEnrollment = {
        id: "1",
        eventId: "1",
        eventTitle: "Test Event",
        userId: "user-1",
        enrolledAt: new Date().toISOString(),
        status: "ENROLLED" as const,
      };
      store.dispatch(enroll(mockEnrollment));

      // Simulate notification for enrollment
      const mockNotification = {
        id: "1",
        type: "event" as const,
        title: "Enrollment Confirmed",
        message: "You have been enrolled in Test Event",
        eventId: "1",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      store.dispatch(addNotification(mockNotification));

      const state = store.getState();
      expect(state.enrollments.items).toHaveLength(1);
      expect(state.notifications.items).toHaveLength(1);
    });
  });
});
