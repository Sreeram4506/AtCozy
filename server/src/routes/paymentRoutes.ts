import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createPaymentIntent } from '../controllers/paymentController.js';

const router = express.Router();

// Protected: Creating payment intents requires authentication
router.post('/create-intent', authMiddleware, createPaymentIntent);

export default router;
