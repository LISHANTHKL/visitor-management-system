import { sendSuccess } from '../utils/apiResponse.js';

export const getHealth = (_req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    service: 'visitor-management-api',
    timestamp: new Date().toISOString()
  });
};
