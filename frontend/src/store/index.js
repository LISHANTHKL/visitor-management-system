import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import userManagementReducer from './userManagementSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userManagement: userManagementReducer
  }
});
