import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orderController.js';

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;
