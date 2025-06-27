import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

// Placeholder reducer (can be removed later)
const placeholderReducer = (state = {}, action: any) => state;

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
export const { incrementDonation, setAuthenticated, setToken } =
  userSlice.actions;
export const selectSubscriptions = (state: RootState) => state.subscriptions;
export const selectDonated = (state: RootState) => state.user.donated;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectToken = (state: RootState) => state.user.token;

export const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    subscriptions: subscriptionsSlice.reducer,
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const API_BASE_URL = "http://192.168.1.104:8080";

export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
}
