import { Platform } from "react-native";

const TOKEN_KEY = "gradlink_auth_token";

/** In-process fallback when SecureStore / localStorage is unavailable. */
let memoryToken: string | null = null;

/**
 * Persist auth token across reloads (web hard-refresh) and app restarts.
 * Web uses localStorage; native uses in-memory until SecureStore is wired.
 */
export async function loadAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") return memoryToken;
      return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  }
  return memoryToken;
}

export async function saveAuthToken(token: string | null): Promise<void> {
  memoryToken = token;
  if (Platform.OS !== "web") return;
  try {
    if (typeof localStorage === "undefined") return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore quota / private mode
  }
}

export async function clearAuthToken(): Promise<void> {
  await saveAuthToken(null);
}

export const AUTH_TOKEN_STORAGE_KEY = TOKEN_KEY;
