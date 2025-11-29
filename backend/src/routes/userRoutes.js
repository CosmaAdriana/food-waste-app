import express from 'express';
import { getMe } from '../controllers/userController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/me', requireAuth, getMe);

export default router;
