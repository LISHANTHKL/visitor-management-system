import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUser,
  deleteUserById,
  getUserById,
  getUsers,
  resetPasswordById,
  updateUserById,
  updateUserStatus
} from '../services/userService.js';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (filters, { rejectWithValue }) => {
  try {
    return await getUsers(filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load users'));
  }
});

export const createManagedUser = createAsyncThunk('users/createManagedUser', async (payload, { rejectWithValue }) => {
  try {
    return await createUser(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to create user'));
  }
});

export const getUserDetails = createAsyncThunk('users/getUserDetails', async (userId, { rejectWithValue }) => {
  try {
    return await getUserById(userId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to load user details'));
  }
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ userId, payload }, { rejectWithValue }) => {
  try {
    return await updateUserById(userId, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to update user'));
  }
});

export const updateManagedUserStatus = createAsyncThunk(
  'users/updateManagedUserStatus',
  async ({ userId, active }, { rejectWithValue }) => {
    try {
      return await updateUserStatus(userId, active);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to update user status'));
    }
  }
);

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    return await deleteUserById(userId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to delete user'));
  }
});

export const resetUserPassword = createAsyncThunk(
  'users/resetUserPassword',
  async ({ userId, password }, { rejectWithValue }) => {
    try {
      await resetPasswordById(userId, password);
      return { userId };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Unable to reset password'));
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  isDetailsLoading: false,
  isMutating: false,
  actionUserId: '',
  error: '',
  success: ''
};

const upsertUser = (users, user) => {
  const existingIndex = users.findIndex((item) => item._id === user._id);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.unshift(user);
  }
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearUserMessages: (state) => {
      state.error = '';
      state.success = '';
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Unable to load users';
      })
      .addCase(createManagedUser.pending, (state) => {
        state.isMutating = true;
        state.error = '';
        state.success = '';
      })
      .addCase(createManagedUser.fulfilled, (state, action) => {
        state.isMutating = false;
        upsertUser(state.users, action.payload.user);
        state.success = 'User created successfully';
      })
      .addCase(createManagedUser.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload || 'Unable to create user';
      })
      .addCase(getUserDetails.pending, (state, action) => {
        state.isDetailsLoading = true;
        state.actionUserId = action.meta.arg;
        state.error = '';
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.actionUserId = '';
        state.selectedUser = action.payload.user;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.actionUserId = '';
        state.error = action.payload || 'Unable to load user details';
      })
      .addCase(updateUser.pending, (state, action) => {
        state.isMutating = true;
        state.actionUserId = action.meta.arg.userId;
        state.error = '';
        state.success = '';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isMutating = false;
        state.actionUserId = '';
        upsertUser(state.users, action.payload.user);
        state.selectedUser = action.payload.user;
        state.success = 'User updated successfully';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isMutating = false;
        state.actionUserId = '';
        state.error = action.payload || 'Unable to update user';
      })
      .addCase(updateManagedUserStatus.pending, (state, action) => {
        state.actionUserId = action.meta.arg.userId;
        state.error = '';
        state.success = '';
      })
      .addCase(updateManagedUserStatus.fulfilled, (state, action) => {
        state.actionUserId = '';
        upsertUser(state.users, action.payload.user);
        state.success = `User ${action.payload.user.active ? 'activated' : 'deactivated'} successfully`;
      })
      .addCase(updateManagedUserStatus.rejected, (state, action) => {
        state.actionUserId = '';
        state.error = action.payload || 'Unable to update user status';
      })
      .addCase(deleteUser.pending, (state, action) => {
        state.isMutating = true;
        state.actionUserId = action.meta.arg;
        state.error = '';
        state.success = '';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isMutating = false;
        state.actionUserId = '';
        state.users = state.users.filter((user) => user._id !== action.payload.user._id);
        state.selectedUser = null;
        state.success = 'User deleted successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isMutating = false;
        state.actionUserId = '';
        state.error = action.payload || 'Unable to delete user';
      })
      .addCase(resetUserPassword.pending, (state, action) => {
        state.isMutating = true;
        state.actionUserId = action.meta.arg.userId;
        state.error = '';
        state.success = '';
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.isMutating = false;
        state.actionUserId = '';
        state.success = 'Password reset successfully';
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isMutating = false;
        state.actionUserId = '';
        state.error = action.payload || 'Unable to reset password';
      });
  }
});

export const { clearSelectedUser, clearUserMessages } = userManagementSlice.actions;
export default userManagementSlice.reducer;
