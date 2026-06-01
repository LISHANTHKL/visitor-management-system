import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAdminAnalytics } from '../services/analyticsService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchAdminAnalytics = createAsyncThunk(
  'analytics/fetchAdmin',
  async (filters, { rejectWithValue }) => {
    try {
      return await getAdminAnalytics(filters);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load analytics'));
    }
  }
);

const initialState = {
  cards: {},
  charts: {},
  filters: {
    departments: [],
    employees: []
  },
  isLoading: false,
  error: ''
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cards = action.payload.cards || {};
        state.charts = action.payload.charts || {};
        state.filters = action.payload.filters || initialState.filters;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unable to load analytics';
      });
  }
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
