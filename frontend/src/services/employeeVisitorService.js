import { api } from './api.js';

export const getEmployeeVisitorRequests = async ({ date = '', status = '', visitorName = '' } = {}) => {
  const response = await api.get('/employee/visitor-requests', {
    params: {
      date,
      status,
      visitorName
    }
  });
  return response.data.data;
};

export const getTodayEmployeeVisitors = async () => {
  const response = await api.get('/employee/visitor-requests/today');
  return response.data.data;
};

export const getUpcomingEmployeeVisitors = async () => {
  const response = await api.get('/employee/visitor-requests/upcoming');
  return response.data.data;
};
