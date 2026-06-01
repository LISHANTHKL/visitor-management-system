import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  console.log("MONGO_URI =", env.mongoUri);

  const connection = await mongoose.connect(env.mongoUri);

  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};
