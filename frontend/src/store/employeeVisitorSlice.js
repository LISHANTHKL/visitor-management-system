import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getEmployeeVisitorRequests,
  getTodayEmployeeVisitors,
  getUpcomingEmployeeVisitors
} from '../services/employeeVisitorService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchEmployeeVisitorRequests = createAsyncThunk(
  'employeeVisitor/fetchRequests',
  async (filters, { rejectWithValue }) => {
    try {
      return await getEmployeeVisitorRequests(filters);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load visitor request history'));
    }
  }
);

export const fetchEmployeeVisitorSummary = createAsyncThunk(
  'employeeVisitor/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployeeVisitorRequests();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load visitor dashboard summary'));
    }
  }
);

export const fetchTodayEmployeeVisitors = createAsyncThunk(
  'employeeVisitor/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      return await getTodayEmployeeVisitors();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Unable to load today's visitors"));
    }
  }
);

export const fetchUpcomingEmployeeVisitors = createAsyncThunk(
  'employeeVisitor/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      return await getUpcomingEmployeeVisitors();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load upcoming visitors'));
    }
  }
);

const initialState = {
  requests: [],
  summaryRequests: [],
  todayVisitors: [],
  upcomingVisitors: [],
  selectedRequest: null,
  isLoadingRequests: false,
  isLoadingSummary: false,
  isLoadingToday: false,
  isLoadingUpcoming: false,
  error: ''
};

const employeeVisitorSlice = createSlice({
  name: 'employeeVisitor',
  initialState,
  reducers: {
    clearEmployeeVisitorError: (state) => {
      state.error = '';
    },
    selectEmployeeVisitorRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    clearSelectedEmployeeVisitorRequest: (state) => {
      state.selectedRequest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeVisitorRequests.pending, (state) => {
        state.isLoadingRequests = true;
        state.error = '';
      })
      .addCase(fetchEmployeeVisitorRequests.fulfilled, (state, action) => {
        state.isLoadingRequests = false;
        state.requests = action.payload.requests || [];
      })
      .addCase(fetchEmployeeVisitorRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        state.error = action.payload || 'Unable to load visitor request history';
      })
      .addCase(fetchEmployeeVisitorSummary.pending, (state) => {
        state.isLoadingSummary = true;
        state.error = '';
      })
      .addCase(fetchEmployeeVisitorSummary.fulfilled, (state, action) => {
        state.isLoadingSummary = false;
        state.summaryRequests = action.payload.requests || [];
      })
      .addCase(fetchEmployeeVisitorSummary.rejected, (state, action) => {
        state.isLoadingSummary = false;
        state.error = action.payload || 'Unable to load visitor dashboard summary';
      })
      .addCase(fetchTodayEmployeeVisitors.pending, (state) => {
        state.isLoadingToday = true;
        state.error = '';
      })
      .addCase(fetchTodayEmployeeVisitors.fulfilled, (state, action) => {
        state.isLoadingToday = false;
        state.todayVisitors = action.payload.requests || [];
      })
      .addCase(fetchTodayEmployeeVisitors.rejected, (state, action) => {
        state.isLoadingToday = false;
        state.error = action.payload || "Unable to load today's visitors";
      })
      .addCase(fetchUpcomingEmployeeVisitors.pending, (state) => {
        state.isLoadingUpcoming = true;
        state.error = '';
      })
      .addCase(fetchUpcomingEmployeeVisitors.fulfilled, (state, action) => {
        state.isLoadingUpcoming = false;
        state.upcomingVisitors = action.payload.requests || [];
      })
      .addCase(fetchUpcomingEmployeeVisitors.rejected, (state, action) => {
        state.isLoadingUpcoming = false;
        state.error = action.payload || 'Unable to load upcoming visitors';
      });
  }
});

export const {
  clearEmployeeVisitorError,
  clearSelectedEmployeeVisitorRequest,
  selectEmployeeVisitorRequest
} = employeeVisitorSlice.actions;
export default employeeVisitorSlice.reducer;
