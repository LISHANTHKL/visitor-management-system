import { Router } from 'express';
import {
  createVisitorRequest,
  getVisitorRequestById
} from '../controllers/visitorRequest.controller.js';

const router = Router();

router.post('/', createVisitorRequest);
router.get('/:id', getVisitorRequestById);

export default router;

