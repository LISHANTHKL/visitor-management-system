import { Router } from 'express';
import { getMe, login, logout, register } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { USER_ROLES } from '../models/user.model.js';

const router = Router();

const registerSchema = {
  name: { required: true, minLength: 2 },
  email: { required: true, email: true },
  password: { required: true, minLength: 8 },
  role: { enum: USER_ROLES },
  phone: { phone: true }
};

const loginSchema = {
  email: { required: true, email: true },
  password: { required: true }
};

router.post('/register', protect, authorizeRoles('admin'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;

