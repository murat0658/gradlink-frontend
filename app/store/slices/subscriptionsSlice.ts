import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  subscribeToGroupAsync,
  unsubscribeFromGroupAsync,
  fetchSubscriptions,
} from "../thunks";

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
  extraReducers: (builder) => {
    // Handle fetchSubscriptions
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        console.log("🔄 fetchSubscriptions.pending - about to fetch from API");
        console.log("Current subscriptions before fetch:", state.items);
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        console.log("🔄 fetchSubscriptions.fulfilled:");
        console.log("API response:", action.payload);
        console.log("Current local subscriptions:", state.items);

        // Merge API subscriptions with local subscriptions
        // Keep local subscriptions that aren't in the API response
        const apiSubscriptions = action.payload || [];
        const localSubscriptions = state.items.filter(
          (local) =>
            !apiSubscriptions.some((api) => api.groupCode === local.groupCode)
        );

        state.items = [...apiSubscriptions, ...localSubscriptions];
        console.log("Merged subscriptions:", state.items);
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch subscriptions";
      });

    // Handle subscribeToGroupAsync
    builder
      .addCase(subscribeToGroupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeToGroupAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { groupCode, response } = action.payload;

        console.log("🔄 subscribeToGroupAsync.fulfilled:", {
          groupCode,
          response,
        });
        console.log("Current subscriptions before update:", state.items);

        // Check if subscription already exists
        const existingSubscription = state.items.find(
          (sub) => sub.groupCode === groupCode
        );

        if (!existingSubscription) {
          // Add the new subscription from API response or create a placeholder
          const newSubscription = {
            id: response?.id || `api-${Date.now()}`,
            groupCode: groupCode,
            groupName: response?.groupName || groupCode,
            subscribedAt: response?.subscribedAt || new Date().toISOString(),
          };
          state.items.push(newSubscription);
          console.log("✅ Added new subscription:", newSubscription);
        } else {
          console.log("⚠️ Subscription already exists:", existingSubscription);
        }

        // Force a state update to ensure the UI reflects the change
        console.log("🔄 Forcing state update - final items:", state.items);

        console.log("Final subscriptions after update:", state.items);
        state.error = null;
      })
      .addCase(subscribeToGroupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to subscribe to group";
      });

    // Handle unsubscribeFromGroupAsync
    builder
      .addCase(unsubscribeFromGroupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unsubscribeFromGroupAsync.fulfilled, (state, action) => {
        state.loading = false;
        const groupCode = action.meta.arg; // The groupCode passed to the thunk

        console.log("🔄 unsubscribeFromGroupAsync.fulfilled:", {
          groupCode,
          currentItems: state.items,
        });

        // Remove the subscription
        const beforeCount = state.items.length;
        state.items = state.items.filter((sub) => sub.groupCode !== groupCode);
        const afterCount = state.items.length;

        console.log("🔄 Subscription removed:", {
          beforeCount,
          afterCount,
          removed: beforeCount > afterCount,
        });

        state.error = null;
      })
      .addCase(unsubscribeFromGroupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to unsubscribe from group";
      });
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
