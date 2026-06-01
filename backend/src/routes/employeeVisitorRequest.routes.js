import { Router } from 'express';
import {
  getEmployeeVisitorRequests,
  getTodayApprovedVisitors,
  getUpcomingApprovedVisitors
} from '../controllers/employeeVisitorRequest.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('employee'));

router.get('/', getEmployeeVisitorRequests);
router.get('/today', getTodayApprovedVisitors);
router.get('/upcoming', getUpcomingApprovedVisitors);

export default router;
