import { configureStore } from '@reduxjs/toolkit';
import adminLogsReducer from './adminLogsSlice.js';
import analyticsReducer from './analyticsSlice.js';
import authReducer from './authSlice.js';
import availabilityReducer from './availabilitySlice.js';
import employeeVisitorReducer from './employeeVisitorSlice.js';
import securityVisitReducer from './securityVisitSlice.js';
import userManagementReducer from './userManagementSlice.js';
import visitorApprovalReducer from './visitorApprovalSlice.js';

export const store = configureStore({
  reducer: {
    adminLogs: adminLogsReducer,
    analytics: analyticsReducer,
    auth: authReducer,
    availability: availabilityReducer,
    employeeVisitor: employeeVisitorReducer,
    securityVisit: securityVisitReducer,
    userManagement: userManagementReducer,
    visitorApproval: visitorApprovalReducer
  }
});
