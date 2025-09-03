import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { renderWithProviders } from "../utils/test-utils";
import SignupScreen from "../../app/signup";

// Mock the router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
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
    register: jest.fn(),
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

describe("SignupScreen", () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockUseRouter = require("expo-router").useRouter as jest.Mock;
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it("should render signup form", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    expect(getByText("Create Account")).toBeTruthy();
    expect(getByText("Sign up to get started")).toBeTruthy();
    expect(getByPlaceholderText("Name")).toBeTruthy();
    expect(getByPlaceholderText("Phone")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
    expect(getByText("Already have an account?")).toBeTruthy();
    expect(getByText("Sign in")).toBeTruthy();
  });

  it("should render user-plus icon", () => {
    const { getByTestId } = renderWithProviders(<SignupScreen />);

    expect(getByTestId("icon-user-plus")).toBeTruthy();
  });

  it("should handle name input", () => {
    const { getByPlaceholderText } = renderWithProviders(<SignupScreen />);

    const nameInput = getByPlaceholderText("Name");
    fireEvent.changeText(nameInput, "John Doe");

    expect(nameInput.props.value).toBe("John Doe");
  });

  it("should handle email input", () => {
    const { getByPlaceholderText } = renderWithProviders(<SignupScreen />);

    const emailInput = getByPlaceholderText("Email");
    fireEvent.changeText(emailInput, "john@example.com");

    expect(emailInput.props.value).toBe("john@example.com");
  });

  it("should handle password input", () => {
    const { getByPlaceholderText } = renderWithProviders(<SignupScreen />);

    const passwordInput = getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "password123");

    expect(passwordInput.props.value).toBe("password123");
  });

  it("should handle phone input", () => {
    const { getByPlaceholderText } = renderWithProviders(<SignupScreen />);

    const phoneInput = getByPlaceholderText("Phone");
    fireEvent.changeText(phoneInput, "1234567890");

    expect(phoneInput.props.value).toBe("1234567890");
  });

  it("should show default country code", () => {
    const { getByText } = renderWithProviders(<SignupScreen />);

    expect(getByText("+1")).toBeTruthy();
  });

  it("should open country code modal", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    expect(getByPlaceholderText("Search country code")).toBeTruthy();
    expect(getByText("Close")).toBeTruthy();
  });

  it("should filter country codes by search", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Open modal
    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    // Search for UK
    const searchInput = getByPlaceholderText("Search country code");
    fireEvent.changeText(searchInput, "United Kingdom");

    expect(getByText("+44")).toBeTruthy();
    expect(getByText("United Kingdom")).toBeTruthy();
  });

  it("should select country code from modal", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Open modal
    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    // Select UK
    const ukOption = getByText("United Kingdom");
    fireEvent.press(ukOption);

    // Modal should close and country code should update
    expect(() => getByPlaceholderText("Search country code")).toThrow();
    expect(getByText("+44")).toBeTruthy();
  });

  it("should close modal when close button is pressed", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Open modal
    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    // Close modal
    const closeButton = getByText("Close");
    fireEvent.press(closeButton);

    expect(() => getByPlaceholderText("Search country code")).toThrow();
  });

  it("should show error for empty fields", async () => {
    const { getByText } = renderWithProviders(<SignupScreen />);

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    expect(
      getByText("Please fill in all fields with valid information.")
    ).toBeTruthy();
  });

  it("should show error for invalid phone number", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(phoneInput, "123"); // Too short

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    expect(
      getByText("Please fill in all fields with valid information.")
    ).toBeTruthy();
  });

  it("should handle successful signup", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.register)
      .mockResolvedValue({
        message: "User registered successfully",
      });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(phoneInput, "1234567890");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(
        require("../../app/services/ApiService").apiService.register
      ).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+11234567890", // +1 (default) + phone
      });
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname: "/auth",
        params: { msg: "Registration successful! Please sign in." },
      });
    });
  });

  it("should handle signup with different country code", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.register)
      .mockResolvedValue({
        message: "User registered successfully",
      });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Change country code to UK
    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    const ukOption = getByText("United Kingdom");
    fireEvent.press(ukOption);

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(phoneInput, "1234567890");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(
        require("../../app/services/ApiService").apiService.register
      ).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+441234567890", // +44 + phone
      });
    });
  });

  it("should handle signup API error", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.register)
      .mockRejectedValue(new Error("Email already exists"));

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "existing@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(phoneInput, "1234567890");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(getByText("Email already exists")).toBeTruthy();
    });
  });

  it("should handle network error", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.register)
      .mockRejectedValue(new Error("Network error"));

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(phoneInput, "1234567890");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });
  });

  it("should handle error without message", async () => {
    jest
      .mocked(require("../../app/services/ApiService").apiService.register)
      .mockRejectedValue(new Error());

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(phoneInput, "1234567890");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(
        getByText("Could not connect to server. Please try again later.")
      ).toBeTruthy();
    });
  });

  it("should clear error when user starts typing", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Trigger error first
    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    expect(
      getByText("Please fill in all fields with valid information.")
    ).toBeTruthy();

    // Start typing in name field
    const nameInput = getByPlaceholderText("Name");
    fireEvent.changeText(nameInput, "John Doe");

    // Error should be cleared
    expect(() =>
      getByText("Please fill in all fields with valid information.")
    ).toThrow();
  });

  it("should handle whitespace-only inputs", async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const phoneInput = getByPlaceholderText("Phone");

    fireEvent.changeText(nameInput, "   ");
    fireEvent.changeText(emailInput, "   ");
    fireEvent.changeText(passwordInput, "   ");
    fireEvent.changeText(phoneInput, "   ");

    const signUpButton = getByText("Sign Up");
    fireEvent.press(signUpButton);

    expect(
      getByText("Please fill in all fields with valid information.")
    ).toBeTruthy();
  });

  it("should have correct input properties", () => {
    const { getByPlaceholderText } = renderWithProviders(<SignupScreen />);

    const emailInput = getByPlaceholderText("Email");
    const phoneInput = getByPlaceholderText("Phone");
    const passwordInput = getByPlaceholderText("Password");

    expect(emailInput.props.keyboardType).toBe("email-address");
    expect(emailInput.props.autoCapitalize).toBe("none");
    expect(phoneInput.props.keyboardType).toBe("phone-pad");
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("should have correct button properties", () => {
    const { getByText } = renderWithProviders(<SignupScreen />);

    const signUpButton = getByText("Sign Up");
    expect(signUpButton.props.activeOpacity).toBe(0.85);
  });

  it("should validate phone number correctly", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    const nameInput = getByPlaceholderText("Name");
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.changeText(passwordInput, "password123");

    // Test various phone number lengths
    const phoneInput = getByPlaceholderText("Phone");

    // Too short (9 digits)
    fireEvent.changeText(phoneInput, "123456789");
    fireEvent.press(getByText("Sign Up"));
    expect(
      getByText("Please fill in all fields with valid information.")
    ).toBeTruthy();

    // Valid (10 digits)
    fireEvent.changeText(phoneInput, "1234567890");
    fireEvent.press(getByText("Sign Up"));
    // Should not show validation error for phone (other validation might still fail)
  });

  it("should filter country codes by code", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Open modal
    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    // Search by code
    const searchInput = getByPlaceholderText("Search country code");
    fireEvent.changeText(searchInput, "+44");

    expect(getByText("+44")).toBeTruthy();
    expect(getByText("United Kingdom")).toBeTruthy();
  });

  it("should clear search when country is selected", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <SignupScreen />
    );

    // Open modal
    const countryCodeButton = getByText("+1");
    fireEvent.press(countryCodeButton);

    // Search for something
    const searchInput = getByPlaceholderText("Search country code");
    fireEvent.changeText(searchInput, "United Kingdom");

    // Select a country
    const ukOption = getByText("United Kingdom");
    fireEvent.press(ukOption);

    // Open modal again and check search is cleared
    fireEvent.press(getByText("+44"));
    const newSearchInput = getByPlaceholderText("Search country code");
    expect(newSearchInput.props.value).toBe("");
  });
});
