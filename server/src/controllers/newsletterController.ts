import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter.js';

// POST /api/newsletter/subscribe - Subscribe to newsletter
export const subscribeNewsletter = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isSubscribed) {
        return res.status(200).json({ message: 'Email already subscribed' });
      } else {
        existing.isSubscribed = true;
        await existing.save();
        return res.status(200).json({ message: 'Email resubscribed' });
      }
    }

    const newSub = new Newsletter({ email: email.toLowerCase() });
    await newSub.save();
    res.status(201).json({ message: 'Successfully subscribed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
export const unsubscribeNewsletter = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const sub = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!sub) {
      return res.status(404).json({ message: 'Email not found in newsletter list' });
    }

    sub.isSubscribed = false;
    await sub.save();
    res.json({ message: 'Successfully unsubscribed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/newsletter - Get all newsletter subscribers (Admin)
export const getNewsletterSubscribers = async (_req: Request, res: Response) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
