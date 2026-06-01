import { Router } from 'express';
import { getAdminLogs } from '../controllers/adminLogs.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/', getAdminLogs);

export default router;
