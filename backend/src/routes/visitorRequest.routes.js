import { Router } from 'express';
import {
  createVisitorRequest,
  getAvailableSlots,
  getVisitorPassById,
  getVisitorRequestById
} from '../controllers/visitorRequest.controller.js';

const router = Router();

router.get('/available-slots', getAvailableSlots);
router.get('/:id/pass', getVisitorPassById);
router.post('/', createVisitorRequest);
router.get('/:id', getVisitorRequestById);

export default router;
