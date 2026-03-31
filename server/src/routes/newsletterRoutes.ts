import express from 'express';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';
import { subscribeNewsletter, unsubscribeNewsletter, getNewsletterSubscribers } from '../controllers/newsletterController.js';

const router = express.Router();

// Public newsletter subscription
router.post('/subscribe', subscribeNewsletter);

// Public newsletter unsubscription
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin only: Get all newsletter subscribers
router.get('/admin', authMiddleware, adminMiddleware, getNewsletterSubscribers);

export default router;
