import { Platform } from "react-native";
import Constants from "expo-constants";

// ========================================
// MANUAL CONFIGURATION (Optional)
// ========================================
// If auto-detection doesn't work, set your computer's local IP address here:
// Example: "192.168.1.100" or "10.246.224.137"
// To find your IP:
//   - Mac/Linux: run `ipconfig getifaddr en0` or `hostname -I`
//   - Windows: run `ipconfig` and look for IPv4 Address
//   - Make sure your phone and computer are on the same WiFi network
// 
// FALLBACK IP: If auto-detection fails, this will be used
const FALLBACK_IP = "10.246.224.137"; // Your computer's IP (update if it changes)
const MANUAL_API_HOST: string | null = null; // Set to your IP to force it, e.g., "192.168.1.100"

// ========================================
// AUTO-DETECTION
// ========================================
// Get the local IP address from Expo constants (works for Expo Go)
const getLocalIP = (): string => {
  // If manual override is set, use it
  if (MANUAL_API_HOST) {
    return MANUAL_API_HOST;
  }
  
  // Try multiple ways to get the debugger host IP for Expo Go
  // Method 1: expoConfig.hostUri (newer Expo SDK)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return ip;
    }
  }
  
  // Method 2: manifest.debuggerHost (older Expo SDK)
  const debuggerHost = Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return ip;
    }
  }
  
  // Method 3: manifest2 (Expo SDK 49+)
  const manifest2Host = Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (manifest2Host) {
    const ip = manifest2Host.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return ip;
    }
  }
  
  // Platform-specific defaults for simulators/emulators
  if (__DEV__) {
    // For iOS Simulator, use localhost
    if (Platform.OS === "ios") {
      return "localhost";
    }
    
    // For Android Emulator, use 10.0.2.2 (special IP for host machine)
    if (Platform.OS === "android") {
      return "10.0.2.2";
    }
  }
  
  // Default fallback - use the fallback IP if we have one, otherwise localhost
  // For physical devices, localhost won't work, so we use the fallback IP
  if (FALLBACK_IP) {
    console.log(`⚠️  Auto-detection failed, using fallback IP: ${FALLBACK_IP}`);
    return FALLBACK_IP;
  }
  
  return "localhost";
};

// API Configuration
// For Expo Go on physical devices, this will use your computer's local IP
// For simulators/emulators, it uses platform-specific addresses
const API_HOST = getLocalIP();
const API_PORT = "8080";
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

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
  // News
  NEWS: {
    BASE: "/api/news",
    CREATE: "/api/news",
    BY_GROUP: "/api/news/group/:id",
    UPDATE: "/api/news/:id",
    DELETE: "/api/news/:id",
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
  const detectedIP = getLocalIP();
  const allConstants = {
    expoConfig: Constants.expoConfig,
    manifest: Constants.manifest,
    manifest2: Constants.manifest2,
    hostUri: Constants.expoConfig?.hostUri,
    debuggerHost: Constants.manifest?.debuggerHost,
    executionEnvironment: Constants.executionEnvironment,
  };
  
  console.log("🔗 API Configuration:", {
    baseUrl: API_BASE_URL,
    detectedHost: detectedIP,
    platform: Platform.OS,
    isDev: __DEV__,
    manualHost: MANUAL_API_HOST,
    fallbackIP: FALLBACK_IP,
    constants: allConstants,
  });
  
  // Warn if using localhost on a physical device (won't work)
  if (detectedIP === "localhost" && Platform.OS !== "web") {
    console.warn(
      "⚠️  Warning: Using localhost for API. This won't work on physical devices.\n" +
      `Try setting MANUAL_API_HOST to "${FALLBACK_IP}" in app/config/api.ts\n` +
      "Make sure your device and computer are on the same WiFi network."
    );
  }
  
  // Test API connectivity
  console.log(`📡 API will connect to: ${API_BASE_URL}`);
  console.log(`💡 If this doesn't work, verify:`);
  console.log(`   1. Your backend is running on port 8080`);
  console.log(`   2. Your phone and computer are on the same WiFi`);
  console.log(`   3. Firewall allows connections on port 8080`);
  console.log(`   4. Backend listens on 0.0.0.0 (not just localhost)`);
}
