import { Platform } from "react-native";

// API Configuration
export const API_BASE_URL = "http://localhost:8080/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
  },
  // Events
  EVENTS: {
    BASE: "/events",
    CREATE: "/events",
    ENROLL: "/events/:id/enroll",
    UNENROLL: "/events/:id/unenroll",
  },
  // Groups
  GROUPS: {
    BASE: "/groups",
    JOIN: "/groups/:id/join",
    LEAVE: "/groups/:id/leave",
  },
  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: "/notifications/:id/read",
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
    SUBSCRIBE: "/subscriptions",
    UNSUBSCRIBE: "/subscriptions/:id",
  },
  // Users
  USERS: {
    PROFILE: "/users/me",
    UPDATE: "/users/me",
  },
  // News
  NEWS: {
    BASE: "/news",
    CREATE: "/news",
    BY_GROUP: "/news/group/:id",
    UPDATE: "/news/:id",
    DELETE: "/news/:id",
  },
} as const;

// Helper function to get the full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Log the current API configuration (only in development)
if (__DEV__) {
  console.log("🔗 API Configuration:", {
    baseUrl: API_BASE_URL,
    platform: Platform.OS,
    isDev: __DEV__,
  });
}
