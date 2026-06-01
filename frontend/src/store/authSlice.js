import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser, getCurrentUser } from '../services/authService.js';

const tokenFromStorage = localStorage.getItem('authToken');

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    return await getCurrentUser();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to load user');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutUser();
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

const initialState = {
  token: tokenFromStorage,
  user: null,
  isAuthenticated: Boolean(tokenFromStorage),
  isLoading: Boolean(tokenFromStorage),
  error: ''
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = '';
      localStorage.removeItem('authToken');
    },
    clearAuthError: (state) => {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('authToken', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Session expired';
        localStorage.removeItem('authToken');
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = '';
        localStorage.removeItem('authToken');
      })
      .addCase(logout.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('authToken');
      });
  }
});

export const { clearAuth, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
