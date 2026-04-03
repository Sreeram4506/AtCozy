import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

// POST /api/orders - Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, subtotal, shippingCost, tax, totalPrice, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const newOrder = new Order({
      userId: req.user?.id,
      items,
      subtotal: subtotal || totalPrice,
      shippingCost: shippingCost || 0,
      tax: tax || 0,
      totalPrice,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'pending', // Wait for Stripe confirmation
      status: 'pending',        // Wait for Stripe confirmation
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/my-orders - Get current user's orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/:id - Get single order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Users can only view their own orders
    if (order.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/orders/:id/cancel - Cancel an order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
