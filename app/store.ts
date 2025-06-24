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

export const { subscribe, unsubscribe } = subscriptionsSlice.actions;
export const selectSubscriptions = (state: RootState) => state.subscriptions;

export const store = configureStore({
  reducer: {
    placeholder: placeholderReducer,
    subscriptions: subscriptionsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
