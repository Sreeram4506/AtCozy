import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.use(authMiddleware);

// GET user's cart
router.get('/', getCart);

// POST update cart items
router.post('/', updateCart);

// DELETE clear cart
router.delete('/', clearCart);

export default router;
