import { api } from './api.js';

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

