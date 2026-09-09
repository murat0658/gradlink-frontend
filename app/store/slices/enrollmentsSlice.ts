import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchEnrollments } from "../thunks";

export interface Enrollment {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  enrolledAt: string;
  status: "ENROLLED" | "WAITLISTED" | "CANCELLED";
}

export interface EnrollmentsState {
  items: Enrollment[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  items: [],
  loading: false,
  error: null,
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    setEnrollments: (state, action: PayloadAction<Enrollment[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    enroll: (state, action: PayloadAction<string>) => {
      const existingEnrollment = state.items.find(
        (e) => e.eventId === action.payload
      );
      if (!existingEnrollment) {
        // Add a placeholder enrollment (will be replaced by API response)
        state.items.push({
          id: `temp-${Date.now()}`,
          eventId: action.payload,
          eventTitle: "Loading...",
          userId: "current-user",
          enrolledAt: new Date().toISOString(),
          status: "ENROLLED",
        });
      }
    },
    unenroll: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((e) => e.eventId !== action.payload);
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
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = (action.payload || []).map((item: any) => ({
          id: String(item.id),
          eventId: String(item.eventId ?? item.event?.id ?? ""),
          eventTitle: item.eventTitle ?? item.event?.title ?? "",
          userId: String(item.userId ?? item.user?.id ?? ""),
          enrolledAt: item.enrolledAt ?? new Date().toISOString(),
          status: item.status ?? "ENROLLED",
        }));
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Failed to fetch enrollments";
      });
  },
});

export const { setEnrollments, enroll, unenroll, setLoading, setError } =
  enrollmentsSlice.actions;

export default enrollmentsSlice.reducer;
