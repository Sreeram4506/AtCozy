import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const products = req.body; // Expect an array of products
    await Product.insertMany(products);
    res.status(201).json({ message: 'Products seeded successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
