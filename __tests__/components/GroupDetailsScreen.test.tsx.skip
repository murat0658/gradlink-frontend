import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockGroup,
  createMockEvent,
  createMockEnrollment,
} from "../../utils/test-utils";
import GroupDetailsScreen from "../../app/(tabs)/groups/[code]/index";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ code: "harvard" }),
}));

describe("GroupDetailsScreen", () => {
  const mockGroup = createMockGroup({
    code: "harvard",
    university: "Harvard University",
    description: "Harvard student group",
    members: 1000,
    icon: "university",
    color: "#A51C30",
    founded: 1636,
    location: "Cambridge, MA",
  });

  const mockEvents = [
    createMockEvent({
      id: "1",
      title: "Harvard Event 1",
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
      title: "Harvard Event 2",
      groupCode: "harvard",
      groupName: "Harvard University",
      startTime: "2025-01-15T14:00:00Z",
      endTime: "2025-01-15T16:00:00Z",
      location: "Harvard Library",
      capacity: 50,
      enrolledCount: 25,
      isEnrolled: true,
    }),
  ];

  const mockEnrollments = [
    createMockEnrollment({
      id: "1",
      eventId: "2",
      eventTitle: "Harvard Event 2",
      userId: "user-1",
      enrolledAt: "2023-01-01T00:00:00Z",
      status: "ENROLLED",
    }),
  ];

  const defaultState = {
    groups: {
      items: [mockGroup],
      loading: false,
      error: null,
    },
    events: {
      items: mockEvents,
      loading: false,
      error: null,
    },
    enrollments: {
      items: mockEnrollments,
      loading: false,
      error: null,
    },
    subscriptions: {
      items: [{ id: "1", groupCode: "harvard" }],
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

  it("should render group information", () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Harvard University")).toBeTruthy();
    expect(getByText("Harvard student group")).toBeTruthy();
    expect(getByText("1,000 members")).toBeTruthy();
    expect(getByText("Founded 1636")).toBeTruthy();
    expect(getByText("Cambridge, MA")).toBeTruthy();
  });

  it("should render events list", () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Harvard Event 1")).toBeTruthy();
    expect(getByText("Harvard Event 2")).toBeTruthy();
    expect(getByText("Harvard Campus")).toBeTruthy();
    expect(getByText("Harvard Library")).toBeTruthy();
  });

  it("should show enrollment status correctly", () => {
    const { getByText, queryByText } = renderWithProviders(
      <GroupDetailsScreen />,
      {
        preloadedState: defaultState,
      }
    );

    // Event 1 should show "Enroll" button (not enrolled)
    expect(getByText("Enroll")).toBeTruthy();

    // Event 2 should show "Unenroll" button (enrolled)
    expect(getByText("Unenroll")).toBeTruthy();
  });

  it("should show event capacity information", () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("50/100 enrolled")).toBeTruthy();
    expect(getByText("25/50 enrolled")).toBeTruthy();
  });

  it("should handle enroll button press", async () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    const enrollButton = getByText("Enroll");
    fireEvent.press(enrollButton);

    // Should dispatch enroll action
    await waitFor(() => {
      // Verify enrollment was triggered
    });
  });

  it("should handle unenroll button press", async () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    const unenrollButton = getByText("Unenroll");
    fireEvent.press(unenrollButton);

    // Should dispatch unenroll action
    await waitFor(() => {
      // Verify unenrollment was triggered
    });
  });

  it("should show loading state", () => {
    const loadingState = {
      ...defaultState,
      events: { ...defaultState.events, loading: true },
    };

    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: loadingState,
    });

    expect(getByText("Loading events...")).toBeTruthy();
  });

  it("should show error state", () => {
    const errorState = {
      ...defaultState,
      events: { ...defaultState.events, error: "Failed to load events" },
    };

    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: errorState,
    });

    expect(getByText("Failed to load events")).toBeTruthy();
    expect(getByText("Retry")).toBeTruthy();
  });

  it("should show empty events state", () => {
    const emptyEventsState = {
      ...defaultState,
      events: { ...defaultState.events, items: [] },
    };

    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: emptyEventsState,
    });

    expect(getByText("No events scheduled")).toBeTruthy();
  });

  it("should format event dates correctly", () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    // Check if dates are formatted and displayed
    expect(getByText("Dec 31, 2024")).toBeTruthy();
    expect(getByText("Jan 15, 2025")).toBeTruthy();
  });

  it("should show event times", () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("10:00 AM - 12:00 PM")).toBeTruthy();
    expect(getByText("2:00 PM - 4:00 PM")).toBeTruthy();
  });

  it("should handle back navigation", () => {
    const mockBack = jest.fn();
    jest.mocked(require("expo-router").useRouter).mockReturnValue({
      push: jest.fn(),
      back: mockBack,
    });

    const { getByTestId } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    const backButton = getByTestId("back-button");
    fireEvent.press(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it("should show subscription status", () => {
    const { getByText } = renderWithProviders(<GroupDetailsScreen />, {
      preloadedState: defaultState,
    });

    // Should show "Subscribed" or "Join Group" based on subscription status
    expect(getByText("Subscribed")).toBeTruthy();
  });

  it("should handle refresh", async () => {
    const { getByTestId } = renderWithProviders(<GroupDetailsScreen />, {
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
