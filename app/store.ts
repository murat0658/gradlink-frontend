import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Placeholder reducer (can be removed later)
const placeholderReducer = (state = {}, action: any) => state;

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
      }
    },
    unenrollFromEvent: (state, action: PayloadAction<string>) => {
      const event = state.find((e) => e.id === action.payload);
      if (event && event.enrolledCount > 0) {
        event.enrolledCount -= 1;
        event.isEnrolled = false;
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

export const selectSubscriptions = (state: RootState) => state.subscriptions;
export const selectJoinedGroups = (state: RootState) => state.joinedGroups;
export const selectDonated = (state: RootState) => state.user.donated;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectToken = (state: RootState) => state.user.token;
export const selectEvents = (state: RootState) => state.events;
export const selectEnrollments = (state: RootState) => state.enrollments;

export const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    subscriptions: subscriptionsSlice.reducer,
    joinedGroups: joinedGroupsSlice.reducer,
    user: userSlice.reducer,
    events: eventsSlice.reducer,
    enrollments: enrollmentsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const API_BASE_URL = "http://192.168.1.102:8080";

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}
