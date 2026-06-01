import { api } from './api.js';

export const getAdminVisitorRequests = async ({
  searchVisitor = '',
  searchEmployee = '',
  date = '',
  status = ''
} = {}) => {
  const response = await api.get('/admin/visitor-requests', {
    params: {
      searchVisitor,
      searchEmployee,
      date,
      status
    }
  });
  return response.data.data;
};

export const getAdminVisitorRequestById = async (requestId) => {
  const response = await api.get(`/admin/visitor-requests/${requestId}`);
  return response.data.data;
};

export const approveAdminVisitorRequest = async (requestId) => {
  const response = await api.put(`/admin/visitor-requests/${requestId}/approve`);
  return response.data.data;
};

export const rejectAdminVisitorRequest = async (requestId, reason) => {
  const response = await api.put(`/admin/visitor-requests/${requestId}/reject`, { reason });
  return response.data.data;
};
