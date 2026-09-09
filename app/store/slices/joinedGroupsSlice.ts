import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchJoinedGroups } from "../thunks";

export interface JoinedGroup {
  id: string;
  groupCode: string;
  groupName: string;
  joinedAt: string;
  role: "USER" | "GROUP_ADMIN" | "FULL_ADMIN";
}

export interface JoinedGroupsState {
  items: JoinedGroup[];
  loading: boolean;
  error: string | null;
}

const initialState: JoinedGroupsState = {
  items: [],
  loading: false,
  error: null,
};

const joinedGroupsSlice = createSlice({
  name: "joinedGroups",
  initialState,
  reducers: {
    setJoinedGroups: (state, action: PayloadAction<JoinedGroup[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    joinGroup: (state, action: PayloadAction<string>) => {
      const existingMembership = state.items.find(
        (group) => group.groupCode === action.payload
      );
      if (!existingMembership) {
        // Add a placeholder membership (will be replaced by API response)
        state.items.push({
          id: `temp-${Date.now()}`,
          groupCode: action.payload,
          groupName: action.payload,
          joinedAt: new Date().toISOString(),
          role: "USER",
        });
      }
    },
    leaveGroup: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (group) => group.groupCode !== action.payload
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
    builder
      .addCase(fetchJoinedGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJoinedGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = (action.payload || []).map((item: any) => ({
          id: String(item.id),
          groupCode: item.groupCode ?? item.group?.code ?? "",
          groupName: item.groupName ?? item.group?.university ?? item.groupCode ?? "",
          joinedAt: item.joinedAt ?? new Date().toISOString(),
          role: item.role ?? "USER",
        }));
      })
      .addCase(fetchJoinedGroups.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Failed to fetch joined groups";
      });
  },
});

export const { setJoinedGroups, joinGroup, leaveGroup, setLoading, setError } =
  joinedGroupsSlice.actions;

export default joinedGroupsSlice.reducer;
