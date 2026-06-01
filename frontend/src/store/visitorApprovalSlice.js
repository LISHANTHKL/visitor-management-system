import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  approveAdminVisitorRequest,
  getAdminVisitorRequestById,
  getAdminVisitorRequests,
  rejectAdminVisitorRequest
} from '../services/visitorApprovalService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchRequests = createAsyncThunk('visitorApproval/fetchRequests', async (filters, { rejectWithValue }) => {
  try {
    return await getAdminVisitorRequests(filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load visitor requests'));
  }
});

export const fetchRequest = createAsyncThunk('visitorApproval/fetchRequest', async (requestId, { rejectWithValue }) => {
  try {
    return await getAdminVisitorRequestById(requestId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load visitor request'));
  }
});

export const approveRequest = createAsyncThunk(
  'visitorApproval/approveRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      return await approveAdminVisitorRequest(requestId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to approve visitor request'));
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'visitorApproval/rejectRequest',
  async ({ requestId, reason }, { rejectWithValue }) => {
    try {
      return await rejectAdminVisitorRequest(requestId, reason);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to reject visitor request'));
    }
  }
);

const initialState = {
  requests: [],
  selectedRequest: null,
  isLoading: false,
  isDetailsLoading: false,
  isMutating: false,
  actionRequestId: '',
  error: '',
  success: ''
};

const upsertRequest = (requests, request) => {
  const existingIndex = requests.findIndex((item) => item._id === request._id);

  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.unshift(request);
  }
};

const visitorApprovalSlice = createSlice({
  name: 'visitorApproval',
  initialState,
  reducers: {
    clearVisitorApprovalMessages: (state) => {
      state.error = '';
      state.success = '';
    },
    clearSelectedVisitorRequest: (state) => {
      state.selectedRequest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.requests || [];
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unable to load visitor requests';
      })
      .addCase(fetchRequest.pending, (state, action) => {
        state.isDetailsLoading = true;
        state.actionRequestId = action.meta.arg;
        state.error = '';
      })
      .addCase(fetchRequest.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.actionRequestId = '';
        state.selectedRequest = action.payload.request;
      })
      .addCase(fetchRequest.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.actionRequestId = '';
        state.error = action.payload || 'Unable to load visitor request';
      })
      .addCase(approveRequest.pending, (state, action) => {
        state.isMutating = true;
        state.actionRequestId = action.meta.arg;
        state.error = '';
        state.success = '';
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.isMutating = false;
        state.actionRequestId = '';
        upsertRequest(state.requests, action.payload.request);
        state.selectedRequest = action.payload.request;
        state.success = 'Visitor request approved successfully';
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.isMutating = false;
        state.actionRequestId = '';
        state.error = action.payload || 'Unable to approve visitor request';
      })
      .addCase(rejectRequest.pending, (state, action) => {
        state.isMutating = true;
        state.actionRequestId = action.meta.arg.requestId;
        state.error = '';
        state.success = '';
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.isMutating = false;
        state.actionRequestId = '';
        upsertRequest(state.requests, action.payload.request);
        state.selectedRequest = action.payload.request;
        state.success = 'Visitor request rejected successfully';
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.isMutating = false;
        state.actionRequestId = '';
        state.error = action.payload || 'Unable to reject visitor request';
      });
  }
});

export const { clearSelectedVisitorRequest, clearVisitorApprovalMessages } = visitorApprovalSlice.actions;
export default visitorApprovalSlice.reducer;
