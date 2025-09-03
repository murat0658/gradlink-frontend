import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button, Badge, Header, Input, Divider } from "../../../components/UI";

describe("UI Components", () => {
  describe("Button", () => {
    it("should render with default props", () => {
      const { getByText } = render(<Button>Test Button</Button>);
      expect(getByText("Test Button")).toBeTruthy();
    });

    it("should render with different variants", () => {
      const { getByText, rerender } = render(
        <Button variant="primary">Primary</Button>
      );
      expect(getByText("Primary")).toBeTruthy();

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(getByText("Secondary")).toBeTruthy();

      rerender(<Button variant="success">Success</Button>);
      expect(getByText("Success")).toBeTruthy();

      rerender(<Button variant="danger">Danger</Button>);
      expect(getByText("Danger")).toBeTruthy();
    });

    it("should render with different sizes", () => {
      const { getByText, rerender } = render(<Button size="sm">Small</Button>);
      expect(getByText("Small")).toBeTruthy();

      rerender(<Button size="md">Medium</Button>);
      expect(getByText("Medium")).toBeTruthy();

      rerender(<Button size="lg">Large</Button>);
      expect(getByText("Large")).toBeTruthy();
    });

    it("should handle onPress events", () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button onPress={onPress}>Click me</Button>);

      fireEvent.press(getByText("Click me"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress} disabled>
          Disabled Button
        </Button>
      );

      fireEvent.press(getByText("Disabled Button"));
      expect(onPress).not.toHaveBeenCalled();
    });

    it("should apply custom styles", () => {
      const customStyle = { backgroundColor: "red" };
      const { getByText } = render(
        <Button style={customStyle}>Styled Button</Button>
      );

      const button = getByText("Styled Button");
      expect(button).toBeTruthy();
    });
  });

  describe("Badge", () => {
    it("should render with default props", () => {
      const { getByText } = render(<Badge>Test Badge</Badge>);
      expect(getByText("Test Badge")).toBeTruthy();
    });

    it("should render with different variants", () => {
      const { getByText, rerender } = render(
        <Badge variant="primary">Primary</Badge>
      );
      expect(getByText("Primary")).toBeTruthy();

      rerender(<Badge variant="secondary">Secondary</Badge>);
      expect(getByText("Secondary")).toBeTruthy();

      rerender(<Badge variant="success">Success</Badge>);
      expect(getByText("Success")).toBeTruthy();

      rerender(<Badge variant="error">Error</Badge>);
      expect(getByText("Error")).toBeTruthy();
    });

    it("should render with different sizes", () => {
      const { getByText, rerender } = render(<Badge size="sm">Small</Badge>);
      expect(getByText("Small")).toBeTruthy();

      rerender(<Badge size="md">Medium</Badge>);
      expect(getByText("Medium")).toBeTruthy();

      rerender(<Badge size="lg">Large</Badge>);
      expect(getByText("Large")).toBeTruthy();
    });
  });

  describe("Header", () => {
    it("should render with title", () => {
      const { getByText } = render(<Header title="Test Header" />);
      expect(getByText("Test Header")).toBeTruthy();
    });

    it("should render with icon", () => {
      const { getByText } = render(<Header title="Test Header" icon="📱" />);
      expect(getByText("Test Header")).toBeTruthy();
      expect(getByText("📱")).toBeTruthy();
    });

    it("should render with color", () => {
      const { getByText } = render(
        <Header title="Test Header" color="#ff0000" />
      );
      expect(getByText("Test Header")).toBeTruthy();
    });
  });

  describe("Input", () => {
    it("should render with placeholder", () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" />
      );
      expect(getByPlaceholderText("Enter text")).toBeTruthy();
    });

    it("should handle text input", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" onChangeText={onChangeText} />
      );

      const input = getByPlaceholderText("Enter text");
      fireEvent.changeText(input, "Hello World");
      expect(onChangeText).toHaveBeenCalledWith("Hello World");
    });

    it("should display error message", () => {
      const { getByText } = render(
        <Input placeholder="Enter text" error="This field is required" />
      );
      expect(getByText("This field is required")).toBeTruthy();
    });

    it("should handle multiline input", () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" multiline />
      );
      expect(getByPlaceholderText("Enter text")).toBeTruthy();
    });

    it("should handle secure text entry", () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter password" secureTextEntry />
      );
      expect(getByPlaceholderText("Enter password")).toBeTruthy();
    });

    it("should handle onBlur events", () => {
      const onBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" onBlur={onBlur} />
      );

      const input = getByPlaceholderText("Enter text");
      fireEvent(input, "blur");
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it("should handle onFocus events", () => {
      const onFocus = jest.fn();
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" onFocus={onFocus} />
      );

      const input = getByPlaceholderText("Enter text");
      fireEvent(input, "focus");
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe("Divider", () => {
    it("should render divider", () => {
      const { getByTestId } = render(<Divider testID="divider" />);
      expect(getByTestId("divider")).toBeTruthy();
    });

    it("should render with custom style", () => {
      const customStyle = { height: 2, backgroundColor: "red" };
      const { getByTestId } = render(
        <Divider testID="divider" style={customStyle} />
      );
      expect(getByTestId("divider")).toBeTruthy();
    });
  });
});
