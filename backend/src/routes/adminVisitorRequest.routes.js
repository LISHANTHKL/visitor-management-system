import { Router } from 'express';
import {
  approveVisitorRequest,
  getAdminVisitorRequestById,
  getAdminVisitorRequests,
  rejectVisitorRequest
} from '../controllers/adminVisitorRequest.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/', getAdminVisitorRequests);
router.get('/:id', getAdminVisitorRequestById);
router.put('/:id/approve', approveVisitorRequest);
router.put('/:id/reject', rejectVisitorRequest);

export default router;
