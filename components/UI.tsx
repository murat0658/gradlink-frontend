import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  TextInput,
} from "react-native";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../constants/Colors";

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export function Card({ children, style, padding = "md" }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.border,
          padding: spacing[padding],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Button Component
interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  ...props
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    // Add variant-specific styles
    switch (variant) {
      case "outline":
        baseStyle.push(styles.buttonOutline);
        break;
      case "danger":
        baseStyle.push(styles.buttonDanger);
        break;
      case "success":
        baseStyle.push(styles.buttonSuccess);
        break;
      case "secondary":
        baseStyle.push(styles.buttonSecondary);
        break;
      default:
        baseStyle.push(styles.buttonPrimary);
    }

    // Add size-specific styles
    switch (size) {
      case "sm":
        baseStyle.push(styles.buttonSm);
        break;
      case "lg":
        baseStyle.push(styles.buttonLg);
        break;
      default:
        baseStyle.push(styles.buttonMd);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    // Add variant-specific text styles
    switch (variant) {
      case "outline":
        baseStyle.push(styles.buttonTextOutline);
        break;
      case "danger":
        baseStyle.push(styles.buttonTextDanger);
        break;
      case "success":
        baseStyle.push(styles.buttonTextSuccess);
        break;
      case "secondary":
        baseStyle.push(styles.buttonTextSecondary);
        break;
      default:
        baseStyle.push(styles.buttonTextPrimary);
    }

    // Add size-specific text styles
    switch (size) {
      case "sm":
        baseStyle.push(styles.buttonTextSm);
        break;
      case "lg":
        baseStyle.push(styles.buttonTextLg);
        break;
      default:
        baseStyle.push(styles.buttonTextMd);
    }

    return baseStyle;
  };

  const buttonStyle = [
    ...getButtonStyle(),
    {
      backgroundColor:
        variant === "outline"
          ? "transparent"
          : variant === "danger"
          ? Colors.error
          : variant === "success"
          ? Colors.success
          : variant === "secondary"
          ? Colors.backgroundSecondary
          : Colors.tint,
      borderColor: variant === "outline" ? Colors.tint : "transparent",
    },
    style,
  ];

  const textStyle = [
    ...getTextStyle(),
    {
      color:
        variant === "outline"
          ? Colors.tint
          : variant === "secondary"
          ? Colors.text
          : "#ffffff",
    },
  ];

  return (
    <TouchableOpacity style={buttonStyle} {...props}>
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function Badge({
  children,
  variant = "primary",
  size = "md",
  style,
}: BadgeProps) {
  const getBadgeStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.badge];

    // Add variant-specific styles
    switch (variant) {
      case "success":
        baseStyle.push(styles.badgeSuccess);
        break;
      case "warning":
        baseStyle.push(styles.badgeWarning);
        break;
      case "error":
        baseStyle.push(styles.badgeError);
        break;
      case "info":
        baseStyle.push(styles.badgeInfo);
        break;
      default:
        baseStyle.push(styles.badgePrimary);
    }

    // Add size-specific styles
    switch (size) {
      case "sm":
        baseStyle.push(styles.badgeSm);
        break;
      default:
        baseStyle.push(styles.badgeMd);
    }

    return baseStyle;
  };

  const badgeStyle = [
    ...getBadgeStyle(),
    {
      backgroundColor:
        variant === "success"
          ? Colors.success
          : variant === "warning"
          ? Colors.warning
          : variant === "error"
          ? Colors.error
          : variant === "info"
          ? Colors.info
          : Colors.tint,
    },
    style,
  ];

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.badgeText];

    // Add size-specific text styles
    switch (size) {
      case "sm":
        baseStyle.push(styles.badgeTextSm);
        break;
      default:
        baseStyle.push(styles.badgeTextMd);
    }

    return baseStyle;
  };

  const textStyle = [
    ...getTextStyle(),
    {
      color: "#ffffff",
    },
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}

// Input Component
interface InputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  style?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  style,
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors.backgroundSecondary,
            borderColor: error ? Colors.error : Colors.border,
            color: Colors.text,
            minHeight: multiline ? numberOfLines * 24 : 44,
          },
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && (
        <Text style={[styles.inputError, { color: Colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

// Header Component
interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
}

export function Header({ title, subtitle, icon, color }: HeaderProps) {
  return (
    <View style={styles.header}>
      {icon && (
        <View
          style={[styles.headerIcon, { backgroundColor: color || Colors.tint }]}
        >
          <Text style={styles.headerIconText}>{icon}</Text>
        </View>
      )}
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.headerSubtitle, { color: Colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <View
        style={[styles.headerAccent, { backgroundColor: color || Colors.tint }]}
      />
    </View>
  );
}

// Divider Component
export function Divider({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.divider, { backgroundColor: Colors.border }, style]} />
  );
}

const styles = StyleSheet.create({
  // Card styles
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...shadows.md,
  },

  // Button styles
  button: {
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonPrimary: {},
  buttonSecondary: {},
  buttonOutline: {
    borderWidth: 1,
  },
  buttonDanger: {},
  buttonSuccess: {},
  buttonSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonMd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonLg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  buttonTextPrimary: {},
  buttonTextSecondary: {},
  buttonTextOutline: {},
  buttonTextDanger: {},
  buttonTextSuccess: {},
  buttonTextSm: {
    ...typography.sm,
  },
  buttonTextMd: {
    ...typography.base,
  },
  buttonTextLg: {
    ...typography.lg,
  },

  // Badge styles
  badge: {
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  badgePrimary: {},
  badgeSuccess: {},
  badgeWarning: {},
  badgeError: {},
  badgeInfo: {},
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 20,
    minHeight: 20,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 24,
    minHeight: 24,
  },
  badgeTextSm: {
    ...typography.xs,
  },
  badgeTextMd: {
    ...typography.sm,
  },
  badgeText: {
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
    ...typography.sm,
  },

  // Input styles
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.base,
  },
  inputError: {
    ...typography.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },

  // Header styles
  header: {
    marginBottom: spacing.lg,
    width: "100%",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    alignSelf: "center",
  },
  headerIconText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold" as const,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography["2xl"],
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.base,
    textAlign: "center",
  },
  headerAccent: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },

  // Divider styles
  divider: {
    height: 1,
    width: "100%",
    marginVertical: spacing.md,
  },
});

// Re-export TextInput for convenience
export { TextInput };
