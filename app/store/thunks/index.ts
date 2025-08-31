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
  async (groupCode: string) => {
    try {
      const response = await apiService.subscribeToGroup(groupCode);
      return { groupCode, response };
    } catch (error: any) {
      throw error;
    }
  }
);

export const unsubscribeFromGroupAsync = createAsyncThunk(
  "subscriptions/unsubscribeFromGroup",
  async (groupCode: string) => {
    try {
      await apiService.unsubscribeFromGroup(groupCode);
      return groupCode;
    } catch (error: any) {
      throw error;
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

// Default export for all thunks
export default {
  // Events thunks
  fetchEvents,
  createEventAsync,
  enrollInEventAsync,
  unenrollFromEventAsync,
  // Groups thunks
  fetchGroups,
  joinGroupAsync,
  leaveGroupAsync,
  // Notifications thunks
  fetchNotifications,
  markNotificationAsReadAsync,
  // Subscriptions thunks
  fetchSubscriptions,
  subscribeToGroupAsync,
  unsubscribeFromGroupAsync,
  // Joined groups thunks
  fetchJoinedGroups,
  // Enrollments thunks
  fetchEnrollments,
};
