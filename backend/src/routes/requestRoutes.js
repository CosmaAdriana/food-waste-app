import express from 'express';
import {
  approveRequest,
  rejectRequest,
  getReceivedRequests
} from '../controllers/requestController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/received', getReceivedRequests);

router.patch('/:id/approve', approveRequest);

router.patch('/:id/reject', rejectRequest);

export default router;
