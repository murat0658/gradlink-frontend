import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "gradlink_starter_guide_seen_v1";

let memoryFlag: boolean | null = null;

export async function hasSeenStarterGuide(): Promise<boolean> {
  if (memoryFlag != null) return memoryFlag;
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") return false;
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  }
  try {
    const v = await SecureStore.getItemAsync(KEY);
    memoryFlag = v === "1";
    return memoryFlag;
  } catch {
    return false;
  }
}

export async function markStarterGuideSeen(): Promise<void> {
  memoryFlag = true;
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(KEY, "1");
  } catch {
    // keep memory only
  }
}

/** For profile “Show starter guide again”. */
export async function resetStarterGuideSeen(): Promise<void> {
  memoryFlag = false;
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // ignore
  }
}
