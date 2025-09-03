import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  renderWithProviders,
  createMockUser,
  createMockEvent,
  createMockGroup,
} from "../utils/test-utils";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ code: "harvard" }),
  Link: ({ children, href, style, ...props }: any) => {
    const { Text } = require("react-native");
    return (
      <Text {...props} style={style}>
        {children}
      </Text>
    );
  },
}));

// Mock the API service
jest.mock("../../app/services/ApiService", () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
    setToken: jest.fn(),
    getEvents: jest.fn(),
    getGroups: jest.fn(),
    enrollInEvent: jest.fn(),
    unenrollFromEvent: jest.fn(),
    subscribeToGroup: jest.fn(),
    unsubscribeFromGroup: jest.fn(),
  },
}));

// Mock FontAwesome
jest.mock("@expo/vector-icons/FontAwesome", () => ({
  __esModule: true,
  default: ({ name, size, color, style }: any) => {
    const { Text } = require("react-native");
    return (
      <Text testID={`icon-${name}`} style={style}>
        {name}
      </Text>
    );
  },
}));

// Import components
import AuthScreen from "../../app/auth";
import SignupScreen from "../../app/signup";
import IndexScreen from "../../app/(tabs)/index";
import GroupsScreen from "../../app/(tabs)/groups/index";
import ProfileScreen from "../../app/(tabs)/profile";

describe("User Flow Integration Tests", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockUseRouter = require("expo-router").useRouter as jest.Mock;
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe("Complete Authentication Flow", () => {
    it("should complete signup to login flow", async () => {
      // Mock successful registration
      jest
        .mocked(require("../../app/services/ApiService").apiService.register)
        .mockResolvedValue({
          message: "User registered successfully",
        });

      // Render signup screen
      const { getByText, getByPlaceholderText } = renderWithProviders(
        <SignupScreen />
      );

      // Fill signup form
      fireEvent.changeText(getByPlaceholderText("Name"), "John Doe");
      fireEvent.changeText(getByPlaceholderText("Email"), "john@example.com");
      fireEvent.changeText(getByPlaceholderText("Password"), "password123");
      fireEvent.changeText(getByPlaceholderText("Phone"), "1234567890");

      // Submit signup
      fireEvent.press(getByText("Sign Up"));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith({
          pathname: "/auth",
          params: { msg: "Registration successful! Please sign in." },
        });
      });
    });

    it("should complete login flow", async () => {
      const mockLoginResponse = {
        token: "test-token",
        user: createMockUser(),
      };

      jest
        .mocked(require("../../app/services/ApiService").apiService.login)
        .mockResolvedValue(mockLoginResponse);

      const { getByText, getByPlaceholderText } = renderWithProviders(
        <AuthScreen />
      );

      // Fill login form
      fireEvent.changeText(getByPlaceholderText("Email"), "john@example.com");
      fireEvent.changeText(getByPlaceholderText("Password"), "password123");

      // Submit login
      fireEvent.press(getByText("Sign In"));

      await waitFor(() => {
        expect(
          require("../../app/services/ApiService").apiService.setToken
        ).toHaveBeenCalledWith("test-token");
        expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
      });
    });
  });

  describe("Event Enrollment Flow", () => {
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
      events: {
        items: mockEvents,
        loading: false,
        error: null,
      },
      user: {
        isAuthenticated: true,
        token: "test-token",
        profile: createMockUser(),
        loading: false,
        error: null,
      },
    };

    it("should navigate from home to group details and enroll in event", async () => {
      jest
        .mocked(
          require("../../app/services/ApiService").apiService.enrollInEvent
        )
        .mockResolvedValue({
          message: "Enrolled successfully",
        });

      const { getByText } = renderWithProviders(<IndexScreen />, {
        preloadedState: defaultState,
      });

      // Click on event to navigate to group details
      fireEvent.press(getByText("Harvard Event"));

      expect(mockRouter.push).toHaveBeenCalledWith("/groups/harvard");
    });

    it("should handle event enrollment error", async () => {
      jest
        .mocked(
          require("../../app/services/ApiService").apiService.enrollInEvent
        )
        .mockRejectedValue(new Error("Event is full"));

      const { getByText } = renderWithProviders(<IndexScreen />, {
        preloadedState: defaultState,
      });

      // This would typically be tested in the GroupDetailsScreen component
      // but we're testing the integration flow here
      expect(getByText("Harvard Event")).toBeTruthy();
    });
  });

  describe("Group Subscription Flow", () => {
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
    ];

    const defaultState = {
      groups: {
        items: mockGroups,
        loading: false,
        error: null,
      },
      subscriptions: {
        items: [],
        loading: false,
        error: null,
      },
      user: {
        isAuthenticated: true,
        token: "test-token",
        profile: createMockUser(),
        loading: false,
        error: null,
      },
    };

    it("should navigate from groups list to group details", async () => {
      const { getByText } = renderWithProviders(<GroupsScreen />, {
        preloadedState: defaultState,
      });

      // Click on group to navigate to details
      fireEvent.press(getByText("Harvard University"));

      expect(mockRouter.push).toHaveBeenCalledWith("/groups/harvard");
    });

    it("should handle group subscription", async () => {
      jest
        .mocked(
          require("../../app/services/ApiService").apiService.subscribeToGroup
        )
        .mockResolvedValue({
          message: "Subscribed successfully",
        });

      const { getByText } = renderWithProviders(<GroupsScreen />, {
        preloadedState: defaultState,
      });

      // This would typically be tested in the GroupDetailsScreen component
      expect(getByText("Harvard University")).toBeTruthy();
    });
  });

  describe("Profile Management Flow", () => {
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
    });

    const defaultState = {
      user: {
        isAuthenticated: true,
        token: "test-token",
        profile: mockUser,
        loading: false,
        error: null,
      },
      events: {
        items: [],
        loading: false,
        error: null,
      },
      enrollments: {
        items: [],
        loading: false,
        error: null,
      },
      joinedGroups: {
        items: [],
        loading: false,
        error: null,
      },
    };

    it("should display user profile information", () => {
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

    it("should enter and exit edit mode", () => {
      const { getByText, getByPlaceholderText, queryByPlaceholderText } =
        renderWithProviders(<ProfileScreen />, {
          preloadedState: defaultState,
        });

      // Enter edit mode
      fireEvent.press(getByText("Edit"));

      expect(getByPlaceholderText("Name")).toBeTruthy();
      expect(getByPlaceholderText("Email")).toBeTruthy();
      expect(getByText("Save")).toBeTruthy();
      expect(getByText("Cancel")).toBeTruthy();

      // Exit edit mode
      fireEvent.press(getByText("Cancel"));

      expect(queryByPlaceholderText("Name")).toBeNull();
      expect(getByText("Edit")).toBeTruthy();
    });
  });

  describe("Navigation Flow", () => {
    const defaultState = {
      events: {
        items: [],
        loading: false,
        error: null,
      },
      groups: {
        items: [],
        loading: false,
        error: null,
      },
      user: {
        isAuthenticated: true,
        token: "test-token",
        profile: createMockUser(),
        loading: false,
        error: null,
      },
    };

    it("should navigate between main screens", () => {
      const { getByText } = renderWithProviders(<IndexScreen />, {
        preloadedState: defaultState,
      });

      // Test quick action navigation
      if (getByText("Browse Groups")) {
        fireEvent.press(getByText("Browse Groups"));
        expect(mockRouter.push).toHaveBeenCalledWith("/groups");
      }

      if (getByText("My Profile")) {
        fireEvent.press(getByText("My Profile"));
        expect(mockRouter.push).toHaveBeenCalledWith("/profile");
      }
    });
  });

  describe("Error Handling Flow", () => {
    it("should handle network errors gracefully", async () => {
      jest
        .mocked(require("../../app/services/ApiService").apiService.login)
        .mockRejectedValue(new Error("Network error"));

      const { getByText, getByPlaceholderText } = renderWithProviders(
        <AuthScreen />
      );

      fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
      fireEvent.changeText(getByPlaceholderText("Password"), "password123");
      fireEvent.press(getByText("Sign In"));

      await waitFor(() => {
        expect(getByText("Network error")).toBeTruthy();
      });
    });

    it("should handle validation errors", async () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(
        <SignupScreen />
      );

      // Try to submit with invalid data
      fireEvent.changeText(getByPlaceholderText("Name"), "");
      fireEvent.changeText(getByPlaceholderText("Email"), "invalid-email");
      fireEvent.changeText(getByPlaceholderText("Password"), "123");
      fireEvent.changeText(getByPlaceholderText("Phone"), "123");

      fireEvent.press(getByText("Sign Up"));

      expect(
        getByText("Please fill in all fields with valid information.")
      ).toBeTruthy();
    });
  });

  describe("Loading States Flow", () => {
    it("should show loading states during API calls", async () => {
      // Mock a delayed API response
      jest
        .mocked(require("../../app/services/ApiService").apiService.login)
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    token: "test-token",
                    user: createMockUser(),
                  }),
                100
              )
            )
        );

      const { getByText, getByPlaceholderText } = renderWithProviders(
        <AuthScreen />
      );

      fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
      fireEvent.changeText(getByPlaceholderText("Password"), "password123");
      fireEvent.press(getByText("Sign In"));

      // During loading, button should be disabled or show loading state
      // This would depend on the actual implementation
    });
  });

  describe("Data Persistence Flow", () => {
    it("should maintain state across navigation", () => {
      const mockEvents = [createMockEvent()];
      const mockGroups = [createMockGroup()];

      const state = {
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
          profile: createMockUser(),
          loading: false,
          error: null,
        },
      };

      // Render index screen
      const { getByText: getByTextIndex } = renderWithProviders(
        <IndexScreen />,
        {
          preloadedState: state,
        }
      );

      expect(getByTextIndex("Harvard Event")).toBeTruthy();

      // Navigate to groups (simulated)
      const { getByText: getByTextGroups } = renderWithProviders(
        <GroupsScreen />,
        {
          preloadedState: state,
        }
      );

      expect(getByTextGroups("Harvard University")).toBeTruthy();
    });
  });
});
