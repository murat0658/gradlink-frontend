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

  // Handle token refresh
  const refreshToken = useCallback(async () => {
    try {
      const response = await apiService.refreshToken();
      if (response.token) {
        dispatch(setToken(response.token));
        apiService.setToken(response.token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout the user
      dispatch(logout());
      apiService.setToken(null);
      return false;
    }
    return false;
  }, [dispatch]);

  // Handle authentication errors
  const handleAuthError = useCallback(async () => {
    // Try to refresh token
    const refreshed = await refreshToken();
    if (!refreshed) {
      // If refresh fails, redirect to login
      dispatch(logout());
      apiService.setToken(null);
    }
  }, [dispatch, refreshToken]);

  // Set up authentication error handler
  useEffect(() => {
    apiService.setAuthErrorHandler(handleAuthError);
  }, [handleAuthError]);

  // Update API service token when token changes
  useEffect(() => {
    if (token) {
      apiService.setToken(token);
      if (!isAuthenticated) {
        dispatch(setAuthenticated(true));
      }
    } else {
      apiService.setToken(null);
      if (isAuthenticated) {
        dispatch(setAuthenticated(false));
      }
    }
  }, [token, isAuthenticated, dispatch]);

  // Set up token refresh interval
  useEffect(() => {
    if (token && isAuthenticated) {
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes (assuming 15-minute token expiry)

      return () => clearInterval(refreshInterval);
    }
  }, [token, isAuthenticated, refreshToken]);

  return <>{children}</>;
};

export default ApiProvider;
