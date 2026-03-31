import { Response } from 'express';
import Cart from '../models/Cart.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// GET /api/cart - Get user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart = await Cart.findOne({ userId: req.user?.id });
    if (!cart) {
      cart = new Cart({ userId: req.user?.id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart - Update cart items
export const updateCart = async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    let cart = await Cart.findOne({ userId: req.user?.id });
    
    if (cart) {
      cart.items = items;
      await cart.save();
    } else {
      cart = new Cart({ userId: req.user?.id, items });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cart - Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.user?.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
