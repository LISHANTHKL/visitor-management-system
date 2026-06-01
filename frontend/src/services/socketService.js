import { io } from 'socket.io-client';
import { api } from './api.js';

let socket;

const getSocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL || api.defaults.baseURL || 'http://localhost:5000/api';
  return configuredUrl.replace(/\/api\/?$/, '');
};

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling']
    });
  }

  return socket;
};

export const subscribeToEmployeeStatus = (handler) => {
  const activeSocket = getSocket();
  activeSocket.on('employee-status:update', handler);

  return () => {
    activeSocket.off('employee-status:update', handler);
  };
};

export const subscribeToDashboardUpdates = (handler) => {
  const activeSocket = getSocket();
  activeSocket.on('dashboard:update', handler);

  return () => {
    activeSocket.off('dashboard:update', handler);
  };
};
