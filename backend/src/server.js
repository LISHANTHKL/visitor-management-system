import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './services/socket.service.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: env.corsOrigin,
        credentials: true
      }
    });

    initSocket(io);

    httpServer.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
