import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Stripe } from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Lazy-load Stripe to avoid crashing on startup if key is missing in production.
 */
const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
};

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent for a specific order amount.
 */
export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Stripe expects amounts in cents
    const amountInCents = Math.round(amount * 100);
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        userId: req.user?.id || 'guest',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error('Stripe PaymentIntent Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
