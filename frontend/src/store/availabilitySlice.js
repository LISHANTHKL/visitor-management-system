import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getEmployeeAvailability, getMyAvailability } from '../services/availabilityService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchEmployeeAvailability = createAsyncThunk(
  'availability/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployeeAvailability();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load employee availability'));
    }
  }
);

export const fetchMyAvailability = createAsyncThunk(
  'availability/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyAvailability();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to load employee status'));
    }
  }
);

const initialState = {
  statuses: [],
  availableEmployees: [],
  occupiedEmployees: [],
  summary: {
    available: 0,
    occupied: 0
  },
  myStatus: null,
  isLoading: false,
  isLoadingMine: false,
  error: ''
};

const rebuildAvailabilityLists = (state) => {
  state.availableEmployees = state.statuses.filter((employee) => employee.status === 'available');
  state.occupiedEmployees = state.statuses.filter((employee) => employee.status === 'occupied');
  state.summary = {
    available: state.availableEmployees.length,
    occupied: state.occupiedEmployees.length
  };
};

const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    clearAvailabilityError: (state) => {
      state.error = '';
    },
    applyEmployeeStatusUpdate: (state, action) => {
      const updatedStatus = action.payload;

      if (!updatedStatus?.employeeId) return;

      const employeeId = String(updatedStatus.employeeId);
      const existingIndex = state.statuses.findIndex((status) => String(status.employeeId) === employeeId);

      if (existingIndex >= 0) {
        state.statuses[existingIndex] = {
          ...state.statuses[existingIndex],
          ...updatedStatus
        };
      } else {
        state.statuses.push(updatedStatus);
      }

      if (String(state.myStatus?.employeeId || '') === employeeId) {
        state.myStatus = {
          ...state.myStatus,
          ...updatedStatus
        };
      }

      rebuildAvailabilityLists(state);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchEmployeeAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statuses = action.payload.statuses || [];
        state.availableEmployees = action.payload.availableEmployees || [];
        state.occupiedEmployees = action.payload.occupiedEmployees || [];
        state.summary = action.payload.summary || initialState.summary;
      })
      .addCase(fetchEmployeeAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unable to load employee availability';
      })
      .addCase(fetchMyAvailability.pending, (state) => {
        state.isLoadingMine = true;
        state.error = '';
      })
      .addCase(fetchMyAvailability.fulfilled, (state, action) => {
        state.isLoadingMine = false;
        state.myStatus = action.payload.status;
      })
      .addCase(fetchMyAvailability.rejected, (state, action) => {
        state.isLoadingMine = false;
        state.error = action.payload || 'Unable to load employee status';
      });
  }
});

export const { applyEmployeeStatusUpdate, clearAvailabilityError } = availabilitySlice.actions;
export default availabilitySlice.reducer;
