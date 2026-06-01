import { api } from './api.js';

export const getAdminAnalytics = async (filters = {}) => {
  const response = await api.get('/analytics/admin', {
    params: filters
  });
  return response.data.data;
};
