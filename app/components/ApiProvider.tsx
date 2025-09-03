import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, selectIsAuthenticated } from "../store";
import { setToken, setAuthenticated, logout } from "../store/slices/userSlice";
import { apiService } from "../services/ApiService";

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Clean up any stale state on app start
  useEffect(() => {
    console.log("🚀 ApiProvider initialized");
    console.log("Initial token state:", !!token);
    console.log("Initial auth state:", isAuthenticated);

    // If we have a token but are not authenticated, clear the token
    if (token && !isAuthenticated) {
      console.log(
        "🧹 Cleaning up stale token - token exists but not authenticated"
      );
      dispatch(setToken(null));
      apiService.setToken(null);
    }
  }, []); // Run only once on mount

  // Handle token refresh
  const refreshToken = useCallback(async () => {
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
        return true;
      } else {
        console.warn("⚠️ Token refresh response missing token");
        return false;
      }
    } catch (error: any) {
      console.error("❌ Token refresh failed:", error);

      // Log specific error details for debugging
      if (error.message) {
        console.error("Error message:", error.message);
      }

      // Check if it's a "no token" error
      if (error.message && error.message.includes("No token available")) {
        console.warn("⚠️ Token refresh skipped: no token available");
        return false;
      }

      // Check if it's a server error (500) vs other errors
      if (error.message && error.message.includes("500")) {
        console.error("🚨 Backend server error - refresh endpoint not working");
        // Don't logout immediately for server errors, just return false
        return false;
      }

      // For other errors (network, 401, etc.), logout the user
      dispatch(logout());
      apiService.setToken(null);
      return false;
    }
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
      return;
    }

    // Try to refresh token
    const refreshed = await refreshToken();
    if (!refreshed) {
      console.log("🚪 Token refresh failed, logging out user");
      // If refresh fails, redirect to login
      dispatch(logout());
      apiService.setToken(null);
    } else {
      console.log("✅ Token refresh successful, user remains authenticated");
    }
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
