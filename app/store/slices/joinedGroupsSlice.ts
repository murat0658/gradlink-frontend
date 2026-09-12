import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchJoinedGroups, joinGroupAsync, leaveGroupAsync } from "../thunks";

export type MembershipStatus = "ACTIVE" | "PENDING";

export interface JoinedGroup {
  id: string;
  groupCode: string;
  groupName: string;
  joinedAt: string;
  role: "USER" | "GROUP_ADMIN" | "FULL_ADMIN";
  status: MembershipStatus;
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

function mapMembership(item: any): JoinedGroup {
  const statusRaw = String(item.status || "ACTIVE").toUpperCase();
  const status: MembershipStatus =
    statusRaw === "PENDING" ? "PENDING" : "ACTIVE";
  return {
    id: String(item.id),
    groupCode: item.groupCode ?? item.group?.code ?? "",
    groupName:
      item.groupName ?? item.group?.university ?? item.groupCode ?? "",
    joinedAt: item.joinedAt ?? new Date().toISOString(),
    role: item.role ?? "USER",
    status,
  };
}

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
        // Optimistic: join is an application until admin approves.
        state.items.push({
          id: `temp-${Date.now()}`,
          groupCode: action.payload,
          groupName: action.payload,
          joinedAt: new Date().toISOString(),
          role: "USER",
          status: "PENDING",
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
        state.items = (action.payload || []).map(mapMembership);
      })
      .addCase(fetchJoinedGroups.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Failed to fetch joined groups";
      })
      .addCase(joinGroupAsync.fulfilled, (state, action) => {
        const code = action.payload.groupCode;
        const existing = state.items.find((g) => g.groupCode === code);
        if (existing) {
          existing.status = "PENDING";
        } else {
          state.items.push({
            id: `pending-${code}`,
            groupCode: code,
            groupName: code,
            joinedAt: new Date().toISOString(),
            role: "USER",
            status: "PENDING",
          });
        }
      })
      .addCase(leaveGroupAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.groupCode !== action.payload);
      });
  },
});

export const { setJoinedGroups, joinGroup, leaveGroup, setLoading, setError } =
  joinedGroupsSlice.actions;

export default joinedGroupsSlice.reducer;
