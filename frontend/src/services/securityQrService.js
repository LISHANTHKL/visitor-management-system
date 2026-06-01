import { api } from './api.js';

export const verifyQrToken = async (qrToken) => {
  const response = await api.post('/security/verify-qr', { qrToken });
  return response.data.data;
};
