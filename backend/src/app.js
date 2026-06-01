import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Render is using latest code'
  });
});
app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

