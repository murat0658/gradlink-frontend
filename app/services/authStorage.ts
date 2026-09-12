import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "gradlink_auth_token";

/** In-process fallback when SecureStore / localStorage is unavailable. */
let memoryToken: string | null = null;

/**
 * Persist auth token across reloads (web hard-refresh) and app restarts.
 * Web: localStorage. Native: expo-secure-store (with memory fallback).
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
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (stored) {
      memoryToken = stored;
      return stored;
    }
  } catch {
    // SecureStore unavailable (e.g. Expo Go edge cases)
  }
  return memoryToken;
}

export async function saveAuthToken(token: string | null): Promise<void> {
  memoryToken = token;
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") return;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore quota / private mode
    }
    return;
  }
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // keep memoryToken only
  }
}

export async function clearAuthToken(): Promise<void> {
  await saveAuthToken(null);
}

export const AUTH_TOKEN_STORAGE_KEY = TOKEN_KEY;
