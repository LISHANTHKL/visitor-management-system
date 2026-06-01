import { Router } from 'express';
import {
  deleteUser,
  getUserById,
  getUsers,
  resetUserPassword,
  updateUser,
  updateUserStatus
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/reset-password', resetUserPassword);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
