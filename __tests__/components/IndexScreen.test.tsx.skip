import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockEvent,
  createMockGroup,
} from "../../utils/test-utils";
import IndexScreen from "../../app/(tabs)/index";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("IndexScreen", () => {
  const mockEvents = [
    createMockEvent({
      id: "1",
      title: "Upcoming Event 1",
      groupCode: "harvard",
      groupName: "Harvard University",
      startTime: "2024-12-31T10:00:00Z",
      endTime: "2024-12-31T12:00:00Z",
      location: "Harvard Campus",
      capacity: 100,
      enrolledCount: 50,
      isEnrolled: false,
    }),
    createMockEvent({
      id: "2",
      title: "Upcoming Event 2",
      groupCode: "stanford",
      groupName: "Stanford University",
      startTime: "2025-01-15T14:00:00Z",
      endTime: "2025-01-15T16:00:00Z",
      location: "Stanford Campus",
      capacity: 50,
      enrolledCount: 25,
      isEnrolled: true,
    }),
  ];

  const mockGroups = [
    createMockGroup({
      code: "harvard",
      university: "Harvard University",
      description: "Harvard student group",
      members: 1000,
      icon: "university",
      color: "#A51C30",
      founded: 1636,
      location: "Cambridge, MA",
    }),
    createMockGroup({
      code: "stanford",
      university: "Stanford University",
      description: "Stanford student group",
      members: 800,
      icon: "university",
      color: "#8C1515",
      founded: 1885,
      location: "Stanford, CA",
    }),
  ];

  const defaultState = {
    events: {
      items: mockEvents,
      loading: false,
      error: null,
    },
    groups: {
      items: mockGroups,
      loading: false,
      error: null,
    },
    user: {
      isAuthenticated: true,
      token: "test-token",
      profile: null,
      loading: false,
      error: null,
    },
  };

  it("should render welcome message", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Welcome to GradLink")).toBeTruthy();
  });

  it("should render upcoming events section", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Upcoming Events")).toBeTruthy();
    expect(getByText("Upcoming Event 1")).toBeTruthy();
    expect(getByText("Upcoming Event 2")).toBeTruthy();
  });

  it("should render featured groups section", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Featured Groups")).toBeTruthy();
    expect(getByText("Harvard University")).toBeTruthy();
    expect(getByText("Stanford University")).toBeTruthy();
  });

  it("should show event details", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Harvard Campus")).toBeTruthy();
    expect(getByText("Stanford Campus")).toBeTruthy();
    expect(getByText("50/100 enrolled")).toBeTruthy();
    expect(getByText("25/50 enrolled")).toBeTruthy();
  });

  it("should show group details", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Harvard student group")).toBeTruthy();
    expect(getByText("Stanford student group")).toBeTruthy();
    expect(getByText("1,000 members")).toBeTruthy();
    expect(getByText("800 members")).toBeTruthy();
  });

  it("should handle event press navigation", () => {
    const mockPush = jest.fn();
    jest.mocked(require("expo-router").useRouter).mockReturnValue({
      push: mockPush,
    });

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    const event = getByText("Upcoming Event 1");
    fireEvent.press(event);

    expect(mockPush).toHaveBeenCalledWith("/groups/harvard");
  });

  it("should handle group press navigation", () => {
    const mockPush = jest.fn();
    jest.mocked(require("expo-router").useRouter).mockReturnValue({
      push: mockPush,
    });

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    const group = getByText("Harvard University");
    fireEvent.press(group);

    expect(mockPush).toHaveBeenCalledWith("/groups/harvard");
  });

  it("should show loading state", () => {
    const loadingState = {
      ...defaultState,
      events: { ...defaultState.events, loading: true },
    };

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: loadingState,
    });

    expect(getByText("Loading...")).toBeTruthy();
  });

  it("should show error state", () => {
    const errorState = {
      ...defaultState,
      events: { ...defaultState.events, error: "Failed to load events" },
    };

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: errorState,
    });

    expect(getByText("Failed to load events")).toBeTruthy();
    expect(getByText("Retry")).toBeTruthy();
  });

  it("should show empty state when no events", () => {
    const emptyEventsState = {
      ...defaultState,
      events: { ...defaultState.events, items: [] },
    };

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: emptyEventsState,
    });

    expect(getByText("No upcoming events")).toBeTruthy();
  });

  it("should show empty state when no groups", () => {
    const emptyGroupsState = {
      ...defaultState,
      groups: { ...defaultState.groups, items: [] },
    };

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: emptyGroupsState,
    });

    expect(getByText("No groups available")).toBeTruthy();
  });

  it("should format event dates correctly", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Dec 31, 2024")).toBeTruthy();
    expect(getByText("Jan 15, 2025")).toBeTruthy();
  });

  it("should show event times", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("10:00 AM - 12:00 PM")).toBeTruthy();
    expect(getByText("2:00 PM - 4:00 PM")).toBeTruthy();
  });

  it("should handle refresh", async () => {
    const { getByTestId } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    const refreshControl = getByTestId("refresh-control");
    fireEvent(refreshControl, "refresh");

    // Should trigger refresh action
  });

  it("should show quick actions", () => {
    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Browse Groups")).toBeTruthy();
    expect(getByText("View Events")).toBeTruthy();
    expect(getByText("My Profile")).toBeTruthy();
  });

  it("should handle quick action navigation", () => {
    const mockPush = jest.fn();
    jest.mocked(require("expo-router").useRouter).mockReturnValue({
      push: mockPush,
    });

    const { getByText } = renderWithProviders(<IndexScreen />, {
      preloadedState: defaultState,
    });

    const browseGroupsButton = getByText("Browse Groups");
    fireEvent.press(browseGroupsButton);

    expect(mockPush).toHaveBeenCalledWith("/groups");
  });
});
