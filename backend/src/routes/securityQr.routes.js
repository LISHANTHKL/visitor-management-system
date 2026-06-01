import { Router } from 'express';
import {
  checkInVisitor,
  checkOutVisitor,
  getSecurityVisitLogs,
  verifySecurityQr
} from '../controllers/securityQr.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('security'));

router.post('/verify-qr', verifySecurityQr);
router.post('/check-in', checkInVisitor);
router.post('/check-out', checkOutVisitor);
router.get('/logs', getSecurityVisitLogs);

export default router;
