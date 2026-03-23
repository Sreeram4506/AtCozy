import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { items, totalPrice } = req.body;
    const newOrder = new Order({ userId: req.user?.id, items, totalPrice });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-orders', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
