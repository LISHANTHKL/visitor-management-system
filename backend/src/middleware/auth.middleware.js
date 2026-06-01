import { User } from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'User is not authorized'
      });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

