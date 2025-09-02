import { Platform } from "react-native";

// API Configuration
export const API_BASE_URL = "http://10.236.139.66:8080";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    REFRESH: "/api/auth/refresh",
  },
  // Events
  EVENTS: {
    BASE: "/api/events",
    CREATE: "/api/events",
    ENROLL: "/api/events/:id/enroll",
    UNENROLL: "/api/events/:id/unenroll",
  },
  // Groups
  GROUPS: {
    BASE: "/api/groups",
    JOIN: "/api/groups/:code/join",
    LEAVE: "/api/groups/:code/leave",
  },
  // Notifications
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    MARK_READ: "/api/notifications/:id/read",
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    BASE: "/api/subscriptions",
    SUBSCRIBE: "/api/groups/:code/subscribe",
    UNSUBSCRIBE: "/api/groups/:code/unsubscribe",
  },
  // Users
  USERS: {
    PROFILE: "/api/users/profile",
    UPDATE: "/api/users/profile",
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
