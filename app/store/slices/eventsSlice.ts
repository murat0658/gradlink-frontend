import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppEvent } from "../types";

export interface EventsState {
  items: AppEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<AppEvent[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addEvent: (state, action: PayloadAction<AppEvent>) => {
      state.items.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<AppEvent>) => {
      const index = state.items.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
    enrollInEvent: (state, action: PayloadAction<string>) => {
      const event = state.items.find((e) => e.id === action.payload);
      if (event && event.enrolledCount < event.capacity) {
        event.enrolledCount += 1;
        event.isEnrolled = true;
      }
    },
    unenrollFromEvent: (state, action: PayloadAction<string>) => {
      const event = state.items.find((e) => e.id === action.payload);
      if (event && event.enrolledCount > 0) {
        event.enrolledCount -= 1;
        event.isEnrolled = false;
      }
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
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  enrollInEvent,
  unenrollFromEvent,
  setLoading,
  setError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
