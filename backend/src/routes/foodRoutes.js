import express from 'express';
import {
  createFood,
  getFoods,
  updateFood,
  deleteFood,
  markAvailable,
  getExpiringFoods,
  claimFood,
  getMyClaims
} from '../controllers/foodController.js';
import { getFoodRequests } from '../controllers/requestController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();


router.use(requireAuth);

router.get('/expiring', getExpiringFoods);
router.get('/my-claims', getMyClaims);

router.post('/', createFood);
router.get('/', getFoods);
router.get('/:id/requests', getFoodRequests);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);
router.patch('/:id/mark-available', markAvailable);
router.post('/:id/claim', claimFood); 

export default router;
