import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { renderWithProviders } from "../utils/test-utils";
import AuthScreen from "../../app/auth";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({ msg: undefined }),
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
    setToken: jest.fn(),
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

describe("AuthScreen", () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockUseRouter = require("expo-router").useRouter as jest.Mock;
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it("should render login form", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    expect(getByText("Welcome to GradLink")).toBeTruthy();
    expect(getByText("Sign in to continue")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Sign In")).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText("Sign up")).toBeTruthy();
  });

  it("should render graduation cap icon", () => {
    const { getByTestId } = renderWithProviders(<AuthScreen />);

    expect(getByTestId("icon-graduation-cap")).toBeTruthy();
  });

  it("should show success message when provided in params", () => {
    jest.mocked(require("expo-router").useLocalSearchParams).mockReturnValue({
      msg: "Registration successful! Please sign in.",
    });

    const { getByText } = renderWithProviders(<AuthScreen />);

    expect(getByText("Registration successful! Please sign in.")).toBeTruthy();
  });

  it("should handle email input", () => {
    const { getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    const emailInput = getByPlaceholderText("Email");
    fireEvent.changeText(emailInput, "test@example.com");

    expect(emailInput.props.value).toBe("test@example.com");
  });

  it("should handle password input", () => {
    const { getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    const passwordInput = getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "password123");

    expect(passwordInput.props.value).toBe("password123");
  });

  it("should show error for empty fields", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    expect(getByText("Please enter both email and password.")).toBeTruthy();
  });

  it("should show error for empty email", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const passwordInput = getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    expect(getByText("Please enter both email and password.")).toBeTruthy();
  });

  it("should show error for empty password", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    fireEvent.changeText(emailInput, "test@example.com");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    expect(getByText("Please enter both email and password.")).toBeTruthy();
  });

  it("should handle successful login", async () => {
    const mockLoginResponse = {
      token: "test-token",
      user: { id: "1", name: "Test User", email: "test@example.com" },
    };

    jest
      .mocked(require("../../app/services/ApiService").apiService.login)
      .mockResolvedValue(mockLoginResponse);

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        require("../../app/services/ApiService").apiService.login
      ).toHaveBeenCalledWith("test@example.com", "password123");
      expect(
        require("../../app/services/ApiService").apiService.setToken
      ).toHaveBeenCalledWith("test-token");
      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("should handle login error - no token received", async () => {
    const mockLoginResponse = {
      user: { id: "1", name: "Test User", email: "test@example.com" },
    };

    jest
      .mocked(require("../../app/services/ApiService").apiService.login)
      .mockResolvedValue(mockLoginResponse);

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText("No token received. Please try again.")).toBeTruthy();
    });
  });

  it("should handle login API error", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.login)
      .mockRejectedValue(new Error("Invalid credentials"));

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "wrongpassword");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText("Invalid credentials")).toBeTruthy();
    });
  });

  it("should handle network error", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.login)
      .mockRejectedValue(new Error("Network error"));

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });
  });

  it("should handle error without message", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.login)
      .mockRejectedValue(new Error());

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Could not connect to server. Please try again later.")
      ).toBeTruthy();
    });
  });

  it("should clear error when user starts typing", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    // Trigger error first
    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    expect(getByText("Please enter both email and password.")).toBeTruthy();

    // Start typing in email field
    const emailInput = getByPlaceholderText("Email");
    fireEvent.changeText(emailInput, "test@example.com");

    // Error should be cleared
    expect(() => getByText("Please enter both email and password.")).toThrow();
  });

  it("should handle whitespace-only inputs", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AuthScreen />
    );

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "   ");
    fireEvent.changeText(passwordInput, "   ");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    expect(getByText("Please enter both email and password.")).toBeTruthy();
  });

  it("should have correct input properties", () => {
    const { getByPlaceholderText } = renderWithProviders(<AuthScreen />);

    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    expect(emailInput.props.keyboardType).toBe("email-address");
    expect(emailInput.props.autoCapitalize).toBe("none");
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("should have correct button properties", () => {
    const { getByText } = renderWithProviders(<AuthScreen />);

    const signInButton = getByText("Sign In");
    expect(signInButton.props.activeOpacity).toBe(0.85);
  });
});
