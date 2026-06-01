import { Router } from 'express';
import { getEmployeeStatuses, getMyEmployeeStatus } from '../controllers/availability.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);

router.get('/employees', authorizeRoles('admin', 'security'), getEmployeeStatuses);
router.get('/me', authorizeRoles('employee'), getMyEmployeeStatus);

export default router;
