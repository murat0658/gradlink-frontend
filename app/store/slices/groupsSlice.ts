import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchGroups } from "../thunks";

export interface Group {
  id: string;
  code: string;
  university: string;
  description: string;
  members: number;
  icon: string;
  color: string;
  founded: number;
  location: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupsState {
  items: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  items: [],
  loading: false,
  error: null,
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.items.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const index = state.items.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((g) => g.id !== action.payload);
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
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Failed to fetch groups";
      });
  },
});

export const {
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  setLoading,
  setError,
} = groupsSlice.actions;

export default groupsSlice.reducer;
