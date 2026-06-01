import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import employeeVisitorReducer from './employeeVisitorSlice.js';
import userManagementReducer from './userManagementSlice.js';
import visitorApprovalReducer from './visitorApprovalSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employeeVisitor: employeeVisitorReducer,
    userManagement: userManagementReducer,
    visitorApproval: visitorApprovalReducer
  }
});
