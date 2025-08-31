// API Configuration
export const API_BASE_URL = "http://localhost:8080";

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
