import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser, UserRole } from "./auth.types";

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<AuthUser>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload;
      state.role = action.payload.role;
    },
    sessionResolved: (state) => {
      state.isLoading = false;
    },
    setRole: (state, action: PayloadAction<UserRole | null>) => {
      state.role = action.payload;
    },
    signOut: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.role = null;
    },
  },
});

export const { setAuthenticated, sessionResolved, setRole, signOut } =
  authSlice.actions;
export default authSlice.reducer;
