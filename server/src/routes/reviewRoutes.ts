import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getProductReviews, createReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

// GET reviews for a product
router.get('/products/:id/reviews', getProductReviews);

// POST create a review for a product (Protected)
router.post('/products/:id/reviews', authMiddleware, createReview);

// DELETE own/admin review (Protected)
router.delete('/reviews/:id', authMiddleware, deleteReview);

export default router;
