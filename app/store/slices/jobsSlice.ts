import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JobPosting } from "../types";
import { fetchJobs } from "../thunks";
import { unwrapPageContent } from "../../utils/status";

export interface JobsState {
  items: JobPosting[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  items: [],
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<JobPosting[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addJob: (state, action: PayloadAction<JobPosting>) => {
      state.items.unshift(action.payload);
    },
    updateJob: (state, action: PayloadAction<JobPosting>) => {
      const index = state.items.findIndex((j) => j.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeJob: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((j) => j.id !== action.payload);
    },
    markJobApplied: (state, action: PayloadAction<string>) => {
      const job = state.items.find((j) => j.id === action.payload);
      if (job) {
        job.hasApplied = true;
        job.applicationCount = (job.applicationCount ?? 0) + 1;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = unwrapPageContent<JobPosting>(action.payload);
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Failed to fetch jobs";
      });
  },
});

export const {
  setJobs,
  addJob,
  updateJob,
  removeJob,
  markJobApplied,
  setLoading,
  setError,
} = jobsSlice.actions;

export default jobsSlice.reducer;
