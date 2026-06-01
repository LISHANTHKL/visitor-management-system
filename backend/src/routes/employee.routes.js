import { Router } from 'express';
import { getPublicEmployees } from '../controllers/employee.controller.js';

const router = Router();

router.get('/public', getPublicEmployees);

export default router;

