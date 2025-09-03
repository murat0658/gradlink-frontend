import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/ApiService";
import {
  setEvents,
  setGroups,
  setNotifications,
  setSubscriptions,
  setJoinedGroups,
  setEnrollments,
  setEventsLoading,
  setEventsError,
  setGroupsLoading,
  setGroupsError,
  setNotificationsLoading,
  setNotificationsError,
  setSubscriptionsLoading,
  setSubscriptionsError,
  setJoinedGroupsLoading,
  setJoinedGroupsError,
  setEnrollmentsLoading,
  setEnrollmentsError,
} from "../slices/index";
import { setProfile, setLoading, setError } from "../slices/userSlice";

// Events thunks
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params?: { page?: number; size?: number; groupCode?: string }) => {
    try {
      const response = await apiService.getEvents(params);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

export const createEventAsync = createAsyncThunk(
  "events/createEvent",
  async (eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    capacity: number;
    groupCode: string;
  }) => {
    try {
      const response = await apiService.createEvent(eventData);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

export const enrollInEventAsync = createAsyncThunk(
  "events/enrollInEvent",
  async (eventId: string) => {
    try {
      const response = await apiService.enrollInEvent(eventId);
      return { eventId, response };
    } catch (error: any) {
      throw error;
    }
  }
);

export const unenrollFromEventAsync = createAsyncThunk(
  "events/unenrollFromEvent",
  async (eventId: string) => {
    try {
      await apiService.unenrollFromEvent(eventId);
      return eventId;
    } catch (error: any) {
      throw error;
    }
  }
);

// Groups thunks
export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (params?: { page?: number; size?: number; search?: string }) => {
    try {
      const response = await apiService.getGroups(params);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

export const joinGroupAsync = createAsyncThunk(
  "groups/joinGroup",
  async (groupCode: string) => {
    try {
      const response = await apiService.joinGroup(groupCode);
      return { groupCode, response };
    } catch (error: any) {
      throw error;
    }
  }
);

export const leaveGroupAsync = createAsyncThunk(
  "groups/leaveGroup",
  async (groupCode: string) => {
    try {
      await apiService.leaveGroup(groupCode);
      return groupCode;
    } catch (error: any) {
      throw error;
    }
  }
);

// Notifications thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params?: { page?: number; size?: number; isRead?: boolean }) => {
    try {
      const response = await apiService.getNotifications(params);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

export const markNotificationAsReadAsync = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      return { notificationId, response };
    } catch (error: any) {
      throw error;
    }
  }
);

// Subscriptions thunks
export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async () => {
    try {
      const response = await apiService.getSubscriptions();
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

export const subscribeToGroupAsync = createAsyncThunk(
  "subscriptions/subscribeToGroup",
  async (groupCode: string, { rejectWithValue }) => {
    try {
      console.log("🔄 subscribeToGroupAsync: Starting subscription for", groupCode);
      const response = await apiService.subscribeToGroup(groupCode);
      console.log("🔄 subscribeToGroupAsync: Success response", response);
      return { groupCode, response };
    } catch (error: any) {
      console.error("❌ subscribeToGroupAsync: Error occurred", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to subscribe to group";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check if it's a network or server error
      if (error.message?.includes("Network error") || error.message?.includes("Failed to fetch")) {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        errorMessage = "Subscription endpoint not available. Please try again later.";
      } else if (error.message?.includes("500") || error.message?.includes("Internal Server Error")) {
        errorMessage = "Server error occurred. Please try again later.";
      }
      
      console.error("❌ subscribeToGroupAsync: Final error message", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const unsubscribeFromGroupAsync = createAsyncThunk(
  "subscriptions/unsubscribeFromGroup",
  async (groupCode: string, { rejectWithValue }) => {
    try {
      console.log("🔄 unsubscribeFromGroupAsync: Starting unsubscription for", groupCode);
      await apiService.unsubscribeFromGroup(groupCode);
      console.log("🔄 unsubscribeFromGroupAsync: Success");
      return groupCode;
    } catch (error: any) {
      console.error("❌ unsubscribeFromGroupAsync: Error occurred", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to unsubscribe from group";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check if it's a network or server error
      if (error.message?.includes("Network error") || error.message?.includes("Failed to fetch")) {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      } else if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        errorMessage = "Unsubscribe endpoint not available. Please try again later.";
      } else if (error.message?.includes("500") || error.message?.includes("Internal Server Error")) {
        errorMessage = "Server error occurred. Please try again later.";
      }
      
      console.error("❌ unsubscribeFromGroupAsync: Final error message", errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Joined groups thunks
export const fetchJoinedGroups = createAsyncThunk(
  "joinedGroups/fetchJoinedGroups",
  async () => {
    try {
      // This would be implemented when the backend provides this endpoint
      // For now, we'll use a placeholder
      const response: any[] = [];
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

// Enrollments thunks
export const fetchEnrollments = createAsyncThunk(
  "enrollments/fetchEnrollments",
  async () => {
    try {
      // This would be implemented when the backend provides this endpoint
      // For now, we'll use a placeholder
      const response: any[] = [];
      return response;
    } catch (error: any) {
      throw error;
    }
  }
);

// User profile thunks
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.getCurrentUser();
      dispatch(setProfile(response));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to fetch profile"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    bio?: string;
    location?: string;
    university?: string;
    graduationYear?: number;
    major?: string;
    avatar?: string;
  }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.updateUser(userData);
      dispatch(setProfile(response));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to update profile"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "user/uploadAvatar",
  async (file: File, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.uploadFile(file, "avatar");
      // Update profile with new avatar URL
      const currentProfile = await apiService.getCurrentUser();
      dispatch(setProfile(currentProfile));
      return response;
    } catch (error: any) {
      dispatch(setError(error.message || "Failed to upload avatar"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
