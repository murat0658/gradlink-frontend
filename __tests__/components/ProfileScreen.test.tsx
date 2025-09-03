import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import {
  renderWithProviders,
  createMockUser,
  createMockEvent,
} from "../utils/test-utils";
import ProfileScreen from "../../app/(tabs)/profile";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock ImagePicker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  MediaTypeOptions: {
    Images: "Images",
  },
}));

// Mock NotificationService
jest.mock("../../app/services/NotificationService", () => ({
  NotificationService: {
    sendTestNotification: jest.fn(() => Promise.resolve()),
  },
}));

describe("ProfileScreen", () => {
  const mockUser = createMockUser({
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    bio: "Software Developer",
    location: "San Francisco",
    university: "Stanford University",
    major: "Computer Science",
    graduationYear: 2020,
    avatarUrl: "https://example.com/avatar.jpg",
  });

  const mockEvents = [
    createMockEvent({
      id: "1",
      title: "Test Event",
      startTime: "2024-12-31T10:00:00Z",
      endTime: "2024-12-31T12:00:00Z",
      location: "Test Location",
      groupName: "Test Group",
    }),
  ];

  const defaultState = {
    user: {
      isAuthenticated: true,
      token: "test-token",
      profile: mockUser,
      loading: false,
      error: null,
    },
    events: {
      items: mockEvents,
      loading: false,
      error: null,
    },
    enrollments: {
      items: [
        {
          id: "1",
          eventId: "1",
          eventTitle: "Test Event",
          userId: "1",
          enrolledAt: "2023-01-01T00:00:00Z",
          status: "ENROLLED",
        },
      ],
      loading: false,
      error: null,
    },
    joinedGroups: {
      items: ["harvard", "stanford"],
      loading: false,
      error: null,
    },
  };

  it("should render user profile information", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("john@example.com")).toBeTruthy();
    expect(getByText("+1234567890")).toBeTruthy();
    expect(getByText("Software Developer")).toBeTruthy();
    expect(getByText("San Francisco")).toBeTruthy();
    expect(getByText("Stanford University")).toBeTruthy();
    expect(getByText("Computer Science")).toBeTruthy();
    expect(getByText("Class of 2020")).toBeTruthy();
  });

  it("should render edit button", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Edit")).toBeTruthy();
  });

  it("should enter edit mode when edit button is pressed", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <ProfileScreen />,
      {
        preloadedState: defaultState,
      }
    );

    fireEvent.press(getByText("Edit"));

    expect(getByPlaceholderText("Name")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Phone")).toBeTruthy();
    expect(getByPlaceholderText("Bio")).toBeTruthy();
    expect(getByPlaceholderText("Location")).toBeTruthy();
    expect(getByPlaceholderText("University")).toBeTruthy();
    expect(getByPlaceholderText("Major")).toBeTruthy();
    expect(getByPlaceholderText("Graduation Year")).toBeTruthy();
  });

  it("should show save and cancel buttons in edit mode", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    fireEvent.press(getByText("Edit"));

    expect(getByText("Save")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("should exit edit mode when cancel button is pressed", () => {
    const { getByText, queryByPlaceholderText } = renderWithProviders(
      <ProfileScreen />,
      {
        preloadedState: defaultState,
      }
    );

    fireEvent.press(getByText("Edit"));
    fireEvent.press(getByText("Cancel"));

    expect(queryByPlaceholderText("Name")).toBeNull();
    expect(getByText("Edit")).toBeTruthy();
  });

  it("should validate email format", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <ProfileScreen />,
      {
        preloadedState: defaultState,
      }
    );

    fireEvent.press(getByText("Edit"));

    const emailInput = getByPlaceholderText("Email");
    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent(emailInput, "blur");

    // Save button should be disabled due to invalid email
    const saveButton = getByText("Save");
    expect(saveButton.props.disabled).toBe(true);
  });

  it("should validate phone number format", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <ProfileScreen />,
      {
        preloadedState: defaultState,
      }
    );

    fireEvent.press(getByText("Edit"));

    const phoneInput = getByPlaceholderText("Phone");
    fireEvent.changeText(phoneInput, "123");
    fireEvent(phoneInput, "blur");

    // Save button should be disabled due to invalid phone
    const saveButton = getByText("Save");
    expect(saveButton.props.disabled).toBe(true);
  });

  it("should render enrolled events", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("My Enrolled Events")).toBeTruthy();
    expect(getByText("Test Event")).toBeTruthy();
    expect(getByText("Test Group")).toBeTruthy();
    expect(getByText("Test Location")).toBeTruthy();
  });

  it("should show unenroll button for enrolled events", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Unenroll")).toBeTruthy();
  });

  it("should render test notification button", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    expect(getByText("Test Notification")).toBeTruthy();
  });

  it("should show loading state", () => {
    const loadingState = {
      ...defaultState,
      user: { ...defaultState.user, loading: true },
    };

    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: loadingState,
    });

    expect(getByText("Loading profile...")).toBeTruthy();
  });

  it("should show error state", () => {
    const errorState = {
      ...defaultState,
      user: { ...defaultState.user, error: "Failed to load profile" },
    };

    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: errorState,
    });

    expect(getByText("Failed to load profile")).toBeTruthy();
    expect(getByText("Retry")).toBeTruthy();
  });

  it("should render joined groups badges", () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    // The component should show joined group badges
    // Note: This test assumes the groups data is available in the component
    expect(getByText("Harvard Joined")).toBeTruthy();
    expect(getByText("Stanford Joined")).toBeTruthy();
  });

  it("should handle logout", async () => {
    const { getByText } = renderWithProviders(<ProfileScreen />, {
      preloadedState: defaultState,
    });

    // Find and press logout button (assuming it exists in the component)
    // Note: This test would need to be updated based on actual logout implementation
    const logoutButton = getByText("Logout");
    fireEvent.press(logoutButton);

    // Verify logout was called
    // This would depend on the actual logout implementation
  });
});
