import { Router } from 'express';
import adminVisitorRequestRoutes from './adminVisitorRequest.routes.js';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import employeeVisitorRequestRoutes from './employeeVisitorRequest.routes.js';
import healthRoutes from './health.routes.js';
import securityQrRoutes from './securityQr.routes.js';
import userRoutes from './user.routes.js';
import visitorRequestRoutes from './visitorRequest.routes.js';

const router = Router();

router.use('/admin/visitor-requests', adminVisitorRequestRoutes);
router.use('/auth', authRoutes);
router.use('/employee/visitor-requests', employeeVisitorRequestRoutes);
router.use('/employees', employeeRoutes);
router.use('/health', healthRoutes);
router.use('/security', securityQrRoutes);
router.use('/users', userRoutes);
router.use('/visitor-requests', visitorRequestRoutes);

export default router;
