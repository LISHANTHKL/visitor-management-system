import { api } from './api.js';

export const createUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

export const getUsers = async ({ search = '', role = '' } = {}) => {
  const response = await api.get('/users', {
    params: {
      search,
      role
    }
  });
  return response.data.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
};

export const updateUserById = async (userId, payload) => {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data.data;
};

export const updateUserStatus = async (userId, active) => {
  const response = await api.patch(`/users/${userId}/status`, { active });
  return response.data.data;
};

export const deleteUserById = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data.data;
};

export const resetPasswordById = async (userId, password) => {
  const response = await api.put(`/users/${userId}/reset-password`, { password });
  return response.data;
};
