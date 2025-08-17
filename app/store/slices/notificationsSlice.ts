import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../types";

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
