import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../types";
import { fetchNotifications } from "../thunks";
import { unwrapPageContent } from "../../utils/status";

export interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload); // Add to beginning
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((n) => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.items = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = unwrapPageContent<any>(action.payload).map((n) => ({
          id: String(n.id),
          title: n.title ?? "",
          message: n.message ?? n.body ?? "",
          type: n.type ?? "general",
          isRead: Boolean(n.isRead ?? n.read),
          timestamp: n.timestamp ?? n.createdAt ?? new Date().toISOString(),
          eventId: n.eventId,
          groupCode: n.groupCode,
          topicTitle: n.topicTitle,
        }));
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Failed to fetch notifications";
      });
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  removeNotification,
  clearAllNotifications,
  setLoading,
  setError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
