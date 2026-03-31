import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// Apply admin protection to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// --- DASHBOARD STATS ---
router.get('/stats', async (_req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCT MANAGEMENT ---
router.get('/products', async (req, res) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [products, total] = await Promise.all([
      Product.find().sort({ id: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(),
    ]);

    res.json({ products, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req: any, res: any) => {
  try {
    const updates = req.body;
    const product = await Product.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      updates,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.id) {
      const lastProduct = await Product.findOne().sort({ id: -1 });
      productData.id = lastProduct ? lastProduct.id + 1 : 1;
    }
    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req: any, res: any) => {
  try {
    const product = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDER MANAGEMENT ---
router.get('/orders', async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id', async (req: any, res: any) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (notes) updates.notes = notes;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER MANAGEMENT ---
router.get('/users', async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [users, total] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(),
    ]);

    res.json({ users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
