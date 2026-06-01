import { Router } from 'express';
import { verifySecurityQr } from '../controllers/securityQr.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('security'));

router.post('/verify-qr', verifySecurityQr);

export default router;
