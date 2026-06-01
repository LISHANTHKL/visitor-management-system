import { api } from './api.js';

export const searchPublicEmployees = async (search = '') => {
  const response = await api.get('/employees/public', {
    params: {
      search
    }
  });
  return response.data.data;
};

export const createVisitorRequest = async (payload) => {
  const response = await api.post('/visitor-requests', payload);
  return response.data.data;
};

export const getVisitorRequestById = async (requestId) => {
  const response = await api.get(`/visitor-requests/${requestId}`);
  return response.data.data;
};

