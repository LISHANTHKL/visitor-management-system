import { api } from './api.js';

export const getEmployeeAvailability = async () => {
  const response = await api.get('/availability/employees');
  return response.data.data;
};

export const getMyAvailability = async () => {
  const response = await api.get('/availability/me');
  return response.data.data;
};
