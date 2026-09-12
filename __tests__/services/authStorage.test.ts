/**
 * @jest-environment jsdom
 */
import { Platform } from "react-native";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthToken,
  loadAuthToken,
  saveAuthToken,
} from "../../app/services/authStorage";

describe("authStorage (web hard-refresh persistence)", () => {
  beforeEach(async () => {
    (Platform as any).OS = "web";
    localStorage.clear();
    await clearAuthToken();
  });

  it("saves and loads token from localStorage", async () => {
    await saveAuthToken("tok-abc");
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe("tok-abc");
    expect(await loadAuthToken()).toBe("tok-abc");
  });

  it("clears token on logout", async () => {
    await saveAuthToken("tok-abc");
    await clearAuthToken();
    expect(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(await loadAuthToken()).toBeNull();
  });
});
