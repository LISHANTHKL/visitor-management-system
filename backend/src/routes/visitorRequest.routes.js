import { Router } from 'express';
import {
  createVisitorRequest,
  getAvailableSlots,
  getVisitorRequestById
} from '../controllers/visitorRequest.controller.js';

const router = Router();

router.get('/available-slots', getAvailableSlots);
router.post('/', createVisitorRequest);
router.get('/:id', getVisitorRequestById);

export default router;
