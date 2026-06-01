import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAdminLogs } from '../services/adminLogsService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchAdminLogs = createAsyncThunk('adminLogs/fetch', async (filters, { rejectWithValue }) => {
  try {
    return await getAdminLogs(filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load logs'));
  }
});

const initialState = {
  logs: [],
  isLoading: false,
  error: ''
};

const adminLogsSlice = createSlice({
  name: 'adminLogs',
  initialState,
  reducers: {
    clearAdminLogsError: (state) => {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminLogs.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchAdminLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.logs || [];
      })
      .addCase(fetchAdminLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unable to load logs';
      });
  }
});

export const { clearAdminLogsError } = adminLogsSlice.actions;
export default adminLogsSlice.reducer;
