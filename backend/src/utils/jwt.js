import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

