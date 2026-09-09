// API Configuration – remote backend
export const API_BASE_URL = "https://vmi3096881.contaboserver.net";

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
    JOIN: "/api/groups/:id/join",
    LEAVE: "/api/groups/:id/leave",
  },
  // Notifications
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    MARK_READ: "/api/notifications/:id/read",
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    BASE: "/api/subscriptions",
    SUBSCRIBE: "/api/subscriptions",
    UNSUBSCRIBE: "/api/subscriptions/:id",
  },
  // Users
  USERS: {
    PROFILE: "/api/users/me",
    UPDATE: "/api/users/me",
  },
  BILLING: {
    ME: "/api/billing/me",
    SUBSCRIBE: "/api/billing/subscribe",
    CANCEL: "/api/billing/cancel",
  },
  // News — backend supports GET by group + POST create only
  NEWS: {
    BASE: "/api/news",
    CREATE: "/api/news",
    BY_GROUP: "/api/news/group/:id",
  },
} as const;

// Helper function to get the full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Test API connectivity (useful for debugging)
export const testApiConnectivity = async (): Promise<boolean> => {
  try {
    console.log("🧪 Testing API connectivity to:", API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "test" }),
    });

    // We expect this to fail with 401/400, but if we get ANY response, the connection works
    console.log("✅ API Connectivity Test:", {
      status: response.status,
      statusText: response.statusText,
      connected: true,
    });
    return true;
  } catch (error) {
    console.error("❌ API Connectivity Test Failed:", {
      error: error instanceof Error ? error.message : error,
      url: API_BASE_URL,
    });
    return false;
  }
};

// Log the current API configuration (only in development)
if (__DEV__) {
  console.log("🔗 API Configuration:", { baseUrl: API_BASE_URL });
  console.log(`📡 API will connect to: ${API_BASE_URL}`);
}
