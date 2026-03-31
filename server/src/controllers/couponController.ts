import { Request, Response } from 'express';
import Coupon from '../models/Coupon.js';

// GET /api/coupons/validate/:code - Validate a coupon
export const validateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const code = req.params.code as string;
    const { subtotal } = req.query;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({ message: 'Coupon is not currently valid' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (subtotal && Number(subtotal) < (coupon.minPurchaseAmount || 0)) {
       return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchaseAmount} required` });
    }

    res.json({
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        maxDiscountAmount: coupon.maxDiscountAmount
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN ONLY: Create coupon
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN ONLY: Get all coupons
export const getAllCoupons = async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN ONLY: Delete coupon
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
