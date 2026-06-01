import { api } from './api.js';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

