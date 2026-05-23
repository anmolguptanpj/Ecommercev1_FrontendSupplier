import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

/**************** LOGIN ****************/

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password, loginFrom }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/login",
        {
          email,
          password,
          loginFrom,
        },
        {
          withCredentials: true,
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed"
      );
    }
  }
);

/**************** GET CURRENT USER ****************/

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/me", {
        withCredentials: true,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Unauthorized"
      );
    }
  }
);

/**************** LOGOUT ****************/

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post(
        "/logout",
        {},
        {
          withCredentials: true,
        }
      );

      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          "Logout failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    extraDetails: null,

    loading: false,
    authChecking: true,

    error: null,

    isAuthenticated: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    /**************** LOGIN ****************/

    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload.data.user;

        state.extraDetails =
          action.payload.data.extraDetails || null;

        state.isAuthenticated = true;

        state.error = null;
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;

        state.user = null;
        state.extraDetails = null;

        state.isAuthenticated = false;

        state.error = action.payload;
      });

    /**************** GET CURRENT USER ****************/

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.authChecking = true;
      })

      .addCase(
        getCurrentUser.fulfilled,
        (state, action) => {
          state.authChecking = false;

          state.user = action.payload.data.user;

          state.extraDetails =
            action.payload.data.extraDetails || null;

          state.isAuthenticated = true;

          state.error = null;
        }
      )

      .addCase(getCurrentUser.rejected, (state) => {
        state.authChecking = false;

        state.user = null;
        state.extraDetails = null;

        state.isAuthenticated = false;
      });

    /**************** LOGOUT ****************/

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;

        state.user = null;
        state.extraDetails = null;

        state.isAuthenticated = false;

        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;