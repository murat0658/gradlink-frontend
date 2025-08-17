import {
  configureStore,
  createSlice,
  PayloadAction,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { NotificationService } from "./services/NotificationService";
import { apiService } from "./services/ApiService";

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
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      return action.payload;
    },
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(markNotificationAsReadAsync.fulfilled, (state, action) => {
        const notification = state.find(
          (n) => n.id === action.payload.notificationId
        );
        if (notification) {
          notification.isRead = true;
        }
      });
  },
});

// Slice for events
const eventsSlice = createSlice({
  name: "events",
  initialState: [] as Event[],
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      return action.payload;
    },
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(createEventAsync.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(enrollInEventAsync.fulfilled, (state, action) => {
        const event = state.find((e) => e.id === action.payload.eventId);
        if (event) {
          event.enrolledCount += 1;
          event.isEnrolled = true;
        }
      })
      .addCase(unenrollFromEventAsync.fulfilled, (state, action) => {
        const event = state.find((e) => e.id === action.payload);
        if (event && event.enrolledCount > 0) {
          event.enrolledCount -= 1;
          event.isEnrolled = false;
        }
      });
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
    setSubscriptions: (state, action: PayloadAction<string[]>) => {
      return action.payload;
    },
    subscribe: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) state.push(action.payload);
    },
    unsubscribe: (state, action: PayloadAction<string>) => {
      return state.filter((code) => code !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        return action.payload.map((sub: any) => sub.groupCode);
      })
      .addCase(subscribeToGroupAsync.fulfilled, (state, action) => {
        if (!state.includes(action.payload.groupCode)) {
          state.push(action.payload.groupCode);
        }
      })
      .addCase(unsubscribeFromGroupAsync.fulfilled, (state, action) => {
        return state.filter((code) => code !== action.payload);
      });
  },
});

// Groups slice
const groupsSlice = createSlice({
  name: "groups",
  initialState: [] as any[],
  reducers: {
    setGroups: (state, action: PayloadAction<any[]>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGroups.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

// Slice for joined groups
const joinedGroupsSlice = createSlice({
  name: "joinedGroups",
  initialState: [] as string[], // array of group code
  reducers: {
    setJoinedGroups: (state, action: PayloadAction<string[]>) => {
      return action.payload;
    },
    joinGroup: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) state.push(action.payload);
    },
    leaveGroup: (state, action: PayloadAction<string>) => {
      return state.filter((code) => code !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinGroupAsync.fulfilled, (state, action) => {
        if (!state.includes(action.payload.groupCode)) {
          state.push(action.payload.groupCode);
        }
      })
      .addCase(leaveGroupAsync.fulfilled, (state, action) => {
        return state.filter((code) => code !== action.payload);
      });
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

export const { subscribe, unsubscribe, setSubscriptions } =
  subscriptionsSlice.actions;
export const { joinGroup, leaveGroup, setJoinedGroups } =
  joinedGroupsSlice.actions;
export const { incrementDonation, setAuthenticated, setToken } =
  userSlice.actions;
export const {
  addEvent,
  updateEvent,
  removeEvent,
  enrollInEvent,
  unenrollFromEvent,
  setEvents,
} = eventsSlice.actions;
export const { enroll, unenroll } = enrollmentsSlice.actions;
export const {
  addNotification,
  markAsRead,
  removeNotification,
  clearAllNotifications,
  setNotifications,
} = notificationsSlice.actions;
export const { setTopicAnswers, updateTopicAnswers, clearTopicAnswers } =
  topicAnswersSlice.actions;
export const { setGroups } = groupsSlice.actions;

// Async thunks for API operations
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params?: { page?: number; size?: number; groupCode?: string }) => {
    const response = await apiService.getEvents(params);
    return response;
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
    const response = await apiService.createEvent(eventData);
    return response;
  }
);

export const enrollInEventAsync = createAsyncThunk(
  "events/enrollInEvent",
  async (eventId: string) => {
    const response = await apiService.enrollInEvent(eventId);
    return { eventId, response };
  }
);

export const unenrollFromEventAsync = createAsyncThunk(
  "events/unenrollFromEvent",
  async (eventId: string) => {
    await apiService.unenrollFromEvent(eventId);
    return eventId;
  }
);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params?: { page?: number; size?: number; isRead?: boolean }) => {
    const response = await apiService.getNotifications(params);
    return response;
  }
);

export const markNotificationAsReadAsync = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string) => {
    const response = await apiService.markNotificationAsRead(notificationId);
    return { notificationId, response };
  }
);

export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (params?: { page?: number; size?: number; search?: string }) => {
    const response = await apiService.getGroups(params);
    return response;
  }
);

export const joinGroupAsync = createAsyncThunk(
  "groups/joinGroup",
  async (groupCode: string) => {
    const response = await apiService.joinGroup(groupCode);
    return { groupCode, response };
  }
);

export const leaveGroupAsync = createAsyncThunk(
  "groups/leaveGroup",
  async (groupCode: string) => {
    await apiService.leaveGroup(groupCode);
    return groupCode;
  }
);

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async () => {
    const response = await apiService.getSubscriptions();
    return response;
  }
);

export const subscribeToGroupAsync = createAsyncThunk(
  "subscriptions/subscribeToGroup",
  async (groupCode: string) => {
    const response = await apiService.subscribeToGroup(groupCode);
    return { groupCode, response };
  }
);

export const unsubscribeFromGroupAsync = createAsyncThunk(
  "subscriptions/unsubscribeFromGroup",
  async (groupCode: string) => {
    await apiService.unsubscribeFromGroup(groupCode);
    return groupCode;
  }
);

export const selectSubscriptions = (state: RootState) => state.subscriptions;
export const selectJoinedGroups = (state: RootState) => state.joinedGroups;
export const selectGroups = (state: RootState) => state.groups;
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
    groups: groupsSlice.reducer,
    user: userSlice.reducer,
    events: eventsSlice.reducer,
    enrollments: enrollmentsSlice.reducer,
    notifications: notificationsSlice.reducer,
    topicAnswers: topicAnswersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const API_BASE_URL = "http://192.168.1.100:8080";

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
