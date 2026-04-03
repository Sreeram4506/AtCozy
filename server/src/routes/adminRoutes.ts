import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { upload } from '../middleware/uploadMiddleware.js';

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

    // Sales over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesOverTime = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.productId", 
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
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
      salesOverTime,
      categoryDistribution,
      topSellingProducts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCT MANAGEMENT ---
router.get('/products', async (req, res) => {
  try {
    const { page = '1', limit = '200' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(),
    ]);

    res.json({ products, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', upload.single('image'), async (req: any, res: any) => {
  try {
    const updates = { ...req.body };
    
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

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

router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };
    
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    } else if (!productData.image) {
      productData.image = '/images/placeholder.jpg';
    }

    if (!productData.id) {
      const lastProduct = await Product.findOne().sort({ id: -1 });
      productData.id = lastProduct ? lastProduct.id + 1 : 1;
    }

    // Automatically generate a handle from the name if none exists
    if (!productData.handle) {
      productData.handle = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      // Ensure the generated handle is unique by appending a random suffix if another product has it
      const existingHandle = await Product.findOne({ handle: productData.handle });
      if (existingHandle) {
        productData.handle = `${productData.handle}-${Math.floor(Math.random() * 1000)}`;
      }
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
    const { status, userId, page = '1', limit = '20' } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

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
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Better Auth stores users in its own 'user' collection (lowercase),
    // NOT in the custom User mongoose model. Query it via native mongo driver.
    const db = (await import('mongoose')).default.connection.db;
    if (!db) return res.status(500).json({ error: 'DB not connected' });

    const collection = db.collection('user');
    const [users, total] = await Promise.all([
      collection
        .find({}, { projection: { hashedPassword: 0, password: 0 } })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .toArray(),
      collection.countDocuments(),
    ]);

    // Normalize shape so the frontend AdminCustomers component works
    const normalized = users.map((u: any) => ({
      _id: u._id?.toString() || u.id,
      name: u.name || u.displayName || u.email?.split('@')[0] || 'Unknown',
      email: u.email,
      role: u.role || 'user',
      createdAt: u.createdAt || u.created_at || new Date(),
    }));

    res.json({ users: normalized, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
