let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.emit('connected', { ok: true });
  });
};

export const emitAvailabilityUpdate = (payload) => {
  if (!ioInstance) return;
  ioInstance.emit('employee-status:update', payload);
};

export const emitDashboardUpdate = (payload = {}) => {
  if (!ioInstance) return;
  ioInstance.emit('dashboard:update', payload);
};
