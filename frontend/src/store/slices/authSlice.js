import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser, getMe, logoutUser } from "../../services/auth.api.js";

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await loginUser(data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await registerUser(data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await getMe();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutUser();
  localStorage.removeItem("token");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload.user; })
      .addCase(logout.fulfilled, (state) => { state.user = null; state.token = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
