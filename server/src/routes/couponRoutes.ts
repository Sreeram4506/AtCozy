import express from 'express';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';
import { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();

// GET validate coupon
router.get('/validate/:code', validateCoupon);

// ADMIN: Create coupon
router.post('/', authMiddleware, adminMiddleware, createCoupon);

// ADMIN: Get all coupons
router.get('/', authMiddleware, adminMiddleware, getAllCoupons);

// ADMIN: Delete coupon
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);

export default router;
