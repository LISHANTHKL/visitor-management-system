import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/admin', getAdminAnalytics);

export default router;
