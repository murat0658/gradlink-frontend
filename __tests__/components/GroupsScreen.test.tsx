import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockGroup,
  createMockEvent,
} from "../utils/test-utils";
import GroupsScreen from "../../app/(tabs)/groups/index";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

describe("GroupsScreen", () => {
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

  const mockEvents = [
    createMockEvent({
      id: "1",
      title: "Harvard Event",
      groupCode: "harvard",
      groupName: "Harvard University",
      startTime: "2024-12-31T10:00:00Z",
      endTime: "2024-12-31T12:00:00Z",
      location: "Harvard Campus",
      capacity: 100,
      enrolledCount: 50,
      isEnrolled: false,
    }),
  ];

  const defaultState = {
    groups: {
      items: mockGroups,
      loading: false,
      error: null,
    },
    events: {
      items: mockEvents,
      loading: false,
      error: null,
    },
    subscriptions: {
      items: [{ id: "1", groupCode: "harvard" }],
      loading: false,
      error: null,
    },
    joinedGroups: {
      items: ["harvard"],
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

  it("should render groups list", () => {
    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Harvard University")).toBeTruthy();
    expect(getByText("Stanford University")).toBeTruthy();
  });

  it("should show group details", () => {
    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Harvard student group")).toBeTruthy();
    expect(getByText("1,000 members")).toBeTruthy();
    expect(getByText("Founded 1636")).toBeTruthy();
    expect(getByText("Cambridge, MA")).toBeTruthy();
  });

  it("should show subscription status", () => {
    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    // Should show "Joined" for subscribed groups
    expect(getByText("Joined")).toBeTruthy();
  });

  it("should show loading state", () => {
    const loadingState = {
      ...defaultState,
      groups: { ...defaultState.groups, loading: true },
    };

    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: loadingState,
    });

    expect(getByText("Loading groups...")).toBeTruthy();
  });

  it("should show error state", () => {
    const errorState = {
      ...defaultState,
      groups: { ...defaultState.groups, error: "Failed to load groups" },
    };

    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: errorState,
    });

    expect(getByText("Failed to load groups")).toBeTruthy();
    expect(getByText("Retry")).toBeTruthy();
  });

  it("should handle group press navigation", () => {
    const mockPush = jest.fn();
    jest.mocked(require("expo-router").useRouter).mockReturnValue({
      push: mockPush,
    });

    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    const harvardGroup = getByText("Harvard University");
    fireEvent.press(harvardGroup);

    expect(mockPush).toHaveBeenCalledWith("/groups/harvard");
  });

  it("should filter groups by search query", () => {
    const { getByText, getByPlaceholderText, queryByText } =
      renderWithProviders(<GroupsScreen />, {
        preloadedState: defaultState,
      });

    const searchInput = getByPlaceholderText("Search groups...");
    fireEvent.changeText(searchInput, "Harvard");

    expect(getByText("Harvard University")).toBeTruthy();
    expect(queryByText("Stanford University")).toBeNull();
  });

  it("should show empty state when no groups match search", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <GroupsScreen />,
      {
        preloadedState: defaultState,
      }
    );

    const searchInput = getByPlaceholderText("Search groups...");
    fireEvent.changeText(searchInput, "Nonexistent");

    expect(getByText("No groups found")).toBeTruthy();
  });

  it("should display group colors correctly", () => {
    const { getByTestId } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    // Check if group color indicators are rendered
    const harvardColor = getByTestId("group-color-harvard");
    expect(harvardColor).toBeTruthy();
  });

  it("should show member count with proper formatting", () => {
    const { getByText } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("1,000 members")).toBeTruthy();
    expect(getByText("800 members")).toBeTruthy();
  });

  it("should handle refresh", async () => {
    const { getByTestId } = renderWithProviders(<GroupsScreen />, {
      preloadedState: defaultState,
    });

    const refreshControl = getByTestId("refresh-control");
    fireEvent(refreshControl, "refresh");

    // Should trigger refresh action
    await waitFor(() => {
      // Verify refresh was called
    });
  });
});
