import express from 'express';
import {
  addFriend,
  getFriends,
  deleteFriendship,
  acceptFriendship,
  rejectFriendship,
  getFriendFoods
} from '../controllers/friendController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', addFriend);

router.get('/', getFriends);

router.get('/:friendId/foods', getFriendFoods);

router.patch('/:id/accept', acceptFriendship);

router.patch('/:id/reject', rejectFriendship);

router.delete('/:id', deleteFriendship);

export default router;
