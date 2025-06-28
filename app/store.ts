import {
  configureStore,
  createSlice,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { NotificationService } from "./services/NotificationService";

// Placeholder reducer (can be removed later)
const placeholderReducer = (state = {}, action: any) => state;

// Notification interface
export interface Notification {
  id: string;
  type: "event" | "general";
  title: string;
  message: string;
  eventId?: string;
  timestamp: string;
  isRead: boolean;
}

// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location: string;
  capacity: number;
  enrolledCount: number;
  groupCode: string;
  groupName: string;
  isEnrolled?: boolean;
}

// Type for a threaded answer (copied from topic screen)
export interface ThreadAnswer {
  id: string;
  author: string;
  content: string;
  date: string;
  replies: ThreadAnswer[];
  upvotes: number;
  collapsed?: boolean;
}

// Slice for notifications
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [] as Notification[],
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.unshift(action.payload); // Add to beginning
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.find((n) => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      return state.filter((n) => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      return [];
    },
  },
});

// Slice for events
const eventsSlice = createSlice({
  name: "events",
  initialState: [] as Event[],
  reducers: {
    addEvent: (state, action: PayloadAction<Event>) => {
      state.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      return state.filter((e) => e.id !== action.payload);
    },
    enrollInEvent: (state, action: PayloadAction<string>) => {
      const event = state.find((e) => e.id === action.payload);
      if (event && event.enrolledCount < event.capacity) {
        event.enrolledCount += 1;
        event.isEnrolled = true;

        // Schedule push notification for the event
        NotificationService.scheduleEventNotification(event).catch((error) => {
          console.log("Error scheduling push notification:", error);
        });
      }
    },
    unenrollFromEvent: (state, action: PayloadAction<string>) => {
      const event = state.find((e) => e.id === action.payload);
      if (event && event.enrolledCount > 0) {
        event.enrolledCount -= 1;
        event.isEnrolled = false;

        // Cancel push notifications for the event
        NotificationService.cancelEventNotifications(event.id).catch(
          (error) => {
            console.log("Error canceling push notifications:", error);
          }
        );
      }
    },
  },
});

// Slice for user enrollments
const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState: [] as string[], // array of event IDs
  reducers: {
    enroll: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) state.push(action.payload);
    },
    unenroll: (state, action: PayloadAction<string>) => {
      return state.filter((eventId) => eventId !== action.payload);
    },
  },
});

// Slice for group subscriptions
const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState: [] as string[], // array of group codes
  reducers: {
    subscribe: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) state.push(action.payload);
    },
    unsubscribe: (state, action: PayloadAction<string>) => {
      return state.filter((code) => code !== action.payload);
    },
  },
});

// Slice for joined groups
const joinedGroupsSlice = createSlice({
  name: "joinedGroups",
  initialState: [] as string[], // array of group codes
  reducers: {
    joinGroup: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) state.push(action.payload);
    },
    leaveGroup: (state, action: PayloadAction<string>) => {
      return state.filter((code) => code !== action.payload);
    },
  },
});

// User slice for donation value
const userSlice = createSlice({
  name: "user",
  initialState: {
    donated: 0,
    isAuthenticated: false,
    token: null as string | null,
  },
  reducers: {
    incrementDonation: (state, action: PayloadAction<number>) => {
      state.donated += action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
  },
});

// Slice for topic answers (session-persistent only)
const topicAnswersSlice = createSlice({
  name: "topicAnswers",
  initialState: {} as Record<string, ThreadAnswer>, // key: `${groupCode}:${topicTitle}`
  reducers: {
    setTopicAnswers: (
      state,
      action: PayloadAction<{ key: string; answers: ThreadAnswer }>
    ) => {
      state[action.payload.key] = action.payload.answers;
    },
    updateTopicAnswers: (
      state,
      action: PayloadAction<{
        key: string;
        updater: (prev: ThreadAnswer) => ThreadAnswer;
      }>
    ) => {
      const prev = state[action.payload.key];
      if (prev) {
        state[action.payload.key] = action.payload.updater(prev);
      }
    },
    clearTopicAnswers: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { subscribe, unsubscribe } = subscriptionsSlice.actions;
export const { joinGroup, leaveGroup } = joinedGroupsSlice.actions;
export const { incrementDonation, setAuthenticated, setToken } =
  userSlice.actions;
export const {
  addEvent,
  updateEvent,
  removeEvent,
  enrollInEvent,
  unenrollFromEvent,
} = eventsSlice.actions;
export const { enroll, unenroll } = enrollmentsSlice.actions;
export const {
  addNotification,
  markAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions;
export const { setTopicAnswers, updateTopicAnswers, clearTopicAnswers } =
  topicAnswersSlice.actions;

export const selectSubscriptions = (state: RootState) => state.subscriptions;
export const selectJoinedGroups = (state: RootState) => state.joinedGroups;
export const selectDonated = (state: RootState) => state.user.donated;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectToken = (state: RootState) => state.user.token;
export const selectEvents = (state: RootState) => state.events;
export const selectEnrollments = (state: RootState) => state.enrollments;
export const selectNotifications = (state: RootState) => state.notifications;
export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n) => !n.isRead)
);
export const selectTopicAnswers = (state: RootState, key: string) =>
  state.topicAnswers[key];

export const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    subscriptions: subscriptionsSlice.reducer,
    joinedGroups: joinedGroupsSlice.reducer,
    user: userSlice.reducer,
    events: eventsSlice.reducer,
    enrollments: enrollmentsSlice.reducer,
    notifications: notificationsSlice.reducer,
    topicAnswers: topicAnswersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const API_BASE_URL = "http://192.168.1.101:8080";

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

// Helper function to check if event is coming up soon (within 24 hours)
export function isEventComingSoon(event: Event): boolean {
  const now = new Date();
  const eventTime = new Date(event.startTime);
  const diffHours = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 24;
}

// Helper function to generate notification for upcoming event
export function createEventNotification(event: Event): Notification {
  const eventTime = new Date(event.startTime);
  const hoursUntilEvent = Math.floor(
    (eventTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  );

  return {
    id: `event-${event.id}-${Date.now()}`,
    type: "event",
    title: "Upcoming Event",
    message: `${event.title} starts in ${hoursUntilEvent} hour${
      hoursUntilEvent !== 1 ? "s" : ""
    }!`,
    eventId: event.id,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
}
