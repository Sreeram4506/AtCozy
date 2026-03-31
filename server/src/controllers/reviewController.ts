import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// GET /api/products/:id/reviews - Get reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id as string);
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products/:id/reviews - Create a review
export const createReview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { rating, comment } = req.body;
    const productIdStr = req.params.id as string;
    const productId = parseInt(productIdStr);

    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // 1. Check if user already reviewed
    const existingReview = await Review.findOne({ productId, userId: req.user?.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // 2. Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 3. Check if user purchased the product (Verified Purchase)
    const order = await Order.findOne({
      userId: req.user?.id,
      'items.productId': productId,
      status: 'delivered'
    });

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newReview = new Review({
      productId,
      userId: req.user?.id,
      userName: user.name || 'Anonymous',
      rating,
      comment,
      isVerifiedPurchase: !!order,
    });

    await newReview.save();

    // 4. Update Product Rating (simplified)
    // In a real app, you might want to aggregate all reviews but for now we'll just track it
    res.status(201).json(newReview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/reviews/:id - Delete a review (Admin or Owner)
export const deleteReview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
