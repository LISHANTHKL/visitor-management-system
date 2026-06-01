import dotenv from 'dotenv';

dotenv.config();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor-management',
  corsOrigin,
  frontendUrl: process.env.FRONTEND_URL || corsOrigin,
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || process.env.SMTP_USER || '',
  emailEnabled: process.env.EMAIL_ENABLED !== 'false'
};
