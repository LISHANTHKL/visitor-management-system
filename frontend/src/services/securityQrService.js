import { api } from './api.js';

export const verifyQrToken = async (qrToken) => {
  const response = await api.post('/security/verify-qr', { qrToken });
  return response.data.data;
};

export const checkInByQrToken = async (qrToken) => {
  const response = await api.post('/security/check-in', { qrToken });
  return response.data.data;
};

export const checkOutByQrToken = async (qrToken) => {
  const response = await api.post('/security/check-out', { qrToken });
  return response.data.data;
};

export const getSecurityVisitLogs = async (filters = {}) => {
  const response = await api.get('/security/logs', {
    params: filters
  });
  return response.data.data;
};
