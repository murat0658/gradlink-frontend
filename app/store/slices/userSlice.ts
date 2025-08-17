import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  donated: number;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: UserState = {
  donated: 0,
  isAuthenticated: false,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    incrementDonation: (state, action: PayloadAction<number>) => {
      state.donated += action.payload;
    },
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

export const { incrementDonation, setAuthenticated, setToken, logout } =
  userSlice.actions;
export default userSlice.reducer;
