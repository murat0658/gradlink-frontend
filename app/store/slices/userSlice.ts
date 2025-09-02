import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { setAuthenticated, setToken, logout } = userSlice.actions;
export default userSlice.reducer;