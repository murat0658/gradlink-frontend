import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Subscription {
  id: string;
  groupCode: string;
  groupName: string;
  subscribedAt: string;
}

export interface SubscriptionsState {
  items: Subscription[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  items: [],
  loading: false,
  error: null,
};

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    subscribe: (state, action: PayloadAction<string>) => {
      const existingSubscription = state.items.find(
        (sub) => sub.groupCode === action.payload
      );
      if (!existingSubscription) {
        // Add a placeholder subscription (will be replaced by API response)
        state.items.push({
          id: `temp-${Date.now()}`,
          groupCode: action.payload,
          groupName: action.payload,
          subscribedAt: new Date().toISOString(),
        });
      }
    },
    unsubscribe: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (sub) => sub.groupCode !== action.payload
      );
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
  setSubscriptions,
  subscribe,
  unsubscribe,
  setLoading,
  setError,
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
