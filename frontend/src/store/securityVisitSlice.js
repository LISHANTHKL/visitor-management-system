import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSecurityVisitLogs } from '../services/securityQrService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchSecurityVisitLogs = createAsyncThunk(
  'securityVisit/fetchLogs',
  async (filters, { rejectWithValue }) => {
    try {
      return await getSecurityVisitLogs(filters);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load visit logs'));
    }
  }
);

const initialState = {
  logs: [],
  isLoading: false,
  error: ''
};

const securityVisitSlice = createSlice({
  name: 'securityVisit',
  initialState,
  reducers: {
    clearSecurityVisitError: (state) => {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSecurityVisitLogs.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchSecurityVisitLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.logs || [];
      })
      .addCase(fetchSecurityVisitLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unable to load visit logs';
      });
  }
});

export const { clearSecurityVisitError } = securityVisitSlice.actions;
export default securityVisitSlice.reducer;
