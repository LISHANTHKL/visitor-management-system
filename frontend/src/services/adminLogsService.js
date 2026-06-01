import { api } from './api.js';

export const getAdminLogs = async (filters = {}) => {
  const response = await api.get('/admin/logs', {
    params: filters
  });
  return response.data.data;
};
