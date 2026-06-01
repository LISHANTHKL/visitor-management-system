import { Router } from 'express';
import adminVisitorRequestRoutes from './adminVisitorRequest.routes.js';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import visitorRequestRoutes from './visitorRequest.routes.js';

const router = Router();

router.use('/admin/visitor-requests', adminVisitorRequestRoutes);
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/visitor-requests', visitorRequestRoutes);

export default router;
