import userReducer, {
  setAuthenticated,
  setToken,
  logout,
  setProfile,
  clearProfile,
  setLoading,
  setError,
} from "../../../app/store/slices/userSlice";
import { createMockUser } from "../../utils/test-utils";

describe("userSlice", () => {
  const initialState = {
    isAuthenticated: false,
    token: null,
    profile: null,
    loading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(userReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  describe("setAuthenticated", () => {
    it("should set authentication status to true", () => {
      const action = setAuthenticated(true);
      const state = userReducer(initialState, action);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should set authentication status to false", () => {
      const action = setAuthenticated(false);
      const state = userReducer(initialState, action);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("setToken", () => {
    it("should set token", () => {
      const token = "test-token";
      const action = setToken(token);
      const state = userReducer(initialState, action);
      expect(state.token).toBe(token);
    });

    it("should clear token when set to null", () => {
      const action = setToken(null);
      const state = userReducer(initialState, action);
      expect(state.token).toBe(null);
    });
  });

  describe("logout", () => {
    it("should reset all user state", () => {
      const stateWithData = {
        isAuthenticated: true,
        token: "test-token",
        profile: createMockUser(),
        loading: false,
        error: "Some error",
      };

      const action = logout();
      const state = userReducer(stateWithData, action);

      expect(state).toEqual(initialState);
    });
  });

  describe("setProfile", () => {
    it("should set user profile", () => {
      const profile = createMockUser();
      const action = setProfile(profile);
      const state = userReducer(initialState, action);

      expect(state.profile).toEqual(profile);
    });
  });

  describe("clearProfile", () => {
    it("should clear user profile", () => {
      const stateWithProfile = {
        ...initialState,
        profile: createMockUser(),
      };

      const action = clearProfile();
      const state = userReducer(stateWithProfile, action);

      expect(state.profile).toBe(null);
    });
  });

  describe("setLoading", () => {
    it("should set loading to true", () => {
      const action = setLoading(true);
      const state = userReducer(initialState, action);
      expect(state.loading).toBe(true);
    });

    it("should set loading to false", () => {
      const action = setLoading(false);
      const state = userReducer(initialState, action);
      expect(state.loading).toBe(false);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      const errorMessage = "Test error";
      const action = setError(errorMessage);
      const state = userReducer(initialState, action);

      expect(state.error).toBe(errorMessage);
    });

    it("should clear error when set to null", () => {
      const action = setError(null);
      const state = userReducer(initialState, action);
      expect(state.error).toBe(null);
    });
  });
});
