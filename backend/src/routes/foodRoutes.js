import express from 'express';
import {
  createFood,
  getFoods,
  updateFood,
  deleteFood,
  markAvailable,
  getExpiringFoods
} from '../controllers/foodController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();


router.use(requireAuth);

router.get('/expiring', getExpiringFoods);       


router.post('/', createFood);                     
router.get('/', getFoods);                         
router.put('/:id', updateFood);                  
router.delete('/:id', deleteFood);                  
router.patch('/:id/mark-available', markAvailable); 

export default router;
