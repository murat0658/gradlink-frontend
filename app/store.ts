import { configureStore } from "@reduxjs/toolkit";
import { NotificationService } from "./services/NotificationService";

// Import slices
import userReducer from "./store/slices/userSlice";
import eventsReducer from "./store/slices/eventsSlice";
import groupsReducer from "./store/slices/groupsSlice";
import notificationsReducer from "./store/slices/notificationsSlice";
import subscriptionsReducer from "./store/slices/subscriptionsSlice";
import joinedGroupsReducer from "./store/slices/joinedGroupsSlice";
import enrollmentsReducer from "./store/slices/enrollmentsSlice";
import topicAnswersReducer from "./store/slices/topicAnswersSlice";

// Import selectors
export * from "./store/selectors";

// Import thunks
export * from "./store/thunks";

// Import slice actions for backward compatibility
export * from "./store/slices";

// Import types
export * from "./store/types";

// Import utilities
export * from "./store/utils";

// Helper function to get user ID from JWT token
export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || null;
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    return null;
  }
};


// Configure the store
export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventsReducer,
    groups: groupsReducer,
    notifications: notificationsReducer,
    subscriptions: subscriptionsReducer,
    joinedGroups: joinedGroupsReducer,
    enrollments: enrollmentsReducer,
    topicAnswers: topicAnswersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store
export default store;
