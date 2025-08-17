import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
