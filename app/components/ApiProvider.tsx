import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, selectIsAuthenticated } from "../store";
import { setToken, setAuthenticated, logout } from "../store/slices/userSlice";
import { apiService } from "../services/ApiService";
import { clearAuthToken, saveAuthToken } from "../services/authStorage";

interface ApiProviderProps {
  children: React.ReactNode;
}

let refreshInFlight: Promise<boolean> | null = null;

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Handle token refresh
  const refreshToken = useCallback(async () => {
    if (refreshInFlight) {
      return refreshInFlight;
    }
    refreshInFlight = (async () => {
      try {
        console.log("🔄 Attempting token refresh...");
        console.log("Current Redux token exists:", !!token);

        // Check if we have a token before attempting refresh
        if (!token) {
          console.warn("⚠️ No token available for refresh, skipping");
          return false;
        }

        const response = await apiService.refreshToken();
        if (response && response.token) {
          console.log("✅ Token refresh successful");
          dispatch(setToken(response.token));
          apiService.setToken(response.token);
          await saveAuthToken(response.token);
          return true;
        } else {
          console.warn("⚠️ Token refresh response missing token");
          return false;
        }
      } catch (error: any) {
        console.error("❌ Token refresh failed:", error);

        if (error.message) {
          console.error("Error message:", error.message);
        }

        if (error.message && error.message.includes("No token available")) {
          console.warn("⚠️ Token refresh skipped: no token available");
          return false;
        }

        if (error.message && error.message.includes("500")) {
          console.error("🚨 Backend server error - refresh endpoint not working");
          return false;
        }

        dispatch(logout());
        apiService.setToken(null);
        await clearAuthToken();
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
    return refreshInFlight;
  }, [dispatch, token]);

  // Handle authentication errors
  const handleAuthError = useCallback(async () => {
    console.log(
      "🔐 Authentication error detected, attempting token refresh..."
    );
    console.log("Current token state:", !!token);
    console.log("Current auth state:", isAuthenticated);

    // Don't try to refresh if we don't have a token or aren't authenticated
    if (!token || !isAuthenticated) {
      console.log("🚫 No token or not authenticated, skipping token refresh");
      return false;
    }

    // Try to refresh token
    const refreshed = await refreshToken();
    if (!refreshed) {
      console.log("🚪 Token refresh failed, logging out user");
      dispatch(logout());
      apiService.setToken(null);
      await clearAuthToken();
    } else {
      console.log("✅ Token refresh successful, user remains authenticated");
    }
    return refreshed;
  }, [dispatch, refreshToken, token, isAuthenticated]);

  // Set up authentication error handler
  useEffect(() => {
    apiService.setAuthErrorHandler(handleAuthError);
  }, [handleAuthError]);

  // Update API service token when token changes
  useEffect(() => {
    console.log("🔄 ApiProvider: Token or authentication state changed");
    console.log("Token exists:", !!token);
    console.log("Is authenticated:", isAuthenticated);

    if (token) {
      console.log("🔑 Setting token in ApiService");
      apiService.setToken(token);
      if (!isAuthenticated) {
        console.log("🔐 Setting authenticated to true");
        dispatch(setAuthenticated(true));
      }
    } else {
      console.log("🚫 Clearing token from ApiService");
      apiService.setToken(null);
      if (isAuthenticated) {
        console.log("🔐 Setting authenticated to false");
        dispatch(setAuthenticated(false));
      }
    }
  }, [token, isAuthenticated, dispatch]);

  // Set up token refresh interval
  useEffect(() => {
    if (token && isAuthenticated) {
      console.log("⏰ Setting up token refresh interval (14 minutes)");
      console.log("Token exists:", !!token);
      console.log("Is authenticated:", isAuthenticated);

      const refreshInterval = setInterval(async () => {
        console.log("⏰ Token refresh interval triggered");
        console.log("Current token at interval:", !!token);
        console.log("Current auth state at interval:", isAuthenticated);

        // Double-check that we still have a valid token before refreshing
        if (!token || !isAuthenticated) {
          console.warn(
            "⚠️ Token or auth state changed during interval, skipping refresh"
          );
          return;
        }

        const success = await refreshToken();
        if (!success) {
          console.warn(
            "⚠️ Token refresh failed, but keeping user logged in for now"
          );
          // Note: We don't logout here to avoid disrupting user experience
          // The user will be logged out on the next API call that requires auth
        }
      }, 14 * 60 * 1000); // Refresh every 14 minutes (assuming 15-minute token expiry)

      return () => {
        console.log("🛑 Clearing token refresh interval");
        clearInterval(refreshInterval);
      };
    } else {
      console.log(
        "🚫 Not setting up token refresh interval - no token or not authenticated"
      );
      console.log("Token exists:", !!token);
      console.log("Is authenticated:", isAuthenticated);
    }
  }, [token, isAuthenticated, refreshToken]);

  return <>{children}</>;
};

export default ApiProvider;
